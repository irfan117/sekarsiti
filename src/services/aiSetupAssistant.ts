import { TemplateId } from '../types/clientInvitation';

export interface AssetPlacementReport {
  slotKey: string;
  slotLabel: string;
  url: string;
  reason: string;
  isCustom: boolean;
}

export interface ParsedInvitationMedia {
  heroImage?: string;
  bridePortrait?: string;
  groomPortrait?: string;
  galleryImages?: string[];
  filmstripImages?: string[];
  qrisImageUrl?: string;
  waxSealEmblem?: string;
  gdriveFolderUrl?: string;
}

export interface ParsedInvitationAiResult {
  // Info Pemesan & Identitas
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  slug?: string;
  recommendedTemplate?: TemplateId;

  // Mempelai Wanita
  brideName?: string;
  brideFullName?: string;
  brideParents?: string;
  brideInstagram?: string;

  // Mempelai Pria
  groomName?: string;
  groomFullName?: string;
  groomParents?: string;
  groomInstagram?: string;

  // Jadwal & Lokasi
  eventDateFormatted?: string;
  countdownIsoDate?: string;
  akadTime?: string;
  akadVenue?: string;
  resepsiTime?: string;
  resepsiVenue?: string;
  city?: string;
  mapsUrl?: string;

  // Tanda Kasih (Bank 1, Bank 2, QRIS)
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  secondaryBankName?: string;
  secondaryAccountNumber?: string;
  secondaryAccountHolder?: string;
  qrisImageUrl?: string;

  // Kutipan & Musik
  quoteText?: string;
  quoteSource?: string;
  songTitle?: string;
  audioUrl?: string;

  // Media yang diekstrak dari GForm (link GDrive / URL langsung)
  media?: ParsedInvitationMedia;

  // Laporan Penempatan Aset Cerdas oleh AI
  assetPlacements?: AssetPlacementReport[];
}

/**
 * Mengonversi tautan berbagi Google Drive dari Google Form File Upload
 * (mis. https://drive.google.com/open?id=XXX atau https://drive.google.com/file/d/XXX/view)
 * menjadi URL gambar langsung yang dapat dirender oleh tag <img>.
 */
