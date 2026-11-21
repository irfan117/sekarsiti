import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { handleCreateTransaction } from './api/payment/create-transaction';
import { handleMidtransWebhook } from './api/payment/midtrans-webhook';
import { handleCheckStatus } from './api/payment/check-status';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Set TRUST_PROXY_HOPS only when the app is behind a known reverse proxy.
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
    app.set('trust proxy', trustProxyHops);
  }

  app.use(express.json({ limit: '1mb' }));

  const limits = {
    login: rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
      message: { error: 'Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.' },
    }),
    guestbook: rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip || 'unknown')}:${String(req.body?.scope || '').slice(0, 100)}`,
      message: { error: 'Terlalu banyak kiriman ucapan untuk undangan ini. Coba lagi dalam satu jam.' },
    }),
    rsvp: rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip || 'unknown')}:${String(req.body?.scope || '').slice(0, 100)}`,
      message: { error: 'Terlalu banyak perubahan reservasi untuk undangan ini. Coba lagi dalam satu jam.' },
    }),
    paymentCheck: rateLimit({
      windowMs: 60 * 1000,
      limit: 15,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip || 'unknown')}:${String(req.query?.orderId || req.body?.orderId || '')}`,
      message: { error: 'Terlalu banyak permintaan cek status. Silakan tunggu 1 menit sebelum mencoba kembali.' },
    }),
  };

  app.post(['/api/security/rate-limit', '/api/security/rate-limit/:action'], (req, res, next) => {
    const action = (req.params.action || req.query.action) as keyof typeof limits;
    const limiter = limits[action];
    if (!limiter) {
      res.status(404).json({ error: 'Jenis permintaan tidak dikenal.' });
      return;
    }
    limiter(req, res, next);
  }, (_req, res) => {
    res.status(204).end();
  });

  // Midtrans Payment Gateway Endpoints
  app.post('/api/payment/create-transaction', handleCreateTransaction);
  app.post('/api/payment/midtrans-webhook', handleMidtransWebhook);
  app.get('/api/payment/check-status', limits.paymentCheck, handleCheckStatus);
  app.post('/api/payment/check-status', limits.paymentCheck, handleCheckStatus);

  // Setup Vite dev server in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
