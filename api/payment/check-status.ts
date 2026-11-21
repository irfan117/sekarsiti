import type { Request, Response } from 'express';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PROD_ENV = process.env.VITE_MIDTRANS_IS_PRODUCTION;
const IS_PRODUCTION =
  IS_PROD_ENV === 'true' ||
  (MIDTRANS_SERVER_KEY.startsWith('Mid-server-') && !MIDTRANS_SERVER_KEY.startsWith('SB-Mid-server-'));

export async function handleCheckStatus(req: Request, res: Response) {
  try {
    const orderId = String(req.query.orderId || req.body?.orderId || '');

    if (!orderId) {
      res.status(400).json({ error: 'Parameter orderId wajib disertakan.' });
      return;
    }

    if (!MIDTRANS_SERVER_KEY) {
      res.status(500).json({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi.' });
      return;
    }

    const statusEndpoint = IS_PRODUCTION
      ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`;

    const response = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: authHeader,
      },
    });

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      res.status(response.status).json({
        error: data.status_message || 'Gagal mengecek status pembayaran di Midtrans.',
        details: data,
      });
      return;
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    const isPaid =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');

    if (isPaid) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        try {
          const patchUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}`;
          await fetch(patchUrl, {
            method: 'PATCH',
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal',
            },
            body: JSON.stringify({
              status: 'published',
              payment_status: 'settlement',
              updated_at: new Date().toISOString(),
            }),
          });
        } catch (dbErr) {
          console.error('[CheckStatus Server] Gagal sinkronisasi ke Supabase:', dbErr);
        }
      }
    }

    res.status(200).json({
      orderId,
      isPaid,
      transactionStatus,
      fraudStatus,
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
