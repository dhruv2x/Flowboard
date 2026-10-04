import clsx from 'clsx';
import { Calendar } from 'lucide-react';
import { formatDay, isOverdue } from '../lib/format';

export function DueDate({ iso, done }: { iso: string; done: boolean }) {
  const overdue = !done && isOverdue(iso);

  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs tabular-nums', overdue ? 'text-danger' : 'text-fg-muted')}>
      <Calendar className="size-3" aria-hidden />
      {formatDay(iso)}
      {overdue && <span className="sr-only">, overdue</span>}
    </span>
  );
}
