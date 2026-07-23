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
