<script lang="ts" setup>
import { useRoute } from 'vue-router';
import router from "@/router";
import Button from 'primevue/button';

interface NavItem {
  name: string;
  label: string;
  severity: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger';
}

const route = useRoute();

const navItems: NavItem[] = [
  { name: 'food-list', label: 'Foods', severity: 'danger' },
  { name: 'recipe-list', label: 'Recipes', severity: 'warn' },
  { name: 'intake-list', label: 'Intake', severity: 'primary' },
  { name: 'weight-list', label: 'Weight', severity: 'info' },
  { name: 'exercise-list', label: 'Exercise', severity: 'success' }
];

function navigateTo(routeName: string): void {
  router.push({ name: routeName });
}

function isCurrentRoute(routeName: string): boolean {
  return route.name === routeName;
}
</script>

<template>
  <nav class="flex flex-row flex-wrap justify-between items-center py-3">
    <h1>Nutrition</h1>
    <div class="flex flex-row flex-wrap gap-3">
      <Button
        v-for="item in navItems"
        :key="item.name"
        :label="item.label"
        :severity="item.severity"
        :raised="isCurrentRoute(item.name)"
        :outlined="!isCurrentRoute(item.name)"
        @click="navigateTo(item.name)"
      />
    </div>
  </nav>
  <hr class="m-0 border-t-4 border-[var(--color-warn)]" />
</template>