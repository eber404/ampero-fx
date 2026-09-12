import { spawnSync } from 'node:child_process';
import type { ManualItem, ManualTable } from './types';
import { categorizeManualItem } from './categorize';
import { extractManualItems } from './parse';

export function extractTablesFromPdf(pdfPath: string): ManualTable[] {
  const pythonScript = `
import json
import sys

try:
    import pdfplumber
except Exception as exc:
    print(f'pdfplumber import failed: {exc}', file=sys.stderr)
    sys.exit(2)

pdf_path = sys.argv[1]
tables = []
with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        for table in page.extract_tables():
            tables.append(table)

print(json.dumps(tables, ensure_ascii=False))
`;

  const result = spawnSync('python3', ['-c', pythonScript, pdfPath], {
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 50 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'Failed to extract PDF tables');
  }

  return JSON.parse(result.stdout) as ManualTable[];
}

export async function extractManualItemsFromPdf(pdfPath: string): Promise<ManualItem[]> {
  const tables = extractTablesFromPdf(pdfPath);
  return extractManualItems(tables).map(categorizeManualItem);
}
