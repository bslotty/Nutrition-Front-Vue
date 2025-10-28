import type { BaseFood } from "@/modules/food/models/BaseFood";

export interface MealPart {
  id: string;
  food: BaseFood;
  amount: number;
  unit: string;
  calories?: number;
}