/**
 * Midtrans Payment Gateway Integration Service
 * Supports Production Snap & Sandbox Snap dynamically.
 */

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: any) => void;
          onPending?: (result: any) => void;
          onError?: (result: any) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

const CLIENT_KEY = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
const IS_PROD_ENV = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION;
const IS_PRODUCTION =
  IS_PROD_ENV === 'true' ||
  IS_PROD_ENV === true ||
  (CLIENT_KEY.startsWith('Mid-client-') && !CLIENT_KEY.startsWith('SB-Mid-client-'));

export function isMidtransConfigured(): boolean {
  return Boolean(CLIENT_KEY && CLIENT_KEY.trim() !== '');
}

const SNAP_SCRIPT_URL = IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js';

let snapLoadedPromise: Promise<boolean> | null = null;

export function loadSnapScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.snap) return Promise.resolve(true);
  if (snapLoadedPromise) return snapLoadedPromise;

  snapLoadedPromise = new Promise((resolve) => {
    const existingScript = document.getElementById('midtrans-snap-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'midtrans-snap-script';
    script.src = SNAP_SCRIPT_URL;
    if (CLIENT_KEY) {
      script.setAttribute('data-client-key', CLIENT_KEY);
    }
    script.onload = () => resolve(true);
    script.onerror = (err) => {
      console.error('[Midtrans] Failed to load Snap script from:', SNAP_SCRIPT_URL, err);
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return snapLoadedPromise;
}

export interface MidtransTransactionParams {
  orderId: string;
  grossAmount: number;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  templateTitle: string;
}

export interface MidtransPaymentCallbacks {
  onSuccess: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

export async function requestSnapToken(params: MidtransTransactionParams): Promise<string> {
  const response = await fetch('/api/payment/create-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal memproses tiket pembayaran Midtrans.');
  }

  const data = await response.json();
  if (!data.token) {
    throw new Error('Tiket pembayaran Midtrans tidak valid.');
  }

  return data.token;
}

export async function triggerMidtransCheckout(
  params: MidtransTransactionParams,
  callbacks: MidtransPaymentCallbacks
): Promise<void> {
  const isLoaded = await loadSnapScript();
  if (!isLoaded || !window.snap) {
    throw new Error(
      'Midtrans Snap gagal dimuat. Pastikan koneksi internet aktif dan Client Key telah terpasang.'
    );
  }

  const token = await requestSnapToken(params);

  window.snap.pay(token, {
    onSuccess: (result) => {
      console.log('[Midtrans Payment Success]:', result);
      callbacks.onSuccess(result);
    },
    onPending: (result) => {
      console.log('[Midtrans Payment Pending]:', result);
      if (callbacks.onPending) callbacks.onPending(result);
    },
    onError: (result) => {
      console.error('[Midtrans Payment Error]:', result);
      if (callbacks.onError) callbacks.onError(result);
    },
    onClose: () => {
      console.log('[Midtrans Payment Closed]');
      if (callbacks.onClose) callbacks.onClose();
    },
  });
}

/**
 * Cek status pembayaran terkini langsung ke server Midtrans (reconciliation fallback)
 */
export async function checkMidtransStatus(
  orderId: string
): Promise<{ isPaid: boolean; transactionStatus: string; error?: string }> {
  try {
    const response = await fetch(`/api/payment/check-status?orderId=${encodeURIComponent(orderId)}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return { isPaid: false, transactionStatus: 'unknown', error: errData.error || 'Gagal memeriksa status' };
    }
    const data = await response.json();
    return {
      isPaid: Boolean(data.isPaid),
      transactionStatus: data.transactionStatus || 'unknown',
    };
  } catch (err: any) {
    return { isPaid: false, transactionStatus: 'unknown', error: err.message };
  }
}
