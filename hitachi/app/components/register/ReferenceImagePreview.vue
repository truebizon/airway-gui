<script setup lang="ts">
import { ref } from 'vue'
import { utils } from '@/utils/utils.js'

const props = withDefaults(
  defineProps<{
    modelValue: string
  }>(),
  {
    modelValue: '', // デフォルト値を指定
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', text: string): void
}>()

const base64Text = computed({
  get: () => props.modelValue,
  set: (value) => { // 値に変更があると呼ばれるsetter
    emit('update:modelValue', value)
  },
})

const file_input = ref<HTMLInputElement | null>(null)
const select_file = () => {
  if (file_input.value) {
    // v-file-inputクリック時のイベントを起こす
    file_input.value.click()
  }
}

const loadFile = (event: any) => {
  const reader = new FileReader()
  const file = event.target.files[0]
  if (file) {
    if (file.size >= 2097152) {
      return
    }
    reader.readAsDataURL(file)
  }
  reader.onload = () => {
    if (String(reader.result).length <= 5242880) {
      base64Text.value = String(reader.result)
    }
    if (file_input.value) {
      file_input.value.value = ''
    }
  }
}

const delete_file = () => {
  base64Text.value = ''
}
</script>

<template>
  <div>
    <v-container height="100%">
      <v-layout>
        <v-sheet
          height="40vh"
          width="20vw"
          border="lg"
          class="mx-auto"
          style="display: flex; justify-content: center; align-items: center;"
        >
          <v-img
            v-if="base64Text"
            :src="base64Text"
            height="100%"
            width="100%"
          />
          <div
            v-else
            style="display: flex;  flex-flow: column; align-items: center;"
          >
            <v-icon
              size="x-large"
              icon="mdi-image-off"
              color="blue"
            />
            <div>
              (2MBまで)
            </div>
          </div>
        </v-sheet>
      </v-layout>
      <v-layout>
        <v-row
          no-gutters
          justify="space-around"
        >
          <v-btn
            class="mt-8 mb-2 e-button-scoped"
            size="large"
            @click="select_file"
          >
            参照
          </v-btn>
          <v-btn
            class="mt-8 mb-2 e-button-scoped"
            :disabled="utils.isBlank(base64Text)"
            size="large"
            color="red-darken-1"
            @click="delete_file"
          >
            削除
          </v-btn>
          <v-file-input
            ref="file_input"
            style="display:none;"
            accept="image/*"
            @change="loadFile"
          />
        </v-row>
      </v-layout>
    </v-container>
  </div>
</template>

<style scoped>
/** グローバルCSS「.e-button」流用 */
.e-button-scoped {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
  border-radius: 50px;
  background-color: #2c69ff;
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  position: relative; /* 必要に応じて追加 */
  height: 48px !important;
}
</style>
