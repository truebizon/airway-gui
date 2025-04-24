<template>
  <!-- グローバルナビゲーション -->
  <GlobalNavigationRM v-if = "role == 1"/>
  <GlobalNavigation v-if = "role == 2" />
  <GlobalNavigationSH v-if = "role == 3" />

  <!-- コンテンツ -->
  <main class="b-pageMain">
    <div class="b-pageContentHasNavigation">
      <div class="drn_main__app">
        <div variant="flat" class="drn_main__content">

          <!-- ヘッダ -->
          <div class="drn_header">
            <div class="drn_header__item">
              <v-card-title class="drn_header__title">予約詳細</v-card-title>
            </div>
          </div>

          <!-- 詳細情報 -->
          <v-card-text class="drn_content">
            <div class="drn_content__body">
              <!-- 左カラム：リスト -->
              <v-sheet class="drn_content__data">
                <table class="drn_table drn_table--reserve_conf">
                  <tbody>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">予約番号</th>
                      <td class="drn_table__data">{{ reservationNumber }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">予約状況</th>
                      <td class="drn_table__data">{{ reservationStatus }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">説明</th>
                      <td class="drn_table__data">{{ statusDescription }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">航路発着日時</th>
                      <td class="drn_table__data">{{ convertedDate }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">飛行目的</th>
                      <td class="drn_table__data">{{ purpose }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">航路</th>
                      <td class="drn_table__data">{{ route }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">航路区間</th>
                      <td class="drn_table__data">{{ section }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">機体リモートID</th>
                      <td class="drn_table__data">{{ aircraftId }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">離陸場：</th>
                      <td class="drn_table__data">{{ portFrom }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">着陸場：</th>
                      <td class="drn_table__data">{{ portTo }}</td>
                    </tr>
                  </tbody>
                </table>
                <v-divider class="drn_divider"></v-divider>
                <table class="drn_table drn_table--reserve_conf">
                  <tbody>
                    <tr class="drn_table__row">
                      <td class="drn_table__data" v-if="chartData">
                        <v-timeline side="end" truncate-line="both" size="x-small" class="drn_timeline drn_timeline--route">
                          <v-timeline-item v-for="(item, index) in combinedList" :key="index">
                            <template v-slot:icon v-if="index === 0">
                            </template>
                            <template v-slot:icon v-if="index === combinedList.length - 1">
                            </template>
                            <span class="drn_timeline__title" >{{ item.name }}</span>
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
                      <td class="drn_table__data">{{ totalDistance }} m</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">運航事業者</th>
                      <td class="drn_table__data">{{ companyName }}</td>
                    </tr>
                    <tr><td class="drn_table__space"></td></tr>
                    <tr class="drn_table__row">
                      <th class="drn_table__label">予約・更新日</th>
                      <td class="drn_table__data">{{ reservationDay }}</td>
                    </tr>
                  </tbody>
                </table>
              </v-sheet>
              <!-- 右カラム：マッププレビュー -->
              <v-sheet rounded="lg" color="default" class="drn_content__map">
                <MapComponent
                  v-if="chartData"
                    :chartData="chartData"
                    :section="section"
                    :airwayId="airwayId"
                    class="detailMap"
                    :showCheckBox=true
                    :showLegend=true
                    :showMarker=false
                    @update:isEndIdFirst="handleIsEndIdFirst"
                />
              </v-sheet>
            </div>
          </v-card-text>
        </div>
      </div>
      <!-- .drn_main__app -->
    </div>

    <!-- ページナビゲーション -->
    <PageNavigation :back="true">
      <ul class="e-buttonGroup">
        <li>
          <button class="e-button" @click="changeDialog" v-if="cancelable">予約{{ cancelWord }}</button>
        </li>
      </ul>
    </PageNavigation>
    <div v-if="isOverlayVisible" class="overlay"></div>
    <dialog class="c-dialog" v-if="isDialog1Visible">
      <h2 class="e-dialogTitle">この予約を{{ cancelWord }}すると離発着場の予約も{{ cancelWord }}されます。<br>この予約を{{ cancelWord }}しますか？</h2>
      <ul class="e-buttonGroup">
        <li>
          <button class="e-button-noright" @click="closeDialog">いいえ</button>
        </li>
        <li>
          <button class="e-button-noright" @click="cancelReservation">はい</button>
        </li>
      </ul>
      <p>※ドローン機体の予約を{{ cancelWord }}する場合は、メニュー「ドローン機体一覧」から{{ cancelWord }}してください</p>
    </dialog>
    <dialog class="c-dialog" v-if="isDialog2Visible">
      <h2 class="e-dialogTitle" v-if="cancelStatus === 'running'">予約の{{ cancelWord }}を実行中です</h2>
      <p v-if="cancelStatus === 'running'">しばらくお待ちください。</p>
      <h2 class="e-dialogTitle" v-if="cancelStatus === 'ok'">予約を{{ cancelWord }}しました</h2>
      <h2 class="e-dialogTitle" style="margin-bottom: 5px" v-if="cancelStatus === 'ng'">予約の{{ cancelWord }}に失敗しました</h2>
      <p v-if="cancelStatus === 'ng'">既に{{ cancelWord }}されていないか予約一覧よりご確認ください。<br>{{ cancelWord }}されていない場合、しばらく時間をあけて再度実行をお願いします。</p>
      <table class="c-labeledList">
        <tbody>
          <tr class="c-labeledListRow">
            <th class="org-listLabel">予約番号：</th>
            <td class="e-listValue">{{ reservationNumber }}</td>
          </tr>
          <tr class="c-labeledListRow">
            <th class="org-listLabel">航路発着日時：</th>
            <td class="e-listValue">{{ convertedDate }}</td>
          </tr>
          <tr class="c-labeledListRow">
            <th class="org-listLabel">航路：</th>
            <td class="e-listValue">{{ route }}</td>
          </tr>
          <tr class="c-labeledListRow">
            <th class="org-listLabel">離陸場：</th>
            <td class="e-listValue">{{ portFrom }}</td>
          </tr>
          <tr class="c-labeledListRow">
            <th class="org-listLabel">着陸場：</th>
            <td class="e-listValue">{{ portTo }}</td>
          </tr>
        </tbody>
      </table>
      <a href="/airwayReservation" class="e-button-noright" v-if="cancelStatus !== 'running'">予約一覧へ戻る</a>
    </dialog>
  </main>
</template>

<script>
import MapComponent from '@/components/map/showAirwayReservationDetail.vue';
// 航路運営者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 運航事業者向けサイドバー
import GlobalNavigation from "~/components/navigation/globalNavigation.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "~/components/navigation/pageNavigation.vue";

export default {
  components: {
    MapComponent, // MapComponent を登録
    GlobalNavigationRM,
    GlobalNavigation,
    GlobalNavigationSH,
    PageNavigation
  },
  data() {
    return {
      id: this.$route.query.id,
      reservationNumber: this.$route.query.reservationNumber,
      reservationStatus: this.$route.query.reservationStatus,
      rawReservationStatus: this.$route.query.rawReservationStatus,
      reservationDay: this.$route.query.reservationDay,
      airwayId: this.$route.query.airwayId,
      route: this.$route.query.route,
      section: this.$route.query.section,
      purpose: this.$route.query.purpose,
      startDay: this.$route.query.startDay,
      endDay: this.$route.query.endDay,
      operatorId: this.$route.query.operatorId,
      totalDistance: "0",  // 初期値
      chartData: null, // インポートした JSON データを chartData に設定
      cookie_role: null,
      role: null,
      companyName: null,
      operatorData: null,
      portFrom: "-",
      portTo: "-",
      aircraftId: "-",
      isOverlayVisible: false,
      isDialog1Visible: false,
      isDialog2Visible: false,
      cancelable: false,
      cancelStatus: "initial",
      cancelWord: "キャンセル",
      isEndIdFirst: false,
    };
  },
  computed: {
    statusDescription() {
      let result = '';
      try {
        if (!this.reservationStatus) {
          throw new Error('reservationStatus is empty');
        }
        if (!this.rawReservationStatus) {
          throw new Error('rawReservationStatus is empty');
        }
        switch (this.reservationStatus) {
          case '予約済み': 
            result = '予定通り運航可能です。'
            break;
          case '　中止　': 
            if (this.rawReservationStatus == 'CANCELED') {
              result = 'お客様ご自身によるキャンセルです。'
            } else if (this.rawReservationStatus == 'RESCINDED') {
              result = '航路運営者によって撤回されました。'
            } else {
              throw new Error('rawReservationStatus is invalid status');
            }
            break;
          default:
            result = '予約をキャンセルして下さい。'
            break;
        }
      } catch (e) {
        result = '予約状況の取得に失敗しました。しばらく待って再度ご確認ください。';
        console.error('failed to statusDescription:', e);
      }
      return result;
    },
    convertedDate() {
      let result = '';
      try {
        if (!this.startDay) {
          throw new Error('startDay is empty');
        }
        if (!this.endDay) {
          throw new Error('endDay is empty');
        }
        /* 日をまたがない想定 */
        let date = this.startDay.slice(0, 10);
        let startTime = this.startDay.slice(11, 16);
        let endTime = this.endDay.slice(11, 16);
        let dayOfTheWeek = useDateStringGetDayOfTheWeekString(date);
        result = date + ' (' + dayOfTheWeek + ') ' + startTime + ' ~ ' + endTime;
      } catch (e) {
        result = '取得失敗';
        console.error('failed to convertedDate:', e);
      }
      return result;
    },
    combinedList () {
      const points = useAirwayGetCorridorPointNameListFromAirwayId(this.chartData, this.airwayId);
      const sections = useAirwayGetCorridorSectionNameListFromAirwayId(this.chartData, this.airwayId);
      // 予約された航路点名のリストを取得
      const rangepoints = this.section.split(" ~ ");

      if(this.isEndIdFirst){
      // rangepointsの中身を逆にする
      [rangepoints[0], rangepoints[1]] = [rangepoints[1], rangepoints[0]];
      console.log("rangepoints",rangepoints);
    }

      // 開始の航路点名を取得
      const s_point = rangepoints[0].trim();
      // 終了の航路点名を取得
      const e_point = rangepoints[1].trim();

      // 予約された航路における開始と終了のindexを取得
      let startIndex = 0;
      let endIndex = 0;
      for (let i=0; i<points.length; i++ ) {
        if (points[i] === s_point) {
          startIndex = i;
          continue;
        } else if (points[i] === e_point) {
          endIndex = i;
          continue;
        } else {
          continue;
        }
      }
      const sectionList = this.section.split(" ~ ");
      if(this.isEndIdFirst){
        // sectionListの中身を逆にする
        [sectionList[0], sectionList[1]] = [sectionList[1], sectionList[0]];
      }
      // 航路区画の間の距離 (メートル)
      this.totalDistance = useAirwayGetDistanceFromJunctionNameList(this.chartData, this.airwayId, sectionList);
      let combined = [];

      if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
        // 範囲内のpointsとsectionsを取得
        const rangePoints = points.slice(startIndex, endIndex + 1);
        const rangeSections = sections.slice(startIndex, endIndex);

        // pointsとsectionsを交互にcombinedに追加
        for (let i = 0; i < rangePoints.length; i++) {
          combined.push({ type: 'c-landMarkNameField', name: rangePoints[i] });
        }
      }
      if(this.isEndIdFirst){
        // combinedを逆に並び替える
        combined = combined.reverse();
      }

      return combined;
    }
  },
  methods: {
    closeDialog() {
      this.isOverlayVisible = false;
      this.isDialog1Visible = false;
      this.isDialog2Visible = false;
      this.cancelStatus = "initial";
    },
    changeDialog() {
      this.isOverlayVisible = true;
      this.isDialog1Visible = true;
      this.isDialog2Visible = false;
      this.cancelStatus = "initial";
    },
    async cancelReservation() {
      // 0. 表示をキャンセル処理実行中に遷移
      this.isOverlayVisible = true;
      this.isDialog1Visible = false;
      this.isDialog2Visible = true;
      this.cancelStatus = "running";

      // 1. 初期化
      let cancelFailed = false;
      let reservationNumber = await this.reservationNumber;
      const operatorId = await this.cookie_role.operatorId;
      console.log('1. reservationNumber:', reservationNumber, 'operatorId:', operatorId);
      let operatorIdFrom = '';
      let operatorIdTo = '';

      try {
        // 2. 航路予約ID から ポート予約ID の取得
        let res = await axios_get('/api/getDronePortReservationIdFrom', {id: reservationNumber}, {});
        if (res.status != 200) {
          throw new Error(`2. failed to getDronePortReservationIdFrom(${reservationNumber})[${res.status}]`);
        }
        const portIdFrom = res.data.idFrom; // ポート予約ID
        const portIdTo = res.data.idTo;     // ポート予約ID
        console.log('2. portIdFrom:', portIdFrom, ' portIdTo:', portIdTo);
        if (portIdFrom === '' || portIdTo === '') {
          throw new Error(`2. dronePortReservationId empty, from:${portIdFrom}, To:${portIdTo}`);
        }

        // 3-1. ポート予約ID (離陸) の状態の取得
        let portActiveFrom = false;
        let dronePortIdFrom = '';
        const droneApiBaseUrl = useRuntimeConfig().public.droneApiBaseUrl;
        const urlPortRsvDetailFrom = `${droneApiBaseUrl}/droneport/reserve/detail/${portIdFrom}`;
        res = await axios_get(urlPortRsvDetailFrom, {}, {});
        switch (res.status) {
        case 200:
          console.log('reservationActiveFlag(From):', res.data.reservationActiveFlag);
          portActiveFrom = true;
          dronePortIdFrom = res.data.dronePortId; // ドローンポートID
          operatorIdFrom = res.data.operatorId;   // ポート予約ID
          break;
        case 400:
          // 既に事前にポート予約を削除している場合 Bad request が返却される。
          // 後続の処理の処理を行うためにエラーにはしない。
          break;
        default:
          throw new Error(`3-1. failed to getDronePortReservationDetail(${urlPortRsvDetailFrom}), ${res.status}`);
        }
        console.log('3-1. portActiveFrom:', portActiveFrom, ' dronePortIdFrom:', dronePortIdFrom, ' operatorIdFrom:', operatorIdFrom);

        // 3-2. ポート予約ID (着陸) の状態の取得
        let portActiveTo = false;
        let dronePortIdTo = '';
        const urlPortRsvDetailTo = `${droneApiBaseUrl}/droneport/reserve/detail/${portIdTo}`;
        res = await axios_get(urlPortRsvDetailTo, {}, {});
        switch (res.status) {
        case 200:
          console.log('reservationActiveFlag(To):', res.data.reservationActiveFlag);
          portActiveTo = true;
          dronePortIdTo = res.data.dronePortId; // ドローンポートID
          operatorIdTo = res.data.operatorId;   // ポート予約ID
          break;
        case 400:
          // 既に事前にポート予約を削除している場合 Bad request が返却される。
          // 後続の処理の処理を行うためにエラーにはしない。
          break;
        default:
          throw new Error(`3-2. failed to getDronePortReservationDetail(${urlPortRsvDetailTo}), ${res.status}`);
        }
        console.log('3-2. portActiveTo:', portActiveTo, ' dronePortIdTo:', dronePortIdTo, ' operatorIdTo:', operatorIdTo);

        // 4-1. ポート情報 (離陸) の取得
        if (portActiveFrom) {
          const urlPortDetailFrom = `${droneApiBaseUrl}/droneport/info/detail/${dronePortIdFrom}`;
          res = await axios_get(urlPortDetailFrom, {}, {});
          if (res.status != 200) {
            throw new Error(`4-1. failed to getDronePortReservationDetail(${urlPortDetailFrom}), ${res.status}`);
          }
          const dronePortNameFrom = res.data.dronePortName;
          this.portFrom = dronePortNameFrom;
          console.log('4-1. dronePortNameFrom:', dronePortNameFrom);
        }

        // 4-2. ポート情報 (着陸) の取得
        if (portActiveTo) {
          const urlPortDetailTo = `${droneApiBaseUrl}/droneport/info/detail/${dronePortIdTo}`;
          res = await axios_get(urlPortDetailTo, {}, {});
          if (res.status != 200) {
            throw new Error(`4-2. failed to getDronePortReservationDetail(${urlPortDetailTo}), ${res.status}`);
          }
          const dronePortNameTo = res.data.dronePortName;
          this.portTo = dronePortNameTo;
          console.log('4-2. dronePortNameTo:', dronePortNameTo);
        }

        // 5-1. ポート予約 (離陸) の削除
        if (portActiveFrom) {
          const urlPortRsvDeleteFrom = `${droneApiBaseUrl}/droneport/reserve/${portIdFrom}`;
          const reqBody = {operatorId: operatorIdFrom};
          res = await axios_delete_body(urlPortRsvDeleteFrom, reqBody);
          if (res.status != 200) {
            throw new Error(`5-1. failed to deleteDronePortReservation(${urlPortRsvDeleteFrom}), ${res.status}`);
          }
          console.log('5-1. delete dronePortReservation(From):', portIdFrom);
        } else {
          console.log('5-1. skip to delete dronePortReservation(From):', portIdFrom);
        }

        // 5-2. ポート予約 (着陸) の削除
        if (portActiveTo) {
          const urlPortRsvDeleteTo = `${droneApiBaseUrl}/droneport/reserve/${portIdTo}`;
          const reqBody = {operatorId: operatorIdTo};
          res = await axios_delete_body(urlPortRsvDeleteTo, reqBody);
          if (res.status != 200) {
            throw new Error(`5-2. failed to deleteDronePortReservation(${urlPortRsvDeleteTo}), ${res.status}`);
          }
          console.log('5-2. delete dronePortReservation(To):', portIdTo);
        } else {
          console.log('5-2. skip to delete dronePortReservation(To):', portIdTo);
        }

        // 6. 航路予約ID の状態の取得
        const reservationApiBaseUrl = useRuntimeConfig().public.reservationApiBaseUrl;
        const urlAirRsv = `${reservationApiBaseUrl}/airwayReservations/${reservationNumber}`;
        res = await axios_get(urlAirRsv, {}, {});
        if (res.status != 200) {
          throw new Error(`6. failed to airwayReservations(${urlAirRsv}), ${res.status}`);
        }
        const rsvStatus = res.data.status;
        console.log('6. rsvStatus:', rsvStatus);

        // 7. キャンセル/撤回
        if ((rsvStatus == 'CANCELED') || (rsvStatus == 'RESCINDED')) {
          // キャンセル/撤回済みであれば、キャンセル/撤回操作は行わない
          console.log('7. airway already canceled:', reservationNumber);
        } else {
          if (this.role == 1) { // 航路運営者: 撤回
            const urlTekkai = `${reservationApiBaseUrl}/admin/airwayReservations/${reservationNumber}/rescind`;
            res = await axios_put(urlTekkai, {}, {headers: {'Content-Type': 'application/json'}});
            if (res.status != 200) {
              throw new Error(`7. failed to tekkai(${urlTekkai}), ${res.status}`);
            }
            console.log('7. tekkai succeeded.');
          } else if (this.role == 2) { // 運航事業者: キャンセル
            const urlCancel = `${reservationApiBaseUrl}/airwayReservations/${reservationNumber}/cancel`;
            res = await axios_put(urlCancel, {}, {headers: {'Content-Type': 'application/json'}});
            if (res.status != 200) {
              throw new Error(`7. failed to cancel(${urlCancel}), ${res.status}`);
            }
            console.log('7. cancel succeeded.');
          }
        }

        // 8. 紐付DB から航路予約ID, ポート予約情報を削除
        res = await axios_post(
          '/api/removeAirwayReservationIdWith',
          {
            airwayReservationId: reservationNumber,
            dronePortReservationIdFrom: portIdFrom,
            dronePortReservationIdTo: portIdTo
          },
          {
            headers: {'Content-Type': 'application/json'}
          }
        );
        if (res.status != 200) {
          throw new Error(`8. failed to removeAirwayReservationIdWith(${reservationNumber}), ${res.status}`);
        }
        console.log('8. all completion:', reservationNumber, portIdFrom, portIdTo);
      } catch (cerr) {
        console.error('failed to cancelReservation:', cerr);
        cancelFailed = true;
      } finally {
        this.cancelStatus = (cancelFailed) ? "ng" : "ok";
      }
    },
    async getCancelable() {
      let cancelable = false;
      const role = await this.role;

      if (role == 1 || role == 2) {
        const rsvStat = await this.rawReservationStatus;
        cancelable = (rsvStat !== 'CANCELED' && rsvStat !== 'RESCINDED');
      }

      console.log('cancelable(1st):', cancelable);
      return cancelable;
    },
    handleIsEndIdFirst(value) {
      this.isEndIdFirst = value;
    },
  },
  async created() {
    if (process.client) {
      // ロールチェック
      const ownpage_role = ["1","2","3"];
      this.cookie_role = await roleVerification(ownpage_role);
      if (Object.keys(this.cookie_role).length == 0) {
        console.error(`airwayReservation get role error.`);
        return;
      }
      switch (this.cookie_role.virtual_role) {
        case "1":
          this.role = 1;  // 航路運営者
          this.cancelWord = "撤回";
          break;
        case "2":
          this.role = 2;  // 運航事業者
          this.cancelWord = "キャンセル";
          break;
        case "3":
          this.role = 3; // 関係者
          break;
        default:
          this.role = null;
          break;
      }
      console.log(`virtual_role: ${this.cookie_role.virtual_role}, role: ${this.role}`);
    }
  },
  async mounted() {
    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, {airwayId: this.airwayId}, {});
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      this.chartData = {};
    }
    this.chartData = useAirwayConvertConnectionOrder(airwayRes.data);
    // 事業者一覧情報を取得
    const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
    const operatorUrl = `${miscApiBaseUrl}/operator`;
    const operatorRes = await axios_get(operatorUrl);
    if (operatorRes.status === 200 && operatorRes.data != undefined) {
      this.operatorData = {};
      this.operatorData = operatorRes.data;
    } else {
      console.error(`error: get operator info {status: ${operatorRes.status}}.`);
      return;
    }
    this.companyName = getcompanyName(this.operatorData, this.operatorId);

    const url = '/api/getAircraftInfoFrom?id=' + this.reservationNumber;
    const locationRes = await axios_get(url, {}, {});
    if (locationRes.status === 200) {
      this.aircraftId = locationRes.data.aircraftRemoteId;
    }

    // 航路予約ID から ポート予約ID の取得
    let res = await axios_get('/api/getDronePortReservationIdFrom', {id: this.reservationNumber}, {});
    if (res.status != 200) {
      return false;
    }
    const portIdFrom = res.data.idFrom; // ポート予約ID
    const portIdTo = res.data.idTo;     // ポート予約ID

    if (portIdFrom !== '' && portIdTo !== '') {
      this.getCancelable()
      .then(cancelable => {
        this.cancelable = cancelable;
        console.log('cancelable(fix):', this.cancelable,
                    'rawReservationStatus:', this.rawReservationStatus);
      })
    }

    // 出発地取得
    let dronePortIdFrom = '';
    const droneApiBaseUrl = useRuntimeConfig().public.droneApiBaseUrl;
    const urlPortRsvDetailFrom = `${droneApiBaseUrl}/droneport/reserve/detail/${portIdFrom}`;
    res = await axios_get(urlPortRsvDetailFrom, {}, {});
    if(res.status !== 200) {
      return false;
    }
    dronePortIdFrom = res.data.dronePortId;  // ドローンポートID

    const urlPortDetailFrom = `${droneApiBaseUrl}/droneport/info/detail/${dronePortIdFrom}`;
    res = await axios_get(urlPortDetailFrom, {}, {});
    if (res.status != 200) {
      return false;
    }
    const fromDronePortName = res.data.dronePortName;
    this.portFrom = fromDronePortName;

    // 到着地取得
    let dronePortIdTo = '';
    const urlPortRsvDetailTo = `${droneApiBaseUrl}/droneport/reserve/detail/${portIdTo}`;
    res = await axios_get(urlPortRsvDetailTo, {}, {});
    if (res.status != 200) {
      return false;
    }
    dronePortIdTo = res.data.dronePortId;  // ドローンポートID

    const urlPortDetailTo = `${droneApiBaseUrl}/droneport/info/detail/${dronePortIdTo}`;
    res = await axios_get(urlPortDetailTo, {}, {});
    if (res.status != 200) {
      return false;
    }
    const toDronePortName = res.data.dronePortName;
    this.portTo = toDronePortName;
  },
}
</script>

<style>
.b-twoColumn {
  grid-template-columns: 40% 60%;
}

.c-labeledList {
  overflow-y: scroll;
}

.c-labeledListRow {
  width: 35px;
  
}

.detailMap {
  height: calc(100dvh - 280px) !important;
}

.b-pageHeader {
  height: 115px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.c-dialog {
  z-index: 1000;
  position: fixed;
  height: 60%;
  width: 80%;
}

.org-listLabel {
  width: 250px;
  padding-right: 1rem;
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-bold) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  opacity: 1;
  height: 2rem;
  vertical-align: middle;
}
</style>
