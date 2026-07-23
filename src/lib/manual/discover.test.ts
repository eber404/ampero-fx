import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { findManualPdfPath } from './discover';

const tempDirs: string[] = [];

afterEach(() => {
  while (tempDirs.length) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe('findManualPdfPath', () => {
  it('finds the manual pdf by pattern', () => {
    const root = mkdtempSync(join(tmpdir(), 'ampero-manual-'));
    tempDirs.push(root);

    writeFileSync(join(root, 'not-the-manual.pdf'), 'x');
    writeFileSync(join(root, 'Ampero Mini_Online Manual_EN_Firmware V2.2.1773036333483.pdf'), 'x');

    expect(findManualPdfPath(root)).toBe(
      join(root, 'Ampero Mini_Online Manual_EN_Firmware V2.2.1773036333483.pdf'),
    );
  });

  it('throws when multiple manuals match the pattern', () => {
    const root = mkdtempSync(join(tmpdir(), 'ampero-manual-'));
    tempDirs.push(root);

    writeFileSync(join(root, 'Ampero Mini_A.pdf'), 'x');
    writeFileSync(join(root, 'Ampero Mini_B.pdf'), 'x');

    expect(() => findManualPdfPath(root)).toThrow(/multiple/i);
  });
});
