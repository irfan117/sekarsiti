import type { Request, Response } from 'express';
import {
  verifyMidtransSignature,
  executePaymentTransition,
} from '../../src/services/paymentProcessor';

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
      payment_type,
      transaction_time,
    } = notification;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      res.status(400).json({ error: 'Payload webhook tidak lengkap.' });
      return;
    }

    if (!MIDTRANS_SERVER_KEY) {
      res.status(500).json({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi di file .env server.' });
      return;
    }

    // 1. Verifikasi Keaslian Notifikasi via SHA-512 Signature
    const isValidSignature = await verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      MIDTRANS_SERVER_KEY,
      signature_key
    );

    if (!isValidSignature) {
      console.warn('[Midtrans Webhook Node] Invalid signature from IP:', req.ip);
      res.status(403).json({ error: 'Signature key tidak valid.' });
      return;
    }

    console.log(
      `[Midtrans Webhook Node] Valid Signature | Order: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`
    );

    // 2. Eksekusi transisi status & pembaruan database terpadu
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    const transitionResult = await executePaymentTransition({
      orderId: order_id,
      transactionStatus: transaction_status,
      fraudStatus: fraud_status,
      grossAmount: gross_amount,
      paymentType: payment_type,
      transactionTime: transaction_time,
      supabaseUrl,
      supabaseKey,
    });

    if (!transitionResult.success) {
      console.error('[Midtrans Webhook Node] Transisi gagal:', transitionResult);
      const httpCode = transitionResult.code === 'ORDER_NOT_FOUND' ? 404 : 400;
      res.status(httpCode).json({ error: transitionResult.message });
      return;
    }

    res.status(200).json({
      status: 'OK',
      received: true,
      orderId: transitionResult.orderId,
      paymentStatus: transitionResult.paymentStatus,
      invitationStatus: transitionResult.invitationStatus,
    });
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
