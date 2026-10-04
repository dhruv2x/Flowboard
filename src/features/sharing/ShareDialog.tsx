import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import clsx from 'clsx';
import { Globe, Lock, Share2, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { visibleContainerIds } from '../../store/permissions';
import { ancestorsOf } from '../../store/selectors';
import { useStore } from '../../store/store';
import type { Container, Grant, Visibility } from '../../types';
import { Avatar } from '../../ui/Avatar';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { report } from '../../ui/toast';

const VISIBILITY: { value: Visibility; label: string; hint: string; icon: LucideIcon }[] = [
  { value: 'public', label: 'Public', hint: 'All members, unless denied', icon: Globe },
  { value: 'private', label: 'Private', hint: 'Only members you allow', icon: Lock },
];

/** Admin dialog for a container's visibility and per-member grants. Changes apply immediately. */
export function ShareDialog({ nodeId, onClose }: { nodeId: string | null; onClose: () => void }) {
  const containers = useStore((s) => s.containers);
  const grants = useStore((s) => s.grants);
  const users = useStore((s) => s.users);
  const setGrant = useStore((s) => s.setGrant);
  const setVisibility = useStore((s) => s.setVisibility);
  // Keep the last node rendered while the dialog animates out.
  const [shownId, setShownId] = useState(nodeId);
  if (nodeId && nodeId !== shownId) setShownId(nodeId);
  const node = containers.find((c) => c.id === shownId);

  return (
    <Dialog open={!!nodeId && !!node} onClose={onClose} className="relative z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-fg/20 transition-opacity duration-150 data-[closed]:opacity-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-md rounded-xl border border-line bg-surface shadow-lift transition duration-150 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {node && (
            <>
              <header className="px-5 pt-5">
                <DialogTitle className="text-base font-semibold">Share “{node.name}”</DialogTitle>
                <p className="mt-0.5 truncate text-xs capitalize text-fg-muted">
                  {[node.type, ancestorsOf(containers, node.id).map((c) => c.name).join(' / ')].filter(Boolean).join(' · ')}
                </p>
              </header>

              <section className="px-5 pt-5">
                <h3 className="text-xs font-medium text-fg-muted">General access</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {VISIBILITY.map(({ value, label, hint, icon: Icon }) => (
                    <button
                      key={value}
                      aria-pressed={node.visibility === value}
                      onClick={() => report(setVisibility(node.id, value))}
                      className={clsx(
                        'rounded-lg border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                        node.visibility === value ? 'border-accent/40 bg-accent-subtle' : 'border-line hover:bg-surface-subtle',
                      )}
                    >
                      <span className="flex items-center gap-1.5 font-medium">
                        <Icon className="size-3.5 text-fg-muted" />
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs text-fg-muted">{hint}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="px-5 pt-5">
                <h3 className="text-xs font-medium text-fg-muted">Members</h3>
                <ul className="mt-1 divide-y divide-line">
                  {users.map((user) => {
                    const visible = visibleContainerIds(containers, grants, user);
                    const blockedBy = ancestorsOf(containers, node.id).find((a) => !visible.has(a.id));
                    const mode = grants.find((g) => g.resourceId === node.id && g.userId === user.id)?.mode ?? '';
                    return (
                      <li key={user.id} className="flex items-center gap-3 py-2.5">
                        <Avatar user={user} size="md" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{user.name}</p>
                          <p className={clsx('truncate text-xs', visible.has(node.id) ? 'text-status-green' : 'text-fg-muted')}>
                            {visible.has(node.id) ? 'Can see' : blockedBy ? `Hidden by “${blockedBy.name}”` : 'Hidden'}
                          </p>
                        </div>
                        {user.role === 'admin' ? (
                          <span className="text-xs text-fg-muted">Admin · full access</span>
                        ) : (
                          <Select
                            aria-label={`Access for ${user.name}`}
                            value={mode}
                            onChange={(e) => report(setGrant(node.id, user.id, (e.target.value || null) as Grant['mode'] | null))}
                            className="w-40 shrink-0"
                          >
                            <option value="">Default · {node.visibility === 'public' ? 'visible' : 'hidden'}</option>
                            <option value="allow">Allow</option>
                            <option value="deny">Deny</option>
                          </Select>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <footer className="mt-3 flex items-center justify-between gap-4 border-t border-line px-5 py-4">
                <p className="text-xs text-fg-muted">Access flows down: hiding a space or folder hides everything inside it.</p>
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              </footer>
            </>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

/** Header button that opens the share dialog for `node`. */
export function ShareButton({ node }: { node: Container }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Share2 className="size-3.5" />
        Share
      </Button>
      <ShareDialog nodeId={open ? node.id : null} onClose={() => setOpen(false)} />
    </>
  );
}
