import JSZip from 'jszip';
import { ClientInvitationData } from '../types/clientInvitation';
import { TEMPLATE_REGISTRY } from '../admin/templateRegistry';
import { collectAdminUploadedPhotos } from './templateMediaResolver';
import { isVideoUrl } from './cloudinaryUpload';

/**
 * Mengunduh gambar/audio dari URL Cloudinary atau internet lalu mengubah gambar menjadi format WebP Blob
 */
async function fetchAssetAsBlob(url: string): Promise<{ blob: Blob; mimeType: string }> {
  // Tambahkan transformasi f_webp jika dari Cloudinary agar server Cloudinary langsung mengirim WebP
  let fetchUrl = url;
  if (url.includes('res.cloudinary.com') && url.includes('/upload/') && !isVideoUrl(url) && !url.includes('.mp3')) {
    fetchUrl = url.replace('/upload/', '/upload/f_webp,q_auto/');
  }

  try {
    const res = await fetch(fetchUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return { blob, mimeType: blob.type || 'image/webp' };
  } catch (err) {
    // Jika CORS gagal di browser, coba fetch langsung tanpa modifikasi
    const fallbackRes = await fetch(url);
    const blob = await fallbackRes.blob();
    return { blob, mimeType: blob.type || 'application/octet-stream' };
  }
}

/**
 * Menghasilkan kode HTML Standalone mandiri yang bisa dijalankan secara offline
 * maupun di-deploy langsung ke Vercel atau GitHub Pages.
 */
function generateStandaloneHtml(
  invitation: ClientInvitationData,
  assetMap: Record<string, string>,
  hasLocalMusic: boolean
): string {
  const bride = invitation.brideName || 'Mempelai Wanita';
  const groom = invitation.groomName || 'Mempelai Pria';
  const brideFull = invitation.brideFullName || bride;
  const groomFull = invitation.groomFullName || groom;
  const eventDate = invitation.eventDateFormatted || 'Hari Bahagia';
  const akadTime = invitation.akadTime || '08.00 - 10.00 WIB';
  const akadVenue = invitation.akadVenue || invitation.resepsiVenue || 'Lokasi Acara';
  const resepsiTime = invitation.resepsiTime || '11.00 - 14.00 WIB';
  const resepsiVenue = invitation.resepsiVenue || 'Lokasi Acara';
  const city = invitation.city || '';
  const mapsUrl = invitation.mapsUrl || 'https://maps.google.com';
  const quote = invitation.quoteText || 'Dan di antara tanda-tanda kebesaran-Nya...';
  const quoteSource = invitation.quoteSource || '';
  const bankName = invitation.bankName || 'BCA';
  const accountNumber = invitation.accountNumber || '';
  const accountHolder = invitation.accountHolder || '';
  const songTitle = invitation.songTitle || 'Until I Found You';

  // Asset paths yang sudah relatif ke folder ./assets/
  const heroSrc = assetMap.hero || './assets/hero.webp';
  const brideSrc = assetMap.bride || './assets/bride.webp';
  const groomSrc = assetMap.groom || './assets/groom.webp';
  const closingSrc = assetMap.closing || heroSrc;
  const qrisSrc = assetMap.qris || '';
  const galleryList = Object.keys(assetMap)
    .filter((k) => k.startsWith('gallery_'))
    .map((k) => assetMap[k]);

  // Babak kisah cinta
  const chapters = invitation.mediaSlots?.storyChapters || [];

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pernikahan ${bride} & ${groom} — Kapsul Kenangan Abadi</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #F8F6F0;
      --paper: #FFFFFF;
      --text: #1C1917;
      --muted: #57534E;
      --gold: #C5A880;
      --gold-dark: #93754F;
      --accent: #292524;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      line-height: 1.6;
      text-align: center;
      padding-bottom: 80px;
    }
    .serif { font-family: 'Fraunces', Georgia, serif; font-weight: 400; }
    .container { max-width: 580px; margin: 0 auto; background: var(--paper); box-shadow: 0 10px 40px rgba(0,0,0,0.06); }
    
    /* Cover */
    .cover-hero { position: relative; width: 100%; aspect-ratio: 4/5; overflow: hidden; background: #000; }
    .cover-hero img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.75); }
    .cover-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: flex-end; padding: 32px 24px; color: #fff; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%); text-align: center; }
    .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.25em; color: var(--gold); margin-bottom: 8px; font-weight: 600; }
    .names { font-size: 38px; line-height: 1.15; font-style: italic; color: #FAF7F2; }
    .date-badge { font-size: 13px; margin-top: 12px; color: rgba(255,255,255,0.85); letter-spacing: 0.05em; }

    /* Sections */
    section { padding: 48px 24px; border-bottom: 1px solid #F0ECE1; }
    .sec-kicker { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; color: var(--gold-dark); margin-bottom: 6px; display: block; }
    .sec-title { font-size: 26px; color: var(--accent); margin-bottom: 18px; font-style: italic; }

    /* Mempelai */
    .couple-grid { display: grid; grid-cols: 1; gap: 24px; margin-top: 24px; }
    .avatar-frame { width: 120px; height: 150px; margin: 0 auto 12px; border-radius: 8px; overflow: hidden; border: 3px solid #FAF7F2; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .avatar-frame img { width: 100%; height: 100%; object-fit: cover; }
    .mempelai-name { font-size: 20px; font-weight: 600; color: var(--accent); }
    .mempelai-parent { font-size: 12px; color: var(--muted); margin-top: 4px; }

    /* Quote */
    .quote-box { background: #FAF8F5; border: 1px solid #EAE4D7; border-radius: 12px; padding: 24px; margin: 24px 0; font-style: italic; font-size: 13px; color: var(--muted); }

    /* Cards */
    .event-card { background: #FAF8F5; border: 1px solid #EAE4D7; border-radius: 12px; padding: 20px; margin-bottom: 14px; text-align: left; }
    .event-type { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: var(--gold-dark); margin-bottom: 4px; }
    .event-time { font-size: 16px; font-weight: 600; color: var(--accent); }
    .event-place { font-size: 13px; color: var(--muted); margin-top: 4px; }

    /* Galeri */
    .gallery-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px; }
    .gallery-item { aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #eee; cursor: pointer; }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .gallery-item img:hover { transform: scale(1.05); }

    /* Story */
    .story-card { text-align: left; background: #FAF8F5; border-left: 3px solid var(--gold); padding: 14px 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0; }
    .story-date { font-size: 11px; font-weight: 700; color: var(--gold-dark); text-transform: uppercase; }
    .story-title { font-size: 15px; font-weight: 600; margin: 2px 0 4px; }
    .story-desc { font-size: 12px; color: var(--muted); }

    /* Floating Music Player */
    .music-btn {
      position: fixed; bottom: 20px; right: 20px; z-index: 99;
      background: var(--accent); color: #fff; width: 48px; height: 48px; border-radius: 50%;
      border: 2px solid var(--gold); display: flex; items-center; justify-content: center;
      cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,0.25);
    }
    .music-btn.spinning { animation: spin 4s linear infinite; }
    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Button Maps */
    .btn-maps {
      display: inline-block; margin-top: 12px; padding: 10px 20px;
      background: var(--accent); color: #fff; text-decoration: none;
      font-size: 12px; font-weight: 600; border-radius: 50px;
      transition: background 0.2s;
    }
    .btn-maps:hover { background: #000; }

    /* Footer */
    footer { padding: 40px 20px; text-align: center; color: var(--muted); font-size: 12px; }
    .badge-offline { display: inline-block; background: #EAE4D7; color: var(--accent); font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.1em; }
  </style>
</head>
<body>
  <div class="container">
    <!-- COVER HERO -->
    <header class="cover-hero">
      <img src="${heroSrc}" alt="Pernikahan ${bride} & ${groom}">
      <div class="cover-overlay">
        <span class="kicker">Undangan Pernikahan</span>
        <h1 class="names serif">${bride} &amp; ${groom}</h1>
        <p class="date-badge">${eventDate}</p>
      </div>
    </header>

    <!-- MEMPELAI -->
    <section id="mempelai">
      <span class="sec-kicker">Mempelai Berbahagia</span>
      <h2 class="sec-title serif">Dua Insan Menjadi Satu</h2>
      
      ${quote ? `
      <div class="quote-box">
        “${quote}”
        ${quoteSource ? `<p style="margin-top:6px; font-size:11px; font-weight:600;">— ${quoteSource}</p>` : ''}
      </div>` : ''}

      <div class="couple-grid">
        <div>
          <div class="avatar-frame">
            <img src="${brideSrc}" alt="${brideFull}">
          </div>
          <h3 class="mempelai-name">${brideFull}</h3>
          ${invitation.brideParents ? `<p class="mempelai-parent">${invitation.brideParents}</p>` : ''}
        </div>

        <div style="font-size:24px; color:var(--gold); font-family:serif; margin:8px 0;">&amp;</div>

        <div>
          <div class="avatar-frame">
            <img src="${groomSrc}" alt="${groomFull}">
          </div>
          <h3 class="mempelai-name">${groomFull}</h3>
          ${invitation.groomParents ? `<p class="mempelai-parent">${invitation.groomParents}</p>` : ''}
        </div>
      </div>
    </section>

    <!-- WAKTU & LOKASI -->
    <section id="acara">
      <span class="sec-kicker">Waktu &amp; Tempat</span>
      <h2 class="sec-title serif">Jadwal Perayaan</h2>

      <div class="event-card">
        <div class="event-type">Akad Nikah</div>
        <div class="event-time">${akadTime}</div>
        <div class="event-place">${akadVenue}${city ? `, ${city}` : ''}</div>
      </div>

      <div class="event-card">
        <div class="event-type">Resepsi Pernikahan</div>
        <div class="event-time">${resepsiTime}</div>
        <div class="event-place">${resepsiVenue}${city ? `, ${city}` : ''}</div>
      </div>

      ${mapsUrl ? `<a href="${mapsUrl}" target="_blank" class="btn-maps">Buka Lokasi di Google Maps &rarr;</a>` : ''}
    </section>

    <!-- KISAH CINTA (JIKA ADA) -->
    ${chapters.length > 0 ? `
    <section id="kisah">
      <span class="sec-kicker">Kisah Kasih</span>
      <h2 class="sec-title serif">Babak Perjalanan Kami</h2>
      <div style="margin-top:20px;">
        ${chapters.map((ch, i) => `
          <div class="story-card">
            <div class="story-date">${ch.date || ch.chapter || `Babak 0${i+1}`}</div>
            <div class="story-title">${ch.title}</div>
            <div class="story-desc">${ch.story}</div>
          </div>
        `).join('')}
      </div>
    </section>` : ''}

    <!-- GALERI MOMEN (JIKA ADA) -->
    ${galleryList.length > 0 ? `
    <section id="galeri">
      <span class="sec-kicker">Dokumentasi</span>
      <h2 class="sec-title serif">Galeri Momen</h2>
      <div class="gallery-grid">
        ${galleryList.map((src, i) => `
          <div class="gallery-item">
            <img src="${src}" alt="Momen ${i+1}" loading="lazy">
          </div>
        `).join('')}
      </div>
    </section>` : ''}

    <!-- TANDA KASIH -->
    ${accountNumber ? `
    <section id="hadiah">
      <span class="sec-kicker">Tanda Kasih</span>
      <h2 class="sec-title serif">Amplop Digital</h2>
      <div class="event-card" style="text-align:center;">
        <p style="font-size:12px; color:var(--muted); margin-bottom:8px;">Doa restu Anda adalah hadiah terindah. Bagi yang ingin mengirimkan tanda kasih:</p>
        <div style="font-size:15px; font-weight:700; color:var(--accent);">${bankName}: ${accountNumber}</div>
        <div style="font-size:12px; color:var(--muted);">a.n. ${accountHolder}</div>
        ${qrisSrc ? `<img src="${qrisSrc}" alt="QRIS" style="width:160px; height:160px; margin:14px auto 0; display:block; border-radius:8px;">` : ''}
      </div>
    </section>` : ''}

    <!-- PENUTUP -->
    <section id="penutup" style="position:relative; overflow:hidden; background:#1C1917; color:#fff;">
      <div style="position:relative; z-index:2; padding:32px 16px;">
        <h2 class="sec-title serif" style="color:#FAF7F2; margin-bottom:8px;">Terima Kasih</h2>
        <p style="font-size:13px; color:rgba(255,255,255,0.8); max-width:380px; margin:0 auto;">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir dan memberikan doa restu.
        </p>
        <p class="serif" style="font-size:22px; font-style:italic; color:var(--gold); margin-top:20px;">
          ${bride} &amp; ${groom}
        </p>
      </div>
    </section>

    <!-- FOOTER -->
    <footer>
      <p>Kapsul Kenangan Digital Abadi &copy; ${new Date().getFullYear()} ${bride} &amp; ${groom}</p>
      <span class="badge-offline">Standalone Offline Package &middot; Sekarsiti Studio</span>
    </footer>
  </div>

  <!-- AUDIO PLAYER -->
  ${hasLocalMusic ? `
  <audio id="bgAudio" loop preload="auto">
    <source src="./assets/music.mp3" type="audio/mpeg">
  </audio>
  <button id="musicToggle" class="music-btn" title="Putar Musik (${songTitle})">
    🎵
  </button>
  <script>
    const audio = document.getElementById('bgAudio');
    const btn = document.getElementById('musicToggle');
    let isPlaying = false;

    function toggleMusic() {
      if (isPlaying) {
        audio.pause();
        btn.classList.remove('spinning');
        btn.innerHTML = '🔇';
      } else {
        audio.play().then(() => {
          btn.classList.add('spinning');
          btn.innerHTML = '🎵';
        }).catch(err => console.log('Autoplay blocked:', err));
      }
      isPlaying = !isPlaying;
    }

    btn.addEventListener('click', toggleMusic);
    // Auto-play on first user touch anywhere
    document.addEventListener('click', function initPlay() {
      if (!isPlaying) toggleMusic();
      document.removeEventListener('click', initPlay);
    }, { once: true });
  </script>
  ` : ''}
</body>
</html>`;
}

/**
 * Menghasilkan file README.txt petunjuk penggunaan kapsul kenangan, ganti musik, dan deploy free.
 */
function generateReadmeContent(invitation: ClientInvitationData): string {
  const bride = invitation.brideName || 'Mempelai';
  const groom = invitation.groomName || 'Pasangan';

  return `========================================================================
✨ KAPSUL KENANGAN DIGITAL ABADI (STANDALONE OFFLINE PACKAGE) ✨
Pernikahan: ${bride} & ${groom}
Dibuat oleh: Sekarsiti Studio (https://ssiti.tech)
========================================================================

Terima kasih telah menyimpan kenangan hari bahagia Anda bersama Sekarsiti!
Paket ini berisi seluruh aset asli pernikahan Anda yang telah dioptimasi 
menjadi format WebP modern agar ringan, hemat ruang, dan tahan selamanya.

------------------------------------------------------------------------
📂 STRUKTUR FOLDER:
------------------------------------------------------------------------
├── index.html          --> File utama undangan yang bisa dibuka langsung
├── README.txt          --> Panduan ini
└── assets/             --> Seluruh foto asli berformat WebP & musik latar
    ├── hero.webp
    ├── bride.webp
    ├── groom.webp
    ├── gallery-*.webp
    └── music.mp3

------------------------------------------------------------------------
🚀 CARA MEMBUKA SECARA OFFLINE (DI LAPTOP / KOMPUTER):
------------------------------------------------------------------------
1. Ekstrak (Extract) seluruh file dari file .zip ini ke folder di laptop Anda.
2. Klik ganda (Double Click) file "index.html".
3. Undangan akan langsung terbuka di browser Anda (Chrome, Safari, Edge, Firefox)
   bahkan TANPA KONEKSI INTERNET! Musik dan seluruh foto tersimpan lokal.

------------------------------------------------------------------------
🎵 CARA MENGGANTI MUSIK DENGAN LAGU FAVORIT ANDA:
------------------------------------------------------------------------
Jika di masa depan Anda ingin mengganti lagu latar:
1. Siapkan file musik MP3 favorit Anda.
2. Ubah nama file lagu tersebut menjadi persis: "music.mp3".
3. Pindahkan file tersebut ke dalam folder "assets/", timpa (replace) file music.mp3 yang lama.
4. Selesai! Anda TIDAK PERLU mengubah kode apapun di dalam index.html.

------------------------------------------------------------------------
🌐 CARA DEPLOY GRATIS KE GITHUB PAGES ATAU VERCEL (AKUN MANDIRI):
------------------------------------------------------------------------
Jika Anda ingin undangan ini online selamanya secara gratis menggunakan akun sendiri:

A. Menggunakan Vercel (Paling Mudah, 1 Menit):
   1. Buka https://vercel.com dan daftar / login gratis.
   2. Pada Dashboard Vercel, cukup drag-and-drop (seret) folder hasil ekstrak ini ke layar.
   3. Vercel akan langsung memberikan link domain gratis selamanya (contoh: https://${invitation.slug || 'pernikahan'}.vercel.app).

B. Menggunakan GitHub Pages:
   1. Buat repository baru di GitHub (misal: "undangan-kami").
   2. Unggah seluruh isi folder ini (index.html, assets/, README.txt).
   3. Buka menu Settings -> Pages -> pilih branch "main" -> Save.
   4. Undangan Anda akan aktif selamanya di https://username.github.io/undangan-kami.

------------------------------------------------------------------------
Semoga cinta dan kebahagiaan senantiasa menyertai perjalanan Anda berdua! 🤍
========================================================================
`;
}

/**
 * FUNGSI UTAMA: GENERATE KAPSUL KENANGAN .ZIP
 */
export async function exportMemoryCapsuleZip(
  invitation: ClientInvitationData,
  onProgress?: (text: string) => void
): Promise<void> {
  const zip = new JSZip();
  const assetsFolder = zip.folder('assets');

  onProgress?.('Mengumpulkan daftar aset foto & musik...');

  const allPhotos = collectAdminUploadedPhotos(invitation);
  const slots = invitation.mediaSlots || { galleryImages: [] };

  const assetMap: Record<string, string> = {};

  // 1. Hero
  const heroCandidate = slots.heroImage || allPhotos[0];
  if (heroCandidate && !isVideoUrl(heroCandidate)) {
    try {
      onProgress?.('Mengunduh foto sampul (hero)...');
      const { blob } = await fetchAssetAsBlob(heroCandidate);
      assetsFolder?.file('hero.webp', blob);
      assetMap.hero = './assets/hero.webp';
    } catch (e) {
      console.warn('Gagal unduh hero:', e);
    }
  }

  // 2. Mempelai Wanita
  const brideCandidate = slots.bridePortrait || allPhotos[1] || allPhotos[0];
  if (brideCandidate && !isVideoUrl(brideCandidate)) {
    try {
      onProgress?.('Mengunduh potret mempelai wanita...');
      const { blob } = await fetchAssetAsBlob(brideCandidate);
      assetsFolder?.file('bride.webp', blob);
      assetMap.bride = './assets/bride.webp';
    } catch (e) {
      console.warn('Gagal unduh bride:', e);
    }
  }

  // 3. Mempelai Pria
  const groomCandidate = slots.groomPortrait || allPhotos[2] || allPhotos[0];
  if (groomCandidate && !isVideoUrl(groomCandidate)) {
    try {
      onProgress?.('Mengunduh potret mempelai pria...');
      const { blob } = await fetchAssetAsBlob(groomCandidate);
      assetsFolder?.file('groom.webp', blob);
      assetMap.groom = './assets/groom.webp';
    } catch (e) {
      console.warn('Gagal unduh groom:', e);
    }
  }

  // 4. Closing / Penutup
  const closingCandidate = slots.closingImage || slots.spotlightImage;
  if (closingCandidate && !isVideoUrl(closingCandidate)) {
    try {
      onProgress?.('Mengunduh foto penutup...');
      const { blob } = await fetchAssetAsBlob(closingCandidate);
      assetsFolder?.file('closing.webp', blob);
      assetMap.closing = './assets/closing.webp';
    } catch (e) {
      console.warn('Gagal unduh closing:', e);
    }
  }

  // 5. QRIS
  const qrisCandidate = invitation.qrisImageUrl || slots.qrisImageUrl;
  if (qrisCandidate) {
    try {
      onProgress?.('Mengunduh barcode QRIS...');
      const { blob } = await fetchAssetAsBlob(qrisCandidate);
      assetsFolder?.file('qris.webp', blob);
      assetMap.qris = './assets/qris.webp';
    } catch (e) {
      console.warn('Gagal unduh QRIS:', e);
    }
  }

  // 6. Galeri Momen
  const galleryList = (slots.galleryImages && slots.galleryImages.length > 0)
    ? slots.galleryImages
    : allPhotos;

  for (let i = 0; i < galleryList.length; i++) {
    const photoUrl = galleryList[i];
    if (!photoUrl || isVideoUrl(photoUrl)) continue;
    try {
      onProgress?.(`Mengunduh galeri momen ${i + 1} dari ${galleryList.length}...`);
      const { blob } = await fetchAssetAsBlob(photoUrl);
      const filename = `gallery-${i + 1}.webp`;
      assetsFolder?.file(filename, blob);
      assetMap[`gallery_${i + 1}`] = `./assets/${filename}`;
    } catch (e) {
      console.warn(`Gagal unduh galeri ${i + 1}:`, e);
    }
  }

  // 7. Musik Latar
  let hasLocalMusic = false;
  if (invitation.audioUrl && invitation.audioUrl.trim()) {
    try {
      onProgress?.('Mengunduh musik latar...');
      const res = await fetch(invitation.audioUrl, { mode: 'cors' });
      if (res.ok) {
        const musicBlob = await res.blob();
        assetsFolder?.file('music.mp3', musicBlob);
        hasLocalMusic = true;
      }
    } catch (e) {
      console.warn('Gagal mengunduh musik audioUrl:', e);
    }
  }

  // 8. Generate index.html & README.txt
  onProgress?.('Menyusun file index.html & petunjuk README.txt...');
  const htmlContent = generateStandaloneHtml(invitation, assetMap, hasLocalMusic);
  zip.file('index.html', htmlContent);

  const readmeContent = generateReadmeContent(invitation);
  zip.file('README.txt', readmeContent);

  // 9. Kompresi ZIP & Download
  onProgress?.('Mengompresi seluruh paket Kapsul Kenangan (.ZIP)...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  const slug = invitation.slug || 'undangan';
  const fileName = `Kapsul-Kenangan-${slug}.zip`;

  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

