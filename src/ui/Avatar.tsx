import clsx from 'clsx';
import { initials } from '../lib/format';
import type { User } from '../types';
import { toneBg } from './tokens';

export function Avatar({ user, size = 'sm' }: { user: User; size?: 'sm' | 'md' }) {
  return (
    <span
      title={user.name}
      className={clsx(
        'inline-grid shrink-0 place-items-center rounded-full font-semibold text-fg-secondary',
        toneBg[user.tone],
        size === 'sm' ? 'size-5 text-[9px]' : 'size-6 text-2xs',
      )}
    >
      {initials(user.name)}
    </span>
  );
}

export function AvatarStack({ users }: { users: User[] }) {
  return (
    <span className="flex -space-x-1.5">
      {users.map((user) => (
        <span key={user.id} className="rounded-full ring-2 ring-surface">
          <Avatar user={user} />
        </span>
      ))}
    </span>
  );
}
