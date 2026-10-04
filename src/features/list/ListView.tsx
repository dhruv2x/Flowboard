import clsx from 'clsx';
import { ArrowDown, ArrowUp, ArrowUpDown, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { taskKey } from '../../lib/format';
import { useUsersById } from '../../store/hooks';
import type { ListData } from '../../store/selectors';
import { useUI } from '../../store/ui';
import type { Task } from '../../types';
import { AvatarStack } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { DueDate } from '../../ui/DueDate';
import { EmptyState } from '../../ui/EmptyState';
import { PriorityIcon } from '../../ui/PriorityIcon';
import { StatusIcon } from '../../ui/StatusIcon';
import { PRIORITIES, priorityLabel } from '../../ui/tokens';
import { TaskComposer } from '../task/TaskComposer';

type SortKey = 'due' | 'priority';
type Direction = 'asc' | 'desc';
interface Sort {
  key: SortKey;
  dir: Direction;
}

// First click sorts the useful way round: soonest due, most urgent first.
const FIRST_DIR: Record<SortKey, Direction> = { due: 'asc', priority: 'desc' };
const RANK = Object.fromEntries(PRIORITIES.map((p) => [p.value, p.rank]));

function compare({ key, dir }: Sort, a: Task, b: Task) {
  const sign = dir === 'asc' ? 1 : -1;
  if (key === 'priority') return sign * (RANK[a.priority] - RANK[b.priority]);
  // Tasks without a due date sink to the bottom in both directions.
  if (!a.dueDate || !b.dueDate) return Number(!a.dueDate) - Number(!b.dueDate);
  return sign * a.dueDate.localeCompare(b.dueDate);
}

const cell = 'h-10 border-b border-line px-3';

interface Props {
  data: ListData;
  composeIn: string | null;
  onComposeIn: (statusId: string | null) => void;
}

/** Dense table of a list's tasks. Unsorted it follows board order: status, then position. */
export function ListView({ data: { list, statuses, tasks }, composeIn, onComposeIn }: Props) {
  const openTask = useUI((s) => s.openTask);
  const usersById = useUsersById();
  const [sort, setSort] = useState<Sort | null>(null);

  const statusById = useMemo(() => new Map(statuses.map((st) => [st.id, st])), [statuses]);
  const rows = useMemo(() => {
    const order = new Map(statuses.map((st, i) => [st.id, i]));
    const manual = [...tasks].sort((a, b) => order.get(a.statusId)! - order.get(b.statusId)! || a.position - b.position);
    return sort ? manual.sort((a, b) => compare(sort, a, b)) : manual;
  }, [tasks, statuses, sort]);

  // Cycles: first direction, reversed, then back to board order.
  const toggleSort = (key: SortKey) =>
    setSort((current) => {
      if (current?.key !== key) return { key, dir: FIRST_DIR[key] };
      return current.dir === FIRST_DIR[key] ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : null;
    });

  return (
    <div className="absolute inset-0 overflow-y-auto">
      {composeIn && (
        <div className="max-w-xl px-4 pt-4 md:px-6">
          <TaskComposer listId={list.id} statusId={composeIn} onClose={() => onComposeIn(null)} />
        </div>
      )}

      {rows.length === 0 && !composeIn ? (
        <EmptyState
          title="No tasks yet"
          action={
            <Button onClick={() => onComposeIn(statuses[0]?.id ?? null)}>
              <Plus className="size-3.5" />
              New task
            </Button>
          }
        >
          Tasks added to this list will show up here.
        </EmptyState>
      ) : (
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-10 bg-surface text-xs text-fg-muted">
            <tr>
              <th scope="col" className={clsx(cell, 'hidden w-24 font-medium md:table-cell md:pl-6')}>
                ID
              </th>
              <th scope="col" className={clsx(cell, 'pl-4 font-medium md:pl-3')}>
                Title
              </th>
              <th scope="col" className={clsx(cell, 'w-32 font-medium sm:w-40')}>
                Status
              </th>
              <th scope="col" className={clsx(cell, 'hidden w-28 font-medium lg:table-cell')}>
                Assignees
              </th>
              <SortHeader label="Priority" sortKey="priority" sort={sort} onToggle={toggleSort} className="hidden w-32 sm:table-cell" />
              <SortHeader label="Due" sortKey="due" sort={sort} onToggle={toggleSort} className="w-24 pr-4 md:pr-6" />
            </tr>
          </thead>
          <tbody>
            {rows.map((task) => {
              const status = statusById.get(task.statusId);
              const done = status?.category === 'done';
              return (
                <tr
                  key={task.id}
                  tabIndex={0}
                  aria-label={`${taskKey(task.number)} ${task.title}`}
                  onClick={() => openTask(task.id)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    openTask(task.id);
                  }}
                  className="cursor-pointer outline-none hover:bg-surface-subtle focus-visible:bg-accent-subtle"
                >
                  <td className={clsx(cell, 'hidden text-xs tabular-nums text-fg-muted md:table-cell md:pl-6')}>
                    {taskKey(task.number)}
                  </td>
                  <td className={clsx(cell, 'truncate pl-4 md:pl-3', done ? 'text-fg-muted' : 'text-fg')}>{task.title}</td>
                  <td className={cell}>
                    {status && (
                      <span className="flex items-center gap-2 text-fg-secondary">
                        <StatusIcon category={status.category} color={status.color} />
                        <span className="truncate">{status.name}</span>
                      </span>
                    )}
                  </td>
                  <td className={clsx(cell, 'hidden lg:table-cell')}>
                    {task.assigneeIds.length ? (
                      <AvatarStack users={task.assigneeIds.flatMap((id) => usersById.get(id) ?? [])} />
                    ) : (
                      <Empty />
                    )}
                  </td>
                  <td className={clsx(cell, 'hidden sm:table-cell')}>
                    {task.priority === 'none' ? (
                      <Empty />
                    ) : (
                      <span className="flex items-center gap-2 text-fg-secondary">
                        <PriorityIcon priority={task.priority} />
                        {priorityLabel(task.priority)}
                      </span>
                    )}
                  </td>
                  <td className={clsx(cell, 'pr-4 md:pr-6')}>
                    {task.dueDate ? <DueDate iso={task.dueDate} done={done} /> : <Empty />}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  sort: Sort | null;
  onToggle: (key: SortKey) => void;
  className?: string;
}

function SortHeader({ label, sortKey, sort, onToggle, className }: SortHeaderProps) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={clsx(cell, 'font-medium', className)}
    >
      <button
        onClick={() => onToggle(sortKey)}
        className={clsx(
          '-ml-1.5 inline-flex h-6 items-center gap-1 rounded px-1.5 hover:bg-surface-muted hover:text-fg',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          active && 'text-fg',
        )}
      >
        {label}
        <Icon className={clsx('size-3', !active && 'text-fg-faint')} />
      </button>
    </th>
  );
}

const Empty = () => <span className="text-fg-faint">—</span>;
