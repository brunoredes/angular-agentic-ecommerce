import { HttpErrorResponse } from '@angular/common/http';

/** The API answers errors as { error: string }; anything else (network down, 5xx HTML) gets a generic message. */
export function apiErrorMessage(e: unknown): string {
  const body = e instanceof HttpErrorResponse ? (e.error as { error?: unknown } | null) : null;
  return typeof body?.error === 'string' ? body.error : 'Could not reach the store. Please try again.';
}
