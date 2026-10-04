export type ErrorCode = 'FORBIDDEN' | 'NOT_FOUND' | 'INVALID';

export interface AppError {
  code: ErrorCode;
  message: string;
}

export type Result<T = void> = { data: T; error?: undefined } | { error: AppError; data?: undefined };

export const ok = <T>(data: T): Result<T> => ({ data });
export const done = (): Result => ({ data: undefined });
export const fail = (code: ErrorCode, message: string): Result<never> => ({ error: { code, message } });
