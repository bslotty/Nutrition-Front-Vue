<script lang="ts" setup>
import { computed } from "vue";
import type { RecipeIngredient } from "@/modules/intake/interfaces/RecipeIngredient";
import FoodTypeBadge from "../components/FoodTypeBadge.vue";

interface Props {
  ingredients: RecipeIngredient[];
  servingMultiplier?: number;
  depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  servingMultiplier: 1,
  depth: 0
});

const maxDepth = 3;

const shouldShowMore = computed(() => props.depth >= maxDepth);

function calculateNutrients(ingredient: RecipeIngredient) {
  const adjustedAmount = ingredient.amount * props.servingMultiplier;
  const nutrients = ingredient.food.calculateNutrients(adjustedAmount, ingredient.unit);
  const calories = Math.round(nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9);
  
  return {
    calories,
    protein: nutrients.protein.toFixed(1),
    fat: nutrients.fat.toFixed(1),
    carbs: nutrients.carbs.toFixed(1)
  };
}

function getAdjustedAmount(ingredient: RecipeIngredient): number {
  return Math.round(ingredient.amount * props.servingMultiplier * 100) / 100;
}

function isRecipe(ingredient: RecipeIngredient): boolean {
  return ingredient.food.type === 'compound';
}
</script>

<template>
  <div class="recipe-ingredients-list">
    <div 
      v-for="ingredient in ingredients" 
      :key="ingredient.food.id" 
      class="ingredient-item" 
      :style="{ paddingLeft: `${depth * 1}rem` }"
    >
      <div class="flex align-items-start gap-2 py-1">
        <div class="indent-line" v-if="depth > 0"></div>
        
        <i 
          class="pi text-xs mt-1" 
          :class="isRecipe(ingredient) ? 'pi-angle-right' : 'pi-circle-fill'" 
          style="font-size: 0.5rem; color: var(--text-color-secondary);"
        ></i>
        
        <div class="flex-1">
          <div class="flex align-items-center gap-2">
            <span class="text-sm">{{ ingredient.food.name }}</span>
            <FoodTypeBadge v-if="isRecipe(ingredient)" :type="ingredient.food.type" size="tiny" />
          </div>
          <div class="text-xs text-gray-500">
            {{ getAdjustedAmount(ingredient) }} {{ ingredient.unit }}
          </div>
        </div>
        
        <div class="nutrients text-xs" style="min-width: 200px; text-align: right;">
          <div class="font-semibold">{{ calculateNutrients(ingredient).calories }} cal</div>
          <div class="text-gray-500 mt-1">
            <span style="color: #4CAF50;">{{ calculateNutrients(ingredient).protein }}g</span>
            <span class="mx-1">•</span>
            <span style="color: #2196F3;">{{ calculateNutrients(ingredient).fat }}g</span>
            <span class="mx-1">•</span>
            <span style="color: #FFA000;">{{ calculateNutrients(ingredient).carbs }}g</span>
          </div>
        </div>
      </div>
      
      <div v-if="isRecipe(ingredient) && !shouldShowMore" class="nested-recipe mt-1">
        <RecipeIngredientsList 
          :ingredients="ingredient.food.ingredients" 
          :servingMultiplier="servingMultiplier * (ingredient.amount / ingredient.food.serving.size)" 
          :depth="depth + 1" 
        />
      </div>
      
      <div v-else-if="isRecipe(ingredient) && shouldShowMore" class="text-xs text-gray-400 ml-5 italic">
        (recipe contains {{ ingredient.food.ingredients?.length || 0 }} ingredients)
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recipe-ingredients-list {
  .ingredient-item {
    position: relative;
    
    .indent-line {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--surface-border);
    }
  }
  
  .nested-recipe {
    border-left: 2px solid var(--surface-border);
    margin-left: 0.5rem;
  }
}
</style>