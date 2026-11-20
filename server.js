// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

// api/payment/create-transaction.ts
var MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
var IS_PROD_ENV = process.env.VITE_MIDTRANS_IS_PRODUCTION;
var IS_PRODUCTION = IS_PROD_ENV === "true" || MIDTRANS_SERVER_KEY.startsWith("Mid-server-") && !MIDTRANS_SERVER_KEY.startsWith("SB-Mid-server-");
var SNAP_API_ENDPOINT = IS_PRODUCTION ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
async function handleCreateTransaction(req, res) {
  try {
    const { orderId, grossAmount, clientName, clientEmail, clientPhone, templateTitle } = req.body;
    if (!orderId || !grossAmount) {
      res.status(400).json({ error: "orderId dan grossAmount wajib diisi." });
      return;
    }
    if (!MIDTRANS_SERVER_KEY) {
      res.status(500).json({
        error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di file .env server."
      });
      return;
    }
    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64")}`;
    const payload = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: Math.round(Number(grossAmount))
      },
      customer_details: {
        first_name: String(clientName || "Calon Pengantin").slice(0, 50),
        email: clientEmail ? String(clientEmail) : void 0,
        phone: clientPhone ? String(clientPhone) : void 0
      },
      item_details: [
        {
          id: String(orderId).slice(0, 50),
          price: Math.round(Number(grossAmount)),
          quantity: 1,
          name: String(templateTitle || "Undangan Digital Sekarsiti").slice(0, 50),
          brand: "Sekarsiti",
          category: "Digital Invitation"
        }
      ],
      usage_limit: 1
    };
    const response = await fetch(SNAP_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("[Midtrans Snap API Error]:", data);
      res.status(response.status).json({
        error: data.error_messages?.join(", ") || "Gagal menghubungi server Midtrans.",
        details: data
      });
      return;
    }
    res.status(200).json({
      token: data.token,
      redirect_url: data.redirect_url
    });
  } catch (err) {
    console.error("[CreateTransaction Exception]:", err);
    res.status(500).json({ error: err.message || "Terjadi kesalahan sistem internal." });
  }
}

// api/payment/midtrans-webhook.ts
import crypto from "crypto";
var MIDTRANS_SERVER_KEY2 = process.env.MIDTRANS_SERVER_KEY || "";
async function handleMidtransWebhook(req, res) {
  try {
    const notification = req.body;
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status
    } = notification;
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      res.status(400).json({ error: "Payload webhook tidak lengkap." });
      return;
    }
    if (MIDTRANS_SERVER_KEY2) {
      const rawSignature = `${order_id}${status_code}${gross_amount}${MIDTRANS_SERVER_KEY2}`;
      const expectedSignature = crypto.createHash("sha512").update(rawSignature).digest("hex");
      if (signature_key !== expectedSignature) {
        console.warn("[Midtrans Webhook] Invalid signature from IP:", req.ip);
        res.status(403).json({ error: "Signature key tidak valid." });
        return;
      }
    }
    console.log(
      `[Midtrans Webhook] Order: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`
    );
    const isPaid = transaction_status === "settlement" || transaction_status === "capture" && fraud_status === "accept";
    if (isPaid) {
      console.log(`[Midtrans Webhook] Order ${order_id} BERHASIL DIBAYAR! Mengaktifkan undangan...`);
    }
    res.status(200).json({ status: "OK", received: true });
  } catch (err) {
    console.error("[Midtrans Webhook Exception]:", err);
    res.status(500).json({ error: err.message || "Gagal memproses notifikasi webhook." });
  }
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (Number.isInteger(trustProxyHops) && trustProxyHops > 0) {
    app.set("trust proxy", trustProxyHops);
  }
  app.use(express.json({ limit: "1mb" }));
  const limits = {
    login: rateLimit({
      windowMs: 15 * 60 * 1e3,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => ipKeyGenerator(req.ip || "unknown"),
      message: { error: "Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit." }
    }),
    guestbook: rateLimit({
      windowMs: 60 * 60 * 1e3,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip || "unknown")}:${String(req.body?.scope || "").slice(0, 100)}`,
      message: { error: "Terlalu banyak kiriman ucapan untuk undangan ini. Coba lagi dalam satu jam." }
    }),
    rsvp: rateLimit({
      windowMs: 60 * 60 * 1e3,
      limit: 10,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip || "unknown")}:${String(req.body?.scope || "").slice(0, 100)}`,
      message: { error: "Terlalu banyak perubahan reservasi untuk undangan ini. Coba lagi dalam satu jam." }
    })
  };
  app.post(["/api/security/rate-limit", "/api/security/rate-limit/:action"], (req, res, next) => {
    const action = req.params.action || req.query.action;
    const limiter = limits[action];
    if (!limiter) {
      res.status(404).json({ error: "Jenis permintaan tidak dikenal." });
      return;
    }
    limiter(req, res, next);
  }, (_req, res) => {
    res.status(204).end();
  });
  app.post("/api/payment/create-transaction", handleCreateTransaction);
  app.post("/api/payment/midtrans-webhook", handleMidtransWebhook);
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer();
