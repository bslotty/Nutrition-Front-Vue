<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMealStore } from "../data/Meal.store";
import { Meal } from "../models/Meal";
import { DailyIntake } from "../models/DailyIntake";
import type { DailyGoals } from "../components/DailyGoalsSummary.vue";
import { FilterOptions } from '@/modules/core/models/filter_options';
import { FilterOptionsRange } from '@/modules/core/models/filter_options_range';
import { GChart } from 'vue-google-charts';
import DailyIntakeCard from '../components/DailyIntakeCard.vue';
import DailyGoalsSummary from '../components/DailyGoalsSummary.vue';
import HeaderRow from '@/modules/core/components/HeaderRow.vue';
import FilterBar from '@/modules/core/components/FilterBar.vue';
import ListContainer from '@/modules/core/components/ListContainer.vue';
import Button from '@/modules/core/components/Button.vue';

// Reactive state
const loading = ref(false);
const dailyIntakes = ref<DailyIntake[]>([]);
const dailyGoals = ref<DailyGoals>({
  calories: 2000,
  protein: 225,
  fat: 111,
  carbs: 25,
  fiber: 25,
  sodium: 3500
});

// Initialize filter options
const options = ref(new FilterOptions()
  .setPreset('all')
  .setRange(new FilterOptionsRange(
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date()
  ))
);

// Chart data
const calorieChartData = ref<any[][]>([]);
const macroChartData = ref<any[][]>([]);

// Composables
const router = useRouter();
const $meals = useMealStore();

// Computed properties
const filteredIntakes = computed(() => {
  let filtered = dailyIntakes.value;
  
  if (options.value.search) {
    const term = options.value.search.toLowerCase();
    filtered = filtered.filter(intake => 
      intake.meals.some(meal => 
        meal.name.toLowerCase().includes(term)
      )
    );
  }
  
  return filtered;
});

// Initialize on mount
onMounted(async () => {
  await loadMeals();
});

async function loadMeals() {
  try {
    loading.value = true;
    await $meals.getList();
    processIntakes();
    initializeCharts();
  } catch (error) {
    // Failed to load meals
  } finally {
    loading.value = false;
  }
}

function processIntakes() {
  if (!options.value.range || !options.value.range.active) return;

  const intakes: DailyIntake[] = [];
  const startDate = options.value.range.start;
  const endDate = options.value.range.end;

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(endDate);
    currentDate.setDate(endDate.getDate() - i);
    currentDate.setHours(0, 0, 0, 0);

    const intake = new DailyIntake(currentDate);

    const dayMeals = $meals.list.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === currentDate.getTime();
    });

    intake.setMeals(dayMeals);
    intake.calculateTotals();
    intakes.push(intake);
  }

  dailyIntakes.value = intakes;
}

function initializeCharts() {
  calorieChartData.value = [['Date', 'Calories']];
  macroChartData.value = [['Date', 'Protein', 'Fat', 'Carbs']];
  
  dailyIntakes.value
    .filter(intake => intake.totals.calories > 0)
    .reverse()
    .forEach(intake => {
      const date = new Date(intake.date.getFullYear(), intake.date.getMonth(), intake.date.getDate());
      
      calorieChartData.value.push([
        date,
        Math.round(intake.totals.calories)
      ]);
      
      macroChartData.value.push([
        date,
        Math.round(intake.totals.protein),
        Math.round(intake.totals.fat),
        Math.round(intake.totals.carbs)
      ]);
    });
}

function createMeal() {
  const newMealId = `create_${Math.floor(Math.random() * 100000000)}`;
  router.push({ name: 'meal-detail', params: { id: newMealId } });
}

function viewMeal(meal: Meal) {
  router.push({ name: 'meal-detail', params: { id: meal.id } });
}

function addMealForDate(date: Date) {
  const newMealId = `create_${Math.floor(Math.random() * 100000000)}`;
  router.push({ name: 'meal-detail', params: { id: newMealId } });
}

function refresh() {
  loadMeals();
}

function handleEditGoals() {
  // TODO: Implement goals editing
}

function handleFilterChange() {
  processIntakes();
  initializeCharts();
}
</script>

<template>
  <div class="intake-list">
    <!-- Header Row -->
    <HeaderRow>
      <template #title>Daily Intake</template>
      <template #actions>
        <Button
          label="Meal"
          icon="pi pi-plus"
          severity="success"
          @click="createMeal()"
        />
      </template>
    </HeaderRow>

    <!-- Filter Bar -->
    <FilterBar :options="options" @filter-changed="handleFilterChange" @refresh="refresh" />

    <!-- Charts Section -->
    <div v-if="calorieChartData.length > 1 && macroChartData.length > 1" class="charts-section mb-5">
      <div class="chart-container mb-4">
        <GChart type="LineChart" :data="calorieChartData" :options="{ 
          height: 300,
          backgroundColor: 'transparent',
          colors: ['#2960c7'],
          legend: { position: 'top' },
          hAxis: { format: 'MMM d' },
          chartArea: { width: '90%', height: '70%' }
        }" />
      </div>
      
      <div class="chart-container">
        <GChart type="LineChart" :data="macroChartData" :options="{ 
          height: 300,
          backgroundColor: 'transparent',
          colors: ['#4CAF50', '#2196F3', '#FFA000'],
          legend: { position: 'top' },
          hAxis: { format: 'MMM d' },
          chartArea: { width: '90%', height: '70%' }
        }" />
      </div>
    </div>

    <!-- Goals Summary -->
    <DailyGoalsSummary 
      v-if="filteredIntakes.length > 0 && filteredIntakes[0].hasMeals"
      :intake="filteredIntakes[0]"
      :goals="dailyGoals"
      :showSecondaryNutrients="false"
      @edit-goals="handleEditGoals"
    />

    <!-- Daily Intakes List -->
    <ListContainer 
      :loading="loading" 
      :items="filteredIntakes"
    >
      <template #list-item="{ item }">
        <DailyIntakeCard 
          :intake="item"
          @meal-click="viewMeal"
          @add-meal="addMealForDate"
        />
      </template>
    </ListContainer>
  </div>
</template>