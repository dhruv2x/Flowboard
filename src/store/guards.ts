import { fail, ok, type Result } from './result';
import { selectCurrentUser } from './selectors';
import type { DataState } from './store';

export const requireAdmin = (s: DataState) =>
  selectCurrentUser(s).role === 'admin' ? null : fail('FORBIDDEN', 'Only admins can change the workspace structure.');

export function validateName(name: string, max: number): Result<string> {
  const trimmed = name.trim();
  if (!trimmed) return fail('INVALID', 'Name is required.');
  if (trimmed.length > max) return fail('INVALID', `Name must be ${max} characters or fewer.`);
  return ok(trimmed);
}
