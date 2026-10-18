# Formulir Pemesanan & Pengumpulan Data Undangan Pernikahan Digital
> Dokumen ini disusun presisi sesuai seluruh 7 template aktif proyek **Sekarsiti Studio** (`src/data/catalog.ts`): **Ruang Rasa, Malam Zamrud, Kertas Sage / Setangkai, Suasana (Jurnal Dua Hati), Lembayung (Reel 35mm), Cetak Biru Kami (Blueprint Arsitektur), dan Atlas Cinta (Jurnal Perjalanan)**.

---

## ⚙️ Pengaturan Rekomendasi Google Form
1. **Kumpulkan Alamat Email:** Aktifkan (*Collect email addresses*) untuk identifikasi pemilik pesanan.
2. **Kirim Salinan Respon:** Aktifkan (*Send responders a copy of their response*) agar pengantin menyimpan bukti data.
3. **Ukuran Maksimum Upload File:** Set minimal **1 GB - 10 GB** (karena ada opsi upload file foto prewedding & file Excel daftar tamu).
4. **Notifikasi Email:** Aktifkan notifikasi email bagi admin jika ada respon baru.

---

## 📚 Cara Mengambil Daftar Lagu dari Supabase

> Admin dapat mengambil daftar semua lagu yang sudah terupload ke database Supabase tabel `music_tracks`. Data ini bisa digunakan untuk:
> - Memudahkan pemilihan musik di Google Form question #25
> - Referensi saat mengedit undangan client
> - Katalog musik yang bisa dipilih ulang-keliput

**Query SQL untuk mengambil daftar lengkap:**
```sql
SELECT 
  id, 
  title, 
  artist, 
  audio_url, 
  genre, 
  source,
  created_at
FROM music_tracks 
ORDER BY created_at DESC;
```

