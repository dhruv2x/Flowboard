import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { Container } from '../types';
import { visibleContainerIds } from './permissions';
import { ancestorsOf, selectCurrentUser, selectListData, selectTask, type Snapshot } from './selectors';
import { useStore } from './store';

export const useCurrentUser = () => useStore(selectCurrentUser);

/** The slices permission-aware selectors read; shallow-compared so memos only rerun on real changes. */
const useSnapshot = (): Snapshot =>
  useStore(
    useShallow(({ users, currentUserId, containers, grants, statuses, tasks }) => ({
      users,
      currentUserId,
      containers,
      grants,
      statuses,
      tasks,
    })),
  );

export function useVisibleIds() {
  const containers = useStore((s) => s.containers);
  const grants = useStore((s) => s.grants);
  const user = useCurrentUser();
  return useMemo(() => visibleContainerIds(containers, grants, user), [containers, grants, user]);
}

/** Visible containers grouped by parent id, each group sorted by position. */
export function useTree() {
  const containers = useStore((s) => s.containers);
  const visible = useVisibleIds();

  return useMemo(() => {
    const children = new Map<string, Container[]>();
    for (const c of containers) {
      if (!c.parentId || !visible.has(c.id)) continue;
      children.set(c.parentId, [...(children.get(c.parentId) ?? []), c]);
    }
    for (const group of children.values()) group.sort((a, b) => a.position - b.position);
    return children;
  }, [containers, visible]);
}

/** Visible lists with a readable "Space / Folder / List" label, in tree order. */
export function useVisibleLists() {
  const containers = useStore((s) => s.containers);
  const visible = useVisibleIds();

  return useMemo(
    () =>
      containers
        .filter((c) => c.type === 'list' && visible.has(c.id))
        .map((list) => {
          const path = [...ancestorsOf(containers, list.id), list];
          return { list, label: path.map((c) => c.name).join(' / '), order: path.map((c) => c.position) };
        })
        .sort((a, b) => a.order.reduce((diff, p, i) => diff || p - (b.order[i] ?? 0), 0)),
    [containers, visible],
  );
}

export function useListData(listId: string | null) {
  const snapshot = useSnapshot();
  return useMemo(() => (listId ? selectListData(snapshot, listId) : null), [snapshot, listId]);
}

export function useTask(taskId: string | null) {
  const snapshot = useSnapshot();
  return useMemo(() => (taskId ? selectTask(snapshot, taskId) : null), [snapshot, taskId]);
}

export function useUsersById() {
  const users = useStore((s) => s.users);
  return useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
}
