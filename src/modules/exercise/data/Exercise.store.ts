// ============================================================================
// Modules/Exercise/Stores/Exercise.store.ts
// ============================================================================

import { ref, computed, watch, readonly } from "vue";
import { defineStore } from "pinia";
import type { ExerciseName } from "../enums/ExerciseNames";
import type { ExerciseType } from "../enums/ExerciseTypes";
import { Exercise } from "../models/Exercise";
import { ExerciseService } from "./ExerciseService";

export const useExerciseStore = defineStore("exercises", () => {
  // Service instance
  const exerciseService = new ExerciseService();
  
  // Reactive state
  const list = ref<Exercise[]>([]);
  const selectedExercise = ref<Exercise | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
  // Filter state
  const dateRange = ref<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date()
  });
  const searchQuery = ref<string>('');
  const selectedType = ref<ExerciseType | null>(null);
  const selectedName = ref<ExerciseName | null>(null);

  // Computed properties
  const exerciseCount = computed(() => list.value.length);
  
  const filteredList = computed(() => {
    let filtered = [...list.value];
    
    // Date range filter
    if (dateRange.value.start && dateRange.value.end) {
      filtered = filtered.filter(exercise => {
        const exerciseDate = new Date(exercise.date);
        return exerciseDate >= dateRange.value.start && exerciseDate <= dateRange.value.end;
      });
    }
    
    // Search filter
    if (searchQuery.value) {
      filtered = exerciseService.searchExercises(searchQuery.value);
    }
    
    // Type filter
    if (selectedType.value !== null) {
      filtered = filtered.filter(exercise => exercise.activity === selectedType.value);
    }
    
    // Name filter
    if (selectedName.value !== null) {
      filtered = filtered.filter(exercise => exercise.name === selectedName.value);
    }
    
    return filtered;
  });

  const filteredWorkouts = computed(() => {
    if (!dateRange.value.start || !dateRange.value.end) {
      return [];
    }

    // Group exercises by date
    const workoutMap = new Map<string, any>();
    
    filteredList.value.forEach(exercise => {
      const dateKey = exercise.date.toISOString().split('T')[0];
      
      if (!workoutMap.has(dateKey)) {
        const workoutDate = new Date(exercise.date);
        workoutDate.setHours(0, 0, 0, 0);
        
        workoutMap.set(dateKey, {
          date: workoutDate,
          exercises: [],
          getTotalExercises: function() { return this.exercises.length; },
          getTotalVolume: function() { return this.exercises.reduce((sum: number, ex: any) => sum + ex.getTotalWeightMoved(), 0); },
          isEmpty: function() { return this.exercises.length === 0; }
        });
      }
      
      workoutMap.get(dateKey)!.exercises.push(exercise);
    });

    return Array.from(workoutMap.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  });

  const totalVolume = computed(() => {
    return filteredList.value.reduce((sum, exercise) => sum + exercise.getTotalWeightMoved(), 0);
  });

  const uniqueTypes = computed(() => {
    return [...new Set(list.value.map(exercise => exercise.activity))];
  });

  const uniqueNames = computed(() => {
    return [...new Set(list.value.map(exercise => exercise.name))];
  });

  // Actions
  async function getList(start = 0, count = 25, forceRefresh = false): Promise<void> {
    // Return cached data if available and not forcing refresh
    if (list.value.length > 0 && !forceRefresh) {
      return Promise.resolve();
    }

    loading.value = true;
    error.value = null;

    try {
      const exercises = await exerciseService.getListFromServer(start, count);
      list.value = exercises;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load exercises';
    } finally {
      loading.value = false;
    }
  }

  async function getExerciseById(id: string): Promise<Exercise | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const exercise = await exerciseService.getByID(id);
      selectedExercise.value = exercise;
      return exercise;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load exercise';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createExercise(exercise: Exercise): Promise<Exercise | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const createdExercise = await exerciseService.createExercise(exercise);
      list.value.push(createdExercise);
      return createdExercise;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create exercise';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateExercise(exercise: Exercise): Promise<Exercise | null> {
    loading.value = true;
    error.value = null;
    
    try {
      const updatedExercise = await exerciseService.updateExercise(exercise);
      const index = list.value.findIndex(e => e.id === updatedExercise.id);
      if (index !== -1) {
        list.value[index] = updatedExercise;
      }
      if (selectedExercise.value?.id === updatedExercise.id) {
        selectedExercise.value = updatedExercise;
      }
      return updatedExercise;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update exercise';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteExercise(exercise: Exercise): Promise<boolean> {
    loading.value = true;
    error.value = null;
    
    try {
      await exerciseService.deleteExercise(exercise);
      list.value = list.value.filter(e => e.id !== exercise.id);
      if (selectedExercise.value?.id === exercise.id) {
        selectedExercise.value = null;
      }
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete exercise';
      return false;
    } finally {
      loading.value = false;
    }
  }

  // Filter actions
  function setDateRange(start: Date, end: Date): void {
    dateRange.value = { start, end };
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query;
  }

  function setTypeFilter(type: ExerciseType | null): void {
    selectedType.value = type;
  }

  function setNameFilter(name: ExerciseName | null): void {
    selectedName.value = name;
  }

  function clearFilters(): void {
    searchQuery.value = '';
    selectedType.value = null;
    selectedName.value = null;
  }

  // Utility actions
  function selectExercise(exercise: Exercise): void {
    selectedExercise.value = exercise;
  }

  function clearSelection(): void {
    selectedExercise.value = null;
  }

  function createNewExercise(date?: Date): Exercise {
    const id = `exercise_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return new Exercise(id, date || new Date());
  }

  function clearError(): void {
    error.value = null;
  }

  // Statistics
  function getPersonalRecord(exerciseName: ExerciseName): number {
    return exerciseService.getPersonalRecord(exerciseName);
  }

  function getAverageWeight(exerciseName: ExerciseName): number {
    return exerciseService.getAverageWeight(exerciseName);
  }


  // Return store interface
  return {
    // State
    list: readonly(list),
    selectedExercise: readonly(selectedExercise),
    loading: readonly(loading),
    error: readonly(error),
    
    // Filter state
    dateRange: readonly(dateRange),
    searchQuery: readonly(searchQuery),
    selectedType: readonly(selectedType),
    selectedName: readonly(selectedName),
    
    // Computed
    exerciseCount,
    filteredList,
    filteredWorkouts,
    totalVolume,
    uniqueTypes,
    uniqueNames,
    
    // Actions
    getList,
    getExerciseById,
    createExercise,
    updateExercise,
    deleteExercise,
    
    // Filters
    setDateRange,
    setSearchQuery,
    setTypeFilter,
    setNameFilter,
    clearFilters,
    
    // Utilities
    selectExercise,
    clearSelection,
    createNewExercise,
    clearError,
    getPersonalRecord,
    getAverageWeight
  };
});