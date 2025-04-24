<template>
  <!-- モーダルウィンドウ ここから -->
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
    <!-- .item-center -->
    <div class="item-center">
      <input type="button" class="e-button-add" value="登録" @click="stakeholdersRegister" />
    </div>
    <!-- .item-center -->
  </div>
  <!-- .popup -->
  <!-- モーダルウィンドウ ここまで -->

  <!-- 詳細情報 -->
  <v-card-text class="drn_content">
    <div class="drn_content__body">

      <!-- 左カラム：リスト -->
      <v-sheet class="drn_content__data">
        <div class="drn_form__header">
          <div class="drn_form__title">画定申請 確認</div>
        </div>

        <div class="detailList">
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">関係者通知</td>
              <td class="drn_situation__data">{{ stakeholdersText }}</td>
              <td class="drn_situation__data">
                <input type="button" class="e-button-mod" value="変更" @click="togglePopup" />
              </td>
            </tr>
          </table>
          <hr class="custom-hr" />
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">航路</td>
              <td class="drn_situation__data">{{ routeName }}</td>
            </tr>
          </table>
          <hr class="custom-hr" />
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">区間</td>
              <td class="drn_situation__data">{{ airwayJunctionRange }}</td>
            </tr>
          </table>
          <hr class="custom-hr" />
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">飛行目的</td>
              <td class="drn_situation__data">{{ purpose }}</td>
            </tr>
          </table>
          <hr class="custom-hr" />
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">機体種別</td>
              <td class="drn_situation__data">{{ joinedType }}</td>
            </tr>
          </table>
          <hr class="custom-hr" />
          <table class="info-table">
            <tr>
              <v-timeline side="end" truncate-line="both" size="x-small" class="drn_timeline">
                <v-timeline-item v-for="(item, index) in combinedList" :key="index" v-bind:hide-dot="index % 2 == 0 ? false : true" v-bind:class="[index % 2 == 0 ? 'drn_timeline__item' : 'drn_timeline__item drn_timeline__item--via']">
                  <template v-slot:icon>
                    <span>{{ item.id }}</span>
                  </template>
                  <v-text-field :value="item.name" readonly></v-text-field>
                </v-timeline-item>
              </v-timeline>
            </tr>
          </table>
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">総距離</td>
              <td class="drn_situation__data">{{ airwayDistance }}</td>
            </tr>
          </table>
          <hr class="custom-hr" />
            <ChartComponent v-if="parsedcorridorData" :corridorData="parsedcorridorData" />
            <img src="/assets/css/img/chart/altitude150.png">
            <table class="info-table">
            <tr>
              <td class="drn_situation__label"></td>
              <td class="drn_situation__data">高度150m (高度は目安です)</td>
            </tr>
            </table>
          <hr class="custom-hr" />
          <table class="info-table">
            <tr>
              <td class="drn_situation__label">運航事業者</td>
              <td v-if="cookie_role" class="drn_situation__data">{{ airwayOperator }}</td>
            </tr>
          </table>
        </div>
        <!-- .detailList -->
      </v-sheet>
      <!-- .drn_content__data -->

      <!-- 右カラム：マッププレビュー -->
      <v-sheet rounded="lg" color="default" class="drn_content__map--scroll">
        <MapComponent :corridorData="parsedcorridorData" :message="fallToleranceRangeId" class="confirmationMap" :stepNo="stepNo"/>
      </v-sheet>
      <!-- drn_content__map -->

    </div>
    <!-- .drn_content__body -->
  </v-card-text>
  <!-- .drn_content -->
</template>

<script>
import MapComponent from '@/components/map/showAirwayConfirmation.vue';
import ChartComponent from '@/components/chart/airwaySideViewBeforeCreate.vue';
import { ref } from "vue";
import { useRoute } from "vue-router"

