import type { NutrientProfile } from "../interfaces/NutrientProfile";
import { BaseFood } from "./BaseFood";
import { Food } from "./Food";
import { Recipe } from "@/modules/recipes/models/Recipe";

export class Part {
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

  toPayload(): any {
    return {
      id: this.id,
      food: this.food,
      amount: this.amount,
      unit: this.unit
    };
  }

  static fromPayload(payload: any): Part {
    const food = payload.food.type === 'simple'
      ? Food.fromPayload(payload.food)
      : Recipe.fromPayload(payload.food);

    const part = new Part(
      payload.id,
      food,
      payload.amount,
      payload.unit || payload.food.serving?.unit || ''
    );

    return part;
  }
}