**Contoh hasil pengambilan data (JSON):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7g8h-9i10-jk1l2m3n4o5p",
    "title": "Until I Found You",
    "artist": "Stephen Sanchez",
    "audio_url": "https://res.cloudinary.com/sekarsiti/video/upload/sample.mp3",
    "genre": "Romantic",
    "source": "admin",
    "created_at": "2026-10-01T10:30:00Z"
  },
  {
    "id": "b2c3d4e5-f6a7-8h9i-0j1k-2l3m4n5o6p7q", 
    "title": "Midnight Waltz",
    "artist": "Gatsby Evening Strings",
    "audio_url": "https://res.cloudinary.com/sekarsiti/video/upload/sample2.mp3",
    "genre": "Classical",
    "source": "admin",
    "created_at": "2026-09-28T14:15:00Z"
  }
]
```

**Cara menggunakan di Google Form:**
1. Jalankan query di atas di Supabase Dashboard atau melalui API
2. Dapatkan list `title` dari setiap record
3. Masukkan judul lagu yang sesuai ke **Question #25: Judul Lagu / Musik Latar (BGM Undangan)** di Google Form
4. *(Opsional)* Jika klien ingin mendengar pratinjau, URL `audio_url` bisa disimpan di panel admin tersembunyi atau dikirim ke klien melalui channel lain

---

## 📝 BAGIAN 1: INFORMASI PEMESAN & PILIHAN TEMPLATE
*Deskripsi:* Silakan isi identitas utama pemesan dan tentukan pilihan tema desain undangan digital pernikahan Anda.

1. **Nama Pasangan / Judul Undangan**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Ya  
   - **Contoh:** Kirana & Adhitya (atau: Bagas & Nirmala / Alya & Damar)  

2. **Nomor WhatsApp Pemesan (Aktif)**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Ya  
   - **Panduan:** Sertakan nomor WhatsApp aktif untuk koordinasi revisi, pengiriman draf preview, dan informasi akses portal. Contoh: `081234567890`  

3. **Email Pemesan**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Ya  
   - **Panduan:** Email aktif untuk pengiriman kredensial Portal Klien & tautan undangan resmi.  

4. **Pilihan Desain Template (7 Seri Utama Sekarsiti Studio)**  
   - **Tipe:** Pilihan Ganda (*Multiple choice*)  
   - **Wajib diisi:** Ya  
   - **Pilihan Opsi:**  
     - [ ] **Ruang Rasa** (`ruang-rasa`) — *Seri Editorial Modern & Tipografi Monokrom Clean*  
     - [ ] **Malam Zamrud** (`malam-zamrud`) — *Art Deco Emerald Mewah, Motif Kipas Sunburst & Aksesories Kuningan*  
     - [ ] **Kertas Sage / Setangkai** (`setangkai`) — *Botanical Organik, Kertas Gading & Hijau Sage Soft*  
     - [ ] **Suasana / Jurnal Dua Hati** (`suasana`) — *Buku Jurnal 3D Lipat Buka, Linimasa Bergaris & Polaroid Vintage*  
     - [ ] **Lembayung / Reel Sinematik** (`lembayung`) — *Gerbang Dua Pintu, Pita Filmstrip 35mm & Tiket Bioskop Perforasi*  
     - [ ] **Cetak Biru Kami** (`cetak-biru`) — *Blueprint Arsitektur Cyanotype, Garis Ukur Interaktif & Denah SVG*  
     - [ ] **Atlas Cinta** (`atlas-cinta`) — *Jurnal Perjalanan & Kartu Pos Ekspeditif, Boarding Pass & Peta Topografi*  
     - [ ] **Lainnya / Konsultasi Khusus via WhatsApp**  

5. **Keinginan URL / Link Undangan (Slug)**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Ya  
   - **Panduan:** Masukkan nama panggilan singkat untuk tautan web, huruf kecil tanpa spasi & tanpa simbol khusus.  
   - **Contoh:** `kirana-adhitya` *(menjadi: sekarsitwed.com/kirana-adhitya)*  

---

## 👰 BAGIAN 2: DATA MEMPELAI WANITA
*Deskripsi:* Informasi lengkap mempelai wanita untuk ditampilkan pada section profil pasangan.

6. **Nama Panggilan Mempelai Wanita**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Ya  
   - **Contoh:** Kirana / Alya / Larasati / Wulan / Nirmala  

7. **Nama Lengkap & Gelar Mempelai Wanita**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Ya  
   - **Contoh:** Kirana Ayu Lestari, S.Ds.  

8. **Keterangan Orang Tua Mempelai Wanita**  
   - **Tipe:** Paragraf (*Paragraph*)  
   - **Wajib diisi:** Ya  
   - **Contoh:** Putri pertama dari Bapak Hendra Wijaya & Ibu Sinta Maharani *(Sebutkan (Alm.) jika salah satu/kedua orang tua telah berpulang)*  

9. **Username Instagram Mempelai Wanita (Opsional)**  
   - **Tipe:** Jawaban Singkat (*Short answer*)  
   - **Wajib diisi:** Tidak  
   - **Contoh:** `@kiranaayuu` *(Kosongkan jika tidak ingin ditampilkan)*  

---

## 🤵 BAGIAN 3: DATA MEMPELAI PRIA
*Deskripsi:* Informasi lengkap mempelai pria untuk ditampilkan pada section profil pasangan.

10. **Nama Panggilan Mempelai Pria**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Adhitya / Damar / Fajar / Dimas / Bagas  

11. **Nama Lengkap & Gelar Mempelai Pria**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Adhitya Nugraha, B.Eng.  

12. **Keterangan Orang Tua Mempelai Pria**  
    - **Tipe:** Paragraf (*Paragraph*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Putra kedua dari Bapak Suryanto Nugraha & Ibu Ratna Dewi *(Sebutkan (Alm.) jika salah satu/kedua orang tua telah berpulang)*  

13. **Username Instagram Mempelai Pria (Opsional)**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Tidak  
    - **Contoh:** `@adhityanugraha` *(Kosongkan jika tidak ingin ditampilkan)*  

---

## 📅 BAGIAN 4: JADWAL & LOKASI RANGKAIAN ACARA
*Deskripsi:* Detail jadwal acara akad/pemberkatan dan resepsi yang diintegrasikan ke fitur Google Maps & Google Calendar.

14. **Hari & Tanggal Acara**  
    - **Tipe:** Jawaban Singkat (*Short answer*) atau Tanggal (*Date*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Minggu, 14 Februari 2027  

15. **Waktu Akad Nikah / Pemberkatan**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** `08.00 – 09.30 WIB`  

16. **Nama Tempat / Ruangan Akad Nikah**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Ruang Bimasena, Aryaduta Hotel Jakarta  

17. **Waktu Resepsi Pernikahan**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** `11.00 – 14.00 WIB` (atau: `18.30 – 21.00 WIB`)  

18. **Nama Tempat / Gedung / Ballroom Resepsi**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Grand Ballroom, Aryaduta Hotel Jakarta  

19. **Kota & Wilayah Lokasi Acara**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Contoh:** Jakarta Selatan (atau: Sleman, Yogyakarta / Bandung)  

20. **Link Google Maps Titik Lokasi**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Panduan:** Buka Google Maps > Klik 'Bagikan' > Pilih 'Salin Tautan'.  
    - **Contoh:** `https://maps.app.goo.gl/aryadutajakarta`  

