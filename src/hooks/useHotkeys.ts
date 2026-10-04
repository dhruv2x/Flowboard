import { useEffect, useRef } from 'react';

const TYPING_OR_MODAL = 'input, textarea, select, [contenteditable="true"], [role="dialog"], [role="menu"]';

/** Single-key shortcuts. Ignored with modifiers, while typing, or while a dialog or menu has focus. */
export function useHotkeys(bindings: Record<string, () => void>) {
  const latest = useRef(bindings);
  useEffect(() => {
    latest.current = bindings;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if (e.target instanceof Element && e.target.closest(TYPING_OR_MODAL)) return;
      const action = latest.current[e.key];
      if (!action) return;
      e.preventDefault();
      action();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
