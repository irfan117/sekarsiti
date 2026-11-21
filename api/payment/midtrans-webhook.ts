import crypto from 'crypto';
import type { Request, Response } from 'express';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';

export async function handleMidtransWebhook(req: Request, res: Response) {
  try {
    const notification = req.body;
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = notification;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      res.status(400).json({ error: 'Payload webhook tidak lengkap.' });
      return;
    }

    // Verifikasi Keaslian Notifikasi via SHA512 Signature
    if (MIDTRANS_SERVER_KEY) {
      const rawSignature = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY}`;
      const expectedSignature = crypto.createHash('sha512').update(rawSignature).digest('hex');

      if (signature_key !== expectedSignature) {
        console.warn('[Midtrans Webhook] Invalid signature from IP:', req.ip);
        res.status(403).json({ error: 'Signature key tidak valid.' });
        return;
      }
    }

    console.log(
      `[Midtrans Webhook] Order: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`
    );

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    let patchData: { status?: string; payment_status: string; updated_at: string } | null = null;

    if (
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept')
    ) {
      console.log(`[Midtrans Webhook] Order ${order_id} BERHASIL DIBAYAR! Mengaktifkan status published...`);
      patchData = {
        status: 'published',
        payment_status: 'settlement',
        updated_at: new Date().toISOString(),
      };
    } else if (transaction_status === 'pending') {
      patchData = {
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      };
    } else if (transaction_status === 'expire') {
      patchData = {
        payment_status: 'expired',
        updated_at: new Date().toISOString(),
      };
    } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
      patchData = {
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      };
    }

    if (patchData && supabaseUrl && supabaseKey) {
      try {
        const patchUrl = `${supabaseUrl.replace(/\/+$/, '')}/rest/v1/invitations?id=eq.${encodeURIComponent(order_id)}`;
        const dbResponse = await fetch(patchUrl, {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify(patchData),
        });
        console.log(`[Midtrans Webhook] Supabase DB patch response code: ${dbResponse.status}`);
      } catch (dbErr) {
        console.error('[Midtrans Webhook] Gagal sinkronisasi status ke Supabase:', dbErr);
      }
    }

    res.status(200).json({ status: 'OK', received: true });
  } catch (err: any) {
    console.error('[Midtrans Webhook Exception]:', err);
    res.status(500).json({ error: err.message || 'Gagal memproses notifikasi webhook.' });
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  return handleMidtransWebhook(req, res);
}
