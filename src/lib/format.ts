export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const taskKey = (n: number) => `FB-${n}`;

// Due dates are stored as UTC midnight, so they are formatted and compared in UTC.
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const fullFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export const formatDay = (iso: string) => dayFormat.format(new Date(iso));
export const formatDate = (iso: string) => fullFormat.format(new Date(iso));

const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const isOverdue = (iso: string) => iso.slice(0, 10) < localToday();
export const toDateInput = (iso: string | null) => iso?.slice(0, 10) ?? '';
export const fromDateInput = (value: string) => (value ? `${value}T00:00:00.000Z` : null);

export function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  if (minutes === 0) return 'just now';
  if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, 'hour');
  return relative.format(Math.round(hours / 24), 'day');
}
