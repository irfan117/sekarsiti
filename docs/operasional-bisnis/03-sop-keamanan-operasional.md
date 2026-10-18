# SOP Pengerjaan, Keamanan, dan Kontrol Operasional

## Sebelum menerima pesanan rutin

- Pastikan harga katalog cocok dengan harga yang dikirim admin.
- Tetapkan isi paket, biaya tambahan, batas revisi, masa aktif, dukungan, refund, dan perpanjangan.
- Buat jadwal kapasitas mingguan dan batasi slot sesuai waktu kerja nyata.
- Buat checklist data wajib dan contoh isian agar client tidak perlu mengulang.
- Sediakan kanal resmi, jam layanan, serta identitas usaha/kontak yang konsisten.
- Pastikan demo dapat dibuka di ponsel dan CTA pemesanan bekerja.

## Checklist setiap order

### Saat order masuk

- [ ] ID order, kontak, template, harga, dan sumber lead tercatat.
- [ ] Syarat layanan dan pembayaran dikirim tertulis.
- [ ] Pembayaran diverifikasi dari rekening/payment provider.
- [ ] Bukti transaksi dan tanggal konfirmasi tersimpan.
- [ ] Status order diperbarui dan ada tanggal tindak lanjut.

### Saat pengerjaan

- [ ] Data wajib lengkap dan aset dapat digunakan.
- [ ] Nama, tanggal, waktu, lokasi, Maps, detail rekening, dan ejaan diperiksa.
- [ ] Draft diuji di ponsel dan desktop.
- [ ] Revisi dicatat dan persetujuan final disimpan.
- [ ] Tidak ada data demo tertinggal di undangan client.

### Saat selesai

- [ ] Pelunasan diverifikasi sesuai kesepakatan.
- [ ] Tautan final dan instruksi penggunaan dikirim privat.
- [ ] Masa aktif, dukungan, dan cara melaporkan masalah dijelaskan.
- [ ] Backup order/data penting diperbarui dan dapat dipulihkan.
- [ ] Testimoni/portfolio diminta terpisah dari persetujuan layanan.

## Keamanan data dan akun

- Pakai kata sandi unik dan autentikasi multifaktor untuk email, Supabase, hosting, domain, dan akun pembayaran bila tersedia.
- Beri akses admin hanya kepada orang yang membutuhkannya. Cabut akses saat tidak diperlukan.
- Jangan kirim password admin, PIN portal, secret key, atau OTP lewat grup.
- Jangan taruh secret/service-role key di frontend atau repository. Simpan di environment server yang sesuai.
- Gunakan PIN unik per client; hindari PIN contoh/default.
- Simpan data rekening dan kontak hanya untuk tujuan pesanan. Jangan masukkan ke konten publik atau screenshot promosi.
- Atur retensi dan hapus/arsipkan data saat tujuan layanan selesai sesuai kebijakan yang ditetapkan.
- Simpan backup terenkripsi di lokasi terpisah. Uji pemulihan berkala.
- Siapkan langkah insiden: batasi akses, ganti kredensial terdampak, simpan catatan kejadian, dan beri tahu pihak terkait sesuai kewajiban yang berlaku.

## Privasi dan portfolio

- Persetujuan menampilkan karya harus eksplisit, terpisah, dan dapat ditolak tanpa mengurangi layanan.
- Jelaskan apa yang ditampilkan: nama, foto, tanggal, kota, kutipan, atau tautan undangan.
- Jangan menganggap pembayaran atau persetujuan undangan berarti izin promosi.
- Catat tanggal, cakupan, dan bukti persetujuan. Hormati pencabutan izin dan hapus materi sesuai proses yang disepakati.
- Pastikan client memiliki hak memakai foto, musik, font, dan aset yang dikirim. Gunakan aset berlisensi untuk penggunaan yang dimaksud.
- Tinjau alur portfolio aplikasi: saat ini item baru dapat diberi `isPublished` dan `isClientApproved` bernilai `true` otomatis. Ubah default menjadi tersembunyi dan catat approval sebelum publikasi.

## Kontrol keuangan sederhana

- Pisahkan rekening usaha dan pribadi bila memungkinkan.
- Catat pemasukan, biaya provider, aset, refund, dan komisi referral.
- Rekonsiliasi order dan transaksi minimal sekali seminggu.
- Sisihkan cadangan untuk pajak, refund, biaya tahunan, dan bulan dengan pesanan rendah.
- Hitung margin per template/jenis order sebelum memberi diskon.
- Jangan menganggap DP sebagai laba; pekerjaan dan kewajiban layanan masih berjalan.

## Kapasitas dan kualitas

- Sisihkan waktu untuk komunikasi, input data, pengerjaan, review, revisi, dan dukungan setelah publish.
- Beri buffer antara tenggat internal dan tanggal janji ke client.
- Jika antrean penuh, beri tanggal mulai yang realistis atau tutup slot sementara.
- Gunakan checklist untuk setiap template; tambahkan pemeriksaan animasi, audio, RSVP, Maps, dan hadiah.
- Simpan catatan bug dan waktu penyelesaian. Perbaiki masalah berulang sebelum menambah promosi.

## Review mingguan 30 menit

1. Berapa lead masuk, dari mana, dan berapa yang membayar?
2. Pesanan mana yang terlambat/revisi berulang, dan apa penyebabnya?
3. Apakah ada transaksi yang belum cocok atau data order belum tersimpan?
4. Apakah kapasitas minggu depan aman?
5. Satu perubahan apa yang diuji minggu depan?

## Gerbang sebelum skala atau iklan berbayar

- [ ] Pesanan dapat ditemukan setelah browser/perangkat berganti.
- [ ] Backup bisa dipulihkan dan akses admin terlindungi.
- [ ] Form order, WhatsApp, dan dashboard memberi status konsisten.
- [ ] Syarat pembayaran, revisi, pembatalan, privasi, dan masa aktif siap dibagikan.
- [ ] Waktu pengerjaan aktual diketahui dari beberapa pesanan selesai.
- [ ] Ada kapasitas menangani volume tambahan dan dukungan pascapublish.

Jika satu gerbang kritis belum terpenuhi, rapikan proses itu sebelum menaikkan anggaran iklan atau menerima lebih banyak pesanan.

