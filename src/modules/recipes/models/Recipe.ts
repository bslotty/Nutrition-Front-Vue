import type { FoodType } from "@/modules/food/interfaces/FoodType";
import type { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";
import type { ServingInfo } from "@/modules/food/interfaces/ServingInfo";
import { BaseFood } from "@/modules/food/models/BaseFood";
import { Food } from "@/modules/food/models/Food";
import { Part } from "@/modules/food/models/Part";

export class Recipe extends BaseFood {
  public readonly type: FoodType = 'compound';
  public parts: Part[] = [];

  toPayload(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      parts: this.parts.map(part => part.toPayload())
    };
  }

  static fromPayload(payload: any): Recipe {
    const recipe = new Recipe(payload.id);
    recipe.setName(payload.name || '');

    if (payload.parts) {
      payload.parts.forEach((partPayload: any) => {
        const part = Part.fromPayload(partPayload);
        recipe.parts.push(part);
      });
    }

    // Calculate nutrients after loading all parts
    recipe.updateNutrients();

    return recipe;
  }

  addPart(food: BaseFood, amount: number, unit: string): Part {
    const part = new Part(
      `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      food,
      amount,
      unit
    );
    this.parts.push(part);
    this.updateNutrients();
    return part;
  }

  removePart(partId: string): this {
    this.parts = this.parts.filter(part => part.id !== partId);
    this.updateNutrients();
    return this;
  }

  updatePart(partId: string, amount: number, unit?: string): this {
    const part = this.parts.find(p => p.id === partId);
    if (part) {
      part.setAmount(amount, unit);
      this.updateNutrients();
    }
    return this;
  }

  setParts(parts: Part[]): this {
    this.parts = parts;
    this.updateNutrients();
    return this;
  }

  public updateNutrients(): void {
    // Reset nutrients
    this._nutrients = this.createEmptyNutrients();

    // Sum all part nutrients
    this.parts.forEach(part => {
      const partNutrients = part.nutrients;

      Object.keys(partNutrients).forEach(key => {
        this._nutrients[key as keyof NutrientProfile] +=
          partNutrients[key as keyof NutrientProfile];
      });
    });

    // Set serving to total recipe (all ingredients combined)
    this._serving = { size: 1, unit: 'recipe' };
  }
}
