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
const protein = ref<number>(0);
const fat = ref<number>(0);
const carbs = ref<number>(0);
const sodium = ref<number>(0);
const sugar = ref<number>(0);
const fiber = ref<number>(0);

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
      console.error('Failed to load food:', error);
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
    console.error('Failed to save food:', error);
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
        console.error('Failed to delete food:', error);
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
  
  return new Food(baseId)
    .setName(name.value || '')
    .setBrand(brand.value || '')
    .setServing(servingSize.value || 0, servingSizeType.value || '')
    .setProtein(protein.value || 0)
    .setFat(fat.value || 0)
    .setCarbs(carbs.value || 0)
    .setSodium(sodium.value || 0)
    .setSugar(sugar.value || 0)
    .setFiber(fiber.value || 0);
}

function setFormValues(f: Food) {
  name.value = f.name;
  brand.value = f.brand;
  servingSize.value = f.serving.size;
  servingSizeType.value = f.serving.unit;
  protein.value = f.nutrients.protein;
  fat.value = f.nutrients.fat;
  carbs.value = f.nutrients.carbs;
  sodium.value = f.nutrients.sodium;
  sugar.value = f.nutrients.sugar;
  fiber.value = f.nutrients.fiber;
}

function initializeEmptyForm() {
  name.value = '';
  brand.value = '';
  servingSize.value = 0;
  servingSizeType.value = '';
  protein.value = 0;
  fat.value = 0;
  carbs.value = 0;
  sodium.value = 0;
  sugar.value = 0;
  fiber.value = 0;
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
        <Button
          v-if="!isCreateMode"
          icon="pi pi-trash"
          severity="danger"
          outlined
          @click="remove()"
          :disabled="loading"
          aria-label="Delete food"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          severity="success"
          @click="save()"
          :disabled="!isFormValid || loading"
          :loading="loading"
          :aria-label="isCreateMode ? 'Create food' : 'Save food'"
        />
      </template>
    </HeaderRow>

    <Card class="food-details-card">
      <template #content>
        <div class="food-grid">
          <!-- Column 1: Basic Information -->
          <div class="form-column-left">
            <!-- Row 1: Brand -->
            <FormInput label="Brand" required>
              <template #input>
                <InputText
                  v-model="brand"
                  placeholder="Enter brand name"
                  @input="handleInput"
                />
              </template>
            </FormInput>

            <!-- Row 2: Name -->
            <FormInput label="Name" required>
              <template #input>
                <InputText
                  v-model="name"
                  placeholder="Enter food name"
                  @input="handleInput"
                />
              </template>
            </FormInput>

            <!-- Row 3: Serving Size + Unit -->
            <div class="serving-row">
              <FormInput label="Serving Size" required>
                <template #input>
                  <InputNumber
                    v-model="servingSize"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="2"
                    @input="handleInput"
                  />
                </template>
              </FormInput>

              <FormInput label="Unit" required>
                <template #input>
                  <InputText
                    v-model="servingSizeType"
                    placeholder="g, oz, cup"
                    @input="handleInput"
                  />
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
                    <i class="pi pi-circle-fill mr-1"></i>Protein (g)
                  </label>
                </template>
                <template #input>
                  <InputNumber
                    v-model="protein"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="1"
                    @input="handleInput"
                  />
                </template>
              </FormInput>

              <FormInput>
                <template #label>
                  <label class="block font-medium mb-2" style="color: #2196F3;">
                    <i class="pi pi-circle-fill mr-1"></i>Fat (g)
                  </label>
                </template>
                <template #input>
                  <InputNumber
                    v-model="fat"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="1"
                    @input="handleInput"
                  />
                </template>
              </FormInput>

              <FormInput>
                <template #label>
                  <label class="block font-medium mb-2" style="color: #FFA000;">
                    <i class="pi pi-circle-fill mr-1"></i>Carbs (g)
                  </label>
                </template>
                <template #input>
                  <InputNumber
                    v-model="carbs"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="1"
                    @input="handleInput"
                  />
                </template>
              </FormInput>
            </div>

            <!-- Row 2: Fiber, Sodium, Sugar -->
            <div class="nutrients-row">
              <FormInput>
                <template #label>
                  <label class="block font-medium mb-2" style="color: #9C27B0;">
                    <i class="pi pi-circle-fill mr-1"></i>Fiber (g)
                  </label>
                </template>
                <template #input>
                  <InputNumber
                    v-model="fiber"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="1"
                    @input="handleInput"
                  />
                </template>
              </FormInput>

              <FormInput>
                <template #label>
                  <label class="block font-medium mb-2" style="color: #795548;">
                    <i class="pi pi-circle-fill mr-1"></i>Sodium (mg)
                  </label>
                </template>
                <template #input>
                  <InputNumber
                    v-model="sodium"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="0"
                    @input="handleInput"
                  />
                </template>
              </FormInput>

              <FormInput>
                <template #label>
                  <label class="block font-medium mb-2" style="color: #F44336;">
                    <i class="pi pi-circle-fill mr-1"></i>Sugar (g)
                  </label>
                </template>
                <template #input>
                  <InputNumber
                    v-model="sugar"
                    placeholder="0"
                    :min="0"
                    :maxFractionDigits="1"
                    @input="handleInput"
                  />
                </template>
              </FormInput>
            </div>
          </div>
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