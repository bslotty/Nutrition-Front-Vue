<script setup lang="ts" generic="T">
defineProps<{
  loading: boolean;
  items: T[];
  listClass?: string;
  emptyMessage?: string;
  emptyIcon?: string;
}>();
</script>

<template>
  <!-- Message Slot (for errors, warnings, info) -->
  <div v-if="$slots.message" class="message-container" role="alert">
    <slot name="message"></slot>
  </div>

  <!-- Loading State -->
  <div v-else-if="loading" class="loading" role="status" aria-live="polite">
    <span class="spinner"></span>
    <span class="sr-only">Loading...</span>
  </div>

  <!-- Empty State -->
  <div v-else-if="items.length === 0" class="empty-state-main" role="status">
    <span class="material-icons">{{ emptyIcon || 'inbox' }}</span>
    <h3>{{ emptyMessage || '0 Results' }}</h3>
  </div>

  <!-- List Items -->
  <div v-else :class="['items-list', listClass]" role="list">
    <slot 
      name="list-item" 
      v-for="(item, index) in items" 
      :item="item" 
      :index="index"
      :key="index"
    ></slot>
  </div>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>