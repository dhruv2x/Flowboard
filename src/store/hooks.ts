import { useMemo } from 'react';
import type { Container } from '../types';
import { visibleContainerIds } from './permissions';
import { selectCurrentUser } from './selectors';
import { useStore } from './store';

export const useCurrentUser = () => useStore(selectCurrentUser);

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
