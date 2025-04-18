<!-- 一覧テーブル用ページングUI部品（サーバーサイドページング） -->
<script setup lang="ts">
const props = defineProps({
  currentPage: {
    // 現在のページ
    type: Number,
    default: 0,
    required: true,
  },
  totalVisible: {
    // 1 .... 4 5 6 ... 100のように表示するページの数（左記の場合は5）
    type: Number,
    default: 0,
    required: true,
  },
  lastPage: {
    // ページ総数
    type: Number,
    default: 0,
    required: true,
  },
  totalItems: {
    // データ総数（件数表示に使用）
    type: Number,
    default: 0,
    required: true,
  },
  perPage: {
    // 一ページに表示しているデータ数（件数表示に使用）
    type: Number,
    default: 0,
    required: true,
  },
})
const page = ref(props.currentPage)
const emit = defineEmits(['updatePage'])
/**
 * 呼び出し元からページ数設定
 */
watch(() => props.currentPage, (newVal) => {
  if (page.value !== newVal) {
    page.value = newVal
  }
})
/**
 * ページ変更時に変更後のページをemit
 * ※v-pagingのアクションでトリガーされる。v-modelに設定しているpageの変更ではトリガーされない。
 */
const updatePage = () => {
  emit('updatePage', page.value)
  if (page.value !== props.currentPage) {
    page.value = props.currentPage
  }
}
/**
 * ページング左部テキスト更新
 */
const updateKensuHyouji = () => {
  if (props.totalItems === 0) {
    return ''
  }
  // 一ページ目の場合は1
  const kensuFirst = props.currentPage === 1 ? 1 : props.currentPage * props.perPage - props.perPage + 1
  // 最終ページの場合は総件数
  const kensuLast = props.currentPage * props.perPage > props.totalItems ? props.totalItems : props.currentPage * props.perPage

  // "XX～YY件目（ZZ件中）"
  return String(kensuFirst) + '～' + String(kensuLast) + '件目（' + String(props.totalItems) + '件中）'
}
</script>

<template>
  <!-- 表示域を超えてもページング部分にスクロール表示しない。 -->
  <div
    class="d-flex justify-end"
  >
    <p class="align-self-center pr-1">
      {{ updateKensuHyouji() }}
    </p>
    <v-pagination
      v-model="page"
      density="comfortable"
      :total-visible="totalVisible"
      :length="lastPage"
      show-first-last-page
      @update:model-value="updatePage"
    />
  </div>
</template>

<style scoped>
.v-pagination :deep(.v-btn) {
  width: 100%;
  padding: 0 12px 0 12px;
}
.v-pagination
  :deep(.v-pagination__item),
  :deep(.v-pagination__first),
  :deep(.v-pagination__prev),
  :deep(.v-pagination__next),
  :deep(.v-pagination__last)
  {
    margin: 0.3em 1px 0.3em 1px !important;
}
</style>
