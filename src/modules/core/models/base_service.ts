import type { RequestConfig } from "../interfaces/request_config";
import { ApiError } from "./api_error";
import { ServerRequest } from "./server_request";

export abstract class BaseService extends ServerRequest {
  protected readonly entityType: string;

  constructor(entityType: string, config?: Partial<RequestConfig>) {
    super(config);
    this.entityType = entityType;
  }

  // Generic CRUD operations
  protected async getList<T>(start = 0, count = 25, filters?: any): Promise<T[]> {
    this.setRequestBody({
      action: "list",
      type: this.entityType,
      start,
      count,
      ...(filters && { filters })
    });

    return this.sendRequest<T[]>();
  }

  protected async getById<T>(id: string): Promise<T> {
    this.setRequestBody({
      action: "detail",
      type: this.entityType,
      object: { id }
    });

    const response = await this.sendRequest<T[]>();
    if (!Array.isArray(response) || response.length === 0) {
      throw new ApiError(`${this.entityType} with id ${id} not found`);
    }
    return response[0];
  }

  protected async create<T>(data: any): Promise<T> {
    this.setRequestBody({
      action: "create",
      type: this.entityType,
      object: data
    });

    const response = await this.sendRequest<T[]>();
    // API returns empty array for successful INSERTs, return the input data as confirmation
    if (!Array.isArray(response)) {
      throw new ApiError(`Failed to create ${this.entityType}`);
    }
    return response.length > 0 ? response[0] : (data as T);
  }

  protected async update<T>(data: any): Promise<T> {
    this.setRequestBody({
      action: "update",
      type: this.entityType,
      object: data
    });

    const response = await this.sendRequest<T[]>();
    // API returns empty array for successful UPDATEs, return the input data as confirmation
    if (!Array.isArray(response)) {
      throw new ApiError(`Failed to update ${this.entityType}`);
    }
    return response.length > 0 ? response[0] : (data as T);
  }

  protected async delete(id: string): Promise<any> {
    this.setRequestBody({
      action: "delete",
      type: this.entityType,
      object: { id }
    });

    return this.sendRequest();
  }

  // Batch operations
  protected async batchCreate<T>(items: any[]): Promise<T[]> {
    this.setRequestBody({
      action: "batch_create",
      type: this.entityType,
      objects: items
    });

    return this.sendRequest<T[]>();
  }

  protected async batchUpdate<T>(items: any[]): Promise<T[]> {
    this.setRequestBody({
      action: "batch_update", 
      type: this.entityType,
      objects: items
    });

    return this.sendRequest<T[]>();
  }
}