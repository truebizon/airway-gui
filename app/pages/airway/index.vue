<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRM v-if = "role == 1"/>
  <GlobalNavigation v-if = "role == 2" />
  <GlobalNavigationSH v-if = "role == 3" />

  <!-- コンテンツ -->
  <main id="main" class="b-pageMain">
    <div class="b-pageContentHasSubMenu">
      <!-- メインコンテンツ -->
      <div class="b-pageContentHasNavigation">
      <div class="drn_main__app">
      <div variant="flat" class="drn_main__content">

        <!-- ヘッダ -->
        <div class="drn_header">
          <div class="drn_header__item">
            <v-card-title class="drn_header__title">航路画定一覧</v-card-title>
          </div>
          <div class="drn_header__action">
            <v-btn
              variant="outlined"
              rounded="pill"
              class="drn_header__btn drn_header__btn--filter"
              @click="onExportButtonClick"
            >
              DIPS出力
            </v-btn>
            <v-btn
              variant="outlined"
              rounded="pill"
              class="drn_header__btn drn_header__btn--filter"
              @click="togglePopup"
            >
              <img class="drn_btn__filter" src="/assets/css/img/main/filter-solid.svg" width="15" height="15">
              絞り込み
            </v-btn>
            <v-btn-toggle
              v-model="viewType"
              mandatory
              variant="flat"
              rounded="pill"
              border
              density="comfortable"
              class="drn_toggle drn_toggle--viewtype"
            >
              <v-btn
                value="listview"
                class="drn_toggle__btn"
                @click="setList"
              >
                <img src="/assets/css/img/main/list-solid.svg" width="15" height="15">
              </v-btn>
              <a href="/airway/map">
                <v-btn
                  value="mapview"
                  class="drn_toggle__btn"
                >
                  <img class="drn_toggle__map_btn" src="/assets/css/img/main/map-regular.svg" width="20" height="20">
                </v-btn>
              </a>
            </v-btn-toggle>
          </div>
        </div>

        <!-- モーダルウィンドウ -->
        <div v-if="showPopup" class="popup">
          <!-- オプション検索の内容 -->
          <div class="option-container">
            <div class="option-item">
              <div class="e-fieldLabel-option">飛行目的</div>
              <ul class="horizontal-list">
                <li class="check-porpose">
                  <label><input type="checkbox" id="物資運搬" v-model="purposes" value="物資運搬" />物資運搬</label>
                </li>
                <li class="check-porpose">
                  <label><input type="checkbox" id="送電線点検" v-model="purposes" value="送電線点検" />送電線点検</label>
                </li>
                <li class="check-porpose">
                  <label><input type="checkbox" id="河川監視" v-model="purposes" value="河川監視" />河川監視</label>
                </li>
                <li class="check-porpose">
                  <label><input type="checkbox" id="山岳監視" v-model="purposes" value="山岳監視" />山岳監視</label>
                </li>
                <li class="check-porpose">
                  <label><input type="checkbox" id="航空撮影" v-model="purposes" value="航空撮影" />航空撮影</label>
                </li>
                <li class="check-porpose">
                  <label><input type="checkbox" id="その他" v-model="purposes" value="その他" />その他</label>
                </li>
              </ul>
            </div>
            <div class="option-item">
              <div class="e-fieldLabel-option">申請日時</div>
              <ul class="horizontal-list">
                <li>
                  <input type="datetime-local" v-model="startDate" class="e-textField-date-option" />
                </li>
                <li>
                  <input type="datetime-local" v-model="endDate" class="e-textField-date-option" />
                </li>
              </ul>
            </div>
          </div>
          <div class="option-container">
            <div class="option-item">
              <div class="e-fieldLabel-option">事業所・会社名</div>
              <ul class="horizontal-list">
                <li>
                  <select v-model="companyName" class="e-textField-select">
                    <option value="" selected hidden>-- 事業所・会社名称 --</option>
                    <option v-for="(item, index) in companyNameItems" :key="item.id" :value="item.id">{{ item.name }}</option>
                  </select>
                </li>
              </ul>
            </div>
            <div class="option-item">
              <div class="e-fieldLabel-select">エリア</div>
              <ul class="horizontal-list">
                <li>
                  <select v-model="area" class="e-textField-select">
                    <option value="" selected hidden>-- 地域名称 --</option>
                    <option v-for="item in areaitems" :key="item" :value="item">{{ item }}</option>
                  </select>
                </li>
              </ul>
            </div>
          </div>
          <div class="item-center">
            <input type="submit" class="e-button-search" value="検索" @click="performSearch" />
          </div>
          <div class="item-center">
            <a style="color: #333333; text-decoration: none;" @click="reset">検索条件をリセットする</a>
          </div>
        </div>

        <!-- 予約一覧テーブル -->
        <v-card-text class="drn_content">
          <div class="drn_content__body">
          <v-sheet class="drn_content__data">
          <div class="drn_list">
          <div class="drn_list__body">
            <v-data-table
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="filteredRoutes"
              item-value="id"
              item-key="id"
              fixed-header
              fixed-footer
              density="comfortable"
              class="drn_list__table"
              @update:selected-items="selectRoute"
              @update:sort-key="updateSort"
              :sort-key="sortKey"
              :sort-order="sortOrder"
              :items-per-page-options="[5, 10, 15, 20]"
            >
              <template v-slot:body="{ items }">
                <tr
                  v-for="(item, index) in items"
                  :key="item.id"
                  :class="{'drn_table__selected': selectedRow === item.id }"
                  @click="selectRoute(item.id, item.airwayId, item.airwayName)"
                >
                  <td :class="{'drn_table__selected_first_td': selectedRow === item.id }">{{ item.airwayId }}</td>
                  <td>{{ item.reservationStatus }}</td>
                  <td>{{ item.airwayName }}</td>
                  <td>{{ item.section }}</td>
                  <td>{{ item.application_date }}</td>
                  <td>
                    <router-link :to="{ path: '/airway/detail', query: { id: item.airwayId } }">
                      <img class="drn_table__detail_icon" src="/assets/css/img/main/circle-info-solid.svg" width="20" height="20">  
                    </router-link>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </div>
          </div>
          </v-sheet>
          </div>
        </v-card-text>
      </div>
      </div>
      </div>

      <!-- ページナビゲーション -->
      <PageNavigation :back="false">
        <ul class="e-buttonGroup">
          <li>
            <a href="/airway/newAirway" class="e-button" v-if = "role == 1">新規作成</a>
          </li>
        </ul>
      </PageNavigation>
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
// 航路管理者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 運航事業者向けサイドバー
import GlobalNavigation from "~/components/navigation/globalNavigation.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";

