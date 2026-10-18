export type PublicRateLimitAction = 'login' | 'guestbook' | 'rsvp';

export async function requestRateLimitPermit(action: PublicRateLimitAction): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`/api/security/rate-limit/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      credentials: 'same-origin',
    });
  } catch {
    throw new Error('Layanan keamanan sementara tidak tersedia. Coba lagi sebentar lagi.');
  }

  if (response.status === 429) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.');
  }
  if (!response.ok) {
    throw new Error('Permintaan tidak dapat diverifikasi. Coba lagi sebentar lagi.');
  }
}
