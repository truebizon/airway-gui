<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  portType: {
    type: String,
    default: '',
    required: false,
  },
  size: {
    type: Number,
    default: 50,
    required: false,
  },
})
const bgColor = props.portType
const svgSize = props.size
</script>

<template>
  <svg
    :width="svgSize"
    :height="svgSize"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      :x="svgSize/10"
      :y="svgSize/10"
      :width="(svgSize/5)*4"
      :height="(svgSize/5)*4"
      :fill="bgColor"
      stroke="black"
      :stroke-width="1.5"
    />
    <text
      :x="svgSize/2"
      :y="(svgSize/50)*32"
      :font-size="36*(svgSize/50)"
      text-anchor="middle"
      fill="black"
      font-family="Arial"
      font-weight="bold"
      dy=".13em"
    >E</text>
  </svg>
</template>

<style scoped>
.error-message {
  color: red;
}
</style>
