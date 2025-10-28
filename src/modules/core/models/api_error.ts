export class ApiError extends Error {
  public readonly originalError?: Error;
  public readonly statusCode?: number;
  public readonly errors?: string[];

  constructor(
    message: string, 
    originalError?: Error | null, 
    statusCode?: number,
    errors?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
    this.originalError = originalError || undefined;
    this.statusCode = statusCode;
    this.errors = errors;
  }

  // Helper to determine if error is retryable
  get isRetryable(): boolean {
    if (this.statusCode) {
      // Don't retry client errors (4xx), but retry server errors (5xx)
      return this.statusCode >= 500;
    }
    return true; // Network errors are typically retryable
  }
}