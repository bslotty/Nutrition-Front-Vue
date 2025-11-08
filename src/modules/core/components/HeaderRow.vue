<script setup lang="ts">
// Optional: Add prop for custom CSS classes
defineProps<{
  class?: string;
}>();
</script>

<template>
  <div :class="['header flex flex-row justify-between items-center mb-2', $props.class]">
    <h2>
      <slot name="title">Default Title</slot>
    </h2>

    <div class="flex flex-row gap-2">
      <slot name="actions"></slot>
    </div>
  </div>
</template>