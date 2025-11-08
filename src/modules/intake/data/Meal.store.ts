import { ref, computed, watch, type Ref } from "vue";
import { defineStore } from "pinia";
import { MealService } from "./MealService";
import type { Meal } from "../models/Meal";
import type { FilterOptions } from "@/modules/core/models/filter_options";

export const useMealStore = defineStore("meals", () => {
  let meal$ = new MealService();
  let list: Ref<Meal[]> = ref([]);
  let options: FilterOptions;

  function setFilterOptions(o: FilterOptions): void {
    options = o;
  }

  function getList(forceRefresh = false): Promise<void> {
    // Return cached data if available and not forcing refresh
    if (list.value.length > 0 && !forceRefresh) {
      return Promise.resolve();
    }

    // Fetch from server
    return meal$.getListFromServer().then((l) => {
      list.value = l;
    });
  }

  return { list, getList, meal$ };
});