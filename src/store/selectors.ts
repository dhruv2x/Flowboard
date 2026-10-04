import type { Container, Status, Task } from '../types';
import { visibleContainerIds } from './permissions';
import { fail, ok, type Result } from './result';
import type { DataState } from './store';

export type Snapshot = Pick<DataState, 'users' | 'currentUserId' | 'containers' | 'grants' | 'statuses' | 'tasks'>;

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

export const selectCurrentUser = (s: Pick<DataState, 'users' | 'currentUserId'>) =>
  s.users.find((u) => u.id === s.currentUserId) ?? s.users[0];

export const selectVisibleIds = (s: Snapshot) => visibleContainerIds(s.containers, s.grants, selectCurrentUser(s));

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

const isArchived = (containers: Container[], id: string) =>
  [containers.find((c) => c.id === id), ...ancestorsOf(containers, id)].some((c) => !c || c.archivedAt);

/** The list if the current user may open it; 404 when archived or gone, 403 when hidden by permissions. */
export function selectListAccess(s: Snapshot, listId: string): Result<Container> {
  const list = s.containers.find((c) => c.id === listId && c.type === 'list');
  if (!list || isArchived(s.containers, list.id)) return fail('NOT_FOUND', 'This list was archived or deleted.');
  if (!selectVisibleIds(s).has(list.id)) return fail('FORBIDDEN', 'You don’t have access to this list.');
  return ok(list);
}

export function selectTask(s: Snapshot, taskId: string): Result<Task> {
  const task = s.tasks.find((t) => t.id === taskId);
  if (!task) return fail('NOT_FOUND', 'This task was deleted.');
  const access = selectListAccess(s, task.primaryListId);
  return access.error ? access : ok(task);
}

export interface ListData {
  list: Container;
  statuses: Status[];
  tasks: Task[];
}

export function selectListData(s: Snapshot, listId: string): Result<ListData> {
  const access = selectListAccess(s, listId);
  if (access.error) return access;
  return ok({
    list: access.data,
    statuses: s.statuses.filter((st) => st.listId === listId).sort(byPosition),
    tasks: s.tasks.filter((t) => t.primaryListId === listId).sort(byPosition),
  });
}
