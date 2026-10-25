export interface PortalSessionData {
  code: string;
  pin: string;
  clientId: string;
  timestamp: number;
}

interface AttemptTracker {
  count: number;
  firstFailedAt: number;
  lockedUntil: number | null;
}

const PORTAL_SESSION_KEY = 'sekarsiti_portal_session';
const PORTAL_ATTEMPTS_KEY = 'sekarsiti_portal_attempts';

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 hari aktif
const MAX_FAILED_ATTEMPTS = 5; // Maksimal 5x salah PIN berturut-turut
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // Dikunci 15 menit jika gagal 5x
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000; // Jendela hitungan 10 menit

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
 * Menghapus sesi portal mempelai saat logout atau saat mendeteksi mismatch
 */
export function clearPortalSession(): void {
  try {
    localStorage.removeItem(PORTAL_SESSION_KEY);
  } catch (err) {
    console.error('Gagal menghapus sesi portal:', err);
  }
}

/**
 * Memeriksa apakah pemanggil adalah pemilik sesi portal yang sah untuk ID/slug tertentu (IDOR check)
 */
export function isAuthorizedPortalSession(
  targetId: string,
  targetSlug?: string,
  targetAccessCode?: string
): boolean {
  const session = getPortalSession();
  if (!session || !session.clientId) return false;

  const cleanTargetId = (targetId || '').trim().toLowerCase();
  const cleanTargetSlug = (targetSlug || '').trim().toLowerCase();
  const cleanTargetCode = (targetAccessCode || '').trim().toLowerCase();
  const sessionClient = session.clientId.trim().toLowerCase();
  const sessionCode = session.code.trim().toLowerCase();

  return (
    sessionClient === cleanTargetId ||
    (Boolean(cleanTargetSlug) && sessionCode === cleanTargetSlug) ||
    (Boolean(cleanTargetCode) && sessionCode === cleanTargetCode)
  );
}

function getAttemptsStore(): Record<string, AttemptTracker> {
  try {
    const raw = localStorage.getItem(PORTAL_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAttemptsStore(store: Record<string, AttemptTracker>): void {
  try {
    localStorage.setItem(PORTAL_ATTEMPTS_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Memeriksa apakah kode akses tertentu sedang dikunci akibat percobaan salah berulang (Brute-force protection)
 */
export function checkPortalLockout(code: string): { isLocked: boolean; remainingSeconds: number } {
  if (!code) return { isLocked: false, remainingSeconds: 0 };
  const cleanKey = code.trim().toLowerCase();
  const store = getAttemptsStore();
  const record = store[cleanKey];

  if (!record || !record.lockedUntil) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  if (now < record.lockedUntil) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // Lockout telah selesai, bersihkan status
  delete store[cleanKey];
  saveAttemptsStore(store);
  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * Mencatat kegagalan verifikasi PIN dan mengaktifkan penguncian jika mencapai batas (Max 5x)
 */
export function recordPortalFailedAttempt(code: string): {
  isLocked: boolean;
  remainingAttempts: number;
  remainingSeconds: number;
} {
  if (!code) {
    return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS, remainingSeconds: 0 };
  }

  const cleanKey = code.trim().toLowerCase();
  const store = getAttemptsStore();
  const now = Date.now();
  const current = store[cleanKey] || { count: 0, firstFailedAt: now, lockedUntil: null };

  // Reset hitungan jika jeda percobaan sudah melewati window 10 menit
  if (now - current.firstFailedAt > ATTEMPT_WINDOW_MS && !current.lockedUntil) {
    current.count = 0;
    current.firstFailedAt = now;
  }

  current.count += 1;

  if (current.count >= MAX_FAILED_ATTEMPTS) {
    current.lockedUntil = now + LOCKOUT_DURATION_MS;
    store[cleanKey] = current;
    saveAttemptsStore(store);
    return {
      isLocked: true,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
    };
  }

  store[cleanKey] = current;
  saveAttemptsStore(store);

  return {
    isLocked: false,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - current.count),
    remainingSeconds: 0
  };
}

/**
 * Menghapus catatan percobaan gagal setelah berhasil login dengan kredensial yang tepat
 */
export function resetPortalFailedAttempts(code: string): void {
  if (!code) return;
  const cleanKey = code.trim().toLowerCase();
  const store = getAttemptsStore();
  if (store[cleanKey]) {
    delete store[cleanKey];
    saveAttemptsStore(store);
  }
}
