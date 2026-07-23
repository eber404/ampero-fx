import { expect, test } from '@playwright/test';

test('loads the catalog, filters results, and shows empty state', async ({ page }) => {
  await page.route('**/data/ampero-mini-models.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.continue();
  });

  const loadPromise = page.goto('/');

  await expect(page.getByText('Loading catalog...')).toBeVisible();
  await loadPromise;

  await expect(page.getByRole('heading', { name: 'Models catalog' })).toBeVisible();
  await expect(page.getByText('Smart Gate')).toBeVisible();
  await expect(page.getByText(/models visible/i)).toBeVisible();

  const search = page.getByLabel('Search models by title or description');
  await search.fill('vox');

  await expect(page.getByText('Voxy 1x12')).toBeVisible();
  await expect(page.getByText('Smart Gate')).toHaveCount(0);
  await expect(page.getByText(/\d+ of \d+ models visible/i)).toBeVisible();

  await search.fill('zzzz-not-found');
  await expect(page.getByText('No models match "zzzz-not-found".')).toBeVisible();

  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByText('Smart Gate')).toBeVisible();
});
