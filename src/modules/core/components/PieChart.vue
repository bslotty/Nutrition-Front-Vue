<script setup lang = "ts">
import { GChart } from 'vue-google-charts'

const { chartData } = defineProps<{
  chartData: any[][];
}>();

let chartOptions = {
  animation: {
    duration: 300,
    easing  : "linear",
    startup : true,
  },

  width : 2000,
  height: 2000,

    /*  Structure  */
  enableInteractivity: false,
  dynamicResize      : true,
  chartArea          : {
    left  : "0%",
    top   : "%0",
    width : "100%",
    height: "90%",
  },
  theme: "maximized",

    /*  Design  */
  backgroundColor: "transparent",
  colors         : ["#4CAF50", "#2196F3", "#FFA000", "#9C27B0", "#F44336", "#FFEB3B"],

  pieHole     : 0,
  pieSliceText: "none",
  tooltip     : {
    trigger: "none",
  },

    /*  Section Specific  */
  legend: {
    position: "none",
  },
};

function onChartReady() {}
</script>

<template>
  <GChart
      type   = "PieChart"
    :data    = "chartData"
    :options = "chartOptions"
      @ready = "onChartReady"
    :width   = "2000"
    :height  = "2000"
  />
</template>
