export interface RequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}