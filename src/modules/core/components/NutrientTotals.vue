<script setup lang="ts">
import type { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";

interface Props {
  nutrients: NutrientProfile & { calories: number };
}

defineProps<Props>();
</script>

<template>
  <div class="nutrient-totals-horizontal">
    <!-- Calories -->
    <div class="nutrient-item">
      <div class="nutrient-label">Calories</div>
      <div class="nutrient-value calories-value">{{ Math.round(nutrients.calories) }}</div>
    </div>

    <!-- Macronutrients -->
    <div class="nutrient-item">
      <div class="nutrient-label text-protein">Protein</div>
      <div class="nutrient-value text-protein" style="background-color: var(--protein-bg);">
        {{ nutrients.protein.toFixed(1) }}g
      </div>
    </div>
    <div class="nutrient-item">
      <div class="nutrient-label text-fat">Fat</div>
      <div class="nutrient-value text-fat" style="background-color: var(--fat-bg);">
        {{ nutrients.fat.toFixed(1) }}g
      </div>
    </div>
    <div class="nutrient-item">
      <div class="nutrient-label text-carbs">Carbs</div>
      <div class="nutrient-value text-carbs" style="background-color: var(--carbs-bg);">
        {{ nutrients.carbs.toFixed(1) }}g
      </div>
    </div>

    <!-- Micronutrients -->
    <div class="nutrient-item">
      <div class="nutrient-label text-fiber">Fiber</div>
      <div class="nutrient-value text-fiber" style="background-color: var(--fiber-bg);">
        {{ nutrients.fiber.toFixed(1) }}g
      </div>
    </div>
    <div class="nutrient-item">
      <div class="nutrient-label text-sugar">Sugar</div>
      <div class="nutrient-value text-sugar" style="background-color: var(--sugar-bg);">
        {{ nutrients.sugar.toFixed(1) }}g
      </div>
    </div>
    <div class="nutrient-item">
      <div class="nutrient-label text-sodium">Sodium</div>
      <div class="nutrient-value text-sodium" style="background-color: var(--sodium-bg);">
        {{ nutrients.sodium.toFixed(0) }}mg
      </div>
    </div>
  </div>
</template>

<style scoped>
.nutrient-totals-horizontal {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: flex-start;
  align-items: flex-start;
}

.nutrient-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 90px;
}

.nutrient-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

.nutrient-value {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1.125rem;
  min-width: 70px;
  text-align: center;
}

.calories-value {
  font-size: 1.5rem;
  color: var(--primary-color);
  background: none !important;
  padding: 0.5rem 0;
}
</style>
