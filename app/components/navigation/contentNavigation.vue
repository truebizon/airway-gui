<script setup>
const { back = false } = defineProps({
  back: Boolean,
});
</script>

<template>
  <nav class="b-contentNavigation">
    <!-- 対象要素への任意の操作ボタン設定エリア -->
    <slot></slot>

    <!-- 取り消し関連操作 -->
    <!-- 標示と文書の順序は逆に設定 -->
    <ul v-if="back" class="e-buttonGroup">
      <li>
        <button class="e-button">戻る</button>
      </li>
    </ul>
  </nav>
</template>
