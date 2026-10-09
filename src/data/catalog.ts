import { InvitationItem } from '../types';

export const TEMPLATES: InvitationItem[] = [
  {
    id: 'ruang-rasa',
    title: 'Ruang Rasa',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'minimalist',
    styleLabel: 'Modern Minimalis',
    price: 69000,
    originalPrice: 129000,
    isBestSeller: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Seri Editorial Modern)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/template_ruang_rasa_1790831267799.jpg',
    description: 'Tipografi editorial yang bersih, ruang lapang, dan keindahan dalam kesederhanaan monokrom.',
    features: [
      'Website responsif mobile & desktop',
      'Personalisasi nama tamu tanpa batas',
      'RSVP & buku ucapan realtime',
      'Navigasi lokasi Google Maps satu klik',
      'Amplop digital langsung ke rekening pribadi',
      'Masa aktif 1 tahun tanpa biaya tambahan'
    ],
    demoData: {
      groomName: 'Bagas Wicaksono',
      brideName: 'Nirmala Laksita',
      eventDate: 'Sabtu, 24 Oktober 2026',
      countdownDate: '2026-10-24T09:00:00',
      location: 'Rumah Luwih Sanur Paviliun',
      city: 'Denpasar, Bali',
      songTitle: 'Until I Found You - Stephen Sanchez (Violin Solo)',
      themeColor: '#414A35',
      bankName: 'BCA',
      accountNumber: '8271029384',
      accountHolder: 'Bagas Wicaksono',
      loveQuote: '“Hari yang tenang, langkah yang pasti, dan janji untuk menua bersama dalam kesederhanaan.”'
    }
  },
  {
    id: 'malam-zamrud',
    title: 'Malam Zamrud',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'luxury',
    styleLabel: 'Art Deco & Emerald',
    price: 89000,
    originalPrice: 159000,
    isBestSeller: true,
    isNew: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Malam Zamrud)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/template_sore_teduh_1790831280150.jpg',
    description: 'Nuansa malam onyx yang megah, aksen kuningan art-deco, dan kemewahan zamrud yang memikat.',
    features: [
      'Motif kipas sunburst Art Deco mewah',
      'Desain desktop lebar & sempit tanpa celah',
      'Integrasi Google Maps & Calendar instan',
      'Ketentuan dress code & color swatches',
      'Amplop digital multi-rekening & QRIS',
      'Buku ucapan & RSVP online realtime'
    ],
    demoData: {
      groomName: 'Adhitya Nugraha',
      brideName: 'Kirana Ayu Lestari',
      eventDate: 'Sabtu, 14 Februari 2027',
      countdownDate: '2027-02-14T08:00:00',
      location: 'Grand Ballroom Hotel Aryaduta',
      city: 'Jakarta Selatan',
      songTitle: 'Midnight Waltz - Gatsby Evening Strings',
      themeColor: '#1E4438',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'Kirana Ayu Lestari',
      loveQuote: '“Bunga melati tumbuh berseri, mekar indah di taman hati. Dua insan berjanji sehidup semati, menyatu dalam ikatan suci.”'
    }
  },
  {
    id: 'setangkai',
    title: 'Damar & Alya (Kertas Putih & Sage)',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'minimalist' as any,
    styleLabel: 'Kertas Putih & Sage',
    price: 79000,
    originalPrice: 139000,
    isBestSeller: true,
    isNew: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Damar & Alya)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/template_setangkai_1790831293717.jpg',
    description: 'Desain minimalis bernuansa kertas gading dan sage green. Tampil anggun dengan panel panggung desktop dan galeri wipe-reveal.',
    features: [
      'Dual-pane panggung desktop interaktif',
      'Countdown hitung mundur realtime ke hari-H',
      'Timeline kisah cinta kami dengan foto momen',
      'Integrasi kalender Google & peta Google Maps',
      'Galeri foto wipe-reveal modern',
      'Buku tamu & konfirmasi kehadiran RSVP online'
    ],
    demoData: {
      groomName: 'Damar Aji Wibisono',
      brideName: 'Alya Puspita Ningrum',
      eventDate: 'Sabtu, 14 November 2026',
      countdownDate: '2026-11-14T07:30:00',
      location: 'Griya Kunang Estate, Jl. Kaliurang Km. 12',
      city: 'Sleman, Yogyakarta',
      songTitle: 'Until I Found You - Acoustic Strings',
      themeColor: '#6f7d5f',
      bankName: 'BCA',
      accountNumber: '8801234567',
      accountHolder: 'Damar Aji Wibisono',
      loveQuote: '“Dan di antara tanda-tanda kebesaran-Nya ialah diciptakan-Nya untukmu pasangan hidup, agar engkau merasa tenteram di sisinya.”'
    }
  },
  {
    id: 'suasana',
    title: 'Jurnal Dua Hati (Buku & Catatan Vintage)',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'rustic' as any,
    styleLabel: 'Jurnal & Vintage Book',
    price: 99000,
    originalPrice: 179000,
    isBestSeller: true,
    isNew: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Jurnal Dua Hati)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/brand_story_botanical_1790831303860.jpg',
    description: 'Desain buku jurnal interaktif dengan sampul 3D lipat buka, panel panggung desktop dinamis, linimasa bergaris buku catatan, dan galeri foto polaroid.',
    features: [
      'Sampul jurnal 3D lipat buka (3D open book swing)',
      'Dual-panel panggung desktop dinamis yang berganti foto otomatis',
      'Hitung mundur akad & resepsi + Simpan ke Google Calendar',
      'Linimasa kisah cinta bertema lembar buku bergaris',
      'Galeri foto polaroid interaktif dengan lightbox zoom',
      'Ucapan & Doa realtime serta RSVP digital terintegrasi'
    ],
    demoData: {
      groomName: 'Adhitya Nugraha',
      brideName: 'Kirana Ayu Lestari',
      eventDate: 'Minggu, 14 Februari 2027',
      countdownDate: '2027-02-14T08:00:00',
      location: 'Grand Ballroom Hotel Aryaduta',
      city: 'Jakarta Selatan',
      songTitle: 'Until I Found You - Stephen Sanchez (Acoustic Strings)',
      themeColor: '#55653F',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountHolder: 'Kirana Ayu Lestari',
      loveQuote: '“Dua kisah yang mengalir terpisah, kini bersatu menuliskan babak paling indah dalam sebuah jurnal seumur hidup.”'
    }
  },
  {
    id: 'lembayung',
    title: 'Larasati & Fajar (Reel Sinematik & Polaroid Vintage)',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'vintage' as any,
    styleLabel: 'Reel Film 35mm & Polaroid',
    price: 119000,
    originalPrice: 199000,
    isBestSeller: true,
    isNew: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Reel Sinematik)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/editorial_couple_portrait_1790838636662.jpg',
    description: 'Konsep sinematik rol film 35mm retro. Dilengkapi gerbang sampul dua pintu, tiket bioskop berlubang perforasi, navigasi filmstrip horizontal bawah layar, dan kolase polaroid berserak.',
    features: [
      'Gerbang sampul dua pintu (double door gate slide)',
      'Navigasi pita filmstrip interaktif bawah layar',
      'Tiket bioskop akad & resepsi + hitung mundur flip reel',
      'Storyboard 3 adegan kisah cinta perjalanan',
      'Galeri kolase 8 foto polaroid dengan lightbox swipe',
      'Reservasi tempat duduk RSVP & papan ucapan gabus'
    ],
    demoData: {
      groomName: 'Fajar Ramadhan Putra',
      brideName: 'Larasati Ayu Ningtyas',
      eventDate: 'Sabtu, 9 Oktober 2027',
      countdownDate: '2027-10-09T08:00:00',
      location: 'Grand Ballroom Hotel Aryaduta Bandung',
      city: 'Kota Bandung',
      songTitle: 'Golden Hour Nostalgia - Acoustic Strings',
      themeColor: '#7B3B34',
      bankName: 'BRI & BCA',
      accountNumber: '0011 2233 4455',
      accountHolder: 'Larasati Ayu Ningtyas',
      loveQuote: '“Kisah terbaik selalu punya adegan sederhana yang paling dikenang, terekam abadi dalam setiap bingkai rol kehidupan.”'
    }
  },
  {
    id: 'cetak-biru',
    title: 'Cetak Biru Kami (Blueprint Arsitektur)',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'minimalist' as any,
    styleLabel: 'Cyanotype & Cetak Biru Arsitektur',
    price: 119000,
    originalPrice: 199000,
    isBestSeller: true,
    isNew: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Cetak Biru Arsitektur)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/wedding_couple_portrait_1790833906470.jpg',
    description: 'Estetika lembar kerja arsitektur cyanotype dengan 3 zona desktop asimetris, garis ukur interaktif, lembar potret tampak mempelai, denah lokasi SVG, dan pita ukur hitung mundur.',
    features: [
      'Gerbang cetak biru lipat 3D dengan kompas arsitektur',
      'Tata letak desktop 3 zona asimetris & crossfade panel dinamis',
      'Garis ukur (dimension line) vertikal interaktif saat digulir',
      'Pita ukur (measuring tape) hitung mundur & tombol Google Calendar',
      'Denah arsitektur lokasi SVG dengan pin berdenyut',
      'Galeri dokumentasi sudut lipat kertas (corner peel) + Lightbox'
    ],
    demoData: {
      groomName: 'Raka Pradipta Wijaya',
      brideName: 'Ayunda Kirana Putri',
      eventDate: 'Sabtu, 14 November 2026',
      countdownDate: '2026-11-14T08:00:00',
      location: 'Gedung Serba Guna Wastu Kencana',
      city: 'Bandung',
      songTitle: 'Blueprint Acoustic Strings - Instrumental',
      themeColor: '#0c3654',
      bankName: 'BCA',
      accountNumber: '1280 5566 990',
      accountHolder: 'Ayunda Kirana Putri',
      loveQuote: '“Setiap bangunan yang kokoh dimulai dari satu garis sederhana. Punya kami dimulai dari satu percakapan panjang yang tak pernah selesai.”'
    }
  },
  {
    id: 'atlas-cinta',
    title: 'Atlas Cinta (Wulan & Dimas)',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'rustic' as any,
    styleLabel: 'Jurnal Perjalanan & Kartu Pos',
    price: 119000,
    originalPrice: 199000,
    isBestSeller: true,
    isNew: true,
    hasDedicatedDemo: true,
    dedicatedDemoLabel: 'Buka Demo React (Atlas Cinta)',
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/art_deco_emerald_couple_1790840336340.jpg',
    description: 'Desain jurnal perjalanan dan kartu pos ekspedisi dengan dua panel mengambang di layar desktop (konten di kiri, cermin kartu pos dinamis di kanan), tiket boarding pass, dan peta kontur topografi.',
    features: [
      'Sampul jurnal berstempel MULAI & animasi rute pesawat terbang',
      'Layout desktop 2 panel mengambang (konten kiri, kartu pos foto kanan)',
      'Penghitung titik perjalanan (Titik 01–13) dengan indikator progres rute',
      'Tiket & koordinat gaya boarding pass + simpan ke Google Calendar',
      'Peta topografi kontur SVG dengan rute berdenyut & kompas ayun',
      'Galeri kartu pos (grid + carousel geser) & amplop pos udara'
    ],
    demoData: {
      groomName: 'Dimas Prakoso Wibowo',
      brideName: 'Wulan Citra Maheswari',
      eventDate: 'Sabtu, 5 Desember 2026',
      countdownDate: '2026-12-05T08:00:00',
      location: 'Rumah Kayu Cikole, Jl. Raya Tangkuban Perahu KM 12',
      city: 'Lembang, Jawa Barat',
      songTitle: 'Atlas Perjalanan Senja - Acoustic Folk Guitar',
      themeColor: '#1F2A3C',
      bankName: 'BRI',
      accountNumber: '0091234567890',
      accountHolder: 'Wulan Citra Maheswari',
      loveQuote: '“Setiap perjalanan panjang dimulai dari satu langkah kecil — dan langkah kami dimulai dari sebuah nama yang kini menjadi tujuan.”'
    }
  },
  {
    id: 'senandika',
    title: 'Senandika',
    category: 'web',
    categoryLabel: 'Undangan Digital',
    style: 'adat',
    styleLabel: 'Klasik Kontemporer',
    price: 69000,
    originalPrice: 129000,
    isBestSeller: false,
    completionTime: '1 Hari Pengerjaan',
    image: 'src/assets/images/hero_invitation_showcase_1790827045499.jpg',
    description: 'Sentuhan kaligrafi klasik dengan napas modern yang tidak lekang oleh waktu.',
    features: [
      'Harmoni sentuhan tradisional dan modern',
      'Rangkaian acara adat & resepsi lengkap',
      'Penunjuk maps presisi tinggi',
      'Amplop digital multi-rekening & QRIS',
      'Masa aktif 1 tahun penuh',
      'Proses pengerjaan cepat dan mudah'
    ],
    demoData: {
      groomName: 'Satria Dewabrata',
      brideName: 'Dyah Gayatri',
      eventDate: 'Minggu, 27 Desember 2026',
      countdownDate: '2026-12-27T10:00:00',
      location: 'Sasana Kriya TMII',
      city: 'Jakarta Timur',
      songTitle: 'Gending Sriwijaya Ambient Instrumental',
      themeColor: '#4A3B32',
      bankName: 'BNI',
      accountNumber: '0812938475',
      accountHolder: 'Satria Dewabrata',
      loveQuote: '“Mugi Gusti tansah maringi berkah katentreman, guyub rukun salawas-lawase.”'
    }
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Pilih template',
    description: 'Jelajahi koleksi dan temukan desain pilihanmu.'
  },
  {
    number: '02',
    title: 'Sesuaikan undangan',
    description: 'Lengkapi nama, tanggal, lokasi, dan detail acara.'
  },
  {
    number: '03',
    title: 'Bagikan kepada tamu',
    description: 'Kirim undangan digital melalui tautan.'
  }
];

export const VALUE_PROPOSITIONS = [
  {
    title: 'Desain pilihan',
    description: 'Beragam gaya untuk berbagai selera.'
  },
  {
    title: 'Harga bersahabat',
    description: 'Pilihan undangan digital dengan harga yang jelas.'
  },
  {
    title: 'Praktis digunakan',
    description: 'Sesuaikan detail dan bagikan undangan secara digital.'
  }
];
