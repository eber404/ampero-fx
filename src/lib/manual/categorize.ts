import type { ManualCategory, ManualItem } from './types';

function normalize(text: string): string {
  return text.toLowerCase();
}

function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}\\b`).test(text);
}

function mergeText(item: ManualItem): string {
  return normalize(`${item.title} ${item.description}`);
}

function micSubtype(item: ManualItem): string {
  const normalized = mergeText(item);
  if (normalized.includes('type: ribbon') || normalized.startsWith('rib ')) return 'ribbon';
  if (normalized.includes('type: condenser') || normalized.startsWith('con ')) return 'condenser';
  if (normalized.includes('type: dynamic') || normalized.startsWith('dyn ')) return 'dynamic';
  if (normalized.startsWith('off')) return 'off';
  return 'mic';
}

function cabSubtype(item: ManualItem): string {
  const match = item.title.match(/\d+x\d+/i);
  return match ? match[0].toLowerCase() : 'cab';
}

function ampSubtype(item: ManualItem): string | undefined {
  const normalized = mergeText(item);
  if (hasWord(normalized, 'clean')) return 'clean';
  if (hasWord(normalized, 'crunch')) return 'crunch';
  if (hasWord(normalized, 'lead')) return 'lead';
  if (hasWord(normalized, 'drive')) return 'drive';
  if (hasWord(normalized, 'bright')) return 'bright';
  if (hasWord(normalized, 'jump')) return 'jump';
  if (hasWord(normalized, 'tb')) return 'tb';
  if (hasWord(normalized, 'norm')) return 'normal';
  return undefined;
}

function driveSubtype(item: ManualItem): string {
  const normalized = mergeText(item);
  if (hasWord(normalized, 'fuzz')) return 'fuzz';
  if (hasWord(normalized, 'distortion')) return 'distortion';
  if (hasWord(normalized, 'overdrive')) return 'overdrive';
  return 'boost';
}

function delaySubtype(item: ManualItem): string {
  const normalized = mergeText(item);
  if (normalized.includes('memory man')) return 'analog';
  if (hasWord(normalized, 'analog')) return 'analog';
  if (hasWord(normalized, 'tape')) return 'tape';
  if (hasWord(normalized, 'reverse')) return 'reverse';
  if (hasWord(normalized, 'rack')) return 'rack';
  return 'digital';
}

function reverbSubtype(item: ManualItem): string | undefined {
  const normalized = mergeText(item);
  if (normalized.includes('shimmer')) return 'shimmer';
  if (normalized.includes('room')) return 'room';
  if (normalized.includes('hall')) return 'hall';
  if (normalized.includes('plate')) return 'plate';
  if (normalized.includes('spring')) return 'spring';
  if (normalized.includes('cloud')) return 'ambient';
  return undefined;
}

function categoryFromText(item: ManualItem): { category: ManualCategory; subtype?: string } {
  const normalized = mergeText(item);

  if (/^off\b/.test(normalized) || /type:\s*(dynamic|condenser|ribbon)/.test(normalized) || /^dyn\b|^con\b|^rib\b/.test(normalized)) {
    return { category: 'mics', subtype: micSubtype(item) };
  }

  if (normalized.includes('sound clone')) {
    return { category: 'utility', subtype: 'sound_clone' };
  }

  if (normalized.includes('user ir') || normalized.includes('factory acoustic ir')) {
    return { category: 'ir', subtype: normalized.includes('user ir') ? 'user' : 'acoustic' };
  }

  if (normalized.includes('cabinet') || /\b\d+x\d+\b/.test(normalized)) {
    return { category: 'cabs', subtype: cabSubtype(item) };
  }

  if (normalized.includes('memory man')) {
    return { category: 'delay', subtype: 'analog' };
  }

  if (/delay|echo/.test(normalized)) {
    return { category: 'delay', subtype: delaySubtype(item) };
  }

  if (
    hasWord(normalized, 'fuzz') ||
    hasWord(normalized, 'distortion') ||
    hasWord(normalized, 'overdrive') ||
    hasWord(normalized, 'boost') ||
    hasWord(normalized, 'drive') ||
    hasWord(normalized, 'saturation')
  ) {
    return { category: 'drives', subtype: driveSubtype(item) };
  }

  if (/compressor|noise gate|gate\b/.test(normalized)) {
    return { category: 'dynamics', subtype: normalized.includes('compressor') ? 'compressor' : 'gate' };
  }

  if (/chorus|phaser|flanger|tremolo|vibrato|rotary|vibe/.test(normalized)) {
    return { category: 'modulation', subtype: undefined };
  }

  if (/\beq\b|equalizer/.test(normalized)) {
    return { category: 'eq', subtype: undefined };
  }

  if (/pitch|octave|detune|harmoni/.test(normalized)) {
    return { category: 'pitch', subtype: undefined };
  }

  if (/wah|filter|envelope/.test(normalized)) {
    return { category: 'filters', subtype: undefined };
  }

  if (/reverb|shimmer|room|hall|plate|spring|cloud/.test(normalized)) {
    return { category: 'reverb', subtype: reverbSubtype(item) };
  }

  if (normalized.includes('amp') || normalized.includes('head') || normalized.includes('combo') || normalized.includes('channel') || normalized.includes('preamp')) {
    return { category: 'amps', subtype: ampSubtype(item) };
  }

  if (/acoustic/.test(normalized)) {
    return { category: 'acoustic', subtype: undefined };
  }

  return { category: 'utility', subtype: undefined };
}

export function categorizeManualItem(item: ManualItem): ManualItem {
  const classified = categoryFromText(item);
  return {
    ...item,
    category: classified.category,
    ...(classified.subtype ? { subtype: classified.subtype } : {}),
  };
}
