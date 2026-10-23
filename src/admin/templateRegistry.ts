import { TemplateId, ClientInvitationData } from '../types/clientInvitation';

export interface MediaSlotDefinition {
  key: string;
  label: string;
  description: string;
  aspectRatio: string;
  recommendedCount?: string;
  isMultiple?: boolean;
  acceptsVideo?: boolean;
  videoOnly?: boolean;
}

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  styleLabel: string;
  demoComponentKey: string;
  coverThumbnail: string;
  description: string;
  mediaSlots: MediaSlotDefinition[];
  hasDresscode: boolean;
  hasFilmstrip: boolean;
  hasStoryChapters: boolean;
  hasWaxSeal: boolean;
  defaultData: Partial<ClientInvitationData>;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  'ruang-rasa': {
    id: 'ruang-rasa',
    name: 'Seri Editorial Modern (Ruang Rasa)',
    styleLabel: 'Modern Minimalis & Archival Broadsheet',
    demoComponentKey: 'editorial',
    coverThumbnail: '/images/editorial_couple_portrait_1790838636662.jpg',
    description: 'Estetika editorial majalah fine-art dengan tipografi Fraunces klasik, tata letak terbuka bebas kotak, dan esai foto babak perjalanan.',
    hasDresscode: false,
    hasFilmstrip: false,
    hasStoryChapters: true,
    hasWaxSeal: true,
    mediaSlots: [
      {
        key: 'heroImage',
        label: 'Foto / Poster Video Hero (Sampul & Pembuka)',
        description: 'Tampil sebagai latar utama di sampul pembuka dan Section 01 Pembuka (bisa unggah Foto maupun Video MP4/WebM)',
        aspectRatio: '16:9 atau 4:5',
        acceptsVideo: true
      },
      {
        key: 'heroVideo',
        label: 'Video Latar Sinematik Hero (Opsional)',
        description: 'Unggah video prewedding (.mp4 / .webm) jika ingin latar bergerak di Section 01 Pembuka (jika dikosongkan, otomatis menampilkan Foto Hero di atas)',
        aspectRatio: '16:9',
        acceptsVideo: true,
        videoOnly: true
      },
      {
        key: 'bridePortrait',
        label: 'Foto Mempelai Wanita (The Bride)',
        description: 'Potret mempelai wanita pada Section 02 Mempelai & Keluarga',
        aspectRatio: '3:4'
      },
      {
        key: 'groomPortrait',
        label: 'Foto Mempelai Pria (The Groom)',
        description: 'Potret mempelai pria pada Section 02 Mempelai & Keluarga',
        aspectRatio: '3:4'
      },
      {
        key: 'galleryImages',
        label: 'Galeri Momen Editorial (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh foto prewedding/momen perayaan sebanyak apa pun. Otomatis tampil di Galeri Momen (Section 07) sekaligus menjadi sumber foto Panel Kiri Desktop, Spotlight, & Penutup.',
        aspectRatio: 'Bebas (3:4 / 4:3 / 16:9)',
        isMultiple: true
      },
      {
        key: 'leftPanelImages',
        label: 'Koleksi Foto Panel Kiri Desktop / Monograf 35mm (Bebas Jumlah · Opsional)',
        description: 'Unggah foto khusus untuk Panel Kiri (Kuratorial, Klise Proof, Reel Sinema, & Spotlight). Jika dikosongkan, Panel Kiri otomatis menampilkan seluruh foto asli yang diupload admin di atas.',
        aspectRatio: '4:3 atau 16:9',
        isMultiple: true
      },
      {
        key: 'spotlightImage',
        label: 'Foto Pembatas Momen / Spotlight (Section 04 · Opsional)',
        description: 'Foto latar penuh pada jeda puitis Section 04 Momen (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '3:4 atau 16:9'
      },
      {
        key: 'closingImage',
        label: 'Foto Latar Penutup / Closing (Section 11 · Opsional)',
        description: 'Foto latar penuh pada bagian akhir ucapan terima kasih Section 11 (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '3:4 atau 16:9'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Section 08 · Opsional)',
        description: 'Gambar kode QRIS untuk modal Tampilkan QRIS pada bagian Tanda Kasih',
        aspectRatio: '1:1'
      },
      {
        key: 'waxSealEmblem',
        label: 'Emblem Segel Lilin Pembuka & Monograf (Opsional)',
        description: 'Gambar segel/monogram bulat pada tombol Buka Undangan dan kolofon Panel Kiri',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Kirana',
      brideFullName: 'Kirana Ayu Lestari, S.Ds.',
      brideParents: 'Putri pertama dari Bapak Hendra Wijaya & Ibu Sinta Maharani',
      brideInstagram: '@kiranaayuu',
      groomName: 'Adhitya',
      groomFullName: 'Adhitya Nugraha, B.Eng.',
      groomParents: 'Putra kedua dari Bapak Suryanto Nugraha & Ibu Ratna Dewi',
      groomInstagram: '@adhityanugraha',
      eventDateFormatted: 'Minggu, 14 Februari 2027',
      countdownIsoDate: '2027-02-14T08:00:00',
      akadTime: '08.00 – 09.30 WIB',
      akadVenue: 'Ruang Bimasena, Aryaduta Hotel',
      resepsiTime: '11.00 – 14.00 WIB',
      resepsiVenue: 'Grand Ballroom, Aryaduta Hotel',
      city: 'Jakarta Selatan',
      mapsUrl: 'https://maps.google.com',
      quoteText: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya, serta menjadikan di antara kamu rasa kasih dan sayang.',
      quoteSource: 'QS. Ar-Rum : 21',
      bankName: 'BCA',
      accountNumber: '8271029384',
      accountHolder: 'Kirana Ayu Lestari',
      songTitle: 'Until I Found You - Stephen Sanchez (Violin Solo)',
      audioUrl: ''
    }
  },

  'malam-zamrud': {
    id: 'malam-zamrud',
    name: 'Malam Zamrud (Art Deco & Emerald)',
    styleLabel: 'Art Deco Megah & Zamrud Malam',
    demoComponentKey: 'malam-zamrud',
    coverThumbnail: '/images/art_deco_emerald_couple_1790840336340.jpg',
    description: 'Kemewahan palet onyx malam dan emas kuningan Art Deco dengan fitur panduan dresscode dan amplop multi-rekening.',
    hasDresscode: true,
    hasFilmstrip: false,
    hasStoryChapters: true,
    hasWaxSeal: false,
    mediaSlots: [
      {
        key: 'heroImage',
        label: 'Foto / Poster Video Hero Onyx Art Deco',
        description: 'Latar pembuka suasana malam megah ballroom (bisa unggah Foto maupun Video MP4/WebM)',
        aspectRatio: '16:9',
        acceptsVideo: true
      },
      {
        key: 'heroVideo',
        label: 'Video Latar Hero Malam Zamrud (Opsional)',
        description: 'Unggah video prewedding (.mp4 / .webm) untuk diputar otomatis di Section Video Hero',
        aspectRatio: '16:9',
        acceptsVideo: true,
        videoOnly: true
      },
      {
        key: 'bridePortrait',
        label: 'Potret Mempelai Wanita Art Deco',
        description: 'Foto potret mempelai wanita berbingkai kubah lengkung',
        aspectRatio: '3:4'
      },
      {
        key: 'groomPortrait',
        label: 'Potret Mempelai Pria Art Deco',
        description: 'Foto potret mempelai pria berbingkai kubah lengkung',
        aspectRatio: '3:4'
      },
      {
        key: 'galleryImages',
        label: 'Galeri Kemewahan Resepsi (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh foto venue, cincin, dan kemewahan resepsi sebanyak apa pun. Otomatis menjadi sumber foto Filmstrip Samping, Spotlight, & Penutup.',
        aspectRatio: '3:4 atau 1:1',
        isMultiple: true
      },
      {
        key: 'leftPanelImages',
        label: 'Koleksi Foto Filmstrip Panel Kiri & Kanan Desktop (Bebas Jumlah · Opsional)',
        description: 'Unggah foto khusus untuk deretan filmstrip vertikal di kiri & kanan layar desktop. Jika dikosongkan, otomatis menampilkan seluruh foto asli yang diupload admin di atas.',
        aspectRatio: '3:4',
        isMultiple: true
      },
      {
        key: 'spotlightImage',
        label: 'Foto Pembatas Momen / Spotlight & Venue (Opsional)',
        description: 'Foto latar untuk bagian Spotlight dan ilustrasi Venue (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '16:9 atau 3:4'
      },
      {
        key: 'closingImage',
        label: 'Foto Latar Penutup / Closing (Opsional)',
        description: 'Foto latar penuh pada bagian akhir ucapan terima kasih (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '16:9 atau 3:4'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Opsional)',
        description: 'Gambar QRIS untuk penerimaan tanda kasih tamu instan',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Kirana',
      brideFullName: 'Kirana Ayu Lestari',
      brideParents: 'Putri tercinta Bapak Hendra Wijaya & Ibu Sinta Maharani',
      groomName: 'Adhitya',
      groomFullName: 'Adhitya Nugraha',
      groomParents: 'Putra tercinta Bapak Suryanto Nugraha & Ibu Ratna Dewi',
      eventDateFormatted: 'Sabtu, 14 Februari 2027',
      countdownIsoDate: '2027-02-14T08:00:00',
      akadTime: '08.00 – 10.00 WIB',
      akadVenue: 'Grand Ballroom Aryaduta Hotel',
      resepsiTime: '11.00 – 14.00 WIB',
      resepsiVenue: 'Grand Ballroom Aryaduta Hotel',
      city: 'Jakarta Selatan',
      mapsUrl: 'https://maps.google.com',
      quoteText: 'Bunga melati tumbuh berseri, mekar indah di taman hati. Dua insan berjanji sehidup semati, menyatu dalam ikatan suci.',
      quoteSource: 'Syair Kasih Klasik',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'Kirana Ayu Lestari',
      secondaryBankName: 'Bank Mandiri',
      secondaryAccountNumber: '140001928374',
      secondaryAccountHolder: 'Adhitya Nugraha',
      songTitle: 'Midnight Waltz - Gatsby Evening Strings',
      audioUrl: ''
    }
  },

  'setangkai': {
    id: 'setangkai',
    name: 'Kertas Sage',
    styleLabel: 'Botanikal Sage & Kertas Gading',
    demoComponentKey: 'damar-alya',
    coverThumbnail: '/images/sage_outdoor_couple_portrait_1790919006777.jpg',
    description: 'Nuansa kertas gading dan dedaunan sage outdoor yang menenangkan dengan panggung desktop interaktif dan wipe-reveal.',
    hasDresscode: false,
    hasFilmstrip: false,
    hasStoryChapters: true,
    hasWaxSeal: false,
    mediaSlots: [
      {
        key: 'heroImage',
        label: 'Foto / Video Hero Sage Outdoor',
        description: 'Potret atau video pasangan di alam terbuka bertema sage green',
        aspectRatio: '16:9',
        acceptsVideo: true
      },
      {
        key: 'bridePortrait',
        label: 'Foto Mempelai Wanita',
        description: 'Potret pengantin wanita bergaya gading natural',
        aspectRatio: '4:5'
      },
      {
        key: 'groomPortrait',
        label: 'Foto Mempelai Pria',
        description: 'Potret pengantin pria berlatar alam teduh',
        aspectRatio: '4:5'
      },
      {
        key: 'galleryImages',
        label: 'Galeri Wipe-Reveal (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh koleksi foto horizontal dan vertikal sebanyak apa pun. Otomatis mengisi Galeri, Panggung Kiri Desktop, Spotlight, & Penutup.',
        aspectRatio: '4:5',
        isMultiple: true
      },
      {
        key: 'leftPanelImages',
        label: 'Koleksi Foto Panggung Kiri Desktop (Bebas Jumlah · Opsional)',
        description: 'Unggah foto khusus untuk Panggung Kiri interaktif yang berganti mengikuti scroll bab. Jika dikosongkan, otomatis memakai foto asli dari Galeri/Hero di atas.',
        aspectRatio: '4:5',
        isMultiple: true
      },
      {
        key: 'spotlightImage',
        label: 'Foto Pembatas Momen / Spotlight (Opsional)',
        description: 'Foto jeda puitis di antara rangkaian acara & galeri (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '16:9 atau 4:5'
      },
      {
        key: 'closingImage',
        label: 'Foto Latar Penutup / Closing (Opsional)',
        description: 'Foto potret penutup pada bagian akhir ucapan terima kasih (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '4:5'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Opsional)',
        description: 'Gambar kode QRIS untuk bagian Tanda Kasih',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Alya',
      brideFullName: 'Alya Puspita Ningrum',
      brideParents: 'Putri dari Bapak Bambang Tri Atmojo & Ibu Sri Wahyuni',
      groomName: 'Damar',
      groomFullName: 'Damar Aji Wibisono',
      groomParents: 'Putra dari Bapak Suhartono Wibisono & Ibu Endang Lestari',
      eventDateFormatted: 'Sabtu, 14 November 2026',
      countdownIsoDate: '2026-11-14T07:30:00',
      akadTime: '07.30 – 09.00 WIB',
      akadVenue: 'Griya Kunang Estate, Jl. Kaliurang Km. 12',
      resepsiTime: '10.30 – 13.30 WIB',
      resepsiVenue: 'Griya Kunang Lawn & Pavilion',
      city: 'Sleman, Yogyakarta',
      mapsUrl: 'https://maps.google.com',
      quoteText: 'Dan di antara tanda-tanda kebesaran-Nya ialah diciptakan-Nya untukmu pasangan hidup, agar engkau merasa tenteram di sisinya.',
      quoteSource: 'QS. Ar-Rum : 21',
      bankName: 'BCA',
      accountNumber: '8801234567',
      accountHolder: 'Damar Aji Wibisono',
      audioUrl: '',
      songTitle: 'Until I Found You - Acoustic Strings'
    }
  },

  'suasana': {
    id: 'suasana',
    name: 'Jurnal Dua Hati (Buku Catatan Vintage)',
    styleLabel: 'Jurnal Antik & Buku Bersegel Lilin',
    demoComponentKey: 'jurnal-dua-hati',
    coverThumbnail: '/images/film_vintage_couple_1791034007642.jpg',
    description: 'Sensasi membuka buku jurnal antik bersampul kulit navy, segel lilin emas, dan foto-foto polaroid miring organik.',
    hasDresscode: true,
    hasFilmstrip: false,
    hasStoryChapters: true,
    hasWaxSeal: true,
    mediaSlots: [
      {
        key: 'waxSealEmblem',
        label: 'Emblem Segel Lilin Emas (Opsional)',
        description: 'Segel lilin monogram pada sampul buku jurnal',
        aspectRatio: '1:1'
      },
      {
        key: 'heroImage',
        label: 'Foto / Video Pembuka Lembar Jurnal',
        description: 'Potret atau video pembuka pada sampul dan halaman pertama buku jurnal',
        aspectRatio: '16:9',
        acceptsVideo: true
      },
      {
        key: 'bridePortrait',
        label: 'Foto Polaroid Mempelai Wanita',
        description: 'Potret polaroid dengan sudut miring hangat',
        aspectRatio: '1:1'
      },
      {
        key: 'groomPortrait',
        label: 'Foto Polaroid Mempelai Pria',
        description: 'Potret polaroid dengan sudut miring hangat',
        aspectRatio: '1:1'
      },
      {
        key: 'galleryImages',
        label: 'Koleksi Lembar Foto Polaroid (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh koleksi foto polaroid sebanyak apa pun. Otomatis mengisi Galeri Polaroid, Panel Meja Kiri & Kanan Desktop, Momen, & Penutup.',
        aspectRatio: '1:1',
        isMultiple: true
      },
      {
        key: 'leftPanelImages',
        label: 'Koleksi Foto Panel Meja Kiri & Kanan Desktop (Bebas Jumlah · Opsional)',
        description: 'Unggah foto khusus untuk lembar polaroid di sisi kiri & kanan meja desktop. Jika dikosongkan, otomatis menampilkan foto asli yang diupload admin di atas.',
        aspectRatio: '1:1 atau 4:5',
        isMultiple: true
      },
      {
        key: 'spotlightImage',
        label: 'Foto Momen & Sketsa Lokasi (Opsional)',
        description: 'Foto jeda Momen & ilustrasi Venue (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '4:3 atau 1:1'
      },
      {
        key: 'closingImage',
        label: 'Foto Polaroid Penutup Jurnal (Opsional)',
        description: 'Foto polaroid terakhir pada lembar penutup buku jurnal (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '1:1'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Opsional)',
        description: 'Gambar kode QRIS untuk bagian Tanda Kasih',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Kirana',
      brideFullName: 'Kirana Ayu Lestari',
      brideParents: 'Putri Bapak Hendra Wijaya & Ibu Sinta Maharani',
      groomName: 'Adhitya',
      groomFullName: 'Adhitya Nugraha',
      groomParents: 'Putra Bapak Suryanto Nugraha & Ibu Ratna Dewi',
      eventDateFormatted: 'Minggu, 14 Februari 2027',
      countdownIsoDate: '2027-02-14T08:00:00',
      akadTime: '08.00 – 10.00 WIB',
      akadVenue: 'Paviliun Joglo Heritage Aryaduta',
      resepsiTime: '11.00 – 14.00 WIB',
      resepsiVenue: 'Taman Asri Ballroom Aryaduta',
      city: 'Jakarta Selatan',
      mapsUrl: 'https://maps.google.com',
      quoteText: 'Di lembar hari yang tenang, kisah kita ditulis dengan doa dan harapan suci.',
      quoteSource: 'Catatan Kasih Dua Hati',
      bankName: 'BCA',
      accountNumber: '8271029384',
      accountHolder: 'Kirana Ayu Lestari',
      songTitle: 'Nostalgic Vinyl Strings - Acoustic Serenade'
    }
  },

  'lembayung': {
    id: 'lembayung',
    name: 'Larasati & Fajar (Reel Sinematik 35mm)',
    styleLabel: 'Reel Film Analog 35mm & Tiket Bioskop',
    demoComponentKey: 'reel-sinematik',
    coverThumbnail: '/images/film_vintage_couple_1791034007642.jpg',
    description: 'Sensasi rol film analog 35mm lengkap dengan perforasi film, reservasi tiket bioskop klasik, dan layar akhir TAMAT.',
    hasDresscode: false,
    hasFilmstrip: true,
    hasStoryChapters: true,
    hasWaxSeal: false,
    mediaSlots: [
      {
        key: 'heroImage',
        label: 'Frame Rol Film / Video Pembuka (35mm)',
        description: 'Frame foto atau video utama dengan grain dan efek analog hangat',
        aspectRatio: '3:2',
        acceptsVideo: true
      },
      {
        key: 'heroVideo',
        label: 'Video Klise Sinematik Pembuka (Opsional)',
        description: 'Unggah video prewedding (.mp4 / .webm) untuk diputar sebagai latar layar sinema pembuka',
        aspectRatio: '16:9',
        acceptsVideo: true,
        videoOnly: true
      },
      {
        key: 'bridePortrait',
        label: 'Frame Rol Mempelai Wanita',
        description: 'Potret pengantin wanita bergaya analog retro',
        aspectRatio: '4:5'
      },
      {
        key: 'groomPortrait',
        label: 'Frame Rol Mempelai Pria',
        description: 'Potret pengantin pria bergaya vintage blazer',
        aspectRatio: '4:5'
      },
      {
        key: 'filmstripImages',
        label: 'Deretan Frame Filmstrip Klise 35mm (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Rangkaian foto klise film 35mm berlubang perforasi tanpa batas kuota',
        aspectRatio: '3:2',
        isMultiple: true
      },
      {
        key: 'galleryImages',
        label: 'Papan Foto Polaroid Gabus / Corkboard (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh foto momen tersemat jarum pentul merah di papan gabus sebanyak apa pun',
        aspectRatio: '1:1',
        isMultiple: true
      },
      {
        key: 'closingImage',
        label: 'Frame Foto Penutup Layar Akhir / TAMAT (Opsional)',
        description: 'Foto penutup sebelum kredit akhir TAMAT (jika dikosongkan, otomatis mengambil dari foto Galeri/Filmstrip yang diupload admin)',
        aspectRatio: '3:2 atau 16:9'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Opsional)',
        description: 'Gambar kode QRIS untuk bagian Tanda Kasih',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Larasati',
      brideFullName: 'Larasati Sekar Kinanti, S.Sn.',
      brideParents: 'Putri tercinta Bapak Danang Triputra & Ibu Ratna Susilowati',
      groomName: 'Fajar',
      groomFullName: 'Fajar Nugraha Pratama, S.T.',
      groomParents: 'Putra tercinta Bapak Hendrawan Pratama & Ibu Nuraini Dewi',
      eventDateFormatted: 'Sabtu, 24 Oktober 2026',
      countdownIsoDate: '2026-10-24T08:00:00',
      akadTime: '08.00 – 10.00 WIB',
      akadVenue: 'Paviliun Rinjani, Sanur Heritage Estate',
      resepsiTime: '11.00 – 15.00 WIB',
      resepsiVenue: 'Amphitheater Garden, Sanur Estate',
      city: 'Denpasar, Bali',
      mapsUrl: 'https://maps.google.com',
      quoteText: 'Seperti rol film 35mm yang merekam tiap detik berharga, cinta kita adalah sinema abadi yang tak lekang waktu.',
      quoteSource: 'Sinema Kasih Kita',
      bankName: 'Bank BRI',
      accountNumber: '034101002938501',
      accountHolder: 'Fajar Nugraha Pratama',
      secondaryBankName: 'Bank BCA',
      secondaryAccountNumber: '8271029384',
      secondaryAccountHolder: 'Larasati Sekar Kinanti',
      songTitle: 'Lagu Senja Analog - 35mm Acoustic Tape'
    }
  },
  'cetak-biru': {
    id: 'cetak-biru',
    name: 'Cetak Biru Kami (Architectural Blueprint)',
    styleLabel: 'Cyanotype & Cetak Biru Arsitektur',
    demoComponentKey: 'cetak-biru',
    coverThumbnail: '/images/blueprint_couple_hero_1791171076790.jpg',
    description: 'Desain bergaya cetak biru (cyanotype) arsitektur dengan tata letak desktop 3 zona asimetris, garis ukur interaktif, potret tampak mempelai, denah lokasi SVG, dan pita ukur hitung mundur.',
    hasDresscode: true,
    hasFilmstrip: false,
    hasStoryChapters: true,
    hasWaxSeal: false,
    mediaSlots: [
      {
        key: 'heroImage',
        label: 'Foto / Video Sampul Hero Cetak Biru',
        description: 'Foto atau video sampul utama pasangan dengan efek gerak pelan (Ken Burns).',
        aspectRatio: '3:4',
        acceptsVideo: true
      },
      {
        key: 'groomPortrait',
        label: 'Foto Potret Mempelai Pria (Tampak 01)',
        description: 'Potret tunggal mempelai pria pada lembar Tampak & Profil Mempelai.',
        aspectRatio: '3:4'
      },
      {
        key: 'bridePortrait',
        label: 'Foto Potret Mempelai Wanita (Tampak 02)',
        description: 'Potret tunggal mempelai wanita pada lembar Tampak & Profil Mempelai.',
        aspectRatio: '3:4'
      },
      {
        key: 'galleryImages',
        label: 'Lembar Dokumentasi Galeri & Tampak (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh foto prewedding sebanyak apa pun untuk Galeri Masonry, Tampak A/B, Panel Samping Cetak Biru, & Penutup.',
        aspectRatio: '3:4',
        isMultiple: true
      },
      {
        key: 'leftPanelImages',
        label: 'Koleksi Foto Panel Samping Cetak Biru Desktop (Bebas Jumlah · Opsional)',
        description: 'Unggah foto khusus untuk bingkai arsitektur di sisi kiri & kanan layar desktop. Jika dikosongkan, otomatis memakai foto asli dari Galeri/Hero di atas.',
        aspectRatio: '3:4 atau 4:3',
        isMultiple: true
      },
      {
        key: 'spotlightImage',
        label: 'Foto Fullbleed & Tampak A/B (Opsional)',
        description: 'Foto pembatas bentang penuh (Fullbleed / Elevation) di sela lembar cetak biru (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '16:9 atau 3:4'
      },
      {
        key: 'closingImage',
        label: 'Foto Latar Penutup / Closing Cetak Biru (Opsional)',
        description: 'Foto latar pada lembar penutup akhir (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '3:4 atau 16:9'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Opsional)',
        description: 'Gambar kode QRIS untuk bagian Tanda Kasih',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Ayunda Kirana',
      brideFullName: 'Ayunda Kirana Putri',
      brideParents: 'Bapak Yoga Prasetyo & Ibu Ratna Dewi',
      brideInstagram: '@ayundakirana',
      groomName: 'Raka Pradipta',
      groomFullName: 'Raka Pradipta Wijaya',
      groomParents: 'Bapak Hendra Wijaya & Ibu Sulastri',
      groomInstagram: '@rakapradipta',
      eventDateFormatted: 'Sabtu, 14 November 2026',
      countdownIsoDate: '2026-11-14T08:00:00',
      akadTime: '08.00 – 09.30 WIB',
      akadVenue: 'Gedung Serba Guna Wastu Kencana',
      resepsiTime: '11.00 – 14.00 WIB',
      resepsiVenue: 'Gedung Serba Guna Wastu Kencana',
      city: 'Bandung',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Gedung+Wastu+Kencana+Bandung',
      quoteText: '"Setiap bangunan yang kokoh dimulai dari satu garis sederhana. Punya kami dimulai dari satu percakapan panjang yang tak pernah selesai."',
      quoteSource: 'Catatan Arsitek, 2026',
      bankName: 'BCA',
      accountNumber: '1280 5566 990',
      accountHolder: 'Ayunda Kirana Putri',
      songTitle: 'Blueprint Acoustic Strings - Instrumental'
    }
  },
  'atlas-cinta': {
    id: 'atlas-cinta',
    name: 'Atlas Cinta (Jurnal Perjalanan & Kartu Pos)',
    styleLabel: 'Jurnal Perjalanan & Peta Topografi',
    demoComponentKey: 'atlas-cinta',
    coverThumbnail: '/images/atlas_cinta_hero_cover_1791177934302.jpg',
    description: 'Konsep jurnal perjalanan & atlas ekspedisi cinta dengan dua panel mengambang di desktop (konten di kiri, kartu pos foto dinamis di kanan), rute pesawat terbang, boarding pass hitung mundur, dan peta kontur topografi.',
    hasDresscode: true,
    hasFilmstrip: false,
    hasStoryChapters: true,
    hasWaxSeal: false,
    mediaSlots: [
      {
        key: 'heroImage',
        label: 'Foto / Video Sampul Hero Atlas (Titik 01)',
        description: 'Latar foto atau video pembuka perjalanan dengan animasi rute pesawat terbang.',
        aspectRatio: '3:4',
        acceptsVideo: true
      },
      {
        key: 'bridePortrait',
        label: 'Potret Mempelai Wanita (Penjelajah 01)',
        description: 'Foto mempelai wanita untuk cermin panel kartu pos kanan & potret perjalanan.',
        aspectRatio: '3:4'
      },
      {
        key: 'groomPortrait',
        label: 'Potret Mempelai Pria (Penjelajah 02)',
        description: 'Foto mempelai pria untuk cermin panel kartu pos kanan.',
        aspectRatio: '3:4'
      },
      {
        key: 'galleryImages',
        label: 'Koleksi Kartu Pos & Snapshot Perjalanan (Bebas Jumlah · Tanpa Batas Minimal/Maksimal)',
        description: 'Unggah seluruh foto perjalanan sebanyak apa pun untuk Grid Kartu Pos, Carousel, Panel Kartu Pos Kanan Desktop, Interlude, dan Penutup.',
        aspectRatio: '3:4 atau 4:3',
        isMultiple: true
      },
      {
        key: 'leftPanelImages',
        label: 'Koleksi Foto Panel Kartu Pos Kanan Desktop (Bebas Jumlah · Opsional)',
        description: 'Unggah foto khusus untuk Panel Kartu Pos mengambang di sebelah kanan layar desktop. Jika dikosongkan, otomatis memakai foto asli dari Galeri/Hero di atas.',
        aspectRatio: '3:4',
        isMultiple: true
      },
      {
        key: 'spotlightImage',
        label: 'Foto Interlude & Pemandangan Parallax (Opsional)',
        description: 'Foto lanskap pembatas perjalanan (Interlude & Full Plate) (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '16:9 atau 4:3'
      },
      {
        key: 'closingImage',
        label: 'Foto Latar Penutup Ekspedisi / Closing (Opsional)',
        description: 'Foto latar penuh pada penutup akhir Atlas Cinta (jika dikosongkan, otomatis mengambil dari foto Galeri/Hero yang diupload admin)',
        aspectRatio: '3:4 atau 16:9'
      },
      {
        key: 'qrisImageUrl',
        label: 'Barcode QRIS Tanda Kasih (Opsional)',
        description: 'Gambar kode QRIS untuk bagian Tanda Kasih',
        aspectRatio: '1:1'
      }
    ],
    defaultData: {
      brideName: 'Wulan',
      brideFullName: 'Wulan Citra Maheswari',
      brideParents: 'Bapak Slamet Riyadi & Ibu Anita Kurniawati',
      brideInstagram: '@wulancitra',
      groomName: 'Dimas',
      groomFullName: 'Dimas Prakoso Wibowo',
      groomParents: 'Bapak Joko Susanto & Ibu Lilis Nuraini',
      groomInstagram: '@dimasprakoso',
      eventDateFormatted: 'Sabtu, 5 Desember 2026',
      countdownIsoDate: '2026-12-05T08:00:00',
      akadTime: 'Pukul 08.00 WIB',
      akadVenue: 'Rumah Kayu Cikole, Jl. Raya Tangkuban Perahu KM 12',
      resepsiTime: 'Pukul 11.00 – 14.00 WIB',
      resepsiVenue: 'Rumah Kayu Cikole, Jl. Raya Tangkuban Perahu KM 12',
      city: 'Lembang, Jawa Barat',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rumah+Kayu+Cikole+Lembang',
      quoteText: 'Setiap perjalanan panjang dimulai dari satu langkah kecil — dan langkah kami dimulai dari sebuah nama yang kini menjadi tujuan.',
      quoteSource: 'Prolog, Atlas Cinta',
      bankName: 'BRI',
      accountNumber: '0091234567890',
      accountHolder: 'Wulan Citra Maheswari',
      songTitle: 'Atlas Perjalanan Senja - Acoustic Folk Guitar'
    }
  }
};
