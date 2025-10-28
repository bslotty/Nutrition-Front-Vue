import { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";
import { Meal } from "./Meal";

export class Intake {
  public readonly date: Date;
  private _meals: Meal[] = [];

  constructor(date: Date = new Date()) {
    this.date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  get meals(): Meal[] { 
    return [...this._meals]; 
  }

  get totals(): NutrientProfile {
    const totals = this.createEmptyNutrients();
    
    this._meals.forEach(meal => {
      const mealTotals = meal.totals;
      Object.keys(mealTotals).forEach(key => {
        totals[key as keyof NutrientProfile] += 
          mealTotals[key as keyof NutrientProfile];
      });
    });

    return totals;
  }

  get totalCalories(): number {
    return this._meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  }

  addMeal(meal: Meal): this {
    this._meals.push(meal);
    return this;
  }

  removeMeal(mealId: string): this {
    this._meals = this._meals.filter(meal => meal.id !== mealId);
    return this;
  }

  getMeal(mealId: string): Meal | undefined {
    return this._meals.find(meal => meal.id === mealId);
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