<script lang="ts" setup>
import { useRoute } from 'vue-router';
import router from "@/router";
import Button from 'primevue/button';

interface NavItem {
  name: string;
  label: string;
  severity: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'protein';
}

const route = useRoute();

const navItems: NavItem[] = [
  { name: 'food-list', label: 'Foods', severity: 'primary' },
  { name: 'intake-list', label: 'Intake', severity: 'secondary' },
  { name: 'weight-list', label: 'Weight', severity: 'warning' },
  { name: 'exercise-list', label: 'Exercise', severity: 'warning' }
];

function navigateTo(routeName: string): void {
  router.push({ name: routeName });
}

function isCurrentRoute(routeName: string): boolean {
  return route.name === routeName;
}
</script>

<template>
  <nav class="f-row wrap j-between a-center py-3">
    <h1>Nutrition</h1>
    <div class="f-row wrap g-3">
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
  <hr class="thick mat-warn" />
</template>