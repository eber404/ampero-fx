import type { HotoneEffectInput, HotoneUnifiedEffect } from './types';

export function mergeHotoneEffects(items: HotoneEffectInput[]): HotoneUnifiedEffect[] {
  const merged = new Map<string, HotoneUnifiedEffect>();

  for (const item of items) {
    const key = `${item.title}\u0000${item.description}\u0000${item.category}\u0000${item.subtype ?? ''}`;
    const current = merged.get(key) ?? {
      title: item.title,
      description: item.description,
      category: item.category,
      subtype: item.subtype,
      pedalboards: [],
    };

    current.pedalboards = [...new Set([...current.pedalboards, item.pedalboard])].sort();
    merged.set(key, current);
  }

  return [...merged.values()].sort((a, b) => a.title.localeCompare(b.title));
}
