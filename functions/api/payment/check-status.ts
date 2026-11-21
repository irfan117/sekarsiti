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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId');

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

    const isProd =
      env.VITE_MIDTRANS_IS_PRODUCTION === 'true' ||
      (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-Mid-server-'));

    const statusEndpoint = isProd
      ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    const authHeader = `Basic ${btoa(`${serverKey}:`)}`;

    const response = await fetch(statusEndpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: authHeader,
      },
    });

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          error: data.status_message || 'Gagal mengecek status pembayaran di Midtrans.',
          details: data,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    const isPaid =
      transactionStatus === 'settlement' ||
      (transactionStatus === 'capture' && fraudStatus === 'accept');

    if (isPaid) {
      const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
      const supabaseKey =
        env.SUPABASE_SERVICE_ROLE_KEY ||
        env.SUPABASE_ANON_KEY ||
        env.VITE_SUPABASE_ANON_KEY;

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
          console.error('[CheckStatus Edge] Gagal sinkronisasi ke Supabase:', dbErr);
        }
      }
    }

    return new Response(
      JSON.stringify({
        orderId,
        isPaid,
        transactionStatus,
        fraudStatus,
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

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
