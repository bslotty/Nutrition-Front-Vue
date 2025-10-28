<script lang="ts" setup>
import { computed } from "vue";
import type { DailyIntake } from "../models/DailyIntake";
import type { Meal } from "../models/Meal";
import Card from 'primevue/card';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import MealPartItem from "./MealPartItem.vue";
import MealTotalsBar from "./MealTotalsBar.vue";

interface Props {
  intake: DailyIntake;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  mealClick: [meal: Meal];
  addMeal: [date: Date];
}>();

const formattedDate = computed(() => {
  return props.intake.date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
});

function handleMealClick(meal: Meal) {
  emit('mealClick', meal);
}

function handleAddMeal() {
  emit('addMeal', props.intake.date);
}
</script>

<template>
  <Card class="daily-intake-card">
    <template #header>
      <div class="intake-header p-3 bg-primary-50">
        <div class="flex justify-content-between align-items-center mb-3">
          <h4 class="m-0">{{ formattedDate }}</h4>
          <Button 
            label="Add Meal" 
            icon="pi pi-plus" 
            size="small" 
            outlined 
            severity="success" 
            @click="handleAddMeal" 
          />
        </div>
        
        <MealTotalsBar 
          :totals="intake.totals" 
          :showBreakdown="true" 
          size="medium" 
        />
      </div>
    </template>

    <template #content>
      <div v-if="intake.meals.length === 0" class="empty-state text-center p-5">
        <i class="pi pi-info-circle text-4xl text-gray-400 mb-3"></i>
        <p class="text-gray-600 m-0">No meals recorded for this day</p>
        <Button 
          label="Add First Meal" 
          icon="pi pi-plus" 
          severity="success" 
          class="mt-3" 
          @click="handleAddMeal" 
        />
      </div>

      <div v-else class="meals-list">
        <div 
          v-for="(meal, index) in intake.meals" 
          :key="meal.id" 
          class="meal-section"
        >
          <div 
            class="meal-header p-3 cursor-pointer hover:bg-gray-50 border-round transition-colors" 
            @click="handleMealClick(meal)"
          >
            <div class="flex justify-content-between align-items-center">
              <h5 class="m-0">{{ meal.name }}</h5>
              <Button 
                icon="pi pi-chevron-right" 
                text 
                rounded 
                size="small" 
                severity="secondary" 
              />
            </div>
          </div>
          
          <div v-if="meal.parts && meal.parts.length > 0" class="meal-parts ml-3">
            <MealPartItem 
              v-for="part in meal.parts" 
              :key="part.id" 
              :part="part" 
              @view-details="handleMealClick(meal)" 
            />
          </div>

          <div v-if="meal.parts && meal.parts.length > 1" class="meal-totals-section mt-3 ml-3">
            <div class="totals-label text-sm font-semibold text-gray-600 mb-2">Meal Totals</div>
            <MealTotalsBar 
              :totals="meal.totals" 
              :showBreakdown="false" 
              size="small" 
            />
          </div>
          
          <Divider v-if="index < intake.meals.length - 1" />
        </div>
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.daily-intake-card {
  margin-bottom: 1.5rem;
  
  .intake-header {
    border-bottom: 1px solid var(--surface-border);
  }
  
  .meal-section {
    .meal-parts {
      padding-left: 0.5rem;
      border-left: 2px solid var(--surface-border);
    }
    
    .meal-totals-section {
      padding: 1rem;
      background: var(--surface-50);
      border-radius: var(--border-radius);
    }
  }
  
  .empty-state {
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
</style>