<script lang="ts" setup>
import { computed } from "vue";
import type { FoodType } from "@/modules/food/interfaces/FoodType";

interface Props {
  type: FoodType;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'small',
  showIcon: true
});

const isRecipe = computed(() => props.type === 'compound');

const badgeConfig = computed(() => {
  if (isRecipe.value) {
    return {
      label: 'Recipe',
      color: '#9C27B0',
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
      icon: 'pi-book'
    };
  } else {
    return {
      label: 'Food',
      color: '#248513',
      backgroundColor: 'rgba(36, 133, 19, 0.1)',
      icon: 'pi-shopping-bag'
    };
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'tiny':
      return { badge: 'text-xs px-1 py-0', icon: 'text-xs' };
    case 'small':
      return { badge: 'text-xs px-2 py-1', icon: 'text-xs' };
    case 'medium':
      return { badge: 'text-sm px-2 py-1', icon: 'text-sm' };
    case 'large':
      return { badge: 'text-base px-3 py-2', icon: 'text-base' };
    default:
      return { badge: 'text-xs px-2 py-1', icon: 'text-xs' };
  }
});
</script>

<template>
  <span 
    class="food-type-badge inline-flex align-items-center gap-1 border-round font-medium" 
    :class="sizeClasses.badge" 
    :style="{ 
      color: badgeConfig.color, 
      backgroundColor: badgeConfig.backgroundColor, 
      border: `1px solid ${badgeConfig.color}40` 
    }"
  >
    <i 
      v-if="showIcon" 
      class="pi" 
      :class="[badgeConfig.icon, sizeClasses.icon]"
    ></i>
    <span>{{ badgeConfig.label }}</span>
  </span>
</template>

<style lang="scss" scoped>
.food-type-badge {
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
}
</style>