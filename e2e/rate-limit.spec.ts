import { expect, test } from '@playwright/test';

test('login dibatasi setelah sepuluh permintaan dalam jendela waktu', async ({ request }) => {
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await request.post('/api/security/rate-limit?action=login', { data: {} });
    expect(response.status()).toBe(204);
  }

  const blocked = await request.post('/api/security/rate-limit?action=login', { data: {} });
  expect(blocked.status()).toBe(429);
});

test('ucapan dibatasi per undangan setelah sepuluh kiriman', async ({ request }) => {
  const scope = `wish-${Date.now()}`;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await request.post('/api/security/rate-limit?action=guestbook', { data: { scope } });
    expect(response.status()).toBe(204);
  }

  const blocked = await request.post('/api/security/rate-limit?action=guestbook', { data: { scope } });
  expect(blocked.status()).toBe(429);

  const differentInvitation = await request.post('/api/security/rate-limit?action=guestbook', {
    data: { scope: `${scope}-other` },
  });
  expect(differentInvitation.status()).toBe(204);
});

test('reservasi dibatasi setelah sepuluh kiriman per undangan', async ({ request }) => {
  const scope = `rsvp-${Date.now()}`;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    const response = await request.post('/api/security/rate-limit?action=rsvp', { data: { scope } });
    expect(response.status()).toBe(204);
  }

  const blocked = await request.post('/api/security/rate-limit?action=rsvp', { data: { scope } });
  expect(blocked.status()).toBe(429);
});
