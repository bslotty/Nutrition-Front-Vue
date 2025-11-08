<script lang="ts" setup>
import { computed } from "vue";
import Button from "primevue/button";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import FormInput from "@/modules/core/components/FormInput.vue";
import InputNumber from "primevue/inputnumber";
import DatePicker from "primevue/datepicker";
import { useDialog } from "@/modules/core/data/dialog.store";
import { useWeightStore } from "../data/Weight.store";

const $dialog = useDialog();
const $weight = useWeightStore();
const confirm = useConfirm();

// Models
const pounds = defineModel("pounds", { required: true, default: 0 });
const date = defineModel("date", { required: true, default: new Date() });

// Initialize from dialog data
pounds.value = $dialog.data.pounds || 0;
date.value = $dialog.data.date ? new Date($dialog.data.date) : new Date();

// Computed properties
const isCreateMode = computed(() => {
  return $dialog.data?.id === 'create';
});

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

function handleDelete() {
  confirm.require({
    message: 'Are you sure you want to delete this weight entry?',
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await $weight.weight$.delete();
        if ($dialog.data?.onDelete) {
          await $dialog.data.onDelete();
        }
        $dialog.close();
      } catch (error) {
        // Failed to delete weight
      }
    }
  });
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
  <div class="px-4 py-4">
    <HeaderRow class="mb-3">
      <template #title>Weight Details</template>
      <template #actions>
        <Button
          v-if="!isCreateMode"
          icon="pi pi-trash"
          severity="danger"
          outlined
          @click="handleDelete"
          aria-label="Delete weight"
        />
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

    <!-- Confirmation dialog -->
    <ConfirmDialog />
  </div>
</template>