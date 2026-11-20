type SearchableItem = {
  title: string;
  description: string;
  pedalboards?: string[];
};

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function queryTerms(query: string): string[] {
  return normalizeQuery(query).split(/\s+/).filter(Boolean);
}

function searchableText(item: SearchableItem): string {
  return [item.title, item.description, ...(item.pedalboards ?? [])].join(' ').toLowerCase();
}

export function filterManualItems<T extends SearchableItem>(items: T[], query: string | readonly string[]): T[] {
  const terms = typeof query === 'string' ? queryTerms(query) : query.flatMap(queryTerms);

  if (terms.length === 0) {
    return items.slice();
  }

  return items.filter((item) => {
    const haystack = searchableText(item);
    return terms.every((term) => haystack.includes(term));
  });
}
