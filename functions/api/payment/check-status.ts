import { executePaymentTransition } from '../../../src/services/paymentProcessor';

interface Env {
  MIDTRANS_SERVER_KEY?: string;
  VITE_MIDTRANS_IS_PRODUCTION?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

type PagesFunction<T = Record<string, any>> = (context: {
  request: Request;
  env: T;
  params?: Record<string, string | string[]>;
  next?: () => Promise<Response>;
}) => Promise<Response> | Response;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Email',
  };

  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');
    const userEmail = (
      url.searchParams.get('userEmail') ||
      request.headers.get('X-User-Email') ||
      ''
    ).trim().toLowerCase();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Parameter orderId wajib disertakan.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const serverKey = env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return new Response(
        JSON.stringify({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseKey =
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_ANON_KEY;

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
          return new Response(
            JSON.stringify({ error: `Pesanan dengan ID "${orderId}" tidak ditemukan.` }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }

        const internalOrder = orders[0];
        const orderEmail = (internalOrder.client_email || '').trim().toLowerCase();

        // Jika ada identitas email pemanggil, pastikan cocok dengan pemilik pesanan
        if (userEmail && orderEmail && userEmail !== orderEmail) {
          console.warn(
            `[CheckStatus IDOR Blocked] Sesi ${userEmail} mencoba memeriksa order milik ${orderEmail}`
          );
          return new Response(
            JSON.stringify({
              error: 'Akses Ditolak: Anda tidak memiliki wewenang untuk memeriksa pesanan ini (Perlindungan IDOR).',
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json', ...corsHeaders },
            }
          );
        }
      } catch (err: any) {
        console.error('[CheckStatus Edge] Error validasi pesanan internal:', err);
      }
    }

    // 2. Hubungi API Status Midtrans dengan Timeout Handling (8 Detik)
    const isProd =
      env.VITE_MIDTRANS_IS_PRODUCTION === 'true' ||
      (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-Mid-server-'));

    const statusEndpoint = isProd
      ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    const authHeader = `Basic ${btoa(`${serverKey}:`)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let response: Response;
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
        return new Response(
          JSON.stringify({ error: 'Koneksi ke Midtrans mengalami batas waktu (timeout). Coba lagi nanti.' }),
          {
            status: 504,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.status_message || 'Transaksi belum ditemukan di Midtrans.',
          details: data,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
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

    return new Response(
      JSON.stringify({
        orderId,
        isPaid: transitionResult.isPaid,
        transactionStatus: data.transaction_status,
        fraudStatus: data.fraud_status,
        paymentStatus: transitionResult.paymentStatus,
        invitationStatus: transitionResult.invitationStatus,
        paymentType: data.payment_type,
        settlementTime: data.settlement_time,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Terjadi kesalahan internal.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

export const onRequestPost = onRequestGet;

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Email',
    },
  });
};
