<script setup lang="ts">
import { useDialog } from "@/modules/core/data/dialog.store";
import TextSearch from "@/modules/core/dialogs/TextSearch.vue"
import DateRange from "@/modules/core/dialogs/DateRange.vue";
import WeightDetails from "@/modules/weight/dialogs/WeightDetails.vue";
import FoodPicker from "@/modules/food/components/FoodPicker.vue";
const $dialog = useDialog();

function close(event: MouseEvent) {
  if (event.target == null) return;
  if (event.target instanceof HTMLElement && event.target.classList.contains("dialog-backdrop")) {
    $dialog.close();
  }
}
</script>

<template>
  <div
    class="dialog-backdrop"
    :class="{ visible: $dialog.target != '' }"
    v-if="$dialog.target != ''"
    @mousedown="close($event)"
  >
    <dialog class="card p-1 f-row fd-col j-start a-stretch g-5" :class="{ 'food-picker-dialog': $dialog.target == 'foodpicker' }">
      <TextSearch v-if="$dialog.target == 'textsearch'" name=""></TextSearch>
      <DateRange v-if="$dialog.target == 'daterange'" start="" end=""></DateRange>
      <WeightDetails v-if="$dialog.target == 'weightdetails'" pounds="" date=""></WeightDetails>
      <FoodPicker v-if="$dialog.target == 'foodpicker'"></FoodPicker>
    </dialog>
  </div>
</template>

<style lang="scss">
dialog .card {
  width: min(450px, 100vw);
  box-shadow: var(--elevation-1);
  border: none;

  &.food-picker-dialog {
    width: min(900px, 95vw);
    max-height: 600px;
    overflow-y: auto;
  }
}

.dialog-backdrop {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-shade);
  padding-top: 5rem;
  display: grid;
  align-items: start;
  justify-content: center;

  opacity: 0;
  transition: opacity 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275);

  z-index: -1;

  &.visible {
    opacity: 1;
    z-index: 5;

    dialog {
      display: flex;
      animation: pop-in 300ms;
      animation-fill-mode: forwards;
    }
  }
}
dialog {
  z-index: 5;
}
</style>
