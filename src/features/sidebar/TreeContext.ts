import { createContext, useContext } from 'react';
import type { Container } from '../../types';

/** Inline edit in progress: renaming a node, or creating a child under `id`. */
export interface Editing {
  mode: 'rename' | 'create';
  id: string;
}

interface TreeState {
  children: Map<string, Container[]>;
  taskCounts: Map<string, number>;
  canManage: boolean;
  collapsed: Set<string>;
  toggle: (id: string) => void;
  editing: Editing | null;
  setEditing: (editing: Editing | null) => void;
}

export const TreeContext = createContext<TreeState | null>(null);

export function useTreeContext() {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error('useTreeContext must be used inside <WorkspaceTree>');
  return ctx;
}
