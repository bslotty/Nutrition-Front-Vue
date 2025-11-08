<script setup lang="ts">
import type { Exercise } from '@/modules/exercise/models/Exercise';
import { ExerciseName } from '@/modules/exercise/enums/ExerciseNames';

const props = defineProps<{
    exercise: Exercise;
}>();

const emit = defineEmits<{
    (e: 'click', exercise: Exercise): void;
}>();

function handleClick() {
    emit('click', props.exercise);
}

// Convert enum index to string
const exerciseName = ExerciseName[props.exercise.name];
</script>

<template>
    <div class="exercise-card" @click="handleClick">
        <!-- Exercise Name -->
        <div class="flex justify-center px-2 py-2 border-b border-gray-200">
            <h4 class="m-0 text-lg font-semibold">{{ exerciseName }}</h4>
        </div>

        <!-- Weight, Sets, Reps Row -->
        <div class="flex justify-around px-2 py-3">
            <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium">Weight</span>
                <span class="text-2xl font-bold">{{ exercise.weight }}</span>
            </div>

            <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium">Sets</span>
                <span class="text-2xl font-bold">{{ exercise.sets }}</span>
            </div>

            <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium">Reps</span>
                <span class="text-2xl font-bold">{{ exercise.reps }}</span>
            </div>
        </div>

        <!-- Total Weight -->
        <div class="flex justify-center px-2 py-2 border-t border-gray-200">
            <div class="flex flex-col items-center gap-1">
                <span class="text-xs text-gray-500 font-medium">Total Volume</span>
                <h3 class="m-0 text-xl font-bold text-primary">{{ exercise.getTotalWeightMoved() }} lbs</h3>
            </div>
        </div>
    </div>
</template>

<style scoped>
.exercise-card {
    cursor: pointer;
    border-radius: 8px;
    background: var(--surface-card);
    box-shadow: 0px 3px 3px -2px rgba(0, 0, 0, 0.2),
                0px 3px 4px 0px rgba(0, 0, 0, 0.14),
                0px 1px 8px 0px rgba(0, 0, 0, 0.12);
    transition: all 0.2s ease-out;
}

.exercise-card:hover {
    transform: translateY(-2px);
    box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
                0px 8px 10px 1px rgba(0, 0, 0, 0.14),
                0px 3px 14px 2px rgba(0, 0, 0, 0.12);
}
</style>