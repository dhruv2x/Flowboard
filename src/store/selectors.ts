import type { Container } from '../types';
import { visibleContainerIds } from './permissions';
import type { DataState } from './store';

export const selectCurrentUser = (s: DataState) => s.users.find((u) => u.id === s.currentUserId) ?? s.users[0];

export const selectVisibleIds = (s: DataState) => visibleContainerIds(s.containers, s.grants, selectCurrentUser(s));

/** Ancestors of a container from the top space down, excluding the workspace. */
export function ancestorsOf(containers: Container[], id: string): Container[] {
  const byId = new Map(containers.map((c) => [c.id, c]));
  const path: Container[] = [];
  let node = byId.get(byId.get(id)?.parentId ?? '');
  while (node && node.type !== 'workspace') {
    path.unshift(node);
    node = byId.get(node.parentId ?? '');
  }
  return path;
}
