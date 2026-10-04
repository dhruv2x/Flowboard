import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as seed from '../data/seed';
import type { Container, Grant, Status, Task, User } from '../types';

export interface DataState {
  users: User[];
  containers: Container[];
  statuses: Status[];
  tasks: Task[];
  grants: Grant[];
  currentUserId: string;
  nextTaskNumber: number;
}

interface Actions {
  switchUser: (userId: string) => void;
  resetDemo: () => void;
}

export type Store = DataState & Actions;

const initialData = (): DataState => ({
  users: seed.users,
  containers: seed.containers,
  statuses: seed.statuses,
  tasks: seed.tasks,
  grants: seed.grants,
  currentUserId: seed.users[0].id,
  nextTaskNumber: seed.tasks.length + 1,
});

export const useStore = create<Store>()(
  persist(
    (set) => ({
      ...initialData(),
      switchUser: (userId) => set({ currentUserId: userId }),
      resetDemo: () => set(initialData()),
    }),
    { name: 'flowboard:data', version: 1 },
  ),
);
