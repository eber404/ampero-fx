import { expect, it } from 'vitest';
import { mergeHotoneEffects } from './merge';

it('merges pedalboards for duplicate effects', () => {
  expect(
    mergeHotoneEffects([
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
