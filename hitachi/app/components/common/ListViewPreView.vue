<!-- リストビュープレビュー切り替えUI部品 -->
<script setup lang="ts">
const props = defineProps({
  displayFormat: {
    // 選択されている項目（listView/preView）
    type: String,
    default: 'listView',
    required: true,
  },
})
const emit = defineEmits(['update:displayFormat'])
const selectedDisplayFormat = ref(props.displayFormat)
watch(() => selectedDisplayFormat.value, (newVal) => {
  emit('update:displayFormat', newVal)
})
</script>

<template>
  <!--
  <v-row
    justify="end"
    no-gutters
  >
  -->
  <!--
    <v-btn-toggle
      v-model="selectedDisplayFormat"
      color="black"
      tile
      border
      divided
      elevation="0"
      density="compact"
      valiant="text"
      mandatory
      size="small"
      style="border-color: black"
    >
      <v-btn
        width="230"
        value="listView"
      >
        リストビュー
      </v-btn>
      <v-btn
        width="230"
        value="preView"
      >
        プレビュー
      </v-btn>
    </v-btn-toggle>
  -->
  <v-btn-toggle
    v-model="selectedDisplayFormat"
    mandatory
    variant="flat"
    rounded="pill"
    border
    density="comfortable"
    class="drn_toggle drn_toggle--viewtype"
  >
    <v-btn
      value="listView"
      class="drn_toggle__btn"
    >
      <img
        src="/assets/css/img/main/list-solid.svg"
        width="15"
        height="15"
      >
    </v-btn>
    <v-btn
      value="preView"
      class="drn_toggle__btn"
    >
      <img
        src="/assets/css/img/main/map-regular.svg"
        width="20"
        height="20"
      >
    </v-btn>
  </v-btn-toggle>
  <!--
  </v-row>
  -->
</template>

<style scoped>
/*
.v-btn-group {
  border-color: black !important;
}
.v-btn-group--density-compact.v-btn-group {
  height: 28px;
}
*/
</style>
