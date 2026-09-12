import type { ManualCategory } from './types';

const categoryLabels: Record<ManualCategory, string> = {
  amps: 'Amps',
  cabs: 'Cabs',
  mics: 'Mics',
  ir: 'IR',
  drives: 'Drives',
  dynamics: 'Dynamics',
  modulation: 'Modulation',
  delay: 'Delay',
  reverb: 'Reverb',
  eq: 'EQ',
  pitch: 'Pitch',
  filters: 'Filters',
  acoustic: 'Acoustic',
  utility: 'Utility',
};

const categoryBadgeStyles: Record<ManualCategory, string> = {
  amps: '!border-sky-500/30 !bg-sky-500/15 !text-sky-300',
  cabs: '!border-emerald-500/30 !bg-emerald-500/15 !text-emerald-300',
  mics: '!border-fuchsia-500/30 !bg-fuchsia-500/15 !text-fuchsia-300',
  ir: '!border-violet-500/30 !bg-violet-500/15 !text-violet-300',
  drives: '!border-amber-500/30 !bg-amber-500/15 !text-amber-300',
  dynamics: '!border-rose-500/30 !bg-rose-500/15 !text-rose-300',
  modulation: '!border-cyan-500/30 !bg-cyan-500/15 !text-cyan-300',
  delay: '!border-orange-500/30 !bg-orange-500/15 !text-orange-300',
  reverb: '!border-indigo-500/30 !bg-indigo-500/15 !text-indigo-300',
  eq: '!border-lime-500/30 !bg-lime-500/15 !text-lime-300',
  pitch: '!border-purple-500/30 !bg-purple-500/15 !text-purple-300',
  filters: '!border-teal-500/30 !bg-teal-500/15 !text-teal-300',
  acoustic: '!border-cyan-400/30 !bg-cyan-400/15 !text-cyan-200',
  utility: '!border-zinc-500/30 !bg-zinc-500/15 !text-zinc-300',
};

export function categoryLabel(category: ManualCategory): string {
  return categoryLabels[category];
}

export function categoryBadgeClass(category: ManualCategory): string {
  return categoryBadgeStyles[category];
}
