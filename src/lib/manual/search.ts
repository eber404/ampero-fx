type SearchableItem = {
  title: string;
  description: string;
  pedalboards?: string[];
};

export function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function filterManualItems<T extends SearchableItem>(items: T[], query: string): T[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return items.slice();
  }

  return items.filter((item) => {
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery)
      || item.pedalboards?.some((pedalboard) => pedalboard.toLowerCase().includes(normalizedQuery))
    );
  });
}
