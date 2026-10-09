export interface PortalSessionData {
  code: string;
  pin: string;
  clientId: string;
  timestamp: number;
}

const PORTAL_SESSION_KEY = 'sekarsiti_portal_session';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 hari aktif

/**
 * Menyimpan sesi login portal mempelai ke localStorage
 */
export function savePortalSession(code: string, pin: string, clientId: string): void {
  try {
    const session: PortalSessionData = {
      code: code.trim(),
      pin: pin.trim(),
      clientId,
      timestamp: Date.now()
    };
    localStorage.setItem(PORTAL_SESSION_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Gagal menyimpan sesi portal mempelai:', err);
  }
}

/**
 * Mengambil sesi portal mempelai yang masih aktif dan valid
 */
export function getPortalSession(): PortalSessionData | null {
  try {
    const raw = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!raw) return null;

    const parsed: PortalSessionData = JSON.parse(raw);
    if (!parsed || !parsed.code || !parsed.pin) {
      clearPortalSession();
      return null;
    }

    // Periksa apakah sesi telah kedaluwarsa (lebih dari 14 hari)
    if (Date.now() - parsed.timestamp > SESSION_TTL_MS) {
      clearPortalSession();
      return null;
    }

    return parsed;
  } catch (err) {
    clearPortalSession();
    return null;
  }
}

/**
 * Menghapus sesi portal mempelai saat logout
 */
export function clearPortalSession(): void {
  try {
    localStorage.removeItem(PORTAL_SESSION_KEY);
  } catch (err) {
    console.error('Gagal menghapus sesi portal:', err);
  }
}

