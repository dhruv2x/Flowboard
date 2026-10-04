import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Keyboard } from 'lucide-react';
import { useState } from 'react';
import { useHotkeys } from '../../hooks/useHotkeys';
import { IconButton } from '../../ui/IconButton';
import { Kbd } from '../../ui/Kbd';

const SHORTCUTS = [
  ['/', 'Search tasks'],
  ['N', 'New task'],
  ['B', 'Board view'],
  ['L', 'List view'],
  ['Esc', 'Close panel or dialog'],
  ['?', 'Show shortcuts'],
];

export function ShortcutsButton() {
  const [open, setOpen] = useState(false);
  useHotkeys({ '?': () => setOpen(true) });

  return (
    <>
      <span className="hidden sm:block">
        <IconButton label="Keyboard shortcuts" onClick={() => setOpen(true)}>
          <Keyboard className="size-4" />
        </IconButton>
      </span>
      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <DialogBackdrop transition className="fixed inset-0 bg-fg/20 transition-opacity duration-150 data-[closed]:opacity-0" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-xs rounded-xl border border-line bg-surface p-5 shadow-lift transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <DialogTitle className="text-base font-semibold">Keyboard shortcuts</DialogTitle>
            <dl className="mt-3 divide-y divide-line">
              {SHORTCUTS.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <dt className="text-fg-secondary">{label}</dt>
                  <dd>
                    <Kbd>{key}</Kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
