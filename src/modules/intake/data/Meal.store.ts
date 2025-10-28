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

  watch(list, () => {
    console.log("MealStore.watch(list): ", list, options);
  });

  function getList(): Promise<void> {
    return meal$.getListFromServer().then((l) => {
      console.log("MealStore.getList()", l);
      list.value = l;
    });
  }

  return { list, getList, meal$ };
});