<template>
<div class="drn_main__app">
  <div variant="flat" class="drn_main__content">
    <!-- ヘッダ -->
    <div class="drn_header">
      <div class="drn_header__item">
        <v-card-title class="drn_header__title">航路予約一覧</v-card-title>
      </div>
      <div class="drn_header__action">
        <v-btn
          v-if="viewType == 'listview'"
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
          <v-btn
            value="mapview"
            class="drn_toggle__btn"
            @click="setMap"
          >
            <img class="drn_toggle__map_btn" src="/assets/css/img/main/map-regular.svg" width="20" height="20">
          </v-btn>
        </v-btn-toggle>
      </div>
    </div>
    <!-- モーダルウィンドウ -->
    <div v-if="showPopup && isListView" class="popup">
      <!-- オプション検索の内容 -->
        <!-- オプション検索の内容 -->
      <div class="option-container">
        <div class="option-item">
          <div class="e-fieldLabel-option">飛行目的</div>
          <ul class="horizontal-list">
              <li class="check-porpose">
                <label><input type="checkbox" id="物資運搬" v-model="purposes" value="物資運搬"/>物資運搬</label>
              </li>
              <li class="check-porpose">
                <label><input type="checkbox" id="送電線点検" v-model="purposes" value="送電線点検"/>送電線点検</label>
              </li>
              <li class="check-porpose">
                <label><input type="checkbox" id="河川監視" v-model="purposes" value="河川監視"/>河川監視</label>
              </li>
              <li class="check-porpose">
                <label><input type="checkbox" id="山岳監視" v-model="purposes" value="山岳監視"/>山岳監視</label>
              </li>
              <li class="check-porpose">
                <label><input type="checkbox" id="航空撮影" v-model="purposes" value="航空撮影"/>航空撮影</label>
              </li>
              <li class="check-porpose">
                <label><input type="checkbox" id="その他" v-model="purposes" value="その他"/>その他</label>
              </li>
            </ul>
          </div>
        <div class="option-item">
          <div class="e-fieldLabel-option">航路発着日時</div>
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
                <option v-for="item in companyNameItems" :key="item" :value="item">{{ item }}</option>
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

    <!-- テーブル -->
    <v-card-text v-if="viewType == 'listview'" class="drn_content">
      <div class="drn_content__body">
      <v-sheet class="drn_content__data">
      <div class="drn_list">
      <div class="drn_list__body">
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          :page.sync="page"
          @update:page="onPageChange"
          :headers="headers"
          :items="filteredRoutes"
          item-value="id"
          item-key="id"
          fixed-header
          fixed-footer
          density="comfortable"
          class="drn_list__table"
          @update:selected-items="selectRoute"
          @update:sort-by="updateSort"
          :sort-key.sync="sortKey"
          :sort-order.sync="sortOrder"
          @update:currentItems="onUpdateCurrentItems"
          :items-per-page-options="[5, 10, 15, 20]"
        >
        <template v-slot:body="{ items }">
          <tr
            v-for="(item, index) in items"
            :key="item.id"
            :class="{'drn_table__selected': selectedRow === item.id }"
            @click="selectRoute(item.id, item.airwayId, item.section)"
          >
            <td :class="{'drn_table__selected_first_td': selectedRow === item.id }">
              <div :class="{'change-color-airwaystatus': item.reservationStatus === '予約済み', 'change-color-evaluation-airwaystatus': item.reservationStatus !== '予約済み'}">
                {{ item.reservationStatus }}
              </div>
            </td>
            <td>{{ item.startDay }}</td>
            <td>{{ item.endDay }}</td>
            <td>{{ item.reservationNumber }}</td>
            <td>{{ item.route }}</td>
            <td>{{ item.section }}</td>
            <td>{{ item.reservationDay }}</td>
            <td>
              <router-link
                :to="{ 
                  path: '/airwayReservation/detail',
                  query: {
                    id: item.id,
                    airwayId: item.airwayId,
                    operatorId: item.operatorId,
                    reservationNumber: item.reservationNumber,
                    reservationStatus: item.reservationStatus,
                    rawReservationStatus: item.rawReservationStatus,
                    reservationDay: item.reservationDay,
                    route: item.name,
                    section: item.section,
                    purpose: item.purpose,
                    startDay: item.startDay,
                    endDay: item.endDay
                  },
                }"
              >
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
    <!-- 地図表示 -->
    <v-card-text v-if="viewType == 'mapview'" class="drn_content">
      <div class="drn_content__body">
      <v-sheet class="drn_content__data">
      <div class="drn_list">
      <div class="drn_list__body">
        <v-data-table
          v-model:items-per-page="itemsPerPage"
          :headers="previewHeaders"
          :page.sync="page"
          @update:page="onPageChange"
          :items="filteredRoutes"
          item-value="id"
          item-key="id"
          fixed-header
          fixed-footer
          density="comfortable"
          class="drn_list__table"
          @update:selected-items="selectRoute"
          @sort-by="updateSort"
          :sort-key.sync="sortKey"
          :sort-order.sync="sortOrder"
          @update:currentItems="onUpdateCurrentItems"
          :items-per-page-options="[5, 10, 15, 20]"
          >
            <template v-slot:body="{ items }">
              <tr
              v-for="(item, index) in items"
              :key="item.id"
              :class="{'drn_table__selected': selectedRow === item.id }"
              @click="selectRoute(item.id, item.airwayId, item.section)"
              >
                <td :class="{'drn_table__selected_first_td': selectedRow === item.id }">
                  <div :class="{'change-color-airwaystatus': item.reservationStatus === '予約済み', 'change-color-evaluation-airwaystatus': item.reservationStatus !== '予約済み'}">
                    {{ item.reservationStatus }}
                  </div>
                </td>
                <td>{{ item.route }}</td>
                <td>{{ item.section }}</td>
                <td>
                  <router-link
                    :to="{ 
                      path: '/airwayReservation/detail',
                      query: {
                        id: item.id,
                        airwayId: item.airwayId,
                        operatorId: item.operatorId,
                        reservationNumber: item.reservationNumber,
                        reservationStatus: item.reservationStatus,
                        rawReservationStatus: item.rawReservationStatus,
                        reservationDay: item.reservationDay,
                        route: item.name,
                        section: item.section,
                        purpose: item.purpose,
                        startDay: item.startDay,
                        endDay: item.endDay
                      },
                    }"
                  >
                    <img class="drn_table__detail_icon" src="/assets/css/img/main/circle-info-solid.svg" width="20" height="20">  
                  </router-link>
                </td>
              </tr>
            </template>
        </v-data-table>
      </div>
      </div>
      </v-sheet>
      <v-sheet rounded="lg" color="default" class="drn_content__map">
        <MapComponent
          v-if="airwayData && reservationData"
          :chartData="airwayData"
          :section="selectedSection"
          :airwayId="selectedAirwayId"
          :showCheckBox=true
          :showLegend=true
          :showMarker=false
        />
      </v-sheet>
      </div>
    </v-card-text>
  </div>
