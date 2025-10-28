<script setup lang="ts">
import PrimeButton from 'primevue/button';

defineProps<{
  label?: string;
  icon?: string;
  severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger' | 'contrast';
  outlined?: boolean;
  text?: boolean;
  size?: 'small' | 'large';
  loading?: boolean;
  disabled?: boolean;
}>();
</script>

<template>
  <PrimeButton
    :label="label"
    :icon="icon"
    :severity="severity"
    :outlined="outlined"
    :text="text"
    :size="size"
    :loading="loading"
    :disabled="disabled"
  />
</template>