<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRecipeStore } from "../data/Recipe.store.ts";
import { Recipe } from "../models/Recipe";
import { Part } from "@/modules/food/models/Part";
import type { BaseFood } from "@/modules/food/models/BaseFood";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useDialog } from '@/modules/core/data/dialog.store';
import NutrientTotals from '@/modules/core/components/NutrientTotals.vue';

// Reactive state
const valid = ref(false);
const loading = ref(false);
const currentRecipe = ref<Recipe | null>(null);

// Form models
const name = defineModel<string>("name", { required: true });

// Recipe parts
const parts = ref<Part[]>([]);

// Composables
const route = useRoute();
const router = useRouter();
const $recipes = useRecipeStore();
const toast = useToast();
const confirm = useConfirm();
const $dialog = useDialog();

// Computed properties
const isCreateMode = computed(() => {
  return route.params.id === 'create';
});

const isFormValid = computed(() => {
  return !!(name.value);
});

const pageTitle = computed(() => {
  return isCreateMode.value ? 'Create Recipe' : 'Edit Recipe';
});

const saveButtonProps = computed(() => ({
  severity: isFormValid.value ? 'success' : 'secondary',
  disabled: !isFormValid.value || loading.value,
  outlined: !isFormValid.value,
  loading: loading.value
}));

// Computed nutritional totals
const totalNutrients = computed(() => {
  const totals = parts.value.reduce((totals, part) => {
    const nutrients = part.nutrients;

    return {
      protein: totals.protein + nutrients.protein,
      fat: totals.fat + nutrients.fat,
      carbs: totals.carbs + nutrients.carbs,
      fiber: totals.fiber + nutrients.fiber,
      sugar: totals.sugar + nutrients.sugar,
      sodium: totals.sodium + nutrients.sodium,
      calories: totals.calories + part.calories
    };
  }, {
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    calories: 0
  });

  return totals;
});

// Load recipe data on mount
onMounted(async () => {
  const routeId = route.params.id as string;

  if (routeId !== 'create') {
    try {
      loading.value = true;
      const recipe = await $recipes.recipe$.getByID(routeId);
      currentRecipe.value = recipe;
      setFormValues(recipe);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load recipe details',
        life: 3000
      });
      router.push({ name: 'recipe-list' });
    } finally {
      loading.value = false;
    }
  } else {
    initializeEmptyForm();
  }
});

// Functions
async function save() {
  if (!isFormValid.value) return;

  try {
    loading.value = true;
    validate();

    if (!valid.value) {
      toast.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please check your input and try again',
        life: 3000
      });
      return;
    }

    const recipeData = createRecipeFromForm();

    let savedRecipe: Recipe;
    if (isCreateMode.value) {
      savedRecipe = await $recipes.recipe$.createRecipe(recipeData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Recipe created successfully',
        life: 3000
      });
    } else {
      savedRecipe = await $recipes.recipe$.updateRecipe(recipeData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Recipe updated successfully',
        life: 3000
      });
    }

    currentRecipe.value = savedRecipe;
    router.push({ name: 'recipe-list' });

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${isCreateMode.value ? 'create' : 'update'} recipe`,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

function validate() {
  const regex = new RegExp("[\\w\\-\\.\\@ !#$%^+]+", "gm");
  const match = (name.value as string)?.match(regex);
  valid.value = match !== null && !!name.value;
}

async function remove() {
  if (isCreateMode.value || !currentRecipe.value) {
    router.push({ name: 'recipe-list' });
    return;
  }

  confirm.require({
    message: `Are you sure you want to delete "${currentRecipe.value.name}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        loading.value = true;
        await $recipes.recipe$.deleteRecipe(currentRecipe.value!);

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Recipe deleted successfully',
          life: 3000
        });

        router.push({ name: 'recipe-list' });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete recipe',
          life: 3000
        });
      } finally {
        loading.value = false;
      }
    },
    reject: () => {
      // User cancelled deletion
    }
  });
}

function createRecipeFromForm(): Recipe {
  const baseId = isCreateMode.value ? 'create' : currentRecipe.value?.id || 'create';

  return new Recipe(baseId)
    .setName(name.value || '')
    .setParts(parts.value);
}

function setFormValues(r: Recipe) {
  name.value = r.name;
  parts.value = r.parts || [];
}

function initializeEmptyForm() {
  name.value = '';
  parts.value = [];
}

function handleInput() {
  validate();
}

