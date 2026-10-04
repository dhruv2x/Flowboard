import { Menu } from 'lucide-react';
import { useCurrentUser } from '../../store/hooks';
import { useUI } from '../../store/ui';
import { Avatar } from '../../ui/Avatar';

export function TopBar() {
  const user = useCurrentUser();
  const sidebarOpen = useUI((s) => s.sidebarOpen);
  const setSidebarOpen = useUI((s) => s.setSidebarOpen);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
      <button
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
        aria-controls="sidebar"
        aria-expanded={sidebarOpen}
        className="-ml-1.5 rounded p-1.5 text-fg-secondary hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
      >
        <Menu className="size-4" />
      </button>
      <div className="ml-auto flex items-center gap-2">
        <Avatar user={user} size="md" />
        <span className="hidden font-medium sm:inline">{user.name}</span>
        <span className="rounded-full bg-surface-muted px-2 text-2xs font-medium capitalize text-fg-secondary">
          {user.role}
        </span>
      </div>
    </header>
  );
}
