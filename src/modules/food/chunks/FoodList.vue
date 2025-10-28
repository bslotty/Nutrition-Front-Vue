<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFoodStore } from "../data/Food.store";
import FoodCard from "../components/FoodCard.vue";
import FilterBar from "@/modules/core/components/FilterBar.vue";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import ListContainer from "@/modules/core/components/ListContainer.vue";
import Button from "@/modules/core/components/Button.vue";
import { FilterOptions } from "@/modules/core/models/filter_options";
import { FoodSortFields } from "../enums/FoodSortFields";
import { Sort, SortDirection } from "@/modules/core/models/sort";
import type { Food } from "../models/Food";
import { useDialog } from "@/modules/core/data/dialog.store";
import router from "@/router";

const $dialog = useDialog();
const $foods = useFoodStore();
const isLoading = ref(true);
const foods = ref<Food[]>([]);

const options = ref(new FilterOptions());

// Set sort using Sort constructor
options.value.sort = new Sort(
  FoodSortFields.protein,
  SortDirection.Asc,
  FoodSortFields
);

options.value.setPreset('all');

function refreshList() {
  let f = options.value.searchList<Food>($foods.list);
  f = options.value.sortList(f);
  
  isLoading.value = false;
  foods.value = f;
}

onMounted(() => {
  $foods.getList().then(() => refreshList());
});

watch($foods.list, () => {
  refreshList();
});

function createSingle() {
  router.push({ path: `/food/create`, replace: true });
}

function createMulti() {
  router.push({ path: `/recipe/create`, replace: true });
}

function refresh() {
  isLoading.value = true;
  $foods.getList().then(() => refreshList());
}
</script>

<template>
  <div class="p-3">
    <!-- Header Row -->
    <HeaderRow class="mb-3">
      <template #title>Foods</template>
      <template #actions>
        <Button
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          @click="refresh()"
        />
        <Button
          label="Food"
          icon="pi pi-plus"
          severity="success"
          @click="createSingle()"
        />
        <Button
          label="Recipe"
          icon="pi pi-th-large"
          severity="success"
          @click="createMulti()"
        />
      </template>
    </HeaderRow>

    <!-- Filter Bar -->
    <FilterBar :options="options" @filter-changed="refreshList" />

    <!-- Food List -->
    <ListContainer
      :loading="isLoading"
      :items="foods"
      listClass="grid"
    >
      <template #list-item="{ item, index }">
        <FoodCard :food="item" :style="{ '--i': index }" />
      </template>
    </ListContainer>
  </div>
</template>