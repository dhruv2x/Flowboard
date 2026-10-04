import clsx from 'clsx';
import type { ComponentProps } from 'react';

export function IconButton({ label, className, ...props }: ComponentProps<'button'> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={clsx(
        'grid size-6 shrink-0 place-items-center rounded text-fg-muted hover:bg-line/70 hover:text-fg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
      {...props}
    />
  );
}
