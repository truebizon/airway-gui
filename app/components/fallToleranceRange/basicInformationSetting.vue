<template>
  <div class="drn_form__header">
    <div class="drn_form__title">名称・エリア選択</div>
  </div>
  <!-- /.drn_form__header -->

  <!-- 詳細情報 -->
  <v-card-text class="drn_content">
    <div class="drn_content__body">
      <v-sheet class="drn_content__data">
        <div class="drn_form">
          <div class="drn_form__body">
            <label class="drn_form__label">名称</label>
            <v-text-field
              type="input"
              density="compact"
              variant="outlined"
              placeholder=""
              model-value=""
              class="drn_form__input"
              v-model="selectedName"
              name="rangeName"
              id="rangeNameField"
              maxlength="200"
              @change="updatePlace"
            ></v-text-field>
            <label class="drn_form__label">エリア</label>
            <v-select
              density="compact"
              variant="outlined"
              :items="filteredRouteItems"
              menu-icon="fa fa-sharp fa-regular fa-angle-down"
              model-value="selectedArea"
              class="drn_form__select"
              v-model="selectedAreas"
              name="areaName"
              id="areaNameField"
              @update:modelValue="updatePlace"
            ></v-select>
          </div>
          <!-- /.drn_form__body -->
        </div>
        <!-- /.drn_form -->
      </v-sheet>
      <v-sheet class="drn_content__map">
        <MapComponent :stepNo="stepNo" :area="selectedArea" :areaInfo="areaInfo"/>
      </v-sheet>
    </div>
    <!-- .drn_content__body -->
  </v-card-text>
  <!--/.drn_content -->
</template>

<script>
import axios from 'axios';
import MapComponent from "~/components/map/showArea.vue";

export default {
  components: {
    MapComponent,
  },
  props: {
    stepNo: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      rangeName: this.selectedName,
      areaName: this.selectedArea,
      selectedName: '', 
      selectedArea: '',
      selectedAreas: [], // v-select 選択結果保存用
      selectedPurpose: null,
      areaInfo:{},
      place: {
          rangeName: this.selectedName,
          areaName: this.selectedArea,
          areaInfo: this.areaInfo
      },
      routes: [],
      filteredRoutes: [],
      filteredRouteItems: [], // v-select 表示選択肢用
      stepNo: this.stepNo,
    };
  },
  methods: {
    updatePlace() {
      if (typeof(this.selectedAreas) === 'string') {
        this.selectedArea = this.selectedAreas;
      }
      this.place.rangeName = this.selectedName
      this.place.areaName = this.selectedArea
      this.place.areaInfo = this.areaInfo
      this.$emit('update:place', this.place);
    },
  },
  mounted() {
    // JSONファイルを読み込む
    axios.get('/api/getAreaJsonData')
      .then(response => {
      // JSONデータの取得が成功した場合、routesに代入
      console.log(response.data)
      this.areaInfo = response.data
      this.routes = response.data.areas.map((area) => ({
        name: area.name,
      }));
      this.filteredRoutes = this.routes
      for (let i = 0; i < this.filteredRoutes.length; ++i) {
        const itemValue = this.filteredRoutes[i].name;
        this.filteredRouteItems.push({
          title: itemValue,
          value: itemValue
        });
      }
      this.selectedArea = this.filteredRoutes[0].name
      this.selectedAreas = this.selectedArea
      this.updatePlace()
    })
    .catch(error => {
      console.error('JSONの読み込みに失敗しました:', error);
    });
  },
};
</script>