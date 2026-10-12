export function readPersistedJson<T>(storageKey: string, fallback: T): T {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return fallback;

    const raw = storage.getItem(storageKey);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writePersistedJson<T>(storageKey: string, value: T): void {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    storage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Ignore storage failures: app should keep working even in private mode or when storage is unavailable.
  }
}

export function clearPersistedJson(storageKey: string): void {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage failures.
  }
}
