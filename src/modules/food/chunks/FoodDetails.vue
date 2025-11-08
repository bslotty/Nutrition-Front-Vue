<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useFoodStore } from "../data/Food.store";
import { useRoute, useRouter } from "vue-router";
import { Food } from "../models/Food";
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import HeaderRow from '@/modules/core/components/HeaderRow.vue';
import FormInput from '@/modules/core/components/FormInput.vue';

// Reactive state
const valid = ref(false);
const loading = ref(false);
const currentFood = ref<Food | null>(null);

// Form models
const name = ref<string>('');
const brand = ref<string>('');
const servingSize = ref<number>(0);
const servingSizeType = ref<string>('');

// Macronutrients
const protein = ref<number>(0);
const fat = ref<number>(0);
const carbs = ref<number>(0);
const sodium = ref<number>(0);
const sugar = ref<number>(0);
const fiber = ref<number>(0);

// Vitamins
const vitaminA = ref<number>(0);
const vitaminB1 = ref<number>(0);
const vitaminB2 = ref<number>(0);
const vitaminB3 = ref<number>(0);
const vitaminB5 = ref<number>(0);
const vitaminB6 = ref<number>(0);
const vitaminB7 = ref<number>(0);
const vitaminB9 = ref<number>(0);
const vitaminB12 = ref<number>(0);
const vitaminC = ref<number>(0);
const vitaminD = ref<number>(0);
const vitaminE = ref<number>(0);
const vitaminK = ref<number>(0);

// Minerals
const calcium = ref<number>(0);
const iron = ref<number>(0);
const magnesium = ref<number>(0);
const potassium = ref<number>(0);
const zinc = ref<number>(0);

// Composables
const route = useRoute();
const router = useRouter();
const $foods = useFoodStore();
const toast = useToast();
const confirm = useConfirm();

// Computed properties
const isCreateMode = computed(() => {
  return route.params.id === 'create';
});

const isFormValid = computed(() => {
  return !!(name.value && brand.value && servingSize.value && servingSizeType.value);
});

const pageTitle = computed(() => {
  return isCreateMode.value ? 'Create Food' : 'Edit Food';
});

// Load food data on mount
onMounted(async () => {
  if (!isCreateMode.value) {
    try {
      loading.value = true;
      const food = await $foods.food$.getByID(route.params.id as string);
      currentFood.value = food;
      setFormValues(food);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load food details',
        life: 3000
      });
      router.push({ name: 'food-list' });
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

    const foodData = createFoodFromForm();

    let savedFood: Food;
    if (isCreateMode.value) {
      savedFood = await $foods.food$.createFood(foodData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Food created successfully',
        life: 3000
      });
    } else {
      savedFood = await $foods.food$.updateFood(foodData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Food updated successfully',
        life: 3000
      });
    }

    currentFood.value = savedFood;
    router.push({ name: 'food-list' });

  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Failed to ${isCreateMode.value ? 'create' : 'update'} food`,
      life: 3000
    });
  } finally {
    loading.value = false;
  }
}

function validate() {
  const regex = new RegExp("[\\w\\-\\.\\@ !#$%^+]+", "gm");
  const match = name.value?.match(regex);
  valid.value = match !== null && !!name.value && !!brand.value;
}

async function remove() {
  if (isCreateMode.value || !currentFood.value) {
    router.push({ name: 'food-list' });
    return;
  }

  confirm.require({
    message: `Are you sure you want to delete "${currentFood.value.name}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        loading.value = true;
        await $foods.food$.deleteFood(currentFood.value!);

        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Food deleted successfully',
          life: 3000
        });

        router.push({ name: 'food-list' });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete food',
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

function createFoodFromForm(): Food {
  const baseId = isCreateMode.value ? 'create' : currentFood.value?.id || 'create';

  const food = new Food(baseId)
    .setName(name.value || '')
    .setBrand(brand.value || '')
    .setServing(servingSize.value || 0, servingSizeType.value || '')
    .setProtein(protein.value || 0)
    .setFat(fat.value || 0)
    .setCarbs(carbs.value || 0)
    .setSodium(sodium.value || 0)
    .setSugar(sugar.value || 0)
    .setFiber(fiber.value || 0);

  // Set vitamins and minerals using the protected setNutrients method
  (food as any).setNutrients({
    vitaminA: vitaminA.value || 0,
    vitaminB1: vitaminB1.value || 0,
    vitaminB2: vitaminB2.value || 0,
    vitaminB3: vitaminB3.value || 0,
    vitaminB5: vitaminB5.value || 0,
    vitaminB6: vitaminB6.value || 0,
    vitaminB7: vitaminB7.value || 0,
    vitaminB9: vitaminB9.value || 0,
    vitaminB12: vitaminB12.value || 0,
    vitaminC: vitaminC.value || 0,
    vitaminD: vitaminD.value || 0,
    vitaminE: vitaminE.value || 0,
    vitaminK: vitaminK.value || 0,
    calcium: calcium.value || 0,
    iron: iron.value || 0,
    magnesium: magnesium.value || 0,
    potassium: potassium.value || 0,
    zinc: zinc.value || 0
  });

  return food;
}

