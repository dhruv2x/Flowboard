import { Menu, MenuButton } from '@headlessui/react';
import { Archive, Globe, Lock, MoreHorizontal, Pencil } from 'lucide-react';
import { useStore } from '../../store/store';
import type { Container } from '../../types';
import { IconButton } from '../../ui/IconButton';
import { MenuAction, MenuDivider, MenuPanel } from '../../ui/Menu';
import { notify, report } from '../../ui/toast';
import { useTreeContext } from './TreeContext';

export function NodeMenu({ node }: { node: Container }) {
  const { setEditing } = useTreeContext();
  const setVisibility = useStore((s) => s.setVisibility);
  const archiveContainer = useStore((s) => s.archiveContainer);
  const isPrivate = node.visibility === 'private';

  return (
    <Menu>
      <MenuButton as={IconButton} label={`Actions for ${node.name}`}>
        <MoreHorizontal className="size-3.5" />
      </MenuButton>
      <MenuPanel>
        <MenuAction icon={Pencil} onClick={() => setEditing({ mode: 'rename', id: node.id })}>
          Rename
        </MenuAction>
        <MenuAction
          icon={isPrivate ? Globe : Lock}
          onClick={() => report(setVisibility(node.id, isPrivate ? 'public' : 'private'))}
        >
          {isPrivate ? 'Make public' : 'Make private'}
        </MenuAction>
        <MenuDivider />
        <MenuAction
          icon={Archive}
          danger
          onClick={() => report(archiveContainer(node.id)) && notify(`Archived "${node.name}"`)}
        >
          Archive
        </MenuAction>
      </MenuPanel>
    </Menu>
  );
}
