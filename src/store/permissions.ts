import type { Container, Grant, User } from '../types';

export const canManageContainers = (user: User) => user.role === 'admin';

/**
 * Ids of live containers the user can see. Access flows top-down: a node is
 * visible only if its parent is, then an explicit grant wins over visibility.
 */
export function visibleContainerIds(containers: Container[], grants: Grant[], user: User): Set<string> {
  const children = new Map<string | null, Container[]>();
  for (const c of containers) {
    if (c.archivedAt) continue;
    children.set(c.parentId, [...(children.get(c.parentId) ?? []), c]);
  }

  const modes = new Map(grants.filter((g) => g.userId === user.id).map((g) => [g.resourceId, g.mode]));
  const canSee = (node: Container) => {
    if (user.role === 'admin' || node.type === 'workspace') return true;
    const mode = modes.get(node.id);
    if (mode) return mode === 'allow';
    return node.visibility === 'public';
  };

  const visible = new Set<string>();
  const walk = (parentId: string | null) => {
    for (const node of children.get(parentId) ?? []) {
      if (!canSee(node)) continue;
      visible.add(node.id);
      walk(node.id);
    }
  };
  walk(null);
  return visible;
}