function setFormValues(f: Food) {
  name.value = f.name;
  brand.value = f.brand;
  servingSize.value = f.serving.size;
  servingSizeType.value = f.serving.unit;

  // Macronutrients
  protein.value = f.nutrients.protein;
  fat.value = f.nutrients.fat;
  carbs.value = f.nutrients.carbs;
  sodium.value = f.nutrients.sodium;
  sugar.value = f.nutrients.sugar;
  fiber.value = f.nutrients.fiber;

  // Vitamins
  vitaminA.value = f.nutrients.vitaminA;
  vitaminB1.value = f.nutrients.vitaminB1;
  vitaminB2.value = f.nutrients.vitaminB2;
  vitaminB3.value = f.nutrients.vitaminB3;
  vitaminB5.value = f.nutrients.vitaminB5;
  vitaminB6.value = f.nutrients.vitaminB6;
  vitaminB7.value = f.nutrients.vitaminB7;
  vitaminB9.value = f.nutrients.vitaminB9;
  vitaminB12.value = f.nutrients.vitaminB12;
  vitaminC.value = f.nutrients.vitaminC;
  vitaminD.value = f.nutrients.vitaminD;
  vitaminE.value = f.nutrients.vitaminE;
  vitaminK.value = f.nutrients.vitaminK;

  // Minerals
  calcium.value = f.nutrients.calcium;
  iron.value = f.nutrients.iron;
  magnesium.value = f.nutrients.magnesium;
  potassium.value = f.nutrients.potassium;
  zinc.value = f.nutrients.zinc;
}

function initializeEmptyForm() {
  name.value = '';
  brand.value = '';
  servingSize.value = 0;
  servingSizeType.value = '';

  // Macronutrients
  protein.value = 0;
  fat.value = 0;
  carbs.value = 0;
  sodium.value = 0;
  sugar.value = 0;
  fiber.value = 0;

  // Vitamins
  vitaminA.value = 0;
  vitaminB1.value = 0;
  vitaminB2.value = 0;
  vitaminB3.value = 0;
  vitaminB5.value = 0;
  vitaminB6.value = 0;
  vitaminB7.value = 0;
  vitaminB9.value = 0;
  vitaminB12.value = 0;
  vitaminC.value = 0;
  vitaminD.value = 0;
  vitaminE.value = 0;
  vitaminK.value = 0;

  // Minerals
  calcium.value = 0;
  iron.value = 0;
  magnesium.value = 0;
  potassium.value = 0;
  zinc.value = 0;
}

function handleInput() {
  validate();
}
</script>

