<script lang="ts" setup>
import { computed } from "vue";
import type { Part } from "@/modules/food/models/Part";
import FoodTypeBadge from "../components/FoodTypeBadge.vue";

interface Props {
  parts: Part[];
  servingMultiplier?: number;
  depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
  servingMultiplier: 1,
  depth: 0
});

const maxDepth = 3;

const shouldShowMore = computed(() => props.depth >= maxDepth);

function calculateNutrients(part: Part) {
  const adjustedAmount = part.amount * props.servingMultiplier;
  const nutrients = part.food.calculateNutrients(adjustedAmount, part.unit);
  const calories = Math.round(nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9);

  return {
    calories,
    protein: nutrients.protein.toFixed(1),
    fat: nutrients.fat.toFixed(1),
    carbs: nutrients.carbs.toFixed(1)
  };
}

function getAdjustedAmount(part: Part): number {
  return Math.round(part.amount * props.servingMultiplier * 100) / 100;
}

function isRecipe(part: Part): boolean {
  return part.food.type === 'compound';
}
</script>

<template>
  <div class="recipe-ingredients-list">
    <div
      v-for="part in parts"
      :key="part.id"
      class="ingredient-item"
      :style="{ paddingLeft: `${depth * 1}rem` }"
    >
      <div class="flex align-items-start gap-2 py-1">
        <div class="indent-line" v-if="depth > 0"></div>

        <i
          class="pi text-xs mt-1"
          :class="isRecipe(part) ? 'pi-angle-right' : 'pi-circle-fill'"
          style="font-size: 0.5rem; color: var(--text-color-secondary);"
        ></i>

        <div class="flex-1">
          <div class="flex align-items-center gap-2">
            <span class="text-sm">{{ part.food.name }}</span>
            <FoodTypeBadge v-if="isRecipe(part)" :type="part.food.type" size="tiny" />
          </div>
          <div class="text-xs text-gray-500">
            {{ getAdjustedAmount(part) }} {{ part.unit }}
          </div>
        </div>

        <div class="nutrients text-xs" style="min-width: 200px; text-align: right;">
          <div class="font-semibold">{{ calculateNutrients(part).calories }} cal</div>
          <div class="text-gray-500 mt-1">
            <span style="color: #4CAF50;">{{ calculateNutrients(part).protein }}g</span>
            <span class="mx-1">•</span>
            <span style="color: #2196F3;">{{ calculateNutrients(part).fat }}g</span>
            <span class="mx-1">•</span>
            <span style="color: #FFA000;">{{ calculateNutrients(part).carbs }}g</span>
          </div>
        </div>
      </div>

      <div v-if="isRecipe(part) && !shouldShowMore" class="nested-recipe mt-1">
        <RecipeIngredientsList
          :parts="part.food.parts"
          :servingMultiplier="servingMultiplier * (part.amount / part.food.serving.size)"
          :depth="depth + 1"
        />
      </div>

      <div v-else-if="isRecipe(part) && shouldShowMore" class="text-xs text-gray-400 ml-5 italic">
        (recipe contains {{ part.food.parts?.length || 0 }} ingredients)
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