import { Menu, MenuButton } from '@headlessui/react';
import { Archive, MoreHorizontal, Pencil, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store/store';
import type { Container } from '../../types';
import { IconButton } from '../../ui/IconButton';
import { MenuAction, MenuDivider, MenuPanel } from '../../ui/Menu';
import { notify, report } from '../../ui/toast';
import { ShareDialog } from '../sharing/ShareDialog';
import { useTreeContext } from './TreeContext';

export function NodeMenu({ node }: { node: Container }) {
  const { setEditing } = useTreeContext();
  const archiveContainer = useStore((s) => s.archiveContainer);
  const [sharing, setSharing] = useState(false);

  return (
    <>
      <Menu>
        <MenuButton as={IconButton} label={`Actions for ${node.name}`}>
          <MoreHorizontal className="size-3.5" />
        </MenuButton>
        <MenuPanel>
          <MenuAction icon={Pencil} onClick={() => setEditing({ mode: 'rename', id: node.id })}>
            Rename
          </MenuAction>
          <MenuAction icon={Share2} onClick={() => setSharing(true)}>
            Share…
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
      <ShareDialog nodeId={sharing ? node.id : null} onClose={() => setSharing(false)} />
    </>
  );
}
