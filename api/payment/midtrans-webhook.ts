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

    const isPaid =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (isPaid) {
      console.log(`[Midtrans Webhook] Order ${order_id} BERHASIL DIBAYAR! Mengaktifkan undangan...`);
      // Optional: Hubungkan ke Supabase di sini jika SUPABASE_URL aktif
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