</div>
</template>

<script>
  import MapComponent from '@/components/map/showAirwayReservationDetail.vue';

  export default {
  components: {
    MapComponent,
  },
  props: {
    reservationData: {
      type: Object,
      required: true
    },
    airwayData: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      search: '',
      headers: [
        { title: '予約状況', align: 'start', key: 'reservationStatus', sortable: false },
        { title: '航路出発日時', align: 'start', key: 'startDay', sortable: true },
        { title: '航路到着日時', align: 'start', key: 'endDay', sortable: true },
        { title: '予約番号', align: 'start', key: 'reservationNumber', sortable: true },
        { title: '航路', align: 'start', key: 'route', sortable: true },
        { title: '区間', align: 'start', key: 'section', sortable: true },
        { title: '予約・更新日', align: 'start', key: 'reservationDay', sortable: true },
        { title: '詳細', align: 'start', key: 'details', sortable: false },
      ],

      selectedRow: null,
      selectedAirwayId: '', 
      selectedSection: '', 
      itemsPerPage: 20,
      sortKey: '', // ソートキー
      sortOrder: 1, // 1: 昇順, -1: 降順
      page: 1,  // 現在のページ番号
      showPopup: false,
      purposes: ["物資運搬","送電線点検","河川監視","山岳監視","航空撮影","その他"],
      startDate: '',
      endDate: '',
      area: '',
      areaitems: [],
      companyName: '',
      companyNameItems: [],
      filteredRoutes: [],
      falltrangeData: null,
      operatorData: null,
      cookie_role: null,
      role: null,
      relationship_airwayIds: [],
      reservation_airwayIds: [],
      viewType: 'listview',
      currentItems: [],
    };
  },
  computed: {
    previewHeaders() {
      // プレビューモードの場合、表示するヘッダーを制限する
      if (this.viewType === 'mapview') {
        return this.headers.filter(header => ['reservationStatus', 'route', 'section', 'details'].includes(header.key));
      }
      return this.headers;
    },
    async routes() {
      const reservationList = [];

      // 最大許容落下範囲情報取得
      const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
      const falltrangeUrl = `${airwayApiBaseUrl}/fall-tolerance-range`;
      const falltrangeRes = await axios_get(falltrangeUrl, {businessNumber: useRuntimeConfig().public.businessNumber}, {});
      this.falltrangeData = {};
      this.falltrangeData = falltrangeRes.data;
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
        console.error(`RouteReservationItemList getAreaJsonData Faild.`);
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
            this.companyNameItems.push(this.operatorData.operatorList[i].operatorName);
          }
        }
      } else {
        console.error(`error: get operator info {status: ${operatorRes.status}}.`);
        return;
      }
      console.log(`companyNameItems: ${this.companyNameItems}`);

      // ユーザが関係者である場合、関係のあるopreratorIdでフィルタリング
      if (this.role == 3) {
        // 関連のある航路IDを取得
        if (operatorRes.status === 200 && operatorRes.data != undefined) {
          this.relationship_airwayIds = [];
          for(let i=0; i<this.operatorData.operatorList.length; i++) {
            if (this.operatorData.operatorList[i].operatorId == this.cookie_role.operatorId) {
              for (let j=0; j<this.operatorData.operatorList[i].linkAirwayList.length; j++) {
                this.relationship_airwayIds.push(this.operatorData.operatorList[i].linkAirwayList[j]);
              }
            }
          }
        }
        // 予約情報に存在する関連のある航路区画(=予約した航路ID)を取得し、関連のある航路ID群に含まれていれば
        // その航路IDを取得
        let reservation_airwayId = null;
        this.reservation_airwayIds = [];
        for (let i=0; i<this.reservationData['result'].length; i++) {
          reservation_airwayId = await useAirwayGetAirwayIdFromSectionId(this.airwayData, this.reservationData['result'][i].airwaySections[0].airwaySectionId);
          if (this.relationship_airwayIds.includes(reservation_airwayId)) {
            this.reservation_airwayIds.push(reservation_airwayId);
          }
        }
        console.log(`reservation_airwayIds: ${this.reservation_airwayIds}`);
      }
      let id = 1;
      if(!("result" in this.reservationData)){
        return reservationList;
      }
      this.reservationData['result'].forEach((reservation) => {
        let airwaySections = []
        for(let i=0; i<reservation['airwaySections'].length; i++){
          airwaySections.push(reservation['airwaySections'][i]['airwaySectionId']);
        }
        let airwayId = useAirwayGetAirwayIdFromSectionId(this.airwayData, reservation['airwaySections'][0]['airwaySectionId']) // 予約に含まれる航路区画IDをもとに航路IDを特定
        if (this.role == 3 && this.reservation_airwayIds.includes(airwayId) == false) {
          // 関係者でログインしている場合、自身に関係する航路IDでなければ表示しない
          return;
        }
        const rawReservationStatus = reservation['status'];
        let element = {
          id: reservation['airwayReservationId'],
          airwayId: airwayId,
          operatorId: reservation['operatorId'],
          reservationStatus: this.convertReservationStatus(rawReservationStatus),
          rawReservationStatus: rawReservationStatus,
          startDay: useDateString1(reservation['airwaySections'][0]['startAt']),
          endDay: useDateString1(reservation['airwaySections'][0]['endAt']),
          rawStartDay: reservation['airwaySections'][0]['startAt'],
          rawEndDay: reservation['airwaySections'][0]['endAt'],
          reservationNumber: reservation['airwayReservationId'],
          route: useAirwayGetAirwayNameFromAirwayId(this.airwayData, airwayId),
          section: useAirwayGetCorridorPointRangeFromSectionIdList(this.airwayData, reservation['airwaySections']),
          reservationDay: useDateString2(reservation['reservedAt']),
          updateDay: useDateString2(reservation['updatedAt']),
          details: '詳細',
          name: useAirwayGetAirwayNameFromAirwayId(this.airwayData, airwayId),
          area: getareaName(this.falltrangeData, airwayId),
          purpose: useAirwayGetPurposeFromAirwayId(this.airwayData, airwayId),
          companyName: getcompanyName(this.operatorData, reservation['operatorId']),
          airwaySectionId: airwaySections
        };
        reservationList.push(element);
        id++;
      }); 
      return reservationList;
    },
    isListView() {
      if (this.viewType == 'listview') {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    convertReservationStatus(status) {
      switch(status) {
        case 'RESERVED':
          return '予約済み';
        case 'CANCELED':
          return 'キャンセル済み';
        case 'RESCINDED':
          return '撤回済み';
        default:
          return '未定義'
      }
    },
    checkLocalStorage() {
      const rawData = localStorage.getItem("airwayEvaluationDB");
      if (!rawData) {
        return;
      }

      let notifications;
      try {
        notifications = JSON.parse(rawData);
      } catch (error) {
        console.error("Failed to parse noticeDB:", error);
        return;
      }

      // 同じ reservationId の中で 最新 receiveTime を選別
      const newestDataMap = {}; 

      notifications.forEach(item => {
        newestDataMap[item.reservationId] = item;
      });

      // filteredRoutes の各行について、reservationId が一致する最新 receiveTime のデータがあれば上書き
      this.filteredRoutes.forEach(route => {
        const matched = newestDataMap[route.id];
        if (matched) {
          // reservationStatus を notifyType に更新
          if (route.rawReservationStatus == 'CANCELED' || route.rawReservationStatus == 'RESCINDED') {
            route.reservationStatus = '　中止　';
          } else if(matched.evaluationResults === true){
              route.reservationStatus = '予約済み'
          }else{
            let notifyType = '';
            switch (matched.type) {
              case "weather":
                notifyType = "気象異常";
                route.reservationStatus = notifyType;
                break;
              case "event":
                notifyType = "規制イベント";
                route.reservationStatus = notifyType;
                break;
              case "railway":
                notifyType = "鉄道異常";
                route.reservationStatus = notifyType;
                break;
              case "intrusion":
                notifyType = "人立ち入り";
                route.reservationStatus = notifyType;
                break;
              default:
                break;
            }
          }

        }
      });
      //反映し終わったら空にしておく
      localStorage.setItem("airwayEvaluationDB",[]);
    },
    async onPageChange(newPage) {
      console.log(newPage);
      this.page = newPage;
    },
    selectRoute(id, airwayId, section) {
      this.selectedRow = this.selectedRow === id ? null : id;
      this.selectedAirwayId = airwayId;
      this.selectedSection = section;
      console.log("airwayId : " ,airwayId);
      console.log("section : ", section);
    },
    async updateSort({ sortBy, sortDesc }) {
        this.sortKey = sortBy; // ソートキーを更新
        this.sortOrder = sortDesc ? 'desc' : 'asc'; // ソート順を更新
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
      const routes_filter = await this.routes;
      this.filteredRoutes = routes_filter.filter(item => {
        const itemStart = new Date(item.startDay);
        console.log(`itemStart: ${itemStart}`);
        const itemEnd = new Date(item.endDay);
        console.log(`itemEnd: ${itemEnd}`);

        const isPurposeMatch = !this.purposes.length || this.purposes.some(purpose => item.purpose.includes(purpose));
        // 航路出発日時
        const isStartMatch = !start || (start <= itemStart && end >= itemStart);
        console.log(`isStartMatch: ${isStartMatch}`);
        // 航路到着日時
        const isEndMatch = !end || (start <= itemEnd && end >= itemEnd);
        console.log(`isEndMatch: ${isEndMatch}`);
        let isDateMatch = false;
        if (isStartMatch == true || isEndMatch == true) {
          // 開始または終了いずれかが範囲内なら対象とする。
          isDateMatch = true;
          console.log(`isDateMatch: ${isDateMatch}`);
        }

        const isCompanyNameMatch =!this.companyName || ( this.companyName === item.companyName);
        const isAreaMatch =!this.area || ( this.area === item.area);

        this.showPopup = !this.showPopup;

        const isView = isPurposeMatch && isDateMatch && isCompanyNameMatch && isAreaMatch;
        return isView;
      });
    },
    async reset() {
      this.purposes = ["物資運搬","送電線点検","河川監視","山岳監視","航空撮影","その他"];
      this.startDate = '';
      this.endDate = '';
      this.companyName = '';
      this.area = '';
    },
    setList() {
      this.viewType = 'listview';
    },
    setMap() {
      this.viewType = 'mapview';
    },
    async onUpdateCurrentItems(items) {
      this.currentItems = items;
      console.log(this.currentItems);

      const headers = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const promises = [];
      for (let i = 0; i < this.currentItems.length; i++) {
        // キャンセルもしくは撤回済みの予約については適合性確認APIを実行しない
        if (this.currentItems[i].raw.rawReservationStatus == 'CANCELED' || this.currentItems[i].raw.rawReservationStatus == 'RESCINDED') {
          this.currentItems[i].raw.reservationStatus = '　中止　'
          continue;
        }

        // 予約と紐づく機体取得
        const url = '/api/getAircraftInfoFrom?id=' + this.currentItems[i].raw.id;
        const routeRequest = axios_get(url).then(async (response) => {
          if (response.status !== 200 || response.data.aircraftInfo === null) {
            this.currentItems[i].raw.reservationStatus = "取得失敗";
            return;
          }

          // 適合性確認
          const safetyApiBaseUrl = useRuntimeConfig().public.safetyApiBaseUrl;
          const assessmentURL = `${safetyApiBaseUrl}/conformity-assessment`;
          let errLevel = 0;
          for (let airwaySectionIdIndex=0; airwaySectionIdIndex<this.currentItems[i].raw.airwaySectionId.length; airwaySectionIdIndex++){
            const body = {
              "airwaySectionId": this.currentItems[i].raw.airwaySectionId[airwaySectionIdIndex],
              "startAt": this.currentItems[i].raw.rawStartDay,
              "endAt": this.currentItems[i].raw.rawEndDay,
              "aircraftInfo": {
                "maker": response.data.aircraftInfo.maker,
                "modelNumber": response.data.aircraftInfo.modelNumber,
                "name": response.data.aircraftInfo.name,
                "type": response.data.aircraftInfo.type,
                "length": response.data.aircraftInfo.length,
              }
            };
            const assessmentRes = await axios_post(assessmentURL, body, headers);
            if (assessmentRes.status !== 200) {
              this.currentItems[i].raw.reservationStatus = "取得失敗";
              return;
            }

            if (assessmentRes.data.evaluationResults === 'true') {
              this.currentItems[i].raw.reservationStatus = "予約済み";
            } else {
              let level = 0;
              let notifyType = "";
              switch (assessmentRes.data.type) {
                case "weather":
                  notifyType = "気象異常";
                  break;
                case "event":
                  notifyType = "規制イベント";
                  break;
                case "railway":
                  notifyType = "鉄道異常";
                  break;
                case "intrusion":
                  notifyType = "人立ち入り";
                  break;
                default:
                  notifyType = "取得失敗";
                  break;
              }
              console.log(notifyType)
              this.currentItems[i].raw.reservationStatus = notifyType;
              return
            }
          }
        });

        promises.push(routeRequest);
      }

      // 全ての非同期リクエストが完了するのを待つ
      await Promise.all(promises);
    }
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
      this.filteredRoutes = await this.routes;
    }
  },
  async mounted() {
    // 10秒ごとにローカルストレージをチェックする
    this.timer = setInterval(() => {
      this.checkLocalStorage();
      console.log('check local');
    }, 10000);
  },
  unmounted() {
    // コンポーネントが破棄される際にタイマー停止
    clearInterval(this.timer);
  },
  };
</script>
  
<style scoped>

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
  width: 170px;
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

.change-color-airwaystatus {
  color: #FFFFFF;
  background: #0F1ED2;
  display: inline-block;
  padding: 5px;
}

.change-color-evaluation-airwaystatus {
  color: #FFFFFF;
  background: #E6248F;
  display: inline-block;
  padding: 5px;
}

</style>
