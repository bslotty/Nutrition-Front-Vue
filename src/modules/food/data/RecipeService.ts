import type { RequestConfig } from "@/modules/core/interfaces/request_config";
import type { ApiResponse } from "@/modules/core/interfaces/api_response";
import { BaseService } from "@/modules/core/models/base_service";
import { Recipe } from "../models/Recipe";
import { Food } from "../models/Food";

export class RecipeService extends BaseService {
  list: Recipe[] = [];
  detail: Recipe | null = null;

  constructor(config?: Partial<RequestConfig>) {
    super("Recipes", config);
  }

  async getListFromServer(start = 0, count = 25): Promise<Recipe[]> {
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
        const recipes = response[0].data.map(payload => Recipe.fromPayload(payload));
        this.list = recipes;
        return recipes;
      }
      
      // Fallback for non-array response  
      const recipes = response.map(payload => Recipe.fromPayload(payload));
      this.list = recipes;
      return recipes;
    } catch (error) {
      console.error('Failed to fetch recipes from server:', error);
      throw error;
    }
  }

  async getByID(id: string): Promise<Recipe> {
    // Check local cache first
    if (this.list.length > 0) {
      const cachedRecipe = this.list.find(r => r.id === id);
      if (cachedRecipe) {
        return cachedRecipe;
      }
    }

    return this.getFromServerByID(id);
  }

  async getFromServerByID(id: string): Promise<Recipe> {
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
        return Recipe.fromPayload(response[0].data);
      }
      
      // Fallback for non-array response
      return Recipe.fromPayload(response);
    } catch (error) {
      console.error(`Failed to fetch recipe ${id}:`, error);
      throw error;
    }
  }

  async createRecipe(recipe: Recipe): Promise<Recipe> {
    try {
      const serialized = this.serializeRecipe(recipe);
      const response = await this.create<any>(serialized);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Create operations failed: ${errorMessages}`);
        }
        
        // Create operation succeeded - return the recipe with serialized data
        const createdRecipe = Recipe.fromPayload(serialized);
        
        // Update local cache
        if (!this.list.find(r => r.id === createdRecipe.id)) {
          this.list.push(createdRecipe);
        }
        
        return createdRecipe;
      }
      
      // Fallback for non-array response
      const createdRecipe = Recipe.fromPayload(response);
      if (!this.list.find(r => r.id === createdRecipe.id)) {
        this.list.push(createdRecipe);
      }
      return createdRecipe;
    } catch (error) {
      console.error('Failed to create recipe:', error);
      throw error;
    }
  }

  async updateRecipe(recipe: Recipe): Promise<Recipe> {
    try {
      const serialized = this.serializeRecipe(recipe);
      const response = await this.update<any>(serialized);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Update operations failed: ${errorMessages}`);
        }
        
        // Update operation succeeded - return the updated recipe
        const updatedRecipe = recipe; // Use original recipe object since update succeeded
        
        // Update local cache
        const index = this.list.findIndex(r => r.id === updatedRecipe.id);
        if (index !== -1) {
          this.list[index] = updatedRecipe;
        }
        
        return updatedRecipe;
      }
      
      // Fallback for non-array response
      const updatedRecipe = Recipe.fromPayload(response);
      const index = this.list.findIndex(r => r.id === updatedRecipe.id);
      if (index !== -1) {
        this.list[index] = updatedRecipe;
      }
      return updatedRecipe;
    } catch (error) {
      console.error('Failed to update recipe:', error);
      throw error;
    }
  }

  async deleteRecipe(recipe: Recipe): Promise<void> {
    try {
      const response = await this.delete<any>(recipe.id);
      
      // Verify ALL operations succeeded if array response
      if (Array.isArray(response)) {
        const failedOperations = response.filter(op => !op.success);
        if (failedOperations.length > 0) {
          const errorMessages = failedOperations.map(op => op.message || 'Unknown error').join(', ');
          throw new Error(`Delete operations failed: ${errorMessages}`);
        }
      }
      
      // Delete operation succeeded - update local cache
      this.list = this.list.filter(r => r.id !== recipe.id);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      throw error;
    }
  }

  // Search functionality
  async searchRecipes(query: string, serverSearch = false): Promise<Recipe[]> {
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
        return dataOperation?.data ? dataOperation.data.map(payload => Recipe.fromPayload(payload)) : [];
      } catch (error) {
        console.warn('Server search failed, falling back to local search:', error);
      }
    }
    
    // Local search fallback
    const lowerQuery = query.toLowerCase();
    return this.list.filter(recipe =>
      recipe.name.toLowerCase().includes(lowerQuery)
    );
  }

  private serializeRecipe(recipe: Recipe): any {
    return {
      id: recipe.id,
      name: recipe.name,

      // Serialize parts with full food data
      parts: recipe.parts.map(part => ({
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