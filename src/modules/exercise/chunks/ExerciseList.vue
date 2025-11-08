<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExerciseStore } from '../data/Exercise.store';
import ExerciseCard from '../components/ExerciseCard.vue';
import type { Exercise } from '../models/Exercise';
import { FilterOptions } from '@/modules/core/models/filter_options';
import { FilterOptionsRange } from '@/modules/core/models/filter_options_range';
import { MatColor } from '@/modules/core/enums/mat_color';
import Icon from '@/modules/core/components/Icon.vue';
import HeaderRow from '@/modules/core/components/HeaderRow.vue';
import FilterBar from '@/modules/core/components/FilterBar.vue';
import ListContainer from '@/modules/core/components/ListContainer.vue';
import Button from '@/modules/core/components/Button.vue';

const router = useRouter();
const exerciseStore = useExerciseStore();

// Initialize filter options
const options = ref(
  new FilterOptions()
    .setPreset('all')
    .setRange(
      new FilterOptionsRange(
        new Date(new Date().setDate(new Date().getDate() - 7)),
        new Date()
      )
    )
);

// Computed properties
const workoutList = computed(() => exerciseStore.filteredWorkouts);
const isLoading = computed(() => exerciseStore.loading);
const error = computed(() => exerciseStore.error);

// Lifecycle
onMounted(async () => {
  await loadData();
});

// Methods
async function loadData() {
  await exerciseStore.getList();
  applyFilters();
}

function applyFilters() {
  if (options.value.range) {
    exerciseStore.setDateRange(options.value.range.start, options.value.range.end);
  }
  if (options.value.search) {
    exerciseStore.setSearchQuery(options.value.search);
  }
}

function handleFilterChange() {
  applyFilters();
}

async function refresh() {
  await loadData();
}

function goToExercise(exercise: Exercise) {
  exerciseStore.selectExercise(exercise);
  router.push({ name: 'exercise-details', params: { id: exercise.id } });
}

function createNewExercise() {
  const newExercise = exerciseStore.createNewExercise();
  exerciseStore.selectExercise(newExercise);
  router.push({ name: 'exercise-details', params: { id: 'create' } });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}
</script>

<template>
  <div class="exercise-list">
    <!-- Header Row -->
    <HeaderRow>
      <template #title>Exercise List</template>
      <template #actions>
        <Button
          label="Exercise"
          icon="pi pi-plus"
          severity="success"
          @click="createNewExercise()"
          :disabled="isLoading"
        />
      </template>
    </HeaderRow>

    <!-- Filter Bar -->
    <FilterBar
      :options="options"
      :show-sort="false"
      @filter-changed="handleFilterChange"
      @refresh="refresh"
    />

    <!-- Workout List -->
    <ListContainer 
      :loading="isLoading" 
      :items="workoutList"
      list-class="workout-list"
      empty-message="No workouts found"
      empty-icon="fitness_center"
    >
      <!-- Error Message -->
      <template #message v-if="error">
        <div class="error-message" role="alert">
          <Icon name="error" :color="MatColor.warn" />
          <span>{{ error }}</span>
        </div>
      </template>

      <!-- Workout Items -->
      <template #list-item="{ item: workout }">
        <div class="workout-card">
          <!-- Workout Header -->
          <div class="workout-header">
            <h3 class="date-label">{{ formatDate(workout.date) }}</h3>
            <span class="workout-stats">
              {{ workout.getTotalExercises() }} exercises • 
              {{ workout.getTotalVolume().toLocaleString() }} lbs total
            </span>
          </div>

          <hr class="divider" />

          <!-- Exercise Grid -->
          <div v-if="!workout.isEmpty()" class="exercise-grid">
            <ExerciseCard 
              v-for="exercise in workout.exercises" 
              :key="exercise.id" 
              :exercise="exercise"
              @click="goToExercise(exercise)" 
            />
          </div>

          <!-- Empty State for Workout -->
          <div v-else class="empty-state-workout">
            <Icon name="fitness_center" :color="MatColor.primary" :size="32" />
            <p>No exercises for this day</p>
          </div>
        </div>
      </template>
    </ListContainer>
  </div>
</template>

<style scoped>

/* Workout Card */
.workout-card {
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  gap: 1rem;
}

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.date-label {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary, #212121);
}

.workout-stats {
  font-size: 0.875rem;
  color: var(--text-secondary, #757575);
}

.divider {
  border: none;
  border-top: 1px solid var(--divider-color, #e0e0e0);
  margin: 0;
}

/* Exercise Grid */
.exercise-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
</style>