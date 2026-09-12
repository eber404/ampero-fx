import { expect, it } from 'vitest';
import { hasManualChanges, normalizeManualManifest } from './manifest';

it('detects manual manifest changes', () => {
  const previous = normalizeManualManifest([
    {
      productId: 'ampero-mini',
      productName: 'Ampero Mini',
      manualId: 12,
      manualUrl: 'https://res.hotoneaudio.com/prod/support/new.pdf',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ]);

  const next = normalizeManualManifest([
    {
      productId: 'ampero-mini',
      productName: 'Ampero Mini',
      manualId: 13,
      manualUrl: 'https://res.hotoneaudio.com/prod/support/newer.pdf',
      updatedAt: '2025-02-01T00:00:00.000Z',
    },
  ]);

  expect(hasManualChanges(previous, next)).toBe(true);
});
