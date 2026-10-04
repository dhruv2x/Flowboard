import { create, type StoreApi } from 'zustand';
import { persist } from 'zustand/middleware';
import * as seed from '../data/seed';
import type { Container, Grant, Status, Task, User } from '../types';
import { createContainerSlice, type ContainerActions } from './containerSlice';
import { createStatusSlice, type StatusActions } from './statusSlice';
import { createTaskSlice, type TaskActions } from './taskSlice';

export interface DataState {
  users: User[];
  containers: Container[];
  statuses: Status[];
  tasks: Task[];
  grants: Grant[];
  currentUserId: string;
  nextTaskNumber: number;
}

interface SessionActions {
  switchUser: (userId: string) => void;
  resetDemo: () => void;
}

export type Store = DataState & SessionActions & ContainerActions & StatusActions & TaskActions;

export type SliceCreator<T> = (set: StoreApi<Store>['setState'], get: StoreApi<Store>['getState']) => T;

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
    (set, get) => ({
      ...initialData(),
      switchUser: (userId) => set({ currentUserId: userId }),
      resetDemo: () => set(initialData()),
      ...createContainerSlice(set, get),
      ...createStatusSlice(set, get),
      ...createTaskSlice(set, get),
    }),
    { name: 'flowboard:data', version: 1 },
  ),
);
