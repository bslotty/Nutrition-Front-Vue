<script lang="ts" setup>
import { computed } from "vue";
import type { DailyIntake } from "../models/DailyIntake";
import Card from 'primevue/card';
import Button from 'primevue/button';
import NutrientGoalProgress from "./NutrientGoalProgress.vue";

export interface DailyGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sodium?: number;
}

interface Props {
  intake: DailyIntake;
  goals: DailyGoals;
  showSecondaryNutrients?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showSecondaryNutrients: true
});

const emit = defineEmits<{
  editGoals: [];
}>();

const overallProgress = computed(() => {
  const nutrients = ['calories', 'protein', 'fat', 'carbs'];
  let onTrackCount = 0;
  
  nutrients.forEach(nutrient => {
    const current = props.intake.totals[nutrient as keyof typeof props.intake.totals] as number;
    const goal = props.goals[nutrient as keyof DailyGoals] as number;
    const percentage = goal > 0 ? (current / goal) * 100 : 0;
    
    if (percentage >= 70 && percentage <= 110) {
      onTrackCount++;
    }
  });
  
  return Math.round((onTrackCount / nutrients.length) * 100);
});

const overallStatus = computed(() => {
  if (overallProgress.value >= 75) return 'excellent';
  if (overallProgress.value >= 50) return 'good';
  if (overallProgress.value >= 25) return 'fair';
  return 'needs-attention';
});

const statusConfig = computed(() => {
  switch (overallStatus.value) {
    case 'excellent':
      return { color: '#4CAF50', label: 'Excellent', icon: 'pi-check-circle' };
    case 'good':
      return { color: '#2196F3', label: 'Good', icon: 'pi-thumbs-up' };
    case 'fair':
      return { color: '#FFA000', label: 'Fair', icon: 'pi-exclamation-circle' };
    default:
      return { color: '#F44336', label: 'Needs Attention', icon: 'pi-exclamation-triangle' };
  }
});

function handleEditGoals() {
  emit('editGoals');
}
</script>

<template>
  <Card class="daily-goals-summary mb-4">
    <template #header>
      <div class="goals-header p-3 flex justify-content-between align-items-center">
        <div class="flex align-items-center gap-2">
          <h5 class="m-0">Daily Goals</h5>
          <i 
            class="pi text-xl" 
            :class="statusConfig.icon" 
            :style="{ color: statusConfig.color }"
          ></i>
          <span 
            class="status-badge text-sm px-2 py-1 border-round" 
            :style="{ 
              backgroundColor: `${statusConfig.color}20`, 
              color: statusConfig.color 
            }"
          >
            {{ statusConfig.label }}
          </span>
        </div>
        
        <Button 
          label="Edit Goals" 
          icon="pi pi-cog" 
          text 
          size="small" 
          @click="handleEditGoals" 
        />
      </div>
    </template>

    <template #content>
      <div class="primary-nutrients mb-4">
        <h6 class="text-gray-600 mb-3">Primary Nutrients</h6>
        <div class="goals-grid">
          <NutrientGoalProgress 
            :current="intake.totals.calories" 
            :goal="goals.calories" 
            label="Calories" 
            unit="cal" 
            color="#2960c7" 
          />
          <NutrientGoalProgress 
            :current="intake.totals.protein" 
            :goal="goals.protein" 
            label="Protein" 
            unit="g" 
            color="#4CAF50" 
          />
          <NutrientGoalProgress 
            :current="intake.totals.fat" 
            :goal="goals.fat" 
            label="Fat" 
            unit="g" 
            color="#2196F3" 
          />
          <NutrientGoalProgress 
            :current="intake.totals.carbs" 
            :goal="goals.carbs" 
            label="Carbs" 
            unit="g" 
            color="#FFA000" 
          />
        </div>
      </div>
      
      <div 
        v-if="showSecondaryNutrients && (goals.fiber || goals.sodium)" 
        class="secondary-nutrients"
      >
        <h6 class="text-gray-600 mb-3">Secondary Nutrients</h6>
        <div class="goals-grid">
          <NutrientGoalProgress 
            v-if="goals.fiber" 
            :current="intake.totals.fiber" 
            :goal="goals.fiber" 
            label="Fiber" 
            unit="g" 
            color="#9C27B0" 
          />
          <NutrientGoalProgress 
            v-if="goals.sodium" 
            :current="intake.totals.sodium" 
            :goal="goals.sodium" 
            label="Sodium" 
            unit="mg" 
            color="#795548" 
          />
        </div>
      </div>
      
      <div 
        class="overall-summary mt-4 p-3 border-round" 
        :style="{ 
          backgroundColor: 'var(--surface-50)', 
          borderLeft: `4px solid ${statusConfig.color}` 
        }"
      >
        <div class="flex justify-content-between align-items-center">
          <span class="font-medium">Overall Goal Progress</span>
          <span 
            class="font-bold text-xl" 
            :style="{ color: statusConfig.color }"
          >
            {{ overallProgress }}%
          </span>
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.daily-goals-summary {
  .goals-header {
    background: var(--surface-50);
    border-bottom: 1px solid var(--surface-border);
  }
  
  .goals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .status-badge {
    font-weight: 600;
  }
  
  .overall-summary {
    border: 1px solid var(--surface-border);
  }
}
</style>