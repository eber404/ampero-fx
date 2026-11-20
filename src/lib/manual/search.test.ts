import { describe, expect, it } from 'vitest';
import { filterManualItems } from './search';

const items = [
  { title: 'Face Fuzz', description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal' },
  { title: 'Cab/IR', description: 'All effects in this module share the same parameters' },
  { title: 'Voxy 2x12', description: 'Vintage VOX AC30 2x12 cabinet' },
  { title: 'Black Tail', description: 'Based on legendary ProCo The Rat distortion', pedalboards: ['Ampero Mini', 'Ampero II Stomp'] },
];

describe('filterManualItems', () => {
  it('returns all items for an empty query', () => {
    expect(filterManualItems(items, '')).toEqual(items);
  });

  it('matches title and description case-insensitively', () => {
    expect(filterManualItems(items, 'vox')).toEqual([
      { title: 'Voxy 2x12', description: 'Vintage VOX AC30 2x12 cabinet' },
    ]);
  });

  it('trims the query before matching description text', () => {
    expect(filterManualItems(items, ' fuzz face ')).toEqual([
      { title: 'Face Fuzz', description: 'Based on legendary Dallas-Arbiter Fuzz Face fuzz pedal' },
    ]);
  });

  it('matches every term of a multi-word query across fields', () => {
    expect(filterManualItems(items, 'vox cab')).toEqual([
      { title: 'Voxy 2x12', description: 'Vintage VOX AC30 2x12 cabinet' },
    ]);
  });

  it('requires all terms of a multi-word query to match', () => {
    expect(filterManualItems(items, 'vox fuzz')).toEqual([]);
  });

  it('requires every active tag to match across searchable fields', () => {
    expect(filterManualItems(items, ['BLACK', 'stomp'])).toEqual([items[3]]);
    expect(filterManualItems(items, ['vox', 'fuzz'])).toEqual([]);
  });

  it('ignores blank tags and returns all items when no tags remain', () => {
    expect(filterManualItems(items, [' ', '\t'])).toEqual(items);
    expect(filterManualItems(items, [])).toEqual(items);
  });

  it('ignores extra whitespace between terms', () => {
    expect(filterManualItems(items, '  vox   cab  ')).toEqual([
      { title: 'Voxy 2x12', description: 'Vintage VOX AC30 2x12 cabinet' },
    ]);
  });

  it('does not mutate the input array', () => {
    const original = items.map((item) => ({ ...item }));

    filterManualItems(items, 'cab');

    expect(items).toEqual(original);
  });

  it('matches pedalboard names when present', () => {
    expect(filterManualItems(items, 'stomp')).toEqual([
      {
        title: 'Black Tail',
        description: 'Based on legendary ProCo The Rat distortion',
        pedalboards: ['Ampero Mini', 'Ampero II Stomp'],
      },
    ]);
  });
});
