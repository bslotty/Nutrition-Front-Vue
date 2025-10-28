<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from "@/modules/core/components/Button.vue";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import DatePicker from "primevue/datepicker";
import Chip from "primevue/chip";
import { FilterOptions } from "../models/filter_options";
import { SortDirection } from "../models/sort";

const { options } = defineProps<{ 
  options: FilterOptions;
}>();

const emit = defineEmits<{
  'filter-changed': [];
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
  console.log('🔔 EMIT filter-changed (flipSortDirection)');
  emit('filter-changed');
}

function onSortColumnChange() {
  console.log('🔔 EMIT filter-changed (onSortColumnChange)');
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
    console.log('🔔 EMIT filter-changed (addSearchTerm)');
    emit('filter-changed');
  }
}

function removeSearchTerm(term: string) {
  const terms = activeSearchTerms.value.filter(t => t !== term);
  options.search = terms.join(',');
  console.log('🔔 EMIT filter-changed (removeSearchTerm)');
  emit('filter-changed');
}

function onDateRangeChange() {
  if (options.range) {
    options.range.active = true;
    console.log('🔔 EMIT filter-changed (onDateRangeChange)');
    emit('filter-changed');
  }
}

function page(dir: "next" | "prev") {
  if (dir === "next") {
    options.page.nextResults();
  } else {
    options.page.prevResults();
  }
  console.log('🔔 EMIT filter-changed (page)');
  emit('filter-changed');
}
</script>

<template>
  <div class="flex justify-content-between align-items-center gap-1 px-2 py-1 surface-50 border-round mb-2">
    <!-- Left Section: Sort, Date Range, Filter Chips -->
    <div class="flex align-items-center gap-1 flex-1 overflow-x-auto">
      <!-- Sort Dropdown -->
      <Dropdown
        v-if="options.sort"
        v-model="options.sort.active"
        :options="sortOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Sort..."
        size="small"
        class="w-8rem"
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

      <!-- Date Range Start -->
      <DatePicker
        v-if="options.range"
        v-model="options.range.start"
        dateFormat="yy-mm-dd"
        placeholder="From"
        showIcon
        iconDisplay="input"
        size="small"
        class="w-8rem"
        @update:modelValue="onDateRangeChange"
      />
      
      <!-- Date Range End -->
      <DatePicker
        v-if="options.range"
        v-model="options.range.end"
        dateFormat="yy-mm-dd"
        placeholder="To"
        showIcon
        iconDisplay="input"
        size="small"
        class="w-8rem"
        @update:modelValue="onDateRangeChange"
      />

      <!-- Active Search Filter Chips (NO DATE CHIP) -->
      <Chip
        v-for="term in activeSearchTerms"
        :key="term"
        :label="term"
        size="small"
        removable
        @remove="removeSearchTerm(term)"
      />
    </div>

    <!-- Right Section: Pagination & Search Input -->
    <div class="flex align-items-center gap-1 flex-shrink-0">
      <!-- Pagination -->
      <div v-if="options.page.enabled" class="flex align-items-center gap-1">
        <Button
          icon="pi pi-chevron-left"
          severity="secondary"
          size="small"
          text
          :disabled="options.page.current_page === 1"
          @click="page('prev')"
        />
        <span class="text-xs text-600 white-space-nowrap px-1">
          {{ options.page.current_page }}/{{ options.page.page_limit }}
        </span>
        <Button
          icon="pi pi-chevron-right"
          severity="secondary"
          size="small"
          text
          :disabled="options.page.current_page >= options.page.page_limit"
          @click="page('next')"
        />
      </div>

      <!-- Search Input -->
      <InputText
        v-model="newSearchTerm"
        placeholder="Filter..."
        size="small"
        class="w-8rem"
        @keydown.enter="addSearchTerm"
      />
      <Button
        icon="pi pi-plus"
        severity="primary"
        size="small"
        :disabled="newSearchTerm.trim().length === 0"
        @click="addSearchTerm"
      />
    </div>
  </div>
</template>

<style scoped>
.overflow-x-auto {
  overflow-x: auto;
  scrollbar-width: thin;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: var(--surface-300);
  border-radius: 4px;
}
</style>