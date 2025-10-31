<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useFoodStore } from "../data/Food.store";
import FoodCard from "../components/FoodCard.vue";
import FilterBar from "@/modules/core/components/FilterBar.vue";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import ListContainer from "@/modules/core/components/ListContainer.vue";
import Button from "@/modules/core/components/Button.vue";
import { useDialog } from "@/modules/core/data/dialog.store";
import router from "@/router";

const $dialog = useDialog();
const $foods = useFoodStore();
const { filteredList, options } = storeToRefs($foods);

onMounted(() => {
  $foods.getList();
});

function createSingle() {
  router.push({ path: `/food/create`, replace: true });
}

function createMulti() {
  router.push({ path: `/recipe/create`, replace: true });
}

function refresh() {
  $foods.getList();
}
</script>

<template>
  <div class="">
    <!-- Header Row -->
    <HeaderRow class="mb-3">
      <template #title>Foods</template>
      <template #actions>
        <Button
          icon="pi pi-refresh"
          severity="primary"
          outlined
          @click="refresh()"
          aria-label="Refresh"
        />
        <Button
          label="Food"
          icon="pi pi-plus"
          severity="success"
          @click="createSingle()"
        />
        <Button
          label="Recipe"
          icon="pi pi-plus"
          severity="success"
          @click="createMulti()"
        />
      </template>
    </HeaderRow>

    <!-- Filter Bar -->
    <FilterBar :options="options" />

    <!-- Food List -->
    <ListContainer
      :key="`${filteredList.length}-${options.sort.active}-${options.sort.direction}-${filteredList[0]?.id}`"
      :loading="false"
      :items="filteredList"
      listClass="grid"
    >
      <template #list-item="{ item, index }">
        <FoodCard :food="item" :style="{ '--i': index }" />
      </template>
    </ListContainer>
  </div>
</template>