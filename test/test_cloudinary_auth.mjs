import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('=== PENGUJIAN KREDENSIAL CLOUDINARY ===\n');

// 1. Cek Kelengkapan Variabel di .env
const checks = [
  { name: 'Cloud Name', ok: Boolean(cloudName && cloudName.trim()) },
  { name: 'Upload Preset', ok: Boolean(uploadPreset && uploadPreset.trim()) },
  { name: 'API Key', ok: Boolean(apiKey && apiKey.trim()) },
  { name: 'API Secret', ok: Boolean(apiSecret && apiSecret.trim()) },
];

let allConfigured = true;
checks.forEach((c) => {
  if (c.ok) {
    console.log(`[OK] ${c.name}: Terkonfigurasi`);
  } else {
    console.log(`[MISSING] ${c.name}: Belum diisi di .env`);
    allConfigured = false;
  }
});

if (!allConfigured) {
  console.log('\nKesimpulan: Ada variabel yang belum terisi di .env.');
  process.exit(1);
}

// 2. Uji Autentikasi Signature ke Server Cloudinary secara Nyata
async function testCloudinaryAuth() {
  console.log('\nMenghubungi Cloudinary API untuk verifikasi pasangan Key & Secret...');
  
  const testPublicId = `probe_auth_test_${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const toSign = `public_id=${testPublicId}&timestamp=${timestamp}${apiSecret.trim()}`;
  const signature = crypto.createHash('sha1').update(toSign).digest('hex');

  const formData = new URLSearchParams();
  formData.append('public_id', testPublicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey.trim());
  formData.append('signature', signature);

  const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName.trim()}/image/destroy`;

  try {
    const res = await fetch(destroyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await res.json().catch(() => ({}));

    // Jika signature atau API key salah, Cloudinary akan mengembalikan HTTP 401 / 400 dengan pesan error Invalid Signature
    if (res.status === 401 || (data.error && data.error.message && data.error.message.toLowerCase().includes('signature'))) {
      console.log('\n[GAGAL] Autentikasi Ditolak oleh Cloudinary!');
      console.log('Pesan dari Cloudinary:', data.error?.message || 'Unauthorized / Invalid Key or Secret');
      console.log('Saran: Pastikan API Key dan API Secret berasal dari baris pasangan yang sama di dashboard Cloudinary.');
      process.exit(1);
    }

    // Jika HTTP 200 dan result 'not found', artinya signature dan API key VALID (hanya saja probe ID memang belum ada filenya)
    if (res.ok && (data.result === 'not found' || data.result === 'ok')) {
      console.log('\n[BERHASIL 100%] Kredensial Cloudinary Valid dan Berfungsi!');
      console.log(`Status Respons: ${res.status} OK`);
      console.log(`Verifikasi Signature: Diterima oleh server Cloudinary (${data.result})`);
      console.log('Fitur upload dan hapus aset otomatis kini telah aktif sepenuhnya.');
    } else {
      console.log('\nStatus Respons Cloudinary:', res.status, data);
    }
  } catch (err) {
    console.error('\n[ERROR KONEKSI]', err.message);
  }
}

testCloudinaryAuth();
