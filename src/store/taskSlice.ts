import { newId } from '../lib/id';
import type { Task } from '../types';
import { done, fail, ok, type Result } from './result';
import { selectListAccess, selectTask } from './selectors';
import type { DataState, SliceCreator } from './store';

export type TaskPatch = Partial<Pick<Task, 'title' | 'description' | 'priority' | 'assigneeIds' | 'dueDate'>>;

/** Where a task lands: omitted list keeps the current one, omitted status maps by category. */
export interface MoveTarget {
  listId?: string;
  statusId?: string;
  beforeId?: string | null;
}

export interface TaskActions {
  createTask: (listId: string, statusId: string, title: string) => Result<Task>;
  updateTask: (id: string, patch: TaskPatch) => Result;
  moveTask: (id: string, to: MoveTarget) => Result;
  deleteTask: (id: string) => Result;
}

const MAX_TITLE = 500;

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

function validateTitle(title: string): Result<string> {
  const trimmed = title.trim();
  if (!trimmed) return fail('INVALID', 'Title is required.');
  if (trimmed.length > MAX_TITLE) return fail('INVALID', `Title must be ${MAX_TITLE} characters or fewer.`);
  return ok(trimmed);
}

const statusBelongs = (s: DataState, listId: string, statusId: string) =>
  s.statuses.some((st) => st.id === statusId && st.listId === listId);

/** Status in `listId` with the same category as the task's current one, else the list's first status. */
function matchStatus(s: DataState, task: Task, listId: string) {
  const category = s.statuses.find((st) => st.id === task.statusId)?.category;
  const options = s.statuses.filter((st) => st.listId === listId).sort(byPosition);
  return (options.find((st) => st.category === category) ?? options[0])?.id;
}

/** Positions for the destination column with `task` inserted before `beforeId`, or at the end. */
function placeInColumn(tasks: Task[], task: Task, listId: string, statusId: string, beforeId: string | null) {
  const column = tasks
    .filter((t) => t.primaryListId === listId && t.statusId === statusId && t.id !== task.id)
    .sort(byPosition);
  const index = beforeId ? column.findIndex((t) => t.id === beforeId) : -1;
  column.splice(index < 0 ? column.length : index, 0, task);
  return new Map(column.map((t, i) => [t.id, i]));
}

export const createTaskSlice: SliceCreator<TaskActions> = (set, get) => ({
  createTask: (listId, statusId, title) => {
    const s = get();
    const access = selectListAccess(s, listId);
    if (access.error) return access;
    if (!statusBelongs(s, listId, statusId)) return fail('INVALID', 'That status does not belong to this list.');
    const valid = validateTitle(title);
    if (valid.error) return valid;

    const now = new Date().toISOString();
    const column = s.tasks.filter((t) => t.primaryListId === listId && t.statusId === statusId);
    const task: Task = {
      id: newId('task'),
      number: s.nextTaskNumber,
      title: valid.data,
      description: '',
      statusId,
      priority: 'none',
      assigneeIds: [],
      dueDate: null,
      position: Math.max(-1, ...column.map((t) => t.position)) + 1,
      primaryListId: listId,
      createdAt: now,
      updatedAt: now,
    };
    set({ tasks: [...s.tasks, task], nextTaskNumber: s.nextTaskNumber + 1 });
    return ok(task);
  },

  updateTask: (id, patch) => {
    const s = get();
    const found = selectTask(s, id);
    if (found.error) return found;
    const next: Task = { ...found.data, ...patch, updatedAt: new Date().toISOString() };
    if (patch.title !== undefined) {
      const valid = validateTitle(patch.title);
      if (valid.error) return valid;
      next.title = valid.data;
    }
    if (patch.assigneeIds?.some((userId) => !s.users.some((u) => u.id === userId))) {
      return fail('INVALID', 'Unknown assignee.');
    }
    set({ tasks: s.tasks.map((t) => (t.id === id ? next : t)) });
    return done();
  },

  moveTask: (id, { listId, statusId, beforeId = null }) => {
    const s = get();
    const found = selectTask(s, id);
    if (found.error) return found;
    const task = found.data;
    const targetListId = listId ?? task.primaryListId;
    if (targetListId !== task.primaryListId) {
      const access = selectListAccess(s, targetListId);
      if (access.error) return access;
    }
    const targetStatusId = statusId ?? matchStatus(s, task, targetListId);
    if (!targetStatusId || !statusBelongs(s, targetListId, targetStatusId)) {
      return fail('INVALID', 'That status does not belong to this list.');
    }

    const positions = placeInColumn(s.tasks, task, targetListId, targetStatusId, beforeId);
    const updatedAt = new Date().toISOString();
    set({
      tasks: s.tasks.map((t) => {
        if (t.id === id) {
          return { ...t, primaryListId: targetListId, statusId: targetStatusId, position: positions.get(id)!, updatedAt };
        }
        return positions.has(t.id) ? { ...t, position: positions.get(t.id)! } : t;
      }),
    });
    return done();
  },

  deleteTask: (id) => {
    const s = get();
    const found = selectTask(s, id);
    if (found.error) return found;
    set({ tasks: s.tasks.filter((t) => t.id !== id) });
    return done();
  },
});
