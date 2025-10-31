<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMealStore } from "../data/Meal.store";
import { Meal } from "../models/Meal";
import { MealEntry } from "../models/MealEntry";
import type { BaseFood } from "@/modules/food/models/BaseFood";
import type { RecipeIngredient } from "@/modules/food/interfaces/RecipeIngredient";
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

// Reactive state
const loading = ref(false);
const currentMeal = ref<Meal | null>(null);

// Form models
const name = ref<string>('');
const date = ref<Date>(new Date());
const entries = ref<MealEntry[]>([]);

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
  return !!(name.value && date.value && entries.value.length > 0);
});

const pageTitle = computed(() => {
  return isCreateMode.value ? 'Add Meal' : 'Edit Meal';
});

// Computed nutritional totals
const totalNutrients = computed(() => {
  return entries.value.reduce((totals, entry) => {
    const nutrients = entry.nutrients;
    return {
      protein: totals.protein + nutrients.protein,
      fat: totals.fat + nutrients.fat,
      carbs: totals.carbs + nutrients.carbs,
      fiber: totals.fiber + nutrients.fiber,
      sugar: totals.sugar + nutrients.sugar,
      sodium: totals.sodium + nutrients.sodium,
      calories: totals.calories + entry.calories
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
      console.error('Failed to load meal:', error);
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
    console.error('Failed to save meal:', error);
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
        console.error('Failed to delete meal:', error);
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

  // Add entries
  entries.value.forEach(entry => {
    meal.addEntry(entry.food, entry.amount, entry.unit);
  });

  return meal;
}

function setFormValues(meal: Meal) {
  name.value = meal.name;
  date.value = new Date(meal.date);
  entries.value = [...meal.entries];
}

function initializeEmptyForm() {
  name.value = '';
  date.value = new Date();
  entries.value = [];
}

function openFoodPicker() {
  $dialog.setData({
    multiple: true,
    preselectedFoods: entries.value.map(entry => ({
      food: entry.food,
      amount: entry.amount,
      unit: entry.unit
    })),
    onClose: (selectedFoods: RecipeIngredient[]) => {
      entries.value = selectedFoods.map(ingredient => {
        return new MealEntry(
          `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ingredient.food,
          ingredient.amount,
          ingredient.unit
        );
      });
    }
  });
  $dialog.open('foodpicker');
}

function removeEntry(entry: MealEntry) {
  confirm.require({
    message: `Remove ${entry.food.name} from meal?`,
    header: 'Confirm Removal',
    icon: 'pi pi-question-circle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: () => {
      const index = entries.value.findIndex(e => e.id === entry.id);
      if (index >= 0) {
        entries.value.splice(index, 1);
      }
    }
  });
}

function updateEntryAmount(entry: MealEntry, newAmount: number) {
  const index = entries.value.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    entries.value[index].setAmount(newAmount);
  }
}
</script>

<template>
  <div>
    <Card class="meal-details-card">
      <template #header>
        <div class="flex justify-content-between align-items-center my-3">
          <h3 class="m-0">{{ pageTitle }}</h3>
          <div class="flex gap-2">
            <Button
              v-if="!isCreateMode"
              icon="pi pi-trash"
              severity="danger"
              outlined
              @click="remove()"
              :disabled="loading"
              aria-label="Delete meal"
            />
            <Button
              label="Save"
              icon="pi pi-check"
              severity="success"
              @click="save()"
              :disabled="!isFormValid || loading"
              :loading="loading"
              :aria-label="isCreateMode ? 'Create meal' : 'Save meal'"
            />
          </div>
        </div>
      </template>

      <template #content>
        <div class="meal-grid">
          <!-- Column 1: Meal Info -->
          <div class="flex flex-column gap-4">
            <h4 class="text-primary m-0 mb-2">Meal Information</h4>

            <FormInput label="Meal Name" required>
              <template #input>
                <InputText
                  v-model="name"
                  placeholder="Enter meal name (e.g., Breakfast, Lunch)"
                  class="w-full"
                />
              </template>
            </FormInput>

            <FormInput label="Date" required>
              <template #input>
                <DatePicker
                  v-model="date"
                  dateFormat="yy-mm-dd"
                  showIcon
                  class="w-full"
                />
              </template>
            </FormInput>
          </div>

          <!-- Column 2: Nutritional Summary -->
          <div class="flex flex-column gap-4">
            <h4 class="text-primary m-0 mb-2">Nutritional Summary</h4>

            <!-- Calories -->
            <div class="field">
              <label class="block text-900 font-medium mb-2">Total Calories</label>
              <div class="p-3 bg-primary-50 border-round text-center">
                <span class="text-2xl font-bold text-primary">{{ Math.round(totalNutrients.calories) }}</span>
                <span class="text-sm ml-2">calories</span>
              </div>
            </div>

            <!-- Macronutrients Summary -->
            <div class="flex gap-3">
              <div class="field flex-1 text-center">
                <label class="block font-medium mb-2" style="color: #4CAF50;">
                  <i class="pi pi-circle-fill mr-1"></i>Protein
                </label>
                <div class="p-2 bg-green-50 border-round">
                  <div class="text-lg font-semibold">{{ totalNutrients.protein.toFixed(1) }}g</div>
                </div>
              </div>
              <div class="field flex-1 text-center">
                <label class="block font-medium mb-2" style="color: #2196F3;">
                  <i class="pi pi-circle-fill mr-1"></i>Fat
                </label>
                <div class="p-2 bg-blue-50 border-round">
                  <div class="text-lg font-semibold">{{ totalNutrients.fat.toFixed(1) }}g</div>
                </div>
              </div>
              <div class="field flex-1 text-center">
                <label class="block font-medium mb-2" style="color: #FFA000;">
                  <i class="pi pi-circle-fill mr-1"></i>Carbs
                </label>
                <div class="p-2 bg-orange-50 border-round">
                  <div class="text-lg font-semibold">{{ totalNutrients.carbs.toFixed(1) }}g</div>
                </div>
              </div>
            </div>

            <!-- Micronutrients Summary -->
            <div class="flex gap-3">
              <div class="field flex-1 text-center">
                <label class="block font-medium mb-2" style="color: #9C27B0;">Fiber</label>
                <div class="text-base">{{ totalNutrients.fiber.toFixed(1) }}g</div>
              </div>
              <div class="field flex-1 text-center">
                <label class="block font-medium mb-2" style="color: #F44336;">Sugar</label>
                <div class="text-base">{{ totalNutrients.sugar.toFixed(1) }}g</div>
              </div>
              <div class="field flex-1 text-center">
                <label class="block font-medium mb-2" style="color: #795548;">Sodium</label>
                <div class="text-base">{{ totalNutrients.sodium.toFixed(0) }}mg</div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <!-- Food Items Section -->
        <div class="food-items-section">
          <div class="flex justify-content-between align-items-center mb-4">
            <h4 class="text-primary m-0">Food Items</h4>
            <Button
              label="Add Food"
              icon="pi pi-plus"
              severity="success"
              @click="openFoodPicker()"
            />
          </div>

          <div v-if="entries.length === 0" class="text-center p-4 bg-gray-50 border-round">
            <i class="pi pi-info-circle text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-600 m-0">No food items added yet. Click "Add Food" to get started.</p>
          </div>

          <DataTable
            v-else
            :value="entries"
            class="food-items-table"
            :paginator="false"
            responsive-layout="scroll"
          >
            <Column field="food.name" header="Food Name" :sortable="true" style="min-width: 300px;">
              <template #body="{ data }">
                <div class="flex flex-column">
                  <span class="font-medium">{{ data.food.name }}</span>
                  <span class="text-sm text-gray-500">{{ data.food.brand }}</span>
                </div>
              </template>
            </Column>

            <Column header="Amount" style="width: 100px;">
              <template #body="{ data }">
                <InputNumber
                  :model-value="data.amount"
                  @update:model-value="updateEntryAmount(data, $event)"
                  :min="0"
                  :max-fraction-digits="2"
                  size="small"
                  style="width: 80px;"
                />
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
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  size="small"
                  @click="removeEntry(data)"
                  aria-label="Remove food item"
                />
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </Card>

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
