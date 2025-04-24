<script setup>
import GlobalNavigationRouteManager from "~/components/navigation/globalNavigationRouteManager.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";
</script>

<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRouteManager />

  <!-- コンテンツ -->
  <main id="main" class="b-pageMain">
    <div class="b-pageContentHasSubMenu">
      <!-- メインコンテンツ -->
      <div class="b-pageContentHasNavigation">
        <StakeholdersList />
      </div>
      <!-- .b-pageContentHasNavigation -->

      <!-- ページナビゲーション -->
      <PageNavigation :back="false">
      </PageNavigation>
    </div>
    <!-- .b-pageContentHasSubMenu -->
  </main>
  <!-- .b-pageMain -->
</template>
