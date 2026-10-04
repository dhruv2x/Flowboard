import { DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import { Trash2, X } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { formatDate, fromDateInput, isOverdue, taskKey, timeAgo, toDateInput } from '../../lib/format';
import { useVisibleLists } from '../../store/hooks';
import { useStore } from '../../store/store';
import type { Priority, Task } from '../../types';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { PriorityIcon } from '../../ui/PriorityIcon';
import { fieldClass, Select } from '../../ui/Select';
import { StatusIcon } from '../../ui/StatusIcon';
import { notify, report } from '../../ui/toast';
import { PRIORITIES } from '../../ui/tokens';

/** Editable task fields. Text saves on blur; selects and toggles save immediately. */
export function TaskDetail({ task, onClose }: { task: Task; onClose: () => void }) {
  const allStatuses = useStore((s) => s.statuses);
  const users = useStore((s) => s.users);
  const updateTask = useStore((s) => s.updateTask);
  const moveTask = useStore((s) => s.moveTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const lists = useVisibleLists();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const statuses = useMemo(
    () => allStatuses.filter((st) => st.listId === task.primaryListId).sort((a, b) => a.position - b.position),
    [allStatuses, task.primaryListId],
  );
  const status = statuses.find((st) => st.id === task.statusId);
  const listLabel = lists.find((l) => l.list.id === task.primaryListId)?.label;
  const done = status?.category === 'done';

  const saveTitle = () => {
    if (title.trim() === task.title) return;
    if (!report(updateTask(task.id, { title }))) setTitle(task.title);
  };

  const toggleAssignee = (userId: string) => {
    const assigneeIds = task.assigneeIds.includes(userId)
      ? task.assigneeIds.filter((id) => id !== userId)
      : [...task.assigneeIds, userId];
    report(updateTask(task.id, { assigneeIds }));
  };

  const remove = () => {
    if (!report(deleteTask(task.id))) return;
    notify(`Deleted ${taskKey(task.number)}`);
    onClose();
  };

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="text-xs font-medium tabular-nums text-fg-muted">{taskKey(task.number)}</span>
        <span className="truncate text-xs text-fg-faint">{listLabel}</span>
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {confirmingDelete ? (
            <>
              <span className="mr-1 text-xs text-danger">Delete this task?</span>
              <Button size="sm" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={remove}>
                Delete
              </Button>
            </>
          ) : (
            <IconButton label="Delete task" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-3.5" />
            </IconButton>
          )}
          <IconButton autoFocus label="Close" onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <DialogTitle className="sr-only">{task.title}</DialogTitle>
        <textarea
          aria-label="Title"
          value={title}
          rows={1}
          maxLength={500}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          className="-mx-2 w-[calc(100%+1rem)] min-w-0 resize-none rounded-md border border-transparent bg-transparent px-2 py-1 text-lg font-semibold leading-7 tracking-tight outline-none [field-sizing:content] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20"
        />

        <dl className="mt-4 grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-3 gap-y-1">
          <Field label="Status">
            <Select
              aria-label="Status"
              value={task.statusId}
              onChange={(e) => report(moveTask(task.id, { statusId: e.target.value }))}
              leading={status && <StatusIcon category={status.category} color={status.color} />}
            >
              {statuses.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Priority">
            <Select
              aria-label="Priority"
              value={task.priority}
              onChange={(e) => report(updateTask(task.id, { priority: e.target.value as Priority }))}
              leading={<PriorityIcon priority={task.priority} />}
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Assignees">
            <div className="flex flex-wrap gap-1 py-1">
              {users.map((user) => {
                const assigned = task.assigneeIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    aria-pressed={assigned}
                    onClick={() => toggleAssignee(user.id)}
                    className={clsx(
                      'inline-flex h-7 items-center gap-1.5 rounded-md border pl-1 pr-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      assigned
                        ? 'border-accent/30 bg-accent-subtle text-fg'
                        : 'border-line text-fg-muted hover:bg-surface-muted hover:text-fg',
                    )}
                  >
                    <Avatar user={user} />
                    {user.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Due date">
            <div className="flex items-center gap-1">
              <input
                type="date"
                aria-label="Due date"
                value={toDateInput(task.dueDate)}
                onChange={(e) => report(updateTask(task.id, { dueDate: fromDateInput(e.target.value) }))}
                className={clsx(fieldClass, 'w-auto', task.dueDate && !done && isOverdue(task.dueDate) && 'text-danger')}
              />
              {task.dueDate && (
                <IconButton label="Clear due date" onClick={() => report(updateTask(task.id, { dueDate: null }))}>
                  <X className="size-3.5" />
                </IconButton>
              )}
            </div>
          </Field>

          <Field label="List">
            <Select
              aria-label="List"
              value={task.primaryListId}
              onChange={(e) => report(moveTask(task.id, { listId: e.target.value }))}
            >
              {lists.map(({ list, label }) => (
                <option key={list.id} value={list.id}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </dl>

        <label htmlFor="task-description" className="mt-6 block text-xs text-fg-muted">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          placeholder="Add more detail…"
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => description !== task.description && report(updateTask(task.id, { description }))}
          className="mt-1.5 min-h-32 w-full resize-none rounded-md border border-line bg-surface px-3 py-2 leading-6 outline-none [field-sizing:content] placeholder:text-fg-faint focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>

      <footer className="shrink-0 border-t border-line px-6 py-3 text-xs text-fg-muted">
        Created {formatDate(task.createdAt)} · Updated {timeAgo(task.updatedAt)}
      </footer>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-xs text-fg-muted">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}
