import { expect, test } from '@playwright/test';

test('loads the catalog, filters results, and shows empty state', async ({ page }) => {
  await page.route('**/data/hotone-effects.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      json: [
        {
          title: 'Black Tail',
          description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)',
          category: 'drives',
          subtype: 'distortion',
          pedalboards: ['Ampero Mini', 'Ampero II Stomp'],
        },
        {
          title: 'Voxy 1x12',
          description: 'Vintage VOX AC30 1x12 cabinet',
          category: 'cabs',
          subtype: '1x12',
          pedalboards: ['Ampero Mini'],
        },
      ],
    });
  });

  const loadPromise = page.goto('/');

  await expect(page.getByText('Loading catalog...')).toBeVisible();
  await loadPromise;

  await expect(page.getByRole('heading', { name: 'AMPERO FX catalog' })).toBeVisible();
  await expect(page.getByText('Black Tail')).toBeVisible();
  await expect(page.locator('li', { hasText: 'Black Tail' }).getByText(/Ampero Mini/i)).toBeVisible();
  await expect(page.getByText(/effects visible/i)).toBeVisible();

  const search = page.getByLabel('Search effects by title, description, or pedalboard');
  await search.fill('stomp');

  await expect(page.getByText('Black Tail')).toBeVisible();
  await expect(page.getByText('Voxy 1x12')).toHaveCount(0);
  await expect(page.getByText(/\d+ of \d+ effects visible/i)).toBeVisible();

  await search.fill('vox');

  await expect(page.getByText('Voxy 1x12')).toBeVisible();
  await expect(page.getByText('Black Tail')).toHaveCount(0);

  await search.fill('zzzz-not-found');
  await expect(page.getByText('No effects match "zzzz-not-found".')).toBeVisible();

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByText('Black Tail')).toBeVisible();
});
