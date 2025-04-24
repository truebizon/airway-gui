<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRM v-if = "role == 1"/>
  <GlobalNavigationSH v-if = "role == 3" />

  <!-- コンテンツ -->
  <main id="main" class="b-pageMain">
    <div class="b-pageContentHasSubMenu">
      <!-- メインコンテンツ -->
      <div class="b-pageContentHasNavigation">
        <fallToleranceRangeList />
      </div>

      <!-- ページナビゲーション -->
      <PageNavigation :back="false">
        <ul class="e-buttonGroup">
          <li>
            <button @click="navigate"  class="e-button">新規作成</button>
          </li>
        </ul>
      </PageNavigation>
    </div>
  </main>
</template>

<script>
// 航路運営者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";

export default {
  methods: {
    navigate() {
      this.$router.push({
        path: '/fallToleranceRange/newFallToleranceRange',
      });
    }
  },
  components: {
    GlobalNavigationRM,
    GlobalNavigationSH,
    PageNavigation,
  },
  data() {
    return {
      cookie_role: null,
      role: null,
    };
  },
  async created() {
    if (process.client) {
      // ロールチェック
      const ownpage_role = ["1"];
      this.cookie_role = await roleVerification(ownpage_role);
      if (Object.keys(this.cookie_role).length == 0) {
        console.log(`airwayReservation get role error.`);
        return;
      }
      console.log(`virtual_role:${this.cookie_role.virtual_role}`);
      switch (this.cookie_role.virtual_role) {
        case "1":
          this.role = 1;  // 航路運営者
          break;
        case "3":
          this.role = 3; // 関係者
          break;
        default:
          this.role = null;
          break;
      }
      console.log(`role:${this.role}`);
    }
  },
}
</script>