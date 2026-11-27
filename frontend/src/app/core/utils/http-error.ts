import { HttpErrorResponse } from '@angular/common/http';

/** Readable message for any error coming from the API. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong, please try again.'
): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Cannot reach the server. Please check your connection.';
    }
    return error.error?.message ?? fallback;
  }
  return fallback;
}

/** Field-by-field errors returned by the validators, e.g. { email: 'Email is not valid' }. */
export function getFieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};

  if (error instanceof HttpErrorResponse && Array.isArray(error.error?.errors)) {
    for (const item of error.error.errors as { field: string; message: string }[]) {
      // Keep the first message of each field
      if (!(item.field in result)) {
        result[item.field] = item.message;
      }
    }
  }

  return result;
}