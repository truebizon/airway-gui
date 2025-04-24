<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRM v-if = "role == 1"/>
  <GlobalNavigation v-if = "role == 2" />
  <GlobalNavigationSH v-if = "role == 3" />

  <!-- コンテンツ -->
  <main id="main" class="b-pageMain">
    <div class="b-pageContentHasSubMenu">
      <!-- モーダルウィンドウ -->
      <div v-if="showStakeholdersPopup" class="popup">
        <div class="item-center">
          <v-data-table
            v-model:items-per-page="itemsPerPage"
            :items="stakeholders"
            item-value="operatorId"
            item-key="operatorId"
            class="elevation-1"
            hide-default-header
            hide-default-footer
            style="max-height: 400px; overflow-y: auto;"
            :items-per-page-options="[5, 10, 15, 20]"
          >
            <template v-slot:top>
              <thead>
                <tr>
                  <th style="width: 100px; text-align: center; align-items: center;">
                    <v-checkbox
                      v-model="stakeholdersAllSelected"
                      @change="toggleSelectAll"
                    ></v-checkbox>
                  </th>
                  <th style="width: 300px; text-align: center; align-items: center;">事業者・会社名</th>
                  <th style="width: 300px; text-align: center; align-items: center;">区分</th>
                </tr>
              </thead>
            </template>

            <template v-slot:item="{ item }">
              <tr>
                <td style="width: 100px; text-align: center;table-layout: fixed;">
                  <v-checkbox
                    v-model="stakeholdersSelected"
                    :value="item.operatorId"
                    @click.stop
                  ></v-checkbox>
                </td>
                <td style="width: 300px; text-align: left;">{{ item.operatorName }}</td>
                <td style="width: 300px; text-align: left;">{{ item.roleList }}</td>
              </tr>
            </template>
          </v-data-table>
        </div>
        <div class="item-center">
          <input type="button" class="e-button-add" value="登録" @click="stakeholdersRegister" />
        </div>      
      </div>

    <!-- メインコンテンツ -->
    <div class="b-pageContentHasNavigation">
    <div class="drn_main__app">
    <div variant="flat" class="drn_main__content">
      <!-- ヘッダ -->
      <div class="drn_header">
        <div class="drn_header__item">
          <v-card-title class="drn_header__title">航路画定詳細</v-card-title>
        </div>
      </div>

      <!-- 詳細情報 -->
      <v-card-text class="drn_content">
      <div class="drn_content__body">
        <v-sheet class="drn_content__data">
          <table class="drn_table drn_table--reserve_conf">
            <tbody>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路ID</th>
                <td class="drn_table__data">{{ airwayId }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">申請状況</th>
                <td class="drn_table__data">{{ applicationStatus }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">飛行目的</th>
                <td class="drn_table__data">{{ purpose }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">モデル</th>
                <td class="drn_table__data">{{ type }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路</th>
                <td class="drn_table__data">{{ name }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路区画</th>
                <td class="drn_table__data">{{ airwayJunctionRange }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">関係者通知</th>
                <td class="drn_table__data">
                  {{ stakeholdersText }}
                  <V-btn
                    rounded="pill"
                    variant="outlined"
                    class="drn_btn drn_btn--default"
                    @click="togglePopup"
                  >
                    変更
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
          <v-divider class="drn_divider"></v-divider>
          <table class="drn_table drn_table--reserve_conf">
            <tbody>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路区間</th>
                <td class="drn_table__data">
                  <v-timeline side="end" truncate-line="both" size="x-small" class="drn_timeline drn_timeline--route">
                    <v-timeline-item v-for="(item, index) in airwayJunctions" :key="index" class="drn_timeline__item">
                      <span class="drn_timeline__title">{{ item.airwayJunctionName }}</span>
                    </v-timeline-item>
                  </v-timeline>
                </td>
              </tr>
            </tbody>
          </table>
          <v-divider class="drn_divider"></v-divider>
          <table class="drn_table drn_table--reserve_conf">
            <tbody>
              <tr class="drn_table__row">
                <th class="drn_table__label">総距離</th>
                <td class="drn_table__data">{{ airwayDistance }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路運営者</th>
                <td class="drn_table__data">{{ airwayOperator }}</td>
              </tr>
              <tr><td class="drn_table__space"></td></tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">申請日</th>
                <td class="drn_table__data">{{ create_date }}</td>
              </tr>
            </tbody>
          </table>
        </v-sheet>
        <v-sheet rounded="lg" color="default" class="drn_content__map">
          <MapComponent v-if="chartData" :corridorData="airway" />
        </v-sheet>
      </div>
      </v-card-text>
    </div>
    </div>
    </div>

    <!-- ページナビゲーション -->
    <PageNavigation :back="true">
      <ul class="e-buttonGroup">
      </ul>
    </PageNavigation>
   </div>
  </main>
</template>

<script>
import axios from 'axios'; // axiosのインポート

// 航路運営者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 運航事業者向けサイドバー
import GlobalNavigation from "~/components/navigation/globalNavigation.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";

// JSON ファイルをインポート
import MapComponent from '@/components/map/showAirwayDetail.vue';

export default {
  components: {
    GlobalNavigationRM,
    GlobalNavigation,
    GlobalNavigationSH,
    PageNavigation,
    MapComponent,
  },
  data() {
    return {
      chartData: '',    
      airwayId: '',
      name: '',
      create_date: '',
      purpose: '',
      droneList: '',
      type: '',
      airwayJunctions: '',
      airwaySections: '',  
      airway: '', 
      airwayDistance: '', 
      airwayJunctionRange: '', 
      sectionRange: '', 
      airwayOperator: '', 
      applicationStatus: '', 
      cookie_role: null,
      role: null,
      operatorData: null,
      showStakeholdersPopup: false,
      itemsPerPage: 10,
      stakeholders: [],
      stakeholdersSelected: [],
      stakeholdersAllSelected: false,
      stakeholdersNum: 0,
    };
  },
  computed: {
    corridorId() {
      return this.$route.query.id;
    },   
    stakeholdersText() {
      const selectedData = this.stakeholders.filter(item =>
        this.stakeholdersSelected.includes(item.operatorId)
      );

      /* もしselectedDataのリストの要素が1個以下ならば、その値（operatorName）をreturnする */
      if (selectedData.length <= 1) {
        return selectedData.map(item => item.operatorName).join('');
      }

      /* もしselectedDataのリストの要素が2個以上ならば、先頭の値（operatorName）に",...(リストの要素数)"を付与した文字列をreturnする */
      return `${selectedData[0].operatorName},...(${selectedData.length})`;
    },
  },
  methods: {
    togglePopup() {
      this.showStakeholdersPopup = !this.showStakeholdersPopup;
    },
    toggleSelectAll() {
      if (this.stakeholdersAllSelected) {
        this.stakeholdersSelected = this.stakeholders.map(item => item.operatorId);
      } else {
        this.stakeholdersSelected = [];
      }
    },
    async stakeholdersRegister() {
      const selectedData = this.stakeholders.filter(item =>
        this.stakeholdersSelected.includes(item.operatorId)
      );

      const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
      const airwayTenantLinkUrl = `${miscApiBaseUrl}/airwayTenantLink`;
      const airwayTenantLinkHeaders = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      };
      const airwayTenantLinkParams = {
        "updateType": "0",
        "airwayId": this.corridorId,
        "relatedPartiesIdList": this.stakeholdersSelected,
      };
      try {
        const airwayTenantLinkRes = await axios_put(airwayTenantLinkUrl, airwayTenantLinkParams, { headers: airwayTenantLinkHeaders });
        console.log(airwayTenantLinkRes);
        if (airwayTenantLinkRes.status != 200) {
          console.error(`error: put airwayTenantLink info {status: ${airwayTenantLinkRes.status}}.`);
          this.response = null;
          return;
        }
      } catch (error) {
        console.error(`Network request failed: ${error}`);
      }

      // ポップアップを非表示にする
      this.showStakeholdersPopup = false;
    },
  },
  async created() {
    if (process.client) {
      // ロールチェック
      const ownpage_role = ["1","2", "3"];
      this.cookie_role = await roleVerification(ownpage_role);
      if (Object.keys(this.cookie_role).length == 0) {
        console.log(`airwayReservation get role error.`);
        return;
      }
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
    }
  },
  async mounted() {
    const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
    const operatorUrl = `${miscApiBaseUrl}/operator`;
    const operatorHeaders = {
          headers: {
                  'accept': 'application/json',
          },
    };
    try {
      const operatorRes = await axios_get(operatorUrl, {}, operatorHeaders);
      console.log(operatorRes);
      if (operatorRes.status != 200) {
        console.error(`error: get operator info {status: ${operatorRes.status}}.`);
        this.response = null;
        return;
      }
      this.operatorData = {};
      this.operatorData = operatorRes.data;
      const roleMap = {
        "1": "航路運営事業者",
        "2": "運航事業者",
        "3": "関係者"
      };
      this.stakeholders = operatorRes.data.operatorList.map(item => ({
        operatorId: item.operatorId, 
        notificationType: item.notificationType,
        operatorName: item.operatorName,
        roleList: item.roleList.map(item => roleMap[item]).join(", "),
        notificationTargetList: item.notificationTargetList,
        linkAirwayList: item.linkAirwayList, 
      }));
    } catch (error) {
      console.error(`Network request failed: ${error}`);
    }

    try {
      const operatorAirwayIdRes = await axios_get(operatorUrl, {airwayId: this.corridorId}, operatorHeaders);
      console.log(operatorAirwayIdRes);
      if (operatorAirwayIdRes.status !== 200) {
        console.error(`error: get operator info {status: ${operatorAirwayIdRes.status}}.`);
        this.response = null;
        return;
      } else {
        this.stakeholdersSelected = operatorAirwayIdRes.data.operatorList.map(item => item.operatorId);
      }
    } catch (error) {
      console.error(`Network request failed: ${error}`);
    }

    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, {airwayId: this.corridorId}, {});
    console.log(airwayRes);
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      this.chartData = {};
      return;
    }
    this.chartData = useAirwayConvertConnectionOrder(airwayRes.data);
    
    const droneUrl = `${airwayApiBaseUrl}/aircraft`;
    const droneRes = await axios_get(droneUrl, {}, {});
    console.log(droneRes);
    if (droneRes.status != 200) {
      console.error(`error: get drone info {status: ${droneRes.status}}.`);
      return;
    }
    const aircraftInfo = droneRes.data.aircraft;
    
    const airway = airwayRes.data.airway.airways[0];
    this.airwayId = airway.airwayId;
    this.name = airway.airwayName;
    this.create_date = useDateString2(useAirwayGetAirwayApplicationDateFromAirwayId(this.chartData, this.corridorId));
    this.purpose = airway.flightPurpose;
    this.droneList = airway.droneList;
    for (let i =0; i < aircraftInfo.length; i++) {
      if (aircraftInfo[i]["aircraft_info_id"] === this.droneList[0]) {
        this.type = aircraftInfo[i]["name"];
        break;
      }
    }
    this.airwayJunctions = airway.airwayJunctions;
    this.airwaySections = airway.airwaySections;
    this.airway = airway; 
    this.airwayDistance = useAirwayGetFullDistanceFromAirwayId(this.chartData, this.corridorId) + 'm';
    this.airwayJunctionRange = useAirwayGetCorridorPointRangeFromAirwayIdFullWidth(this.chartData, this.corridorId);
    this.sectionRange = useAirwayGetSectionRangeFromAirwayIdFullWidth(this.chartData, this.corridorId);
    this.airwayOperator = getcompanyName(this.operatorData, this.chartData.airway.airwayAdministratorId),
    this.applicationStatus = "承認済";
  },
  
    
};
</script>

<style>
.e-button-add{
  width: 98px;
  height: 25px;
  background: var(--txt_-333333) 0% 0% no-repeat padding-box;
  border: 1px solid var(--line_-999999);
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--unnamed-color-ffffff);
  text-align: center;
  margin-top: 15px;
  margin-bottom: 10px;
}

.popup {
  position: absolute;
  top: 345px;
  left: 300px;
  width: 800px;
  height: auto;
  background-color: #fefefe;
  border: 1px solid #888;
  padding: 21px 55px;
  z-index: 10000;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.item-center {
  display: flex;
  justify-content: center;
}
</style>