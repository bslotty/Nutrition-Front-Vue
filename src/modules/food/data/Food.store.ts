import { ref, computed, watch, type Ref } from "vue";
import { defineStore } from "pinia";
import { FoodService } from "./FoodService";
import type { Food } from "../models/Food";
import type { FilterOptions } from "@/modules/core/models/filter_options";

export const useFoodStore = defineStore("foods", () => {
  let food$ = new FoodService();
  let list: Ref<Food[]> = ref([]);
  let options: FilterOptions;

  function setFilterOptions(o: FilterOptions) {
    options = o;
  }

  watch(list, () => {
    console.log("FoodStore.watch(list): ", list, options);
  });

  function getList() {
    return food$.getListFromServer().then((l) => {
      console.log("FoodStore.getList()", l);
      list.value = l;
    });
  }

  return { list, getList, food$ };
});
