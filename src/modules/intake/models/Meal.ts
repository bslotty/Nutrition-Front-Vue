import type { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";
import { BaseFood } from "@/modules/food/models/BaseFood";
import { Part } from "@/modules/food/models/Part";

export class Meal {
  public readonly id: string;
  public name: string = '';
  public date: Date;
  public parts: Part[] = [];

  constructor(id: string, date: Date = new Date()) {
    this.id = id;
    this.date = date;
  }

  get totals(): NutrientProfile {
    const totals = this.createEmptyNutrients();

    this.parts.forEach(part => {
      const partNutrients = part.nutrients;
      Object.keys(partNutrients).forEach(key => {
        totals[key as keyof NutrientProfile] +=
          partNutrients[key as keyof NutrientProfile];
      });
    });

    return totals;
  }

  get totalCalories(): number {
    return this.parts.reduce((sum, part) => sum + part.calories, 0);
  }

  toPayload(): any {
    return {
      id: this.id,
      name: this.name,
      date: this.date,
      parts: this.parts.map(part => part.toPayload())
    };
  }

  static fromPayload(payload: any): Meal {
    const meal = new Meal(payload.id, new Date(payload.date));
    meal.name = payload.name || '';

    if (payload.parts) {
      payload.parts.forEach((partPayload: any) => {
        const part = Part.fromPayload(partPayload);
        meal.parts.push(part);
      });
    }

    return meal;
  }

  setName(name: string): this {
    this.name = name;
    return this;
  }

  setDate(date: Date | string): this {
    this.date = typeof date === 'string' ? new Date(date) : date;
    return this;
  }

  addPart(food: BaseFood, amount: number, unit: string): Part {
    const part = new Part(
      `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      food,
      amount,
      unit
    );
    this.parts.push(part);
    return part;
  }

  removePart(partId: string): this {
    this.parts = this.parts.filter(part => part.id !== partId);
    return this;
  }

  updatePart(partId: string, amount: number, unit?: string): this {
    const part = this.parts.find(p => p.id === partId);
    if (part) {
      part.setAmount(amount, unit);
    }
    return this;
  }

  private createEmptyNutrients(): NutrientProfile {
    return {
      protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0, sodium: 0,
      vitaminA: 0, vitaminB1: 0, vitaminB2: 0, vitaminB3: 0, vitaminB5: 0,
      vitaminB6: 0, vitaminB7: 0, vitaminB9: 0, vitaminB12: 0, vitaminC: 0,
      vitaminD: 0, vitaminE: 0, vitaminK: 0,
      calcium: 0, iron: 0, magnesium: 0, potassium: 0, zinc: 0
    };
  }
}