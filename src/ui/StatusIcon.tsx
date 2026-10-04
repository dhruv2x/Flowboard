import clsx from 'clsx';
import type { StatusCategory, StatusColor } from '../types';
import { statusText } from './tokens';

/** Shape encodes the category (empty, half, filled), color comes from the list's status. */
export function StatusIcon({ category, color, className }: { category: StatusCategory; color: StatusColor; className?: string }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden className={clsx('size-3.5 shrink-0', statusText[color], className)}>
      <rect
        x="1.25"
        y="1.25"
        width="11.5"
        height="11.5"
        rx="2.5"
        fill={category === 'done' ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {category === 'in_progress' && <path d="M1.25 7h11.5v3.25a2.5 2.5 0 0 1-2.5 2.5h-6.5a2.5 2.5 0 0 1-2.5-2.5Z" fill="currentColor" />}
      {category === 'done' && (
        <path d="m4.4 7.2 1.8 1.8 3.4-3.7" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
