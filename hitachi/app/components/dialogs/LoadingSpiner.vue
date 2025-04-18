<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: true,
    required: true,
  },
})
const isOpen = ref(props.dialogVisible)
watch(() => props.dialogVisible, (newVal) => {
  isOpen.value = newVal
})
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    width="300"
  >
    <v-progress-circular
      indeterminate
      size="128"
      color="primary"
    />
  </v-dialog>
</template>

<style scoped>
.v-dialog :deep(.v-overlay__content) {
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none;
}
</style>
