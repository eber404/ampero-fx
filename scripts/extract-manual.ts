import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import { extractPdfTextFragments } from '../src/lib/manual/pdf';
import { extractManualItems } from '../src/lib/manual/parse';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function resolveDefaultManualPath(): string {
  const matches = globSync('*Ampero Mini*pdf', {
    cwd: projectRoot,
    absolute: true,
  });

  if (!matches.length) {
    throw new Error('Could not find the Ampero Mini manual PDF in the project root');
  }

  return matches[0];
}

async function main(): Promise<void> {
  const inputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : resolveDefaultManualPath();
  const outputPath = process.argv[3]
    ? resolve(process.cwd(), process.argv[3])
    : resolve(projectRoot, 'public/data/ampero-mini-models.json');

  const fragments = await extractPdfTextFragments(inputPath);
  const items = extractManualItems(fragments);

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(items, null, 2)}\n`);
}

await main();
