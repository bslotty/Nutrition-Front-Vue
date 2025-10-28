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

  watch(list, () => {
    console.log("WeightStore.watch(list): ", list, options);
  });

  function getList() {
    return weight$.getListFromServer().then((l) => {
      console.log("WeightStore.getList()", l);
      list.value = l;
    });
  }

  return { list, getList, weight$ };
});
