// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

// src/services/paymentConfig.ts
var OFFICIAL_PACKAGES = {
  // Seri Standar (Edisi Sahaja - Rp 49.000)
  "standar-royal-classic": {
    id: "standar-royal-classic",
    title: "Seri Standar - Royal Classic Ivory",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-jurnal-pesisir": {
    id: "standar-jurnal-pesisir",
    title: "Seri Standar - Jurnal Pesisir",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-langit-porselen": {
    id: "standar-langit-porselen",
    title: "Seri Standar - Langit Porselen",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-leclipse-damour": {
    id: "standar-leclipse-damour",
    title: "Seri Standar - L\u2019\xC9clipse d\u2019Amour",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-simpul-sutra": {
    id: "standar-simpul-sutra",
    title: "Seri Standar - Simpul Sutra",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-serenade-camelia": {
    id: "standar-serenade-camelia",
    title: "Seri Standar - Serenade Camelia",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-grand-pelaminan": {
    id: "standar-grand-pelaminan",
    title: "Seri Standar - Grand Pelaminan",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-timeless-botanical": {
    id: "standar-timeless-botanical",
    title: "Seri Standar - Timeless Botanical",
    tier: "standar",
    officialPrice: 49e3
  },
  "standar-kraton-heritage": {
    id: "standar-kraton-heritage",
    title: "Seri Standar - Kraton Heritage",
    tier: "standar",
    officialPrice: 49e3
  },
  // Seri Editorial (Premium Studio)
  "noir-editorial": {
    id: "noir-editorial",
    title: "Seri Editorial - Noir Editorial",
    tier: "premium",
    officialPrice: 89e3
  },
  "ruang-rasa": {
    id: "ruang-rasa",
    title: "Seri Editorial - Ruang Rasa",
    tier: "essential",
    officialPrice: 69e3
  },
  "malam-zamrud": {
    id: "malam-zamrud",
    title: "Seri Editorial - Malam Zamrud",
    tier: "premium",
    officialPrice: 89e3
  },
  "garis-waktu": {
    id: "garis-waktu",
    title: "Seri Editorial - Garis Waktu",
    tier: "essential",
    officialPrice: 79e3
  },
  "kisah-abadi": {
    id: "kisah-abadi",
    title: "Seri Editorial - Kisah Abadi",
    tier: "premium",
    officialPrice: 89e3
  },
  "pendar-senja": {
    id: "pendar-senja",
    title: "Seri Editorial - Pendar Senja",
    tier: "essential",
    officialPrice: 79e3
  },
  "harmoni-alam": {
    id: "harmoni-alam",
    title: "Seri Editorial - Harmoni Alam",
    tier: "essential",
    officialPrice: 69e3
  },
  "klasik-modern": {
    id: "klasik-modern",
    title: "Seri Editorial - Klasik Modern",
    tier: "essential",
    officialPrice: 69e3
  },
  "pesona-batik": {
    id: "pesona-batik",
    title: "Seri Editorial - Pesona Batik",
    tier: "essential",
    officialPrice: 79e3
  },
  "monokrom-anggun": {
    id: "monokrom-anggun",
    title: "Seri Editorial - Monokrom Anggun",
    tier: "essential",
    officialPrice: 79e3
  }
};
function resolvePackagePrice(packageId) {
  if (!packageId) return null;
  const cleanId = String(packageId).trim().toLowerCase();
  if (OFFICIAL_PACKAGES[cleanId]) {
    return OFFICIAL_PACKAGES[cleanId];
  }
  if (cleanId.startsWith("standar-")) {
    return {
      id: cleanId,
      title: `Seri Standar (${cleanId})`,
      tier: "standar",
      officialPrice: 49e3
    };
  }
  return null;
}

