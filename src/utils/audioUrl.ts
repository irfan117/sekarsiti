/** URL Google Actions Sounds sudah mati (404) — jangan dipakai lagi. */
export function isBrokenAudioUrl(url?: string | null): boolean {
  if (!url) return true;
  return url.includes('actions.google.com/sounds');
}

export function isPlayableAudioUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  if (isBrokenAudioUrl(url)) return false;
  return /^https?:\/\//i.test(url) || url.startsWith('/');
}

export function sanitizeAudioUrl(url?: string | null): string {
  return isPlayableAudioUrl(url) ? String(url) : '';
}
