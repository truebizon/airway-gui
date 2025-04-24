<script setup>
import AccessibleNavigation from "../common/accessibleNavigation.vue";
import SystemInformation from "./systemInformation.vue";
</script>

<template>
  <div class="b-globalNavagation">
    <!-- システムメニュースキップ -->
    <AccessibleNavigation />

    <!-- システムヘッダー（トップページ） -->
    <header class="b-systemHeader">
      <!-- システム情報 -->
      <SystemInformation />

      <!-- ログインページでは、サイト名をh1要素とする -->
      <h1 class="u-invisible">ドローン航路システム（名称仮）</h1>
    </header>
  </div>
</template>
