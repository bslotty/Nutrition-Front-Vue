<script setup lang="ts">
import type { Exercise } from '@/modules/exercise/models/Exercise';

const props = defineProps<{
    exercise: Exercise;
}>();

const emit = defineEmits<{
    (e: 'click', exercise: Exercise): void;
}>();

function handleClick() {
    emit('click', props.exercise);
}
</script>

<template>
    <div class="f-row fd-col a-center p-2 bg-light card" @click="handleClick">
        <div>
            <h4>{{ exercise.name }}</h4>
        </div>

        <div class="f-row">
            <div class="f-row fd-col p-1">
                <label>Weight</label>
                <label><b>{{ exercise.weight }}</b></label>
            </div>

            <div class="f-row fd-col p-1">
                <label>Sets</label>
                <label><b>{{ exercise.sets }}</b></label>
            </div>

            <div class="f-row fd-col p-1">
                <label>Reps</label>
                <label><b>{{ exercise.reps }}</b></label>
            </div>
        </div>

        <div class="j-center">
            <h3>{{ exercise.getTotalWeightMoved() }} lbs</h3>
        </div>
    </div>
</template>

<style scoped>
.card {
    cursor: pointer;
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>