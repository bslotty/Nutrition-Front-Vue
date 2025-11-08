import { ref, computed, watch, type Ref } from "vue";
import { defineStore } from "pinia";
import { FoodService } from "./FoodService";
import type { Food } from "../models/Food";
import { FilterOptions } from "@/modules/core/models/filter_options";
import { Sort, SortDirection } from "@/modules/core/models/sort";
import { FoodSortFields } from "../enums/FoodSortFields";

export const useFoodStore = defineStore("foods", () => {
  let food$ = new FoodService();
  let list: Ref<Food[]> = ref([]);
  
  const options = ref(new FilterOptions());
  
  options.value.sort = new Sort(
    FoodSortFields.protein,
    SortDirection.Asc,
    FoodSortFields
  );
  options.value.setPreset('all');

  const filteredList = computed(() => {
    let f = options.value.searchList<Food>(list.value);
    f = options.value.sortList(f);
    return f;
  });

  function getList(forceRefresh = false) {
    // Return cached data if available and not forcing refresh
    if (list.value.length > 0 && !forceRefresh) {
      return Promise.resolve();
    }

    // Fetch from server
    return food$.getListFromServer().then((l) => {
      list.value = l;
    });
  }

  return { list, filteredList, options, getList, food$ };
});