<script lang="ts" setup>
import { computed } from "vue";
import type { NutrientProfile } from "@/modules/food/interfaces/NutrientProfile";

interface MealTotals extends NutrientProfile {
  calories: number;
}

interface Props {
  totals: MealTotals;
  showBreakdown?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showBreakdown: true,
  size: 'medium'
});

const macroBreakdown = computed(() => {
  const total = props.totals.protein + props.totals.fat + props.totals.carbs;
  if (total === 0) return { protein: 0, fat: 0, carbs: 0 };

  return {
    protein: Math.round((props.totals.protein / total) * 100),
    fat: Math.round((props.totals.fat / total) * 100),
    carbs: Math.round((props.totals.carbs / total) * 100)
  };
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return { container: 'text-sm', calories: 'text-lg', macro: 'text-xs' };
    case 'large':
      return { container: 'text-lg', calories: 'text-3xl', macro: 'text-base' };
    default:
      return { container: 'text-base', calories: 'text-2xl', macro: 'text-sm' };
  }
});
</script>

<template>
  <div class="meal-totals-bar" :class="sizeClasses.container">
    <div class="totals-content flex align-items-center justify-content-between gap-3 px-3 py-3 bg-gray-50 border-round">
      <div class="calories-display">
        <span class="font-bold text-primary" :class="sizeClasses.calories">
          {{ Math.round(totals.calories) }}
        </span>
        <span class="ml-1 text-gray-600">cal</span>
      </div>
      
      <div class="macros-display flex gap-4">
        <div class="macro-item">
          <span class="label text-gray-600">Protein:</span>
          <span class="value font-semibold ml-1" style="color: #4CAF50;">
            {{ totals.protein.toFixed(1) }}g
          </span>
        </div>
        <div class="macro-item">
          <span class="label text-gray-600">Fat:</span>
          <span class="value font-semibold ml-1" style="color: #2196F3;">
            {{ totals.fat.toFixed(1) }}g
          </span>
        </div>
        <div class="macro-item">
          <span class="label text-gray-600">Carbs:</span>
          <span class="value font-semibold ml-1" style="color: #FFA000;">
            {{ totals.carbs.toFixed(1) }}g
          </span>
        </div>
      </div>
      
      <div class="secondary-nutrients flex gap-3" :class="sizeClasses.macro">
        <div class="nutrient-item text-gray-500">
          <span>Fiber: {{ totals.fiber.toFixed(1) }}g</span>
        </div>
        <div class="nutrient-item text-gray-500">
          <span>Sugar: {{ totals.sugar.toFixed(1) }}g</span>
        </div>
        <div class="nutrient-item text-gray-500">
          <span>Sodium: {{ totals.sodium.toFixed(0) }}mg</span>
        </div>
      </div>
    </div>
    
    <div v-if="showBreakdown" class="macro-breakdown-bar mt-2">
      <div class="breakdown-bar flex border-round overflow-hidden" style="height: 8px;">
        <div 
          class="protein-section" 
          :style="{ width: `${macroBreakdown.protein}%`, backgroundColor: '#4CAF50' }"
        ></div>
        <div 
          class="fat-section" 
          :style="{ width: `${macroBreakdown.fat}%`, backgroundColor: '#2196F3' }"
        ></div>
        <div 
          class="carbs-section" 
          :style="{ width: `${macroBreakdown.carbs}%`, backgroundColor: '#FFA000' }"
        ></div>
      </div>
      
      <div class="breakdown-labels flex justify-content-between mt-1 text-xs text-gray-500">
        <span style="color: #4CAF50;">{{ macroBreakdown.protein }}%</span>
        <span style="color: #2196F3;">{{ macroBreakdown.fat }}%</span>
        <span style="color: #FFA000;">{{ macroBreakdown.carbs }}%</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.meal-totals-bar {
  .totals-content {
    background: var(--surface-50);
    border: 1px solid var(--surface-border);
  }
  
  @media (max-width: 768px) {
    .totals-content {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .macros-display,
    .secondary-nutrients {
      width: 100%;
      justify-content: space-between;
    }
  }
}
</style>