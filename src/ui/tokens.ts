import type { Priority, StatusColor, Tone } from '../types';

// Static class maps: Tailwind needs full class names at build time, and inline styles are off-limits.

export const statusText: Record<StatusColor, string> = {
  stone: 'text-status-stone',
  amber: 'text-status-amber',
  sky: 'text-status-sky',
  green: 'text-status-green',
};

export const toneBg: Record<Tone, string> = {
  clay: 'bg-tone-clay',
  moss: 'bg-tone-moss',
  slate: 'bg-tone-slate',
};

export const PRIORITIES: { value: Priority; label: string; rank: number }[] = [
  { value: 'urgent', label: 'Urgent', rank: 4 },
  { value: 'high', label: 'High', rank: 3 },
  { value: 'normal', label: 'Normal', rank: 2 },
  { value: 'low', label: 'Low', rank: 1 },
  { value: 'none', label: 'No priority', rank: 0 },
];
