<script lang="ts" setup>
import { computed } from "vue";
import Button from "@/modules/core/components/Button.vue";
import HeaderRow from "@/modules/core/components/HeaderRow.vue";
import FormInput from "@/modules/core/components/FormInput.vue";
import InputText from "primevue/inputtext";
import { useDialog } from "@/modules/core/data/dialog.store";

const $dialog = useDialog();

// Model
const name = defineModel("name", { required: true, default: "" });

// Validation regex pattern
const VALID_NAME_PATTERN = /[\w\-\.@ !#$%^+]+/gm;

// Computed validation
const isValid = computed(() => {
  if (!name.value.trim()) return false;
  const match = name.value.match(VALID_NAME_PATTERN);
  return match !== null;
});

const errorMessage = computed(() => {
  if (name.value.length === 0) return "";
  if (!isValid.value) return "Name contains invalid characters";
  return "";
});

// Actions
function handleSave() {
  if (isValid.value) {
    $dialog.data.onClose(name.value);
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
  <div class="px-4 py-4">
    <HeaderRow class="mb-3">
      <template #title>Search For</template>
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

    <FormInput 
      label="Name" 
      required 
      :error="errorMessage"
    >
      <template #input>
        <InputText
          v-model="name"
          type="text"
          placeholder="Enter name to search"
          class="w-full"
          autofocus
          @keydown="handleKeydown"
        />
      </template>
    </FormInput>
  </div>
</template>