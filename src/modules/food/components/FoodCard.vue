<script setup lang="ts">
import PieChart from "@/modules/core/components/PieChart.vue";
import { useDialog } from "@/modules/core/data/dialog.store";
import type { Food } from "../models/Food";
import router from "@/router";

const $dialog = useDialog();

const props = defineProps<{ food: Food }>();
const { food } = props;

function view() {
  router.push({ name: "food-details", params: { id: food.id }, replace: true  });
}
</script>

<template>
  <div
    @click="view()"
    v-if="food != undefined && food.id != undefined"
    class="food-card py-2 f-row fd-col g-0"
  >
    <div class="f-row fd-col j-start a-start g-0 p-1 full bg-light">
      <label class="subText mat-caption">{{ food.brand }}</label>
      <label class="expandedText mat-body-1">{{ food.name }}</label>
    </div>

    <div class="grid full p-1 food-nutrient-grid bg-light">
      <div class="protein f-row j-start miniCard nowrap">
        <label class="protein mat-body-1 fb-3">P</label>
        <label class="protein mat-body-1">{{ food.nutrients.protein }}</label>
      </div>

      <div class="fiber f-row j-start miniCard nowrap">
        <label class="fiber mat-body-1 fb-3">Fi</label>
        <label class="fiber mat-body-1">{{ food.nutrients.fiber }}</label>
      </div>

      <div class="fat f-row j-start miniCard nowrap">
        <label class="fat mat-body-1 fb-3">F</label>
        <label class="fat mat-body-1">{{ food.nutrients.fat }}</label>
      </div>

      <div class="sugar f-row j-start miniCard nowrap">
        <label class="sugar mat-body-1 fb-3">Su</label>
        <label class="sugar mat-body-1">{{ food.nutrients.sugar }}</label>
      </div>

      <div class="carbs f-row j-start miniCard nowrap">
        <label class="carbs mat-body-1 fb-3">C</label>
        <label class="carbs mat-body-1">{{ food.nutrients.carbs }}</label>
      </div>

      <div class="sodium f-row j-start miniCard nowrap">
        <label class="sodium mat-body-1 fb-3">So</label>
        <label class="sodium mat-body-1">{{ food.nutrients.sodium }}</label>
      </div>
    </div>

    <div class="pieChartBG j-center a-center">
      <PieChart
        :chartData="food.chartData"
        size="max"
      />
    </div>
  </div>
  <!-- </RouterLink> -->
  <div v-else>Error</div>
</template>
<style>
.pieChartBG {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: -1;
}

.food-card {
  border-radius: 0;
  padding: 5px 0;
  text-decoration: none;
}
</style>
