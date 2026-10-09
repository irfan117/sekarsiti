// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(express.json({ limit: "1mb" }));
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/ai/parse-invitation", async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "Teks masukan Google Form tidak boleh kosong" });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          error: "GEMINI_API_KEY belum dikonfigurasi di server.",
          isFallback: true
        });
      }
      const prompt = `Anda adalah asisten operasional AI untuk Sekarsiti Studio (platform undangan digital pernikahan terkurasi).
Tugas Anda: mengekstrak seluruh data klien dari isian Google Form (GForm), baris Google Sheets (TSV/CSV), maupun ringkasan respons formulir klien\u2014TERMASUK seluruh tautan media/foto (link upload Google Drive atau URL gambar langsung)\u2014ke dalam struktur JSON yang siap diterapkan ke editor undangan.

Aturan Penting Ekstraksi Data & Media GForm:
1. Pisahkan nama panggilan (brideName, groomName) dan nama lengkap beserta gelar (brideFullName, groomFullName).
2. Format clientName menjadi "NamaWanita & NamaPria" (contoh: "Kirana & Adhitya") dan buat slug huruf kecil dengan tanda hubung (contoh: "kirana-adhitya").
3. Konversi tanggal acara ke Bahasa Indonesia formal (contoh: "Minggu, 14 Februari 2027") dan countdownIsoDate ke format ISO "YYYY-MM-DDTHH:MM:SS" (gunakan jam akad sebagai patokan jika ada, atau T08:00:00).
4. Ekstrak rekening bank utama (bankName, accountNumber, accountHolder) dan rekening bank kedua opsional (secondaryBankName, secondaryAccountNumber, secondaryAccountHolder).
5. Ekstrak seluruh tautan media/foto dari isian upload file Google Form ke dalam objek "media":
   - Jika ada tautan Google Drive berbentuk "https://drive.google.com/open?id=FILE_ID" atau "https://drive.google.com/file/d/FILE_ID/view...", ubah menjadi URL gambar langsung: "https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600".
   - Jika tautan berupa path aset lokal (mis. "/src/assets/images/...") atau URL gambar langsung, pertahankan apa adanya.
   - Jika kolom Galeri Foto atau Filmstrip berisi beberapa link yang dipisahkan koma/baris baru (khas Google Form File Upload multi-file), masukkan semuanya sebagai array string di "galleryImages" atau "filmstripImages".
6. Pilih recommendedTemplate dari: "ruang-rasa", "malam-zamrud", "setangkai", "suasana", "lembayung", "cetak-biru", atau "atlas-cinta" sesuai pilihan klien di GForm atau suasana acara.

Data Masukan Google Form / Spreadsheet Klien:
"""
${rawText}
"""`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clientName: { type: Type.STRING, description: "Nama pasangan singkat, misal Kirana & Adhitya" },
              clientPhone: { type: Type.STRING, description: "Nomor WhatsApp pemesan" },
              clientEmail: { type: Type.STRING, description: "Alamat email pemesan" },
              slug: { type: Type.STRING, description: "URL slug undangan huruf kecil, misal kirana-adhitya" },
              recommendedTemplate: {
                type: Type.STRING,
                description: "Salah satu dari: ruang-rasa, malam-zamrud, setangkai, suasana, lembayung, cetak-biru, atlas-cinta"
              },
              brideName: { type: Type.STRING, description: "Nama panggilan mempelai wanita" },
              brideFullName: { type: Type.STRING, description: "Nama lengkap & gelar mempelai wanita" },
              brideParents: { type: Type.STRING, description: "Keterangan orang tua mempelai wanita" },
              brideInstagram: { type: Type.STRING, description: "Username Instagram mempelai wanita" },
              groomName: { type: Type.STRING, description: "Nama panggilan mempelai pria" },
              groomFullName: { type: Type.STRING, description: "Nama lengkap & gelar mempelai pria" },
              groomParents: { type: Type.STRING, description: "Keterangan orang tua mempelai pria" },
              groomInstagram: { type: Type.STRING, description: "Username Instagram mempelai pria" },
              eventDateFormatted: { type: Type.STRING, description: "Hari dan tanggal formal Indonesia" },
              countdownIsoDate: { type: Type.STRING, description: "Format ISO YYYY-MM-DDTHH:MM:SS" },
              akadTime: { type: Type.STRING, description: "Waktu akad / pemberkatan" },
              akadVenue: { type: Type.STRING, description: "Tempat / ruangan akad" },
              resepsiTime: { type: Type.STRING, description: "Waktu resepsi pernikahan" },
              resepsiVenue: { type: Type.STRING, description: "Tempat / gedung resepsi" },
              city: { type: Type.STRING, description: "Kota lokasi acara" },
              mapsUrl: { type: Type.STRING, description: "Tautan navigasi Google Maps" },
              bankName: { type: Type.STRING, description: "Nama bank utama" },
              accountNumber: { type: Type.STRING, description: "Nomor rekening utama" },
              accountHolder: { type: Type.STRING, description: "Atas nama pemilik rekening utama" },
              secondaryBankName: { type: Type.STRING, description: "Nama bank kedua (opsional)" },
              secondaryAccountNumber: { type: Type.STRING, description: "Nomor rekening kedua (opsional)" },
              secondaryAccountHolder: { type: Type.STRING, description: "Atas nama rekening kedua (opsional)" },
              qrisImageUrl: { type: Type.STRING, description: "URL gambar barcode QRIS jika ada" },
              quoteText: { type: Type.STRING, description: "Kutipan suci / doa pernikahan" },
              quoteSource: { type: Type.STRING, description: "Sumber kutipan / ayat" },
              songTitle: { type: Type.STRING, description: "Judul lagu latar pilihan klien" },
              audioUrl: { type: Type.STRING, description: "Tautan file audio jika disertakan" },
              media: {
                type: Type.OBJECT,
                properties: {
                  heroImage: { type: Type.STRING, description: "URL foto sampul utama / hero dari GForm" },
                  bridePortrait: { type: Type.STRING, description: "URL foto potret mempelai wanita dari GForm" },
                  groomPortrait: { type: Type.STRING, description: "URL foto potret mempelai pria dari GForm" },
                  galleryImages: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar URL foto galeri prewedding dari GForm"
                  },
                  filmstripImages: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Daftar URL foto klise filmstrip 35mm dari GForm"
                  },
                  qrisImageUrl: { type: Type.STRING, description: "URL gambar QRIS tanda kasih dari GForm" },
                  waxSealEmblem: { type: Type.STRING, description: "URL gambar segel lilin / monogram jika ada" },
                  gdriveFolderUrl: { type: Type.STRING, description: "Tautan folder Google Drive dokumentasi klien" }
                }
              }
            }
          }
        }
      });
      const text = response.text || "{}";
      const parsedData = JSON.parse(text);
      return res.json({ success: true, data: parsedData });
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      return res.status(500).json({
        error: err?.message || "Gagal mengekstrak data Google Form dengan AI",
        isFallback: true
      });
    }
  });
  app.post("/api/ai/generate-quote", async (req, res) => {
    try {
      const { theme, coupleName } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({ error: "GEMINI_API_KEY belum dikonfigurasi", isFallback: true });
      }
      const prompt = `Buat kutipan pernikahan puitis, khidmat, dan mendalam dalam bahasa Indonesia untuk pasangan ${coupleName || "mempelai"}.
Tema suasana: ${theme || "editorial modern puitis"}.
Kembalikan JSON murni:
{
  "quoteText": "Teks kutipan puitis dan sakral",
  "quoteSource": "Sumber (contoh: QS. Ar-Rum: 21, Kahlil Gibran, atau Janji Suci)"
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ success: true, data: parsedData });
    } catch (err) {
      return res.status(500).json({ error: err?.message || "Gagal membuat kutipan AI", isFallback: true });
    }
  });
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
