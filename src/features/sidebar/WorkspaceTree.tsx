import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad';
import { canManageContainers } from '../../store/permissions';
import { useCurrentUser, useTree } from '../../store/hooks';
import { useStore } from '../../store/store';
import { IconButton } from '../../ui/IconButton';
import { Skeleton } from '../../ui/Skeleton';
import { report } from '../../ui/toast';
import { TreeGroup } from './Tree';
import { TreeContext, type Editing } from './TreeContext';

export function WorkspaceTree() {
  const containers = useStore((s) => s.containers);
  const workspace = containers.find((c) => c.type === 'workspace');
  const tasks = useStore((s) => s.tasks);
  const reorderContainers = useStore((s) => s.reorderContainers);
  const children = useTree();
  const canManage = canManageContainers(useCurrentUser());
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [editing, setEditing] = useState<Editing | null>(null);
  const ready = useSimulatedLoad('workspace');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const taskCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) counts.set(t.primaryListId, (counts.get(t.primaryListId) ?? 0) + 1);
    return counts;
  }, [tasks]);

  const toggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const context = useMemo(
    () => ({ children, taskCounts, canManage, collapsed, toggle, editing, setEditing }),
    [children, taskCounts, canManage, collapsed, toggle, editing],
  );

  const nameOf = (id: UniqueIdentifier) => containers.find((c) => c.id === id)?.name ?? '';
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
    onDragOver: ({ active, over }) => (over ? `${nameOf(active.id)} is over ${nameOf(over.id)}.` : undefined),
    onDragEnd: ({ active, over }) => `${nameOf(active.id)} was dropped${over ? ` over ${nameOf(over.id)}` : ''}.`,
    onDragCancel: ({ active }) => `Moving ${nameOf(active.id)} was cancelled.`,
  };

  // Reorder only within the same parent; drops onto other groups are ignored.
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const siblings = [...children.values()].find((group) => group.some((c) => c.id === active.id));
    const ids = siblings?.map((c) => c.id) ?? [];
    if (!ids.includes(String(over.id))) return;
    report(reorderContainers(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))));
  };

  if (!ready) return <TreeSkeleton />;
  if (!workspace) return null;

  return (
    <TreeContext.Provider value={context}>
      <div className="flex h-7 items-center justify-between pl-2 pr-1">
        <p className="text-xs font-medium text-fg-muted">Spaces</p>
        {canManage && (
          <IconButton label="New space" onClick={() => setEditing({ mode: 'create', id: workspace.id })}>
            <Plus className="size-3.5" />
          </IconButton>
        )}
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{ announcements }}
      >
        <TreeGroup parentId={workspace.id} depth={0} />
      </DndContext>
    </TreeContext.Provider>
  );
}

// Indent levels and widths loosely mirror a real space › folder › list tree.
const SKELETON_ROWS = [
  ['ml-2', 'w-24'],
  ['ml-6', 'w-20'],
  ['ml-10', 'w-16'],
  ['ml-10', 'w-24'],
  ['ml-2', 'w-20'],
  ['ml-6', 'w-28'],
];

function TreeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading workspace" className="space-y-3 px-2 pt-2">
      <Skeleton className="mb-4 h-2.5 w-12" />
      {SKELETON_ROWS.map(([indent, width], i) => (
        <Skeleton key={i} className={clsx('h-3', indent, width)} />
      ))}
    </div>
  );
}
