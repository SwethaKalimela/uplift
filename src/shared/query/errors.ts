export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isNotFound() {
    return this.status === 404;
  }

  get isRateLimited() {
    return this.status === 429;
  }
}

const NETWORK = 0;
const MAX_RETRIES = 3;

export function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= MAX_RETRIES) return false;
  if (!(error instanceof ApiError)) return !isAbort(error);
  if (error.status === NETWORK || error.status === 429) return true;
  return error.status >= 500;
}

export function retryDelay(attempt: number, error: unknown) {
  const base = error instanceof ApiError && error.isRateLimited ? 4000 : 500;
  const exponential = base * 2 ** attempt;
  return Math.min(exponential + Math.random() * 250, 30_000);
}
