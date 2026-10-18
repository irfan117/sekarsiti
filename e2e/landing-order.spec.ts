import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Prevent E2E orders from touching a configured Supabase project.
  await page.route(/https:\/\/[^/]+\.supabase\.co\/.*/, (route) => route.abort());
  await page.addInitScript(() => {
    localStorage.clear();
    (window as Window & { __openedUrls?: string[] }).__openedUrls = [];
    window.open = ((url?: string | URL) => {
      (window as Window & { __openedUrls?: string[] }).__openedUrls?.push(String(url ?? ''));
      return null;
    }) as typeof window.open;
  });
});

test('landing page menampilkan koleksi template', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#koleksi article')).toHaveCount(7);
  await expect(page.locator('#koleksi')).toContainText('Ruang Rasa');
  await expect(page.locator('#koleksi')).toContainText('Atlas Cinta');
});

test('kartu Malam Zamrud membuka demo yang sesuai', async ({ page }) => {
  await page.goto('/');

  const templateCard = page.locator('#koleksi article').filter({ hasText: 'Malam Zamrud' });
  await templateCard.getByRole('button', { name: 'Demo', exact: true }).click();

  await expect(page).toHaveURL(/\?demo=malam-zamrud$/);
});

test('tautan admin membuka layar login tanpa sesi', async ({ page }) => {
  await page.goto('/?admin=true');

  await expect(page.getByRole('heading', { name: 'sekarsiti studio' })).toBeVisible();
  await expect(page.getByPlaceholder('admin@sekarsiti.com')).toBeVisible();
  await expect(page.getByText('Kata Sandi', { exact: true })).toBeVisible();
});

test('order dari landing tersimpan sebagai draft dan membuka WhatsApp', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Pesan Sekarang' }).click();

  await expect(page.getByRole('heading', { name: 'Pesan Undangan Digital' })).toBeVisible();
  await page.getByPlaceholder('Contoh: Adhitya / Kirana').fill('Calon Client E2E');
  await page.getByPlaceholder('081234567890').fill('081234567890');
  await page.getByRole('button', { name: 'Kirim Pesanan ke WhatsApp' }).click();

  await expect(page.getByRole('heading', { name: 'Pesan Undangan Digital' })).toHaveCount(0);
  const savedOrders = await page.evaluate(() => localStorage.getItem('sekarsiti_admin_orders_v1'));
  expect(savedOrders).toContain('Calon Client E2E');
  const openedUrls = await page.evaluate(
    () => (window as Window & { __openedUrls?: string[] }).__openedUrls ?? []
  );
  expect(openedUrls.some((url) => url.startsWith('https://wa.me/'))).toBe(true);
});
