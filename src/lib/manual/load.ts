import type { ManualItem } from './types';

function isManualItem(value: unknown, index: number): value is ManualItem {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid manual catalog item at index ${index}: expected an object`);
  }

  const { title, description } = value as Record<string, unknown>;

  if (typeof title !== 'string' || typeof description !== 'string') {
    throw new Error(`Invalid manual catalog item at index ${index}: expected title and description strings`);
  }

  return true;
}

export async function loadManualItems(): Promise<ManualItem[]> {
  const response = await fetch('/data/ampero-mini-models.json');
  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid manual catalog data: expected an array');
  }

  data.forEach((item, index) => {
    isManualItem(item, index);
  });

  return data;
}
