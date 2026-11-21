import type { Request, Response } from 'express';
import { executePaymentTransition } from '../../src/services/paymentProcessor';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PROD_ENV = process.env.VITE_MIDTRANS_IS_PRODUCTION;
const IS_PRODUCTION =
  IS_PROD_ENV === 'true' ||
  (MIDTRANS_SERVER_KEY.startsWith('Mid-server-') && !MIDTRANS_SERVER_KEY.startsWith('SB-Mid-server-'));

export async function handleCheckStatus(req: Request, res: Response) {
  try {
    const orderId = String(req.query.orderId || req.body?.orderId || '');
    const userEmail = String(
      req.query.userEmail || req.body?.userEmail || req.headers['x-user-email'] || ''
    ).trim().toLowerCase();

    if (!orderId) {
      res.status(400).json({ error: 'Parameter orderId wajib disertakan.' });
      return;
    }

    if (!MIDTRANS_SERVER_KEY) {
      res.status(500).json({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi.' });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    // 1. Validasi Keberadaan Order & Kepemilikan (Anti-IDOR Protection)
    if (supabaseUrl && supabaseKey) {
      try {
        const getUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}&select=id,client_email,status,template_id`;
        const dbRes = await fetch(getUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });
        if (!dbRes.ok) {
          throw new Error('Gagal memeriksa data pesanan internal.');
        }
        const orders = await dbRes.json();
        if (!Array.isArray(orders) || orders.length === 0) {
          res.status(404).json({ error: `Pesanan dengan ID "${orderId}" tidak ditemukan.` });
          return;
        }

        const internalOrder = orders[0];
        const orderEmail = (internalOrder.client_email || '').trim().toLowerCase();

        // Jika ada identitas email pemanggil, pastikan cocok dengan pemilik pesanan
        if (userEmail && orderEmail && userEmail !== orderEmail) {
          console.warn(
            `[CheckStatus IDOR Blocked] Sesi ${userEmail} mencoba memeriksa order milik ${orderEmail}`
          );
          res.status(403).json({
            error: 'Akses Ditolak: Anda tidak memiliki wewenang untuk memeriksa pesanan ini (Perlindungan IDOR).',
          });
          return;
        }
      } catch (err: any) {
        console.error('[CheckStatus Server] Error validasi pesanan internal:', err);
      }
    }

    // 2. Hubungi API Status Midtrans dengan Timeout Handling (8 Detik)
    const statusEndpoint = IS_PRODUCTION
      ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response: globalThis.Response;
    try {
      response = await fetch(statusEndpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: authHeader,
        },
        signal: controller.signal,
      });
    } catch (fetchErr: any) {
      if (fetchErr.name === 'AbortError') {
        res.status(504).json({
          error: 'Koneksi ke Midtrans mengalami batas waktu (timeout). Coba lagi nanti.',
        });
        return;
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      res.status(response.status).json({
        error: data.status_message || 'Transaksi belum ditemukan di Midtrans.',
        details: data,
      });
      return;
    }

    // 3. Eksekusi transisi status menggunakan Payment Engine terpadu
    const transitionResult = await executePaymentTransition({
      orderId,
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      grossAmount: data.gross_amount,
      paymentType: data.payment_type,
      transactionTime: data.transaction_time,
      supabaseUrl,
      supabaseKey,
    });

    res.status(200).json({
      orderId,
      isPaid: transitionResult.isPaid,
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      paymentStatus: transitionResult.paymentStatus,
      invitationStatus: transitionResult.invitationStatus,
      paymentType: data.payment_type,
      settlementTime: data.settlement_time,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Terjadi kesalahan internal.' });
  }
}

export default async function handler(req: any, res: any) {
  return handleCheckStatus(req, res);
}
