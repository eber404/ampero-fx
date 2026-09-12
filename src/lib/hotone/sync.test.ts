import { createServer } from 'node:http';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { buildUnifiedCatalog, downloadPdf, formatPedalboardName } from './sync';

it('builds one catalog entry per effect and keeps pedalboards sorted', () => {
  expect(
    buildUnifiedCatalog([
      { title: 'Black Tail', description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)', category: 'drives', subtype: 'distortion', pedalboard: 'Ampero Mini' },
      { title: 'Black Tail', description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)', category: 'drives', subtype: 'distortion', pedalboard: 'Ampero II Stomp' },
    ]),
  ).toEqual([
    {
      title: 'Black Tail',
      description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)',
      category: 'drives',
      subtype: 'distortion',
      pedalboards: ['Ampero II Stomp', 'Ampero Mini'],
    },
  ]);
});

it('downloads a pdf to disk', async () => {
  const server = createServer((req, res) => {
    if (req.url === '/manual.pdf') {
      res.writeHead(200, { 'content-type': 'application/pdf' });
      res.end('pdf-bytes');
      return;
    }

    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();

  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('failed to start server');
  }

  const workdir = await mkdtemp(join(tmpdir(), 'hotone-download-'));
  const targetPath = join(workdir, 'manual.pdf');

  try {
    await downloadPdf(`http://127.0.0.1:${address.port}/manual.pdf`, targetPath);
    await expect(readFile(targetPath, 'utf8')).resolves.toBe('pdf-bytes');
  } finally {
    server.close();
    await rm(workdir, { recursive: true, force: true });
  }
});

it('labels the original Ampero pedalboard explicitly', () => {
  expect(formatPedalboardName('Ampero')).toBe('Ampero Original');
  expect(formatPedalboardName('Ampero Mini')).toBe('Ampero Mini');
});
