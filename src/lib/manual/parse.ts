import type { ManualItem, ManualTable, ManualTableRow } from './types';

const FX_HEADER = 'FX Title';
const DESCRIPTION_HEADER = 'Description';
const MIC_HEADER = 'Mic Type';
const MIC_NAME_HEADER = 'Name';
const MIC_BASED_ON_HEADER = 'Based On';
const MIC_TYPE_HEADER = 'Type';

function normalizeCell(value: string | null | undefined): string {
  return value ? value.replace(/\s+/g, ' ').trim() : '';
}

function normalizeTitle(value: string | null | undefined): string {
  return normalizeCell(value).replace(/^\*+\s*/, '');
}

function isFxTableHeader(row: ManualTableRow): boolean {
  return normalizeCell(row[0]) === FX_HEADER && normalizeCell(row[1]) === DESCRIPTION_HEADER;
}

function isMicTableHeader(row: ManualTableRow): boolean {
  return normalizeCell(row[0]) === MIC_HEADER;
}

function isMicColumnHeader(row: ManualTableRow): boolean {
  return normalizeCell(row[0]) === MIC_NAME_HEADER && normalizeCell(row[1]) === MIC_BASED_ON_HEADER && normalizeCell(row[2]) === MIC_TYPE_HEADER;
}

function isIgnorableTitle(title: string): boolean {
  return [
    'amp',
    'cab/ir',
    'factory cab',
    'fx1, fx2, fx3',
    'mic type',
    'modulation',
    'parameters & range',
    'parameters & ranges',
    'rvb',
  ].includes(title.toLowerCase());
}

function isLikelyVariantTitle(title: string): boolean {
  const normalized = normalizeCell(title);

  if (!normalized || normalized.length > 40 || /[.?!]/.test(normalized)) {
    return false;
  }

  if (/\d/.test(normalized)) {
    return true;
  }

  const suffixes = ['clean', 'norm', 'drive', 'bright', 'tb', 'jump'];
  return suffixes.some((suffix) => normalized.toLowerCase().endsWith(` ${suffix}`));
}

function rowToFxItem(row: ManualTableRow, fallbackDescription = ''): ManualItem | null {
  const title = normalizeTitle(row[0]);
  const description = normalizeCell(row[1]) || (fallbackDescription && isLikelyVariantTitle(title) ? fallbackDescription : '');

  if (!title || !description || isIgnorableTitle(title)) {
    return null;
  }

  return {
    title,
    description,
  };
}

function rowToMicItem(row: ManualTableRow): ManualItem | null {
  const title = normalizeTitle(row[0]);
  const basedOn = normalizeCell(row[1]);
  const type = normalizeCell(row[2]).replace(/^Ribbo$/, 'Ribbon');

  if (!title || !basedOn || !type || title.toLowerCase() === 'name') {
    return null;
  }

  return {
    title,
    description: `Based On: ${basedOn}; Type: ${type}`,
  };
}

function dedupeExact(items: ManualItem[]): ManualItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.title}\u0000${item.description}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function extractManualItems(tables: ManualTable[]): ManualItem[] {
  const items: ManualItem[] = [];

  for (const table of tables) {
    if (!table.length) {
      continue;
    }

    if (isFxTableHeader(table[0])) {
      let lastFxDescription = '';

      for (const row of table.slice(1)) {
        const item = rowToFxItem(row, lastFxDescription);

        if (item) {
          lastFxDescription = item.description;
          items.push(item);
        }
      }
      continue;
    }

    if (isMicTableHeader(table[0]) && table.length > 2 && isMicColumnHeader(table[1])) {
      for (const row of table.slice(2)) {
        const item = rowToMicItem(row);

        if (item) {
          items.push(item);
        }
      }
    }
  }

  return dedupeExact(items);
}
