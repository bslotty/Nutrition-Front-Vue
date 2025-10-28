<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useFoodStore } from "../data/Food.store";
import { Food } from "../models/Food";
import type { RecipeIngredient } from "../interfaces/RecipeIngredient";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import Card from 'primevue/card';
import Divider from 'primevue/divider';

// Props
interface Props {
  multiple?: boolean;
  preselectedFoods?: RecipeIngredient[];
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true,
  preselectedFoods: () => []
});

// Emits
const emit = defineEmits<{
  foodSelected: [ingredients: RecipeIngredient[]];
  cancel: [];
}>();

// Reactive state
const loading = ref(false);
const searchTerm = ref('');
const foods = ref<Food[]>([]);
const selectedFoods = ref<Map<string, RecipeIngredient>>(new Map());

// Composables
const $foods = useFoodStore();

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
  props.preselectedFoods.forEach(ingredient => {
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
    
    if (!props.multiple) {
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
  emit('foodSelected', selectedFoodsArray.value);
}

function cancel(): void {
  emit('cancel');
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
</script>

<template>
  <div class="food-picker">
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

    <!-- Selected Foods Section -->
    <div v-if="hasSelections" class="selected-section mb-4">
      <Card>
        <template #header>
          <div class="p-3">
            <h5 class="m-0">Selected Ingredients ({{ selectedFoods.size }})</h5>
          </div>
        </template>
        
        <template #content>
          <div class="selected-foods-list">
            <div 
              v-for="ingredient in selectedFoodsArray" 
              :key="ingredient.food.id"
              class="selected-food-item p-3 border-bottom-1 surface-border"
            >
              <div class="flex align-items-center justify-content-between gap-3">
                <div class="flex-1">
                  <div class="font-medium">{{ ingredient.food.name }}</div>
                  <div class="text-sm text-gray-500">{{ ingredient.food.brand }}</div>
                </div>
                
                <div class="flex align-items-center gap-2">
                  <div class="field-group flex align-items-center gap-2">
                    <InputNumber
                      :model-value="ingredient.amount"
                      @update:model-value="updateIngredientAmount(ingredient.food.id, $event)"
                      :min="0"
                      :max-fraction-digits="2"
                      size="small"
                      style="width: 80px;"
                    />
                    <InputText
                      :model-value="ingredient.unit"
                      @update:model-value="updateIngredientUnit(ingredient.food.id, $event)"
                      size="small"
                      style="width: 80px;"
                    />
                  </div>
                  
                  <div class="nutrition-info text-sm text-center" style="min-width: 80px;">
                    <div>{{ calculateNutrientInfo(ingredient).calories }} cal</div>
                    <div class="text-xs text-gray-500">
                      P: {{ calculateNutrientInfo(ingredient).protein }}g
                    </div>
                  </div>
                  
                  <Button
                    severity="danger"
                    text
                    size="small"
                    @click="removeFromSelection(ingredient.food.id)"
                    aria-label="Remove ingredient"
                  >
                    <i class="material-symbols-outlined">close</i>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Available Foods Section -->
    <div class="available-foods-section">
      <h5 class="mb-3">Available Foods</h5>
      
      <DataTable 
        :value="filteredFoods"
        :loading="loading"
        :paginator="true"
        :rows="10"
        :rows-per-page-options="[5, 10, 20, 50]"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="Showing {first} to {last} of {totalRecords} foods"
        responsive-layout="scroll"
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

        <Column style="width: 40px;">
          <template #body="{ data }">
            <Checkbox
              :model-value="isSelected(data)"
              @update:model-value="toggleFoodSelection(data)"
              binary
            />
          </template>
        </Column>
        
        <Column field="name" header="Food Name" :sortable="true" style="min-width: 200px;">
          <template #body="{ data }">
            <div class="flex flex-column">
              <span class="font-medium">{{ data.name }}</span>
              <span class="text-sm text-gray-500">{{ data.brand }}</span>
            </div>
          </template>
        </Column>
        
        <Column header="Serving" style="min-width: 120px;">
          <template #body="{ data }">
            <span>{{ data.serving.size }} {{ data.serving.unit }}</span>
          </template>
        </Column>
        
        <Column header="Calories" :sortable="true" style="min-width: 100px;">
          <template #body="{ data }">
            <span>{{ data.calories }}</span>
          </template>
        </Column>
        
        <Column header="Protein" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #4CAF50;">{{ data.nutrients.protein }}g</span>
          </template>
        </Column>
        
        <Column header="Fat" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #2196F3;">{{ data.nutrients.fat }}g</span>
          </template>
        </Column>
        
        <Column header="Carbs" style="min-width: 80px;">
          <template #body="{ data }">
            <span class="text-sm" style="color: #FFA000;">{{ data.nutrients.carbs }}g</span>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Action Buttons -->
    <Divider />
    <div class="flex justify-content-end gap-2 pt-3">
      <Button
        label="Cancel"
        severity="secondary"
        outlined
        @click="cancel()"
      />
      <Button
        :label="props.multiple ? `Add ${selectedFoods.size} Ingredient${selectedFoods.size !== 1 ? 's' : ''}` : 'Add Ingredient'"
        severity="success"
        @click="confirmSelection()"
        :disabled="!hasSelections"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.food-picker {
  min-height: 600px;
}

.search-section {
  .field {
    margin-bottom: 0;
  }
}

.selected-section {
  .selected-foods-list {
    max-height: 300px;
    overflow-y: auto;
  }
  
  .selected-food-item:last-child {
    border-bottom: none;
  }
  
  .field-group {
    min-width: 180px;
  }
  
  .nutrition-info {
    min-width: 80px;
  }
}

.available-foods-section {
  min-height: 400px;
}

// Material icons
.material-symbols-outlined {
  font-size: 1.2rem;
}
</style>