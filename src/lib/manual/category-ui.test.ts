import { expect, it } from 'vitest';
import { categoryBadgeClass, categoryLabel } from './category-ui';

it('assigns distinct badge colors per category', () => {
  expect(categoryLabel('amps')).toBe('Amps');
  expect(categoryLabel('drives')).toBe('Drives');
  expect(categoryBadgeClass('amps')).toContain('sky');
  expect(categoryBadgeClass('drives')).toContain('amber');
  expect(categoryBadgeClass('mics')).toContain('fuchsia');
  expect(categoryBadgeClass('amps')).not.toBe(categoryBadgeClass('drives'));
});
