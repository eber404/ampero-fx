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
        ok: true,
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
        ok: true,
        json: async () => [{ title: 'Face Fuzz', description: 123 }],
      }),
    );

    await expect(loadManualItems()).rejects.toThrow('Invalid manual catalog item at index 0');
  });

  it('throws a clear error when the response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => [],
      }),
    );

    await expect(loadManualItems()).rejects.toThrow('Failed to load manual catalog: HTTP 404 Not Found');
  });

  it('throws a clear error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    await expect(loadManualItems()).rejects.toThrow('Failed to load manual catalog: network down');
  });

  it('throws a clear error when JSON parsing fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Unexpected token');
        },
      }),
    );

    await expect(loadManualItems()).rejects.toThrow('Failed to parse manual catalog JSON: Unexpected token');
  });

  it('throws a clear error when the top-level payload is not an array', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ title: 'Face Fuzz' }),
      }),
    );

    await expect(loadManualItems()).rejects.toThrow('Invalid manual catalog data: expected an array');
  });
});
