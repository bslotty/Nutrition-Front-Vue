import type { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";
import { BaseFood } from "@/modules/food/models/BaseFood";
import { Food } from "@/modules/food/models/Food";
import { Recipe } from "@/modules/food/models/Recipe";

export class MealEntry {
  public readonly id: string;
  public readonly food: BaseFood;
  public amount: number;
  public unit: string;

  constructor(id: string, food: BaseFood, amount: number, unit: string) {
    this.id = id;
    this.food = food;
    this.amount = amount;
    this.unit = unit;
  }

  get nutrients(): NutrientProfile {
    return this.food.calculateNutrients(this.amount, this.unit);
  }

  get calories(): number {
    const nutrients = this.nutrients;
    return Math.round(nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9);
  }

  setAmount(amount: number, unit?: string): this {
    this.amount = amount;
    if (unit) this.unit = unit;
    return this;
  }

  static fromPayload(payload: any): MealEntry {
    const food = payload.food.type === 'simple' 
      ? Food.fromPayload(payload.food)
      : Recipe.fromPayload(payload.food);
    
    return new MealEntry(
      payload.id,
      food,
      payload.amount,
      payload.unit || payload.food.serving?.unit || ''
    );
  }
}