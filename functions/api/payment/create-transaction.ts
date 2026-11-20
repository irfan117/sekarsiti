interface Env {
  MIDTRANS_SERVER_KEY?: string;
  VITE_MIDTRANS_IS_PRODUCTION?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const { request, env } = context;
    const body: any = await request.json().catch(() => ({}));
    const { orderId, grossAmount, clientName, clientEmail, clientPhone, templateTitle } = body;

    if (!orderId || !grossAmount) {
      return new Response(JSON.stringify({ error: 'orderId dan grossAmount wajib diisi.' }), {
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
    const isProd =
      env.VITE_MIDTRANS_IS_PRODUCTION === 'true' ||
      (serverKey.startsWith('Mid-server-') && !serverKey.startsWith('SB-Mid-server-'));

    const snapEndpoint = isProd
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

    const authHeader = `Basic ${btoa(`${serverKey}:`)}`;

    const payload = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: Math.round(Number(grossAmount)),
      },
      customer_details: {
        first_name: String(clientName || 'Calon Pengantin').slice(0, 50),
        email: clientEmail ? String(clientEmail) : undefined,
        phone: clientPhone ? String(clientPhone) : undefined,
      },
      item_details: [
        {
          id: String(orderId).slice(0, 50),
          price: Math.round(Number(grossAmount)),
          quantity: 1,
          name: String(templateTitle || 'Undangan Digital Sekarsiti').slice(0, 50),
          brand: 'Sekarsiti',
          category: 'Digital Invitation',
        },
      ],
      usage_limit: 1,
    };

    const response = await fetch(snapEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Midtrans Snap Edge Error]:', data);
      return new Response(
        JSON.stringify({
          error: data.error_messages?.join(', ') || 'Gagal menghubungi server Midtrans.',
          details: data,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({
        token: data.token,
        redirect_url: data.redirect_url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (err: any) {
    console.error('[CreateTransaction Exception]:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Terjadi kesalahan sistem internal.' }),
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
