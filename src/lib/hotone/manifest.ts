import type { HotoneManualSource } from './types';

export function normalizeManualManifest(entries: HotoneManualSource[]): HotoneManualSource[] {
  return [...entries].sort((a, b) => a.productId.localeCompare(b.productId));
}

export function hasManualChanges(previous: HotoneManualSource[], next: HotoneManualSource[]): boolean {
  return JSON.stringify(normalizeManualManifest(previous)) !== JSON.stringify(normalizeManualManifest(next));
}
