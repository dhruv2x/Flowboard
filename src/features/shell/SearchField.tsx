import { Search } from 'lucide-react';
import { useRef } from 'react';
import { useHotkeys } from '../../hooks/useHotkeys';
import { useUI } from '../../store/ui';
import { Kbd } from '../../ui/Kbd';

/** Filters the open list's tasks by title and description. `/` focuses, Escape clears. */
export function SearchField() {
  const query = useUI((s) => s.query);
  const setQuery = useUI((s) => s.setQuery);
  const listId = useUI((s) => s.selectedListId);
  const input = useRef<HTMLInputElement>(null);
  useHotkeys({ '/': () => input.current?.focus() });

  return (
    <div role="search" className="relative flex min-w-0 max-w-xs flex-1 items-center">
      <Search className="pointer-events-none absolute left-2.5 size-3.5 text-fg-faint" />
      <input
        ref={input}
        type="search"
        aria-label="Search tasks"
        placeholder="Search tasks"
        value={query}
        disabled={!listId}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          setQuery('');
          e.currentTarget.blur();
        }}
        className="peer h-8 w-full min-w-0 rounded-md border border-line bg-surface-subtle pl-8 pr-8 placeholder:text-fg-faint focus:border-accent focus:bg-surface focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-search-cancel-button]:hidden"
      />
      {!query && <Kbd className="pointer-events-none absolute right-2 peer-focus:hidden max-sm:hidden">/</Kbd>}
    </div>
  );
}
