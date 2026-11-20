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
  amps: '!border-sky-500/25 !bg-sky-500/10 !text-sky-300',
  cabs: '!border-emerald-500/25 !bg-emerald-500/10 !text-emerald-300',
  mics: '!border-fuchsia-500/25 !bg-fuchsia-500/10 !text-fuchsia-300',
  ir: '!border-violet-500/25 !bg-violet-500/10 !text-violet-300',
  drives: '!border-amber-500/25 !bg-amber-500/10 !text-amber-300',
  dynamics: '!border-rose-500/25 !bg-rose-500/10 !text-rose-300',
  modulation: '!border-cyan-500/25 !bg-cyan-500/10 !text-cyan-300',
  delay: '!border-orange-500/25 !bg-orange-500/10 !text-orange-300',
  reverb: '!border-indigo-500/25 !bg-indigo-500/10 !text-indigo-300',
  eq: '!border-lime-500/25 !bg-lime-500/10 !text-lime-300',
  pitch: '!border-purple-500/25 !bg-purple-500/10 !text-purple-300',
  filters: '!border-teal-500/25 !bg-teal-500/10 !text-teal-300',
  acoustic: '!border-cyan-400/25 !bg-cyan-400/10 !text-cyan-200',
  utility: '!border-zinc-500/25 !bg-zinc-500/10 !text-zinc-300',
};

export function categoryLabel(category: ManualCategory): string {
  return categoryLabels[category];
}

export function categoryBadgeClass(category: ManualCategory): string {
  return categoryBadgeStyles[category];
}
