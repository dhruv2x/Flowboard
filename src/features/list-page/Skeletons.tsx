import type { View } from '../../store/ui';
import { Skeleton } from '../../ui/Skeleton';

export function ListPageSkeleton({ view }: { view: View }) {
  return (
    <div aria-busy="true" aria-label="Loading list" className="flex h-full flex-col">
      <div className="border-b border-line px-4 pb-4 pt-5 md:px-6">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-2.5 h-5 w-48" />
        <Skeleton className="mt-2 h-3 w-24" />
      </div>
      {view === 'board' ? <BoardSkeleton /> : <TableSkeleton />}
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden px-4 py-4 md:px-6">
      {[3, 2, 1].map((cards, column) => (
        <div key={column} className="w-72 shrink-0">
          <Skeleton className="mx-1.5 my-3 h-3 w-24" />
          <div className="space-y-2 rounded-lg bg-surface-muted/70 p-1.5">
            {Array.from({ length: cards }, (_, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-line bg-surface p-3">
                <Skeleton className="h-2.5 w-10" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2.5 w-14" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="px-4 md:px-6">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex h-10 items-center gap-6 border-b border-line">
          <Skeleton className="hidden h-2.5 w-10 md:block" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="hidden h-3 w-16 sm:block" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}