// api/payment/create-transaction.ts
var MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
var IS_PROD_ENV = process.env.VITE_MIDTRANS_IS_PRODUCTION;
var IS_PRODUCTION = IS_PROD_ENV === "true" || MIDTRANS_SERVER_KEY.startsWith("Mid-server-") && !MIDTRANS_SERVER_KEY.startsWith("SB-Mid-server-");
var SNAP_API_ENDPOINT = IS_PRODUCTION ? "https://app.midtrans.com/snap/v1/transactions" : "https://app.sandbox.midtrans.com/snap/v1/transactions";
async function handleCreateTransaction(req, res) {
  try {
    const { orderId, packageId, templateId, clientName, clientEmail, clientPhone } = req.body;
    const targetPackageId = packageId || templateId;
    if (!orderId || !targetPackageId) {
      res.status(400).json({ error: "orderId dan packageId wajib diisi." });
      return;
    }
    const pkg = resolvePackagePrice(targetPackageId);
    if (!pkg) {
      res.status(400).json({
        error: `Identitas paket "${targetPackageId}" tidak valid atau tidak terdaftar.`
      });
      return;
    }
    const finalAmount = pkg.officialPrice;
    const templateTitle = pkg.title;
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
        gross_amount: finalAmount
      },
      customer_details: {
        first_name: String(clientName || "Calon Pengantin").slice(0, 50),
        email: clientEmail ? String(clientEmail) : void 0,
        phone: clientPhone ? String(clientPhone) : void 0
      },
      item_details: [
        {
          id: String(pkg.id).slice(0, 50),
          price: finalAmount,
          quantity: 1,
          name: String(templateTitle).slice(0, 50),
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

// src/services/paymentProcessor.ts
async function verifyMidtransSignature(orderId, statusCode, grossAmount, serverKey, signatureKey) {
  if (!orderId || !statusCode || !grossAmount || !serverKey || !signatureKey) {
    return false;
  }
  const rawSignature = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(rawSignature);
  let hashHex = "";
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    const nodeCrypto = await import("crypto");
    hashHex = nodeCrypto.createHash("sha512").update(rawSignature).digest("hex");
  }
  return hashHex.toLowerCase() === String(signatureKey).toLowerCase().trim();
}
async function executePaymentTransition(params) {
  const {
    orderId,
    transactionStatus,
    fraudStatus,
    grossAmount,
    paymentType,
    transactionTime,
    supabaseUrl,
    supabaseKey
  } = params;
  if (!orderId) {
    return {
      success: false,
      code: "MISSING_ORDER_ID",
      message: "orderId wajib disertakan.",
      orderId: "",
      paymentStatus: "unpaid",
      invitationStatus: "pending",
      isPaid: false
    };
  }
  let mappedPaymentStatus = "pending";
  let isSettlement = false;
  const cleanStatus = (transactionStatus || "").toLowerCase();
  const cleanFraud = (fraudStatus || "").toLowerCase();
  if (cleanStatus === "settlement" || cleanStatus === "capture" && cleanFraud === "accept") {
    mappedPaymentStatus = "settlement";
    isSettlement = true;
  } else if (cleanStatus === "pending") {
    mappedPaymentStatus = "pending";
  } else if (cleanStatus === "expire") {
    mappedPaymentStatus = "expired";
  } else if (cleanStatus === "cancel" || cleanStatus === "deny") {
    mappedPaymentStatus = "failed";
  }
  let internalOrder = null;
  if (supabaseUrl && supabaseKey) {
    try {
      const getUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}&select=*`;
      const res = await fetch(getUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          internalOrder = list[0];
        }
      }
    } catch (err) {
      console.warn("[PaymentProcessor] Gagal memuat pesanan dari Supabase:", err);
    }
  }
  if (!internalOrder && supabaseUrl && supabaseKey) {
    return {
      success: false,
      code: "ORDER_NOT_FOUND",
      message: `Pesanan dengan ID "${orderId}" tidak terdaftar di database internal.`,
      orderId,
      paymentStatus: mappedPaymentStatus,
      invitationStatus: "pending",
      isPaid: false
    };
  }
  if (internalOrder && grossAmount) {
    const templateId = internalOrder.template_id || "standar-royal-classic";
    const pkg = resolvePackagePrice(templateId);
    if (pkg) {
      const expectedAmount = pkg.officialPrice;
      const receivedAmount = Math.round(Number(grossAmount));
      if (receivedAmount < expectedAmount) {
        console.error(
          `[PaymentProcessor Tampering Blocked] Order: ${orderId} | Nominal tidak cocok! Ekspektasi: ${expectedAmount}, Diterima: ${receivedAmount}`
        );
        return {
          success: false,
          code: "AMOUNT_MISMATCH",
          message: `Nominal transaksi (${receivedAmount}) tidak sesuai dengan harga resmi paket (${expectedAmount}).`,
          orderId,
          paymentStatus: "failed",
          invitationStatus: "pending",
          isPaid: false
        };
      }
    }
  }
  const currentInvStatus = internalOrder?.status || "pending";
  const wasAlreadySettled = currentInvStatus === "published" || internalOrder?.payment_status === "settlement" || internalOrder?.media_slots?.__payment?.payment_status === "settlement";
  if (wasAlreadySettled && !isSettlement) {
    console.log(
      `[PaymentProcessor Idempotent] Order: ${orderId} sudah settlement. Mengabaikan event penurunan status: ${mappedPaymentStatus}`
    );
    return {
      success: true,
      code: "ALREADY_SETTLED_IGNORED",
      message: "Pesanan telah lunas sebelumnya. Event non-settlement diabaikan.",
      orderId,
      paymentStatus: "settlement",
      invitationStatus: "published",
      isPaid: true
    };
  }
  const finalInvStatus = isSettlement ? "published" : currentInvStatus;
  if (supabaseUrl && supabaseKey) {
    const patchPayload = {
      status: finalInvStatus,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const existingMediaSlots = internalOrder?.media_slots || {};
    patchPayload.media_slots = {
      ...existingMediaSlots,
      __payment: {
        payment_status: mappedPaymentStatus,
        is_paid: isSettlement,
        gross_amount: grossAmount,
        payment_type: paymentType,
        transaction_time: transactionTime,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
    const fullPayload = {
      ...patchPayload,
      payment_status: mappedPaymentStatus
    };
    try {
      const patchUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}`;
      let patchRes = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(fullPayload)
      });
      if (!patchRes.ok && patchRes.status === 400) {
        console.warn(
          "[PaymentProcessor] Kolom payment_status belum ada di DB. Menggunakan fallback media_slots.__payment..."
        );
        patchRes = await fetch(patchUrl, {
          method: "PATCH",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify(patchPayload)
        });
      }
      if (!patchRes.ok) {
        const errText = await patchRes.text();
        console.error("[PaymentProcessor] Gagal PATCH ke Supabase:", patchRes.status, errText);
      } else {
        console.log(`[PaymentProcessor] Sukses update Supabase order: ${orderId} -> ${finalInvStatus}`);
      }
    } catch (dbErr) {
      console.error("[PaymentProcessor] Exception saat menghubungi Supabase:", dbErr);
    }
  }
  return {
    success: true,
    code: isSettlement ? "SETTLED" : "STATUS_UPDATED",
    message: isSettlement ? "Pembayaran berhasil terverifikasi. Undangan resmi aktif." : `Status transaksi diperbarui menjadi ${mappedPaymentStatus}.`,
    orderId,
    paymentStatus: mappedPaymentStatus,
    invitationStatus: finalInvStatus,
    isPaid: isSettlement
  };
}

