import { ref } from "vue";
import { defineStore } from "pinia";

export const useDialog = defineStore("dialog", () => {
  let target = ref("");
  let data = ref();

  function open(name: string): void {
    target.value = name;
  }

  function close() {
    target.value = "";
  }

  function setData(obj: any) {
    data.value = obj;
  }

  return { target, data, open, close, setData };
});
