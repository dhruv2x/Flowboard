import clsx from 'clsx';
import type { ComponentProps } from 'react';

const variants = {
  primary: 'bg-fg text-white hover:bg-fg/85',
  secondary: 'border border-line bg-surface text-fg hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:bg-danger/90',
};

type Props = ComponentProps<'button'> & { variant?: keyof typeof variants; size?: 'sm' | 'md' };

export function Button({ variant = 'secondary', size = 'md', className, ...props }: Props) {
  return (
    <button
      type="button"
      className={clsx(
        'inline-flex shrink-0 items-center gap-1.5 rounded-md font-medium disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
        size === 'md' ? 'h-8 px-3 text-sm' : 'h-7 px-2.5 text-xs',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