<template>
  <div class="food-details">
    <!-- Header Row -->
    <HeaderRow>
      <template #title>{{ pageTitle }}</template>
      <template #actions>
        <Button v-if="!isCreateMode" icon="pi pi-trash" severity="danger" outlined @click="remove()" :disabled="loading"
          aria-label="Delete food" />
        <Button label="Save" icon="pi pi-check" severity="success" @click="save()" :disabled="!isFormValid || loading"
          :loading="loading" :aria-label="isCreateMode ? 'Create food' : 'Save food'" />
      </template>
    </HeaderRow>

    <div>
      <div class="food-grid">
        <!-- Column 1: Basic Information -->
        <div class="form-column-left">
          <!-- Row 1: Brand -->
          <FormInput label="Brand" required>
            <template #input>
              <InputText v-model="brand" placeholder="Enter brand name" @input="handleInput" />
            </template>
          </FormInput>

          <!-- Row 2: Name -->
          <FormInput label="Name" required>
            <template #input>
              <InputText v-model="name" placeholder="Enter food name" @input="handleInput" />
            </template>
          </FormInput>

          <!-- Row 3: Serving Size + Unit -->
          <div class="serving-row">
            <FormInput label="Serving Size" required>
              <template #input>
                <InputNumber v-model="servingSize" placeholder="0" :min="0" :maxFractionDigits="2"
                  @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Unit" required>
              <template #input>
                <InputText v-model="servingSizeType" placeholder="g, oz, cup" @input="handleInput" />
              </template>
            </FormInput>
          </div>
        </div>

        <!-- Column 2: Nutritional Information -->
        <div class="form-column-right">
          <!-- Row 1: Protein, Fat, Carbs -->
          <div class="nutrients-row">
            <FormInput>
              <template #label>
                <label class="block font-medium mb-2" style="color: #4CAF50;">
                  Protein (g)
                </label>
              </template>
              <template #input>
                <InputNumber v-model="protein" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput>
              <template #label>
                <label class="block font-medium mb-2" style="color: #2196F3;">
                  Fat (g)
                </label>
              </template>
              <template #input>
                <InputNumber v-model="fat" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput>
              <template #label>
                <label class="block font-medium mb-2" style="color: #FFA000;">
                  Carbs (g)
                </label>
              </template>
              <template #input>
                <InputNumber v-model="carbs" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <!-- Row 2: Fiber, Sodium, Sugar -->
          <div class="nutrients-row">
            <FormInput>
              <template #label>
                <label class="block font-medium mb-2" style="color: #9C27B0;">
                  Fiber (g)
                </label>
              </template>
              <template #input>
                <InputNumber v-model="fiber" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput>
              <template #label>
                <label class="block font-medium mb-2" style="color: #795548;">
                  Sodium (mg)
                </label>
              </template>
              <template #input>
                <InputNumber v-model="sodium" placeholder="0" :min="0" :maxFractionDigits="0" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput>
              <template #label>
                <label class="block font-medium mb-2" style="color: #F44336;">
                  Sugar (g)
                </label>
              </template>
              <template #input>
                <InputNumber v-model="sugar" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <Divider />

          <!-- Vitamins Section -->
          <h4 class="text-primary mt-3 mb-2">Vitamins</h4>

          <!-- Vitamins Row 1: A, B1, B2 -->
          <div class="nutrients-row">
            <FormInput label="Vitamin A (mcg)">
              <template #input>
                <InputNumber v-model="vitaminA" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin B1 (mg)">
              <template #input>
                <InputNumber v-model="vitaminB1" placeholder="0" :min="0" :maxFractionDigits="2" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin B2 (mg)">
              <template #input>
                <InputNumber v-model="vitaminB2" placeholder="0" :min="0" :maxFractionDigits="2" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <!-- Vitamins Row 2: B3, B5, B6 -->
          <div class="nutrients-row">
            <FormInput label="Vitamin B3 (mg)">
              <template #input>
                <InputNumber v-model="vitaminB3" placeholder="0" :min="0" :maxFractionDigits="2" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin B5 (mg)">
              <template #input>
                <InputNumber v-model="vitaminB5" placeholder="0" :min="0" :maxFractionDigits="2" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin B6 (mg)">
              <template #input>
                <InputNumber v-model="vitaminB6" placeholder="0" :min="0" :maxFractionDigits="2" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <!-- Vitamins Row 3: B7, B9, B12 -->
          <div class="nutrients-row">
            <FormInput label="Vitamin B7 (mcg)">
              <template #input>
                <InputNumber v-model="vitaminB7" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin B9 (mcg)">
              <template #input>
                <InputNumber v-model="vitaminB9" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin B12 (mcg)">
              <template #input>
                <InputNumber v-model="vitaminB12" placeholder="0" :min="0" :maxFractionDigits="2"
                  @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <!-- Vitamins Row 4: C, D, E -->
          <div class="nutrients-row">
            <FormInput label="Vitamin C (mg)">
              <template #input>
                <InputNumber v-model="vitaminC" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin D (mcg)">
              <template #input>
                <InputNumber v-model="vitaminD" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Vitamin E (mg)">
              <template #input>
                <InputNumber v-model="vitaminE" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <!-- Vitamins Row 5: K -->
          <div class="nutrients-row">
            <FormInput label="Vitamin K (mcg)">
              <template #input>
                <InputNumber v-model="vitaminK" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <Divider />

          <!-- Minerals Section -->
          <h4 class="text-primary mt-3 mb-2">Minerals</h4>

          <!-- Minerals Row 1: Calcium, Iron, Magnesium -->
          <div class="nutrients-row">
            <FormInput label="Calcium (mg)">
              <template #input>
                <InputNumber v-model="calcium" placeholder="0" :min="0" :maxFractionDigits="0" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Iron (mg)">
              <template #input>
                <InputNumber v-model="iron" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Magnesium (mg)">
              <template #input>
                <InputNumber v-model="magnesium" placeholder="0" :min="0" :maxFractionDigits="0" @input="handleInput" />
              </template>
            </FormInput>
          </div>

          <!-- Minerals Row 2: Potassium, Zinc -->
          <div class="nutrients-row">
            <FormInput label="Potassium (mg)">
              <template #input>
                <InputNumber v-model="potassium" placeholder="0" :min="0" :maxFractionDigits="0" @input="handleInput" />
              </template>
            </FormInput>

            <FormInput label="Zinc (mg)">
              <template #input>
                <InputNumber v-model="zinc" placeholder="0" :min="0" :maxFractionDigits="1" @input="handleInput" />
              </template>
            </FormInput>
          </div>
        </div>
      </div>
    </div>
    <!-- Toast notifications -->
    <Toast />

    <!-- Confirmation dialog -->
    <ConfirmDialog />
  </div>
</template>

<style lang="scss" scoped>
.food-details-card {
  max-width: 1200px;
  margin: 0 auto;
}

.food-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.form-column-left,
.form-column-right {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.serving-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
}

.nutrients-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

// Custom nutrient color indicators
.pi-circle-fill {
  font-size: 0.75rem;
}

// Responsive: Stack nutrient rows on mobile
@media (max-width: 768px) {

  .serving-row,
  .nutrients-row {
    grid-template-columns: 1fr;
  }
}
</style>