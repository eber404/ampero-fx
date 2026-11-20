import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchHotoneManualSources } from './api';
import { hasManualChanges, normalizeManualManifest } from './manifest';
import { extractManualItemsFromPdf } from '../manual/extract';
import { mergeHotoneEffects } from './merge';
import type { HotoneEffectInput, HotoneUnifiedEffect, HotoneManualSource } from './types';

const effectsPath = 'public/data/hotone-effects.json';
const manifestPath = 'public/data/hotone-manual-manifest.json';

export function formatPedalboardName(value: string): string {
  if (value === 'Ampero') {
    return 'Ampero Original';
  }

  return value;
}

export function buildUnifiedCatalog(items: HotoneEffectInput[]): HotoneUnifiedEffect[] {
  return mergeHotoneEffects(items);
}

async function readManifest(): Promise<HotoneManualSource[]> {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8')) as HotoneManualSource[];
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export async function downloadPdf(url: string, targetPath: string): Promise<void> {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const pdfBytes = new Uint8Array(await response.arrayBuffer());
      await writeFile(targetPath, pdfBytes);
      return;
    } catch (error) {
      if (attempt === 3) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to download ${url}: ${message}`);
      }
    }
  }
}

export async function syncHotoneCatalog(options: { force?: boolean } = {}): Promise<{ changed: boolean; count: number }> {
  const sources = await fetchHotoneManualSources();
  const previousManifest = await readManifest();
  const nextManifest = normalizeManualManifest(sources);
  const force = options.force ?? process.env.HOTONE_FORCE_SYNC === '1';

  if (!force && !hasManualChanges(previousManifest, nextManifest)) {
    return { changed: false, count: 0 };
  }

  const workdir = await mkdtemp(join(tmpdir(), 'hotone-sync-'));

  try {
    const extracted: HotoneEffectInput[] = [];

    for (const source of sources) {
      const pdfPath = join(workdir, `${source.productId}.pdf`);
      await downloadPdf(source.manualUrl, pdfPath);

      const items = await extractManualItemsFromPdf(pdfPath);
      for (const item of items) {
        extracted.push({ ...item, pedalboard: formatPedalboardName(source.productName) });
      }
    }

    const catalog = buildUnifiedCatalog(extracted);
    await writeFile(effectsPath, `${JSON.stringify(catalog, null, 2)}\n`);
    await writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`);

    return { changed: true, count: catalog.length };
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}
