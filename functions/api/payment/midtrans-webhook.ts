import {
  verifyMidtransSignature,
  executePaymentTransition,
} from '../../../src/services/paymentProcessor';

interface Env {
  MIDTRANS_SERVER_KEY?: string;
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { request, env } = context;
    const notification: any = await request.json().catch(() => ({}));
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
      return new Response(JSON.stringify({ error: 'Payload webhook tidak lengkap.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const serverKey = env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return new Response(
        JSON.stringify({ error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi di Environment.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 1. Verifikasi Keaslian Notifikasi via SHA-512 Signature
    const isValidSignature = await verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      serverKey,
      signature_key
    );

    if (!isValidSignature) {
      console.warn('[Midtrans Webhook Edge] Invalid signature for order:', order_id);
      return new Response(JSON.stringify({ error: 'Signature key tidak valid.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(
      `[Midtrans Webhook Edge] Valid Signature | Order: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`
    );

    // 2. Eksekusi transisi status & pembaruan database terpadu
    const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
    const supabaseKey =
      env.SUPABASE_SERVICE_ROLE_KEY ||
      env.SUPABASE_ANON_KEY ||
      env.VITE_SUPABASE_ANON_KEY;

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
      console.error('[Midtrans Webhook Edge] Transisi gagal:', transitionResult);
      // Jika order_id tidak terdaftar di internal database atau nominal mismatch
      const httpCode = transitionResult.code === 'ORDER_NOT_FOUND' ? 404 : 400;
      return new Response(JSON.stringify({ error: transitionResult.message }), {
        status: httpCode,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({
        status: 'OK',
        received: true,
        orderId: transitionResult.orderId,
        paymentStatus: transitionResult.paymentStatus,
        invitationStatus: transitionResult.invitationStatus,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error('[Midtrans Webhook Exception]:', err);
    return new Response(JSON.stringify({ error: err.message || 'Gagal memproses webhook.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
