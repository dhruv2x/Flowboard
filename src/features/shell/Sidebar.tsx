import clsx from 'clsx';
import { useEffect } from 'react';
import { useUI } from '../../store/ui';
import { WorkspaceTree } from '../sidebar/WorkspaceTree';
import { WorkspaceMenu } from './WorkspaceMenu';

export function Sidebar() {
  const open = useUI((s) => s.sidebarOpen);
  const setOpen = useUI((s) => s.setSidebarOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <>
      {open && (
        <div aria-hidden onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-fg/20 md:hidden" />
      )}
      {/* Off-canvas below md, static column above. */}
      <aside
        id="sidebar"
        className={clsx(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface-subtle transition-transform duration-200',
          'md:static md:z-auto md:w-auto md:translate-x-0',
          open ? 'translate-x-0 shadow-lift md:shadow-none' : 'max-md:invisible max-md:-translate-x-full',
        )}
      >
        <div className="flex h-12 shrink-0 items-center border-b border-line px-1.5">
          <WorkspaceMenu />
        </div>
        <nav aria-label="Workspace" className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
          <WorkspaceTree />
        </nav>
      </aside>
    </>
  );
}
