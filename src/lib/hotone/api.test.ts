import { expect, it } from 'vitest';
import { fetchHotoneManualSources } from './api';

it('selects the latest manual for each product', async () => {
  const fetchImpl = async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/support_type?show_lang=1')) {
      return Response.json({ code: 200, message: 'ok', data: [{ id: 1, support_type_id: 1, language: 1, type: 'User Manual' }] });
    }

    if (url.includes('/support?language=1&support_type=1')) {
      return Response.json({
        code: 200,
        message: 'ok',
        data: [
          {
            support_id: 11,
            name: 'Ampero Mini User Manual (Compatible with Firmware V1.0)',
            language: 1,
            product_id: '[92]',
            updated_at: '2024-01-01T00:00:00.000Z',
            file: '{"url":"https://res.hotoneaudio.com/prod/support/old.pdf"}',
            keyword: '["Ampero Mini"]',
          },
          {
            support_id: 12,
            name: 'Ampero Mini User Manual (Compatible with Firmware V2.2)',
            language: 1,
            product_id: '[92]',
            updated_at: '2025-01-01T00:00:00.000Z',
            file: '{"url":"https://res.hotoneaudio.com/prod/support/new.pdf"}',
            keyword: '["Ampero Mini"]',
          },
        ],
      });
    }

    throw new Error(`Unexpected url: ${url}`);
  };

  await expect(fetchHotoneManualSources(fetchImpl)).resolves.toEqual([
    {
      productId: '92',
      productName: 'Ampero Mini',
      manualId: 12,
      manualUrl: 'https://res.hotoneaudio.com/prod/support/new.pdf',
      updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ]);
});
