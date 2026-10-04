import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from './store';

const store = () => useStore.getState();

beforeEach(() => store().resetDemo());

describe('store access checks', () => {
  it('lets members change tasks only in lists they can see', () => {
    store().switchUser('u_bob');
    expect(store().updateTask('t_1', { title: 'Renamed' }).error).toBeUndefined(); // Backlog
    expect(store().updateTask('t_10', { title: 'Renamed' }).error?.code).toBe('FORBIDDEN'); // Sprint 14
    expect(store().moveTask('t_1', { listId: 'ls_sprint' }).error?.code).toBe('FORBIDDEN');
  });

  it('reserves structural changes for admins', () => {
    store().switchUser('u_bob');
    expect(store().createContainer('ws_north', 'Design').error?.code).toBe('FORBIDDEN');
    store().switchUser('u_alice');
    expect(store().createContainer('ws_north', 'Design').data?.type).toBe('space');
  });

  it('treats archived lists as not found', () => {
    store().archiveContainer('ls_sprint');
    expect(store().createTask('ls_sprint', 'ls_sprint:todo', 'New').error?.code).toBe('NOT_FOUND');
  });
});
