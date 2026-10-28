# Panduan Standar Prototipe HTML Undangan Sekarsiti
## (Prompt Siap Salin untuk Claude / ChatGPT / v0)

Gunakan prompt di bawah ini untuk Anda salin langsung ke **Claude**, **ChatGPT**, atau **v0**. 

Prompt ini dirancang khusus agar AI luar menghasilkan prototipe HTML mandiri dengan **kualitas visual editorial kelas atas (tidak monoton/dasar)**, kaya akan komposisi gambar & background atmosferik, serta memiliki **desktop split screen reaktif yang berinteraksi dinamis dengan scroll layar utama**, sekaligus menjaga kompatibilitas 100% dengan database dan utilitas Sekarsiti.

---

## 📋 PROMPT SIAP SALIN (COPY-PASTE KE AI)

```markdown
Kamu adalah Principal UI/UX Designer & Frontend Visual Specialist kelas dunia untuk luxury wedding invitation.
Tugasmu: Buatkan 1 file HTML mandiri (prototype.html) dengan tema: [TULIS TEMA DESAIN DI SINI, misal: Noir Editorial Monokrom / Terracotta Warm Rustic / Ethereal Botanical Sage / Royal Classic Velvet].

---

### 1. STANDAR ESTETIKA & KAYA VISUAL (JANGAN BUAT DESAIN BIASA/DATAR):
1. **Kedalaman Visual (Visual Depth & Texture):**
   - Jangan buat halaman polos putih/abu-abu rata. Hadirkan tekstur mewah: grain overlay, garis hairline halus (`border-white/10` atau `border-stone-300`), subtle glow/vignette, atau duotone backdrop.
   - Gunakan tipografi Google Fonts berkarakter kuat: Kombinasikan Font Serif Editorial (misal: *Cormorant Garamond, Playfair Display, Cinzel, Italiana, Syne*) untuk judul megah dengan Font Sans yang bersih dan ultra-readable (*Inter, Plus Jakarta Sans, Montserrat*) untuk teks isi.
   - Komposisi teks bervariasi: Mainkan kontras ukuran teks (angka tanggal raksasa display serif, label pelacak bab format uppercase spasi lebar `tracking-[0.25em] text-[10px]`, monogram elegan).

2. **Eksplorasi Banyak Gambar & Background Atmosferik:**
   - JANGAN PELIT GAMBAR. Selain foto wajib kedua mempelai, gunakan gambar sebagai latar belakang section, kartu berbayang, backdrop parallax, atau kolase artistik.
   - Gunakan URL gambar kurasi Unsplash bertema fashion/editorial/wedding berkualitas tinggi.
   - Terapkan gradient overlay / scrim mask pada foto background agar teks di atasnya selalu terbaca kontras dan elegan (misal: `bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent` atau `backdrop-blur-[2px]`).
   - Berikan atribut `data-slot` pada setiap elemen <img> agar otomatis kompatibel dengan media manager:
     * `data-slot="heroImage"` : Foto sampul utama / pembuka
     * `data-slot="bridePortrait"` : Foto mempelai wanita
     * `data-slot="groomPortrait"` : Foto mempelai pria
     * `data-slot="closingImage"` : Foto seksi penutup / ucapan terima kasih
     * `data-slot="galleryImages"` : Foto galeri (bebas jumlah: 4-8 foto dalam layout masonry / kolase asimetris)
     * `data-slot="backgroundHero"` atau `data-slot="ambientTexture"` : Foto atau tekstur atmosferik untuk latar belakang seksi

3. **Variasi Layout Tiap Seksi:**
   - Hindari susunan kartu yang repetitif/monoton.
   - Variasikan struktur antarseksi: Hero megah bertekstur -> Seksi pasangan asimetris (foto berdampingan dengan cerita singkat) -> Hitung mundur & jadwal kartu editorial -> Galeri grid bervariasi ukuran -> Seksi amplop digital berdesain kartu eksklusif -> Formulir RSVP & ucapan bernuansa minimalis.

---

### 2. CIRI KHAS DESKTOP SPLIT SCREEN REAKTIF (MODEL TATA LETAK):
Pilih salah satu model tampilan desktop berikut:

- [x] **OPSI A (Ciri Khas Sekarsiti - Split Screen Reaktif):**
  * **Layar Desktop (lg: ≥1024px):**
    - **Sisi Kiri (50% Fixed/Sticky):** Panel visual editorial setinggi layar (`h-screen sticky top-0`). 
      **ATURAN PENTING:** Sisi kiri BUKAN sekadar gambar mati! Buat panel kiri **REAKTIF terhadap scroll sisi kanan**:
      Gunakan Vanilla JS (`IntersectionObserver` atau event scroll) sehingga saat user menggulir seksi di sisi kanan (misal dari Hero -> Pasangan -> Acara -> Galeri -> Penutup), panel kiri bereaksi secara visual:
      a. Foto atau background di sisi kiri berganti/fade halus sesuai seksi yang sedang aktif (`transition-opacity duration-700`), ATAU
      b. Teks chapter, monogram inisial, dan indikator seksi di sisi kiri berganti dan menyala mengikuti posisi scroll konten utama di sisi kanan.
    - **Sisi Kanan (50% Scrollable):** Alur kartu undangan utama yang dapat digulir dengan mulus (`max-w-[480px] mx-auto py-12 px-6`).
  * **Layar Mobile (<1024px):**
    - Sisi kiri otomatis disembunyikan (`hidden lg:block`).
    - Seluruh konten dan foto di sisi kanan tampil mulus sebagai 1 kolom penuh smartphone.

- [ ] **OPSI B (Centered Luxury Frame):**
  * Layar Desktop maupun Mobile berupa kartu terpusat di tengah monitor (`max-w-[440px] mx-auto`) dengan latar belakang ambient layar lebar yang tenang, dihiasi motif blur/tekstur lembut.

---

### 3. FITUR INTERAKTIF & DOCK NAVIGASI SCROLL-SPY:
1. **Pintu Pembuka (Gate Cover):**
   - Halaman pembuka full-screen dengan ID `#gate-cover` dan tombol buka ID `#btn-open-invitation`. Saat diklik, cover menghilang dengan transisi animasi geser/fade yang halus.
