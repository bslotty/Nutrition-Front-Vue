<script setup lang="ts"></script>
<template>
  <div class="grid-center">
    <div class="loader-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 60 20"
        width="75px"
        height="20px"
      >
        <circle
          class="svg__fill svg__stroke svg_strokeWidth"
          fill="currentColor"
          r="5"
          cx="10"
          cy="10"
        >
          <animate
            attributeName="opacity"
            calcMode="spline"
            dur="1.1"
            values="1;0;1;"
            keySplines=".5 0 .5 1;.5 0 .5 1"
            repeatCount="indefinite"
            begin="-.4"
          ></animate>
        </circle>
        <circle
          class="svg__fill svg__stroke svg_strokeWidth"
          fill="currentColor"
          r="5"
          cx="30"
          cy="10"
        >
          <animate
            attributeName="opacity"
            calcMode="spline"
            dur="1.1"
            values="1;0;1;"
            keySplines=".5 0 .5 1;.5 0 .5 1"
            repeatCount="indefinite"
            begin="-.2"
          ></animate>
        </circle>
        <circle
          class="svg__fill svg__stroke svg_strokeWidth"
          fill="currentColor"
          r="5"
          cx="50"
          cy="10"
        >
          <animate
            attributeName="opacity"
            calcMode="spline"
            dur="1.1"
            values="1;0;1;"
            keySplines=".5 0 .5 1;.5 0 .5 1"
            repeatCount="indefinite"
            begin="0"
          ></animate>
        </circle>
      </svg>
    </div>
  </div>
</template>