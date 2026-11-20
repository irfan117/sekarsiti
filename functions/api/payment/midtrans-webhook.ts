interface Env {
  MIDTRANS_SERVER_KEY?: string;
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

    // Verify SHA-512 signature using Web Crypto API
    const rawSignature = `${order_id}${status_code}${gross_amount}${serverKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(rawSignature);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const expectedSignature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    if (signature_key !== expectedSignature) {
      console.warn('[Midtrans Webhook Edge] Invalid signature for order:', order_id);
      return new Response(JSON.stringify({ error: 'Signature key tidak valid.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(
      `[Midtrans Webhook Edge] Order: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`
    );

    const isPaid =
      transaction_status === 'settlement' ||
      (transaction_status === 'capture' && fraud_status === 'accept');

    if (isPaid) {
      console.log(`[Midtrans Webhook Edge] Order ${order_id} BERHASIL DIBAYAR!`);
    }

    return new Response(JSON.stringify({ status: 'OK', received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
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
