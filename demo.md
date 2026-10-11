# Rencana implementasi portfolio demo / showcase dari undangan published

## Tujuan
Membuat sistem showcase portfolio yang berbasis undangan client yang sudah published, bukan hanya template demo statis. Tujuan utamanya:
- admin tidak perlu mengandalkan dummy template untuk katalog demo
- hasil undangan client asli bisa dipakai sebagai portofolio
- musik, foto, quote, dan aset lain bisa di-edit tanpa mengubah data undangan utama
- client bisa memberi izin jika ingin tampilan portfolio-nya muncul di katalog

## Prinsip desain
1. Tetap mempertahankan sistem demo template saat ini untuk fallback dan preview awal.
2. Pisahkan data:
   - template default: desain dan preset template
   - undangan client: data real project
   - portfolio showcase: item yang dipilih dari undangan published
3. Client hanya bisa mengedit musik undangan mereka sendiri, bukan daftar musik katalog admin.
4. Admin tetap punya kontrol penuh untuk menambahkan item portfolio dari data published.
5. Jika client tidak memberi izin, item portfolio tetap disimpan sebagai draft/hidden.

## Status saat ini
Saat ini masih dipertahankan mode lama:
- template demo masih memakai data default/file static
- belum ada katalog portfolio client yang live
- belum ada mekanisme publish item showcase dari undangan published

Ini cocok untuk tahap awal agar fitur yang sudah ada tetap stabil sebelum menambahkan portfolio showcase.

## Rencana implementasi (fase 1)

### 1. Definisikan model portfolio showcase
Buat model baru, misalnya:
- `portfolio_items`
- field utama:
  - id
  - title
  - slug
  - source_invitation_id
  - template_id
  - cover_image
  - hero_image
  - gallery_images
  - song_title
  - audio_url
  - quote_text
  - quote_source
  - bride_name
  - groom_name
  - event_date
  - city
  - is_published
  - is_client_approved
  - created_at
  - updated_at

Tujuan: item portfolio bisa dibuat dari undangan published tanpa mengubah data undangan utama.

### 2. Tambahkan mekanisme admin publish ke showcase
Pada halaman daftar undangan published, admin bisa menekan tombol:
- "Jadikan Portfolio"
- atau "Tambah ke Showcase"

Setelah itu:
- sistem membuat item portfolio baru dari data undangan aktif
- tetap menjaga data undangan utama sebagai sumber asli
- admin bisa edit item portfolio tanpa merusak undangan client

### 3. Opsi edit aset portfolio terpisah
Portfolio item memiliki field yang bisa diubah secara independen, misalnya:
- cover image
- hero image
- gallery images
- musik demo
- quote
- title
- subtitle
- nama mempelai

Ini dibuat agar portfolio bisa diedit tanpa ikut mengubah undangan asli.

### 4. Tambahkan approval client
Tambahkan flag:
- `is_client_approved`
- default false

Fitur:
- admin bisa mengirim permintaan approval ke client
- client menerima dan menyetujui atau menolak
- hanya item dengan approval true yang ditampilkan di katalog public

### 5. Katalog publik hanya menampilkan approved items
Pada landing page katalog demo/portfolio:
- hanya item `is_published = true` dan `is_client_approved = true` yang tampil
- semua item yang masih draft atau tidak disetujui tidak ikut tampil

## Rencana implementasi (fase 2)

### 6. Website katalog memakai portfolio items
Buat sumber data baru untuk katalog showcase, bukan lagi `data/catalog.ts` static semata.
- item katalog bisa dipakai dari data real undangan published
- di masa depan bisa juga ikut dengan item dari template default jika dibutuhkan

### 7. Integrasi dengan admin dashboard
Tambah tab atau section admin:
- `Portfolio Showcase`
- list semua item portfolio
- tombol publish/unpublish
- tombol approve client
- tombol edit item
- tombol hapus

### 8. Toleransi backup / fallback
Agar app tetap aman, selama belum ada portfolio client:
- default demo template tetap tetap dipertahankan
- portfolio showcase hanya aktif setelah item dibuat admin

## Flow admin saat ini (jangan buru-buru diubah)
1. Admin tetap mengatur default musik demo template dari editor template aktif.
2. Admin masih bisa mengelola daftar musik katalog admin.
3. Belum ada portfolio client yang ditampilkan.
4. Setelah ada client yang diizinkan, baru fase 1 diterapkan.

## Kriteria sukses
- Admin dapat menyiapkan portfolio dari undangan published tanpa mengubah data undangan utama.
- Aset showcase (musik, foto, quote) bisa diedit terpisah.
- Client bisa memberi izin agar hasilnya muncul di katalog.
- Katalog public tidak menampilkan item yang belum disetujui.
- Sistem tetap aman dan tidak mengganggu flow undangan yang sudah berjalan.

## Prioritas implementasi
### Prioritas tinggi
- model `portfolio_items`
- UI admin "Jadikan Portfolio"
- flag approval client
- filtering katalog public

### Prioritas menengah
- edit portfolio item di admin
- upload aset portfolio dari admin
- preview tiap item di katalog

### Prioritas rendah
- integrasi client approval UI lengkap
- export portfolio ke file/JSON
- automasi publish berkala

## Catatan teknis
- Gunakan pola yang sama seperti sistem `music_tracks`: data publik bisa dibaca, tapi write hanya untuk user authenticated.
- Jaga agar data portfolio tidak langsung menimpa data undangan utama.
- Jika nanti dibuat, sebaiknya portfolio items dipisah ke tabel baru agar tidak membebani tabel `invitations`.

## Kesimpulan
Langkah yang paling aman saat ini adalah tetap mempertahankan demo template lama, lalu menyiapkan fondasi portfolio sebagai fase berikutnya. Dengan demikian, sistem tidak terganggu dan tetap siap ketika ada client yang ingin dijadikan showcase/portfolio.
