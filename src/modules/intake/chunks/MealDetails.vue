<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMealStore } from "../data/Meal.store";
import { Meal } from "../models/Meal";
import { Part } from "@/modules/food/models/Part";
import type { BaseFood } from "@/modules/food/models/BaseFood";
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import DatePicker from 'primevue/datepicker';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useDialog } from '@/modules/core/data/dialog.store';
import HeaderRow from '@/modules/core/components/HeaderRow.vue';
import FormInput from '@/modules/core/components/FormInput.vue';
import NutrientSummary from '@/modules/core/components/NutrientSummary.vue';
import NutrientTotals from '@/modules/core/components/NutrientTotals.vue';

// Reactive state
const loading = ref(false);
const currentMeal = ref<Meal | null>(null);

// Form models
const name = ref<string>('');
const date = ref<Date>(new Date());
const parts = ref<Part[]>([]);

// Composables
const route = useRoute();
const router = useRouter();
const $meals = useMealStore();
const toast = useToast();
const confirm = useConfirm();
const $dialog = useDialog();

// Computed properties
const isCreateMode = computed(() => {
  return route.params.id === 'create' || String(route.params.id).startsWith('create_');
});

const isFormValid = computed(() => {
  return !!(name.value && date.value && parts.value.length > 0);
});

const pageTitle = computed(() => {
  return isCreateMode.value ? 'Add Meal' : 'Edit Meal';
});

// Computed nutritional totals
const totalNutrients = computed(() => {
  return parts.value.reduce((totals, part) => {
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
});

// Load meal data on mount
onMounted(async () => {
  const routeId = route.params.id as string;

  if (!isCreateMode.value) {
    try {
      loading.value = true;
      const meal = await $meals.meal$.getByID(routeId);
      currentMeal.value = meal;
      setFormValues(meal);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load meal details',
        life: 3000
      });
      router.push({ name: 'intake-list' });
    } finally {
      loading.value = false;
    }
  } else {
    initializeEmptyForm();
  }
});

// Functions
async function save() {
  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please add at least one food item',
      life: 3000
    });
    return;
  }

  try {
    loading.value = true;
    const mealData = createMealFromForm();

    if (isCreateMode.value) {
      await $meals.meal$.create(mealData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Meal created successfully',
        life: 3000
      });
    } else {
      await $meals.meal$.update(mealData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Meal updated successfully',
        life: 3000
      });
    }

    router.push({ name: 'intake-list' });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${isCreateMode.value ? 'create' : 'update'} meal`,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

function remove() {
  if (isCreateMode.value) {
    router.push({ name: 'intake-list' });
    return;
  }

  confirm.require({
    message: `Are you sure you want to delete "${currentMeal.value?.name}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        loading.value = true;
        await $meals.meal$.delete();

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Meal deleted successfully',
          life: 3000
        });

        router.push({ name: 'intake-list' });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete meal',
          life: 3000
        });
      } finally {
        loading.value = false;
      }
    }
  });
}

function createMealFromForm(): Meal {
  const mealId = isCreateMode.value ? `meal_${Date.now()}` : currentMeal.value?.id || 'meal';
  const meal = new Meal(mealId, date.value);
  meal.setName(name.value);

  // Add parts
  parts.value.forEach(part => {
    meal.addPart(part.food, part.amount, part.unit);
  });

  return meal;
}

function setFormValues(meal: Meal) {
  name.value = meal.name;
  date.value = new Date(meal.date);
  parts.value = [...meal.parts];
}

function initializeEmptyForm() {
  name.value = '';
  date.value = new Date();
  parts.value = [];
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
      parts.value = selectedFoods.map(item => {
        return new Part(
          `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          item.food,
          item.amount,
          item.unit
        );
      });
    }
  });
  $dialog.open('foodpicker');
}

function openRecipePicker() {
  $dialog.setData({
    multiple: true,
    preselectedFoods: parts.value.map(part => ({
      food: part.food,
      amount: part.amount,
      unit: part.unit
    })),
    onClose: (selectedRecipes: Array<{ food: BaseFood, amount: number, unit: string }>) => {
      parts.value = selectedRecipes.map(item => {
        return new Part(
          `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          item.food,
          item.amount,
          item.unit
        );
      });
    }
  });
  $dialog.open('recipepicker');
}

