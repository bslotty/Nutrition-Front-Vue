<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useWeightStore } from "../data/Weight.store";
import { Weight } from "../models/Weight";
import LineChart from "@/modules/core/components/LineChart.vue";
import Button from "@/modules/core/components/Button.vue";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import FilterBar from "@/modules/core/components/FilterBar.vue";
import { useDialog } from "@/stores/dialogs.store";
import { FilterOptions } from "@/modules/core/models/filter_options";
import { Sort, SortDirection } from "@/modules/core/models/sort";
import { FilterOptionsRange } from "@/modules/core/models/filter_options_range";
import { WeightSortFields } from "../enums/WeightSortFields";

const loading = ref(false);
const list = ref<Weight[]>([]);
const chart = ref<any[]>([]);
const $weight = useWeightStore();
const $dialog = useDialog();

// Initialize filter options with date range and sort
const options = ref(new FilterOptions());

// Set date range
options.value.setRange(new FilterOptionsRange());
options.value.range = options.value.range?.SetEndDateToNumOfDaysFromStart(14);

// Set sort using Sort constructor
options.value.sort = new Sort(
  WeightSortFields.date,
  SortDirection.Asc,
  WeightSortFields
);

onMounted(async () => {
  await loadWeights();
});

async function loadWeights() {
  try {
    loading.value = true;
    await $weight.getList();
    refreshList();
  } catch (error) {
    console.error('Failed to load weights:', error);
  } finally {
    loading.value = false;
  }
}

function refreshList() {
  list.value = options.value.filterDateRange<Weight>($weight.list, "date");
  chart.value = list.value
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((w) => [new Date(w.date), +w.pounds]);
  chart.value.unshift(["Date", "Pounds"]);
}

function view(weight: Weight = new Weight("create", new Date(), 0)) {
  $dialog.setData({
    id: weight.id,
    date: weight.date,
    pounds: weight.pounds,
    onClose: async (data: any) => {
      $weight.weight$.detail = new Weight(data.id, new Date(data.date), data.pounds);
      if (data.id === "create") {
        await $weight.weight$.create();
      } else {
        await $weight.weight$.update();
      }
      // Refresh the list after successful save
      await loadWeights();
    },
    onDelete: async () => {
      // Refresh the list after successful delete
      await loadWeights();
    },
  });
  $dialog.open("weightdetails");
}

function selectedRow(e: number) {
  if (list.value[e] !== undefined) {
    view(list.value[e]);
  }
}
</script>

<template>
  <div class="">
    <!-- Header Row -->
    <HeaderRow class="mb-3">
      <template #title>Weight</template>
      <template #actions>
        <Button
          label="Weight"
          icon="pi pi-plus"
          severity="success"
          @click="view()"
        />
      </template>
    </HeaderRow>

    <!-- Filter Bar -->
    <FilterBar :options="options" @filter-changed="refreshList" />

    <!-- Chart -->
    <div v-if="chart.length > 1" class="mb-3">
      <LineChart :chartData="chart" size="" @select="selectedRow" />
    </div>
  </div>
</template>