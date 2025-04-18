<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
    required: false,
  },
  message: {
    type: String,
    default: 'message',
    required: false,
  },
  dialogVisible: {
    type: Boolean,
    required: true,
  },
  dialogType: {
    // confirm or info or error
    type: String,
    default: 'confirm',
  },
})
const emit = defineEmits(['update:dialogVisible', 'ok', 'cancel'])
const isOpen = ref(props.dialogVisible)
watch(() => props.dialogVisible, (newVal) => {
  isOpen.value = newVal
})
watch(() => isOpen.value, () => {
  emit('update:dialogVisible', isOpen.value)
})

const handleOk = () => {
  isOpen.value = false
  emit('ok')
}
const handleCancel = () => {
  isOpen.value = false
  emit('cancel')
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    persistent
    no-click-animation
    height="80%"
    width="80%"
    min-width="30rem"
    min-height="30rem"
  >
    <div
      class="dialog-area"
    >
      <v-card
        variant="flat"
        class="dialog-card"
      >
        <template v-if="props.title">
          <v-card-title class="card-title">
            {{ props.title }}
          </v-card-title>
        </template>
        <v-card-text
          class="card-text"
          style="font-size: 1.2rem;"
        >
          <v-row
            v-if="$slots.customDialogMessage"
            class="pb-5"
          >
            <v-col class="d-flex align-center justify-center">
              <slot name="customDialogMessage" />
            </v-col>
          </v-row>
          <v-row
            v-else
          >
            <v-col class="d-flex align-center justify-center">
              {{ props.message }}
            </v-col>
          </v-row>
          <v-row
            class="pb-5"
          >
            <v-col
              v-if="$slots.customDialogBodyText"
              class="d-flex align-center justify-center"
            >
              <slot name="customDialogBodyText" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-row v-if="$slots.customDialogButton">
            <slot name="customDialogButton" />
          </v-row>
          <v-row v-else>
            <v-btn
              v-if="dialogType==='confirm'"
              class="mx-2 dialog-button"
              variant="outlined"
              rounded="0"
              size="large"
              text="キャンセル"
              @click="handleCancel"
            />
            <v-btn
              class="mx-2 dialog-button"
              variant="outlined"
              rounded="0"
              size="large"
              text="OK"
              @click="handleOk"
            />
          </v-row>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<style scoped>
.dialog-area{
  height: 100%;
  width: 100%;
  background-color: white;
  border: 1px solid #000000;
  align-content: center;
  justify-items: center;
}

.dialog-card{
  min-height: 55%;
  justify-items: center;
}

.card-title{
  font-size: 1.714rem;
  font-weight: normal;
  margin-bottom: 4rem;
}

.dialog-button{
  border: 1px solid #000000;
  padding: 0 1rem;
}

.card-text {
  line-height: 2rem;
  min-height: 2rem;
  max-width: 900px;
  overflow-wrap: normal;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