function removePart(part: Part) {
  confirm.require({
    message: `Remove ${part.food.name} from meal?`,
    header: 'Confirm Removal',
    icon: 'pi pi-question-circle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => {
      const index = parts.value.findIndex(p => p.id === part.id);
      if (index >= 0) {
        parts.value.splice(index, 1);
      }
    }
  });
}

function updatePartAmount(part: Part, newAmount: number) {
  const index = parts.value.findIndex(p => p.id === part.id);
  if (index >= 0) {
    parts.value[index].setAmount(newAmount);
  }
}
</script>

<template>
  <div>
    <div>
      <div class="flex justify-between items-center px-3 py-3">
        <h3 class="m-0">{{ pageTitle }}</h3>
        <div class="flex gap-2">
          <Button v-if="!isCreateMode" icon="pi pi-trash" severity="danger" outlined @click="remove()"
            :disabled="loading" aria-label="Delete meal" />
          <Button label="Save" icon="pi pi-check" severity="success" @click="save()" :disabled="!isFormValid || loading"
            :loading="loading" :aria-label="isCreateMode ? 'Create meal' : 'Save meal'" />
        </div>
      </div>

      <div class="meal-grid">
        <!-- Column 1: Meal Info -->
        <div class="flex flex-col">
          <h4 class="text-primary m-0 mb-2">Meal Information</h4>

          <FormInput label="Meal Name" required>
            <template #input>
              <InputText v-model="name" placeholder="Enter meal name (e.g., Breakfast, Lunch)" class="w-full" />
            </template>
          </FormInput>

          <FormInput label="Date" required>
            <template #input>
              <DatePicker v-model="date" dateFormat="yy-mm-dd" showIcon class="w-full" />
            </template>
          </FormInput>
        </div>

        <!-- Column 2: Nutritional Summary -->
        <div class="flex flex-col">
          <h4 class="text-primary m-0 mb-2">Nutritional Summary</h4>
          <NutrientTotals :nutrients="totalNutrients" />
        </div>
      </div>

      <Divider />

      <!-- Food Items Section -->
      <div class="food-items-section">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-primary m-0">Food Items</h4>
          <div class="flex gap-2">
            <Button label="Add Food" icon="pi pi-plus" severity="success" @click="openFoodPicker()" />
            <Button label="Add Recipe" icon="pi pi-plus" severity="primary" @click="openRecipePicker()" />
          </div>
        </div>

        <div v-if="parts.length === 0" class="text-center px-4 py-4 bg-gray-50 rounded">
          <i class="pi pi-info-circle text-2xl text-gray-400 mb-2"></i>
          <p class="text-gray-600 m-0">No food items added yet. Click "Add Food" or "Add Recipe" to get started.</p>
        </div>

        <DataTable v-else :value="parts" class="food-items-table" :paginator="false" responsive-layout="scroll">
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

          <Column header="Nutrition" style="min-width: 350px;">
            <template #body="{ data }">
              <NutrientSummary :nutrients="data.nutrients" :showCalories="true" size="small" />
            </template>
          </Column>

          <Column header="Actions" style="min-width: 80px;">
            <template #body="{ data }">
              <Button icon="pi pi-trash" severity="danger" outlined size="small" @click="removePart(data)"
                aria-label="Remove food item" />
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
.meal-details-card {
  max-width: 1200px;
  margin: 0 auto;
}

.meal-grid {
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

.food-items-section {
  margin-top: 1rem;
}

.food-items-table {
  margin-top: 1rem;
}

// Custom nutrient color indicators
.pi-circle-fill {
  font-size: 0.75rem;
}
</style>
