import { useRef, useState } from 'react';

interface Props {
  initial?: string;
  placeholder: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

/** Inline text field: Enter or blur submits, Escape or an empty value cancels. */
export function NameInput({ initial = '', placeholder, onSubmit, onCancel }: Props) {
  const [value, setValue] = useState(initial);
  // Unmounting after Enter/Escape can fire a trailing blur; settle only once.
  const settled = useRef(false);

  const cancel = () => {
    if (settled.current) return;
    settled.current = true;
    onCancel();
  };

  const commit = () => {
    if (settled.current) return;
    const name = value.trim();
    if (!name || name === initial) return cancel();
    settled.current = true;
    onSubmit(name);
  };

  return (
    <input
      autoFocus
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onFocus={(e) => e.target.select()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') cancel();
      }}
      className="h-6 min-w-0 flex-1 rounded border border-accent bg-surface px-1.5 text-sm text-fg outline-none ring-2 ring-accent/15 placeholder:text-fg-faint"
    />
  );
}
