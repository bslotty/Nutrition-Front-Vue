import type { RequestConfig } from "@/modules/core/interfaces/request_config";
import type { ApiResponse } from "@/modules/core/interfaces/api_response";
import { BaseService } from "@/modules/core/models/base_service";
import { Meal } from "../models/Meal";

export class MealService extends BaseService {
  list: Meal[] = [];
  detail: Meal | null = null;

  constructor(config?: Partial<RequestConfig>) {
    super("Meals", config);
  }

  async getListFromServer(start = 0, count = 25): Promise<Meal[]> {
    try {
      const response = await this.getList<any>(start, count);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Operations failed: ${errorMessages}`);
        }
        // Use the same data extraction as original
        const meals = response[0].data.map(payload => Meal.fromPayload(payload));
        this.list = meals;
        return meals;
      }
      
      // Fallback for non-array response  
      const meals = response.map(payload => Meal.fromPayload(payload));
      this.list = meals;
      return meals;
    } catch (error) {
      console.error('Failed to fetch meals from server:', error);
      throw error;
    }
  }

  async getByID(id: string): Promise<Meal> {
    // Check local cache first
    if (this.list.length > 0) {
      const cachedMeal = this.list.find(m => m.id === id);
      if (cachedMeal) {
        return cachedMeal;
      }
    }

    return this.getFromServerByID(id);
  }

  async getFromServerByID(id: string): Promise<Meal> {
    try {
      const response = await this.getById<any>(id);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Operations failed: ${errorMessages}`);
        }
        // Use the same data extraction as original - just get first element's data
        return Meal.fromPayload(response[0].data);
      }
      
      // Fallback for non-array response
      return Meal.fromPayload(response);
    } catch (error) {
      console.error(`Failed to fetch meal ${id}:`, error);
      throw error;
    }
  }

  async createMeal(meal: Meal): Promise<Meal> {
    try {
      const serialized = this.serializeMeal(meal);
      const response = await this.create<any>(serialized);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Create operations failed: ${errorMessages}`);
        }
        
        // Create operation succeeded - return the meal with serialized data
        const createdMeal = Meal.fromPayload(serialized);
        
        // Update local cache
        if (!this.list.find(m => m.id === createdMeal.id)) {
          this.list.push(createdMeal);
        }
        
        return createdMeal;
      }
      
      // Fallback for non-array response
      const createdMeal = Meal.fromPayload(response);
      if (!this.list.find(m => m.id === createdMeal.id)) {
        this.list.push(createdMeal);
      }
      return createdMeal;
    } catch (error) {
      console.error('Failed to create meal:', error);
      throw error;
    }
  }

  async updateMeal(meal: Meal): Promise<Meal> {
    try {
      const serialized = this.serializeMeal(meal);
      const response = await this.update<any>(serialized);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Update operations failed: ${errorMessages}`);
        }
        
        // Update operation succeeded - return the updated meal
        const updatedMeal = meal; // Use original meal object since update succeeded
        
        // Update local cache
        const index = this.list.findIndex(m => m.id === updatedMeal.id);
        if (index !== -1) {
          this.list[index] = updatedMeal;
        }
        
        return updatedMeal;
      }
      
      // Fallback for non-array response
      const updatedMeal = Meal.fromPayload(response);
      const index = this.list.findIndex(m => m.id === updatedMeal.id);
      if (index !== -1) {
        this.list[index] = updatedMeal;
      }
      return updatedMeal;
    } catch (error) {
      console.error('Failed to update meal:', error);
      throw error;
    }
  }

  async deleteMeal(meal: Meal): Promise<void> {
    try {
      const response = await this.delete<any>(meal.id);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Delete operations failed: ${errorMessages}`);
        }
      }
      
      // Delete operation succeeded - update local cache
      this.list = this.list.filter(m => m.id !== meal.id);
    } catch (error) {
      console.error('Failed to delete meal:', error);
      throw error;
    }
  }

  // Search functionality
  async searchMeals(query: string, serverSearch = false): Promise<Meal[]> {
    if (serverSearch) {
      this.setRequestBody({
        action: "search",
        type: this.entityType,
        query: query
      });
      
      try {
        const response = await this.sendRequest<any[]>();
        
        if (!Array.isArray(response) || response.length === 0) {
          throw new Error('Invalid response format');
        }

        // Check that ALL operations succeeded
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Search operations failed: ${errorMessages}`);
        }

        // Find the operation that contains the data
        const dataOperation = response.find(op => op.data && Array.isArray(op.data) && op.data.length > 0);
        return dataOperation?.data ? dataOperation.data.map(payload => Meal.fromPayload(payload)) : [];
      } catch (error) {
        console.warn('Server search failed, falling back to local search:', error);
      }
    }
    
    // Local search fallback
    const lowerQuery = query.toLowerCase();
    return this.list.filter(meal => 
      meal.name.toLowerCase().includes(lowerQuery)
    );
  }

  private serializeMeal(meal: Meal): any {
    return {
      id: meal.id,
      name: meal.name,
      date: meal.date.toISOString(),
      
      // Serialize parts (meal ingredients)
      parts: meal.parts.map(part => ({
        id: part.id,
        food: {
          id: part.food.id,
          name: part.food.name,
          brand: part.food.brand,
          type: part.food.type,
          serving: part.food.serving,
          nutrients: part.food.nutrients
        },
        amount: part.amount,
        unit: part.unit
      }))
    };
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}