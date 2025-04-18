<script setup lang="ts">
const { width = '1300px' } = defineProps({
  width: String,
})
/*
const searchOptionVisible = ref<boolean>(false)
*/
const searchOptionChecked = ref<boolean>(true)
/*
const labelColor = ref('black')
watch(searchOptionVisible, (newVal) => {
  searchOptionChecked.value = !newVal
  labelColor.value = newVal ? 'grey' : 'black'
})
*/

const emit = defineEmits(['search-button-click', 'reset-button-click'])

// 検索ボタン押下
const onSearchButtonClick = () => {
  emit('search-button-click')
  searchOptionChecked.value = true
}

// 検索条件リセットボタン押下
const onSearchConditionsResetButtonClick = () => {
  emit('reset-button-click')
}
</script>

<template>
  <div>
    <!--
    <v-menu
      v-model="searchOptionVisible"
      :close-on-content-click="false"
      location="bottom"
      activator="parent"
      no-click-animation
    >
  -->
    <!--
    <template #activator="{ props }">
      -->
    <!--
        <v-checkbox
          v-bind="props"
          v-model="searchOptionChecked"
          true-icon="mdi-plus-circle"
          false-icon="mdi-minus-circle"
          hide-details
          density="compact"
        >
          <template #label>
            <div
              class="font-weight-light"
              :style="{ color: labelColor }"
            >
              オプション検索
            </div>
          </template>
        </v-checkbox>
        -->
    <v-btn
      variant="outlined"
      rounded="pill"
      class="drn_header__btn drn_header__btn--filter"
      @click="searchOptionChecked = !searchOptionChecked"
    >
      <img
        class="drn_btn__filter"
        src="/assets/css/img/main/filter-solid.svg"
        width="15"
        height="15"
      >
      絞り込み
    </v-btn>
    <!--
</template>
-->
    <div
      v-if="!searchOptionChecked"
      class="h-popup"
      :style="{ width: width }"
    >
      <!-- 検索ボックス -->
      <!--
      <v-sheet
        width="92vw"
        height="57vh"
        elevation="5"
        rounded="0"
        border="md"
        style="border-color: #000000 !important;"
        class="text-h6"
      > -->
      <v-row
        align="center"
        style="height: 100%;width: 100%"
        class="pl-15 pr-10 py-3"
      >
        <v-col>
          <slot name="searchContents" />
          <v-row no-gutters>
            <v-col class="d-flex align-center justify-center py-5">
              <v-btn
                color="black"
                size="x-large"
                width="10vw"
                @click="onSearchButtonClick"
              >
                検索
              </v-btn>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="d-flex align-center justify-center">
              <span
                class="link-button text-body-1"
                @click="onSearchConditionsResetButtonClick"
              >検索条件をリセットする</span>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <!--
      </v-sheet>
    -->
    <!-- </v-menu> -->
    </div>
  </div>
</template>

<style scoped>
.link-button {
  color: #000000;
  text-decoration: underline;
}
.link-button:hover {
  color: #000000;
  text-decoration: auto;
  cursor: pointer;
}
</style>

<style>
/* モーダルウィンドウのスタイル */
.h-popup {
  position: absolute;
  /*left: 40dvh;*/
  left: 10%;
  top: 80px; /* 画像ボタンの位置に合わせて調整 */
  /*width: 1180px;*/
  /*height: 231px;*/
  background-color: #fefefe;
  border: 1px solid #888;
  padding-top: 21px;
  padding-left: 55px;
  padding-right: 55px;
  z-index: 10000;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}
</style>
