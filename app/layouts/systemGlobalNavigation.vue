<script setup lang="ts">
import LoadingDialog from '~/components/dialogs/LoadingSpiner.vue'

// 航路管理者向けサイドバー
import GlobalNavigationRM from '~/components/navigation/globalNavigationRouteManager.vue'
// 運航事業者向けサイドバー
import GlobalNavigation from '~/components/navigation/globalNavigation.vue'
// 関係者向けサイドバー
import GlobalNavigationSH from '~/components/navigation/globalNavigationStakeholder.vue'

import '~/assets/styles/dialog/customDialog.css'

const isLoading = useState('isLoading', () => {
  return true
})
const role = ref<any>(null)
const cookie_role = ref<any>(null)
const roleCheck = async () => {
  // this.filteredRoutes = this.routes;
  if (import.meta.client) {
    // ロールチェック
    const ownpage_role = ['1', '2', '3']
    cookie_role.value = await roleVerification(ownpage_role)
    if (cookie_role.value.length == 0) {
      console.log(`airwayReservation get role error.`)
      return
    }
    console.log(`virtual_role:${cookie_role.value.virtual_role}`)
    switch (cookie_role.value.virtual_role) {
      case '1':
        role.value = 1 // 航路運営者
        break
      case '2':
        role.value = 2 // 運航事業者
        break
      case '3':
        role.value = 3 // 関係者
        break
      default:
        role.value = null
        break
    }
    console.log(`role:${role.value}`)
  }
}
roleCheck()
</script>

<template>
  <div>
    <v-app>
      <v-main
        id="main"
        class="b-pageMain"
      >
        <ClientOnly>
          <!-- 読み込み中表示スピナー -->
          <LoadingDialog v-model:dialog-visible="isLoading" />
        </ClientOnly>
        <!-- ページコンテンツ部 -->
        <NuxtPage />
      </v-main>
    </v-app>
    <!-- グローバルナビゲーション -->
    <GlobalNavigationRM v-if="role == 1" />
    <GlobalNavigation v-if="role == 2" />
    <GlobalNavigationSH v-if="role == 3" />
  </div>
</template>

<style>
.leaflet-layer {
  filter: grayscale(100%);
}
.v-field__input {
  --v-field-input-padding-top: 16px;
}
</style>
