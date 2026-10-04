import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ancestorsOf } from '../../store/selectors';
import { useStore } from '../../store/store';
import type { Container } from '../../types';
import { Button } from '../../ui/Button';
import { IconButton } from '../../ui/IconButton';
import { notify, report } from '../../ui/toast';

const textButton =
  'rounded px-2 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent';

/** Admin dialog listing archived containers, newest first, with restore and permanent delete. */
export function ArchiveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const containers = useStore((s) => s.containers);

  const archived = useMemo(
    () => containers.filter((c) => c.archivedAt).sort((a, b) => b.archivedAt!.localeCompare(a.archivedAt!)),
    [containers],
  );

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-fg/20 transition-opacity duration-150 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="flex max-h-[80vh] w-full max-w-md flex-col rounded-xl border border-line bg-surface shadow-lift transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <header className="px-5 pt-5">
            <DialogTitle className="text-base font-semibold">Archive</DialogTitle>
            <p className="mt-0.5 text-xs text-fg-muted">Restore archived spaces, folders and lists, or delete them for good.</p>
          </header>
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-3">
            {archived.length === 0 ? (
              <p className="px-2 py-8 text-center text-xs text-fg-muted">Nothing is archived.</p>
            ) : (
              archived.map((node) => <ArchivedRow key={node.id} node={node} containers={containers} />)
            )}
          </div>
          <footer className="mt-3 flex justify-end border-t border-line px-5 py-4">
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </footer>
        </DialogPanel>
      </div>
    </Dialog>
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
