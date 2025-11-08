import { ref, computed, watch, type Ref } from "vue";
import { defineStore } from "pinia";
import type { FilterOptions } from "@/modules/core/models/filter_options";
import { WeightService } from "./WeightService";
import type { Weight } from "../models/Weight";

export const useWeightStore = defineStore("Weights", () => {
  let weight$ = new WeightService();
  let list   : Ref<Weight[]> = ref([]);
  let options: FilterOptions;

  function setFilterOptions(o: FilterOptions) {
    options = o;
  }

  function getList(forceRefresh = false) {
    // Return cached data if available and not forcing refresh
    if (list.value.length > 0 && !forceRefresh) {
      return Promise.resolve();
    }

    // Fetch from server
    return weight$.getListFromServer().then((l) => {
      list.value = l;
    });
  }

  return { list, getList, weight$ };
});
