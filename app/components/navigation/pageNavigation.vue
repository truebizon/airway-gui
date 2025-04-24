<script setup>
const { back = false } = defineProps({
  back: Boolean,
});
</script>

<template>
  <nav class="b-pageNavigation">
    <!-- 対象要素への操作 -->
    <slot></slot>

    <!-- 取り消し関連操作 -->
    <!-- 標示と文書の順序は逆に設定 -->
    <ul v-if="back" class="e-buttonGroup">
      <li>
        <button class="e-button-back" @click="goBack">戻る</button>
      </li>
    </ul>
  </nav>
</template>

<script>
const goBack = () => {
  window.history.back(); // 一つ前のページに戻る
};
</script>