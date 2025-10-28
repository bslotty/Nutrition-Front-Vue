import type { RequestConfig } from "../interfaces/request_config";
import { ApiError } from "./api_error";

export class ServerRequest {
  // Default configuration
  private static readonly DEFAULT_CONFIG: RequestConfig = {
    timeout: 30000, // 30 seconds
    retries: 3,
    headers: {
      "Content-Type": "application/json"
    }
  };

  // Base URL - could be configurable via environment
  private static readonly BASE_URL = "http://brandonslotty.com/sites/nutrition/api/controller.php";

  // Request configuration
  protected requestOptions: RequestInit = {
    method: "POST",
    headers: ServerRequest.DEFAULT_CONFIG.headers,
    body: ""
  };

  protected config: RequestConfig = { ...ServerRequest.DEFAULT_CONFIG };

  constructor(config?: Partial<RequestConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
      if (config.headers) {
        this.requestOptions.headers = { ...this.requestOptions.headers, ...config.headers };
      }
    }
  }

  // Main request method with improved error handling
  async sendRequest<T = any>(): Promise<T> {
    let lastError: Error;
    
    // Validate request body
    if (!this.requestOptions.body || this.requestOptions.body === "NOT SET") {
      throw new Error("Request body not set. Call a specific method first.");
    }

    // Retry logic
    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        const response = await this.executeRequest();
        return this.handleResponse<T>(response);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.config.retries) {
          throw new ApiError(`Request failed after ${this.config.retries} attempts: ${lastError.message}`, lastError);
        }
        
        // Wait before retry (exponential backoff)
        await this.delay(Math.pow(2, attempt - 1) * 1000);
      }
    }

    throw lastError!;
  }

  // Execute the actual fetch request
  private async executeRequest(): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(ServerRequest.BASE_URL, {
        ...this.requestOptions,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Handle and parse response
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, null, response.status);
    }

    try {
      const jsonResponse = await response.json();
      
      // Handle your API's response format: r[0].data
      if (Array.isArray(jsonResponse) && jsonResponse.length > 0) {
        if (jsonResponse[0].success === false) {
          throw new ApiError(
            jsonResponse[0].message || 'API request failed',
            null,
            response.status,
            jsonResponse[0].errors
          );
        }
        return jsonResponse[0].data as T;
      }

      // Fallback for different response formats
      return jsonResponse as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to parse response JSON', error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to set request body with validation
  protected setRequestBody(body: any): void {
    try {
      this.requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    } catch (error) {
      throw new Error(`Failed to serialize request body: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Convenience methods for different HTTP methods
  protected setMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'): void {
    this.requestOptions.method = method;
  }

  protected addHeader(key: string, value: string): void {
    this.requestOptions.headers = {
      ...this.requestOptions.headers,
      [key]: value
    };
  }

  // Static helper for one-off requests
  static async makeRequest<T = any>(
    action: string, 
    type: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<T> {
    const request = new ServerRequest(config);
    request.setRequestBody({
      action,
      type,
      ...(data && { object: data })
    });
    return request.sendRequest<T>();
  }
}