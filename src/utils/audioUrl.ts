/** URL Google Actions Sounds sudah mati (404) — jangan dipakai lagi. */
export function isBrokenAudioUrl(url?: string | null): boolean {
  if (!url) return true;
  return url.includes('actions.google.com/sounds');
}

/**
 * Mengonversi URL audio (termasuk link Google Drive atau path lokal yang tersimpan
 * dengan domain/origin lama) agar tetap aman diputar meskipun domain utama berubah
 * atau diakses melalui subdomain klien.
 */
export function normalizeAudioUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed || isBrokenAudioUrl(trimmed)) return '';

  if (trimmed.startsWith('data:audio/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Konversi link berbagi Google Drive menjadi direct audio stream URL
  const gdriveFileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveFileMatch && gdriveFileMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${gdriveFileMatch[1]}`;
  }
  const gdriveIdMatch = trimmed.match(/(?:drive|docs)\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
  if (gdriveIdMatch && gdriveIdMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${gdriveIdMatch[1]}`;
  }

  // Jika URL absolut mengarah ke folder aset lokal (/audio/, /music/, /sounds/)
  // dari domain lama atau localhost, ubah menjadi root-relative path agar selalu
  // mengikuti domain/subdomain aktif tanpa kendala CORS.
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const parsed = new URL(trimmed);
      const isExternalCdn =
        parsed.hostname.includes('cloudinary.com') ||
        parsed.hostname.includes('supabase.co') ||
        parsed.hostname.includes('google.com') ||
        parsed.hostname.includes('googleapis.com') ||
        parsed.hostname.includes('jsdelivr.net') ||
        parsed.hostname.includes('unpkg.com');

      if (!isExternalCdn && /^\/(audio|music|sounds|videos|assets)\//i.test(parsed.pathname)) {
        return `${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    // Abaikan jika gagal parse URL
  }

  return trimmed;
}

export function isPlayableAudioUrl(url?: string | null): boolean {
  const normalized = normalizeAudioUrl(url);
  if (!normalized) return false;
  return (
    /^https?:\/\//i.test(normalized) ||
    normalized.startsWith('/') ||
    normalized.startsWith('data:audio/') ||
    normalized.startsWith('blob:')
  );
}

export function sanitizeAudioUrl(url?: string | null): string {
  return normalizeAudioUrl(url);
}

