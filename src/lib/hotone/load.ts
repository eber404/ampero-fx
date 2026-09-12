import type { HotoneUnifiedEffect } from './types';

function isHotoneUnifiedEffect(value: unknown, index: number): value is HotoneUnifiedEffect {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid Hotone catalog item at index ${index}: expected an object`);
  }

  const { title, description, category, subtype, pedalboards } = value as Record<string, unknown>;

  if (typeof title !== 'string' || typeof description !== 'string' || typeof category !== 'string') {
    throw new Error(`Invalid Hotone catalog item at index ${index}: expected title, description, and category strings`);
  }

  if (subtype !== undefined && typeof subtype !== 'string') {
    throw new Error(`Invalid Hotone catalog item at index ${index}: expected subtype to be a string when present`);
  }

  if (!Array.isArray(pedalboards) || !pedalboards.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid Hotone catalog item at index ${index}: expected pedalboards to be a string array`);
  }

  return true;
}

export async function loadHotoneEffects(fetchImpl: typeof fetch = fetch): Promise<HotoneUnifiedEffect[]> {
  const response = await fetchImpl(`${import.meta.env.BASE_URL}data/hotone-effects.json`);

  if (!response.ok) {
    throw new Error(`Failed to load Hotone catalog: HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
  }

  const data = (await response.json()) as unknown;

  if (!Array.isArray(data)) {
    throw new Error('Invalid Hotone catalog data: expected an array');
  }

  data.forEach((item, index) => {
    isHotoneUnifiedEffect(item, index);
  });

  return data;
}
