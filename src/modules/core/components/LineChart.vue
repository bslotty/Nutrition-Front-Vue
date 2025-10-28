<script setup lang="ts">
import { GChart } from "vue-google-charts";

const { chartData } = defineProps<{
  chartData: any[][];
}>();

const emit = defineEmits<{
  (e: 'select', row: number): void
}>();

let chartOptions = {
  animation: {
    duration: 300,
    easing: "linear",
    startup: true,
  },

  width: 1200,
  height: 400,

  /*  Structure  */
  enableInteractivity: true,
  dynamicResize: true,
  chartArea: {
    left: "0%",
    top: "0%",
    width: "100%",
    height: "100%",
  },
  theme: "maximized",

  /*  Design  */
  backgroundColor: "transparent",
  colors: ["#4CAF50", "#2196F3", "#FFA000", "#9C27B0", "#F44336", "#FFEB3B"],

  tooltip: {
    // trigger: "none",
  },

  /*  Section Specific  */
  legend: {
    position: "none",
  },

  hAxis: {
    format: "MMM d y",
  },
};
const chartEvents = {
  click: (e: any) => emit("select", parseClick(e.targetID)[1]),
};

function parseClick(point: string) {
  let row = -1;
  let col = -1;

  const regex = /(\w+)#([0-9]+)#([0-9]+)/gm;
  let m;
  while ((m = regex.exec(point)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
      regex.lastIndex++;
    }

    row = +m[3];
    col = +m[2];
  }

  return [ col, row ];
}
</script>

<template>
  <div class="grid-center">
    <GChart
      id="table"
      type="LineChart"
      :data="chartData"
      :options="chartOptions"
      :events="chartEvents"
    />
  </div>
</template>
