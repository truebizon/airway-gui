<script setup>
/**
 * 関係者向け　ログイン済みグローバルナビゲーション
 */

import AccessibleNavigation from "../common/accessibleNavigation.vue";
import SystemInformation from "./systemInformation.vue";
import SystemSetting from "./systemSetting.vue";
import systemMenuStakeholder from "./systemMenuStakeholder.vue";
</script>

<template>
  <div class="b-globalNavagation">
    <!-- システムメニュースキップ -->
    <AccessibleNavigation />

    <!-- システムヘッダー（トップページ） -->
    <header class="b-systemHeader">
      <!-- システム情報 -->
      <SystemInformation />

      <!-- システム情報・設定 -->
      <SystemSetting />
    </header>

    <!-- システムナビゲーション -->
  </div>

  <!-- システムナビゲーション -->
  <systemMenuStakeholder />
</template>