export default {
  data() {
  return {
    headers: [
      { title: '航路ID', align: 'start', key: 'airwayId', sortable: true },
      { title: '申請状況', align: 'start', key: 'reservationStatus', sortable: true },
      { title: '航路名', align: 'start', key: 'airwayName', sortable: true },
      { title: '区間', align: 'start', key: 'section', sortable: true },
      { title: '申請・更新日', align: 'start', key: 'application_date', sortable: true },
      { title: '詳細', align: 'center', key: 'details', sortable: false },
    ],
    selectedRow: null,
    selectedAirwayId: null,
    selectedAirwayName: null,
    airwayData: null,
    itemsPerPage: 20,
    sortKey: '', // ソートキー
    sortOrder: 1, // 1: 昇順, -1: 降順
    showPopup: false,
    purposes: ["物資運搬","送電線点検","河川監視","山岳監視","航空撮影","その他"],
    startDate: '',
    endDate: '',
    area: '',
    areaitems: [],
    companyName: '',
    companyNameItems: [],
    routes: [],
    filteredRoutes: [],
    cookie_role: null,
    role: null,
    falltrangeData: null,
    operatorData: null,
    relationship_airwayIds: [],
   };
  },
  components: {
    GlobalNavigationRM,
    GlobalNavigation,
    GlobalNavigationSH,
    PageNavigation,
  },
  methods: {
    selectRoute(id, airwayId, name) {
      this.selectedRow = this.selectedRow === id ? null : id;
      this.selectedAirwayId = this.selectedAirwayId === airwayId ? null : airwayId;
      this.selectedAirwayName = this.selectedAirwayName === name ? null : name;
    },
    updateSort({ key, order }) {
      this.sortKey = key;
      this.sortOrder = order;
    },
    togglePopup() {
        this.showPopup = !this.showPopup;
    },
    async performSearch() {
      let start = new Date("1970-01-01");
      if(this.startDate !== ''){
        start = new Date(useDateStringLocaltoUTC(this.startDate));
      }
      let end = new Date("9999-12-31");
      if(this.endDate !== ''){
        end = new Date(useDateStringLocaltoUTC(this.endDate));
      }

      let isAdmin = false;
      for(let i=0; i<this.companyNameItems.length; i++) {
        if(this.companyName === this.companyNameItems[i].id && this.companyNameItems[i].role.includes('1')) {
          isAdmin = true;
        }
      }
      
      const routes_filter = await this.routes;
      this.filteredRoutes = routes_filter.filter(item => {
        const itemapplication_date = new Date(item.application_date);
        
        let isPurposeMatch = false;
        if (item.purpose != null) {
          isPurposeMatch = !this.purposes.length || this.purposes.some(purpose => item.purpose.includes(purpose));
        } else {
          // その他にチェックがついている場合は、マッチ判定
          isPurposeMatch = !this.purposes.length || this.purposes.includes("その他");
        }
        const isapplicationMatch = !start || !end || (start <= itemapplication_date && end >= itemapplication_date);
        const isCompanyNameMatch =!this.companyName || isAdmin;
        const isAreaMatch =!this.area || ( this.area === item.area);

        this.showPopup = !this.showPopup;

        const isView = isPurposeMatch && isapplicationMatch && isCompanyNameMatch && isAreaMatch;
        // 選択されたindexが検索結果から外れたときはダウンロード対象から外すためnullを設定する
        if(item.id === this.selectedRow) {
          if(!(isView)) {
            this.selectedAirwayId = null;
          } else {
            this.selectedAirwayId = item.airwayId;
          }
        }

        return isView;
      });
    },
    reset() {
      this.purposes = ["物資運搬","送電線点検","河川監視","山岳監視","航空撮影","その他"];
      this.startDate = '';
      this.endDate = '';
      this.companyName = '';
      this.area = '';
    },
    onExportButtonClick: async function () {
      // 航路選択チェック
      if (this.selectedAirwayId === null) {
        alert("航路を指定してください");
        return;
      }
      const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
      const url = `${miscApiBaseUrl}/dipsAirwayExport`;
      const headers = {
        headers: {
          'Content-Type': 'application/json',
        },
        responseType: 'blob', 
      };
      const body = {
        "airwayIdList": [this.selectedAirwayId],
      };

      try {
        const response = await axios_post(url, body, headers);
        if (response.status !== 200) {
          console.error('API request failed:', response.status);
          return false;
        }
        // レスポンスデータからzipファイル作成
        const blob = new Blob([response.data], { type: 'application/zip' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // ファイル名はAPIからの返却値に揃えている
        link.download = this.selectedAirwayName + "_" + this.selectedAirwayId +'.zip';
        link.click();
      } catch (error) {
        console.error('API request failed:', error);
        return false;
      }
    },
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
  setup() {
    const viewType = ref('listview');

    const setList = () => {
      viewType.value = 'listview';
    };

    const setMap = () => {
      viewType.value = 'mapview'
    };

    return {
      setList,
      setMap,
    };
  },
  async mounted() {
    // 最大許容落下範囲情報取得
    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const rangeUrl = `${airwayApiBaseUrl}/fall-tolerance-range`;
    const rangeRes = await axios_get(rangeUrl, {businessNumber: useRuntimeConfig().public.businessNumber}, {});
    console.log(rangeRes);
    if (rangeRes.status != 200) {
      console.error(`error: get fall tolerance range info {status: ${rangeRes.status}}.`);
      this.falltrangeData = null;
      return;
    }
    this.falltrangeData = rangeRes.data;
    // 地域一覧を取得
    const areajsonUrl = `/api/getAreaJsonData`;
    const areadata = await axios_get(areajsonUrl);
    if (areadata.data != undefined) {
      // オプション検索で使用する地域一覧を作成
      this.areaitems = [];
      for(let i=0; i<areadata.data.areas.length; i++) {
        const is_exist_areaName = this.areaitems.includes(areadata.data.areas[i].name);
        if (is_exist_areaName == false) {
          this.areaitems.push(areadata.data.areas[i].name);
        }
      }
    } else {
      return;
    }
    console.log(`areaitems: ${this.areaitems}`);

    // 事業者一覧取得
    const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
    const operatorUrl = `${miscApiBaseUrl}/operator`;
    const operatorRes = await axios_get(operatorUrl);
    if (operatorRes.status === 200 && operatorRes.data != undefined) {
      this.operatorData = operatorRes.data;
      // オプション検索で使用する事業所・会社名一覧を作成
      this.companyNameItems = [];
      for(let i=0; i<this.operatorData.operatorList.length; i++) {
        const is_exist_companyName = this.companyNameItems.includes(this.operatorData.operatorList[i].operatorName);
        if (is_exist_companyName == false) {
          const element = {
            id: this.operatorData.operatorList[i].operatorId,
            name: this.operatorData.operatorList[i].operatorName,
            role: this.operatorData.operatorList[i].roleList,
          }
          this.companyNameItems.push(element);
        }
      }
    } else {
      console.error(`error: get operator info {status: ${operatorRes.status}}.`);
      return;
    }

    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, {all: 'true'}, {});
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      this.airwayData = {};
      return;
    }
    this.airwayData = useAirwayConvertConnectionOrder(airwayRes.data);
    const airwayAdministratorId = this.airwayData.airway.airwayAdministratorId;
    const tmp_routes = this.airwayData.airway.airways.map((item, index) => ({
      id: index,
      airwayAdministratorId: airwayAdministratorId,
      airwayId: item.airwayId,
      reservationStatus: '承認済',
      airwayName: item.airwayName,
      section: item.airwayJunctions[0].airwayJunctionName + "~" + item.airwayJunctions[item.airwayJunctions.length - 1].airwayJunctionName,
      application_date: useDateString1(item.createdAt),
      update_date: useDateString1(item.updatedAt),
      area: getareaName(this.falltrangeData, item.airwayId),
      companyName: getcompanyName(this.operatorData, airwayAdministratorId),
      purpose: item.flightPurpose,
    }));
    // ユーザが関係者である場合、関係のあるopreratorIdでフィルタリング
    if (this.role == 3) {
      // 関連のある航路IDを取得
      this.relationship_airwayIds = [];
      for(let i=0; i<this.operatorData.operatorList.length; i++) {
        if (this.operatorData.operatorList[i].operatorId == this.cookie_role.operatorId) {
          for (let j=0; j<this.operatorData.operatorList[i].linkAirwayList.length; j++) {
            this.relationship_airwayIds.push(this.operatorData.operatorList[i].linkAirwayList[j]);
          }
        }
      }
      // 関係するairwayIdでフィルタリング
      this.routes = tmp_routes.filter(item => {
        const isView = this.relationship_airwayIds.includes(item.airwayId);
        return isView;
      });
      this.filteredRoutes = this.routes;
    } else {
      this.routes = tmp_routes;
      this.filteredRoutes = this.routes;
    }
  },
};


</script>

<style>
/* モーダルウィンドウのスタイル */
.popup {
  position: absolute;
  left: 40dvh;
  top: 80px; /* 画像ボタンの位置に合わせて調整 */
  width: 1180px;
  height: 231px;
  background-color: #fefefe;
  border: 1px solid #888;
  padding-top: 21px;
  padding-left: 55px;
  padding-right: 55px;
  z-index: 10000;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.horizontal-list {
  list-style: none; /* デフォルトのリストスタイルを削除 */
  padding: 0; 
  margin: 0; 
}

.horizontal-list li {
  display: inline-block; 
  margin-right: 10px;
}

.option-search {
  display: flex;
  align-items: center; /* 垂直方向に中央揃え */
}

.option-container {
  display: flex; 
}

.option-item {
  margin: 5px;
}

.item-center {
  display: flex;
  justify-content: center; 
}

.e-textField-date-option{
  width: 160px;
  height: 25px!important;
  border: 1px solid var(--line_-999999);
}

.e-textField-select{
  width: 250px;
  height: 25px!important;
  border: 1px solid var(--line_-999999);
  padding-top: 5px;
  padding-bottom: 6px;
  padding-left: 10px;
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
}

.e-button-search{
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

.check-porpose {
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
  padding-right: 10px;
}
.v-label.v-label--clickable.font-weight-black {
 font-size: 14px!important;
}

.e-fieldLabel-option {
  margin-bottom: 0.5rem;
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-bold) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
}

/* チェックボックスの塗りつぶしの色を変更 */
input[type="checkbox"] {
    accent-color: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box; /* 塗りつぶしの色を変更 */
    border: 1px solid var(--line_-999999);
    width: 16px; 
    height: 16px; 
    border-radius: 0; 
}

/* チェックマークの色を変更 */
input[type="checkbox"]:checked::before {
  accent-color: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box; /* 塗りつぶしの色を変更 */   
    color: 2px solid var(--txt_-333333); /* チェックマークの色を変更 */
}


</style>
