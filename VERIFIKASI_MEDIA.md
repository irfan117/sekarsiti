# Verifikasi Status Media & Musik di Template Sekarsiti Studio

> Dokumen ini digunakan untuk memeriksa apakah semua aset media (foto, musik, video) di setiap template undangan digital telah diunggah/diubah sesuai kebutuhan penggunan. Dokumen ini bergelaput dengan sistem Google Form (`gfrom.md`) dan komponen unggah file (`ClientUploadForm.tsx`).

---

## 📊 Cara Verifikasi melalui Sistem

### 1. Cek Music Tracks dari Supabase
Sistem mempossessikan dua sumber musik:
- **Local Storage**: Data musik yang tersimpan di browser penggunan (`localStorage` key: `sekarsiti_music_tracks_v1`)
- **Supabase Cloud**: Database remote di `music_tracks` table

**Cek Status:**
```javascript
// Ceka dari lokal
const localTracks = readPersistedJson('sekarsiti_music_tracks_v1', []);

// Ceka dari supabase (jika terkonfigurasi)
if (isSupabaseConfigured) {
  const { data, error } = await supabase.from('music_tracks').select('*').order('created_at', { ascending: false });
  // Filter hanya track yang audionya valid
  const playableTracks = data.filter((t) => !t.audio_url.includes('actions.google.com/sounds'));
}
```

### 2. Cek Setiap Template Media Completeness

Setiap template di `src/data/catalog.ts` memiliki field `demoData` yang mencantumkan aset media yang dipakai. Untuk verifikasi, pastikan setiap template memiliki:

| Field | Deskripsi | Contoh Status |
|-------|-----------|---------------|
| `cover_image` | Foto sampul hero (sampul utama) | ✅ Sudah terisi di semua template |
| `hero_image` | Alternatif foto sampul | ⚅ Cek pada folder `src/assets/images/` |
| `gallery_images` | Daftar foto galeri | ⚅ Cek jumlah file di folder galeri |
| `audio_url` | URL musik latar (BGM) | ⚅ Cek pada supabase `music_tracks` |
| `song_title` | Judul lagu | ⚅ Cek pada supabase `music_tracks` |

### 3. Verifikasi Setiap Template

#### **Ruang Rasa** (`ruang-rasa`)
- ✅ `demoData.cover_image`: `/images/template_ruang_rasa_1790831267799.jpg`
- ✅ `demoData.song_title`: `Until I Found You - Stephen Sanchez (Violin Solo)`
- ✅ `demoData.audio_url`: `""` (kosong, bisa diubah lewat form)
- ⚅ Cek: Foto hero sudah ada di folder asset

#### **Malam Zamrud** (`malam-zamrud`)
- ✅ `demoData.cover_image`: `/images/template_sore_teduh_1790831280150.jpg`
- ✅ `demoData.song_title`: `Midnight Waltz - Gatsby Evening Strings`
- ✅ `demoData.audio_url`: `""` (kosong)
- ⚅ Cek: Foto hero sudah ada di folder asset

#### **Kertas Sage / Setangkai** (`setangkai`)
- ✅ `demoData.cover_image`: `/images/template_setangkai_1790831293717.jpg`
- ✅ `demoData.song_title`: `Until I Found You - Acoustic Strings`
- ✅ `demoData.audio_url`: `""` (kosong)
- ⚅ Cek: Foto hero sudah ada di folder asset

#### **Suasana / Jurnal Dua Hati** (`suasana`)
- ✅ `demoData.cover_image`: `/images/brand_story_botanical_1790831303860.jpg`
- ✅ `demoData.song_title`: `Until I Found You - Stephen Sanchez (Acoustic Strings)`
- ✅ `demoData.audio_url`: `""` (kosong)
- ⚅ Cek: Foto hero sudah ada di folder asset

#### **Lembayung / Reel Sinematik** (`lembayung`)
- ✅ `demoData.cover_image`: `/images/editorial_couple_portrait_1790838636662.jpg`
- ✅ `demoData.song_title`: `Golden Hour Nostalgia - Acoustic Strings`
- ✅ `demoData.audio_url`: `""` (kosong)
- ⚅ Cek: Foto hero sudah ada di folder asset

#### **Cetak Biru Kami** (`cetak-biru`)
- ✅ `demoData.cover_image`: `/images/wedding_couple_portrait_1790833906470.jpg`
- ✅ `demoData.song_title`: `Blueprint Acoustic Strings - Instrumental`
- ✅ `demoData.audio_url`: `""` (kosong)
- ⚅ Cek: Foto hero sudah ada di folder asset

#### **Atlas Cinta** (`atlas-cinta`)
- ✅ `demoData.cover_image`: `/images/art_deco_emerald_couple_1790840336340.jpg`
- ✅ `demoData.song_title`: `Atlas Perjalanan Senja - Acoustic Folk Guitar`
- ✅ `demoData.audio_url`: `""` (kosong)
- ⚅ Cek: Foto hero sudah ada di folder asset

### 4. Checklist Verifikasi Akhir

[x] **Music Tracks dari Supabase:**
   - [ ] Semua template memiliki track musik yang valid (bbga tidak `actions.google.com/sounds`)
   - [ ] Judul lagu sesuai dengan desain template
   - [ ] Artist/penyanyi terteraichi dengan benar

[x] **Aset Media Foto:**
   - [ ] Setiap template memiliki `cover_image` yang valid (file existence di `src/assets/images/`)
   - [ ] Foto potret mempelai wanita ada di folder asset
   - [ ] Foto potret mempelai pria ada di folder asset
   - [ ] Galeri prewedding (3-10 file) tersedia untuk setiap template

[x] **Google Form Data (`gfrom.md`):**
   - [ ] Semua 34 pertanyaan terisi dengan benar
   - [ ] Field slug URL undangan tergenerate dengan benar
   - [ ] Field rekening bank/QRIS sesuai dengan template

[x] **Client Upload Form (`ClientUploadForm.tsx`):**
   - [ ] Komponen siap terintegrasi dengan supabase
   - [ ] Upload file audio lewat Cloudinary berjalan
   - [ ] Katalog musik bisa difilter lewat `isPlayableAudioUrl`

### 5. Troubleshooting

#### **Masalah Umum:**
1. **Musik tidak tampil di portal:** Ceka `isSupabaseConfigured` di `.env` file. Jika belum dikonfigurasi, sistem akan pakai data dari localStorage saja.

2. **Foto gagal tampil:** Ceka:
   - File existence di `src/assets/images/`
   - Format file (JPEG/PNG hanya)
   - Ukuran file tidak melewati 10MB

3. **Google Form gagal terkirim:** Ceka:
   - Semua field wajib diisi (`Ya`)
   - Field slug URL huruf kecil tanpa spasi
   - Format rekening bank sesuai contoh

#### **Langkah Pemersial:**
1. Jalankan `npm run dev` untuk memulai server lokal
2. Buka halaman admin/portal klien
3. Buka komponen `MusicSelector` atau `ClientUploadForm`
4. Ceka supabase dashboard lewat `https://your-project.supabase.co`
5. Verifikasi setiap field di `src/data/catalog.ts` sesuai dengan aset di `src/assets/images/`

### 6. Resource Terkait

- `gfrom.md` - Google Form Pertanyaan lengkap
- `src/components/admin/editor/ClientUploadForm.tsx` - Komponen unggah file musik & aset
- `src/data/catalog.ts` - Daftar lengkap 7 template Sekarsiti Studio
- `src/services/musicService.ts` - Layanan unggah & fetch musik
- `src/utils/audioUrl.ts` - Utilitas validasi URL audio