2. **Dock Navigasi Melayang (Floating Dock Bar):**
   - Bar navigasi elegan di bagian bawah layar yang memiliki link pintasan: `#home`, `#couple`, `#event`, `#gift`, `#rsvp`.
   - Tombol aktif pada dock navigasi otomatis berpindah (highlight) sesuai posisi seksi yang sedang dilihat user (Scroll-Spy).
3. **Fitur Pelengkap Standar:**
   - **Tamu Personalisasi:** `#guest-name` (mengambil dari parameter URL `?to=`) dan badge `#guest-badge` (sembunyi otomatis jika `?notamu=1`).
   - **Pemutar Musik:** Tag `<audio id="audio-player">` dengan tombol mengambang `#audio-toggle-btn`.
   - **Hitung Mundur:** ID `#cd-days`, `#cd-hours`, `#cd-mins`, `#cd-secs` (Target: 2026-11-14T08:00:00+07:00).
   - **Salin Nomor Rekening:** Tombol `#btn-copy-acc` untuk menyalin nomor dari `#acc-num` disertai pop-up toast `#toast-notification`.

---

### 4. KONTRAK DATA SISTEM (ANTI-BENTROK DATABASE):
Tandai teks dinamis dengan atribut `data-bind="..."` agar data klien dapat terhubung otomatis:
1. **Mempelai:**
   - `data-bind="brideName"`, `data-bind="brideFullName"`, `data-bind="brideParents"`
   - `data-bind="groomName"`, `data-bind="groomFullName"`, `data-bind="groomParents"`
2. **Jadwal & Lokasi:**
   - `data-bind="eventDateFormatted"`
   - `data-bind="akadTime"`, `data-bind="akadVenue"`
   - `data-bind="resepsiTime"`, `data-bind="resepsiVenue"`
   - Tautan navigasi: `<a href="https://maps.google.com" target="_blank" data-bind="mapsUrl">`
3. **Tanda Kasih & Ucapan:**
   - `data-bind="bankName"`, `data-bind="accountNumber"`, `data-bind="accountHolder"`
   - `data-bind="quoteText"`, `data-bind="quoteSource"`

---

### 5. ATURAN JAVASCRIPT AMAN (DEFENSIVE SCRIPTING):
- Di bagian `<script>` paling bawah, WAJIB gunakan pengecekan keberadaan elemen sebelum menambahkan event listener:
  ```javascript
  const btn = document.getElementById('btn-copy-acc');
  if (btn) {
    btn.addEventListener('click', () => { ... });
  }
  ```
- Dengan defensive scripting, jika ada fitur yang Anda hilangkan agar desain lebih minimalis, kode tidak akan menimbulkan error di konsol browser.

---

### 6. ATURAN YANG HARUS DIHINDARI:
- **DILARANG menggunakan emoji ponsel/chat biasa** (Jangan gunakan 💍, 👰, 🤵, 💌, 🎉). Gunakan ornamen tipografis berkelas (`✦`, `·`, `—`) atau ikon SVG monolin elegan.
- **DILARANG membuat backend, API, atau endpoint baru.** Semua data prototipe harus murni statis dalam 1 file HTML.
- **DILARANG menggunakan framework JS berat** (React, Vue, jQuery). Gunakan Tailwind CSS CDN v3 + Vanilla JS murni.

Berikan 1 file HTML utuh, lengkap dengan CSS dan JS di dalamnya, yang langsung siap dijalankan di browser!
```
