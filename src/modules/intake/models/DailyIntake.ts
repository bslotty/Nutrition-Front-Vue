import type { Meal } from './Meal';
import type { NutrientProfile } from '@/modules/food/interfaces/NutrientProfile';

export interface DailyIntakeTotals extends NutrientProfile {
  calories: number;
}

export class DailyIntake {
  public date: Date;
  public meals: Meal[] = [];
  public totals: DailyIntakeTotals;

  constructor(date: Date) {
    this.date = date;
    this.totals = this.createEmptyTotals();
  }

  setMeals(meals: Meal[]): this {
    this.meals = meals;
    return this;
  }

  calculateTotals(): this {
    // Reset totals
    this.totals = this.createEmptyTotals();

    // Sum up all meal nutrients
    this.meals.forEach(meal => {
      if (meal.totals) {
        Object.keys(meal.totals).forEach(key => {
          if (key in this.totals) {
            this.totals[key as keyof DailyIntakeTotals] += 
              meal.totals[key as keyof typeof meal.totals] || 0;
          }
        });
      }
    });

    // Calculate total calories
    this.totals.calories = Math.round(
      this.totals.protein * 4 +
      this.totals.carbs * 4 +
      this.totals.fat * 9
    );

    return this;
  }

  private createEmptyTotals(): DailyIntakeTotals {
    return {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      vitaminA: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminB3: 0,
      vitaminB5: 0,
      vitaminB6: 0,
      vitaminB7: 0,
      vitaminB9: 0,
      vitaminB12: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminK: 0,
      calcium: 0,
      iron: 0,
      magnesium: 0,
      potassium: 0,
      zinc: 0
    };
  }

  get hasMeals(): boolean {
    return this.meals.length > 0;
  }

  get mealCount(): number {
    return this.meals.length;
  }

  get macroBreakdown() {
    const total = this.totals.protein + this.totals.fat + this.totals.carbs;
    if (total === 0) return { protein: 0, fat: 0, carbs: 0 };

    return {
      protein: Math.round((this.totals.protein / total) * 100),
      fat: Math.round((this.totals.fat / total) * 100),
      carbs: Math.round((this.totals.carbs / total) * 100)
    };
  }
}