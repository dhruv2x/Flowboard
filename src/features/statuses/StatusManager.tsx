import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Menu, MenuButton, MenuItem, Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import clsx from 'clsx';
import { Check, Columns3, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../../store/store';
import type { Status, StatusCategory } from '../../types';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { MenuPanel } from '../../ui/Menu';
import { fieldClass, Select } from '../../ui/Select';
import { StatusIcon } from '../../ui/StatusIcon';
import { notify, report } from '../../ui/toast';
import { CATEGORIES, STATUS_COLORS } from '../../ui/tokens';

/** Admin popover for a list's status set: add, rename, recolor, recategorize, reorder and delete. */
export function StatusManager({ listId, statuses }: { listId: string; statuses: Status[] }) {
  const tasks = useStore((s) => s.tasks);
  const reorderStatuses = useStore((s) => s.reorderStatuses);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) counts.set(t.statusId, (counts.get(t.statusId) ?? 0) + 1);
    return counts;
  }, [tasks]);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = statuses.map((st) => st.id);
    report(reorderStatuses(listId, arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))));
  };

  return (
    <Popover>
      <PopoverButton as={Button}>
        <Columns3 className="size-3.5" />
        Statuses
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: 'bottom end', gap: 6 }}
        className="z-30 w-[26rem] rounded-lg border border-line bg-surface p-2 shadow-lift focus:outline-none"
      >
        <p className="px-1 pb-1.5 text-xs font-medium text-fg-muted">Statuses · columns on the board</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={statuses.map((st) => st.id)} strategy={verticalListSortingStrategy}>
            {statuses.map((status) => (
              <StatusRow key={status.id} status={status} statuses={statuses} taskCount={taskCounts.get(status.id) ?? 0} />
            ))}
          </SortableContext>
        </DndContext>
        <AddStatus listId={listId} />
      </PopoverPanel>
    </Popover>
  );
}

function StatusRow({ status, statuses, taskCount }: { status: Status; statuses: Status[]; taskCount: number }) {
  const updateStatus = useStore((s) => s.updateStatus);
  const deleteStatus = useStore((s) => s.deleteStatus);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
  });
  const [name, setName] = useState(status.name);
  // Set while confirming a delete that has tasks to relocate.
  const [moveTo, setMoveTo] = useState<string | null>(null);
  const others = statuses.filter((st) => st.id !== status.id);

  const saveName = () => {
    if (name.trim() === status.name) return;
    if (!report(updateStatus(status.id, { name }))) setName(status.name);
  };

  const remove = (target: string | null) => {
    if (report(deleteStatus(status.id, target))) notify(`Deleted "${status.name}"`);
  };

  return (
    <div
      ref={setNodeRef}
      // dnd-kit drives the drag transform; vertical only.
      style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
      className={clsx('relative rounded-md bg-surface', isDragging && 'z-10 opacity-60')}
    >
      <div className="flex items-center gap-1">
        <IconButton
          ref={setActivatorNodeRef}
          label={`Reorder ${status.name}`}
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </IconButton>
        <ColorMenu status={status} />
        <input
          aria-label="Status name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          className={clsx(fieldClass, 'min-w-0 flex-1')}
        />
        <Select
          aria-label={`Category of ${status.name}`}
          value={status.category}
          onChange={(e) => report(updateStatus(status.id, { category: e.target.value as StatusCategory }))}
          className="w-32 shrink-0"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        <span title={`${taskCount} tasks`} className="w-5 shrink-0 text-right text-xs tabular-nums text-fg-faint">
          {taskCount}
        </span>
        <IconButton
          label={`Delete ${status.name}`}
          onClick={() => (taskCount ? setMoveTo(others[0]?.id ?? null) : remove(null))}
          className="hover:bg-danger-subtle hover:text-danger"
        >
          <Trash2 className="size-3.5" />
        </IconButton>
      </div>

      {moveTo && (
        <div className="mb-1 ml-7 mt-0.5 flex items-center gap-2 rounded-md bg-danger-subtle py-1.5 pl-2.5 pr-1.5 text-xs text-danger">
          <span className="shrink-0">
            Move {taskCount} {taskCount === 1 ? 'task' : 'tasks'} to
          </span>
          <Select
            aria-label="Move tasks to"
            value={moveTo}
            onChange={(e) => setMoveTo(e.target.value)}
            className="min-w-0 flex-1 rounded-md bg-surface"
          >
            {others.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </Select>
          <Button size="sm" onClick={() => setMoveTo(null)}>
            Cancel
          </Button>
          <Button size="sm" variant="danger" onClick={() => remove(moveTo)}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}

function ColorMenu({ status }: { status: Status }) {
  const updateStatus = useStore((s) => s.updateStatus);

  return (
    <Menu>
      <MenuButton as={IconButton} label={`Color of ${status.name}`}>
        <StatusIcon category={status.category} color={status.color} />
      </MenuButton>
      <MenuPanel>
        {STATUS_COLORS.map((c) => (
          <MenuItem key={c.value}>
            <button
              onClick={() => report(updateStatus(status.id, { color: c.value }))}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-fg data-[focus]:bg-surface-muted"
            >
              <StatusIcon category={status.category} color={c.value} />
              {c.label}
              {c.value === status.color && <Check className="ml-auto size-3.5 text-fg-muted" />}
            </button>
          </MenuItem>
        ))}
      </MenuPanel>
    </Menu>
  );
}

function AddStatus({ listId }: { listId: string }) {
  const createStatus = useStore((s) => s.createStatus);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StatusCategory>('in_progress');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (report(createStatus(listId, name, category))) setName('');
      }}
      className="mt-2 flex items-center gap-1 border-t border-line pt-2"
    >
      <span className="grid size-6 shrink-0 place-items-center text-fg-faint">
        <Plus className="size-3.5" />
      </span>
      <input
        aria-label="New status name"
        placeholder="Add status"
        value={name}
        maxLength={40}
        onChange={(e) => setName(e.target.value)}
        className={clsx(fieldClass, 'min-w-0 flex-1 placeholder:text-fg-faint')}
      />
      <Select
        aria-label="New status category"
        value={category}
        onChange={(e) => setCategory(e.target.value as StatusCategory)}
        className="w-32 shrink-0"
      >
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" variant="primary" disabled={!name.trim()}>
        Add
      </Button>
    </form>
  );
}
