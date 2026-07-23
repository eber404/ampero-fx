import { readFile } from 'node:fs/promises';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextFragment } from './types';

type PdfTextItem = {
  str?: string;
  transform?: number[];
};

export async function extractPdfTextFragments(pdfPath: string): Promise<TextFragment[]> {
  const data = await readFile(pdfPath);
  const document = await getDocument({
    data: new Uint8Array(data),
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;

  const fragments: TextFragment[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();

    for (const item of textContent.items as PdfTextItem[]) {
      const text = item.str?.trim();
      const transform = item.transform;

      if (!text || !transform || transform.length < 6) {
        continue;
      }

      fragments.push({
        page: pageNumber,
        text,
        x: transform[4],
        y: transform[5],
      });
    }
  }

  await document.destroy();

  return fragments;
}
