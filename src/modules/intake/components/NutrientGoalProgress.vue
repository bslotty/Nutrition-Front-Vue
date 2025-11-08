<script lang="ts" setup>
import { computed } from "vue";
import ProgressBar from 'primevue/progressbar';

interface Props {
  current: number;
  goal: number;
  label: string;
  unit?: string;
  color?: string;
  showPercentage?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  unit: 'g',
  color: '#2960c7',
  showPercentage: true
});

const percentage = computed(() => {
  if (props.goal === 0) return 0;
  return Math.round((props.current / props.goal) * 100);
});

const progressStatus = computed(() => {
  const pct = percentage.value;
  if (pct < 70) return 'under';
  if (pct >= 70 && pct <= 110) return 'on-track';
  return 'over';
});

const progressColor = computed(() => {
  switch (progressStatus.value) {
    case 'under': return '#FFA000';
    case 'on-track': return '#4CAF50';
    case 'over': return '#F44336';
    default: return props.color;
  }
});

const statusLabel = computed(() => {
  switch (progressStatus.value) {
    case 'under': return 'Below Goal';
    case 'on-track': return 'On Track';
    case 'over': return 'Over Goal';
    default: return '';
  }
});

const remainingAmount = computed(() => {
  const remaining = props.goal - props.current;
  return remaining > 0 ? remaining : 0;
});
</script>

<template>
  <div class="nutrient-goal-progress">
    <div class="mb-2">
      <span class="label font-medium" :style="{ color: color }">{{ label }}</span>
    </div>

    <ProgressBar
      :value="percentage"
      :show-value="false"
      :style="{
        '--p-progressbar-value-background': progressColor,
        height: '1rem'
      }"
    />

    <div class="flex justify-content-between align-items-center mt-2 text-sm">
      <div class="values">
        <span class="current font-semibold" :style="{ color: progressColor }">
          {{ current.toFixed(1) }}
        </span>
        <span class="separator text-gray-400 mx-1">/</span>
        <span class="goal text-gray-600">{{ goal.toFixed(1) }}</span>
      </div>
      <span class="unit text-gray-600 font-medium">{{ unit }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nutrient-goal-progress {
  .status-label {
    padding: 0.125rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
    
    &.status-under {
      background: rgba(255, 160, 0, 0.1);
      color: #FFA000;
    }
    
    &.status-on-track {
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
    }
    
    &.status-over {
      background: rgba(244, 67, 54, 0.1);
      color: #F44336;
    }
  }
  
  :deep(.p-progressbar) {
    border-radius: 0.5rem;
    overflow: hidden;
    
    .p-progressbar-value {
      transition: width 0.3s ease;
    }
  }
}
</style>