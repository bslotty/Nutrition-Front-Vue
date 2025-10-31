<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  protein: number;
  fat: number;
  carbs: number;
}>();

// Calculate total and percentages
const total = computed(() => props.protein + props.fat + props.carbs);
const proteinPercent = computed(() => total.value > 0 ? (props.protein / total.value) * 100 : 0);
const fatPercent = computed(() => total.value > 0 ? (props.fat / total.value) * 100 : 0);
const carbsPercent = computed(() => total.value > 0 ? (props.carbs / total.value) * 100 : 0);
</script>

<template>
  <div class="nutrient-bar">
    <div
      v-if="proteinPercent > 0"
      class="nutrient-segment protein"
      :style="{ width: `${proteinPercent}%` }"
    />
    <div
      v-if="fatPercent > 0"
      class="nutrient-segment fat"
      :style="{ width: `${fatPercent}%` }"
    />
    <div
      v-if="carbsPercent > 0"
      class="nutrient-segment carbs"
      :style="{ width: `${carbsPercent}%` }"
    />
  </div>
</template>

<style scoped>
.nutrient-bar {
  display: flex;
  width: 100%;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
}

.nutrient-segment {
  height: 100%;
  transition: width 0.3s ease;
}

.nutrient-segment.protein {
  background-color: #4CAF50;
}

.nutrient-segment.fat {
  background-color: #2196F3;
}

.nutrient-segment.carbs {
  background-color: #FFA000;
}
</style>
