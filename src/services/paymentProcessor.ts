import { resolvePackagePrice, PackagePricingItem } from './paymentConfig';

export interface PaymentTransitionParams {
  orderId: string;
  transactionStatus: string;
  fraudStatus?: string;
  grossAmount?: string | number;
  paymentType?: string;
  transactionTime?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface PaymentTransitionResult {
  success: boolean;
  code: string;
  message: string;
  orderId: string;
  paymentStatus: 'unpaid' | 'pending' | 'settlement' | 'expired' | 'failed';
  invitationStatus: 'pending' | 'published';
  isPaid: boolean;
}

/**
 * Validasi signature SHA-512 Midtrans menggunakan Web Crypto API (didukung di Node 18+ & Cloudflare)
 */
export async function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string | number,
  serverKey: string,
  signatureKey: string
): Promise<boolean> {
  if (!orderId || !statusCode || !grossAmount || !serverKey || !signatureKey) {
    return false;
  }

  // Format string signature sesuai standar Midtrans: order_id + status_code + gross_amount + ServerKey
  const rawSignature = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(rawSignature);
  
  // Support crypto.subtle (Edge/Node 18+)
  let hashHex = '';
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback Node.js crypto module
    const nodeCrypto = await import('crypto');
    hashHex = nodeCrypto.createHash('sha512').update(rawSignature).digest('hex');
  }

  return hashHex.toLowerCase() === String(signatureKey).toLowerCase().trim();
}

/**
 * Eksekusi transisi status pembayaran dan pembaruan database secara aman dan idempotent
 */
