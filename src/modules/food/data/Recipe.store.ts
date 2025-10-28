import { ref, computed, watch, type Ref } from "vue";
import { defineStore } from "pinia";
import { RecipeService } from "./RecipeService";
import type { Recipe } from "../models/Recipe";
import type { FilterOptions } from "@/modules/core/models/filter_options";

export const useRecipeStore = defineStore("recipes", () => {
  let recipe$ = new RecipeService();
  let list: Ref<Recipe[]> = ref([]);
  let options: FilterOptions;

  function setFilterOptions(o: FilterOptions): void {
    options = o;
  }

  watch(list, () => {
    console.log("RecipeStore.watch(list): ", list, options);
  });

  function getList(): Promise<void> {
    return recipe$.getListFromServer().then((l) => {
      console.log("RecipeStore.getList()", l);
      list.value = l;
    });
  }

  return { list, getList, recipe$ };
});