21. **Catatan Acara / Dress Code / Protokol (Opsional)**  
    - **Tipe:** Paragraf (*Paragraph*)  
    - **Wajib diisi:** Tidak  
    - **Contoh:** *Dresscode: Earth Tone & Pastel. Mohon hadir 15 menit sebelum acara dimulai.*  

---

## 💳 BAGIAN 5: AMPLOP DIGITAL, LAGU LATAR & KUTIPAN PERNIKAHAN
*Deskripsi:* Pengaturan fitur penerimaan hadiah/amplop digital, musik latar belakang (BGM), serta ayat suci atau doa pernikahan.

22. **Rekening Utama / Bank 1**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Format:** Nama Bank - Nomor Rekening - Atas Nama Pemilik  
    - **Contoh:** `BCA - 8271029384 - Kirana Ayu Lestari`  

23. **Rekening Cadangan / Bank 2 (Opsional)**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Tidak  
    - **Format:** Nama Bank - Nomor Rekening - Atas Nama Pemilik  
    - **Contoh:** `Mandiri - 1400099887766 - Adhitya Nugraha`  

24. **Alamat Kirim Kado Fisik (Opsional)**  
    - **Tipe:** Paragraf (*Paragraph*)  
    - **Wajib diisi:** Tidak  
    - **Contoh:** Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan (UP: Kirana - 081288990011)  

25. **Judul Lagu / Musik Latar (BGM Undangan)**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Ya  
    - **Cara Mengisi dari Database Supabase:**  
      1. Admin dapat mengambil daftar lagu dari tabel `music_tracks` di Supabase dengan query:  
         ```sql
         SELECT title, artist, audio_url FROM music_tracks ORDER BY created_at DESC;
         ```  
      2. Daftar lagu akan tampak seperti di bawah ini, dan admin memilih judul yang sesuai:  
      
      | ID | Judul Lagu | Artis | (Audio URL) |
      |----|------------|-------|-------------|
      | 1  | Until I Found You | Stephen Sanchez | `https://res.cloudinary.com/...` |
      | 2  | Midnight Waltz | Gatsby Evening Strings | `https://res.cloudinary.com/...` |
      | ...| ... | ... | ... |
      | 
      3. Masukkan **Judul Lagu** yang dipilih ke dalam field ini.  
      4. *(Opsional)* Jika perlu menyimpan URL audio, admin bisa menambahkannya ke field tambahan di bawah ini atau menyimpannya di lokal.  
    - **Contoh:** *Until I Found You - Stephen Sanchez (Violin Solo / Acoustic)* / *Midnight Waltz - Gatsby Evening Strings*  

26. **Kutipan Ayat Suci / Doa Pernikahan / Quote Romantis**  
    - **Tipe:** Paragraf (*Paragraph*)  
    - **Wajib diisi:** Ya  
    - **Contoh:**  
      - *Teks:* "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri..."  
      - *Sumber:* QS. Ar-Rum: 21  

---

## 🖼️ BAGIAN 6: UPLOAD ASET FOTO & MEDIA LENGKAP
*Deskripsi:* Unggah foto-foto terbaik Anda. Kompatibel dengan semua komponen galeri & hero di template Sekarsiti.

27. **Foto Sampul Utama / Hero Image (1 File)**  
    - **Tipe:** Unggah File (*File upload*)  
    - **Batas Maksimum:** 1 File | **Maks Size:** 10 MB  
    - **Wajib diisi:** Ya  
    - **Panduan:** Foto berdua terbaik (Lanskap 16:9 atau Potret Vertikal) untuk tampilan utama/sampul pembuka.  

28. **Foto Potret Tunggal Mempelai Wanita (1 File)**  
    - **Tipe:** Unggah File (*File upload*)  
    - **Batas Maksimum:** 1 File | **Maks Size:** 10 MB  
    - **Wajib diisi:** Ya  
    - **Panduan:** Foto potret tunggal mempelai wanita (rasio 3:4 atau vertikal).  

29. **Foto Potret Tunggal Mempelai Pria (1 File)**  
    - **Tipe:** Unggah File (*File upload*)  
    - **Batas Maksimum:** 1 File | **Maks Size:** 10 MB  
    - **Wajib diisi:** Ya  
    - **Panduan:** Foto potret tunggal mempelai pria (rasio 3:4 atau vertikal).  

