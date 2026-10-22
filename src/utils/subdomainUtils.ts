/**
 * Utility untuk menangani URL Undangan Klien.
 * Secara default menggunakan path/query pada domain utama (misal: https://ssiti.tech/kirana-adhitya)
 * agar langsung dapat diakses di Vercel tanpa memerlukan konfigurasi Wildcard DNS (*.ssiti.tech).
 * Tetap mendukung pembacaan subdomain apabila VITE_ENABLE_SUBDOMAIN=true diaktifkan.
 */

const RESERVED_PATHS = new Set([
  '',
  'index.html',
  'admin',
  'portal',
  'order',
  'login',
  'api',
  'assets',
  'images',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
]);

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);

  // 1. Jika sedang membuka halaman khusus (admin, portal, demo katalog, form order), jangan anggap sebagai slug klien
  if (
    urlParams.get('admin') === 'true' ||
    urlParams.get('view') === 'admin' ||
    urlParams.get('view') === 'portal' ||
    urlParams.get('portal') ||
    urlParams.get('demo') ||
    urlParams.get('order') ||
    urlParams.get('view') === 'order'
  ) {
    return null;
  }

  // 2. Cek parameter eksplisit ?client=... atau ?undangan=... atau ?subdomain=...
  const querySlug =
    urlParams.get('client') ||
    urlParams.get('undangan') ||
    urlParams.get('subdomain');
  if (querySlug && querySlug.trim()) {
    return querySlug.trim().toLowerCase();
  }

  // 3. Cek path URL pada domain utama (contoh: https://ssiti.tech/fgd-gfgdg atau https://ssiti.tech/u/fgd-gfgdg)
  const rawPath = decodeURIComponent(window.location.pathname || '')
    .replace(/^\/+|\/+$/g, '')
    .trim();

  if (rawPath) {
    const segments = rawPath.split('/').filter(Boolean);
    if (segments.length === 1 && !RESERVED_PATHS.has(segments[0].toLowerCase())) {
      return segments[0].toLowerCase();
    }
    if (
      segments.length === 2 &&
      (segments[0].toLowerCase() === 'u' || segments[0].toLowerCase() === 'undangan') &&
      !RESERVED_PATHS.has(segments[1].toLowerCase())
    ) {
      return segments[1].toLowerCase();
    }
  }

  // 4. Fallback: Cek subdomain jika diakses melalui subdomain (misal: kirana-adhitya.ssiti.tech)
  const hostname = window.location.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.vercel.app') ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    return null;
  }

  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const sub = parts[0];
    if (!['www', 'app', 'admin', 'api', 'stage'].includes(sub)) {
      return sub;
    }
  }

  return null;
}

/**
 * Menghasilkan Link Undangan pada domain utama (contoh: https://ssiti.tech/kirana-adhitya)
 * sehingga langsung aktif tanpa perlu setting Wildcard Subdomain DNS.
 * Jika VITE_ENABLE_SUBDOMAIN === 'true' dan VITE_ROOT_DOMAIN disetel, barulah menggunakan subdomain.
 */
export function buildInvitationUrl(slug: string, id: string): string {
  if (typeof window === 'undefined') return '';

  const identifier = encodeURIComponent((slug || id || '').trim());
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;

  const enableSubdomain = import.meta.env.VITE_ENABLE_SUBDOMAIN === 'true';
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN?.trim();

  if (enableSubdomain && rootDomain && !hostname.includes('localhost')) {
    return `${protocol}//${identifier}.${rootDomain}`;
  }

  return `${window.location.origin}/${identifier}`;
}
