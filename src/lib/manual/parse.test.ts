import { describe, expect, it } from 'vitest';
import { extractManualItems } from './parse';

describe('extractManualItems', () => {
  it('turns a title/description fragment row into a manual item', () => {
    const fragments = [
      { page: 1, text: 'FX Title', x: 80, y: 700 },
      { page: 1, text: 'Description', x: 260, y: 700 },
      { page: 1, text: 'Face Fuzz', x: 80, y: 680 },
      { page: 1, text: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal', x: 260, y: 680 },
    ];

    expect(extractManualItems(fragments)).toEqual([
      { title: 'Face Fuzz', description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal' },
    ]);
  });

  it('ignores centered section labels between items', () => {
    const fragments = [
      { page: 1, text: 'FX Title', x: 80, y: 700 },
      { page: 1, text: 'Description', x: 260, y: 700 },
      { page: 1, text: 'Face Fuzz', x: 80, y: 680 },
      { page: 1, text: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal', x: 260, y: 680 },
      { page: 1, text: 'Factory Cab', x: 260, y: 660 },
      { page: 1, text: 'Voxy 2x12', x: 80, y: 640 },
      { page: 1, text: 'Vintage VOX AC30 2x12 cabinet', x: 260, y: 640 },
    ];

    expect(extractManualItems(fragments)).toEqual([
      { title: 'Face Fuzz', description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal' },
      { title: 'Voxy 2x12', description: 'Vintage VOX AC30 2x12 cabinet' },
    ]);
  });

  it('splits a sentence-like title line into a short title and description', () => {
    const fragments = [
      { page: 2, text: 'FX Title', x: 80, y: 700 },
      { page: 2, text: 'Description', x: 260, y: 700 },
      { page: 2, text: 'Mag Eko Simulates solid-state tape echo sound', x: 80, y: 680 },
    ];

    expect(extractManualItems(fragments)).toEqual([
      { title: 'Mag Eko', description: 'Simulates solid-state tape echo sound' },
    ]);
  });

  it('appends left-column continuation text to the current description', () => {
    const fragments = [
      { page: 3, text: 'FX Title', x: 80, y: 700 },
      { page: 3, text: 'Description', x: 260, y: 700 },
      { page: 3, text: 'Pure Eko', x: 80, y: 680 },
      { page: 3, text: 'Produce pure, precised delay sound', x: 260, y: 680 },
      { page: 3, text: 'Simulates solid-state tape echo sound', x: 80, y: 668 },
    ];

    expect(extractManualItems(fragments)).toEqual([
      {
        title: 'Pure Eko',
        description: 'Produce pure, precised delay sound Simulates solid-state tape echo sound',
      },
    ]);
  });

  it('keeps cab and ir entries when they appear in the same table format', () => {
    const fragments = [
      { page: 3, text: 'FX Title', x: 80, y: 700 },
      { page: 3, text: 'Description', x: 260, y: 700 },
      { page: 3, text: 'Super Zep 1x6', x: 80, y: 680 },
      { page: 3, text: 'Supro 1x6 cabinet with oval speaker', x: 260, y: 680 },
    ];

    expect(extractManualItems(fragments)).toEqual([
      { title: 'Super Zep 1x6', description: 'Supro 1x6 cabinet with oval speaker' },
    ]);
  });

  it('preserves multiline descriptions and ignores header and footer noise', () => {
    const fragments = [
      { page: 1, text: 'Ampero Mini', x: 40, y: 780 },
      { page: 1, text: 'FX Title', x: 80, y: 700 },
      { page: 1, text: 'Description', x: 260, y: 700 },
      { page: 1, text: 'Face Fuzz', x: 80, y: 680 },
      { page: 1, text: 'Based on legendary Dallas-Arbiter', x: 260, y: 680 },
      { page: 1, text: 'Fuzz Face fuzz pedal', x: 260, y: 668 },
      {
        page: 1,
        text: '*The manufacturers and product names mentioned above are trademarks or registered trademarks of their respective owners. The',
        x: 40,
        y: 40,
      },
      { page: 1, text: 'trademarks were used merely to identify the sound character of the products.', x: 260, y: 28 },
      { page: 1, text: 'Page 1', x: 520, y: 24 },
      { page: 1, text: '© 2024 Hotone', x: 300, y: 20 },
    ];

    expect(extractManualItems(fragments)).toEqual([
      {
        title: 'Face Fuzz',
        description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal',
      },
    ]);
  });
});
