import { ref, computed, watch, type Ref } from "vue";
import { defineStore } from "pinia";
import { RecipeService } from "./RecipeService";
import type { Recipe } from "../models/Recipe";
import { FilterOptions } from "@/modules/core/models/filter_options";
import { Sort, SortDirection } from "@/modules/core/models/sort";
import { RecipeSortFields } from "../enums/RecipeSortFields";

export const useRecipeStore = defineStore("recipes", () => {
  let recipe$ = new RecipeService();
  let list: Ref<Recipe[]> = ref([]);

  const options = ref(new FilterOptions());

  options.value.sort = new Sort(
    RecipeSortFields.protein,
    SortDirection.Desc,
    RecipeSortFields
  );
  options.value.setPreset('all');

  const filteredList = computed(() => {
    let f = options.value.searchList<Recipe>(list.value);
    f = options.value.sortList(f);
    return f;
  });

  function setFilterOptions(o: FilterOptions): void {
    options.value = o;
  }

  function getList(forceRefresh = false): Promise<void> {
    // Return cached data if available and not forcing refresh
    if (list.value.length > 0 && !forceRefresh) {
      return Promise.resolve();
    }

    // Fetch from server
    return recipe$.getListFromServer().then((l) => {
      list.value = l;
    });
  }

  return { list, filteredList, options, getList, recipe$ };
});