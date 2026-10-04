import { Sidebar } from './features/shell/Sidebar';
import { TopBar } from './features/shell/TopBar';
import { EmptyState } from './ui/EmptyState';
import { Toaster } from './ui/Toaster';

export default function App() {
  return (
    <div className="grid h-dvh md:grid-cols-[248px_minmax(0,1fr)] bg-surface font-sans text-sm text-fg antialiased">
      <Sidebar />
      <div className="flex min-h-0 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1">
          <EmptyState title="No list selected">Choose a list from the sidebar to view its tasks.</EmptyState>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
