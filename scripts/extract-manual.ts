import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findManualPdfPath } from '../src/lib/manual/discover';
import { extractManualItemsFromPdf } from '../src/lib/manual/extract';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function resolveDefaultManualPath(): string {
  return findManualPdfPath(projectRoot);
}

async function main(): Promise<void> {
  const inputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolveDefaultManualPath();
  const outputPath = process.argv[3]
    ? resolve(process.cwd(), process.argv[3])
    : resolve(projectRoot, 'public/data/ampero-mini-models.json');

  const items = await extractManualItemsFromPdf(inputPath);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`);
}

await main();
