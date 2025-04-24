<template>
  <!-- モーダルウィンドウ -->
  <div v-if="showStakeholdersPopup" class="popup">
    <!-- オプション検索の内容 -->
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
    <!-- /.item-center -->
    <div class="item-center">
      <input type="button" class="e-button-search" value="登録" @click="stakeholdersRegister" />
    </div>
  </div>
  <!-- /.popup -->

  <!-- 詳細情報 -->
  <v-card-text class="drn_content">
    <div class="drn_content__body">

      <v-sheet class="drn_content__data">
        <div class="drn_form">

          <!-- 関係者登録 -->
          <div class="drn_form__header">
            <div class="drn_form__title">
              基本情報選択
            </div>
            <!-- /.drn_form__title -->
            <v-btn
              variant="outlined"
              rounded="pill"
              class="drn_form__btn drn_form__btn--member_add item-right"
              v-if = "role == 1"
              @click="togglePopup"
            >{{ stakeholdersBtnLabel }}</v-btn>
          </div>
          <!-- /.drn_form__header -->

          <div class="drn_form__body">

              <label class="drn_form__label">航路名</label>
              <v-text-field
                type="input"
                density="compact"
                variant="outlined"
                placeholder="航路名を入力"
                class="drn_form__input"
                v-model="routeName"
                id="routeNameField"
                maxlength="200"
                @change="updateBasicInfomation"
              ></v-text-field>

              <label class="drn_form__label">飛行目的</label>
              <v-select
                density="compact"
                variant="outlined"
                placeholder="------------------"
                :items="purposeItems"
                menu-icon="fa fa-sharp fa-regular fa-angle-down"
                class="drn_form__select"
                v-model="selectedPurpose"
                @update:modelValue="updateBasicInfomation"
              ></v-select>

              <label class="drn_form__label">エリア</label>
              <v-select
                density="compact"
                variant="outlined"
                placeholder="------------------"
                :items="areaNameItems"
                menu-icon="fa fa-sharp fa-regular fa-angle-down"
                class="drn_form__select"
                v-model="areaName"
                @update:modelValue="updateBasicInfomation"
              ></v-select>

              <label class="drn_form__label">最大落下許容範囲</label>
              <v-select
                density="compact"
                variant="outlined"
                placeholder="------------------"
                :items="fallToleranceRangeItems"
                menu-icon="fa fa-sharp fa-regular fa-angle-down"
                class="drn_form__select"
                v-model="fallToleranceRange"
                @update:modelValue="updateBasicInfomation"
              ></v-select>

              <label class="drn_form__label">機体種別</label>
              <v-select
                density="compact"
                variant="outlined"
                placeholder="------------------"
                :items="uniqueTypeItems"
                menu-icon="fa fa-sharp fa-regular fa-angle-down"
                class="drn_form__select"
                v-model="selectedType"
                @update:modelValue="filterLengths"
              ></v-select>

              <label class="drn_form__label">サイズ(アーム展開時)</label>
              <v-select
                density="compact"
                variant="outlined"
                placeholder="------------------"
                :items="lengthOptionItems"
                menu-icon="fa fa-sharp fa-regular fa-angle-down"
                class="drn_form__select"
                v-model="selectedLength"
                @update:modelValue="filterModels"
              ></v-select>

              <label class="drn_form__label">モデル </label>
              <v-select
                density="compact"
                variant="outlined"
                placeholder="------------------"
                :items="filteredModelItems"
                menu-icon="fa fa-sharp fa-regular fa-angle-down"
                class="drn_form__select"
                v-model="selectedModel"
                @update:modelValue="updateBasicInfomation"
              ></v-select>

          </div>
          <!-- .drn_form__body -->
        </div>
        <!-- .drn_form -->
      </v-sheet>
      <!-- .drn_content__data -->

    <!-- .basicInfomationSelect -->

    <v-sheet class="drn_content__map">
      <MapComponent
        v-if="rangeData && areaData && droneData"
        :stepNo="stepNo"
        :area="areaName"
        :areaInfo="areaNames"
        :rangeId="fallToleranceRangeId"
        :rangeInfo="fallToleranceRanges"
      />
    </v-sheet>
    <!-- .drn_content__map -->

    </div>
    <!-- .drn_content__body -->
  <!-- .b-twoColumn -->
  </v-card-text>
  <!-- .drn_content -->
</template>

