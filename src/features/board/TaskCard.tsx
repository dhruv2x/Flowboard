import clsx from 'clsx';
import { taskKey } from '../../lib/format';
import type { Task, User } from '../../types';
import { AvatarStack } from '../../ui/Avatar';
import { DueDate } from '../../ui/DueDate';
import { PriorityIcon } from '../../ui/PriorityIcon';
import { priorityLabel } from '../../ui/tokens';

interface Props {
  task: Task;
  assignees: User[];
  done: boolean;
  className?: string;
}

export function TaskCard({ task, assignees, done, className }: Props) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-2 rounded-lg border border-line bg-surface p-3 shadow-card transition-colors hover:border-line-strong',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-fg-muted">{taskKey(task.number)}</span>
        {task.priority !== 'none' && (
          <span title={`${priorityLabel(task.priority)} priority`}>
            <PriorityIcon priority={task.priority} />
            <span className="sr-only">{priorityLabel(task.priority)} priority</span>
          </span>
        )}
      </div>
      <p className={clsx('line-clamp-3 break-words', done ? 'text-fg-muted' : 'text-fg')}>{task.title}</p>
      {(task.dueDate || assignees.length > 0) && (
        <div className="flex items-center justify-between gap-2">
          {task.dueDate ? <DueDate iso={task.dueDate} done={done} /> : <span />}
          <AvatarStack users={assignees} />
        </div>
      )}
    </div>
  );
}
