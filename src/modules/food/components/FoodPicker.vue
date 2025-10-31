<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useFoodStore } from "../data/Food.store";
import { useDialog } from "@/modules/core/data/dialog.store";
import { Food } from "../models/Food";
import type { RecipeIngredient } from "../interfaces/RecipeIngredient";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

// Composables
const $dialog = useDialog();
const $foods = useFoodStore();

// Reactive state
const loading = ref(false);
const searchTerm = ref('');
const foods = ref<Food[]>([]);
const selectedFoods = ref<Map<string, RecipeIngredient>>(new Map());

// Get config from dialog data
const multiple = computed(() => $dialog.data?.multiple ?? true);
const preselectedFoods = computed<RecipeIngredient[]>(() => $dialog.data?.preselectedFoods ?? []);

// Computed properties
const filteredFoods = computed(() => {
  if (!searchTerm.value) return foods.value;
  
  const term = searchTerm.value.toLowerCase();
  return foods.value.filter(food => 
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
    foods.value = await $foods.food$.getListFromServer();
  } catch (error) {
    console.error('Failed to load foods:', error);
    foods.value = [];
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
    const ingredient: RecipeIngredient = {
      food: food,
      amount: food.serving.size || 1,
      unit: food.serving.unit || 'serving'
    };
    
    if (!multiple.value) {
      // Clear previous selections if single mode
      selectedFoods.value.clear();
    }
    
    selectedFoods.value.set(foodId, ingredient);
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

function calculateNutrientInfo(ingredient: RecipeIngredient) {
  const nutrients = ingredient.food.calculateNutrients(ingredient.amount, ingredient.unit);
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
  <div class="food-picker p-2">
    <!-- Header with Actions -->
    <div class="flex justify-content-between align-items-center mb-4">
      <h4 class="m-0">Select Foods</h4>
      <div class="flex gap-2">
        <Button
          label="Cancel"
          severity="secondary"
          outlined
          @click="cancel()"
        />
        <Button
          :label="multiple ? `Add ${selectedFoods.size} Ingredient${selectedFoods.size !== 1 ? 's' : ''}` : 'Add Ingredient'"
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
          <div class="text-center p-4">
            <i class="pi pi-search text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 m-0">No foods found matching your search.</p>
          </div>
        </template>

        <template #loading>
          <div class="text-center p-4">Loading foods...</div>
        </template>

        <Column field="name" header="Food Name" :sortable="true" style="min-width: 200px;">
          <template #body="{ data }">
            <div class="flex flex-column" @click="toggleFoodSelection(data)">
              <span class="font-medium">{{ data.name }}</span>
              <span class="text-sm text-gray-500">{{ data.brand }}</span>
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