function openFoodPicker() {
  $dialog.setData({
    multiple: true,
    preselectedFoods: parts.value.map(part => ({
      food: part.food,
      amount: part.amount,
      unit: part.unit
    })),
    onClose: (selectedFoods: Array<{ food: BaseFood, amount: number, unit: string }>) => {
      selectedFoods.forEach(item => {
        const existingIndex = parts.value.findIndex(
          existing => existing.food.id === item.food.id
        );

        if (existingIndex >= 0) {
          // Update existing part
          parts.value[existingIndex].setAmount(item.amount, item.unit);
        } else {
          // Add new part
          const part = new Part(
            `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            item.food,
            item.amount,
            item.unit
          );
          parts.value.push(part);
        }
      });

      validate(); // Revalidate form after adding parts
    }
  });
  $dialog.open('foodpicker');
}

function removePart(part: Part) {
  confirm.require({
    message: `Remove ${part.food.name} from recipe?`,
    header: 'Confirm Removal',
    icon: 'pi pi-question-circle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => {
      const index = parts.value.findIndex(p => p.id === part.id);
      if (index >= 0) {
        parts.value.splice(index, 1);
        validate();
      }
    }
  });
}

function updatePartAmount(part: Part, newAmount: number) {
  const index = parts.value.findIndex(p => p.id === part.id);

  if (index >= 0) {
    // Update the part and create a new array to trigger reactivity
    const updatedPart = parts.value[index].setAmount(newAmount);
    parts.value = [...parts.value]; // Force reactivity by creating new array
  }
}
</script>

<template>
  <div>
    <div>
      <div class="flex justify-between items-center px-3 py-3">
        <h3 class="m-0">{{ pageTitle }}</h3>
        <div class="flex gap-2">
          <Button :icon="isCreateMode ? 'pi pi-times' : 'pi pi-trash'" :severity="isCreateMode ? 'secondary' : 'danger'"
            outlined @click="remove()" class="p-button-sm" :aria-label="isCreateMode ? 'Cancel' : 'Delete recipe'"
            :disabled="loading" />
          <Button icon="pi pi-check" v-bind="saveButtonProps" @click="save()" class="p-button-sm"
            :aria-label="isCreateMode ? 'Create recipe' : 'Save recipe'" />
        </div>
      </div>

      <div class="recipe-grid">
        <!-- Basic Information Section -->
        <div class="flex flex-col">
          <h4 class="m-0 mb-2">Recipe Information</h4>

          <div class="field">
            <label for="name" class="block font-medium mb-2">Recipe Name</label>
            <InputText id="name" v-model="name" placeholder="Enter recipe name" class="w-full" @input="handleInput" />
          </div>
        </div>

        <!-- Nutritional Summary Section -->
        <div class="flex flex-col">
          <h4 class="m-0 mb-2">Nutritional Summary</h4>
          <NutrientTotals :nutrients="totalNutrients" />
        </div>
      </div>

      <Divider />

      <!-- Ingredients Section -->
      <div class="ingredients-section">
        <div class="flex justify-between items-center mb-4">
          <h4 class="m-0">Ingredients</h4>
          <Button label="Add Ingredient" severity="success" outlined @click="openFoodPicker()">
            <template #icon>
              <i class="material-symbols-outlined">add</i>
            </template>
          </Button>
        </div>

        <div v-if="parts.length === 0" class="text-center px-4 py-4 bg-gray-50 rounded">
          <i class="pi pi-info-circle text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-600 m-0">No ingredients added yet. Click "Add Ingredient" to get started.</p>
        </div>

        <DataTable v-else :value="parts" class="ingredients-table" :paginator="false" responsive-layout="scroll">
          <Column field="food.name" header="Food Name" :sortable="true" style="min-width: 300px;">
            <template #body="{ data }">
              <div class="flex flex-col">
                <span class="font-medium">{{ data.food.name }}</span>
                <span class="text-sm text-gray-500">{{ data.food.brand }}</span>
              </div>
            </template>
          </Column>

          <Column header="Amount" style="width: 100px;">
            <template #body="{ data }">
              <InputNumber :model-value="data.amount" @update:model-value="updatePartAmount(data, $event)" :min="0"
                :max-fraction-digits="2" size="small" style="width: 80px;" />
            </template>
          </Column>

          <Column field="unit" header="Unit" style="min-width: 100px;">
            <template #body="{ data }">
              <span>{{ data.unit }}</span>
            </template>
          </Column>

          <Column header="Calories" style="min-width: 100px;">
            <template #body="{ data }">
              <span>{{ data.calories }}</span>
            </template>
          </Column>

          <Column header="Actions" style="min-width: 80px;">
            <template #body="{ data }">
              <Button severity="danger" outlined size="small" @click="removePart(data)" aria-label="Remove ingredient">
                <i class="material-symbols-outlined">delete</i>
              </Button>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Toast notifications -->
    <Toast />

    <!-- Confirmation dialog -->
    <ConfirmDialog />
  </div>
</template>

<style lang="scss" scoped>
.recipe-details-card {
  max-width: 1200px;
  margin: 0 auto;
}

.recipe-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.field {
  display: flex;
  flex-direction: column;
}

.ingredients-section {
  margin-top: 1rem;
}

.ingredients-table {
  margin-top: 1rem;
}

// Custom nutrient color indicators
.pi-circle-fill {
  font-size: 0.75rem;
}

// Material icons
.material-symbols-outlined {
  font-size: 1.2rem;
}
</style>