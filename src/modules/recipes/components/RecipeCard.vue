<script setup lang="ts">
import NutrientBar from "@/modules/core/components/NutrientBar.vue";
import type { Recipe } from "../models/Recipe";
import router from "@/router";

const props = defineProps<{ recipe: Recipe }>();
const { recipe } = props;

function view() {
  router.push({ name: "recipe-details", params: { id: recipe.id }, replace: true });
}
</script>

<template>
  <div
    @click="view()"
    v-if="recipe != undefined && recipe.id != undefined"
    class="card flex flex-col cursor-pointer px-3 py-3 gap-3"
  >
    <!-- Brand (Recipe label) -->
    <span class="text-sm text-gray-500 flex items-center gap-2">
      <i class="pi pi-book"></i>
      Recipe
    </span>

    <!-- Name -->
    <span class="text-lg font-semibold">{{ recipe.name }}</span>

    <!-- Nutrient Bar -->
    <NutrientBar
      :protein="recipe.nutrients.protein"
      :fat="recipe.nutrients.fat"
      :carbs="recipe.nutrients.carbs"
    />

    <!-- Macronutrients: Protein | Fat | Carbs -->
    <div class="flex flex-row justify-between text-center">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-protein">Protein</span>
        <span class="text-sm font-semibold text-protein">{{ recipe.nutrients.protein.toFixed(1) }}g</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-fat">Fat</span>
        <span class="text-sm font-semibold text-fat">{{ recipe.nutrients.fat.toFixed(1) }}g</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-carbs">Carbs</span>
        <span class="text-sm font-semibold text-carbs">{{ recipe.nutrients.carbs.toFixed(1) }}g</span>
      </div>
    </div>

    <!-- Micronutrients: Sodium | Sugar | Fiber -->
    <div class="flex flex-row justify-between text-center">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-sodium">Sodium</span>
        <span class="text-sm text-sodium">{{ recipe.nutrients.sodium }}mg</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-sugar">Sugar</span>
        <span class="text-sm text-sugar">{{ recipe.nutrients.sugar }}g</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-fiber">Fiber</span>
        <span class="text-sm text-fiber">{{ recipe.nutrients.fiber.toFixed(1) }}g</span>
      </div>
    </div>
  </div>
  <div v-else>Error</div>
</template>
