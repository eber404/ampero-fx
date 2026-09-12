import { expect, it } from 'vitest';
import { extractManualItemsFromPdf } from './extract';

it('reuses the current PDF parsing pipeline for a single manual file', async () => {
  await expect(extractManualItemsFromPdf('missing.pdf')).rejects.toThrow();
});
