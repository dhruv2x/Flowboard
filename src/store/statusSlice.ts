import { newId } from '../lib/id';
import type { Status, StatusCategory, StatusColor } from '../types';
import { requireAdmin, validateName } from './guards';
import { done, fail, ok, type Result } from './result';
import { selectListAccess } from './selectors';
import type { DataState, SliceCreator } from './store';

export type StatusPatch = Partial<Pick<Status, 'name' | 'color' | 'category'>>;

export interface StatusActions {
  createStatus: (listId: string, name: string, category: StatusCategory) => Result<Status>;
  updateStatus: (id: string, patch: StatusPatch) => Result;
  /** Tasks still in the status move to `moveToId` (required when there are any). */
  deleteStatus: (id: string, moveToId: string | null) => Result;
  reorderStatuses: (listId: string, orderedIds: string[]) => Result;
}

const MAX_NAME = 40;

const DEFAULT_COLOR: Record<StatusCategory, StatusColor> = { todo: 'stone', in_progress: 'amber', done: 'green' };

const listStatuses = (s: DataState, listId: string) =>
  s.statuses.filter((st) => st.listId === listId).sort((a, b) => a.position - b.position);

/** Admin-only, and the list must still be open to the admin. */
function guard(s: DataState, listId: string) {
  return requireAdmin(s) ?? (selectListAccess(s, listId).error ? fail('NOT_FOUND', 'This list was archived or deleted.') : null);
}

function validateStatusName(s: DataState, listId: string, name: string, exceptId?: string): Result<string> {
  const valid = validateName(name, MAX_NAME);
  if (valid.error) return valid;
  const taken = listStatuses(s, listId).some(
    (st) => st.id !== exceptId && st.name.toLowerCase() === valid.data.toLowerCase(),
  );
  return taken ? fail('INVALID', `"${valid.data}" already exists in this list.`) : valid;
}

const hasOtherInCategory = (s: DataState, status: Status) =>
  listStatuses(s, status.listId).some((st) => st.id !== status.id && st.category === status.category);

const withPositions = (s: DataState, ordered: Status[]) => {
  const position = new Map(ordered.map((st, i) => [st.id, i]));
  return s.statuses.map((st) => (position.has(st.id) ? { ...st, position: position.get(st.id)! } : st));
};

export const createStatusSlice: SliceCreator<StatusActions> = (set, get) => ({
  createStatus: (listId, name, category) => {
    const s = get();
    const denied = guard(s, listId);
    if (denied) return denied;
    const valid = validateStatusName(s, listId, name);
    if (valid.error) return valid;

    const status: Status = { id: newId('status'), listId, name: valid.data, category, color: DEFAULT_COLOR[category], position: 0 };
    // New statuses sit after the last one of the same category, so columns stay grouped.
    const ordered = listStatuses(s, listId);
    const lastOfCategory = ordered.findLastIndex((st) => st.category === category);
    ordered.splice(lastOfCategory < 0 ? ordered.length : lastOfCategory + 1, 0, status);
    set({ statuses: withPositions({ ...s, statuses: [...s.statuses, status] }, ordered) });
    return ok(status);
  },

  updateStatus: (id, patch) => {
    const s = get();
    const status = s.statuses.find((st) => st.id === id);
    if (!status) return fail('NOT_FOUND', 'This status no longer exists.');
    const denied = guard(s, status.listId);
    if (denied) return denied;

    const next = { ...status, ...patch };
    if (patch.name !== undefined) {
      const valid = validateStatusName(s, status.listId, patch.name, id);
      if (valid.error) return valid;
      next.name = valid.data;
    }
    if (patch.category && patch.category !== status.category && !hasOtherInCategory(s, status)) {
      return fail('INVALID', 'Each list needs at least one status in every category.');
    }
    set({ statuses: s.statuses.map((st) => (st.id === id ? next : st)) });
    return done();
  },

  deleteStatus: (id, moveToId) => {
    const s = get();
    const status = s.statuses.find((st) => st.id === id);
    if (!status) return fail('NOT_FOUND', 'This status no longer exists.');
    const denied = guard(s, status.listId);
    if (denied) return denied;
    if (!hasOtherInCategory(s, status)) return fail('INVALID', 'Each list needs at least one status in every category.');

    const affected = s.tasks.filter((t) => t.statusId === id);
    if (affected.length) {
      const target = s.statuses.find((st) => st.id === moveToId && st.listId === status.listId && st.id !== id);
      if (!target) return fail('INVALID', 'Choose where its tasks should go.');
      // Moved tasks keep their order and land at the end of the target column.
      const start = Math.max(-1, ...s.tasks.filter((t) => t.statusId === target.id).map((t) => t.position)) + 1;
      const offset = new Map(affected.sort((a, b) => a.position - b.position).map((t, i) => [t.id, start + i]));
      set({
        tasks: s.tasks.map((t) => (offset.has(t.id) ? { ...t, statusId: target.id, position: offset.get(t.id)! } : t)),
      });
    }
    set({ statuses: get().statuses.filter((st) => st.id !== id) });
    return done();
  },

  reorderStatuses: (listId, orderedIds) => {
    const s = get();
    const denied = guard(s, listId);
    if (denied) return denied;
    const current = listStatuses(s, listId);
    if (orderedIds.length !== current.length || current.some((st) => !orderedIds.includes(st.id))) {
      return fail('INVALID', 'The status order is out of date.');
    }
    const byId = new Map(current.map((st) => [st.id, st]));
    set({ statuses: withPositions(s, orderedIds.map((statusId) => byId.get(statusId)!)) });
    return done();
  },
});