// api/payment/midtrans-webhook.ts
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
      fraud_status,
      payment_type,
      transaction_time
    } = notification;
    if (!order_id || !status_code || !gross_amount || !signature_key) {
      res.status(400).json({ error: "Payload webhook tidak lengkap." });
      return;
    }
    if (!MIDTRANS_SERVER_KEY2) {
      res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi di file .env server." });
      return;
    }
    const isValidSignature = await verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      MIDTRANS_SERVER_KEY2,
      signature_key
    );
    if (!isValidSignature) {
      console.warn("[Midtrans Webhook Node] Invalid signature from IP:", req.ip);
      res.status(403).json({ error: "Signature key tidak valid." });
      return;
    }
    console.log(
      `[Midtrans Webhook Node] Valid Signature | Order: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`
    );
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    const transitionResult = await executePaymentTransition({
      orderId: order_id,
      transactionStatus: transaction_status,
      fraudStatus: fraud_status,
      grossAmount: gross_amount,
      paymentType: payment_type,
      transactionTime: transaction_time,
      supabaseUrl,
      supabaseKey
    });
    if (!transitionResult.success) {
      console.error("[Midtrans Webhook Node] Transisi gagal:", transitionResult);
      const httpCode = transitionResult.code === "ORDER_NOT_FOUND" ? 404 : 400;
      res.status(httpCode).json({ error: transitionResult.message });
      return;
    }
    res.status(200).json({
      status: "OK",
      received: true,
      orderId: transitionResult.orderId,
      paymentStatus: transitionResult.paymentStatus,
      invitationStatus: transitionResult.invitationStatus
    });
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
    const userEmail = String(
      req.query.userEmail || req.body?.userEmail || req.headers["x-user-email"] || ""
    ).trim().toLowerCase();
    if (!orderId) {
      res.status(400).json({ error: "Parameter orderId wajib disertakan." });
      return;
    }
    if (!MIDTRANS_SERVER_KEY3) {
      res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dikonfigurasi." });
      return;
    }
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const getUrl = `${supabaseUrl.replace(/\/+$/, "")}/rest/v1/invitations?id=eq.${encodeURIComponent(orderId)}&select=id,client_email,status,template_id`;
        const dbRes = await fetch(getUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
          }
        });
        if (!dbRes.ok) {
          throw new Error("Gagal memeriksa data pesanan internal.");
        }
        const orders = await dbRes.json();
        if (!Array.isArray(orders) || orders.length === 0) {
          res.status(404).json({ error: `Pesanan dengan ID "${orderId}" tidak ditemukan.` });
          return;
        }
        const internalOrder = orders[0];
        const orderEmail = (internalOrder.client_email || "").trim().toLowerCase();
        if (userEmail && orderEmail && userEmail !== orderEmail) {
          console.warn(
            `[CheckStatus IDOR Blocked] Sesi ${userEmail} mencoba memeriksa order milik ${orderEmail}`
          );
          res.status(403).json({
            error: "Akses Ditolak: Anda tidak memiliki wewenang untuk memeriksa pesanan ini (Perlindungan IDOR)."
          });
          return;
        }
      } catch (err) {
        console.error("[CheckStatus Server] Error validasi pesanan internal:", err);
      }
    }
    const statusEndpoint = IS_PRODUCTION2 ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status` : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;
    const authHeader = `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY3}:`).toString("base64")}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8e3);
    let response;
    try {
      response = await fetch(statusEndpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authHeader
        },
        signal: controller.signal
      });
    } catch (fetchErr) {
      if (fetchErr.name === "AbortError") {
        res.status(504).json({
          error: "Koneksi ke Midtrans mengalami batas waktu (timeout). Coba lagi nanti."
        });
        return;
      }
      throw fetchErr;
    } finally {
      clearTimeout(timeoutId);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json({
        error: data.status_message || "Transaksi belum ditemukan di Midtrans.",
        details: data
      });
      return;
    }
    const transitionResult = await executePaymentTransition({
      orderId,
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      grossAmount: data.gross_amount,
      paymentType: data.payment_type,
      transactionTime: data.transaction_time,
      supabaseUrl,
      supabaseKey
    });
    res.status(200).json({
      orderId,
      isPaid: transitionResult.isPaid,
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      paymentStatus: transitionResult.paymentStatus,
      invitationStatus: transitionResult.invitationStatus,
      paymentType: data.payment_type,
      settlementTime: data.settlement_time
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Terjadi kesalahan internal." });
  }
}

// api/cloudinary/delete.ts
import crypto2 from "crypto";
async function handleDeleteCloudinaryAsset(req, res) {
  try {
    const { publicId, resourceType = "image" } = req.body || {};
    if (!publicId) {
      res.status(400).json({ error: "publicId wajib disertakan." });
      return;
    }
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME || "dgtphydba";
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiKey || !apiSecret) {
      console.warn(
        "[Cloudinary Delete] CLOUDINARY_API_KEY atau CLOUDINARY_API_SECRET belum diisi di .env. File remote tidak dihapus."
      );
      res.status(200).json({
        success: false,
        warning: "CLOUDINARY_API_KEY dan CLOUDINARY_API_SECRET belum dikonfigurasi di Environment. File tidak dihapus di remote storage."
      });
      return;
    }
    const timestamp = Math.floor(Date.now() / 1e3).toString();
    const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto2.createHash("sha1").update(toSign).digest("hex");
    const formData = new URLSearchParams();
    formData.append("public_id", publicId);
    formData.append("timestamp", timestamp);
    formData.append("api_key", apiKey);
    formData.append("signature", signature);
    const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
    const response = await fetch(destroyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString()
    });
    const data = await response.json().catch(() => ({}));
    res.status(response.status).json({
      success: response.ok,
      result: data.result || data
    });
  } catch (err) {
    console.error("[Cloudinary Delete Exception]:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
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
    }),
    paymentCheck: rateLimit({
      windowMs: 60 * 1e3,
      limit: 15,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => `${ipKeyGenerator(req.ip || "unknown")}:${String(req.query?.orderId || req.body?.orderId || "")}`,
      message: { error: "Terlalu banyak permintaan cek status. Silakan tunggu 1 menit sebelum mencoba kembali." }
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
  app.get("/api/payment/check-status", limits.paymentCheck, handleCheckStatus);
  app.post("/api/payment/check-status", limits.paymentCheck, handleCheckStatus);
  app.post("/api/cloudinary/delete", handleDeleteCloudinaryAsset);
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