<script>
import MapComponent from "~/components/map/showFallToleranceRangeGrayScale.vue";
import axios from 'axios';

export default {
  components: {
    MapComponent
  },
  props: {
    stepNo: {
      type: String,
      required: true,
    },
  },
  data() {
    return {

      // 航路名
      routeName: null,

      // 飛行目的
      selectedPurpose: null,
      purposeItems: [
        {title: '物資運搬',   value: '物資運搬'},
        {title: '送電線点検', value: '送電線点検'},
        {title: '河川監視',   value: '河川監視'},
        {title: '山岳監視',   value: '山岳監視'},
        {title: 'その他',     value: 'その他'},
      ],

      // エリア
      areaNames: [], // input from JSON
      areaName: null,
      areaNameItems: [], // v-select 選択肢用

      // 最大落下許容範囲
      fallToleranceRanges: [], // input from API(${airwayApiBaseUrl}/fall-tolerance-range)
      fallToleranceRange: '------------------',
      fallToleranceRangeItems: [], // v-select 選択肢用

      // 機体種別
      uniqueTypes: [], // input from API(${airwayApiBaseUrl}/aircraft)
      selectedType: '------------------',
      uniqueTypeItems: [], // v-select 選択肢用

      // サイズ(アーム展開時)
      selectedLength: '------------------',
      lengthOptionItems: [
        {title: '500mm未満',        value: '500mm未満'},
        {title: '500mm以上950未満', value: '500mm以上950mm未満'},
        {title: '950mm以上',        value: '950mm以上'},
      ], // v-select 選択肢用

      // モデル
      filteredModels: [], // input from API(${airwayApiBaseUrl}/aircraft)
      selectedModel: '------------------',
      filteredModelItems: [], // v-select 選択肢用

      // MapComponent
      rangeData: null,
      areaData: null,
      droneData: null,
      fallToleranceRangeId: null,
      droneItems: [],

      basicInfomation: {
        purpose: '',
        type: '',
        routeName: '',
        fallToleranceRange: '',
        fallToleranceRangeId: '',
        drone: '',
        stakeholders: [],
        stakeholdersSelected: [],
      },

      showStakeholdersPopup: false,
      itemsPerPage: 10,
      stakeholders: [],
      stakeholdersSelected: [],
      stakeholdersAllSelected: false,
      stakeholdersNum: 0,
      cookie_role: null,
      role: null,
      stepNo: this.stepNo,
    };
  },
  computed: {
    stakeholdersBtnLabel() {
      return `関係者登録(${this.stakeholdersNum})`;
    }
  },
  watch: {
    fallToleranceRange(newVal) {
      const selectedItem = this.fallToleranceRanges.fallToleranceRanges.find(item => item.name === newVal);
      this.fallToleranceRangeId = selectedItem ? selectedItem.fallToleranceRangeId : null;
      this.updateBasicInfomation()
    }
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
    stakeholdersRegister() {
      const selectedData = this.stakeholders.filter(item =>
        this.stakeholdersSelected.includes(item.operatorId)
      );

      // 選択されたアイテムの数を取得
      this.stakeholdersNum = selectedData.length;
      this.updateBasicInfomation()

      // ポップアップを非表示にする
      this.showStakeholdersPopup = false;
    },
    getUniqueTypes() {
      const types = this.droneItems.aircraft.map(item => item.type);
      this.uniqueTypes = [...new Set(types)]; // 重複を排除
      this.uniqueTypeItems = [];
      for (let i = 0; i < this.uniqueTypes.length; ++i) {
        const itemValue = this.uniqueTypes[i];
        this.uniqueTypeItems.push({
          title: itemValue,
          value: itemValue
        });
      }
      this.updateBasicInfomation()
    },
    filterLengths() {
      this.selectedLength = '------------------';
      this.selectedModel = '------------------';
      this.filterModels();
      this.updateBasicInfomation();
    },
    filterModels() {
      this.selectedModel = '------------------';
      if (this.droneItems && this.droneItems.aircraft) {
        let minLength = 0;
        let maxLength = Infinity;

        if (this.selectedLength === '500mm未満') {
          maxLength = 500;
        } else if (this.selectedLength === '500mm以上950mm未満') {
          minLength = 500;
          maxLength = 950;
        } else if (this.selectedLength === '950mm以上') {
          minLength = 950;
        } else if (this.selectedLength === '------------------') {
          this.filteredModels = []; // 選択肢がない場合は空の配列を設定
          return;
        }
      this.filteredModels = this.droneItems.aircraft
        .filter(item => item.type === this.selectedType && item.length >= minLength && item.length < maxLength)
        .map(item => item.name);
      } else {
        console.error('droneItems.aircraft is undefined');
      }
      this.filteredModelItems = [];
      if (this.filteredModels) {
        for (let i = 0; i < this.filteredModels.length; ++i) {
          const itemValue = this.filteredModels[i];
          this.filteredModelItems.push({
            title: itemValue,
            value: itemValue
          });
        }
      }

      this.updateBasicInfomation()
    },
    updateBasicInfomation() {
      const drone = this.droneItems.aircraft.find(item => item.name === this.selectedModel);

      this.basicInfomation.purpose = this.selectedPurpose
      this.basicInfomation.type = [this.selectedModel]
      this.basicInfomation.routeName = this.routeName
      this.basicInfomation.fallToleranceRange = this.fallToleranceRange
      this.basicInfomation.fallToleranceRangeId = this.fallToleranceRangeId
      this.basicInfomation.drone = JSON.stringify(drone)
      this.basicInfomation.stakeholders = this.stakeholders
      this.basicInfomation.stakeholdersSelected = this.stakeholdersSelected
      this.$emit('update:basicInfomation', this.basicInfomation);
    },
    async rolecheck() {
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
    const operatorRes = await axios_get(operatorUrl, {}, operatorHeaders);
    console.log(operatorRes);
    if (operatorRes.status != 200) {
      console.error(`error: get operator info {status: ${operatorRes.status}}.`);
      this.response = null;
      return;
    }
    this.response = operatorRes.data;

    const roleMap = {
      "1": "航路運営事業者",
      "2": "運航事業者",
      "3": "関係者"
    };
    if (this.response) {
      this.stakeholders = this.response.operatorList.map(item => ({
        operatorId: item.operatorId, 
        notificationType: item.notificationType,
        operatorName: item.operatorName,
        roleList: item.roleList.map(item => roleMap[item]).join(", "),
        notificationTargetList: item.notificationTargetList,
        linkAirwayList: item.linkAirwayList, 
      }));
    }

    axios.get('/api/getAreaJsonData')
    .then(response => {
      // JSONデータの取得が成功した場合、routesに代入
      const areaNames = response.data;
      this.areaNames = areaNames;
      this.areaData = response.data;

      this.areaNameItems = [];
      if (this.areaNames && this.areaNames.areas) {
        for (let i = 0; i < this.areaNames.areas.length; ++i) {
          const itemValue = this.areaNames.areas[i].name;
          this.areaNameItems.push({
            title: itemValue,
            value: itemValue
          });
        }
      }

    })
    .catch(error => {
      console.error('JSONの読み込みに失敗しました:', error);
    });

    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const rangeUrl = `${airwayApiBaseUrl}/fall-tolerance-range`;
    const rangeRes = await axios_get(rangeUrl, {businessNumber: useRuntimeConfig().public.businessNumber}, {});
    console.log(rangeRes);
    if (rangeRes.status != 200) {
      console.error(`error: get fall tolerance range info {status: ${rangeRes.status}}.`);
      this.rangeData = null;
      return;
    }
    this.rangeData = rangeRes.data;
    this.fallToleranceRanges = rangeRes.data;
    this.fallToleranceRangeItems = [];
    if (this.fallToleranceRanges && this.fallToleranceRanges.fallToleranceRanges) {
      for (let i = 0; i < this.fallToleranceRanges.fallToleranceRanges.length; ++i) {
        const itemValue = this.fallToleranceRanges.fallToleranceRanges[i].name;
        this.fallToleranceRangeItems.push({
          title: itemValue,
          value: itemValue
        });
      }
    }

    const droneUrl = `${airwayApiBaseUrl}/aircraft`;
    const droneRes = await axios_get(droneUrl, {}, {});
    console.log(droneRes);
    if (droneRes.status != 200) {
      console.error(`error: get drone info {status: ${droneRes.status}}.`);
      this.rangeData = null;
      return;
    }
    this.droneData = droneRes.data;
    this.droneItems = droneRes.data;
    this.getUniqueTypes();

    await this.rolecheck();
  },
};

</script>

<style>
.item-right {
  display: flex;
  margin-left: 50%; 
}

.e-button-search {
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
