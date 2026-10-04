import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { taskKey } from '../../lib/format';
import { useUI } from '../../store/ui';
import type { Status, Task, User } from '../../types';
import { IconButton } from '../../ui/IconButton';
import { StatusIcon } from '../../ui/StatusIcon';
import { TaskComposer } from '../task/TaskComposer';
import { TaskCard } from './TaskCard';

interface Props {
  status: Status;
  tasks: Task[];
  usersById: Map<string, User>;
  highlighted: boolean;
  composing: boolean;
  onCompose: (open: boolean) => void;
}

export function Column({ status, tasks, usersById, highlighted, composing, onCompose }: Props) {
  const { setNodeRef } = useDroppable({ id: status.id });

  return (
    <section aria-label={status.name} className="flex w-72 shrink-0 flex-col">
      <header className="flex h-9 items-center gap-2 px-1.5">
        <StatusIcon category={status.category} color={status.color} />
        <h2 className="font-medium">{status.name}</h2>
        <span className="text-xs tabular-nums text-fg-faint">{tasks.length}</span>
        <IconButton label={`Add task to ${status.name}`} className="ml-auto" onClick={() => onCompose(true)}>
          <Plus className="size-3.5" />
        </IconButton>
      </header>
      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto rounded-lg p-1.5 transition-colors',
          highlighted ? 'bg-accent-subtle ring-1 ring-inset ring-accent/30' : 'bg-surface-muted/70',
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard
              key={task.id}
              task={task}
              done={status.category === 'done'}
              assignees={task.assigneeIds.flatMap((id) => usersById.get(id) ?? [])}
            />
          ))}
        </SortableContext>
        {!tasks.length && !composing && (
          <p className="grid h-20 shrink-0 place-items-center rounded-md border border-dashed border-line-strong text-xs text-fg-faint">
            No tasks
          </p>
        )}
        {composing && <TaskComposer listId={status.listId} statusId={status.id} onClose={() => onCompose(false)} />}
      </div>
    </section>
  );
}

function SortableCard({ task, done, assignees }: { task: Task; done: boolean; assignees: User[] }) {
  const openTask = useUI((s) => s.openTask);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      // dnd-kit drives the drag transform.
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...attributes}
      {...listeners}
      aria-label={`${taskKey(task.number)} ${task.title}`}
      onClick={() => openTask(task.id)}
      onKeyDown={(e) => {
        listeners?.onKeyDown?.(e);
        if (e.key === 'Enter') openTask(task.id);
      }}
      className={clsx(
        'cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        isDragging && 'opacity-40',
      )}
    >
      <TaskCard task={task} assignees={assignees} done={done} />
    </div>
  );
}
