import { globSync } from 'glob';

export function findManualPdfPath(projectRoot: string): string {
  const matches = globSync('*Ampero Mini*pdf', {
    cwd: projectRoot,
    absolute: true,
  });

  if (matches.length === 0) {
    throw new Error('Could not find the Ampero Mini manual PDF in the project root');
  }

  if (matches.length > 1) {
    throw new Error(`Found multiple Ampero Mini PDF candidates: ${matches.map((match) => match.split('/').pop()).join(', ')}`);
  }

  return matches[0];
}
