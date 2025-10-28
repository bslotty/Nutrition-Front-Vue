<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import SiteHeader from "./modules/core/components/SiteHeader.vue";
import Dialog from "@/modules/core/dialogs/Dialog.vue"
</script>

<template>
  <div class="container">
    <SiteHeader />
    <RouterView />
    <Dialog></Dialog>
  </div>
</template>
