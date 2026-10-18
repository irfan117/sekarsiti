import { expect, test } from '@playwright/test';

test('login dibatasi setelah lima permintaan dalam jendela waktu', async ({ request }) => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await request.post('/api/security/rate-limit/login', { data: {} });
    expect(response.status()).toBe(204);
  }

  const blocked = await request.post('/api/security/rate-limit/login', { data: {} });
  expect(blocked.status()).toBe(429);
});

test('ucapan dibatasi setelah tiga kiriman dalam jendela waktu', async ({ request }) => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const response = await request.post('/api/security/rate-limit/guestbook', { data: {} });
    expect(response.status()).toBe(204);
  }

  const blocked = await request.post('/api/security/rate-limit/guestbook', { data: {} });
  expect(blocked.status()).toBe(429);
});

test('reservasi dibatasi setelah lima kiriman dalam jendela waktu', async ({ request }) => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await request.post('/api/security/rate-limit/rsvp', { data: {} });
    expect(response.status()).toBe(204);
  }

  const blocked = await request.post('/api/security/rate-limit/rsvp', { data: {} });
  expect(blocked.status()).toBe(429);
});