export default {
  components: {
    MapComponent,
    ChartComponent,
  },
  props: [
    "rangeData",
    "stakeholders",
    "stakeholdersSelected",
    'stepNo',
  ],
  data() {
    return {
      fallToleranceRangeId: this.rangeData.fallToleranceRangeId,
      stepNo: this.stepNo,
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
      //console.log(`role:${this.role}`);
    }
  },
  async setup(props, { emit }) {
    const purpose = props.rangeData.purpose;
    const type = props.rangeData.type;
    const routeName = props.rangeData.routeName;
    const fallToleranceRangeId = props.rangeData.fallToleranceRangeId;
    const corridorData = props.rangeData.corridorData;
    const stakeholders = ref(props.stakeholders);
    const stakeholdersSelected = ref(props.stakeholdersSelected);
    const showStakeholdersPopup = ref(false);
    const stakeholdersAllSelected = ref(false);
    const itemsPerPage = 10;

    const parsedcorridorData = corridorData.value;
    console.log(parsedcorridorData);

    const id = parsedcorridorData.airwayId
    const airwayData = {
        airway: {
            airways: [parsedcorridorData]
        }
    };

    const airwayDistance = useAirwayGetFullDistanceFromAirwayId(airwayData, id) + 'm';
    const airwayJunctionRange = useAirwayGetCorridorPointRangeFromAirwayIdFullWidth(airwayData, id);
    const cookie_role = ref(null);
    const role = ref(null);
    if (process.client) {
      // ロールチェック
      const ownpage_role = ["1","2","3"];
      cookie_role.value = await roleVerification(ownpage_role);
      if (Object.keys(cookie_role).length == 0) {
        console.log(`airwayReservation get role error.`);
        return;
      }
      console.log(`virtual_role:${cookie_role.value.virtual_role}`);
      switch (cookie_role.value.virtual_role) {
        case "1":
          role.value = 1;  // 航路運営者
          break;
        case "2":
          role.value = 2;  // 運航事業者
          break;
        case "3":
          role.value = 3; // 関係者
          break;
        default:
          role.value = null;
          break;
      }
      console.log(`role:${role.value}`);
    }
    const airwayOperator = cookie_role.value.operatorName;
    console.log(airwayOperator);

    let postJsonData = {
      "airwayDeterminationId": parsedcorridorData.determination_id,
      "airwayName": parsedcorridorData.airwayName,
      "flightPurpose": parsedcorridorData.flightPurpose,
      "airwayParts": [],
    };

    for (let i = 0; i < parsedcorridorData.airwayJunctions.length; i++) {
        let airwayPart = {
          prevAirwayPartsIndex: i === 0 ? null : i - 1,
          despersionNode: {
            name: parsedcorridorData.despersion_nodes[i].name,
            geometry: {
              coordinates: parsedcorridorData.despersion_nodes[i].geometry.coordinates,
              type: 'LineString'
            },
            fallSpaceCrossSectionId: parsedcorridorData.despersion_nodes[i].fallSpaceCrossSectionId
          },
          airwayJunction: [{
            name: parsedcorridorData.airwayJunctions[i].airwayJunctionName,
            geometry: {
              coordinates: [parsedcorridorData.airwayJunctions[i].airways[0].airway.geometry.coordinates],
              type: 'Polygon'
            },
            deviationGeometry: {
              coordinates: [parsedcorridorData.airwayJunctions[i].airways[0].deviation.geometry.coordinates],
              type: 'Polygon'
            }
          }],
          airwaySection: parsedcorridorData.airwaySections[i] ? 
            { name: parsedcorridorData.airwaySections[i].airwaySectionName } : 
            null
        };
        console.log(airwayPart);
        postJsonData.airwayParts.push(airwayPart);
    }

    console.log("postJsonData",postJsonData);
    emit('update:postJsonData', postJsonData);
    console.log("stakeholdersSelected", stakeholdersSelected.value);

    return {
      //showModal,
      airwayDistance,
      airwayJunctionRange,
      airwayOperator,

      purpose,
      type,
      routeName,
      fallToleranceRangeId,
      corridorData,
      parsedcorridorData,

      cookie_role,
      role,

      stakeholders,
      stakeholdersSelected,
      showStakeholdersPopup,
      stakeholdersAllSelected,
      itemsPerPage,
    };
  },
  computed: {

    combinedList() {
      const points = this.parsedcorridorData.airwayJunctions || [];
      const sections = this.parsedcorridorData.airwaySections || [];
      const maxLength = Math.max(points.length, sections.length);
      const combined = [];

      for (let i = 0; i < maxLength; i++) {
        if (i < points.length) {
          //combined.push({ type: 'c-landMarkNameField', name: points[i].airwayJunctionName });
          combined.push({ id: i+1, type: 'c-landMarkNameField', name: points[i].airwayJunctionName });
        }
        if (i < sections.length) {
          //combined.push({ type: 'c-sectionNameField', name: sections[i].airwaySectionName });
          combined.push({ id: i+1, type: 'c-sectionNameField', name: sections[i].airwaySectionName });
        }
      }
      return combined;
    },
    joinedType() {
      return this.type.join();
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
    togglePopup() {
      this.showStakeholdersPopup = !this.showStakeholdersPopup;
      console.log('showStakeholdersPopup:', this.showStakeholdersPopup);
    },
    toggleSelectAll() {
      if (this.stakeholdersAllSelected) {
        this.stakeholdersSelected = this.stakeholders.map(item => item.operatorId);
      } else {
        this.stakeholdersSelected = [];
      }
    },
    stakeholdersRegister() {
      const selectedData = this.stakeholders.filter(item =>
        this.stakeholdersSelected.includes(item.operatorId)
      );
      console.log("stakeholdersSelected",this.stakeholdersSelected);
      this.$emit('update:addStakeholdersSelected', this.stakeholdersSelected);
      // ポップアップを非表示にする
      this.showStakeholdersPopup = false;
    },
  },
}

</script>

<style scoped>

.b-twoColumn {
  grid-template-columns: 40% 60%;
}

div#content.b-twoColumn.landmarkFormList {
  grid-template-columns: 100% 0%;
}

.confirmationMap {
 height: 690px !important;
}

#map {
  height: 100%!important;
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

.custom-hr {
  margin: 10px 0;
  border: none;
  border-top: 1px solid #ccc;
}

.info-table {
  width: 100%;
  margin: 10px 0;
  font-size: 15px;
  border-spacing: 20px 0px;
  border-collapse: separate
}

.info-table td:first-child {
  width: 30%;
  font-weight: bold;
  text-align: right;
}

.info-table td {
  padding: 5px;
}

.e-button-mod {
  width: 98px;
  height: 25px;
  background: none; /* 背景色を無しに設定 */
  border: none; /* 枠線を無しに設定 */
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: blue; /* テキストの色を青に設定 */
  text-align: center;
  margin-top: 15px;
  margin-bottom: 10px;
}

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
  top: 165px;
  left: 20px;
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
