<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  bgColor: {
    type: String,
    default: '',
    required: false,
  },
})
const bgColor = props.bgColor
</script>

<template>
  <span
    class="circle-marker"
    :style="{ 'background-color': bgColor }"
  />
</template>

<style scoped>
.circle-marker {
  display: inline-block;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}
</style>
