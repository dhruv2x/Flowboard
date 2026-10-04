import { ChevronRight, Lock } from 'lucide-react';
import { Fragment } from 'react';
import { useVisibleIds } from '../../store/hooks';
import { ancestorsOf } from '../../store/selectors';
import { useStore } from '../../store/store';
import { useUI } from '../../store/ui';
import { EmptyState } from '../../ui/EmptyState';

export function ListPage() {
  const listId = useUI((s) => s.selectedListId);
  const containers = useStore((s) => s.containers);
  const visible = useVisibleIds();
  const list = containers.find((c) => c.id === listId && c.type === 'list');

  if (!listId) {
    return <EmptyState title="No list selected">Choose a list from the sidebar to view its tasks.</EmptyState>;
  }
  if (!list || !visible.has(list.id)) {
    return <EmptyState title="List unavailable">It was archived, or you no longer have access to it.</EmptyState>;
  }

  const path = ancestorsOf(containers, list.id);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-line px-4 pb-4 pt-5 md:px-6">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-fg-muted">
          {path.map((node, i) => (
            <Fragment key={node.id}>
              {i > 0 && <ChevronRight className="size-3 text-fg-faint" />}
              <span className="truncate">{node.name}</span>
            </Fragment>
          ))}
        </nav>
        <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight">
          {list.name}
          {list.visibility === 'private' && <Lock aria-label="Private list" className="size-3.5 text-fg-faint" />}
        </h1>
      </header>
    </div>
  );
}
