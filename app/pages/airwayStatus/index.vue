<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRM v-if = "role == 1"/>
  <GlobalNavigation v-if = "role == 2" />
  <GlobalNavigationSH v-if = "role == 3" />

  <!-- コンテンツ -->
  <main id="main" class="b-pageMain">
    <div class="b-pageContentHasSubMenu">
        <!-- テーブル -->
        <AirwayStatusItemList
          v-if="airwayData  && reservationData"
          :reservationData="reservationData"
          :airwayData="airwayData"
        />
    </div>

    <!-- ページナビゲーション -->
    <PageNavigation :back="true">
    </PageNavigation>
  </main>
</template>

<script>
import AirwayStatusItemList from '@/components/AirwayStatusItemList.vue';
// 航路運営者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 運航事業者向けサイドバー
import GlobalNavigation from "~/components/navigation/globalNavigation.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";

export default {
  components: {
    AirwayStatusItemList,
    GlobalNavigationRM,
    GlobalNavigation,
    GlobalNavigationSH,
    PageNavigation
  },
  data() {
    return {
      airwayData: null, 
      reservationData: null,
      cookie_role: null,
      role: null,
    };
  },
  async created() {
    if (process.client) {
      // ロールチェック
      const ownpage_role = ["1","2","3"];
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
  async mounted() {
    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, {all: 'true'}, {});
    console.log(airwayRes);
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      this.airwayData = {};
      return;
    }
    this.airwayData = useAirwayConvertConnectionOrder(airwayRes.data);
    
    let lastPage = 1;
    let currentPage = 1;
    let tmpReservationData = null;
    let reservationUrl = '';
    const reservationApiBaseUrl = useRuntimeConfig().public.reservationApiBaseUrl;

    switch (this.role) {
      case 2:
        reservationUrl = `${reservationApiBaseUrl}/operator/${this.cookie_role.operatorId}/airwayReservations`;
        break;
      case 1:
      case 3:
        reservationUrl = `${reservationApiBaseUrl}/admin/airwayReservations`;
        break;
      default:
        console.log("error: get airway reservation info (permision denied.)");
        this.reservationData = {};
        return;
    }
    let reservationRes = await axios_get(reservationUrl, {}, {});
    console.log(reservationRes);
    if (reservationRes.status != 200) {
      console.error(`error: get airway reservation info {status: ${reservationRes.status}}.`);
      this.reservationData = {};
      return;
    }
    tmpReservationData = reservationRes.data;
    currentPage = 1;
    lastPage = reservationRes.data.lastPage;

    while (currentPage < lastPage) {
      currentPage++;
      let reservationRes = await axios_get(reservationUrl, {page: currentPage}, {});
      console.log(reservationRes);
      if (reservationRes.status != 200) {
        console.error(`error: get airway reservation info {status: ${reservationRes.status}}.`);
        this.reservationData = {};
        return;
      }

      reservationRes.data.result.forEach((reservation) => {
        tmpReservationData.result.push(reservation);
      })
    }

    this.reservationData = tmpReservationData;
  },
};
</script>