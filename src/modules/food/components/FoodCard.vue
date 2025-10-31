<script setup lang="ts">
import NutrientBar from "@/modules/core/components/NutrientBar.vue";
import type { Food } from "../models/Food";
import router from "@/router";

const props = defineProps<{ food: Food }>();
const { food } = props;

function view() {
  router.push({ name: "food-details", params: { id: food.id }, replace: true });
}
</script>

<template>
  <div
    @click="view()"
    v-if="food != undefined && food.id != undefined"
    class="food-card"
  >
    <!-- Brand and Name -->
    <div class="flex flex-column gap-1 p-2">
      <span class="text-sm text-color-secondary font-medium">{{ food.brand }}</span>
      <span class="text-lg font-semibold">{{ food.name }}</span>
    </div>

    <!-- Nutrient Summary Bar -->
    <div class="px-2 pb-2">
      <NutrientBar
        :protein="food.nutrients.protein"
        :fat="food.nutrients.fat"
        :carbs="food.nutrients.carbs"
      />
    </div>

    <!-- Nutrient Details -->
    <div class="flex flex-column gap-2 p-2">
      <!-- Row 1: Protein, Fat, Carbs -->
      <div class="grid ">
        <div class="col flex flex-column align-items-center gap-1">
          <span class="text-xs font-medium" style="color: #4CAF50">Protein</span>
          <span class="text-base font-semibold" style="color: #4CAF50">{{ food.nutrients.protein }}g</span>
        </div>
        <div class="col flex flex-column align-items-center gap-1">
          <span class="text-xs font-medium" style="color: #2196F3">Fat</span>
          <span class="text-base font-semibold" style="color: #2196F3">{{ food.nutrients.fat }}g</span>
        </div>
        <div class="col flex flex-column align-items-center gap-1">
          <span class="text-xs font-medium" style="color: #FFA000">Carbs</span>
          <span class="text-base font-semibold" style="color: #FFA000">{{ food.nutrients.carbs }}g</span>
        </div>
      </div>

      <!-- Row 2: Fiber, Sodium, Sugar -->
      <div class="grid">
        <div class="col flex flex-column align-items-center gap-1">
          <span class="text-xs font-medium" style="color: #9C27B0">Fiber</span>
          <span class="text-sm" style="color: #9C27B0">{{ food.nutrients.fiber }}g</span>
        </div>
        <div class="col flex flex-column align-items-center gap-1">
          <span class="text-xs font-medium" style="color: #795548">Sodium</span>
          <span class="text-sm" style="color: #795548">{{ food.nutrients.sodium }}mg</span>
        </div>
        <div class="col flex flex-column align-items-center gap-1">
          <span class="text-xs font-medium" style="color: #F44336">Sugar</span>
          <span class="text-sm" style="color: #F44336">{{ food.nutrients.sugar }}g</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else>Error</div>
</template>
<style scoped>
.food-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease-out;
  box-shadow: 0px 3px 3px -2px rgba(0, 0, 0, 0.2),
              0px 3px 4px 0px rgba(0, 0, 0, 0.14),
              0px 1px 8px 0px rgba(0, 0, 0, 0.12);
  background: var(--surface-card);

  .grid {
    display: grid;
    grid-template-columns: repeat( 3, 1fr );
  }
}

.food-card:hover {
  box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, 0.2),
              0px 8px 10px 1px rgba(0, 0, 0, 0.14),
              0px 3px 14px 2px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}
</style>
