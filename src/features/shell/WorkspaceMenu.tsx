import { Menu, MenuButton } from '@headlessui/react';
import { Archive, ChevronDown, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { initials } from '../../lib/format';
import { useCurrentUser } from '../../store/hooks';
import { canManageContainers } from '../../store/permissions';
import { useStore } from '../../store/store';
import { useUI } from '../../store/ui';
import { MenuAction, MenuDivider, MenuPanel } from '../../ui/Menu';
import { notify } from '../../ui/toast';
import { ArchiveDialog } from '../sidebar/ArchiveDialog';

/** Workspace header: admins open the archive from here; everyone can reset the demo data. */
export function WorkspaceMenu() {
  const containers = useStore((s) => s.containers);
  const resetDemo = useStore((s) => s.resetDemo);
  const closeTask = useUI((s) => s.closeTask);
  const canManage = canManageContainers(useCurrentUser());
  const [archiveOpen, setArchiveOpen] = useState(false);
  const workspace = containers.find((c) => c.type === 'workspace');
  const archivedCount = containers.filter((c) => c.archivedAt).length;

  if (!workspace) return null;

  return (
    <>
      <Menu>
        <MenuButton className="flex h-9 w-full items-center gap-2 rounded-md px-1.5 text-left hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[open]:bg-surface-muted">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-accent text-2xs font-semibold text-white">
            {initials(workspace.name)}
          </span>
          <span className="flex-1 truncate text-sm font-semibold">{workspace.name}</span>
          <ChevronDown className="size-3.5 shrink-0 text-fg-faint" />
        </MenuButton>
        <MenuPanel align="start" className="w-56">
          {canManage && (
            <>
              <MenuAction icon={Archive} onClick={() => setArchiveOpen(true)}>
                Archive
                <span className="ml-auto text-xs tabular-nums text-fg-faint">{archivedCount}</span>
              </MenuAction>
              <MenuDivider />
            </>
          )}
          <MenuAction
            icon={RotateCcw}
            onClick={() => {
              closeTask();
              resetDemo();
              notify('Demo data restored');
            }}
          >
            Reset demo data
          </MenuAction>
        </MenuPanel>
      </Menu>
      <ArchiveDialog open={archiveOpen} onClose={() => setArchiveOpen(false)} />
    </>
  );
}
