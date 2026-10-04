import { Menu, MenuButton, MenuItem } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { useCurrentUser } from '../../store/hooks';
import { useStore } from '../../store/store';
import { Avatar } from '../../ui/Avatar';
import { MenuPanel } from '../../ui/Menu';
import { notify } from '../../ui/toast';

const RolePill = ({ role }: { role: string }) => (
  <span className="rounded-full bg-surface-muted px-2 text-2xs font-medium capitalize leading-5 text-fg-secondary">{role}</span>
);

/** Mock sign-in: switching user re-runs every permission-aware selector immediately. */
export function UserSwitcher() {
  const current = useCurrentUser();
  const users = useStore((s) => s.users);
  const switchUser = useStore((s) => s.switchUser);

  return (
    <Menu>
      <MenuButton
        aria-label={`Signed in as ${current.name}. Switch user`}
        className="flex h-8 items-center gap-2 rounded-md pl-1 pr-1.5 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[open]:bg-surface-muted"
      >
        <Avatar user={current} size="md" />
        <span className="hidden font-medium sm:inline">{current.name}</span>
        <RolePill role={current.role} />
        <ChevronDown className="size-3.5 text-fg-faint" />
      </MenuButton>
      <MenuPanel className="w-64">
        <p className="px-2 pb-1 pt-1.5 text-xs text-fg-muted">View the workspace as</p>
        {users.map((user) => (
          <MenuItem key={user.id}>
            <button
              onClick={() => {
                if (user.id === current.id) return;
                switchUser(user.id);
                notify(`Viewing as ${user.name}`);
              }}
              className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left data-[focus]:bg-surface-muted"
            >
              <Avatar user={user} size="md" />
              <span className="flex-1 text-fg">{user.name}</span>
              <RolePill role={user.role} />
              <Check className={user.id === current.id ? 'size-3.5 text-fg-muted' : 'invisible size-3.5'} />
            </button>
          </MenuItem>
        ))}
      </MenuPanel>
    </Menu>
  );
}
