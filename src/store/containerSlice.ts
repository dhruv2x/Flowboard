import { buildStatuses } from '../data/seed';
import { newId } from '../lib/id';
import { CHILD_TYPE, type Container, type Visibility } from '../types';
import { requireAdmin, validateName } from './guards';
import { done, fail, ok, type Result } from './result';
import type { SliceCreator } from './store';

export interface ContainerActions {
  createContainer: (parentId: string, name: string) => Result<Container>;
  renameContainer: (id: string, name: string) => Result;
  setVisibility: (id: string, visibility: Visibility) => Result;
  archiveContainer: (id: string) => Result;
  restoreContainer: (id: string) => Result;
  deleteContainer: (id: string) => Result;
  reorderContainers: (orderedIds: string[]) => Result;
}

const MAX_NAME = 80;

export const createContainerSlice: SliceCreator<ContainerActions> = (set, get) => {
  /** Shared guard for container edits: admin only, and the node must exist. */
  const editContainer = (id: string, change: (node: Container) => Result<Partial<Container>>): Result => {
    const s = get();
    const denied = requireAdmin(s);
    if (denied) return denied;
    const node = s.containers.find((c) => c.id === id);
    if (!node) return fail('NOT_FOUND', 'This item no longer exists.');
    const patch = change(node);
    if (patch.error) return patch;
    set({ containers: s.containers.map((c) => (c.id === id ? { ...c, ...patch.data } : c)) });
    return done();
  };

  return {
    createContainer: (parentId, name) => {
      const s = get();
      const denied = requireAdmin(s);
      if (denied) return denied;
      const parent = s.containers.find((c) => c.id === parentId && !c.archivedAt);
      if (!parent) return fail('NOT_FOUND', 'The parent no longer exists.');
      const type = CHILD_TYPE[parent.type];
      if (!type) return fail('INVALID', 'Lists hold tasks, not other containers.');
      const valid = validateName(name, MAX_NAME);
      if (valid.error) return valid;

      const siblings = s.containers.filter((c) => c.parentId === parentId);
      const node: Container = {
        id: newId(type),
        name: valid.data,
        type,
        parentId,
        position: Math.max(-1, ...siblings.map((c) => c.position)) + 1,
        visibility: 'public',
        archivedAt: null,
      };
      set({
        containers: [...s.containers, node],
        statuses: type === 'list' ? [...s.statuses, ...buildStatuses(node.id)] : s.statuses,
      });
      return ok(node);
    },

    renameContainer: (id, name) =>
      editContainer(id, () => {
        const valid = validateName(name, MAX_NAME);
        return valid.error ? valid : ok({ name: valid.data });
      }),

    setVisibility: (id, visibility) =>
      editContainer(id, (node) =>
        node.type === 'workspace' ? fail('INVALID', 'The workspace is always visible to members.') : ok({ visibility }),
      ),

    archiveContainer: (id) =>
      editContainer(id, (node) =>
        node.type === 'workspace'
          ? fail('INVALID', 'The workspace cannot be archived.')
          : ok({ archivedAt: new Date().toISOString() }),
      ),

    restoreContainer: (id) =>
      editContainer(id, (node) => {
        const parent = get().containers.find((c) => c.id === node.parentId);
        return parent?.archivedAt ? fail('INVALID', `Restore "${parent.name}" first.`) : ok({ archivedAt: null });
      }),

    /** Permanently removes an archived container with its subtree, tasks, statuses and grants. */
    deleteContainer: (id) => {
      const s = get();
      const denied = requireAdmin(s);
      if (denied) return denied;
      const node = s.containers.find((c) => c.id === id);
      if (!node) return fail('NOT_FOUND', 'This item no longer exists.');
      if (!node.archivedAt) return fail('INVALID', 'Archive an item before deleting it.');

      const removed = new Set<string>();
      const collect = (nodeId: string) => {
        removed.add(nodeId);
        for (const c of s.containers) if (c.parentId === nodeId) collect(c.id);
      };
      collect(id);
      set({
        containers: s.containers.filter((c) => !removed.has(c.id)),
        statuses: s.statuses.filter((st) => !removed.has(st.listId)),
        tasks: s.tasks.filter((t) => !removed.has(t.primaryListId)),
        grants: s.grants.filter((g) => !removed.has(g.resourceId)),
      });
      return done();
    },

    reorderContainers: (orderedIds) => {
      const s = get();
      const denied = requireAdmin(s);
      if (denied) return denied;
      const parents = new Set(orderedIds.map((id) => s.containers.find((c) => c.id === id)?.parentId));
      if (parents.size !== 1) return fail('INVALID', 'Only siblings can be reordered.');
      const position = new Map(orderedIds.map((id, i) => [id, i]));
      set({ containers: s.containers.map((c) => (position.has(c.id) ? { ...c, position: position.get(c.id)! } : c)) });
      return done();
    },
  };
};
