<script lang="ts" setup>
import { ref, computed } from "vue";
import type { Part } from "@/modules/food/models/Part";
import Button from 'primevue/button';
import RecipeIngredientsList from "../components/RecipeIngredientsList.vue";
import FoodTypeBadge from "../components/FoodTypeBadge.vue";

interface Props {
  part: Part;
  showExpanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showExpanded: false
});

const emit = defineEmits<{
  viewDetails: [part: Part];
}>();

const expanded = ref(props.showExpanded);

const isRecipe = computed(() => props.part.food.type === 'compound');

const calories = computed(() => {
  const nutrients = props.part.food.calculateNutrients(props.part.amount, props.part.unit);
  return Math.round(nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9);
});

const nutrients = computed(() => {
  return props.part.food.calculateNutrients(props.part.amount, props.part.unit);
});

function toggleExpanded() {
  if (isRecipe.value) {
    expanded.value = !expanded.value;
  }
}

function handleClick() {
  emit('viewDetails', props.part);
}
</script>

<template>
  <div class="meal-part-item">
    <div class="part-main flex align-items-center gap-2 px-2 py-2 border-round hover:bg-gray-50 cursor-pointer" @click="toggleExpanded">
      <i v-if="isRecipe" class="pi transition-transform" :class="expanded ? 'pi-chevron-down' : 'pi-chevron-right'" style="font-size: 0.75rem;"></i>
      <div v-else style="width: 12px;"></div>
      
      <div class="flex-1">
        <div class="flex align-items-center gap-2">
          <span class="font-medium">{{ part.food.name }}</span>
          <FoodTypeBadge :type="part.food.type" size="small" />
        </div>
        <div v-if="part.food.brand" class="text-xs text-gray-500">{{ part.food.brand }}</div>
      </div>
      
      <div class="amount text-sm text-gray-600">{{ part.amount }} {{ part.unit }}</div>
      
      <div class="calories text-sm font-semibold" style="min-width: 70px; text-align: right;">{{ calories }} cal</div>
      
      <div class="macros text-xs text-gray-500" style="min-width: 150px; text-align: right;">
        <span style="color: #4CAF50;">P: {{ nutrients.protein.toFixed(1) }}g</span>
        <span class="mx-1">•</span>
        <span style="color: #2196F3;">F: {{ nutrients.fat.toFixed(1) }}g</span>
        <span class="mx-1">•</span>
        <span style="color: #FFA000;">C: {{ nutrients.carbs.toFixed(1) }}g</span>
      </div>
      
      <Button icon="pi pi-external-link" text rounded size="small" severity="secondary" @click.stop="handleClick" aria-label="View details" />
    </div>
    
    <div v-if="isRecipe && expanded" class="recipe-details ml-5 mt-2">
      <RecipeIngredientsList :parts="part.food.parts" :servingMultiplier="part.amount / part.food.serving.size" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.meal-part-item {
  .part-main {
    transition: background-color 0.2s;
  }
  
  .recipe-details {
    padding-left: 1rem;
    border-left: 2px solid var(--surface-border);
  }
}
</style>