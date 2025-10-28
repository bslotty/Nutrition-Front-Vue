<script lang="ts" setup>
import { computed } from "vue";
import Button from "@/modules/core/components/Button.vue";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import FormInput from "@/modules/core/components/FormInput.vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import { useDialog } from "@/modules/core/data/dialog.store";

const $dialog = useDialog();

// Models
const pounds = defineModel("pounds", { required: true, default: 0 });
const date = defineModel("date", { required: true, default: new Date() });

// Initialize from dialog data
pounds.value = $dialog.data.pounds || 0;
date.value = $dialog.data.date ? new Date($dialog.data.date) : new Date();

// Computed validation
const isValid = computed(() => {
  return pounds.value > 0 && date.value !== null;
});

const poundsError = computed(() => {
  if (!pounds.value || pounds.value <= 0) {
    return "Weight must be greater than 0";
  }
  return "";
});

const dateError = computed(() => {
  if (!date.value) {
    return "Date is required";
  }
  return "";
});

// Actions
function handleSave() {
  if (isValid.value) {
    $dialog.data.onClose({
      id: $dialog.data.id,
      date: date.value.toISOString(),
      pounds: pounds.value,
    });
    $dialog.close();
  }
}

function handleClose() {
  $dialog.close();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Enter" && isValid.value) {
    handleSave();
  } else if (event.key === "Escape") {
    handleClose();
  }
}
</script>

<template>
  <div class="p-4">
    <HeaderRow class="mb-3">
      <template #title>Weight Details</template>
      <template #actions>
        <Button
          icon="pi pi-check"
          severity="success"
          :disabled="!isValid"
          @click="handleSave"
        />
        <Button
          icon="pi pi-times"
          severity="secondary"
          text
          @click="handleClose"
        />
      </template>
    </HeaderRow>

    <div class="flex gap-3">
      <!-- Date Input -->
      <FormInput 
        label="Date" 
        required 
        :error="dateError"
        class="flex-1"
      >
        <template #input>
          <DatePicker
            v-model="date"
            dateFormat="yy-mm-dd"
            showIcon
            class="w-full"
            @keydown="handleKeydown"
          />
        </template>
      </FormInput>

      <!-- Weight Input -->
      <FormInput 
        label="Weight (lbs)" 
        required 
        :error="poundsError"
        class="flex-1"
      >
        <template #input>
          <InputNumber
            v-model="pounds"
            :min="0"
            :max="999"
            :minFractionDigits="1"
            :maxFractionDigits="1"
            suffix=" lbs"
            placeholder="0.0"
            class="w-full"
            @keydown="handleKeydown"
          />
        </template>
      </FormInput>
    </div>
  </div>
</template>