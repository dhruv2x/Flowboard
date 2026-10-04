import { MenuItem, MenuItems, MenuSeparator } from '@headlessui/react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function MenuPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MenuItems
      anchor={{ to: 'bottom end', gap: 4 }}
      className={clsx('z-50 min-w-44 rounded-lg border border-line bg-surface p-1 shadow-lift focus:outline-none', className)}
    >
      {children}
    </MenuItems>
  );
}

interface ActionProps {
  icon: LucideIcon;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}

export function MenuAction({ icon: Icon, onClick, danger, children }: ActionProps) {
  return (
    <MenuItem>
      <button
        onClick={onClick}
        className={clsx(
          'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm data-[focus]:bg-surface-muted',
          danger ? 'text-danger' : 'text-fg',
        )}
      >
        <Icon className={clsx('size-3.5', danger ? 'text-danger' : 'text-fg-muted')} />
        {children}
      </button>
    </MenuItem>
  );
}

export const MenuDivider = () => <MenuSeparator className="my-1 h-px bg-line" />;
