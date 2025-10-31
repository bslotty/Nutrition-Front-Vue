import type { RequestConfig } from "@/modules/core/interfaces/request_config";
import { BaseService } from "@/modules/core/models/base_service";
import { Food } from "../models/Food";

export class FoodService extends BaseService {
  list: Food[] = [];
  detail: Food | null = null;

  constructor(config?: Partial<RequestConfig>) {
    super("Foods", config);
  }

  async getListFromServer(start = 0, count = 100): Promise<Food[]> {
    try {
      const response = await this.getList<any>(start, count);
      const foods = response.map(payload => Food.fromPayload(payload));
      this.list = foods;
      return foods;
    } catch (error) {
      console.error('Failed to fetch foods from server:', error);
      throw error;
    }
  }

  async getByID(id: string): Promise<Food> {
    // Check local cache first
    if (this.list.length > 0) {
      const cachedFood = this.list.find(f => f.id === id);
      if (cachedFood) {
        return cachedFood;
      }
    }

    return this.getFromServerByID(id);
  }

  async getFromServerByID(id: string): Promise<Food> {
    try {
      const response = await this.getById<any>(id);
      return Food.fromPayload(response);
    } catch (error) {
      console.error(`Failed to fetch food ${id}:`, error);
      throw error;
    }
  }

  async createFood(food: Food): Promise<Food> {
    try {
      const serialized = this.serializeFood(food);
      const response = await this.create<any>(serialized);
      const createdFood = Food.fromPayload(response);
      
      // Update local cache
      if (!this.list.find(f => f.id === createdFood.id)) {
        this.list.push(createdFood);
      }
      
      return createdFood;
    } catch (error) {
      console.error('Failed to create food:', error);
      throw error;
    }
  }

  async updateFood(food: Food): Promise<Food> {
    try {
      const serialized = this.serializeFood(food);
      const response = await this.update<any>(serialized);
      const updatedFood = Food.fromPayload(response);
      
      // Update local cache
      const index = this.list.findIndex(f => f.id === updatedFood.id);
      if (index !== -1) {
        this.list[index] = updatedFood;
      }
      
      return updatedFood;
    } catch (error) {
      console.error('Failed to update food:', error);
      throw error;
    }
  }

  async deleteFood(food: Food): Promise<void> {
    try {
      await this.delete(food.id);
      
      // Update local cache
      this.list = this.list.filter(f => f.id !== food.id);
    } catch (error) {
      console.error('Failed to delete food:', error);
      throw error;
    }
  }

  // Search functionality
  async searchFoods(query: string, serverSearch = false): Promise<Food[]> {
    if (serverSearch) {
      // Implement server-side search if your API supports it
      this.setRequestBody({
        action: "search",
        type: this.entityType,
        query: query
      });
      
      try {
        const response = await this.sendRequest<any[]>();
        return response.map(payload => Food.fromPayload(payload));
      } catch (error) {
        console.warn('Server search failed, falling back to local search:', error);
      }
    }
    
    // Local search fallback
    const lowerQuery = query.toLowerCase();
    return this.list.filter(food => 
      food.name.toLowerCase().includes(lowerQuery) ||
      food.brand.toLowerCase().includes(lowerQuery)
    );
  }

  private serializeFood(food: Food): any {
    return {
      id: food.id,
      name: food.name,
      brand: food.brand,
      servingSize: food.serving.size,
      servingSizeMeasurementType: food.serving.unit,
      
      // Nutrients
      protein: food.nutrients.protein,
      fat: food.nutrients.fat,
      carbs: food.nutrients.carbs,
      fiber: food.nutrients.fiber,
      sugar: food.nutrients.sugar,
      sodium: food.nutrients.sodium,
      
      // Vitamins
      vitaminA: food.nutrients.vitaminA,
      vitaminB1: food.nutrients.vitaminB1,
      vitaminB2: food.nutrients.vitaminB2,
      vitaminB3: food.nutrients.vitaminB3,
      vitaminB5: food.nutrients.vitaminB5,
      vitaminB6: food.nutrients.vitaminB6,
      vitaminB7: food.nutrients.vitaminB7,
      vitaminB9: food.nutrients.vitaminB9,
      vitaminB12: food.nutrients.vitaminB12,
      vitaminC: food.nutrients.vitaminC,
      vitaminD: food.nutrients.vitaminD,
      vitaminE: food.nutrients.vitaminE,
      vitaminK: food.nutrients.vitaminK,
      
      // Minerals
      calcium: food.nutrients.calcium,
      iron: food.nutrients.iron,
      magnesium: food.nutrients.magnesium,
      potassium: food.nutrients.potassium,
      zinc: food.nutrients.zinc,
    };
  }
}