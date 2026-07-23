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
  let response: Response;

  try {
    response = await fetch('/data/ampero-mini-models.json');
  } catch (error) {
    throw new Error(`Failed to load manual catalog: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to load manual catalog: HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error(`Failed to parse manual catalog JSON: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid manual catalog data: expected an array');
  }

  data.forEach((item, index) => {
    isManualItem(item, index);
  });

  return data;
}
