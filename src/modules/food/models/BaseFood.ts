import type { FoodType } from "../interfaces/FoodType";
import type { NutrientProfile } from "../interfaces/NutrientProfile";
import type { ServingInfo } from "../interfaces/ServingInfo";

export abstract class BaseFood {
  public readonly id: string;
  public name: string = "";
  public brand: string = "";
  public abstract readonly type: FoodType;

  protected _serving: ServingInfo = { size: 0, unit: "" };
  protected _nutrients: NutrientProfile;

  constructor(id: string) {
    this.id = id;
    this._nutrients = this.createEmptyNutrients();
  }

  // Getters
  get serving(): ServingInfo {
    return { ...this._serving };
  }
  get nutrients(): NutrientProfile {
    return { ...this._nutrients };
  }
  get calories(): number {
    return Math.round(
      this._nutrients.protein * 4 +
        this._nutrients.carbs * 4 +
        this._nutrients.fat * 9
    );
  }

  // Macronutrient percentages
  get macroBreakdown() {
    const total =
      this._nutrients.protein + this._nutrients.fat + this._nutrients.carbs;
    if (total === 0) return { protein: 0, fat: 0, carbs: 0 };

    return {
      protein: Math.round((this._nutrients.protein / total) * 100),
      fat: Math.round((this._nutrients.fat / total) * 100),
      carbs: Math.round((this._nutrients.carbs / total) * 100),
    };
  }

  // Chart data for visualizations
  get chartData(): Array<Array<string | number>> {
    if (this._nutrients.protein + this._nutrients.fat + this._nutrients.carbs === 0) {
      return [['Nutrient', 'Amount'], ['empty', 1]];
    }
    return [
      ['Nutrient', 'Amount'], // Header row
      ['Protein', +this._nutrients.protein],
      ['Fat', +this._nutrients.fat],
      ['Carbs', +this._nutrients.carbs]
    ];
  }

  // Fluent setters
  setName(name: string): this {
    this.name = name;
    return this;
  }

  setBrand(brand: string): this {
    this.brand = brand;
    return this;
  }

  setServing(size: number, unit: string): this {
    this._serving = { size, unit };
    return this;
  }

  // Calculate nutrients for a specific amount
  calculateNutrients(
    amount: number,
    unit: string = this._serving.unit
  ): NutrientProfile {
    if (this._serving.size === 0) return this.createEmptyNutrients();

    const multiplier = amount / this._serving.size;
    const calculated = {} as NutrientProfile;

    Object.keys(this._nutrients).forEach((key) => {
      calculated[key as keyof NutrientProfile] =
        Math.round(
          this._nutrients[key as keyof NutrientProfile] * multiplier * 10
        ) / 10;
    });

    return calculated;
  }

  protected createEmptyNutrients(): NutrientProfile {
    return {
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
      zinc: 0,
    };
  }

  protected setNutrients(nutrients: Partial<NutrientProfile>): this {
    Object.assign(this._nutrients, nutrients);
    return this;
  }
}
