import type { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";
import { BaseFood } from "@/modules/food/models/BaseFood";
import { MealEntry } from "./MealEntry";

export class Meal {
  public readonly id: string;
  public name: string = '';
  public date: Date;
  private _entries: MealEntry[] = [];

  constructor(id: string, date: Date = new Date()) {
    this.id = id;
    this.date = date;
  }

  get entries(): MealEntry[] { 
    return [...this._entries]; 
  }

  get totals(): NutrientProfile {
    const totals = this.createEmptyNutrients();
    
    this._entries.forEach(entry => {
      const entryNutrients = entry.nutrients;
      Object.keys(entryNutrients).forEach(key => {
        totals[key as keyof NutrientProfile] += 
          entryNutrients[key as keyof NutrientProfile];
      });
    });

    return totals;
  }

  get totalCalories(): number {
    return this._entries.reduce((sum, entry) => sum + entry.calories, 0);
  }

  static fromPayload(payload: any): Meal {
    const meal = new Meal(payload.id, new Date(payload.date));
    meal.name = payload.name || '';
    
    if (payload.entries) {
      payload.entries.forEach((entryPayload: any) => {
        const entry = MealEntry.fromPayload(entryPayload);
        meal._entries.push(entry);
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

  addEntry(food: BaseFood, amount: number, unit: string): MealEntry {
    const entry = new MealEntry(
      `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      food,
      amount,
      unit
    );
    this._entries.push(entry);
    return entry;
  }

  removeEntry(entryId: string): this {
    this._entries = this._entries.filter(entry => entry.id !== entryId);
    return this;
  }

  updateEntry(entryId: string, amount: number, unit?: string): this {
    const entry = this._entries.find(e => e.id === entryId);
    if (entry) {
      entry.setAmount(amount, unit);
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