export function normalizeMediaUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Jangan ubah path lokal atau data URL
  if (trimmed.startsWith('/') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // Ekstrak ID file Google Drive dari berbagai pola link GForm / GDrive
  // Pola 1: drive.google.com/file/d/{FILE_ID}/...
  const fileDMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w1600`;
  }

  // Pola 2: drive.google.com/open?id={FILE_ID} atau drive.google.com/uc?id={FILE_ID}
  const idParamMatch = trimmed.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${idParamMatch[1]}&sz=w1600`;
  }

  // Pola 3: docs.google.com/uc?id={FILE_ID}
  const docsIdMatch = trimmed.match(/docs\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if (docsIdMatch && docsIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${docsIdMatch[1]}&sz=w1600`;
  }

  return trimmed;
}

/**
 * Memisahkan daftar tautan media (dipisahkan koma, baris baru, atau titik koma pada sel Google Form)
 * dan menormalisasi setiap URL.
 */
export function parseMultipleMediaUrls(rawField?: string | string[]): string[] {
  if (!rawField) return [];
  if (Array.isArray(rawField)) {
    return rawField
      .map((u) => normalizeMediaUrl(u))
      .filter((u) => Boolean(u));
  }

  // Pisahkan berdasarkan koma, baris baru, atau spasi sebelum http/ local path
  const tokens = rawField
    .split(/[\n,;]+|\s+(?=https?:\/\/|\/src\/assets\/)/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const urls: string[] = [];
  for (const token of tokens) {
    // Ekstrak URL atau path dari dalam teks jika ada label di depannya
    const urlMatch = token.match(/(https?:\/\/[^\s"',)]+|\/src\/assets\/[^\s"',)]+)/i);
    if (urlMatch && urlMatch[1]) {
      const normalized = normalizeMediaUrl(urlMatch[1]);
      if (normalized && !urls.includes(normalized)) {
        urls.push(normalized);
      }
    }
  }
  return urls;
}

/**
 * Ekstraksi seluruh URL dan path media dari teks mentah bebas (GForm, Sheets, WA, dll)
 */
export function extractAllMediaUrlsFromText(text: string): string[] {
  if (!text) return [];
  const foundUrls: string[] = [];

  // 1. Regex link Google Drive
  const gdriveMatches = text.match(/https?:\/\/(?:drive|docs)\.google\.com\/[^\s"',)<>]+/gi) || [];
  for (const match of gdriveMatches) {
    const normalized = normalizeMediaUrl(match);
    if (normalized && !foundUrls.includes(normalized)) {
      foundUrls.push(normalized);
    }
  }

  // 2. Regex URL gambar langsung (jpg, jpeg, png, webp, svg, heic)
  const directImgMatches = text.match(/https?:\/\/[^\s"',)<>]+\.(?:jpg|jpeg|png|webp|svg|heic)(?:\?[^\s"',)<>]+)?/gi) || [];
  for (const match of directImgMatches) {
    const normalized = normalizeMediaUrl(match);
    if (normalized && !foundUrls.includes(normalized)) {
      foundUrls.push(normalized);
    }
  }

  // 3. Regex path lokal Sekarsiti (/src/assets/images/...)
  const localMatches = text.match(/(?:\/src\/assets\/images\/|src\/assets\/images\/)[a-zA-Z0-9_\-.]+/gi) || [];
  for (const match of localMatches) {
    const path = match.startsWith('/') ? match : `/${match}`;
    if (!foundUrls.includes(path)) {
      foundUrls.push(path);
    }
  }

  return foundUrls;
}

/**
 * Preset fallback kuratorial beresolusi tinggi Sekarsiti per template
 * Digunakan agar undangan tidak pernah compang-camping atau berlubang jika klien hanya mengunggah sedikit foto.
 */
export const TEMPLATE_FALLBACK_ASSETS: Record<TemplateId, {
  heroImage: string;
  bridePortrait: string;
  groomPortrait: string;
  galleryImages: string[];
  filmstripImages?: string[];
  waxSealEmblem?: string;
}> = {
  'ruang-rasa': {
    heroImage: '/src/assets/images/editorial_couple_portrait_1790838636662.jpg',
    bridePortrait: '/src/assets/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/src/assets/images/editorial_groom_portrait_1790915490996.jpg',
    galleryImages: [
      '/src/assets/images/editorial_couple_portrait_1790838636662.jpg',
      '/src/assets/images/wedding_vows_bouquet_1790901516667.jpg',
      '/src/assets/images/wedding_dance_lights_1790901533590.jpg',
      '/src/assets/images/editorial_venue_rings_1790838653826.jpg'
    ]
  },
  'malam-zamrud': {
    heroImage: '/src/assets/images/art_deco_emerald_couple_1790840336340.jpg',
    bridePortrait: '/src/assets/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/src/assets/images/editorial_couple_portrait_1790838636662.jpg',
    galleryImages: [
      '/src/assets/images/art_deco_venue_details_1790840351864.jpg',
      '/src/assets/images/wedding_shoes_jewelry_1790901548736.jpg',
      '/src/assets/images/editorial_venue_rings_1790838653826.jpg',
      '/src/assets/images/wedding_table_botanical_1790833955186.jpg'
    ]
  },
  'setangkai': {
    heroImage: '/src/assets/images/sage_outdoor_couple_portrait_1790919006777.jpg',
    bridePortrait: '/src/assets/images/wedding_bride_portrait_1790833939171.jpg',
    groomPortrait: '/src/assets/images/editorial_groom_portrait_1790915490996.jpg',
    galleryImages: [
      '/src/assets/images/botanical_estate_venue_1790919022237.jpg',
      '/src/assets/images/wedding_couple_portrait_1790833906470.jpg',
      '/src/assets/images/wedding_vows_bouquet_1790901516667.jpg'
    ]
  },
  'suasana': {
    waxSealEmblem: '/src/assets/images/wax_seal_gold_monogram_1790915522548.jpg',
    heroImage: '/src/assets/images/film_vintage_couple_1791034007642.jpg',
    bridePortrait: '/src/assets/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/src/assets/images/editorial_groom_portrait_1790915490996.jpg',
    galleryImages: [
      '/src/assets/images/wedding_table_botanical_1790833955186.jpg',
      '/src/assets/images/brand_story_botanical_1790831303860.jpg',
      '/src/assets/images/editorial_venue_rings_1790838653826.jpg'
    ]
  },
  'lembayung': {
    heroImage: '/src/assets/images/film_vintage_couple_1791034007642.jpg',
    bridePortrait: '/src/assets/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/src/assets/images/editorial_groom_portrait_1790915490996.jpg',
    filmstripImages: [
      '/src/assets/images/film_vintage_couple_1791034007642.jpg',
      '/src/assets/images/wedding_vows_bouquet_1790901516667.jpg',
      '/src/assets/images/wedding_dance_lights_1790901533590.jpg',
      '/src/assets/images/editorial_venue_rings_1790838653826.jpg',
      '/src/assets/images/wedding_shoes_jewelry_1790901548736.jpg'
    ],
    galleryImages: [
      '/src/assets/images/film_vintage_couple_1791034007642.jpg',
      '/src/assets/images/wedding_vows_bouquet_1790901516667.jpg'
    ]
  },
  'cetak-biru': {
    heroImage: '/src/assets/images/blueprint_couple_hero_1791171076790.jpg',
    groomPortrait: '/src/assets/images/blueprint_groom_portrait_1791171047935.jpg',
    bridePortrait: '/src/assets/images/blueprint_bride_portrait_1791171064118.jpg',
    galleryImages: [
      '/src/assets/images/blueprint_venue_detail_1791171101186.jpg',
      '/src/assets/images/editorial_venue_rings_1790838653826.jpg',
      '/src/assets/images/botanical_estate_venue_1790919022237.jpg'
    ]
  },
  'atlas-cinta': {
    heroImage: '/src/assets/images/atlas_cinta_couple_hero_1791177959089.jpg',
    bridePortrait: '/src/assets/images/atlas_cinta_bride_portrait_1791177989392.jpg',
    groomPortrait: '/src/assets/images/atlas_cinta_groom_portrait_1791177974718.jpg',
    galleryImages: [
      '/src/assets/images/editorial_couple_portrait_1790838636662.jpg',
      '/src/assets/images/wedding_bride_veil_1790901501919.jpg',
      '/src/assets/images/wedding_vows_bouquet_1790901516667.jpg'
    ]
  }
};

/**
 * ENGINE PENEMPATAN ASET CERDAS (AI Smart Asset Placement)
 * Secara otomatis mendistribusikan seluruh foto yang ditemukan ke slot template spesifik.
 */
export function smartPlaceAssets(
  rawMedia: ParsedInvitationMedia,
  targetTemplateId: TemplateId = 'ruang-rasa',
  discoveredUrls: string[] = []
): {
  placedMedia: ParsedInvitationMedia & { galleryImages: string[] };
  placements: AssetPlacementReport[];
} {
  const fallback = TEMPLATE_FALLBACK_ASSETS[targetTemplateId] || TEMPLATE_FALLBACK_ASSETS['ruang-rasa'];
  const placements: AssetPlacementReport[] = [];

  // 1. Satukan seluruh kandidat foto ke pool terpadu
  const pool: string[] = [];
  const addToPool = (urls?: string | string[]) => {
    if (!urls) return;
    const list = Array.isArray(urls) ? urls : [urls];
    for (const raw of list) {
      const norm = normalizeMediaUrl(raw);
      if (norm && !pool.includes(norm)) {
        pool.push(norm);
      }
    }
  };

  addToPool(rawMedia.heroImage);
  addToPool(rawMedia.bridePortrait);
  addToPool(rawMedia.groomPortrait);
  addToPool(rawMedia.galleryImages);
  addToPool(rawMedia.filmstripImages);
  addToPool(discoveredUrls);

  // Helper classifier berbasis pola URL / nama file
  const isBride = (u: string) => /bride|wanita|cewek|putri|gaun|veil/i.test(u);
  const isGroom = (u: string) => /groom|pria|cowok|putra|jas|blazer/i.test(u);
  const isHero = (u: string) => /hero|sampul|cover|couple|pasangan|berdua/i.test(u);
  const isQris = (u: string) => /qris|barcode|scan|rekening|rek/i.test(u);
  const isWax = (u: string) => /wax|seal|lilin|monogram|emblem/i.test(u);

  const placed: ParsedInvitationMedia & { galleryImages: string[] } = {
    gdriveFolderUrl: rawMedia.gdriveFolderUrl,
    galleryImages: []
  };

  // 2. Alokasikan Foto Sampul (Hero)
  if (rawMedia.heroImage && normalizeMediaUrl(rawMedia.heroImage)) {
    placed.heroImage = normalizeMediaUrl(rawMedia.heroImage);
    placements.push({
      slotKey: 'heroImage',
      slotLabel: 'Foto Sampul (Hero)',
      url: placed.heroImage,
      reason: 'Sesuai dengan kolom spesifik Foto Sampul di formulir.',
      isCustom: true
    });
  } else {
    const heroCandidate = pool.find(isHero) || pool[0];
    if (heroCandidate) {
      placed.heroImage = heroCandidate;
      placements.push({
        slotKey: 'heroImage',
        slotLabel: 'Foto Sampul (Hero)',
        url: heroCandidate,
        reason: 'AI memilih foto terbaik dari kumpulan unggahan sebagai latar pembuka utama.',
        isCustom: true
      });
    } else {
      placed.heroImage = fallback.heroImage;
      placements.push({
        slotKey: 'heroImage',
        slotLabel: 'Foto Sampul (Hero)',
        url: fallback.heroImage,
        reason: 'Menggunakan foto kuratorial default Sekarsiti bertema template.',
        isCustom: false
      });
    }
  }

  // 3. Alokasikan Potret Mempelai Wanita
  if (rawMedia.bridePortrait && normalizeMediaUrl(rawMedia.bridePortrait)) {
    placed.bridePortrait = normalizeMediaUrl(rawMedia.bridePortrait);
    placements.push({
      slotKey: 'bridePortrait',
      slotLabel: 'Potret Mempelai Wanita',
      url: placed.bridePortrait,
      reason: 'Sesuai dengan kolom spesifik Mempelai Wanita di formulir.',
      isCustom: true
    });
  } else {
    const brideCandidate = pool.find((u) => isBride(u) && u !== placed.heroImage)
      || pool.find((u) => u !== placed.heroImage)
      || pool[1]
      || pool[0];
    if (brideCandidate) {
      placed.bridePortrait = brideCandidate;
      placements.push({
        slotKey: 'bridePortrait',
        slotLabel: 'Potret Mempelai Wanita',
        url: brideCandidate,
        reason: 'AI mengalokasikan foto potret mempelai wanita secara cerdas dari pool unggahan.',
        isCustom: true
      });
    } else {
      placed.bridePortrait = fallback.bridePortrait;
      placements.push({
        slotKey: 'bridePortrait',
        slotLabel: 'Potret Mempelai Wanita',
        url: fallback.bridePortrait,
        reason: 'Menggunakan potret anggun kuratorial Sekarsiti.',
        isCustom: false
      });
    }
  }

  // 4. Alokasikan Potret Mempelai Pria
  if (rawMedia.groomPortrait && normalizeMediaUrl(rawMedia.groomPortrait)) {
    placed.groomPortrait = normalizeMediaUrl(rawMedia.groomPortrait);
    placements.push({
      slotKey: 'groomPortrait',
      slotLabel: 'Potret Mempelai Pria',
      url: placed.groomPortrait,
      reason: 'Sesuai dengan kolom spesifik Mempelai Pria di formulir.',
      isCustom: true
    });
  } else {
    const groomCandidate = pool.find((u) => isGroom(u) && u !== placed.heroImage && u !== placed.bridePortrait)
      || pool.find((u) => u !== placed.heroImage && u !== placed.bridePortrait)
      || pool[2]
      || pool[0];
    if (groomCandidate) {
      placed.groomPortrait = groomCandidate;
      placements.push({
        slotKey: 'groomPortrait',
        slotLabel: 'Potret Mempelai Pria',
        url: groomCandidate,
        reason: 'AI mengalokasikan foto potret mempelai pria secara cerdas dari pool unggahan.',
        isCustom: true
      });
    } else {
      placed.groomPortrait = fallback.groomPortrait;
      placements.push({
        slotKey: 'groomPortrait',
        slotLabel: 'Potret Mempelai Pria',
        url: fallback.groomPortrait,
        reason: 'Menggunakan potret jas klasik kuratorial Sekarsiti.',
        isCustom: false
      });
    }
  }

  // 5. Alokasikan QRIS
  const qrisCandidate = (rawMedia.qrisImageUrl && normalizeMediaUrl(rawMedia.qrisImageUrl))
    || pool.find(isQris);
  if (qrisCandidate) {
    placed.qrisImageUrl = qrisCandidate;
    placements.push({
      slotKey: 'qrisImageUrl',
      slotLabel: 'Barcode / Gambar QRIS',
      url: qrisCandidate,
      reason: 'AI mendeteksi bukti/barcode QRIS untuk amplop digital.',
      isCustom: true
    });
  }

  // 6. Alokasikan Segel Lilin (Khusus template Jurnal Dua Hati / suasana)
  if (targetTemplateId === 'suasana' || rawMedia.waxSealEmblem) {
    const waxCandidate = (rawMedia.waxSealEmblem && normalizeMediaUrl(rawMedia.waxSealEmblem))
      || pool.find(isWax)
      || fallback.waxSealEmblem;
    if (waxCandidate) {
      placed.waxSealEmblem = waxCandidate;
      placements.push({
        slotKey: 'waxSealEmblem',
        slotLabel: 'Segel Lilin Emas Monogram',
        url: waxCandidate,
        reason: 'Ditempatkan sebagai segel interaktif pembuka buku jurnal.',
        isCustom: waxCandidate !== fallback.waxSealEmblem
      });
    }
  }

  // 7. Alokasikan Rol Klise 35mm (Khusus template Reel Sinematik / lembayung)
  if (targetTemplateId === 'lembayung' || (rawMedia.filmstripImages && rawMedia.filmstripImages.length > 0)) {
    let filmstripList: string[] = [];
    if (rawMedia.filmstripImages && rawMedia.filmstripImages.length > 0) {
      filmstripList = parseMultipleMediaUrls(rawMedia.filmstripImages);
    } else if (pool.length > 0) {
      filmstripList = [...pool].slice(0, 8);
      if (filmstripList.length < 4 && fallback.filmstripImages) {
        filmstripList = [...filmstripList, ...fallback.filmstripImages.slice(filmstripList.length, 5)];
      }
    } else if (fallback.filmstripImages) {
      filmstripList = [...fallback.filmstripImages];
    }
    placed.filmstripImages = filmstripList;
    placements.push({
      slotKey: 'filmstripImages',
      slotLabel: 'Rol Filmstrip Klise 35mm',
      url: filmstripList[0] || '',
      reason: `AI mengalokasikan ${filmstripList.length} frame foto ke dalam rol klise sinematik bergerak.`,
      isCustom: filmstripList.some(u => pool.includes(u))
    });
  }

  // 8. Alokasikan Galeri Momen (Wajib ada dan merangkul seluruh foto klien)
  let galleryList: string[] = [];
  if (rawMedia.galleryImages && rawMedia.galleryImages.length > 0) {
    galleryList = parseMultipleMediaUrls(rawMedia.galleryImages);
  } else if (pool.length > 0) {
    galleryList = [...pool];
  } else {
    galleryList = [...fallback.galleryImages];
  }

  for (const photo of pool) {
    if (!galleryList.includes(photo)) {
      galleryList.push(photo);
    }
  }

  placed.galleryImages = galleryList;
  placements.push({
    slotKey: 'galleryImages',
    slotLabel: 'Galeri Momen Dokumentasi',
    url: galleryList[0] || '',
    reason: `AI menyematkan ${galleryList.length} foto ke album galeri tanpa membuang foto klien.`,
    isCustom: galleryList.some(u => pool.includes(u))
  });

  return { placedMedia: placed, placements };
}

/**
 * Menormalisasi seluruh objek hasil ekstraksi AI agar semua URL media siap pakai
 */
export function normalizeParsedResult(
  raw: ParsedInvitationAiResult,
  targetTemplateId?: TemplateId
): ParsedInvitationAiResult {
  const result: ParsedInvitationAiResult = { ...raw };

  // Otomatis buat slug jika belum ada
  if (!result.slug && (result.brideName || result.groomName || result.clientName)) {
    const base =
      result.brideName && result.groomName
        ? `${result.brideName}-${result.groomName}`
        : result.clientName || '';
    result.slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Normalisasi Instagram agar diawali @
  if (result.brideInstagram && !result.brideInstagram.startsWith('@') && !result.brideInstagram.startsWith('http')) {
    result.brideInstagram = `@${result.brideInstagram.replace(/^@+/, '')}`;
  }
  if (result.groomInstagram && !result.groomInstagram.startsWith('@') && !result.groomInstagram.startsWith('http')) {
    result.groomInstagram = `@${result.groomInstagram.replace(/^@+/, '')}`;
  }

  const effectiveTemplate = targetTemplateId || result.recommendedTemplate || 'ruang-rasa';
  const rawMedia: ParsedInvitationMedia = result.media || {};

  // Jika penempatan aset belum dihitung, jalankan Smart Asset Placement Engine
  if (!result.assetPlacements || result.assetPlacements.length === 0) {
    const { placedMedia, placements } = smartPlaceAssets(rawMedia, effectiveTemplate);
    result.media = placedMedia;
    result.assetPlacements = placements;
  }

  return result;
}

/**
 * Parser lokal cerdas untuk mengekstrak respons Google Form (baik format Q&A,
 * ringkasan Google Form, maupun baris TSV/CSV dari Google Sheets) ketika offline.
 */
function parseHeuristicFallback(rawText: string): ParsedInvitationAiResult {
  const result: ParsedInvitationAiResult = {
    media: {}
  };
  const text = rawText.trim();

  // Helper pencari nilai berdasarkan label pertanyaan Google Form
  const findFieldValue = (patterns: RegExp[]): string | undefined => {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const cleaned = match[1].trim().replace(/^[:\-–=\t]+/, '').trim();
        if (cleaned && cleaned !== '-') return cleaned;
      }
    }
    return undefined;
  };

  // 1. Info Klien & Kontak
  result.clientPhone = findFieldValue([
    /(?:nomor\s*whatsapp|no\.?\s*wa|whatsapp\s*pemesan|telepon|no\.?\s*hp)[^\n:]*[:\t]\s*([+\d\s\-]{8,18})/i,
    /\b(08\d{8,12}|\+628\d{8,12})\b/
  ])?.replace(/[\s\-]/g, '');

  result.clientEmail = findFieldValue([
    /(?:email\s*pemesan|alamat\s*email|email)[^\n:]*[:\t]\s*([^\s\n,;]+@[^\s\n,;]+)/i,
    /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/
  ]);

  // 2. Mempelai Wanita
  result.brideFullName = findFieldValue([
    /(?:nama\s*lengkap\s*(?:&\s*gelar\s*)?mempelai\s*wanita|mempelai\s*wanita\s*\(lengkap\)|nama\s*lengkap\s*wanita|mempelai\s*wanita)[^\n:]*[:\t]\s*([^\n\t(]+)/i
  ]);
  result.brideName = findFieldValue([
    /(?:nama\s*panggilan\s*(?:mempelai\s*)?wanita|panggilan\s*wanita|panggilan\s*pengantin\s*wanita)[^\n:]*[:\t]\s*([^\n\t,;]+)/i,
    /mempelai\s*wanita[^\n]*panggilan\s*[:\-]\s*([A-Za-z]+)/i
  ]);
  result.brideParents = findFieldValue([
    /(?:orang\s*tua\s*(?:mempelai\s*)?wanita|putri\s*dari|nama\s*orang\s*tua\s*wanita|keluarga\s*mempelai\s*wanita)[^\n:]*[:\t]\s*([^\n\t]+)/i,
    /(Putri\s+(?:pertama|kedua|ketiga|bungsu|tunggal|tercinta)?\s*(?:dari\s*)?Bapak[^\n\t)]+)/i
  ]);
  result.brideInstagram = findFieldValue([
    /(?:instagram\s*(?:mempelai\s*)?wanita|ig\s*wanita|username\s*ig\s*wanita)[^\n:]*[:\t]\s*(@?[a-zA-Z0-9._]+)/i
  ]);

  // 3. Mempelai Pria
  result.groomFullName = findFieldValue([
    /(?:nama\s*lengkap\s*(?:&\s*gelar\s*)?mempelai\s*pria|mempelai\s*pria\s*\(lengkap\)|nama\s*lengkap\s*pria|mempelai\s*pria)[^\n:]*[:\t]\s*([^\n\t(]+)/i
  ]);
  result.groomName = findFieldValue([
    /(?:nama\s*panggilan\s*(?:mempelai\s*)?pria|panggilan\s*pria|panggilan\s*pengantin\s*pria)[^\n:]*[:\t]\s*([^\n\t,;]+)/i,
    /mempelai\s*pria[^\n]*panggilan\s*[:\-]\s*([A-Za-z]+)/i
  ]);
  result.groomParents = findFieldValue([
    /(?:orang\s*tua\s*(?:mempelai\s*)?pria|putra\s*dari|nama\s*orang\s*tua\s*pria|keluarga\s*mempelai\s*pria)[^\n:]*[:\t]\s*([^\n\t]+)/i,
    /(Putra\s+(?:pertama|kedua|ketiga|bungsu|tunggal|tercinta)?\s*(?:dari\s*)?Bapak[^\n\t)]+)/i
  ]);
  result.groomInstagram = findFieldValue([
    /(?:instagram\s*(?:mempelai\s*)?pria|ig\s*pria|username\s*ig\s*pria)[^\n:]*[:\t]\s*(@?[a-zA-Z0-9._]+)/i
  ]);

  // Fallback nama panggilan dari nama lengkap atau pola "X & Y"
  if (!result.brideName && result.brideFullName) {
    result.brideName = result.brideFullName.split(/[\s,]+/)[0];
  }
  if (!result.groomName && result.groomFullName) {
    result.groomName = result.groomFullName.split(/[\s,]+/)[0];
  }

  if (!result.brideName || !result.groomName) {
    const coupleMatch = text.match(/([A-Z][a-z]+)\s*(?:&|dan|\+)\s*([A-Z][a-z]+)/);
    if (coupleMatch) {
      if (!result.brideName) result.brideName = coupleMatch[1].trim();
      if (!result.groomName) result.groomName = coupleMatch[2].trim();
    }
  }

  if (result.brideName && result.groomName) {
    result.clientName = `${result.brideName} & ${result.groomName}`;
  } else {
    result.clientName = findFieldValue([
      /(?:nama\s*pasangan|judul\s*undangan|nama\s*klien)[^\n:]*[:\t]\s*([^\n\t]+)/i
    ]);
  }

  result.slug = findFieldValue([
    /(?:slug|link\s*undangan|url\s*slug)[^\n:]*[:\t]\s*([a-z0-9\-]+)/i
  ]);

  // 4. Tanggal & Jadwal Acara
  const rawDateField = findFieldValue([
    /(?:tanggal\s*(?:acara|pernikahan|perayaan)|hari\s*&\s*tanggal)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);
  if (rawDateField) {
    result.eventDateFormatted = rawDateField;
  }

  const dateMatch = text.match(/(?:(Senin|Selasa|Rabu|Kamis|Jumat|Sabtu|Minggu)[,\s]+)?(\d{1,2})\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+(\d{4})/i);
  if (dateMatch) {
    const dayName = dateMatch[1] ? `${dateMatch[1]}, ` : '';
    const day = dateMatch[2];
    const monthName = dateMatch[3];
    const year = dateMatch[4];
    if (!result.eventDateFormatted) {
      result.eventDateFormatted = `${dayName}${day} ${monthName} ${year}`;
    }

    const monthMap: Record<string, string> = {
      januari: '01', februari: '02', maret: '03', april: '04', mei: '05', juni: '06',
      juli: '07', agustus: '08', september: '09', oktober: '10', november: '11', desember: '12'
    };
    const mNum = monthMap[monthName.toLowerCase()] || '01';
    result.countdownIsoDate = `${year}-${mNum}-${day.padStart(2, '0')}T08:00:00`;
  }

  result.akadTime = findFieldValue([
    /(?:waktu\s*akad|jam\s*akad|pukul\s*akad)[^\n:]*[:\t]\s*([^\n\t]+)/i,
    /akad(?:\s+nikah)?\s*[:\t]\s*(\d{1,2}[:.]\d{2}\s*[-–s/d]+\s*\d{1,2}[:.]\d{2}\s*(?:WIB|WITA|WIT)?)/i
  ]) || '08.00 – 10.00 WIB';

  result.akadVenue = findFieldValue([
    /(?:tempat\s*akad|lokasi\s*akad|gedung\s*akad|venue\s*akad)[^\n:]*[:\t]\s*([^\n\t]+)/i,
    /akad(?:\s+nikah)?[^\n:]*[:\t]\s*(?:\d{1,2}[:.]\d{2}[^d]*di\s+)?([^\n\t]+)/i
  ]);

  result.resepsiTime = findFieldValue([
    /(?:waktu\s*resepsi|jam\s*resepsi|pukul\s*resepsi)[^\n:]*[:\t]\s*([^\n\t]+)/i,
    /resepsi(?:\s+pernikahan)?\s*[:\t]\s*(\d{1,2}[:.]\d{2}\s*[-–s/d]+\s*\d{1,2}[:.]\d{2}\s*(?:WIB|WITA|WIT)?)/i
  ]) || '11.00 – 14.00 WIB';

  result.resepsiVenue = findFieldValue([
    /(?:tempat\s*resepsi|lokasi\s*resepsi|gedung\s*resepsi|venue\s*resepsi)[^\n:]*[:\t]\s*([^\n\t]+)/i,
    /resepsi(?:\s+pernikahan)?[^\n:]*[:\t]\s*(?:\d{1,2}[:.]\d{2}[^d]*di\s+)?([^\n\t]+)/i
  ]);

  result.city = findFieldValue([
    /(?:kota\s*(?:acara|lokasi)?|wilayah|kabupaten)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);

  result.mapsUrl = findFieldValue([
    /(?:link\s*(?:google\s*)?maps|tautan\s*maps|titik\s*lokasi|maps\s*url|google\s*maps)[^\n:]*[:\t]\s*(https?:\/\/[^\s\n\t]+)/i,
    /(https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|www\.google\.com\/maps|maps\.google\.com)[^\s\n\t]*)/i
  ]);

  // 5. Rekening Bank 1 & 2
  result.bankName = findFieldValue([
    /(?:bank\s*utama|nama\s*bank\s*1|nama\s*bank)[^\n:]*[:\t]\s*([^\n\t,;]+)/i
  ]);
  result.accountNumber = findFieldValue([
    /(?:nomor\s*rekening\s*1|no\.?\s*rekening\s*utama|no\.?\s*rek(?:ening)?)[^\n:]*[:\t]\s*(\d{6,20})/i
  ]);
  result.accountHolder = findFieldValue([
    /(?:atas\s*nama\s*(?:rekening\s*1|utama)?|a\.?n\.?\s*rekening\s*1|pemilik\s*rekening)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);

  if (!result.bankName || !result.accountNumber) {
    const bankInline = text.match(/(BCA|Mandiri|BNI|BRI|BSI|CIMB|Permata|Jago|SeaBank)\s*(?:no\.?|rek\.?|:|-)?\s*(\d{7,18})(?:\s*(?:a\.?n\.?|atas\s*nama)\s*([^\n\t,;]+))?/i);
    if (bankInline) {
      result.bankName = result.bankName || bankInline[1].toUpperCase();
      result.accountNumber = result.accountNumber || bankInline[2].trim();
      if (bankInline[3] && !result.accountHolder) {
        result.accountHolder = bankInline[3].trim();
      }
    }
  }

  result.secondaryBankName = findFieldValue([
    /(?:bank\s*kedua|nama\s*bank\s*2|rekening\s*2\s*\(bank\))[^\n:]*[:\t]\s*([^\n\t,;]+)/i
  ]);
  result.secondaryAccountNumber = findFieldValue([
    /(?:nomor\s*rekening\s*2|no\.?\s*rekening\s*kedua|no\.?\s*rek\s*2)[^\n:]*[:\t]\s*(\d{6,20})/i
  ]);
  result.secondaryAccountHolder = findFieldValue([
    /(?:atas\s*nama\s*(?:rekening\s*2|kedua)|a\.?n\.?\s*rekening\s*2)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);

  // 6. Musik & Kutipan
  result.songTitle = findFieldValue([
    /(?:pilihan\s*musik|judul\s*lagu|lagu\s*latar|backsound|musik\s*pengiring)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]) || 'Until I Found You - Stephen Sanchez';

  result.audioUrl = findFieldValue([
    /(?:link\s*(?:file\s*)?(?:audio|musik|mp3)|url\s*musik)[^\n:]*[:\t]\s*(https?:\/\/[^\s\n\t]+)/i
  ]);

  result.quoteText = findFieldValue([
    /(?:kutipan\s*(?:ayat|doa|suci|romantis)?|teks\s*kutipan|ayat\s*suci)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]) || 'Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya.';

  result.quoteSource = findFieldValue([
    /(?:sumber\s*kutipan|nama\s*surah|sumber\s*ayat)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]) || 'QS. Ar-Rum: 21';

  // 7. Pilihan Template dari GForm
  const lower = text.toLowerCase();
  if (lower.includes('atlas cinta') || lower.includes('atlas-cinta') || lower.includes('atlas') || lower.includes('kartu pos') || lower.includes('wulan')) {
    result.recommendedTemplate = 'atlas-cinta';
  } else if (lower.includes('cetak biru') || lower.includes('cetak-biru') || lower.includes('blueprint') || lower.includes('arsitek') || lower.includes('cyanotype')) {
    result.recommendedTemplate = 'cetak-biru';
  } else if (lower.includes('lembayung') || lower.includes('reel') || lower.includes('35mm') || lower.includes('sinematik') || lower.includes('larasati')) {
    result.recommendedTemplate = 'lembayung';
  } else if (lower.includes('malam zamrud') || lower.includes('malam-zamrud') || lower.includes('zamrud') || lower.includes('art deco') || lower.includes('emerald')) {
    result.recommendedTemplate = 'malam-zamrud';
  } else if (lower.includes('setangkai') || lower.includes('damar') || lower.includes('sage') || lower.includes('botanikal')) {
    result.recommendedTemplate = 'setangkai';
  } else if (lower.includes('suasana') || lower.includes('jurnal dua hati') || lower.includes('jurnal') || lower.includes('buku')) {
    result.recommendedTemplate = 'suasana';
  } else {
    result.recommendedTemplate = 'ruang-rasa';
  }

  // 8. Ekstraksi Slot Media & Foto dari Pertanyaan Upload File GForm
  const heroRaw = findFieldValue([
    /(?:foto\s*(?:sampul|hero|utama|cover|pembuka)|hero\s*image)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);
  const bridePhotoRaw = findFieldValue([
    /(?:foto\s*(?:potret\s*)?(?:mempelai\s*|pengantin\s*)?wanita|bride\s*portrait|foto\s*wanita)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);
  const groomPhotoRaw = findFieldValue([
    /(?:foto\s*(?:potret\s*)?(?:mempelai\s*|pengantin\s*)?pria|groom\s*portrait|foto\s*pria)[^\n:]*[:\t]\s*([^\n\t]+)/i
  ]);
  const galleryRaw = findFieldValue([
    /(?:foto\s*galeri|galeri\s*(?:foto|prewedding|momen)|koleksi\s*foto|upload\s*galeri)[^\n:]*[:\t]\s*([^\n]+)/i
  ]);
  const filmstripRaw = findFieldValue([
    /(?:foto\s*(?:filmstrip|klise|rol\s*film)|filmstrip\s*images)[^\n:]*[:\t]\s*([^\n]+)/i
  ]);
  const qrisRaw = findFieldValue([
    /(?:foto\s*qris|barcode\s*qris|gambar\s*qris|upload\s*qris|qris)[^\n:]*[:\t]\s*(https?:\/\/[^\s\n\t]+|\/src\/assets\/[^\s\n\t]+)/i
  ]);
  const gdriveFolderRaw = findFieldValue([
    /(?:folder\s*google\s*drive|link\s*folder\s*foto|gdrive\s*folder)[^\n:]*[:\t]\s*(https?:\/\/drive\.google\.com\/drive\/folders\/[^\s\n\t]+)/i,
    /(https?:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+)/i
  ]);

  const rawMediaCandidate: ParsedInvitationMedia = {
    heroImage: heroRaw ? parseMultipleMediaUrls(heroRaw)[0] : undefined,
    bridePortrait: bridePhotoRaw ? parseMultipleMediaUrls(bridePhotoRaw)[0] : undefined,
    groomPortrait: groomPhotoRaw ? parseMultipleMediaUrls(groomPhotoRaw)[0] : undefined,
    galleryImages: galleryRaw ? parseMultipleMediaUrls(galleryRaw) : undefined,
    filmstripImages: filmstripRaw ? parseMultipleMediaUrls(filmstripRaw) : undefined,
    qrisImageUrl: qrisRaw ? parseMultipleMediaUrls(qrisRaw)[0] : undefined,
    gdriveFolderUrl: gdriveFolderRaw
  };

  const allDiscovered = extractAllMediaUrlsFromText(rawText);
  const { placedMedia, placements } = smartPlaceAssets(
    rawMediaCandidate,
    result.recommendedTemplate || 'ruang-rasa',
    allDiscovered
  );

  result.media = placedMedia;
  result.assetPlacements = placements;

  return normalizeParsedResult(result, result.recommendedTemplate);
}

export async function parseInvitationWithAi(rawText: string): Promise<{
  success: boolean;
  data: ParsedInvitationAiResult;
  isAi: boolean;
  message?: string;
}> {
  try {
    const res = await fetch('/api/ai/parse-invitation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          data: normalizeParsedResult(json.data),
          isAi: true,
          message: 'Data formulir & tautan media GForm berhasil diekstrak dengan Gemini AI.'
        };
      }
    }
  } catch (err) {
    console.warn('AI Endpoint unavailable, using local GForm smart parser fallback:', err);
  }

  // Local heuristic fallback
  const fallback = parseHeuristicFallback(rawText);
  return {
    success: true,
    data: fallback,
    isAi: false,
    message: 'Data & tautan media GForm berhasil diekstrak dengan parser cerdas Sekarsiti.'
  };
}

export async function generateQuoteWithAi(theme: string, coupleName: string): Promise<{
  quoteText: string;
  quoteSource: string;
}> {
  try {
    const res = await fetch('/api/ai/generate-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, coupleName }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          quoteText: json.data.quoteText,
          quoteSource: json.data.quoteSource
        };
      }
    }
  } catch (err) {
    console.warn('AI Quote failed, using elegant fallback', err);
  }

  return {
    quoteText: 'Mencintai bukanlah saling memandang, melainkan bersama-sama memandang ke satu arah yang sama dalam ikatan janji suci yang abadi.',
    quoteSource: 'Antoine de Saint-Exupéry'
  };
}
