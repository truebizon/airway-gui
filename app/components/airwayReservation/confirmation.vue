<template>
  <div class="drn_form__header">
    <div class="drn_form__title">予約内容確認</div>
  </div>

  <!-- 詳細情報 -->
  <v-card-text class="drn_content">
    <div class="drn_content__body">
      <v-sheet class="drn_content__data">
        <!-- 左カラム：リスト -->
        <div class="detailList">
          <table class="drn_table drn_table--reserve_conf">
            <tbody>
              <tr class="drn_table__row">
                <th class="drn_table__label">予約状況</th>
                <td class="drn_table__data">未申請</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路発着日時</th>
  	            <td class="drn_table__data">
                  <time datetime="2024-10-08">{{ datetime }}</time
                  ><time datetime="10:30">{{ departure }}</time
                  ><span class="e-waveLine">から</span
                  ><time datetime="2024-10-08">{{ datetime }}</time
                  ><time datetime="13:00">{{ arrival }}</time>
  	            </td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">飛行目的</th>
                <td class="drn_table__data">{{ purpose }}</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路</th>
                <td class="drn_table__data">{{ airwayName }}</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">離陸場</th>
                <td class="drn_table__data">{{ departurePort }}</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">着陸場</th>
                <td class="drn_table__data">{{ arrivalPort }}</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">機体リモートID</th>
                <td class="drn_table__data">{{ aircraftId }}</td>
              </tr>
            </tbody>
          </table>

          <v-divider
            class="drn_divider"
          ></v-divider>

          <table class="drn_table drn_table--reserve_conf">
            <tbody>
              <tr class="drn_table__row">
                <th class="drn_table__label">予約区間</th>
                <td class="drn_table__data" v-if="chartData">

                  <!-- #content -->
                  <v-timeline side="end" truncate-line="both" size="x-small" class="drn_timeline drn_timeline--route">
                    <v-timeline-item v-for="(item, index) in combinedList" :key="index" v-bind:class="[ index === 0 ? 'drn_timeline__item drn_timeline__item--start' : index === combinedList.length - 1 ? 'drn_timeline__item drn_timeline__item--goal' : 'drn_timeline__item' ]">
                      <template v-slot:icon v-if="index === 0">
                        <span>S</span>
                      </template>
                      <template v-slot:icon v-if="index === combinedList.length - 1">
                        <span>G</span>
                      </template>
                      <span class="drn_timeline__title" >{{ item.name }}</span>
                    </v-timeline-item>
                  </v-timeline>
                </td>
                <!-- .drn_table__data -->
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">総距離</th>
                <td class="drn_table__data"><span lang="en">{{ totalDistance }} m</span></td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">運航事業者</th>
                <td class="drn_table__data">{{ roleData.operatorName }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- .detailList -->
      </v-sheet>
      <!-- .drn_content__data -->

      <!-- 右カラム：マッププレビュー -->
      <v-sheet rounded="lg" color="default" class="drn_content__map--scroll">
        <MapComponent
        v-if="chartData"
          class="confirmationMap"
          :chartData="chartData"
          :section="sectionRange"
          :airwayId="airwayId"
          :showCheckBox=true
          :showLegend=true
          :showMarker=false
          :departurePort="departurePortDegrees"
          :arrivalPort="arrivalPortDegrees"
          :isEndIdFirst="isEndIdFirst"
          id="Identification"
          :stepNo="stepNo"
        />
      </v-sheet>
      <!-- .drn_content__map -->
    </div>
    <!-- .drn_content__body -->
  </v-card-text>
  <!--/.drn_content -->
</template>

<script>
import MapComponent from '@/components/map/showAirwayReservationConfirmation.vue'; // 修正後のインポート

export default {
  components: {
    MapComponent,
  },
  props: ['rangeData', 'roleData', 'stepNo',],
  data() {
    return {
      // 総距離を表示するための値
      totalDistance: "0",
      // グラフやマップに渡すデータ
      chartData: null,
      // ルートパラメータから取得 (this.$route.query で取れる)

      purpose: this.rangeData.purpose,   
      type: this.rangeData.type,  
      airwayName: this.rangeData.airwayName,  
      airwayId: this.rangeData.airwayId,
      aircraftId: this.rangeData.aircraftId,
      junctionList: this.rangeData.junctionList.value.split(','),
      section: this.rangeData.section,
      formerDatetime: this.rangeData.datetime,
      departure: this.rangeData.departure,
      arrival: this.rangeData.arrival,
      departurePort: this.rangeData.departurePort,
      arrivalPort: this.rangeData.arrivalPort,
      departurePortId: this.rangeData.departurePortId,
      arrivalPortId: this.rangeData.arrivalPortId,
      departurePortDegrees: this.rangeData.departurePortDegrees,
      arrivalPortDegrees: this.rangeData.arrivalPortDegrees,
      isEndIdFirst: this.rangeData.isEndIdFirst,
      postJsonData: "",
      postDepaturePortJsonData: "",
      postArrivalPortJsonData: "",
      stepNo: this.stepNo,
    };
  },
  computed: {
    sectionRange() {
      let sectionList = this.section.split(',');
      return sectionList[0] + ' ~ ' + sectionList[1];
    },
    
    datetime() {
      const datetime = new Date(this.formerDatetime);
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
      }).format(datetime);
    },
    
    combinedList() {
    const points = useAirwayGetCorridorPointNameListFromAirwayId(this.chartData, this.airwayId);
    const sections = useAirwayGetCorridorSectionNameListFromAirwayId(this.chartData, this.airwayId);
    const sectionList = this.section.split(',');
    let combined = [];

    if(this.isEndIdFirst){
      // sectionListの中身を逆にする
      [sectionList[0], sectionList[1]] = [sectionList[1], sectionList[0]];
      console.log("sectionList",sectionList);
    }

    // sectionListの最初と最後の要素のインデックスを取得
    const startIndex = points.indexOf(sectionList[0]);
    const endIndex = points.indexOf(sectionList[1]);

    // インデックスが有効であることを確認
    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      // 範囲内のpointsとsectionsを取得
      const rangePoints = points.slice(startIndex, endIndex + 1);
 
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
    },
  },
  methods: {
    startAt() {
      // 要修正。日本で使われるケースのみ想定。
      return useDateStringLocaltoUTC(this.formerDatetime + 'T' + this.departure + ':00+09:00');
    },
    // 終了日時をISOの形で返す
    endAt() {
      // 要修正。日本で使われるケースのみ想定。
      return useDateStringLocaltoUTC(this.formerDatetime + 'T' + this.arrival + ':00+09:00');
    },
    // 離陸ポートの終了日時をISOの形で返す
    addMinutesToTime(time, minutes) {
      const date = new Date(time);
      date.setMinutes(date.getMinutes() + minutes);
      return date.toISOString(); 
    },
    subtractMinutesFromTime(time, minutes) {
      const date = new Date(time);
      date.setMinutes(date.getMinutes() - minutes);
      return date.toISOString(); 
    },

      // 航路予約データのJSONを作成
      generateJson(sectionList) {
      let airwaySections = useAirwayReservationGetSectionIdListFromCorridorPointList(
        this.chartData,
        sectionList,
        this.airwayId,
        this.startAt(),
        this.endAt(),
      );
      if (this.isEndIdFirst) {
        // airwaySectionsの中身を逆にする
        console.log(airwaySections)
        if (airwaySections.length > 1){
          airwaySections = airwaySections.reverse();
        }
      }
      return {
        operatorId: this.roleData.operatorId,
        airwaySections: airwaySections,
      };
    },

    // ポート予約データのJSONを作成(離陸場)
    generateDepaturePortJson() {
      console.log(this.departurePortId);
      return {
        operatorId: this.roleData.operatorId,
        data: [
          {
            dronePortId: this.departurePortId,
            routeReservationId:'',
            usageType: 1,
            reservationTimeFrom: this.startAt(),
            reservationTimeTo: this.addMinutesToTime(this.startAt(), 15),
          }
        ]
      };
    },

    // ポート予約データのJSONを作成(着陸場)
    generateArrivalPortJson() {
      console.log(this.arrivalPortId);
      return {
        operatorId: this.roleData.operatorId,
        data: [
          {
            dronePortId: this.arrivalPortId,
            routeReservationId:'',
            usageType: 2,
            reservationTimeFrom: this.subtractMinutesFromTime(this.endAt(), 15),
            reservationTimeTo: this.endAt(),
          }
        ]
      };
    },
  },
  async mounted() {
    // 前ページで指定された航路IDの航路情報を取得
    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, {airwayId: this.airwayId}, {});
    console.log(airwayRes);
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      this.chartData = {};
      return;
    }
    this.chartData = useAirwayConvertConnectionOrder(airwayRes.data);

    const sectionList = this.section.split(',');
    if(this.isEndIdFirst){
      // sectionListの中身を逆にする
      [sectionList[0], sectionList[1]] = [sectionList[1], sectionList[0]];
      console.log("sectionList",sectionList);
    }
    this.totalDistance = useAirwayGetDistanceFromJunctionNameList(this.chartData, this.airwayId, sectionList);
    
    this.postJsonData = this.generateJson(sectionList);
    this.postDepaturePortJsonData = this.generateDepaturePortJson();
    this.postArrivalPortJsonData = this.generateArrivalPortJson();
    this.$emit('update:postJsonData', this.postJsonData, this.postDepaturePortJsonData, this.postArrivalPortJsonData);
  },
}

</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 黒で透過 */
  z-index: 999; /* ダイアログの下に表示 */
}

.c-dialog {
  z-index: 1000; /* オーバーレイの上に表示 */
  position: fixed;
}

.b-twoColumn {
  grid-template-columns: 30% 70%;
}

.subTitle {
  height: 50px;
}

.b-twoColumn {
  grid-template-columns: 40% 60%;
}

.c-labeledList{
  width: 490px;
  overflow-y: scroll;
  height: 60%;
}

.confirmationMap{
  height: 690px !important;
}

#map {
  height: 100%!important;
}

.b-pageHeader {
  height: 115px;
}

.detailList {
  height: 690px;
  overflow-y: scroll;
}

.detailList::-webkit-scrollbar {
  width: 8px;
  background: white;
}

.detailList::-webkit-scrollbar-thumb {
  background-color: #999999;
  border-radius: 5px;
}
</style>
