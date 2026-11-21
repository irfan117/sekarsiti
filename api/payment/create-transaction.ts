import type { Request, Response } from 'express';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const IS_PROD_ENV = process.env.VITE_MIDTRANS_IS_PRODUCTION;
const IS_PRODUCTION =
  IS_PROD_ENV === 'true' ||
  (MIDTRANS_SERVER_KEY.startsWith('Mid-server-') && !MIDTRANS_SERVER_KEY.startsWith('SB-Mid-server-'));

const SNAP_API_ENDPOINT = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function handleCreateTransaction(req: Request, res: Response) {
  try {
    const { orderId, grossAmount, clientName, clientEmail, clientPhone, templateTitle } = req.body;

    if (!orderId || !grossAmount) {
      res.status(400).json({ error: 'orderId dan grossAmount wajib diisi.' });
      return;
    }

    if (!MIDTRANS_SERVER_KEY) {
      res.status(500).json({
        error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi di file .env server.',
      });
      return;
    }

    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`;

    const rawAmount = Math.round(Number(grossAmount || 49000));
    // Proteksi anti-manipulasi harga client-side: Seri Standar minimal Rp49.000
    const finalAmount = rawAmount < 49000 ? 49000 : rawAmount;

    const payload = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: finalAmount,
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

    const response = await fetch(SNAP_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Midtrans Snap API Error]:', data);
      res.status(response.status).json({
        error: data.error_messages?.join(', ') || 'Gagal menghubungi server Midtrans.',
        details: data,
      });
      return;
    }

    res.status(200).json({
      token: data.token,
      redirect_url: data.redirect_url,
    });
  } catch (err: any) {
    console.error('[CreateTransaction Exception]:', err);
    res.status(500).json({ error: err.message || 'Terjadi kesalahan sistem internal.' });
  }
}

// Default export for Vercel Serverless Function
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  return handleCreateTransaction(req, res);
}
