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
    expect(visibleLists('u_alice')).toEqual(['Backlog', 'Sprint 14', 'Launch Campaign']);
  });

  it('shows members public lists and explicit allows, minus denies', () => {
    expect(visibleLists('u_bob')).toEqual(['Backlog']);
    expect(visibleLists('u_carol')).toEqual(['Sprint 14', 'Launch Campaign']);
  });

  it('never reveals a list inside a hidden parent', () => {
    const allowBob: Grant = { id: 'g_test', resourceId: 'ls_campaign', userId: 'u_bob', mode: 'allow' };
    expect(visibleLists('u_bob', containers, [...grants, allowBob])).not.toContain('Launch Campaign');
  });

  it('hides archived subtrees, even from admins', () => {
    const archived = containers.map((c) => (c.id === 'fd_q2' ? { ...c, archivedAt: '2026-01-01T00:00:00.000Z' } : c));
    expect(visibleLists('u_alice', archived)).toEqual(['Launch Campaign']);
  });
});
