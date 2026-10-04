import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type View = 'board' | 'list';

interface UIState {
  selectedListId: string | null;
  view: View;
  openTaskId: string | null;
  query: string;
  sidebarOpen: boolean;
  selectList: (listId: string) => void;
  setView: (view: View) => void;
  openTask: (taskId: string) => void;
  closeTask: () => void;
  setQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      selectedListId: null,
      view: 'board',
      openTaskId: null,
      query: '',
      sidebarOpen: false,
      selectList: (selectedListId) => set({ selectedListId, openTaskId: null, query: '', sidebarOpen: false }),
      setView: (view) => set({ view }),
      openTask: (openTaskId) => set({ openTaskId }),
      closeTask: () => set({ openTaskId: null }),
      setQuery: (query) => set({ query }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'flowboard:ui',
      partialize: ({ selectedListId, view }) => ({ selectedListId, view }),
    },
  ),
);
