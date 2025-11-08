<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRecipeStore } from "../data/Recipe.store";
import { useDialog } from "@/modules/core/data/dialog.store";
import { Recipe } from "../models/Recipe";
import type { BaseFood } from "@/modules/food/models/BaseFood";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Type for recipe selection
interface RecipeSelection {
  food: BaseFood;
  amount: number;
  unit: string;
}

// Composables
const $dialog = useDialog();
const $recipes = useRecipeStore();

// Reactive state
const loading = ref(false);
const searchTerm = ref('');
const selectedRecipes = ref<Map<string, RecipeSelection>>(new Map());

// Get config from dialog data
const multiple = computed(() => $dialog.data?.multiple ?? true);
const preselectedRecipes = computed<RecipeSelection[]>(() => $dialog.data?.preselectedFoods ?? []);

// Computed properties
const filteredRecipes = computed(() => {
  const allRecipes = $recipes.list;
  if (!searchTerm.value) return allRecipes;

  const term = searchTerm.value.toLowerCase();
  return allRecipes.filter(recipe =>
    recipe.name.toLowerCase().includes(term)
  );
});

const selectedRecipesArray = computed(() => {
  return Array.from(selectedRecipes.value.values());
});

const hasSelections = computed(() => {
  return selectedRecipes.value.size > 0;
});

// Load recipes on mount
onMounted(async () => {
  await loadRecipes();
  initializePreselected();
});

async function loadRecipes(): Promise<void> {
  try {
    loading.value = true;
    await $recipes.getList();
  } catch (error) {
    // Failed to load recipes
  } finally {
    loading.value = false;
  }
}

function initializePreselected(): void {
  preselectedRecipes.value.forEach(ingredient => {
    selectedRecipes.value.set(ingredient.food.id, { ...ingredient });
  });
}

function toggleRecipeSelection(recipe: Recipe): void {
  const recipeId = recipe.id;

  if (selectedRecipes.value.has(recipeId)) {
    // Remove from selection
    selectedRecipes.value.delete(recipeId);
  } else {
    // Add to selection with default values
    const selection: RecipeSelection = {
      food: recipe,
      amount: 1,
      unit: 'serving'
    };

    if (!multiple.value) {
      // Clear previous selections if single mode
      selectedRecipes.value.clear();
    }

    selectedRecipes.value.set(recipeId, selection);
  }
}

function confirmSelection(): void {
  if ($dialog.data?.onClose) {
    $dialog.data.onClose(selectedRecipesArray.value);
  }
  $dialog.close();
}

function cancel(): void {
  $dialog.close();
}

function isSelected(recipe: Recipe): boolean {
  return selectedRecipes.value.has(recipe.id);
}

function getRowClass(data: Recipe) {
  return isSelected(data) ? 'selected-row' : '';
}
</script>

<template>
  <div class="recipe-picker px-3 py-3">
    <!-- Header with Actions -->
    <div class="flex justify-between items-center mb-4 px-0 py-3 border-b-2 border-gray-300">
      <h3 class="m-0 text-primary">Select Recipes</h3>
      <div class="flex gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          @click="cancel()"
        />
        <Button
          :label="multiple ? `Add ${selectedRecipes.size} Item${selectedRecipes.size !== 1 ? 's' : ''}` : 'Add Item'"
          severity="success"
          @click="confirmSelection()"
          :disabled="!hasSelections"
        />
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section mb-4">
      <div class="field">
        <label for="search" class="block text-900 font-medium mb-2">Search Recipes</label>
        <InputText
          id="search"
          v-model="searchTerm"
          placeholder="Search by name..."
          class="w-full"
        >
          <template #prefix>
            <i class="material-symbols-outlined">search</i>
          </template>
        </InputText>
      </div>
    </div>

    <!-- Available Recipes Section -->
    <div class="available-recipes-section">

      <DataTable
        :value="filteredRecipes"
        :loading="loading"
        :paginator="true"
        :rows="25"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        current-page-report-template="Showing {first} to {last} of {totalRecords} recipes"
        responsive-layout="scroll"
        :row-class="getRowClass"
      >
        <template #empty>
          <div class="text-center px-4 py-4">
            <i class="pi pi-search text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 m-0">No recipes found matching your search.</p>
          </div>
        </template>

        <template #loading>
          <div class="text-center px-4 py-4">Loading recipes...</div>
        </template>

        <Column field="name" header="Recipe Name" :sortable="true" style="min-width: 250px;">
          <template #body="{ data }">
            <div class="flex flex-col gap-1" @click="toggleRecipeSelection(data)">
              <span class="font-semibold">{{ data.name }}</span>
            </div>
          </template>
        </Column>

        <Column header="Calories" :sortable="true" style="min-width: 100px;">
          <template #body="{ data }">
            <span @click="toggleRecipeSelection(data)">{{ Math.round(data.calories) }}</span>
          </template>
        </Column>

        <Column header="Protein" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #4CAF50;" @click="toggleRecipeSelection(data)">{{ data.nutrients.protein.toFixed(1) }}g</span>
          </template>
        </Column>

        <Column header="Fat" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #2196F3;" @click="toggleRecipeSelection(data)">{{ data.nutrients.fat.toFixed(1) }}g</span>
          </template>
        </Column>

        <Column header="Carbs" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #FFA000;" @click="toggleRecipeSelection(data)">{{ data.nutrients.carbs.toFixed(1) }}g</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.recipe-picker {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.search-section {
  .field {
    margin-bottom: 0;
  }
}

.available-recipes-section {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.p-datatable) {
    flex: 1;
    display: flex;
    flex-direction: column;

    .p-datatable-wrapper {
      flex: 1;
      overflow-y: auto;
    }
    .p-datatable-tbody > tr {
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--surface-hover) !important;
      }

      &.selected-row {
        background-color: var(--primary-50, #e3f2fd) !important;

        &:hover {
          background-color: var(--primary-100, #bbdefb) !important;
        }
      }
    }
  }
}

// Material icons
.material-symbols-outlined {
  font-size: 1.2rem;
}
</style>
