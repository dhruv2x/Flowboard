import { newId } from '../lib/id';
import type { Grant } from '../types';
import { requireAdmin } from './guards';
import { done, fail, type Result } from './result';
import type { SliceCreator } from './store';

export interface GrantActions {
  /** Sets one member's explicit access to a container; `null` removes it so visibility decides. */
  setGrant: (resourceId: string, userId: string, mode: Grant['mode'] | null) => Result;
}

export const createGrantSlice: SliceCreator<GrantActions> = (set, get) => ({
  setGrant: (resourceId, userId, mode) => {
    const s = get();
    const denied = requireAdmin(s);
    if (denied) return denied;
    const resource = s.containers.find((c) => c.id === resourceId);
    if (!resource || resource.type === 'workspace') return fail('NOT_FOUND', 'This item no longer exists.');
    const user = s.users.find((u) => u.id === userId);
    if (!user) return fail('NOT_FOUND', 'Unknown user.');
    if (user.role === 'admin') return fail('INVALID', 'Admins already see everything.');

    const others = s.grants.filter((g) => !(g.resourceId === resourceId && g.userId === userId));
    set({ grants: mode ? [...others, { id: newId('grant'), resourceId, userId, mode }] : others });
    return done();
  },
});
