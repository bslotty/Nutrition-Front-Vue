<script setup lang="ts">
import { MatColor } from "@/modules/core/enums/mat_color"

const props = defineProps<{
  name: string,
  color: MatColor
}>()

const className = MatColor[props.color];
</script>

<template>
    <span class="material-symbols-outlined" :class="className" >{{ name }}</span>
</template>