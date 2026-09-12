import { describe, expect, it } from 'vitest';
import { categorizeManualItem } from './categorize';

describe('categorizeManualItem', () => {
  it('classifies mic rows', () => {
    expect(
      categorizeManualItem({
        title: 'Dyn 57',
        description: 'Based On: Shure® SM57*; Type: Dynamic',
      }),
    ).toMatchObject({
      category: 'mics',
      subtype: 'dynamic',
    });
  });

  it('classifies cabs and ir items', () => {
    expect(
      categorizeManualItem({
        title: 'The Way 4x12',
        description: 'Vintage WEM®* 4x12" cabinet',
      }),
    ).toMatchObject({
      category: 'cabs',
      subtype: '4x12',
    });

    expect(
      categorizeManualItem({
        title: 'User IR 1-10',
        description: 'For loading 3rd party IR files; the output will be muted when switched to an empty User IR slot',
      }),
    ).toMatchObject({
      category: 'ir',
      subtype: 'user',
    });
  });

  it('classifies amp and drive variants', () => {
    expect(
      categorizeManualItem({
        title: 'Messe IIC+ 1',
        description: 'Based on Mesa/Boogie® Mark II C+™ (Lead channel) with 3 different onboard switch combinations',
      }),
    ).toMatchObject({
      category: 'amps',
    });

    expect(
      categorizeManualItem({
        title: 'Fast Gate',
        description: 'A 2-mode noise gate with fast response',
      }),
    ).toMatchObject({
      category: 'dynamics',
      subtype: 'gate',
    });

    expect(
      categorizeManualItem({
        title: 'Affinity Boost',
        description: 'Based on famous Xotic® AC Booster* pedal',
      }),
    ).toMatchObject({
      category: 'drives',
      subtype: 'boost',
    });

    expect(
      categorizeManualItem({
        title: 'Black Tail',
        description: 'Based on legendary ProCo™ The Rat* distortion (early LM308 OP- amp version)',
      }),
    ).toMatchObject({
      category: 'drives',
      subtype: 'distortion',
    });

    expect(
      categorizeManualItem({
        title: 'Magic T',
        description: 'Magic T is an overdrive model based on the legendary Paul Cochrane Timmy®* overdrive (V2) pedal – one of the first transparent overdrive pedals.',
      }),
    ).toMatchObject({
      category: 'drives',
      subtype: 'overdrive',
    });

    expect(
      categorizeManualItem({
        title: 'FET Boost',
        description: 'Based on legendary green clip-on FET Preamp',
      }),
    ).toMatchObject({
      category: 'drives',
      subtype: 'boost',
    });

    expect(
      categorizeManualItem({
        title: 'Precise Attack',
        description:
          'Precise Attack is a modern booster/ overdrive model based on the famous Horizon Devices® Precision Drive*. Designed by Misha Mansoor, this pedal is an everything solution for progressive musicians. Plug in an extended range guitar, or run into a high gain amp to find the prog magic. Special designed Attack control tightens the low ends and makes your sound prog-y.A built-in smart noise gate reduces hum and keeps your palm muting tight.',
      }),
    ).toMatchObject({
      category: 'drives',
      subtype: 'overdrive',
    });
  });

  it('classifies delay variants that currently collide with drive and amp words', () => {
    expect(
      categorizeManualItem({
        title: 'Tube Eko',
        description: 'Simulates tube-driven tape echo sound',
      }),
    ).toMatchObject({
      category: 'delay',
      subtype: 'tape',
    });

    expect(
      categorizeManualItem({
        title: 'Ping Pong',
        description: 'A ping-pong delay producing stereo feedbadk bounces back and forth between left and right channels',
      }),
    ).toMatchObject({
      category: 'delay',
      subtype: 'digital',
    });

    expect(
      categorizeManualItem({
        title: 'Multi Head',
        description: 'A multi tap delay that simulates a huge 4-head tape echo machine',
      }),
    ).toMatchObject({
      category: 'delay',
      subtype: 'tape',
    });

    expect(
      categorizeManualItem({
        title: 'Vintage Rack',
        description: "Reproduces the sound of a vintage 1980's rack-mount delay machine with slightly sample-reduced feedback",
      }),
    ).toMatchObject({
      category: 'delay',
      subtype: 'rack',
    });

    expect(
      categorizeManualItem({
        title: 'Recaller',
        description: 'Based on legendary Electro- Harmonix® Deluxe Memory Man®*',
      }),
    ).toMatchObject({
      category: 'delay',
      subtype: 'analog',
    });
  });

  it('classifies utility rows', () => {
    expect(
      categorizeManualItem({
        title: 'Sound Clone 1-10',
        description: 'This is for loading Sound Clone file by clicking "Sound Clone Manage" button.',
      }),
    ).toMatchObject({
      category: 'utility',
      subtype: 'sound_clone',
    });
  });
});
