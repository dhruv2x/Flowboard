import { ChevronRight, Lock, Plus } from 'lucide-react';
import { Fragment, useState } from 'react';
import { useCurrentUser, useListData, useVisibleLists } from '../../store/hooks';
import { canManageContainers } from '../../store/permissions';
import { ancestorsOf, type ListData } from '../../store/selectors';
import { useStore } from '../../store/store';
import { useUI } from '../../store/ui';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { Board } from '../board/Board';
import { ListView } from '../list/ListView';
import { ShareButton } from '../sharing/ShareDialog';
import { StatusManager } from '../statuses/StatusManager';
import { ViewToggle } from './ViewToggle';

export function ListPage() {
  const listId = useUI((s) => s.selectedListId);
  const selectList = useUI((s) => s.selectList);
  const result = useListData(listId);
  const fallback = useVisibleLists()[0]?.list;

  if (!result) {
    return <EmptyState title="No list selected">Choose a list from the sidebar to view its tasks.</EmptyState>;
  }
  if (result.error) {
    return (
      <EmptyState
        title={result.error.code === 'FORBIDDEN' ? 'No access' : 'List unavailable'}
        action={fallback && <Button onClick={() => selectList(fallback.id)}>Open {fallback.name}</Button>}
      >
        {result.error.message}
      </EmptyState>
    );
  }
  // Keyed so per-list UI state (like an open composer) resets on list switch.
  return <ListContent key={result.data.list.id} data={result.data} />;
}

function ListContent({ data }: { data: ListData }) {
  const containers = useStore((s) => s.containers);
  const canManage = canManageContainers(useCurrentUser());
  const view = useUI((s) => s.view);
  const [composeIn, setComposeIn] = useState<string | null>(null);
  const { list, statuses, tasks } = data;
  const path = ancestorsOf(containers, list.id);
  const doneIds = new Set(statuses.filter((st) => st.category === 'done').map((st) => st.id));
  const doneCount = tasks.filter((t) => doneIds.has(t.statusId)).length;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-line px-4 pb-4 pt-5 md:px-6">
        <div className="min-w-0 flex-1 basis-56">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-fg-muted">
            {path.map((node, i) => (
              <Fragment key={node.id}>
                {i > 0 && <ChevronRight className="size-3 text-fg-faint" />}
                <span className="truncate">{node.name}</span>
              </Fragment>
            ))}
          </nav>
          <h1 className="mt-1 flex items-center gap-2 text-xl font-semibold tracking-tight">
            <span className="truncate">{list.name}</span>
            {list.visibility === 'private' && <Lock aria-label="Private list" className="size-3.5 shrink-0 text-fg-faint" />}
          </h1>
          <p className="mt-0.5 text-xs tabular-nums text-fg-muted">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} · {doneCount} done
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ViewToggle />
          {canManage && (
            <>
              <ShareButton node={list} />
              <StatusManager listId={list.id} statuses={statuses} />
            </>
          )}
          <Button variant="primary" onClick={() => setComposeIn(statuses[0]?.id ?? null)}>
            <Plus className="size-3.5" />
            New task
          </Button>
        </div>
      </header>
      <div className="relative min-h-0 flex-1">
        {view === 'list' ? (
          <ListView data={data} composeIn={composeIn} onComposeIn={setComposeIn} />
        ) : (
          <Board data={data} composeIn={composeIn} onComposeIn={setComposeIn} />
        )}
      </div>
    </div>
  );
}
