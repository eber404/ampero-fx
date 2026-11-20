import type { HotoneManualSource } from './types';

function slugifyProductName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function parseMaybeJson<T>(value: unknown): T | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function isCatalogManualRecord(name: string): boolean {
  return /ampero/i.test(name) && /manual|effect list/i.test(name) && !/drum rhythm|midi control|operating guide|switch\+| press\b|control\b|sound clone/i.test(name);
}

/**
 * Effect lists are the table-first documents that carry the full model catalog.
 * User manuals mostly describe the firmware and yield few or no effect rows, so
 * they rank below an effect list even when they are newer.
 */
function sourceKindRank(name: string): number {
  return /effect list/i.test(name) ? 2 : 1;
}

function deriveProductName(record: { name?: string; keyword?: string }): string {
  const keywords = parseMaybeJson<string[]>(record.keyword);
  const keyword = keywords?.[0] ? normalizeWhitespace(keywords[0]) : '';
  if (keyword && !/manual|list|guide|control|rhythm|press|switch/i.test(keyword)) {
    return keyword;
  }

  const name = normalizeWhitespace(record.name ?? '');
  const parenthesized = name.match(/\((Ampero[^)]+)\)/i)?.[1];
  if (parenthesized) {
    return normalizeWhitespace(parenthesized);
  }

  const stripped = name
    .replace(/\b(User Manual|Online Manual|Manual|Effect List|Drum Rhythm List|MIDI Control Information List|Operating Guide)\b.*$/i, '')
    .replace(/[_\s-]+$/g, '')
    .trim();

  return stripped || name;
}

function unwrapHotoneData<T>(value: unknown): T {
  if (Array.isArray(value)) {
    return value as T;
  }

  if (value && typeof value === 'object' && 'data' in value) {
    return (value as { data: T }).data;
  }

  return value as T;
}

export async function fetchHotoneManualSources(fetchImpl: typeof fetch = fetch): Promise<HotoneManualSource[]> {
  const supportTypesResponse = await fetchImpl('https://www.hotoneaudio.com/api/index/support_type?show_lang=1');
  if (!supportTypesResponse.ok) {
    throw new Error(`Failed to load Hotone support types: HTTP ${supportTypesResponse.status}`);
  }

  const supportTypes = unwrapHotoneData<Array<{ support_type_id: number }>>(await supportTypesResponse.json());
  if (!supportTypes.some((item) => item.support_type_id === 1)) {
    throw new Error('Hotone manual support type not found');
  }

  const manualsResponse = await fetchImpl('https://www.hotoneaudio.com/api/index/support?language=1&support_type=1');
  if (!manualsResponse.ok) {
    throw new Error(`Failed to load Hotone manuals: HTTP ${manualsResponse.status}`);
  }

  const manuals = unwrapHotoneData<Array<{
    support_id: number;
    name: string;
    updated_at: string;
    language?: number;
    product_id?: string;
    file?: string;
    keyword?: string;
  }>>(await manualsResponse.json());

  const byProduct = new Map<string, HotoneManualSource>();
  const rankByProduct = new Map<string, number>();

  for (const record of manuals) {
    if (record.language !== undefined && record.language !== 1) continue;
    if (!isCatalogManualRecord(record.name)) continue;
    const file = parseMaybeJson<{ url?: string }>(record.file);
    if (!file?.url) continue;

    const productName = deriveProductName({ name: record.name, keyword: record.keyword });
    const productId = normalizeWhitespace(record.product_id ?? productName).replace(/^\[|\]$/g, '');

    const next: HotoneManualSource = {
      productId: slugifyProductName(productId || productName),
      productName,
      manualId: record.support_id,
      manualUrl: file.url,
      updatedAt: record.updated_at,
    };

    const rank = sourceKindRank(record.name);
    const previous = byProduct.get(next.productId);
    const previousRank = rankByProduct.get(next.productId) ?? 0;
    const isNewer = previous
      ? previous.updatedAt < next.updatedAt ||
        (previous.updatedAt === next.updatedAt && previous.manualId < next.manualId)
      : false;

    if (!previous || rank > previousRank || (rank === previousRank && isNewer)) {
      byProduct.set(next.productId, next);
      rankByProduct.set(next.productId, rank);
    }
  }

  return [...byProduct.values()].sort((a, b) => a.productName.localeCompare(b.productName));
}
