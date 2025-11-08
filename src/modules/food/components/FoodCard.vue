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
    class="card flex flex-col cursor-pointer px-3 py-3 gap-3"
  >
    <div class="flex flex-col">
      <span class="text-sm text-gray-500">{{ food.brand }}</span>
      <span class="text-lg font-semibold">{{ food.name }}</span>
      <NutrientBar
        :protein="food.nutrients.protein"
        :fat="food.nutrients.fat"
        :carbs="food.nutrients.carbs"
      />
    </div>


    <!-- Macronutrients: Protein | Fat | Carbs -->
    <div class="flex flex-row justify-between text-center">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-protein">Protein</span>
        <span class="text-sm font-semibold text-protein">{{ food.nutrients.protein }}g</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-fat">Fat</span>
        <span class="text-sm font-semibold text-fat">{{ food.nutrients.fat }}g</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-carbs">Carbs</span>
        <span class="text-sm font-semibold text-carbs">{{ food.nutrients.carbs }}g</span>
      </div>
    </div>

    <!-- Micronutrients: Sodium | Sugar | Fiber -->
    <div class="flex flex-row justify-between text-center">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-sodium">Sodium</span>
        <span class="text-sm text-sodium">{{ food.nutrients.sodium }}mg</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-sugar">Sugar</span>
        <span class="text-sm text-sugar">{{ food.nutrients.sugar }}g</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-fiber">Fiber</span>
        <span class="text-sm text-fiber">{{ food.nutrients.fiber }}g</span>
      </div>
    </div>
  </div>
  <div v-else>Error</div>
</template>
