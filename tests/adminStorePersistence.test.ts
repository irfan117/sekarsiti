import test from 'node:test';
import assert from 'node:assert/strict';
import { readPersistedJson, writePersistedJson } from '../src/utils/persistedStore.ts';

const makeLocalStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); }
  };
};

test('persistedStore saves custom music entries across refreshes', () => {
  const storage = makeLocalStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
    writable: true
  });

  const payload = [{
    id: 'INV-TEST',
    clientName: 'Test Client',
    songTitle: 'Lagu Custom',
    audioUrl: 'https://example.com/music.mp3'
  }];

  writePersistedJson('sekarsiti_admin_orders_v1', payload);
  const restored = readPersistedJson('sekarsiti_admin_orders_v1', [] as typeof payload);

  assert.deepEqual(restored, payload);
  assert.equal(restored[0].audioUrl, 'https://example.com/music.mp3');
});
