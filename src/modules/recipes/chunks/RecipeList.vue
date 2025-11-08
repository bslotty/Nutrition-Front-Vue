<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRecipeStore } from "../data/Recipe.store";
import RecipeCard from "../components/RecipeCard.vue";
import FilterBar from "@/modules/core/components/FilterBar.vue";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import ListContainer from "@/modules/core/components/ListContainer.vue";
import Button from "@/modules/core/components/Button.vue";
import { useDialog } from "@/modules/core/data/dialog.store";
import router from "@/router";

const $dialog = useDialog();
const $recipes = useRecipeStore();
const { filteredList, options } = storeToRefs($recipes);

onMounted(() => {
  $recipes.getList();
});

function createRecipe() {
  router.push({ path: `/recipe/create`, replace: true });
}

function refresh() {
  $recipes.getList(true);
}
</script>

<template>
  <div class="">
    <!-- Header Row -->
    <HeaderRow class="mb-3">
      <template #title>Recipes</template>
      <template #actions>
        <Button
          label="Recipe"
          icon="pi pi-plus"
          severity="success"
          @click="createRecipe()"
        />
      </template>
    </HeaderRow>

    <!-- Filter Bar -->
    <FilterBar :options="options" @refresh="refresh" />

    <!-- Recipe List -->
    <ListContainer
      :key="`${filteredList.length}-${options.sort.active}-${options.sort.direction}-${filteredList[0]?.id}`"
      :loading="false"
      :items="filteredList"
      listClass="grid"
    >
      <template #list-item="{ item, index }">
        <RecipeCard :recipe="item" :style="{ '--i': index }" />
      </template>
    </ListContainer>
  </div>
</template>
