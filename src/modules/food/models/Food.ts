import type { FoodType } from "../interfaces/FoodType";
import { BaseFood } from "./BaseFood";

export class Food extends BaseFood {
  public readonly type: FoodType = "simple";

  static fromPayload(payload: any): Food {
    const food = new Food(payload.id);
    return food
      .setName(payload.name || "")
      .setBrand(payload.brand || "")
      .setServing(
        +payload.servingSize || 0,
        payload.servingSizeMeasurementType || ""
      )
      .setNutrients({
        protein   : +payload.protein || 0,
        fat       : +payload.fat || 0,
        carbs     : +payload.carbs || 0,
        fiber     : +payload.fiber || 0,
        sugar     : +payload.sugar || 0,
        sodium    : +payload.sodium || 0,
        vitaminA  : +payload.vitaminA || 0,
        vitaminB1 : +payload.vitaminB1 || 0,
        vitaminB2 : +payload.vitaminB2 || 0,
        vitaminB3 : +payload.vitaminB3 || 0,
        vitaminB5 : +payload.vitaminB5 || 0,
        vitaminB6 : +payload.vitaminB6 || 0,
        vitaminB7 : +payload.vitaminB7 || 0,
        vitaminB9 : +payload.vitaminB9 || 0,
        vitaminB12: +payload.vitaminB12 || 0,
        vitaminC  : +payload.vitaminC || 0,
        vitaminD  : +payload.vitaminD || 0,
        vitaminE  : +payload.vitaminE || 0,
        vitaminK  : +payload.vitaminK || 0,
        calcium   : +payload.calcium || 0,
        iron      : +payload.iron || 0,
        magnesium : +payload.magnesium || 0,
        potassium : +payload.potassium || 0,
        zinc      : +payload.zinc || 0,
      });
  }

  // Builder pattern methods for easy construction
  setProtein(value: number): this {
    this._nutrients.protein = value;
    return this;
  }
  setFat(value: number): this {
    this._nutrients.fat = value;
    return this;
  }
  setCarbs(value: number): this {
    this._nutrients.carbs = value;
    return this;
  }
  setFiber(value: number): this {
    this._nutrients.fiber = value;
    return this;
  }
  setSugar(value: number): this {
    this._nutrients.sugar = value;
    return this;
  }
  setSodium(value: number): this {
    this._nutrients.sodium = value;
    return this;
  }
}
