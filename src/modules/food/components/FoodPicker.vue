<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useFoodStore } from "../data/Food.store";
import { useDialog } from "@/modules/core/data/dialog.store";
import { Food } from "../models/Food";
import type { BaseFood } from "../models/BaseFood";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Type for food selection
interface FoodSelection {
  food: BaseFood;
  amount: number;
  unit: string;
}

// Composables
const $dialog = useDialog();
const $foods = useFoodStore();

// Reactive state
const loading = ref(false);
const searchTerm = ref('');
const selectedFoods = ref<Map<string, FoodSelection>>(new Map());

// Get config from dialog data
const multiple = computed(() => $dialog.data?.multiple ?? true);
const preselectedFoods = computed<FoodSelection[]>(() => $dialog.data?.preselectedFoods ?? []);

// Computed properties
const filteredFoods = computed(() => {
  const allFoods = $foods.list;
  if (!searchTerm.value) return allFoods;

  const term = searchTerm.value.toLowerCase();
  return allFoods.filter(food =>
    food.name.toLowerCase().includes(term) ||
    food.brand.toLowerCase().includes(term)
  );
});

const selectedFoodsArray = computed(() => {
  return Array.from(selectedFoods.value.values());
});

const hasSelections = computed(() => {
  return selectedFoods.value.size > 0;
});

// Load foods on mount
onMounted(async () => {
  await loadFoods();
  initializePreselected();
});

async function loadFoods(): Promise<void> {
  try {
    loading.value = true;
    await $foods.getList();
  } catch (error) {
    // Failed to load foods
  } finally {
    loading.value = false;
  }
}

function initializePreselected(): void {
  preselectedFoods.value.forEach(ingredient => {
    selectedFoods.value.set(ingredient.food.id, { ...ingredient });
  });
}

function toggleFoodSelection(food: Food): void {
  const foodId = food.id;

  if (selectedFoods.value.has(foodId)) {
    // Remove from selection
    selectedFoods.value.delete(foodId);
  } else {
    // Add to selection with default values
    const selection: FoodSelection = {
      food: food,
      amount: food.serving.size || 1,
      unit: food.serving.unit || 'serving'
    };

    if (!multiple.value) {
      // Clear previous selections if single mode
      selectedFoods.value.clear();
    }

    selectedFoods.value.set(foodId, selection);
  }
}

function updateIngredientAmount(foodId: string, amount: number): void {
  const ingredient = selectedFoods.value.get(foodId);
  if (ingredient) {
    ingredient.amount = amount;
    selectedFoods.value.set(foodId, ingredient);
  }
}

function updateIngredientUnit(foodId: string, unit: string): void {
  const ingredient = selectedFoods.value.get(foodId);
  if (ingredient) {
    ingredient.unit = unit;
    selectedFoods.value.set(foodId, ingredient);
  }
}

function removeFromSelection(foodId: string): void {
  selectedFoods.value.delete(foodId);
}

function confirmSelection(): void {
  if ($dialog.data?.onClose) {
    $dialog.data.onClose(selectedFoodsArray.value);
  }
  $dialog.close();
}

function cancel(): void {
  $dialog.close();
}

function isSelected(food: Food): boolean {
  return selectedFoods.value.has(food.id);
}

function calculateNutrientInfo(selection: FoodSelection) {
  const nutrients = selection.food.calculateNutrients(selection.amount, selection.unit);
  const calories = Math.round(nutrients.protein * 4 + nutrients.carbs * 4 + nutrients.fat * 9);
  return {
    calories,
    protein: nutrients.protein.toFixed(1),
    fat: nutrients.fat.toFixed(1),
    carbs: nutrients.carbs.toFixed(1)
  };
}

function getRowClass(data: Food) {
  return isSelected(data) ? 'selected-row' : '';
}
</script>

<template>
  <div class="food-picker px-3 py-3">
    <!-- Header with Actions -->
    <div class="flex justify-between items-center mb-4 px-0 py-3 border-b-2 border-gray-300">
      <h3 class="m-0 text-primary">Select Foods</h3>
      <div class="flex gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          @click="cancel()"
        />
        <Button
          :label="multiple ? `Add ${selectedFoods.size} Item${selectedFoods.size !== 1 ? 's' : ''}` : 'Add Item'"
          severity="success"
          @click="confirmSelection()"
          :disabled="!hasSelections"
        />
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section mb-4">
      <div class="field">
        <label for="search" class="block text-900 font-medium mb-2">Search Foods</label>
        <InputText
          id="search"
          v-model="searchTerm"
          placeholder="Search by name or brand..."
          class="w-full"
        >
          <template #prefix>
            <i class="material-symbols-outlined">search</i>
          </template>
        </InputText>
      </div>
    </div>

    <!-- Available Foods Section -->
    <div class="available-foods-section">
      
      <DataTable
        :value="filteredFoods"
        :loading="loading"
        :paginator="true"
        :rows="25"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        current-page-report-template="Showing {first} to {last} of {totalRecords} foods"
        responsive-layout="scroll"
        :row-class="getRowClass"
      >
        <template #empty>
          <div class="text-center px-4 py-4">
            <i class="pi pi-search text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 m-0">No foods found matching your search.</p>
          </div>
        </template>

        <template #loading>
          <div class="text-center px-4 py-4">Loading foods...</div>
        </template>

        <Column field="name" header="Food Name" :sortable="true" style="min-width: 250px;">
          <template #body="{ data }">
            <div class="flex flex-col gap-1" @click="toggleFoodSelection(data)">
              <span class="font-semibold">{{ data.name }}</span>
              <span v-if="data.brand" class="text-sm text-gray-500">{{ data.brand }}</span>
            </div>
          </template>
        </Column>

        <Column header="Serving" style="min-width: 120px;">
          <template #body="{ data }">
            <span @click="toggleFoodSelection(data)">{{ data.serving.size }} {{ data.serving.unit }}</span>
          </template>
        </Column>

        <Column header="Calories" :sortable="true" style="min-width: 100px;">
          <template #body="{ data }">
            <span @click="toggleFoodSelection(data)">{{ data.calories }}</span>
          </template>
        </Column>

        <Column header="Protein" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #4CAF50;" @click="toggleFoodSelection(data)">{{ data.nutrients.protein }}g</span>
          </template>
        </Column>

        <Column header="Fat" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #2196F3;" @click="toggleFoodSelection(data)">{{ data.nutrients.fat }}g</span>
          </template>
        </Column>

        <Column header="Carbs" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #FFA000;" @click="toggleFoodSelection(data)">{{ data.nutrients.carbs }}g</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.food-picker {
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.search-section {
  .field {
    margin-bottom: 0;
  }
}

.available-foods-section {
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