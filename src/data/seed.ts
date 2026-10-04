import type { Container, Grant, Priority, Status, StatusCategory, StatusColor, Task, User } from '../types';

const DAY = 86_400_000;

/** UTC midnight `offset` days from today, so due dates stay relative to the demo date. */
function daysFromNow(offset: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) + offset * DAY).toISOString();
}

export const users: User[] = [
  { id: 'u_alice', name: 'Alice Moreau', role: 'admin', tone: 'clay' },
  { id: 'u_bob', name: 'Bob Tanaka', role: 'member', tone: 'moss' },
  { id: 'u_carol', name: 'Carol Okafor', role: 'member', tone: 'slate' },
];

const container = (
  id: string,
  type: Container['type'],
  name: string,
  parentId: string | null,
  position: number,
  visibility: Container['visibility'] = 'public',
): Container => ({ id, type, name, parentId, position, visibility, archivedAt: null });

export const containers: Container[] = [
  container('ws_north', 'workspace', 'Northwind Studio', null, 0),
  container('sp_eng', 'space', 'Engineering', 'ws_north', 0),
  container('sp_mkt', 'space', 'Marketing', 'ws_north', 1, 'private'),
  container('fd_q2', 'folder', 'Q2 Launch', 'sp_eng', 0),
  container('fd_brand', 'folder', 'Brand Refresh', 'sp_mkt', 0),
  container('ls_backlog', 'list', 'Backlog', 'fd_q2', 0),
  container('ls_sprint', 'list', 'Sprint 14', 'fd_q2', 1, 'private'),
  container('ls_campaign', 'list', 'Launch Campaign', 'fd_brand', 0),
];

// Bob only sees public Engineering → Backlog. Carol is denied Backlog but allowed into private lists.
export const grants: Grant[] = [
  { id: 'g_1', resourceId: 'sp_mkt', userId: 'u_carol', mode: 'allow' },
  { id: 'g_2', resourceId: 'ls_sprint', userId: 'u_carol', mode: 'allow' },
  { id: 'g_3', resourceId: 'ls_backlog', userId: 'u_carol', mode: 'deny' },
];

type StatusSpec = [key: string, name: string, category: StatusCategory, color: StatusColor];

export const DEFAULT_STATUSES: StatusSpec[] = [
  ['todo', 'To do', 'todo', 'stone'],
  ['progress', 'In progress', 'in_progress', 'amber'],
  ['done', 'Done', 'done', 'green'],
];

export function buildStatuses(listId: string, specs: StatusSpec[] = DEFAULT_STATUSES): Status[] {
  return specs.map(([key, name, category, color], position) => ({
    id: `${listId}:${key}`,
    listId,
    name,
    category,
    color,
    position,
  }));
}

export const statuses: Status[] = [
  ...buildStatuses('ls_backlog'),
  ...buildStatuses('ls_sprint', [
    ['todo', 'To do', 'todo', 'stone'],
    ['progress', 'In progress', 'in_progress', 'amber'],
    ['review', 'In review', 'in_progress', 'sky'],
    ['done', 'Done', 'done', 'green'],
  ]),
  ...buildStatuses('ls_campaign', [
    ['todo', 'Ideas', 'todo', 'stone'],
    ['progress', 'Drafting', 'in_progress', 'amber'],
    ['done', 'Published', 'done', 'green'],
  ]),
];

type TaskSpec = [
  listId: string,
  status: string,
  title: string,
  priority: Priority,
  assigneeIds: string[],
  due: number | null,
  description?: string,
];

const taskSpecs: TaskSpec[] = [
  ['ls_backlog', 'todo', 'Audit onboarding funnel drop-off', 'high', ['u_alice', 'u_bob'], 6,
    'Step 3 (workspace invite) loses ~40% of new signups. Pull the last 30 days of events and propose two experiments.'],
  ['ls_backlog', 'todo', 'Rate-limit public webhooks', 'urgent', ['u_bob'], 2,
    'A single integration burst 12k requests/min last Tuesday. Token bucket per workspace, 429 with Retry-After.'],
  ['ls_backlog', 'todo', 'Replace legacy date picker', 'normal', ['u_bob'], 12],
  ['ls_backlog', 'todo', 'Spike: offline mode for task edits', 'low', [], null],
  ['ls_backlog', 'progress', 'Define SLOs for the sync service', 'high', ['u_alice'], 3,
    'Draft p95 latency and error budget targets. Review with infra on Thursday.'],
  ['ls_backlog', 'progress', 'Migrate icons to a single sprite', 'normal', ['u_bob'], -1],
  ['ls_backlog', 'done', 'Document permission model', 'normal', ['u_alice'], null],
  ['ls_sprint', 'todo', 'Keyboard navigation for the board', 'high', ['u_carol', 'u_alice'], 4],
  ['ls_sprint', 'todo', 'Fix flaky sort on due date', 'normal', ['u_alice'], -2,
    'Tasks without a due date jump between the top and bottom of the list on re-render.'],
  ['ls_sprint', 'progress', 'Kanban drag performance pass', 'urgent', ['u_carol'], 1,
    'Columns with 200+ cards drop frames while dragging. Profile and memoise card rendering.'],
  ['ls_sprint', 'review', 'Task drawer focus management', 'normal', ['u_carol'], 2],
  ['ls_sprint', 'review', 'Ship status color tokens', 'high', ['u_carol'], 0],
  ['ls_sprint', 'done', 'Empty states for lists and columns', 'low', ['u_carol'], null],
  ['ls_campaign', 'todo', 'Shortlist launch-week partners', 'normal', ['u_alice'], 9],
  ['ls_campaign', 'todo', 'Refresh pricing page copy', 'low', [], null],
  ['ls_campaign', 'progress', 'Draft launch announcement', 'high', ['u_carol'], 5,
    'Lead with the new board. Keep it under 300 words; legal needs a pass before Friday.'],
  ['ls_campaign', 'progress', 'Record product walkthrough', 'normal', ['u_carol'], 7],
  ['ls_campaign', 'done', 'Publish changelog for v2.0', 'normal', ['u_alice'], null],
];

export const tasks: Task[] = taskSpecs.map(([listId, status, title, priority, assigneeIds, due, description = ''], i) => {
  const createdAt = daysFromNow(-14 + i % 7);
  return {
    id: `t_${i + 1}`,
    number: i + 1,
    title,
    description,
    statusId: `${listId}:${status}`,
    priority,
    assigneeIds,
    dueDate: due === null ? null : daysFromNow(due),
    position: i,
    primaryListId: listId,
    createdAt,
    updatedAt: createdAt,
  };
});
