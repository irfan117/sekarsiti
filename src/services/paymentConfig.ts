/**
 * Official Pricing & Package Catalog (Single Source of Truth)
 * Digunakan oleh backend dan frontend untuk validasi harga transaksi.
 */

export interface PackagePricingItem {
  id: string;
  title: string;
  tier: 'standar' | 'essential' | 'premium';
  officialPrice: number;
}

export const OFFICIAL_PACKAGES: Record<string, PackagePricingItem> = {
  // Seri Standar (Edisi Sahaja - Rp 49.000)
  'standar-royal-classic': {
    id: 'standar-royal-classic',
    title: 'Seri Standar - Royal Classic Ivory',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-jurnal-pesisir': {
    id: 'standar-jurnal-pesisir',
    title: 'Seri Standar - Jurnal Pesisir',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-langit-porselen': {
    id: 'standar-langit-porselen',
    title: 'Seri Standar - Langit Porselen',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-leclipse-damour': {
    id: 'standar-leclipse-damour',
    title: 'Seri Standar - L’Éclipse d’Amour',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-simpul-sutra': {
    id: 'standar-simpul-sutra',
    title: 'Seri Standar - Simpul Sutra',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-serenade-camelia': {
    id: 'standar-serenade-camelia',
    title: 'Seri Standar - Serenade Camelia',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-grand-pelaminan': {
    id: 'standar-grand-pelaminan',
    title: 'Seri Standar - Grand Pelaminan',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-timeless-botanical': {
    id: 'standar-timeless-botanical',
    title: 'Seri Standar - Timeless Botanical',
    tier: 'standar',
    officialPrice: 49000,
  },
  'standar-kraton-heritage': {
    id: 'standar-kraton-heritage',
    title: 'Seri Standar - Kraton Heritage',
    tier: 'standar',
    officialPrice: 49000,
  },

  // Seri Editorial (Premium Studio)
  'noir-editorial': {
    id: 'noir-editorial',
    title: 'Seri Editorial - Noir Editorial',
    tier: 'premium',
    officialPrice: 89000,
  },
  'ruang-rasa': {
    id: 'ruang-rasa',
    title: 'Seri Editorial - Ruang Rasa',
    tier: 'essential',
    officialPrice: 69000,
  },
  'malam-zamrud': {
    id: 'malam-zamrud',
    title: 'Seri Editorial - Malam Zamrud',
    tier: 'premium',
    officialPrice: 89000,
  },
  'garis-waktu': {
    id: 'garis-waktu',
    title: 'Seri Editorial - Garis Waktu',
    tier: 'essential',
    officialPrice: 79000,
  },
  'kisah-abadi': {
    id: 'kisah-abadi',
    title: 'Seri Editorial - Kisah Abadi',
    tier: 'premium',
    officialPrice: 89000,
  },
  'pendar-senja': {
    id: 'pendar-senja',
    title: 'Seri Editorial - Pendar Senja',
    tier: 'essential',
    officialPrice: 79000,
  },
  'harmoni-alam': {
    id: 'harmoni-alam',
    title: 'Seri Editorial - Harmoni Alam',
    tier: 'essential',
    officialPrice: 69000,
  },
  'klasik-modern': {
    id: 'klasik-modern',
    title: 'Seri Editorial - Klasik Modern',
    tier: 'essential',
    officialPrice: 69000,
  },
  'pesona-batik': {
    id: 'pesona-batik',
    title: 'Seri Editorial - Pesona Batik',
    tier: 'essential',
    officialPrice: 79000,
  },
  'monokrom-anggun': {
    id: 'monokrom-anggun',
    title: 'Seri Editorial - Monokrom Anggun',
    tier: 'essential',
    officialPrice: 79000,
  },
};

/**
 * Validasi dan ambil harga paket resmi dari backend
 */
export function resolvePackagePrice(packageId: string): PackagePricingItem | null {
  if (!packageId) return null;
  const cleanId = String(packageId).trim().toLowerCase();
  
  if (OFFICIAL_PACKAGES[cleanId]) {
    return OFFICIAL_PACKAGES[cleanId];
  }

  // Jika paket diawali standar- tapi belum terdaftar spesifik, gunakan standar default Rp49.000
  if (cleanId.startsWith('standar-')) {
    return {
      id: cleanId,
      title: `Seri Standar (${cleanId})`,
      tier: 'standar',
      officialPrice: 49000,
    };
  }

  return null;
}
