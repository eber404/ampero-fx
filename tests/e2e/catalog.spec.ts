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

  await expect(page.getByRole('heading', { name: 'Ampero FX catalog' })).toBeVisible();
  await expect(page.getByText('Black Tail')).toBeVisible();
  await expect(page.locator('li', { hasText: 'Black Tail' }).getByText(/Ampero Mini/i)).toBeVisible();
  await expect(page.getByText('2 effects')).toBeVisible();

  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill('stomp');
  await expect(page.getByText('1 of 2 effects', { exact: true })).toBeVisible();
  await search.press('Enter');
  await expect(search).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Remove tag stomp' })).toBeVisible();

  await expect(page.getByText('Black Tail')).toBeVisible();
  await expect(page.getByText('Voxy 1x12')).toHaveCount(0);
  await expect(page.getByText('1 of 2 effects')).toBeVisible();

  await page.getByRole('button', { name: 'Remove tag stomp' }).click();
  await search.fill('  vox   cab  ');
  await search.press('Enter');
  await expect(page.getByRole('button', { name: 'Remove tag vox' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove tag cab' })).toBeVisible();

  await expect(page.getByText('Voxy 1x12')).toBeVisible();
  await expect(page.getByText('Black Tail')).toHaveCount(0);
  await expect(page.getByText('1 of 2 effects')).toBeVisible();

  await search.press('Backspace');
  await expect(page.getByRole('button', { name: 'Remove tag cab' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Remove tag vox' })).toBeVisible();
  await expect(page.getByText('Voxy 1x12')).toBeVisible();
  await expect(page.getByText('Black Tail')).toHaveCount(0);

  await search.fill('stomp');
  await search.press('Enter');
  await expect(page.getByText('No effects match "vox stomp".')).toBeVisible();

  await search.fill('unfinished');
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(search).toHaveValue('');
  await expect(page.getByRole('button', { name: /^Remove tag / })).toHaveCount(0);
  await expect(page.getByText('Black Tail')).toBeVisible();
  await expect(page.getByText('Voxy 1x12')).toBeVisible();
});

test('filters draft words with active tags before Enter and preserves results when committed', async ({ page }) => {
  await page.route('**/data/hotone-effects.json', (route) => route.fulfill({
    json: [
      { title: 'Voxy 1x12', description: 'Vintage VOX AC30 cabinet', category: 'cabs', pedalboards: ['Ampero Mini'] },
      { title: 'Voxy drive', description: 'VOX distortion pedal', category: 'drives', pedalboards: ['Ampero Mini'] },
      { title: 'Black Tail', description: 'Rat distortion', category: 'drives', pedalboards: ['Ampero II Stomp'] },
    ],
  }));
  await page.goto('/');
  const search = page.getByRole('textbox', { name: 'Search', exact: true });
  await search.fill('vox cab');
  await expect(page.getByText('1 of 3 effects', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voxy 1x12', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voxy drive', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Remove tag / })).toHaveCount(0);

  await search.press('Enter');
  await expect(search).toHaveValue('');
  await expect(page.getByText('1 of 3 effects', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voxy 1x12', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove tag vox' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove tag cab' })).toBeVisible();

  await search.fill('stomp');
  await expect(page.getByText('No effects match "vox cab stomp".', { exact: true })).toBeVisible();
  await search.fill('');
  await expect(page.getByText('1 of 3 effects', { exact: true })).toBeVisible();
});

test('filters by pedalboard and combines it with the text search', async ({ page }) => {
  await page.route('**/data/hotone-effects.json', (route) => route.fulfill({
    json: [
      { title: 'Black Tail', description: 'Rat distortion', category: 'drives', pedalboards: ['Ampero Mini', 'Ampero II Stomp'] },
      { title: 'Voxy 1x12', description: 'VOX cabinet', category: 'cabs', pedalboards: ['Ampero Mini'] },
      { title: 'Stomp Phaser', description: 'Phase effect', category: 'modulation', pedalboards: ['Ampero II Stomp'] },
    ],
  }));
  await page.goto('/');

  const pedalboard = page.getByRole('combobox', { name: 'Pedalboard' });
  const effectType = page.getByRole('combobox', { name: 'Effect type' });
  await expect(pedalboard).toHaveValue('');
  await expect(effectType).toHaveValue('');

  const searchBounds = await page.getByRole('textbox', { name: 'Search', exact: true }).boundingBox();
  const pedalboardBounds = await pedalboard.boundingBox();
  const effectTypeBounds = await effectType.boundingBox();
  expect(searchBounds).not.toBeNull();
  expect(pedalboardBounds).not.toBeNull();
  expect(effectTypeBounds).not.toBeNull();
  expect(Math.abs(searchBounds!.y - pedalboardBounds!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(searchBounds!.y - effectTypeBounds!.y)).toBeLessThanOrEqual(1);

  await pedalboard.selectOption('Ampero II Stomp');

  await expect(page.getByText('2 of 3 effects', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Black Tail', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stomp Phaser', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Voxy 1x12', exact: true })).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Search', exact: true }).fill('black');
  await expect(page.getByText('1 of 3 effects', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Black Tail', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stomp Phaser', exact: true })).toHaveCount(0);
});

test('filters by effect type and combines it with the pedalboard filter', async ({ page }) => {
  await page.route('**/data/hotone-effects.json', (route) => route.fulfill({
    json: [
      { title: 'Black Tail', description: 'Rat distortion', category: 'drives', pedalboards: ['Ampero Mini', 'Ampero II Stomp'] },
      { title: 'Voxy 1x12', description: 'VOX cabinet', category: 'cabs', pedalboards: ['Ampero Mini'] },
      { title: 'Stomp Hall', description: 'Hall reverb', category: 'reverb', pedalboards: ['Ampero II Stomp'] },
    ],
  }));
  await page.goto('/');

  const effectType = page.getByRole('combobox', { name: 'Effect type' });
  await expect(effectType).toHaveValue('');
  await expect(effectType.locator('option[value="amps"]')).toHaveCount(1);
  await expect(effectType.locator('option[value="cabs"]')).toHaveCount(1);
  await expect(effectType.locator('option[value="reverb"]')).toHaveCount(1);

  await effectType.selectOption('reverb');
  await expect(page.getByText('1 of 3 effects', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Stomp Hall', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Black Tail', exact: true })).toHaveCount(0);

  await page.getByRole('combobox', { name: 'Pedalboard' }).selectOption('Ampero Mini');
  await expect(page.getByText('No effects match', { exact: false })).toBeVisible();
});
