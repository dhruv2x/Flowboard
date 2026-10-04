import { ListPage } from './features/list-page/ListPage';
import { Sidebar } from './features/shell/Sidebar';
import { TopBar } from './features/shell/TopBar';
import { TaskDrawer } from './features/task/TaskDrawer';
import { Toaster } from './ui/Toaster';

export default function App() {
  return (
    <div className="grid h-dvh grid-cols-[minmax(0,1fr)] md:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar />
      <div className="flex min-h-0 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1">
          <ListPage />
        </main>
      </div>
      <TaskDrawer />
      <Toaster />
    </div>
  );
}
