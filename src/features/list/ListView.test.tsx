import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { selectListData } from '../../store/selectors';
import { useStore } from '../../store/store';
import { useUI } from '../../store/ui';
import { ListView } from './ListView';

afterEach(cleanup);

function renderBacklog() {
  const result = selectListData(useStore.getState(), 'ls_backlog');
  if (result.error) throw new Error(result.error.message);
  render(<ListView data={result.data} composeIn={null} onComposeIn={() => {}} />);
}

const rowLabels = () => screen.getAllByRole('row').slice(1).map((row) => row.getAttribute('aria-label'));

it('sorts by due date with undated tasks last', () => {
  renderBacklog();
  fireEvent.click(screen.getByRole('button', { name: 'Due' }));

  const labels = rowLabels();
  expect(labels[0]).toBe('FB-6 Migrate icons to a single sprite');
  expect(labels.slice(-2)).toEqual(['FB-4 Spike: offline mode for task edits', 'FB-7 Document permission model']);
});

it('opens the task when a row is clicked', () => {
  renderBacklog();
  fireEvent.click(screen.getByRole('row', { name: 'FB-2 Rate-limit public webhooks' }));
  expect(useUI.getState().openTaskId).toBe('t_2');
});
