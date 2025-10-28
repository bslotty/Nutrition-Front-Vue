import { BaseFood } from "@/modules/food/models/BaseFood";

export interface RecipeIngredient {
  food: BaseFood;
  amount: number;
  unit: string;
}