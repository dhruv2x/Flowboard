import clsx from 'clsx';
import { X } from 'lucide-react';
import { useToasts } from './toast';

export function Toaster() {
  const { toasts, dismiss } = useToasts();

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-line bg-surface py-2.5 pl-3 pr-2 shadow-lift"
        >
          <span
            className={clsx('mt-[7px] size-1.5 shrink-0 rounded-full', toast.kind === 'error' ? 'bg-danger' : 'bg-status-green')}
          />
          <p className="flex-1 text-fg">{toast.message}</p>
          <button
            onClick={() => dismiss(toast.id)}
            aria-label="Dismiss"
            className="rounded p-0.5 text-fg-faint hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
