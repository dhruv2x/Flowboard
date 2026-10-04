import clsx from 'clsx';
import type { Priority } from '../types';
import { PRIORITIES } from './tokens';

export function PriorityIcon({ priority, className }: { priority: Priority; className?: string }) {
  if (priority === 'urgent') {
    return (
      <svg viewBox="0 0 12 12" aria-hidden className={clsx('size-3 shrink-0 text-priority-urgent', className)}>
        <rect width="12" height="12" rx="2.5" fill="currentColor" />
        <path d="M6 2.75v4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6" cy="9.1" r="0.9" fill="white" />
      </svg>
    );
  }

  const rank = PRIORITIES.find((p) => p.value === priority)?.rank ?? 0;
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={clsx('size-3 shrink-0', priority === 'high' ? 'text-priority-high' : 'text-fg-secondary', className)}
    >
      {[3, 6, 9].map((height, i) => (
        <rect
          key={height}
          x={0.75 + i * 4}
          y={11.5 - height}
          width="2.5"
          height={height}
          rx="0.75"
          fill="currentColor"
          className={i < rank ? undefined : 'text-line-strong'}
        />
      ))}
    </svg>
  );
}
