/**
 * Utility untuk menangani Subdomain Undangan (misal: kirana-adhitya.sekarsiti.com)
 * atau fallback ke localhost/query params jika sedang development.
 */

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname.toLowerCase();

  // Abaikan localhost, IP 127.0.0.1, atau format IP langsung
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.localhost') ||
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  ) {
    // Mode dev bisa dites dengan parameter ?subdomain=nama-klien
    const urlParams = new URLSearchParams(window.location.search);
    const mockSubdomain = urlParams.get('subdomain');
    return mockSubdomain ? mockSubdomain.trim().toLowerCase() : null;
  }

  // Pisahkan bagian domain
  // Contoh: kirana-adhitya.sekarsiti.com -> ['kirana-adhitya', 'sekarsiti', 'com']
  const parts = hostname.split('.');

  // Jika ada subdomain sebelum root domain (misal sekarsiti.com memiliki 2 parts, subdomain membuat jadi >= 3 parts)
  if (parts.length >= 3) {
    const sub = parts[0];
    // Abaikan jika subdomain adalah www, app, admin, api
    if (['www', 'app', 'admin', 'api', 'stage'].includes(sub)) {
      return null;
    }
    return sub;
  }

  return null;
}

/**
 * Menghasilkan Link Undangan berbasis Subdomain jika domain produksi terkonfigurasi,
 * atau berbasis path/query parameter dengan cerdas.
 */
export function buildInvitationUrl(slug: string, id: string): string {
  if (typeof window === 'undefined') return '';

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';

  // Cek apakah ada ROOT_DOMAIN yang ditentukan di environment (misal: "sekarsiti.com")
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN;

  if (rootDomain && !hostname.includes('localhost')) {
    return `${protocol}//${slug}.${rootDomain}`;
  }

  // Jika di localhost / preview mode biasa
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port}/?subdomain=${slug}`;
  }

  // Format fleksibel jika menggunakan domain standar
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    const baseDomain = parts.slice(-2).join('.');
    return `${protocol}//${slug}.${baseDomain}${port}`;
  }

  return `${window.location.origin}/?client=${id}`;
}
