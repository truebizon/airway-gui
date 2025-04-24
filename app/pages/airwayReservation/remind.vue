<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRM v-if = "role == 1"/>
  <GlobalNavigation v-if = "role == 2" />
  <GlobalNavigationSH v-if = "role == 3" />

  <!-- コンテンツ -->
  <main id="main" class="b-pageMain">
    <div class="b-pageContentHasNavigation">

      <!-- ヘッダ -->
      <div class="drn_header">
        <div class="drn_header__item">
          <v-card-title class="drn_header__title">航路予約<br><div class="drn_form__title">ドローン機体予約確認</div></v-card-title>
        </div>
      </div>

      <div id="content" class="b-singleColumn">
        <div class="content-remind">
          <h2 class="drn_header__title">ご確認</h2>
          <p>ドローン機体の準備は済ませましたか？<br>お持ちの機体を準備するか、航路予約前にドローン機体の予約をお願いします。</p>
          <ul class="e-buttonGroup">
            <li>
              <a href="/drone" class="e-button">
                <p>
                  <img src="@/assets/css/img/dummyImg/dummy_legendIcon_drawn.svg">
                </p>
                <p>　　いいえ　</p>
              </a>
            </li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li>
              <a href="/airwayReservation/newReservation" class="e-button">　　はい　</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ページナビゲーション -->
    <PageNavigation :back="true">
      <ul class="e-buttonGroup">
      </ul>
    </PageNavigation>
  </main>
</template>

<script>
import { ref } from "vue";
// 航路運営者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 運航事業者向けサイドバー
import GlobalNavigation from "~/components/navigation/globalNavigation.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";

export default {
  components: {
    GlobalNavigationRM,
    GlobalNavigation,
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
      const ownpage_role = ["2"];
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
        case "2":
          this.role = 2;  // 運航事業者
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

<style>
.header {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.content-remind {
  display: grid;
  row-gap: 2rem;
  align-content: center;
  align-items: center;
  justify-content: center;
  justify-items: center;
  position: fixed;
  inset: 0;
  margin: auto;
  width: 80%;
  min-width: 30rem;
  height: 80%;
  min-height: 30rem;
}
</style>
