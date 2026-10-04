import { describe, expect, it } from 'vitest';
import { containers, grants, users } from '../data/seed';
import type { Container, Grant } from '../types';
import { visibleContainerIds } from './permissions';

function visibleLists(userId: string, cs: Container[] = containers, gs: Grant[] = grants) {
  const visible = visibleContainerIds(cs, gs, users.find((u) => u.id === userId)!);
  return cs.filter((c) => c.type === 'list' && visible.has(c.id)).map((c) => c.name);
}

describe('visibleContainerIds', () => {
  it('shows admins every list', () => {
    expect(visibleLists('u_aarav')).toEqual(['Backlog', 'Sprint 14', 'Launch Campaign']);
  });

  it('shows members public lists and explicit allows, minus denies', () => {
    expect(visibleLists('u_rohan')).toEqual(['Backlog']);
    expect(visibleLists('u_priya')).toEqual(['Sprint 14', 'Launch Campaign']);
  });

  it('never reveals a list inside a hidden parent', () => {
    const allowRohan: Grant = { id: 'g_test', resourceId: 'ls_campaign', userId: 'u_rohan', mode: 'allow' };
    expect(visibleLists('u_rohan', containers, [...grants, allowRohan])).not.toContain('Launch Campaign');
  });

  it('hides archived subtrees, even from admins', () => {
    const archived = containers.map((c) => (c.id === 'fd_q2' ? { ...c, archivedAt: '2026-01-01T00:00:00.000Z' } : c));
    expect(visibleLists('u_aarav', archived)).toEqual(['Launch Campaign']);
  });
});
