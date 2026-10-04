import { useState } from 'react';
import { useStore } from '../../store/store';
import { report } from '../../ui/toast';

interface Props {
  listId: string;
  statusId: string;
  onClose: () => void;
}

/** Inline quick-add: Enter creates and stays open for the next task, Escape or blurring empty closes. */
export function TaskComposer({ listId, statusId, onClose }: Props) {
  const createTask = useStore((s) => s.createTask);
  const [title, setTitle] = useState('');

  const submit = () => {
    if (!title.trim()) return onClose();
    if (report(createTask(listId, statusId, title))) setTitle('');
  };

  return (
    <div className="rounded-lg border border-accent bg-surface p-2.5 shadow-card ring-2 ring-accent/15">
      <textarea
        autoFocus
        rows={2}
        value={title}
        maxLength={500}
        aria-label="New task title"
        placeholder="Task title"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => !title.trim() && onClose()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === 'Escape') onClose();
        }}
        className="w-full resize-none bg-transparent outline-none placeholder:text-fg-faint"
      />
      <p className="text-2xs text-fg-faint">Enter to add · Esc to close</p>
    </div>
  );
}
