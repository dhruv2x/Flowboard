import { create } from 'zustand';
import type { Result } from '../store/result';

export interface Toast {
  id: number;
  kind: 'error' | 'success';
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (kind: Toast['kind'], message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToasts = create<ToastState>()((set) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Surfaces a failed store mutation as a toast. Returns true when the mutation succeeded. */
export function report<T>(result: Result<T>): result is { data: T } {
  if (result.error) {
    useToasts.getState().push('error', result.error.message);
    return false;
  }
  return true;
}