export async function executePaymentTransition(
  params: PaymentTransitionParams
): Promise<PaymentTransitionResult> {
  const {
    orderId,
    transactionStatus,
    fraudStatus,
    grossAmount,
    paymentType,
    transactionTime,
    supabaseUrl,
    supabaseKey,
  } = params;

  if (!orderId) {
    return {
      success: false,
      code: 'MISSING_ORDER_ID',
      message: 'orderId wajib disertakan.',
      orderId: '',
      paymentStatus: 'unpaid',
      invitationStatus: 'pending',
      isPaid: false,
    };
  }

  // Petakan status transaksi Midtrans ke status aplikasi
  let mappedPaymentStatus: 'unpaid' | 'pending' | 'settlement' | 'expired' | 'failed' = 'pending';
  let isSettlement = false;

  const cleanStatus = (transactionStatus || '').toLowerCase();
  const cleanFraud = (fraudStatus || '').toLowerCase();

  if (cleanStatus === 'settlement' || (cleanStatus === 'capture' && cleanFraud === 'accept')) {
    mappedPaymentStatus = 'settlement';
    isSettlement = true;
  } else if (cleanStatus === 'pending') {
    mappedPaymentStatus = 'pending';
  } else if (cleanStatus === 'expire') {
    mappedPaymentStatus = 'expired';
  } else if (cleanStatus === 'cancel' || cleanStatus === 'deny') {
    mappedPaymentStatus = 'failed';
  }

  // 1. Ambil data pesanan dari Supabase untuk verifikasi internal
  let internalOrder: any = null;
  if (supabaseUrl && supabaseKey) {
    try {
      const getUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}&select=*`;
      const res = await fetch(getUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          internalOrder = list[0];
        }
      }
    } catch (err) {
      console.warn('[PaymentProcessor] Gagal memuat pesanan dari Supabase:', err);
    }
  }

  // Jika pesanan tidak ditemukan di database internal
  if (!internalOrder && supabaseUrl && supabaseKey) {
    return {
      success: false,
      code: 'ORDER_NOT_FOUND',
      message: `Pesanan dengan ID "${orderId}" tidak terdaftar di database internal.`,
      orderId,
      paymentStatus: mappedPaymentStatus,
      invitationStatus: 'pending',
      isPaid: false,
    };
  }

  // 2. Validasi kecocokan nominal pembayaran (Anti-Tampering)
  if (internalOrder && grossAmount) {
    const templateId = internalOrder.template_id || 'standar-royal-classic';
    const pkg = resolvePackagePrice(templateId);
    if (pkg) {
      const expectedAmount = pkg.officialPrice;
      const receivedAmount = Math.round(Number(grossAmount));

      // Jika nominal yang dibayar ke Midtrans lebih rendah dari harga resmi paket
      if (receivedAmount < expectedAmount) {
        console.error(
          `[PaymentProcessor Tampering Blocked] Order: ${orderId} | Nominal tidak cocok! Ekspektasi: ${expectedAmount}, Diterima: ${receivedAmount}`
        );
        return {
          success: false,
          code: 'AMOUNT_MISMATCH',
          message: `Nominal transaksi (${receivedAmount}) tidak sesuai dengan harga resmi paket (${expectedAmount}).`,
          orderId,
          paymentStatus: 'failed',
          invitationStatus: 'pending',
          isPaid: false,
        };
      }
    }
  }

  // 3. Aturan Transisi Status (State Machine Protection)
  const currentInvStatus = internalOrder?.status || 'pending';
  // Cek apakah order sudah pernah settlement sebelumnya
  const wasAlreadySettled =
    currentInvStatus === 'published' ||
    internalOrder?.payment_status === 'settlement' ||
    internalOrder?.media_slots?.__payment?.payment_status === 'settlement';

  // Jika pesanan sudah settlement, jangan izinkan status diturunkan kembali ke pending/expired/failed
  if (wasAlreadySettled && !isSettlement) {
    console.log(
      `[PaymentProcessor Idempotent] Order: ${orderId} sudah settlement. Mengabaikan event penurunan status: ${mappedPaymentStatus}`
    );
    return {
      success: true,
      code: 'ALREADY_SETTLED_IGNORED',
      message: 'Pesanan telah lunas sebelumnya. Event non-settlement diabaikan.',
      orderId,
      paymentStatus: 'settlement',
      invitationStatus: 'published',
      isPaid: true,
    };
  }

  const finalInvStatus = isSettlement ? 'published' : currentInvStatus;

  // 4. Update ke Database Supabase
  if (supabaseUrl && supabaseKey) {
    const patchPayload: Record<string, any> = {
      status: finalInvStatus,
      updated_at: new Date().toISOString(),
    };

    // Siapkan payment metadata untuk disimpan aman di media_slots.__payment
    const existingMediaSlots = internalOrder?.media_slots || {};
    patchPayload.media_slots = {
      ...existingMediaSlots,
      __payment: {
        payment_status: mappedPaymentStatus,
        is_paid: isSettlement,
        gross_amount: grossAmount,
        payment_type: paymentType,
        transaction_time: transactionTime,
        updated_at: new Date().toISOString(),
      },
    };

    // Coba sertakan payment_status langsung jika kolom sudah ada di Supabase
    const fullPayload = {
      ...patchPayload,
      payment_status: mappedPaymentStatus,
    };

    try {
      const patchUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}`;
      let patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(fullPayload),
      });

      // Jika gagal karena kolom payment_status belum ada di schema cache Supabase (PGRST204)
      if (!patchRes.ok && patchRes.status === 400) {
        console.warn(
          '[PaymentProcessor] Kolom payment_status belum ada di DB. Menggunakan fallback media_slots.__payment...'
        );
        patchRes = await fetch(patchUrl, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(patchPayload),
        });
      }

      if (!patchRes.ok) {
        const errText = await patchRes.text();
        console.error('[PaymentProcessor] Gagal PATCH ke Supabase:', patchRes.status, errText);
      } else {
        console.log(`[PaymentProcessor] Sukses update Supabase order: ${orderId} -> ${finalInvStatus}`);
      }
    } catch (dbErr) {
      console.error('[PaymentProcessor] Exception saat menghubungi Supabase:', dbErr);
    }
  }

  return {
    success: true,
    code: isSettlement ? 'SETTLED' : 'STATUS_UPDATED',
    message: isSettlement
      ? 'Pembayaran berhasil terverifikasi. Undangan resmi aktif.'
      : `Status transaksi diperbarui menjadi ${mappedPaymentStatus}.`,
    orderId,
    paymentStatus: mappedPaymentStatus,
    invitationStatus: finalInvStatus,
    isPaid: isSettlement,
  };
}
