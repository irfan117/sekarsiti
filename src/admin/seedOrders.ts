import { ClientInvitationData } from '../types/clientInvitation';

// Initial Seed Orders so the admin is never empty upon opening
export const INITIAL_SEED_ORDERS: ClientInvitationData[] = [
  {
    id: 'INV-2027-001',
    clientName: 'Kirana & Adhitya',
    clientPhone: '081298765432',
    clientEmail: 'kirana.lestari@gmail.com',
    templateId: 'ruang-rasa',
    status: 'published',
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-03T12:30:00Z',
    slug: 'kirana-adhitya',
    accessCode: 'kirana-adhitya',
    pinCode: '7429',
    guestLinks: [
      { id: 'gl-1', guestName: 'Bpk. Ir. Hendra & Keluarga', category: 'Keluarga', createdAt: '2026-10-02T10:00:00Z', isSent: true },
      { id: 'gl-2', guestName: 'dr. Farah Amanda', category: 'Sahabat', createdAt: '2026-10-02T11:30:00Z', isSent: true },
      { id: 'gl-3', guestName: 'Raka & Dian (Kantor)', category: 'Rekan Kerja', createdAt: '2026-10-03T09:15:00Z', isSent: false }
    ],
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
    mediaSlots: {
      heroImage: '/images/editorial_couple_portrait_1790838636662.jpg',
      bridePortrait: '/images/wedding_bride_veil_1790901501919.jpg',
      groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
      galleryImages: [
        '/images/editorial_couple_portrait_1790838636662.jpg',
        '/images/wedding_bride_veil_1790901501919.jpg',
        '/images/wedding_vows_bouquet_1790901516667.jpg',
        '/images/wedding_dance_lights_1790901533590.jpg',
        '/images/wedding_shoes_jewelry_1790901548736.jpg',
        '/images/editorial_venue_rings_1790838653826.jpg'
      ]
    },
    guestbookEntries: [
      { name: 'Raditya & Vanya', message: 'Selamat berbahagia Kirana & Adhitya!', time: '2 jam lalu' }
    ]
  },
  {
    id: 'INV-2026-002',
    clientName: 'Damar & Alya',
    clientPhone: '085712348765',
    clientEmail: 'damar.wibisono@gmail.com',
    templateId: 'setangkai',
    status: 'in_progress',
    createdAt: '2026-10-02T14:15:00Z',
    updatedAt: '2026-10-03T16:00:00Z',
    slug: 'damar-alya',
    accessCode: 'damar-alya',
    pinCode: '5812',
    guestLinks: [
      { id: 'gl-201', guestName: 'Keluarga Besar Wibisono', category: 'Keluarga', createdAt: '2026-10-02T15:00:00Z', isSent: true }
    ],
    brideName: 'Alya',
    brideFullName: 'Alya Puspita Ningrum',
    brideParents: 'Putri Bapak Bambang Tri Atmojo & Ibu Sri Wahyuni',
    groomName: 'Damar',
    groomFullName: 'Damar Aji Wibisono',
    groomParents: 'Putra Bapak Suhartono Wibisono & Ibu Endang Lestari',
    eventDateFormatted: 'Sabtu, 14 November 2026',
    countdownIsoDate: '2026-11-14T07:30:00',
    akadTime: '07.30 – 09.00 WIB',
    akadVenue: 'Griya Kunang Estate, Jl. Kaliurang Km. 12',
    resepsiTime: '10.30 – 13.30 WIB',
    resepsiVenue: 'Griya Kunang Lawn & Pavilion',
    city: 'Sleman, Yogyakarta',
    mapsUrl: 'https://maps.google.com',
    quoteText: 'Dan di antara tanda-tanda kebesaran-Nya ialah diciptakan-Nya untukmu pasangan hidup.',
    quoteSource: 'QS. Ar-Rum : 21',
    bankName: 'BCA',
    accountNumber: '8801234567',
    accountHolder: 'Damar Aji Wibisono',
    songTitle: 'Until I Found You - Acoustic Strings',
    mediaSlots: {
      heroImage: '/images/sage_outdoor_couple_portrait_1790919006777.jpg',
      bridePortrait: '/images/wedding_bride_portrait_1790833939171.jpg',
      groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
      galleryImages: [
        '/images/sage_outdoor_couple_portrait_1790919006777.jpg',
        '/images/botanical_estate_venue_1790919022237.jpg'
      ]
    }
  },
  {
    id: 'INV-2026-003',
    clientName: 'Larasati & Fajar',
    clientPhone: '081399887766',
    templateId: 'lembayung',
    status: 'published',
    createdAt: '2026-10-03T09:00:00Z',
    updatedAt: '2026-10-03T18:00:00Z',
    slug: 'larasati-fajar',
    accessCode: 'larasati-fajar',
    pinCode: '9134',
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
    quoteText: 'Seperti rol film 35mm yang merekam tiap detik berharga, cinta kita adalah sinema abadi.',
    quoteSource: 'Sinema Kasih Kita',
    bankName: 'Bank BRI',
    accountNumber: '034101002938501',
    accountHolder: 'Fajar Nugraha Pratama',
    songTitle: 'Lagu Senja Analog - 35mm Acoustic Tape',
    mediaSlots: {
      heroImage: '/images/film_vintage_couple_1791034007642.jpg',
      filmstripImages: [
        '/images/film_vintage_couple_1791034007642.jpg',
        '/images/wedding_bride_veil_1790901501919.jpg',
        '/images/wedding_vows_bouquet_1790901516667.jpg',
        '/images/wedding_dance_lights_1790901533590.jpg'
      ],
      galleryImages: [
        '/images/film_vintage_couple_1791034007642.jpg',
        '/images/editorial_venue_rings_1790838653826.jpg'
      ]
    }
  }
];
