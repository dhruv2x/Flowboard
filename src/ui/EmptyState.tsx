import type { ReactNode } from 'react';

interface Props {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <h2 className="text-base font-semibold text-fg">{title}</h2>
      {children && <p className="mt-1 max-w-xs text-sm text-fg-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
