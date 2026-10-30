export type PublicRateLimitAction = 'login' | 'guestbook' | 'rsvp';

export async function requestRateLimitPermit(action: PublicRateLimitAction, scope?: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/security/rate-limit?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope }),
      credentials: 'same-origin',
    });
  } catch {
    // Jika endpoint backend rate-limit tidak terjangkau / offline, izinkan request (fail-open)
    return;
  }

  // Jika rate limit terlampaui (429), blokir dan beri tahu user
  if (response.status === 429) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.');
  }

  // Jika server hosting statis (seperti Cloudflare Pages / Vercel SPA) mengembalikan 404 / 405
  // karena tidak ada serverless backend rate-limit, fallback ke allow (fail-open)
  // agar tidak memblokir user login atau mengirim ucapan/RSVP.
  if (!response.ok && (response.status === 404 || response.status === 405 || response.status >= 500)) {
    return;
  }

  if (!response.ok) {
    throw new Error('Permintaan tidak dapat diverifikasi. Coba lagi sebentar lagi.');
  }
}
