import { afterEach, expect, it, vi } from 'vitest';
import { loadHotoneEffects } from './load';

afterEach(() => vi.unstubAllEnvs());

it('loads unified catalog items with pedalboards', async () => {
  vi.stubEnv('BASE_URL', '/ampero-fx/');
  let requestedUrl = '';
  const fetchImpl = async (input: RequestInfo | URL) => {
    requestedUrl = String(input);
    return Response.json([
      {
        title: 'Black Tail',
        description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)',
        category: 'drives',
        subtype: 'distortion',
        pedalboards: ['Ampero Mini', 'Ampero II Stomp'],
      },
    ]);
  };

  await expect(loadHotoneEffects(fetchImpl)).resolves.toEqual([
    {
      title: 'Black Tail',
      description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)',
      category: 'drives',
      subtype: 'distortion',
      pedalboards: ['Ampero Mini', 'Ampero II Stomp'],
    },
  ]);
  expect(requestedUrl).toBe('/ampero-fx/data/hotone-effects.json');
});
