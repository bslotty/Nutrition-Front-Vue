<script lang="ts" setup>
import { ref, computed } from "vue";
import type { DailyIntake } from "../models/DailyIntake";
import type { Meal } from "../models/Meal";
import type { Part } from "@/modules/food/models/Part";
import Card from 'primevue/card';
import Button from 'primevue/button';
import NutrientSummary from "@/modules/core/components/NutrientSummary.vue";

interface Props {
  intake: DailyIntake;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  mealClick: [meal: Meal];
  addMeal: [date: Date];
}>();

const expanded = ref(true);

const formattedDate = computed(() => {
  return props.intake.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
});

function toggleExpand() {
  expanded.value = !expanded.value;
}

function handleMealClick(meal: Meal) {
  emit('mealClick', meal);
}

function handleAddMeal() {
  emit('addMeal', props.intake.date);
}

function getNutrients(part: Part) {
  return part.food.calculateNutrients(part.amount, part.unit);
}
</script>

<template>
  <div class="mb-6">
      <!-- Day Header Row -->
      <div class="intake-header-row">
        <h4 class="m-0 text-xl font-semibold">{{ formattedDate }}</h4>
        <NutrientSummary :nutrients="intake.totals" size="large" />
        <div class="action-cell">
          <Button
            :icon="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
            text
            rounded
            @click="toggleExpand"
            aria-label="Toggle expand"
          />
        </div>
      </div>

      <!-- Meals -->
      <div v-if="expanded">
        <div v-if="intake.meals.length === 0" class="px-8 py-8 text-center flex flex-col items-center">
          <p class="text-gray-600 m-0">No meals recorded for this day</p>
          <Button
            label="Add Meal"
            icon="pi pi-plus"
            severity="success"
            size="small"
            class="mt-2"
            @click="handleAddMeal"
          />
        </div>

        <div v-else>
          <div
            v-for="meal in intake.meals"
            :key="meal.id"
            class="mb-2 last:mb-0"
          >
            <!-- Meal Header Row -->
            <div class="meal-header-row">
              <h5 class="m-0 text-lg font-semibold">{{ meal.name }}</h5>
              <NutrientSummary :nutrients="meal.totals" size="large" />
              <div class="action-cell">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="primary"
                  @click="handleMealClick(meal)"
                  aria-label="Edit meal"
                />
              </div>
            </div>

            <!-- Meal Parts/Contents -->
            <div v-if="meal.parts && meal.parts.length > 0" class="bg-white">
              <div
                v-for="part in meal.parts"
                :key="part.id"
                class="part-row"
              >
                <div class="flex flex-col gap-1">
                  <span class="font-medium">{{ part.food.name }}</span>
                  <span v-if="part.food.brand" class="text-sm text-gray-500">{{ part.food.brand }}</span>
                </div>
                <NutrientSummary :nutrients="getNutrients(part)" size="large" />
                <div class="action-cell"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
:deep(.p-card-content) {
  padding: 0 !important;
}

.intake-header-row,
.meal-header-row,
.part-row {
  display: grid;
  grid-template-columns: 3fr 0.5fr 0.5fr 0.5fr 0.5fr 60px;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 0rem;
  border-bottom: 1px solid var(--surface-border);
}

.intake-header-row {
  background: var(--bg-light);
  border-bottom: 3px solid #333 !important;
  font-weight: 600;
  align-items: flex-end;
}

.intake-header-row > *:first-child {
  padding-left: 0;
}

.meal-header-row {
  background: var(--surface-50);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  align-items: flex-end;
}

.meal-header-row > *:first-child {
  padding-left: 1rem;
}

.part-row {
  border-bottom: 1px solid var(--surface-border);
  transition: background-color 0.2s;
}

.part-row > *:first-child {
  padding-left: 3rem;
}

.part-row:hover {
  background: var(--surface-hover);
}

.action-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

