export type ApiResponse<T = unknown> = {
  data: T | null;
  error: { message: string; code?: string } | null;
  meta?: Record<string, unknown>;
};

export function successResponse<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return { data, error: null, ...(meta ? { meta } : {}) };
}

export function errorResponse(message: string, code?: string): ApiResponse<never> {
  return { data: null, error: { message, code } };
}
