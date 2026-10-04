import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useTask } from '../../store/hooks';
import { useUI } from '../../store/ui';
import { EmptyState } from '../../ui/EmptyState';
import { IconButton } from '../../ui/IconButton';
import { TaskDetail } from './TaskDetail';

export function TaskDrawer() {
  const openTaskId = useUI((s) => s.openTaskId);
  const closeTask = useUI((s) => s.closeTask);
  // Keep the last task rendered while the panel animates out.
  const [shownId, setShownId] = useState(openTaskId);
  if (openTaskId && openTaskId !== shownId) setShownId(openTaskId);
  const result = useTask(shownId);

  return (
    <Dialog open={!!openTaskId} onClose={closeTask} className="relative z-40">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-fg/20 transition-opacity duration-200 data-[closed]:opacity-0"
      />
      <div className="fixed inset-y-0 right-0 flex w-full max-w-lg">
        <DialogPanel
          transition
          className="flex w-full min-w-0 flex-col border-l border-line bg-surface shadow-drawer transition duration-200 ease-out data-[closed]:translate-x-8 data-[closed]:opacity-0"
        >
          {result?.data && <TaskDetail key={result.data.id} task={result.data} onClose={closeTask} />}
          {result?.error && (
            <>
              <div className="flex h-12 shrink-0 items-center justify-end border-b border-line px-4">
                <IconButton autoFocus label="Close" onClick={closeTask}>
                  <X className="size-4" />
                </IconButton>
              </div>
              <DialogTitle className="sr-only">Task unavailable</DialogTitle>
              <EmptyState title={result.error.code === 'FORBIDDEN' ? 'No access' : 'Task unavailable'}>
                {result.error.message}
              </EmptyState>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
