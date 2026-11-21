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
    const rawAmount = Math.round(Number(grossAmount || 49e3));
    const finalAmount = rawAmount < 49e3 ? 49e3 : rawAmount;
    const payload = {
      transaction_details: {
        order_id: String(orderId),
        gross_amount: finalAmount
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
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    let patchData = null;
    if (transaction_status === "settlement" || transaction_status === "capture" && fraud_status === "accept") {
      console.log(`[Midtrans Webhook] Order ${order_id} BERHASIL DIBAYAR! Mengaktifkan status published...`);
      patchData = {
        status: "published",
        payment_status: "settlement",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    } else if (transaction_status === "pending") {
      patchData = {
        payment_status: "pending",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    } else if (transaction_status === "expire") {
      patchData = {
        payment_status: "expired",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    } else if (transaction_status === "cancel" || transaction_status === "deny") {
      patchData = {
        payment_status: "failed",
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    if (patchData && supabaseUrl && supabaseKey) {
      try {
        const patchUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/invitations?id=eq.${encodeURIComponent(order_id)}`;
        const dbResponse = await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify(patchData)
        });
        console.log(`[Midtrans Webhook] Supabase DB patch response code: ${dbResponse.status}`);
      } catch (dbErr) {
        console.error("[Midtrans Webhook] Gagal sinkronisasi status ke Supabase:", dbErr);
      }
    }
    res.status(200).json({ status: "OK", received: true });
  } catch (err) {
    console.error("[Midtrans Webhook Exception]:", err);
    res.status(500).json({ error: err.message || "Gagal memproses notifikasi webhook." });
  }
}

// api/payment/check-status.ts
var MIDTRANS_SERVER_KEY3 = process.env.MIDTRANS_SERVER_KEY || "";
var IS_PROD_ENV2 = process.env.VITE_MIDTRANS_IS_PRODUCTION;
var IS_PRODUCTION2 = IS_PROD_ENV2 === "true" || MIDTRANS_SERVER_KEY3.startsWith("Mid-server-") && !MIDTRANS_SERVER_KEY3.startsWith("SB-Mid-server-");
async function handleCheckStatus(req, res) {
  try {
    const orderId = String(req.query.orderId || req.body?.orderId || "");
    if (!orderId) {
      res.status(400).json({ error: "Parameter orderId wajib disertakan." });
      return;
    }
    if (!MIDTRANS_SERVER_KEY3) {
      res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi." });
      return;
    }
    const statusEndpoint = IS_PRODUCTION2 ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status` : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;
    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY3}:`).toString("base64")}`;
    const response = await fetch(statusEndpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json({
        error: data.status_message || "Gagal mengecek status pembayaran di Midtrans.",
        details: data
      });
      return;
    }
    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    const isPaid = transactionStatus === "settlement" || transactionStatus === "capture" && fraudStatus === "accept";
    if (isPaid) {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          const patchUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}`;
          await fetch(patchUrl, {
            method: "PATCH",
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal"
            },
            body: JSON.stringify({
              status: "published",
              payment_status: "settlement",
              updated_at: (/* @__PURE__ */ new Date()).toISOString()
            })
          });
        } catch (dbErr) {
          console.error("[CheckStatus Server] Gagal sinkronisasi ke Supabase:", dbErr);
        }
      }
    }
    res.status(200).json({
      orderId,
      isPaid,
      transactionStatus,
      fraudStatus,
      paymentType: data.payment_type,
      settlementTime: data.settlement_time
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Terjadi kesalahan internal." });
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
  app.get("/api/payment/check-status", handleCheckStatus);
  app.post("/api/payment/check-status", handleCheckStatus);
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
