import clsx from 'clsx';
import type { ReactNode } from 'react';

export const Kbd = ({ children, className }: { children: ReactNode; className?: string }) => (
  <kbd
    className={clsx(
      'inline-grid h-5 min-w-5 place-items-center rounded border border-line bg-surface px-1 font-sans text-2xs font-medium text-fg-muted',
      className,
    )}
  >
    {children}
  </kbd>
);
