import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadManualItems } from './load';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('loadManualItems', () => {
  it('loads items from the static JSON file', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => [{ title: 'Face Fuzz', description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal' }],
      }),
    );

    await expect(loadManualItems()).resolves.toEqual([
      { title: 'Face Fuzz', description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal' },
    ]);
  });

  it('throws a clear error when an item is malformed', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => [{ title: 'Face Fuzz', description: 123 }],
      }),
    );

    await expect(loadManualItems()).rejects.toThrow('Invalid manual catalog item at index 0');
  });
});
