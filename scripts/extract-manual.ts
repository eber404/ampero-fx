import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { findManualPdfPath } from '../src/lib/manual/discover';
import { extractManualItems } from '../src/lib/manual/parse';
import type { ManualTable } from '../src/lib/manual/types';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function resolveDefaultManualPath(): string {
  return findManualPdfPath(projectRoot);
}

function extractTablesFromPdf(pdfPath: string): ManualTable[] {
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

async function main(): Promise<void> {
  const inputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolveDefaultManualPath();
  const outputPath = process.argv[3]
    ? resolve(process.cwd(), process.argv[3])
    : resolve(projectRoot, 'public/data/ampero-mini-models.json');

  const tables = extractTablesFromPdf(inputPath);
  const items = extractManualItems(tables);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`);
}

await main();
