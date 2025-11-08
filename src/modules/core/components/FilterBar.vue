<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from "@/modules/core/components/Button.vue";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Chip from "primevue/chip";
import { FilterOptions } from "../models/filter_options";
import { SortDirection } from "../models/sort";

const { options, showSort = true } = defineProps<{
  options: FilterOptions;
  showSort?: boolean;
}>();

const emit = defineEmits<{
  'filter-changed': [];
  'refresh': [];
}>();

// Local state
const newSearchTerm = ref("");

// Computed
const isAscending = computed(() => options.sort.direction === SortDirection.Asc);
const sortIcon = computed(() => isAscending.value ? 'pi pi-arrow-up' : 'pi pi-arrow-down');

const activeSearchTerms = computed(() => {
  if (!options.search) return [];
  return typeof options.search === 'string' 
    ? options.search.split(',').filter(t => t.trim().length > 0).map(t => t.trim())
    : options.search;
});

// Convert enum to dropdown options
const sortOptions = computed(() => {
  if (!options.sort?.enumList) return [];
  
  const cols = options.sort.enumList;
  
  // If columns is an enum object (e.g., FoodSortFields), convert to array
  if (typeof cols === 'object' && !Array.isArray(cols)) {
    // Handle enum: { 0: 'name', name: 0, 1: 'brand', brand: 1, ... }
    const enumKeys = Object.keys(cols).filter(key => isNaN(Number(key)));
    
    return enumKeys.map(key => ({
      label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize: name → Name
      value: Number(cols[key as keyof typeof cols]) // Ensure numeric value
    }));
  }
  
  // If already array format [{ label, value }], return as-is
  return cols;
});

// Methods
function flipSortDirection() {
  options.sort.direction = isAscending.value ? SortDirection.Desc : SortDirection.Asc;
  emit('filter-changed');
}

function onSortColumnChange() {
  emit('filter-changed');
}

function addSearchTerm() {
  const term = newSearchTerm.value.trim();
  if (term.length > 0 && !activeSearchTerms.value.includes(term)) {
    if (options.search.length > 0) {
      options.search += ',' + term;
    } else {
      options.search = term;
    }
    newSearchTerm.value = "";
    emit('filter-changed');
  }
}

function removeSearchTerm(term: string) {
  const terms = activeSearchTerms.value.filter(t => t !== term);
  options.search = terms.join(',');
  emit('filter-changed');
}

function onDateRangeChange() {
  if (options.range) {
    options.range.active = true;
    emit('filter-changed');
  }
}

function page(dir: "next" | "prev") {
  if (dir === "next") {
    options.page.nextResults();
  } else {
    options.page.prevResults();
  }
  emit('filter-changed');
}

function refresh() {
  emit('refresh');
}
</script>

<template>
  <div class="flex justify-between items-center gap-2 mb-2">
    <!-- Left Section: Sort with Direction -->
    <div v-if="showSort" class="flex items-center gap-1">
      <!-- Sort Dropdown -->
      <Dropdown
        v-if="options.sort"
        v-model="options.sort.active"
        :options="sortOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Sort..."
        size="large"
        style="width: 130px;"
        @change="onSortColumnChange"
      />

      <!-- Sort Direction Button -->
      <Button
        v-if="options.sort"
        :icon="sortIcon"
        :severity="isAscending ? 'success' : 'warning'"
        size="small"
        text
        @click="flipSortDirection"
      />
    </div>

    <!-- Date Range Section -->
    <div v-if="options.range" class="flex items-center gap-1">
      <DatePicker
        v-model="options.range.start"
        dateFormat="yy-mm-dd"
        placeholder="From"
        showIcon
        iconDisplay="input"
        size="large"
        style="width: 140px;"
        @update:modelValue="onDateRangeChange"
      />

      <DatePicker
        v-model="options.range.end"
        dateFormat="yy-mm-dd"
        placeholder="To"
        showIcon
        iconDisplay="input"
        size="large"
        style="width: 140px;"
        @update:modelValue="onDateRangeChange"
      />
    </div>

    <!-- Middle Section: Active Search Filter Chips (Growable) -->
    <div class="flex items-center gap-1 flex-1 overflow-x-auto">
      <Chip
        v-for="term in activeSearchTerms"
        :key="term"
        :label="term"
        size="small"
        removable
        @remove="removeSearchTerm(term)"
      />
    </div>

    <!-- Right Section: Search Input & Actions -->
    <div class="flex items-center gap-1 flex-shrink-0">
      <!-- Search Input -->
      <InputText
        v-model="newSearchTerm"
        placeholder="Filter..."
        size="small"
        style="width: 130px;"
        @keydown.enter="addSearchTerm"
      />
      <Button
        icon="pi pi-plus"
        severity="primary"
        size="small"
        :disabled="newSearchTerm.trim().length === 0"
        @click="addSearchTerm"
      />

      <!-- Refresh Button -->
      <Button
        icon="pi pi-refresh"
        severity="secondary"
        size="small"
        text
        @click="refresh"
        aria-label="Refresh"
      />
    </div>
  </div>
</template>