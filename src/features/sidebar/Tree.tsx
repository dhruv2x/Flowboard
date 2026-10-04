import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { ChevronRight, Folder, GripVertical, List, Lock, Plus, type LucideIcon } from 'lucide-react';
import { useStore } from '../../store/store';
import { useUI } from '../../store/ui';
import { CHILD_TYPE, type Container, type ContainerType } from '../../types';
import { IconButton } from '../../ui/IconButton';
import { report } from '../../ui/toast';
import { NameInput } from './NameInput';
import { NodeMenu } from './NodeMenu';
import { useTreeContext } from './TreeContext';

// Each depth shifts by the 16px chevron slot.
const INDENT = ['pl-1', 'pl-5', 'pl-9'];

const ICON: Partial<Record<ContainerType, LucideIcon>> = { folder: Folder, list: List };

const SLOT = <span className="size-4 shrink-0" />;

/** Sortable sibling group under `parentId`, with the inline "create" row when active. */
export function TreeGroup({ parentId, depth }: { parentId: string; depth: number }) {
  const { children, editing } = useTreeContext();
  const nodes = children.get(parentId) ?? [];
  const creating = editing?.mode === 'create' && editing.id === parentId;

  return (
    <>
      {creating && <CreateRow parentId={parentId} depth={depth} />}
      <SortableContext items={nodes.map((n) => n.id)} strategy={verticalListSortingStrategy}>
        {nodes.map((node) => (
          <TreeNode key={node.id} node={node} depth={depth} />
        ))}
      </SortableContext>
      {!nodes.length && !creating && (
        <p className={clsx('flex h-7 items-center gap-1.5 text-xs text-fg-faint', INDENT[depth])}>
          {SLOT}
          {depth === 0 ? 'Nothing shared with you yet' : 'Empty'}
        </p>
      )}
    </>
  );
}

function TreeNode({ node, depth }: { node: Container; depth: number }) {
  const { taskCounts, canManage, collapsed, toggle, editing, setEditing } = useTreeContext();
  const selectedListId = useUI((s) => s.selectedListId);
  const selectList = useUI((s) => s.selectList);
  const renameContainer = useStore((s) => s.renameContainer);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: !canManage,
  });

  const childType = CHILD_TYPE[node.type];
  const expanded = !collapsed.has(node.id);
  const selected = node.type === 'list' && selectedListId === node.id;
  const renaming = editing?.mode === 'rename' && editing.id === node.id;
  const Icon = ICON[node.type];

  const startCreate = () => {
    setEditing({ mode: 'create', id: node.id });
    if (!expanded) toggle(node.id);
  };

  return (
    <div
      ref={setNodeRef}
      // dnd-kit drives the drag transform; vertical only.
      style={{ transform: CSS.Translate.toString(transform && { ...transform, x: 0 }), transition }}
      className={clsx(isDragging && 'relative z-10 opacity-60')}
    >
      <div
        className={clsx(
          'group relative flex h-7 items-center gap-1.5 rounded-md pr-1',
          INDENT[depth],
          selected ? 'bg-surface text-fg shadow-card ring-1 ring-line' : 'text-fg-secondary hover:bg-surface-muted hover:text-fg',
        )}
      >
        <span className="grid size-4 shrink-0 place-items-center">
          {childType && (
            <ChevronRight className={clsx('size-3.5 text-fg-faint transition-transform', expanded && 'rotate-90')} />
          )}
        </span>
        {Icon && <Icon className="size-3.5 shrink-0 text-fg-faint" />}

        {renaming ? (
          <NameInput
            initial={node.name}
            placeholder="Name"
            onSubmit={(name) => {
              report(renameContainer(node.id, name));
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <button
            onClick={() => (node.type === 'list' ? selectList(node.id) : toggle(node.id))}
            aria-expanded={childType ? expanded : undefined}
            aria-current={selected ? 'page' : undefined}
            className={clsx(
              'flex min-w-0 flex-1 items-center gap-1.5 text-left after:absolute after:inset-0 after:rounded-md',
              'focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-accent',
              (selected || node.type === 'space') && 'font-medium',
            )}
          >
            <span className="truncate">{node.name}</span>
            {node.visibility === 'private' && <Lock aria-label="Private" className="size-3 shrink-0 text-fg-faint" />}
          </button>
        )}

        {node.type === 'list' && !renaming && (
          <span
            className={clsx(
              'px-1 text-xs tabular-nums text-fg-faint',
              canManage && 'group-focus-within:hidden group-hover:hidden [@media(hover:none)]:hidden',
            )}
          >
            {taskCounts.get(node.id) ?? 0}
          </span>
        )}

        {canManage && !renaming && (
          <div className="relative z-10 hidden items-center group-focus-within:flex group-hover:flex has-[[data-open]]:flex [@media(hover:none)]:flex">
            {childType && (
              <IconButton label={`New ${childType}`} onClick={startCreate}>
                <Plus className="size-3.5" />
              </IconButton>
            )}
            <NodeMenu node={node} />
            <IconButton
              ref={setActivatorNodeRef}
              label={`Reorder ${node.name}`}
              className="cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" />
            </IconButton>
          </div>
        )}
      </div>

      {childType && expanded && <TreeGroup parentId={node.id} depth={depth + 1} />}
    </div>
  );
}

function CreateRow({ parentId, depth }: { parentId: string; depth: number }) {
  const { setEditing } = useTreeContext();
  const parentType = useStore((s) => s.containers.find((c) => c.id === parentId)?.type);
  const createContainer = useStore((s) => s.createContainer);
  const selectList = useUI((s) => s.selectList);
  const type = parentType && CHILD_TYPE[parentType];
  if (!type) return null;
  const Icon = ICON[type];

  return (
    <div className={clsx('flex h-7 items-center gap-1.5 pr-1', INDENT[depth])}>
      {SLOT}
      {Icon && <Icon className="size-3.5 shrink-0 text-fg-faint" />}
      <NameInput
        placeholder={`New ${type}`}
        onSubmit={(name) => {
          const result = createContainer(parentId, name);
          setEditing(null);
          if (report(result) && result.data.type === 'list') selectList(result.data.id);
        }}
        onCancel={() => setEditing(null)}
      />
    </div>
  );
}
