import type { ManualItem } from './types';

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterManualItems(items: ManualItem[], query: string): ManualItem[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return items.slice();
  }

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
    );
  });
}
