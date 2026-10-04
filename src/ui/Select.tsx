import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

// Native select for free keyboard and screen-reader support; borderless until hovered, like an inline property.
export const fieldClass =
  'h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-sm text-fg hover:border-line hover:bg-surface-subtle focus-visible:border-accent focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20';

export function Select({ leading, className, ...props }: ComponentProps<'select'> & { leading?: ReactNode }) {
  return (
    <div className={clsx('relative', className)}>
      {leading && (
        <span className="pointer-events-none absolute left-2 top-1/2 flex -translate-y-1/2 items-center">{leading}</span>
      )}
      <select className={clsx(fieldClass, 'cursor-pointer appearance-none truncate pr-7', leading && 'pl-7')} {...props} />
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-fg-faint" />
    </div>
  );
}
