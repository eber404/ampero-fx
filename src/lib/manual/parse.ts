import type { ManualItem, TextFragment } from './types';

const Y_TOLERANCE = 2.5;
const TABLE_BREAK_GAP = 28;

function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function isNoiseLine(text: string): boolean {
  return (
    /^page\s*\d+$/i.test(text) ||
    /^\d+$/i.test(text) ||
    /^\*?the manufacturers and product names mentioned above are trademarks or registered trademarks of their respective owners\.?/i.test(text) ||
    text.includes('trademarks were used merely to identify the sound character of the products') ||
    text.includes('copyright') ||
    text.includes('hotone') ||
    text.includes('ampero mini')
  );
}

function joinTexts(texts: string[]): string {
  return texts.join(' ').replace(/\s+/g, ' ').trim();
}

type Line = {
  page: number;
  y: number;
  fragments: TextFragment[];
};

type TableState = {
  page: number | null;
  splitX: number;
  current: ManualItem | null;
  lastY: number | null;
};

function groupFragmentsIntoLines(fragments: TextFragment[]): Line[] {
  const sorted = [...fragments].sort((a, b) => {
    if (a.page !== b.page) {
      return a.page - b.page;
    }

    if (Math.abs(a.y - b.y) > Y_TOLERANCE) {
      return b.y - a.y;
    }

    return a.x - b.x;
  });

  const lines: Line[] = [];

  for (const fragment of sorted) {
    const lastLine = lines[lines.length - 1];

    if (
      lastLine &&
      lastLine.page === fragment.page &&
      Math.abs(lastLine.y - fragment.y) <= Y_TOLERANCE
    ) {
      lastLine.fragments.push(fragment);
      lastLine.y = Math.max(lastLine.y, fragment.y);
    } else {
      lines.push({ page: fragment.page, y: fragment.y, fragments: [fragment] });
    }
  }

  return lines.map((line) => ({
    ...line,
    fragments: line.fragments.sort((a, b) => a.x - b.x),
  }));
}

function isHeaderLine(line: Line): boolean {
  const texts = line.fragments.map((fragment) => normalizeText(fragment.text));

  return texts.includes('fx title') && texts.includes('description');
}

function getTableSplitX(line: Line): number {
  const title = line.fragments.find((fragment) => normalizeText(fragment.text) === 'fx title');
  const description = line.fragments.find((fragment) => normalizeText(fragment.text) === 'description');

  if (!title || !description) {
    throw new Error('Table header missing FX Title or Description column');
  }

  return (title.x + description.x) / 2;
}

function lineToCells(line: Line, splitX: number): { title: string; description: string } {
  const titleTexts = line.fragments
    .filter((fragment) => fragment.x < splitX)
    .map((fragment) => fragment.text)
    .filter(Boolean);
  const descriptionTexts = line.fragments
    .filter((fragment) => fragment.x >= splitX)
    .map((fragment) => fragment.text)
    .filter(Boolean);

  return {
    title: joinTexts(titleTexts),
    description: joinTexts(descriptionTexts),
  };
}

function commitCurrent(items: ManualItem[], state: TableState): void {
  if (state.current && state.current.title && state.current.description) {
    items.push({
      title: state.current.title,
      description: state.current.description,
    });
  }

  state.current = null;
}

export function extractManualItems(fragments: TextFragment[]): ManualItem[] {
  const lines = groupFragmentsIntoLines(fragments);
  const items: ManualItem[] = [];
  const tableState: TableState = { page: null, splitX: 0, current: null, lastY: null };

  for (const line of lines) {
    if (tableState.page !== line.page) {
      commitCurrent(items, tableState);
      tableState.page = line.page;
      tableState.splitX = 0;
      tableState.lastY = null;
    }

    if (isHeaderLine(line)) {
      commitCurrent(items, tableState);
      tableState.page = line.page;
      tableState.splitX = getTableSplitX(line);
      tableState.lastY = line.y;
      continue;
    }

    if (!tableState.splitX) {
      continue;
    }

    if (tableState.lastY !== null && tableState.lastY - line.y > TABLE_BREAK_GAP) {
      commitCurrent(items, tableState);
      tableState.splitX = 0;
      tableState.lastY = null;
      continue;
    }

    const normalizedLine = normalizeText(line.fragments.map((fragment) => fragment.text).join(' '));
    if (!normalizedLine || isNoiseLine(normalizedLine)) {
      tableState.lastY = line.y;
      continue;
    }

    const { title, description } = lineToCells(line, tableState.splitX);

    if (title) {
      commitCurrent(items, tableState);
      tableState.current = {
        title,
        description,
      };
    } else if (description && tableState.current) {
      tableState.current.description = joinTexts([tableState.current.description, description]);
    }

    tableState.lastY = line.y;
  }

  commitCurrent(items, tableState);

  return items;
}
