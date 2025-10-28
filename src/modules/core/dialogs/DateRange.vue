<script lang="ts" setup>
import Button from "@/modules/core/components/Button.vue";
import { MatColor } from "@/modules/core/enums/mat_color";
import { useDialog } from "@/modules/core/data/dialog.store";
import { ref } from "vue";

const $dialog = useDialog();

let valid = ref(false);
const start = defineModel("start", { required: true, default: "" });
const end = defineModel("end", { required: true, default: "" });

start.value = new Date($dialog.data.start).toISOString().substring(0, 10);
end.value   = new Date($dialog.data.end).toISOString().substring(0, 10);

function save() {
  if (valid.value) {
    $dialog.data.onClose({start: start, end: end});
    close();
  }
}

function close() {
  $dialog.close();
}

function validate() {
    if (start.value.length > 0 && end.value.length > 0) {
        valid.value = true;
    } else {
        valid.value = false;
    }
}

</script>

<template>
  <div class="f-row j-between a-end">
    <h2>Search For</h2>
    <div class="f-row a-end nowrap g-2">
      <Button
        v-if="valid"
        iconName="check"
        :iconColor="MatColor.light"
        :bgColor="MatColor.accent"
        @click="save()"
      ></Button>
      <Button
        v-if="!valid"
        iconName="check"
        :iconColor="MatColor.disabled"
        :bgColor="MatColor.transparent"
      ></Button>
      <Button
        iconName="close"
        :iconColor="MatColor.dark"
        :bgColor="MatColor.transparent"
        @click="close()"
      ></Button>
    </div>
    <hr class="my-0" />
  </div>

  <div class="form-control f-row fd-col j-start a-start">
    <label class="text-muted">Start</label>
    <input
      v-model="start"
      type="date"
      @input="validate()"
    />
  </div>
  <div class="form-control f-row fd-col j-start a-start">
    <label class="text-muted">End</label>
    <input
      v-model="end"
      type="date"
      @input="validate()"
    />
  </div>
</template>
