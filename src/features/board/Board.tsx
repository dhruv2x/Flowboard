import {
  closestCenter,
  DndContext,
  DragOverlay,
  getFirstCollision,
  KeyboardSensor,
  pointerWithin,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useUsersById } from '../../store/hooks';
import type { ListData } from '../../store/selectors';
import { useStore } from '../../store/store';
import { report } from '../../ui/toast';
import { Column } from './Column';
import { TaskCard } from './TaskCard';

type Columns = Record<string, string[]>;

interface Props {
  data: ListData;
  composeIn: string | null;
  onComposeIn: (statusId: string | null) => void;
}

/**
 * Kanban for one list. While dragging, a local copy of the columns follows the pointer;
 * on drop the store commits the move. A rejected move simply falls back to store state.
 */
export function Board({ data: { statuses, tasks }, composeIn, onComposeIn }: Props) {
  const moveTask = useStore((s) => s.moveTask);
  const usersById = useUsersById();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragColumns, setDragColumns] = useState<Columns>({});

  const tasksById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);
  const stored = useMemo<Columns>(
    () => Object.fromEntries(statuses.map((st) => [st.id, tasks.filter((t) => t.statusId === st.id).map((t) => t.id)])),
    [statuses, tasks],
  );
  const columns = activeId ? dragColumns : stored;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    // Enter stays free for opening a card, so only Space picks up and drops.
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  );

  const columnOf = (id: UniqueIdentifier, cols: Columns = columns) =>
    id in cols ? String(id) : Object.keys(cols).find((key) => cols[key].includes(String(id)));

  // Guards against cross-column oscillation: after a card hops columns, layout shifts can make the
  // old column win the next collision check and bounce it back forever ("Maximum update depth").
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const justMoved = useRef(false);
  useEffect(() => {
    requestAnimationFrame(() => (justMoved.current = false));
  }, [dragColumns]);

  /** Pointer target first; over a column, snap to its closest card; hold the last target while settling. */
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      const hits = pointerWithin(args);
      let overId = getFirstCollision(hits.length ? hits : rectIntersection(args), 'id');
      if (overId != null) {
        const cards = columns[String(overId)];
        if (cards?.length) {
          const inColumn = args.droppableContainers.filter((c) => cards.includes(String(c.id)));
          overId = closestCenter({ ...args, droppableContainers: inColumn })[0]?.id ?? overId;
        }
        lastOverId.current = overId;
        return [{ id: overId }];
      }
      if (justMoved.current) lastOverId.current = activeId;
      return lastOverId.current != null ? [{ id: lastOverId.current }] : [];
    },
    [activeId, columns],
  );

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    // Below the hovered card's midpoint inserts after it.
    const translated = active.rect.current.translated;
    const below = translated ? translated.top > over.rect.top + over.rect.height / 2 : false;
    setDragColumns((prev) => {
      const from = columnOf(active.id, prev);
      const to = columnOf(over.id, prev);
      if (!from || !to || from === to) return prev;
      justMoved.current = true;
      const target = prev[to].filter((id) => id !== active.id);
      const overIndex = target.indexOf(String(over.id));
      target.splice(overIndex < 0 ? target.length : overIndex + (below ? 1 : 0), 0, String(active.id));
      return { ...prev, [from]: prev[from].filter((id) => id !== active.id), [to]: target };
    });
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const column = columnOf(active.id);
    setActiveId(null);
    if (!over || !column) return;
    let items = columns[column];
    const from = items.indexOf(String(active.id));
    const to = items.indexOf(String(over.id));
    if (to >= 0 && from !== to) items = arrayMove(items, from, to);
    const beforeId = items[items.indexOf(String(active.id)) + 1] ?? null;
    report(moveTask(String(active.id), { statusId: column, beforeId }));
  };

  const titleOf = (id: UniqueIdentifier) => tasksById.get(String(id))?.title ?? '';
  const statusName = (id: UniqueIdentifier) => statuses.find((st) => st.id === columnOf(id))?.name ?? '';
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${titleOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${titleOf(active.id)} is in ${statusName(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) => (over ? `${titleOf(active.id)} dropped in ${statusName(over.id)}.` : undefined),
    onDragCancel: ({ active }) => `Moving ${titleOf(active.id)} was cancelled.`,
  };

  const active = activeId ? tasksById.get(activeId) : undefined;
  const activeColumn = activeId ? columnOf(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={({ active }) => {
        lastOverId.current = null;
        setDragColumns(stored);
        setActiveId(String(active.id));
      }}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{ announcements }}
    >
      {/* Out of flow so the wide column strip never widens the page on mobile; the parent is `relative`. */}
      <div className="absolute inset-0 flex gap-3 overflow-x-auto px-4 py-4 md:px-6">
        {statuses.map((status) => (
          <Column
            key={status.id}
            status={status}
            tasks={columns[status.id].flatMap((id) => tasksById.get(id) ?? [])}
            usersById={usersById}
            highlighted={activeColumn === status.id}
            composing={composeIn === status.id}
            onCompose={(open) => onComposeIn(open ? status.id : null)}
          />
        ))}
      </div>
      <DragOverlay>
        {active && (
          <TaskCard
            task={active}
            done={statuses.find((st) => st.id === activeColumn)?.category === 'done'}
            assignees={active.assigneeIds.flatMap((id) => usersById.get(id) ?? [])}
            className="rotate-[1.5deg] cursor-grabbing shadow-lift"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
