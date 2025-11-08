<script setup lang="ts">
import type { NutrientProfile } from '@/modules/food/interfaces/NutrientProfile';

interface Props {
  nutrients: NutrientProfile;
  showCalories?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showCalories: true,
  size: 'medium'
});

const calories = Math.round(
  props.nutrients.protein * 4 +
  props.nutrients.carbs * 4 +
  props.nutrients.fat * 9
);
</script>

<template>
  <div class="nutrient-summary-grid" :class="`nutrient-summary-${size}`">
    <div v-if="showCalories" class="nutrient-cell calories">
      {{ calories }}
    </div>
    <div class="nutrient-cell protein">{{ nutrients.protein.toFixed(0) }}g</div>
    <div class="nutrient-cell fat">{{ nutrients.fat.toFixed(0) }}g</div>
    <div class="nutrient-cell carbs">{{ nutrients.carbs.toFixed(0) }}g</div>
  </div>
</template>

<style lang="scss" scoped>
.nutrient-summary-grid {
  display: contents;

  .nutrient-cell {
    font-weight: 600;
    font-size: 0.875rem;
    text-align: right;
    white-space: nowrap;
  }

  .calories {
    color: var(--text-color);
  }

  .protein {
    color: #4CAF50;
  }

  .fat {
    color: #2196F3;
  }

  .carbs {
    color: #FFA000;
  }

  &.nutrient-summary-small .nutrient-cell {
    font-size: 0.75rem;
  }

  &.nutrient-summary-medium .nutrient-cell {
    font-size: 0.875rem;
  }

  &.nutrient-summary-large .nutrient-cell {
    font-size: 0.9375rem;
  }
}
</style>
