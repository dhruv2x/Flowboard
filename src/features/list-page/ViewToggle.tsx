import clsx from 'clsx';
import { List, SquareKanban } from 'lucide-react';
import { useUI, type View } from '../../store/ui';

const VIEWS = [
  { value: 'board', label: 'Board', icon: SquareKanban },
  { value: 'list', label: 'List', icon: List },
] satisfies { value: View; label: string; icon: typeof List }[];

export function ViewToggle() {
  const view = useUI((s) => s.view);
  const setView = useUI((s) => s.setView);

  return (
    <div className="inline-flex h-8 items-center rounded-md border border-line bg-surface-subtle p-0.5">
      {VIEWS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          aria-pressed={view === value}
          onClick={() => setView(value)}
          className={clsx(
            'inline-flex h-full items-center gap-1.5 rounded px-2.5 text-xs font-medium',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
            view === value ? 'bg-surface text-fg shadow-card ring-1 ring-line' : 'text-fg-muted hover:text-fg',
          )}
        >
          <Icon className="size-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