30. **Foto Galeri Prewedding & Momen Berdua (3 - 10 File)**  
    - **Tipe:** Unggah File (*File upload*)  
    - **Batas Maksimum:** 10 File sekaligus | **Maks Size:** 10 MB per file  
    - **Wajib diisi:** Ya  
    - **Panduan:** Kumpulan foto prewedding / kebersamaan untuk slider galeri, lightbox polaroid, & linimasa.  

31. **Foto QRIS Pembayaran / Gambar Barcode (Opsional)**  
    - **Tipe:** Unggah File (*File upload*)  
    - **Batas Maksimum:** 1 File | **Maks Size:** 10 MB  
    - **Wajib diisi:** Tidak  
    - **Panduan:** Foto/screenshot QRIS (Gopay/OVO/ShopeePay/Bank) untuk amplop digital.  

32. **Link Folder Google Drive Cadangan (Opsional)**  
    - **Tipe:** Jawaban Singkat (*Short answer*)  
    - **Wajib diisi:** Tidak  
    - **Panduan:** Tautan folder Drive jika foto Anda berukuran sangat tinggi atau ingin menyertakan musik MP3 khusus. Pastikan akses folder diatur ke *"Anyone with the link / Siapa saja yang memiliki link"*.  

---

## 👥 BAGIAN 7: SEBAR TAUTAN & DAFTAR TAMU UNDANGAN
*Deskripsi:* Tentukan skema penyebaran undangan kepada kerabat & sahabat Anda.

33. **Pilihan Mode Penyebaran Tautan Undangan**  
    - **Tipe:** Pilihan Ganda (*Multiple choice*)  
    - **Wajib diisi:** Ya  
    - **Pilihan Opsi:**  
      - [ ] **Satu Link untuk Semua (Tanpa Nama Tamu):** Cukup 1 tautan utama untuk disebar secara umum/grup WA.  
      - [ ] **Tautan Nama Tamu Khusus (Personal):** Setiap tamu menerima link unik berisikan nama mereka di sampul (misal: `?to=Bapak+Joko+Sekeluarga`).  
      - [ ] **Kelola Mandiri via Portal Mempelai:** Klien akan mengunduh template Excel dan mengunggah sendiri nama-nama tamu di portal portal klien Sekarsiti.  

34. **Upload File Excel / CSV Daftar Nama Tamu (Opsional)**  
    - **Tipe:** Unggah File (*File upload*)  
    - **Batas Maksimum:** 1 File (.xlsx / .csv)  
    - **Wajib diisi:** Tidak  
    - **Panduan:** Format file minimal berisi kolom: **Nama Tamu**, **Nomor WhatsApp (opsional)**, **Kategori (opsional)**. Tim kami akan bantu mengimpor daftar tamu tersebut.  

---

## 📲 TEMPLATE PESAN CHAT WHATSAPP KE KLIEN
*(Salin pesan di bawah ini untuk dikirimkan kepada calon pengantin via WhatsApp)*

```text
Halo Kak [Nama Klien]! ✨
Terima kasih telah memilih Sekarsiti Studio untuk hari istimewa Kakak. 🌿

Agar tim kami dapat langsung merancang dan memproses pembuatan undangan digital pernikahan Kakak secara presisi, silakan mengisi **Google Form Pengumpulan Data & Aset** melalui link berikut:

👉 Link Google Form: [TEMPEL LINK GOOGLE FORM DI SINI]

📋 **Aset & Data yang Perlu Disiapkan:**
1. Pilihan Seri Template (Ruang Rasa, Malam Zamrud, Kertas Sage, Suasana, Lembayung, Cetak Biru, atau Atlas Cinta)
2. Nama Panggilan & Nama Lengkap + Gelar Pasangan serta Orang Tua
3. Detail Waktu & Lokasi Akad/Resepsi (termasuk titik Google Maps)
4. Rekening Bank / QRIS untuk Amplop Digital
5. Foto Sampul (Hero), Foto Potret Mempelai, & 3–10 Foto Galeri Prewedding
6. Judul Lagu Latar (BGM) & Kutipan Ayat/Doa

 Apabila foto-foto Kakak ada di Google Drive, Kakak juga bisa langsung menempelkan link Drive di dalam form tersebut (pastikan akses folder diatur ke "Anyone with the link").

Silakan kabari kami jika formulir sudah selesai diisi ya Kak. Terima kasih banyak! 🙏✨
```
