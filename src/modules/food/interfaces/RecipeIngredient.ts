import { BaseFood } from "../models/BaseFood";

export interface RecipeIngredient {
  food: BaseFood;
  amount: number;
  unit: string;
}