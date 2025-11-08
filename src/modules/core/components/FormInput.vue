<script setup lang="ts">
defineProps<{
  label?: string;
  error?: string;
  required?: boolean;
}>();
</script>

<template>
  <div class="form-input">
    <!-- Label Slot -->
    <div v-if="$slots.label || label" class="form-label">
      <slot name="label">
        <label>
          {{ label }}
          <span v-if="required" class="required">*</span>
        </label>
      </slot>
    </div>

    <!-- Input Slot -->
    <div class="form-control" :class="{ error: error || $slots.error }">
      <slot name="input"></slot>
    </div>

    <!-- Error Message -->
    <Transition name="error">
      <div v-if="$slots.error || error" class="form-error">
        <slot name="error">
          <span class="error-text">{{ error }}</span>
        </slot>
      </div>
    </Transition>
  </div>
</template>