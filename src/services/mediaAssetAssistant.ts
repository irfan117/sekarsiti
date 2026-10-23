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
  heroVideo?: string;
  bridePortrait?: string;
  groomPortrait?: string;
  galleryImages?: string[];
  filmstripImages?: string[];
  qrisImageUrl?: string;
  waxSealEmblem?: string;
  gdriveFolderUrl?: string;
}

/**
 * Mengonversi tautan berbagi Google Drive
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

  // Ekstrak ID file Google Drive dari berbagai pola link.
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
 * Memisahkan daftar tautan media yang dipisahkan koma, baris baru, atau titik koma.
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
 * Ekstraksi seluruh URL dan path media dari teks mentah bebas.
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

  // 3. Regex path lokal Sekarsiti (/images/...)
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
    heroImage: '/images/editorial_couple_portrait_1790838636662.jpg',
    bridePortrait: '/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
    galleryImages: [
      '/images/editorial_couple_portrait_1790838636662.jpg',
      '/images/wedding_vows_bouquet_1790901516667.jpg',
      '/images/wedding_dance_lights_1790901533590.jpg',
      '/images/editorial_venue_rings_1790838653826.jpg'
    ]
  },
  'malam-zamrud': {
    heroImage: '/images/art_deco_emerald_couple_1790840336340.jpg',
    bridePortrait: '/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/images/editorial_couple_portrait_1790838636662.jpg',
    galleryImages: [
      '/images/art_deco_venue_details_1790840351864.jpg',
      '/images/wedding_shoes_jewelry_1790901548736.jpg',
      '/images/editorial_venue_rings_1790838653826.jpg',
      '/images/wedding_table_botanical_1790833955186.jpg'
    ]
  },
  'setangkai': {
    heroImage: '/images/sage_outdoor_couple_portrait_1790919006777.jpg',
    bridePortrait: '/images/wedding_bride_portrait_1790833939171.jpg',
    groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
    galleryImages: [
      '/images/botanical_estate_venue_1790919022237.jpg',
      '/images/wedding_couple_portrait_1790833906470.jpg',
      '/images/wedding_vows_bouquet_1790901516667.jpg'
    ]
  },
  'suasana': {
    waxSealEmblem: '/images/wax_seal_gold_monogram_1790915522548.jpg',
    heroImage: '/images/film_vintage_couple_1791034007642.jpg',
    bridePortrait: '/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
    galleryImages: [
      '/images/wedding_table_botanical_1790833955186.jpg',
      '/images/brand_story_botanical_1790831303860.jpg',
      '/images/editorial_venue_rings_1790838653826.jpg'
    ]
  },
  'lembayung': {
    heroImage: '/images/film_vintage_couple_1791034007642.jpg',
    bridePortrait: '/images/wedding_bride_veil_1790901501919.jpg',
    groomPortrait: '/images/editorial_groom_portrait_1790915490996.jpg',
    filmstripImages: [
      '/images/film_vintage_couple_1791034007642.jpg',
      '/images/wedding_vows_bouquet_1790901516667.jpg',
      '/images/wedding_dance_lights_1790901533590.jpg',
      '/images/editorial_venue_rings_1790838653826.jpg',
      '/images/wedding_shoes_jewelry_1790901548736.jpg'
    ],
    galleryImages: [
      '/images/film_vintage_couple_1791034007642.jpg',
      '/images/wedding_vows_bouquet_1790901516667.jpg'
    ]
  },
  'cetak-biru': {
    heroImage: '/images/blueprint_couple_hero_1791171076790.jpg',
    groomPortrait: '/images/blueprint_groom_portrait_1791171047935.jpg',
    bridePortrait: '/images/blueprint_bride_portrait_1791171064118.jpg',
    galleryImages: [
      '/images/blueprint_venue_detail_1791171101186.jpg',
      '/images/editorial_venue_rings_1790838653826.jpg',
      '/images/botanical_estate_venue_1790919022237.jpg'
    ]
  },
  'atlas-cinta': {
    heroImage: '/images/atlas_cinta_hero_cover_1791177934302.jpg',
    bridePortrait: '/images/atlas_cinta_bride_portrait_1791177955237.jpg',
    groomPortrait: '/images/atlas_cinta_groom_portrait_1791177974718.jpg',
    galleryImages: [
      '/images/atlas_cinta_interlude_landscape_1791177985962.jpg',
      '/images/editorial_couple_portrait_1790838636662.jpg',
      '/images/wedding_bride_veil_1790901501919.jpg',
      '/images/wedding_vows_bouquet_1790901516667.jpg'
    ]
  }
};

/**
 * ENGINE PENEMPATAN ASET CERDAS
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
        reason: 'Sistem memilih foto terbaik dari kumpulan unggahan sebagai latar pembuka utama.',
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
        reason: 'Sistem mengalokasikan foto potret mempelai wanita secara cerdas dari pool unggahan.',
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
        reason: 'Sistem mengalokasikan foto potret mempelai pria secara cerdas dari pool unggahan.',
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
      reason: 'Sistem mendeteksi bukti/barcode QRIS untuk amplop digital.',
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
      reason: `Sistem mengalokasikan ${filmstripList.length} frame foto ke dalam rol klise sinematik bergerak.`,
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
    reason: `Sistem menyematkan ${galleryList.length} foto ke album galeri tanpa membuang foto klien.`,
    isCustom: galleryList.some(u => pool.includes(u))
  });

  return { placedMedia: placed, placements };
}
