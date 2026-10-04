import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import clsx from 'clsx';
import { Archive, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCurrentUser } from '../../store/hooks';
import { canManageContainers } from '../../store/permissions';
import { ancestorsOf } from '../../store/selectors';
import { useStore } from '../../store/store';
import type { Container } from '../../types';
import { IconButton } from '../../ui/IconButton';
import { notify, report } from '../../ui/toast';

const textButton =
  'rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

export function ArchivePanel() {
  const user = useCurrentUser();
  const containers = useStore((s) => s.containers);

  const archived = useMemo(
    () => containers.filter((c) => c.archivedAt).sort((a, b) => b.archivedAt!.localeCompare(a.archivedAt!)),
    [containers],
  );

  if (!canManageContainers(user)) return null;

  return (
    <Popover className="border-t border-line p-2">
      <PopoverButton className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-fg-secondary hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[open]:bg-surface-muted">
        <Archive className="size-3.5 text-fg-faint" />
        Archive
        <span className="ml-auto text-xs tabular-nums text-fg-faint">{archived.length}</span>
      </PopoverButton>
      <PopoverPanel
        anchor={{ to: 'top start', gap: 6 }}
        className="z-50 max-h-80 w-80 overflow-y-auto rounded-lg border border-line bg-surface p-1 shadow-lift focus:outline-none"
      >
        {archived.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-fg-muted">Archived spaces, folders and lists appear here.</p>
        ) : (
          archived.map((node) => <ArchivedRow key={node.id} node={node} containers={containers} />)
        )}
      </PopoverPanel>
    </Popover>
  );
}

/** One archived item; delete asks for an inline confirmation because it cannot be undone. */
function ArchivedRow({ node, containers }: { node: Container; containers: Container[] }) {
  const restoreContainer = useStore((s) => s.restoreContainer);
  const deleteContainer = useStore((s) => s.deleteContainer);
  const [confirming, setConfirming] = useState(false);
  const path = ancestorsOf(containers, node.id).map((c) => c.name).join(' / ');

  return (
    <div className={clsx('flex items-center gap-2 rounded px-2 py-1.5', confirming ? 'bg-danger-subtle' : 'hover:bg-surface-muted')}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-fg">{node.name}</p>
        <p className={clsx('text-xs', confirming ? 'text-danger' : 'truncate capitalize text-fg-muted')}>
          {confirming ? 'Deletes everything inside. This can’t be undone.' : `${node.type}${path ? ` · ${path}` : ''}`}
        </p>
      </div>
      {confirming ? (
        <>
          <button onClick={() => setConfirming(false)} className={clsx(textButton, 'text-fg-secondary hover:bg-surface')}>
            Cancel
          </button>
          <button
            autoFocus
            onClick={() => report(deleteContainer(node.id)) && notify(`Deleted "${node.name}"`)}
            className={clsx(textButton, 'bg-danger text-white hover:bg-danger/90')}
          >
            Delete
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => report(restoreContainer(node.id)) && notify(`Restored "${node.name}"`)}
            className={clsx(textButton, 'text-accent hover:bg-accent-subtle')}
          >
            Restore
          </button>
          <IconButton
            label={`Delete ${node.name} permanently`}
            onClick={() => setConfirming(true)}
            className="hover:bg-danger-subtle hover:text-danger"
          >
            <Trash2 className="size-3.5" />
          </IconButton>
        </>
      )}
    </div>
  );
}
