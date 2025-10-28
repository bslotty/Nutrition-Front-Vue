import type { FoodType } from "../interfaces/FoodType";
import type { NutrientProfile } from "../interfaces/NutrientProfile";
import type { RecipeIngredient } from "../interfaces/RecipeIngredient";
import type { ServingInfo } from "../interfaces/ServingInfo";
import { BaseFood } from "./BaseFood";
import { Food } from "./Food";

export class Recipe extends BaseFood {
  public readonly type: FoodType = 'compound';
  private _ingredients: RecipeIngredient[] = [];
  private _totalYield: ServingInfo = { size: 1, unit: 'serving' };

  get ingredients(): RecipeIngredient[] { 
    return this._ingredients.map(ing => ({ ...ing })); 
  }

  get totalYield(): ServingInfo { 
    return { ...this._totalYield }; 
  }

  static fromPayload(payload: any): Recipe {
    const recipe = new Recipe(payload.id);
    recipe.setName(payload.name || '');
    
    if (payload.ingredients) {
      payload.ingredients.forEach((ing: any) => {
        const food = ing.food.type === 'simple' 
          ? Food.fromPayload(ing.food)
          : Recipe.fromPayload(ing.food);
        recipe.addIngredient(food, ing.amount, ing.unit);
      });
    }
    
    if (payload.totalYield) {
      recipe.setTotalYield(payload.totalYield.size, payload.totalYield.unit);
    }
    
    return recipe;
  }

  setTotalYield(size: number, unit: string): this {
    this._totalYield = { size, unit };
    this.updateNutrients();
    return this;
  }

  addIngredient(food: BaseFood, amount: number, unit: string): this {
    this._ingredients.push({ food, amount, unit });
    this.updateNutrients();
    return this;
  }

  removeIngredient(foodId: string): this {
    this._ingredients = this._ingredients.filter(ing => ing.food.id !== foodId);
    this.updateNutrients();
    return this;
  }

  updateIngredient(foodId: string, amount: number, unit?: string): this {
    const ingredient = this._ingredients.find(ing => ing.food.id === foodId);
    if (ingredient) {
      ingredient.amount = amount;
      if (unit) ingredient.unit = unit;
      this.updateNutrients();
    }
    return this;
  }

  private updateNutrients(): void {
    // Reset nutrients
    this._nutrients = this.createEmptyNutrients();
    
    // Sum all ingredient nutrients
    this._ingredients.forEach(ingredient => {
      const ingredientNutrients = ingredient.food.calculateNutrients(
        ingredient.amount, 
        ingredient.unit
      );
      
      Object.keys(ingredientNutrients).forEach(key => {
        this._nutrients[key as keyof NutrientProfile] += 
          ingredientNutrients[key as keyof NutrientProfile];
      });
    });

    // Set serving info to match total yield
    this._serving = { ...this._totalYield };
  }
}
