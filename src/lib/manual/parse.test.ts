import { describe, expect, it } from 'vitest';
import { extractManualItems } from './parse';

describe('extractManualItems', () => {
  it('normalizes titles and descriptions from PDF tables', () => {
    const tables = [[
      ['FX Title', 'Description', 'Parameters & Ranges'],
      ['*Precise\nAttack', 'Precise Attack is a modern booster/\noverdrive model', 'Gain: Controls the overdrive amount'],
      ['Emperor\nClean', 'Based Matchless™ Chieftain 212\ncombo* (clean tone)', 'Gain: Controls the amp pre gain'],
      ['The Way 4x12', 'Vintage WEM®* 4x12" cabinet', ''],
    ]];

    expect(extractManualItems(tables)).toEqual([
      {
        title: 'Precise Attack',
        description: 'Precise Attack is a modern booster/ overdrive model',
      },
      {
        title: 'Emperor Clean',
        description: 'Based Matchless™ Chieftain 212 combo* (clean tone)',
      },
      {
        title: 'The Way 4x12',
        description: 'Vintage WEM®* 4x12" cabinet',
      },
    ]);
  });

  it('ignores section labels and duplicate rows', () => {
    const tables = [[
      ['FX Title', 'Description', 'Parameters & Ranges'],
      ['Smart Gate', 'Based on famous ISP® Decimator™*\nnoise gate pedal', 'Threshold (0~100)'],
      ['Smart Gate', 'Based on famous ISP® Decimator™*\nnoise gate pedal', 'Threshold (0~100)'],
      ['Fast Gate', 'A 2-mode noise gate with fast\nresponse', 'Threshold (0~100)'],
      ['Gated Boost', 'Pure boost designed for modern\nDentlemen and metalheads', 'Gate (0~100)'],
    ]];

    expect(extractManualItems(tables)).toEqual([
      {
        title: 'Smart Gate',
        description: 'Based on famous ISP® Decimator™* noise gate pedal',
      },
      {
        title: 'Fast Gate',
        description: 'A 2-mode noise gate with fast response',
      },
      {
        title: 'Gated Boost',
        description: 'Pure boost designed for modern Dentlemen and metalheads',
      },
    ]);
  });

  it('skips tables without a recognized header', () => {
    const tables = [[
      ['Name', 'Based On', 'Type'],
      ['Dyn 57', 'Shure® SM57*', 'Dynamic'],
    ]];

    expect(extractManualItems(tables)).toEqual([]);
  });

  it('extracts microphone tables into manual items', () => {
    const tables = [[
      ['Mic Type', null, null],
      ['Name', 'Based On', 'Type'],
      ['OFF', 'N/A', 'N/A'],
      ['Dyn 57', 'Shure® SM57*', 'Dynamic'],
      ['Con U87', 'Neumann® U87*', 'Condenser'],
      ['Rib 121', 'Royal® R121*', 'Ribbo'],
    ]];

    expect(extractManualItems(tables)).toEqual([
      { title: 'OFF', description: 'Based On: N/A; Type: N/A' },
      { title: 'Dyn 57', description: 'Based On: Shure® SM57*; Type: Dynamic' },
      { title: 'Con U87', description: 'Based On: Neumann® U87*; Type: Condenser' },
      { title: 'Rib 121', description: 'Based On: Royal® R121*; Type: Ribbon' },
    ]);
  });

  it('reuses the previous fx description for blank variant rows', () => {
    const tables = [[
      ['FX Title', 'Description', 'Parameters & Ranges'],
      ['Messe IIC+ 1', 'Based on Mesa/Boogie® Mark II C+™ (Lead channel) with 3 different onboard switch combinations', 'Gain (0~100)'],
      ['Messe IIC+ 2', null, null],
      ['Messe IIC+ 3', null, null],
      ['Factory Acoustic IR', null, null],
      ['User IR', null, null],
      ['Sound Clone', null, null],
      ['1-10 clicking "Sound Clone Manage" button.', null, null],
    ]];

    expect(extractManualItems(tables)).toEqual([
      {
        title: 'Messe IIC+ 1',
        description: 'Based on Mesa/Boogie® Mark II C+™ (Lead channel) with 3 different onboard switch combinations',
      },
      {
        title: 'Messe IIC+ 2',
        description: 'Based on Mesa/Boogie® Mark II C+™ (Lead channel) with 3 different onboard switch combinations',
      },
      {
        title: 'Messe IIC+ 3',
        description: 'Based on Mesa/Boogie® Mark II C+™ (Lead channel) with 3 different onboard switch combinations',
      },
    ]);
  });
});
