import { useStore } from './store';

export const useCurrentUser = () => useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? s.users[0]);
