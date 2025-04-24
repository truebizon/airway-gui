<template>
  <!-- 設定済み情報 -->
  <div class="drn_form__header">
    <div class="drn_form__title">航路選択</div>
  </div>
  <!-- 詳細情報 -->
  <div id="content" class="b-singleColumnHasTab">
    <div v-if="selectedButton === 'list'">
      <!-- リストから探す -->
      <section class="b-tabContainer">
        <div class="b-table">
          <div class="c-previewTableContainer">
            <div>
              <div class="c-formItem">
                <label for="aircraftIdField" class="e-fieldLabel">機体リモートID</label>
                <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <input type="text" v-model="inputedAircraftId" id="aircraftIdField" placeholder="機体IDを入力してください" @change="updateBasicInfomation"></input>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
              </div>
              <div class="c-formItemContainer">
                <div class="c-formItem">
                  <label for="fallToleranceRangeField" class="e-fieldLabel">機体種別</label>
                  <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedType" @change="filterLengths">
                          <option value="---">---</option>
                          <option v-for="type in uniqueTypes" :key="type" :value="type">{{ type }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                </div>
                <div class="c-formItem-spacer"></div>
                <div class="c-formItem">
                  <label for="fallToleranceRangeField" class="e-fieldLabel">サイズ(アーム展開時)</label>
                  <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select"  v-model="selectedLength" @change="filterModels">
                    <option value="---">---</option>
                    <option v-for="length in lengthOptions" :key="length" :value="length">{{ length }}</option>
                  </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="c-formItemContainer">
                <div class="c-formItem"></div>
                <div class="c-formItem-spacer"></div>
                <div class="c-formItem">
                  <label for="fallToleranceRangeField" class="e-fieldLabel">モデル </label>
                  <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedModel" @change="changeModel">
                    <option value="---">---</option>
                    <option v-for="model in filteredModels" :key="model" :value="model">{{ model }}</option>
                  </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="c-formItem">
                  <label for="fallToleranceRangeField" class="e-fieldLabel">飛行エリア</label>
                  <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedAreaName" @change="updateBasicInfomation">
                          <option value="---">---</option>
                          <option v-for="item in areaItems.areas" :key="item.name" :value="item.name">{{ item.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                </div>
                <div class="c-formItemContainer">
                  <div class="c-formItem">
                    <label for="fallToleranceRangeField" class="e-fieldLabel">航路</label>
                    <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedAirwayId"  @change="selectAirwayName">
                      <option value="---">---</option>
                      <option v-for="item in filteredRoutes" :key="item.id" :value="item.airwayId">{{ item.airwayName
                        }}</option>
                    </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                  </div>
                  <div class="c-formItem-spacer"></div>
                  <div class="c-formItem">
                    <label for="fallToleranceRangeField" class="e-fieldLabel">飛行目的</label>
                    <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23" style="background-color: lightgray;">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedPurpose" @change="updateBasicInfomation" disabled>
                      <option value="---">---</option>
                      <option v-for="purpose in purposeOptions" :key="purpose" :value="purpose">{{ purpose }}</option>
                    </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                  </div>
                </div>
                <div class="c-formItemContainer">
                  <div class="c-formItem placeLabel">離陸地</div>
                  <div class="c-formItem-spacer"></div>
                  <div class="c-formItem placeLabel">着陸地</div>
                </div>
                <div class="c-formItemContainer">
                  <div class="c-formItem">
                    <label for="fallToleranceRangeField" class="e-fieldLabel"><img
                        src="/assets/css/img/dummyImg/svg_airwaySectionStart.svg" width="15" height="15">航路点</label>
                        <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedDepartureSection" @change="selectDepatureSestion">
                      <option value="---">---</option>
                      <option v-for="sectionName in matchingJunctionNames" :value="sectionName">{{ sectionName }}
                      </option>
                    </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                  </div>
                  <div class="c-formItem-spacer">
                  </div>
                  <div class="c-formItem">
                    <label for="fallToleranceRangeField" class="e-fieldLabel"><img
                        src="/assets/css/img/dummyImg/svg_airwaySectionGoal.svg" width="15" height="15">航路点</label>
                        <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedArrivalSection" @change="selectArrivalSestion">
                      <option value="---">---</option>
                      <option v-for="sectionName in matchingJunctionNames" :value="sectionName">{{ sectionName }}
                      </option>
                    </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                  </div>
                </div>
                <div class="c-formItemContainer">
                  <div class="c-formItem">
                    <label for="fallToleranceRangeField" class="e-fieldLabel"><img
                        src="/assets/css/img/dummyImg/dummy_circle-dot-regular.svg" width="15" height="15">離着陸場</label>
                        <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedDeparturePort" @change="selectDeparturePort">
                      <option value="---">---</option>
                      <option v-for="port in sortedDeparturePorts" :value="port">{{ port }}</option>
                    </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                  </div>
                  <div class="c-formItem-spacer"></div>
                  <div class="c-formItem">
                    <label for="fallToleranceRangeField" class="e-fieldLabel"><img
                        src="/assets/css/img/dummyImg/dummy_circle-dot-regular.svg" width="15" height="15">離着陸場</label>
                        <div
                    class="field-size v-field v-field--appended v-field--center-affix v-field--no-label v-field--variant-outlined v-theme--light v-locale--is-ltr"
                    role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="v-menu-23">
                    <div class="v-field__overlay"></div>
                    <div class="v-field__loader">
                      <div class="v-progress-linear v-theme--light v-locale--is-ltr" role="progressbar"
                        aria-hidden="true" aria-valuemin="0" aria-valuemax="100"
                        style="top: 0px; height: 0px; --v-progress-linear-height: 2px;">
                        <div class="v-progress-linear__background"></div>
                        <div class="v-progress-linear__buffer" style="width: 0%;"></div>
                        <div class="v-progress-linear__indeterminate">
                          <div class="v-progress-linear__indeterminate long"></div>
                          <div class="v-progress-linear__indeterminate short"></div>
                        </div>
                      </div>
                    </div>
                    <div class="v-field__field" data-no-activator="">
                      <div class="v-field__input" data-no-activator="">
                        <select class="full-width-select" v-model="selectedArrivalPort" @change="selectArrivalPort">
                      <option value="---">---</option>
                      <option v-for="port in sortedArrivalPorts" :value="port">{{ port }}</option>
                    </select>
                      </div>
                    </div>
                    <div class="v-field__append-inner">
                      <img src="/assets/css/img/angle-down-solid.svg" width="15" height="15 " style="max-width: none;">
                    </div>
                    <div class="v-field__outline">
                      <div class="v-field__outline__start"></div>
                      <div class="v-field__outline__end"></div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
            <dl class="c-tablePreview">
              <div>
                <dt class="u-invisible">選択済み航路地図画像</dt>
                <div class="e-pageTitle subTitle" style="margin-top: -20px; margin-bottom: 20px;">{{
                  this.selectedAirwayName }}
                </div>
                <dd>
                  <MapComponent v-if="airwayData" :stepNo="stepNo" :airwayId="selectedAirwayId" :key="selectedAirwayId"
                    :airwayData="airwayData" :chartData="chartData" :section="sectionRange"
                    :showCheckBox="true" :showLegend="true" :showMarker="true" 
                    :departurePort = "departurePortDegrees" :arrivalPort = "arrivalPortDegrees" :portData = "portData" 
                    :area="selectedAreaName" :areaInfo="areaItems" @update:isEndIdFirst="handleIsEndIdFirst"/>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import MapComponent from '@/components/map/selectAirwaySectionPortFromList.vue';
import axios from 'axios'; // axiosのインポート
import * as turf from "@turf/turf";

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
      selectedButton: 'list', // 初期状態でリストビューを選択
      selectedAirwayId: '---', 
      selectedAirwayName: '---', 
      selectedSection: null, 
      selectedDepartureSection: '---',
      selectedArrivalSection: '---',
      selectedDeparturePort: '---',
      selectedArrivalPort: '---',
      selectedJunctions: [],
      selectedPurpose: '---',
      selectedType: null,
      inputedAircraftId: null,
      selectedAreaName: '---',
      airwayData: null,
      airwayResData: null,
      chartData: null,
      routes: [],
      filteredRoutes: [],
      matchingJunctionNames: [],
      sortedDeparturePorts:[],
      sortedArrivalPorts:[],
      departurePortDegrees:[],
      arrivalPortDegrees:[],
      droneData: null,
      droneItems: [],
      uniqueTypes: [],
      selectedType: '---',
      selectedLength: '---',
      filteredModels: [],
      selectedModel: '---',
      lengthOptions: ['500mm未満', '500mm以上950mm未満', '950mm以上'],
      falltrangeData: null,

      airway: {
        aircraftId: '',
        airwayId: '',
        purpose: '',
        type: '',
        aircraftInfoId:'',
        aircraftInfo:'',
        airwayName: '',
        section: '',
        departurePort: '',
        arrivalPort: '',
        departurePortId: '',
        arrivalPortId: '',
        junctionList: [],
        departurePortDegrees: [],
        arrivalPortDegrees: [],
        isEndIdFirst: false,
        stepNo: this.stepNo,
      },

      areaItems: [],
      purposeOptions: ['物資運搬', '送電線点検', '河川監視', '山岳監視', 'その他'],
      portData: null,
      operatorData: null,
      isEndIdFirst: false,
    };
  },
  components: {
    MapComponent,
  },
  computed: {
    section() {
      return this.selectedDepartureSection + ',' + this.selectedArrivalSection;
    },
    sectionRange() {
      return this.selectedDepartureSection + ' ~ ' + this.selectedArrivalSection;
    },
  },
  methods: {
    changeModel() {
      // 航路以下の情報はすべてクリアする
      this.airway.airwayName = '---';
      this.airway.section = '---';
      this.airway.departurePort = '---';
      this.airway.arrivalPort = '---';
      this.airway.purpose = '---';
      this.airway.departurePortId = "";
      this.airway.arrivalPortId = "";
      this.airway.junctionList = [];

      this.selectedAirwayId = '---';
      this.selectedAirwayName = '---';
      this.selectedJunctions = [];
      this.selectedPurpose = '---';
      this.selectedDepartureSection = '---';
      this.selectedArrivalSection = '---';
      this.selectedDeparturePort = '---';
      this.selectedArrivalPort = '---';     
      this.airway.aircraftInfo = "",
      this.airway.aircraftInfoId = "",
      // 指定されたモデル
      this.airway.type = this.selectedModel;
      this.airway.aircraftInfo = this.getAircraftInfo(this.selectedModel);
      this.airway.aircraftInfoId = this.getAircraftInfoId(this.selectedModel);

      // モデルから表示する航路を選択する
      if(this.selectedModel !== '---') {
          this.filteredRoutes = this.routes.filter(route => {
            const isAirWayFly = route.type.split(',').map(Number).filter(n => n ===this.airway.aircraftInfoId);
            return isAirWayFly.length > 0 && route.area === this.selectedAreaName; 
        });
      } else {
        this.filteredRoutes = this.routes;
      }

    },
    updateBasicInfomation() {
      this.airway.aircraftId = this.inputedAircraftId;
      this.airway.airwayId = this.selectedAirwayId;
      this.airway.airwayName = this.selectedAirwayName;
      this.airway.section = this.section;
      this.airway.departurePort = this.selectedDeparturePort;
      this.airway.arrivalPort = this.selectedArrivalPort;
      this.airway.departurePortDegrees = this.departurePortDegrees;
      this.airway.arrivalPortDegrees = this.arrivalPortDegrees;
      
      if (this.portData && this.portData.data) {
        this.portData.data.map(port => {
          if (port.dronePortName === this.selectedDeparturePort) {
            this.airway.departurePortId = port.dronePortId;
          }
        });
      } else {
        this.airway.departurePortId = "";
      } 
      if (this.portData && this.portData.data) {
        this.portData.data.map(port => {
          if (port.dronePortName === this.selectedArrivalPort) {
            this.airway.arrivalPortId = port.dronePortId;
          }
        });
      } else {
        this.airway.arrivalPortId = "";
      };

      if(this.selectedAreaName !== '---'){
        this.filteredRoutes = this.routes.filter(route => {
          const isAirWayFly = route.type.split(',').map(Number).filter(n => n ===this.airway.aircraftInfoId);
          return isAirWayFly.length > 0 && route.area === this.selectedAreaName;
        });
      } else {
        this.filteredRoutes = []
      }
      
      this.airway.junctionList = this.selectedJunctions;
      this.airway.isEndIdFirst = this.isEndIdFirst;
      this.$emit('update:airway', this.airway);
      console.log(this.airway);
    },
    updateChartData() {
      const findAirway = this.airwayResData.airway.airways.find(airway => airway.airwayId === this.selectedAirwayId);
      const selectedAirway = {airway:{airways:[findAirway]}}
    if (selectedAirway) {
      console.log(selectedAirway);
      this.chartData = useAirwayConvertConnectionOrder(selectedAirway);
      console.log("chartData",this.chartData);
    } else {
      console.error(`error: selected airway not found.`);
      this.chartData = {};
    }
    },
    selectAirwayName() {
      this.selectedDepartureSection = '---';
      this.selectedArrivalSection = '---';
      this.selectedDeparturePort = '---';
      this.selectedArrivalPort = '---';
      this.sortedDeparturePorts = [];
      this.sortedArrivalPorts = [];
      this.selectedPurpose = '---';

      const matchingJunctions = this.airwayData.airway.airways
        .filter(airway => airway.airwayId === this.selectedAirwayId)
        .flatMap(airway => airway.airwayJunctions)
        .map(junction => junction.airwayJunctionName);
      // 変数に格納
      this.matchingJunctionNames = matchingJunctions;

      const matchingAirwayId = this.airwayData.airway.airways
        .filter(airway => airway.airwayId === this.selectedAirwayId)
      this.selectedAirwayName = matchingAirwayId[0].airwayName;

      this.selectedJunctions = matchingJunctions.join(',');
      this.airway.purpose = matchingAirwayId[0].flightPurpose;
      this.selectedPurpose = matchingAirwayId[0].flightPurpose;
      
      this.updateBasicInfomation();
      this.updateChartData();
    },

    sortPortName(junctionName) {

      const selectedCoordinates = this.airwayData.airway.airways
        .filter(airway => 
          airway.airwayName === this.selectedAirwayName && 
          airway.airwayJunctions.some(junction => 
           junction.airwayJunctionName === junctionName
          )
        )
        .map(airway => 
          airway.airwayJunctions
            .filter(junction => 
             junction.airwayJunctionName === junctionName
            )
            .map(junction => 
             junction.airways[0].airway.geometry.coordinates
            )
        )
        .flat();

      console.log("selectedCoordinates",selectedCoordinates);

      // Proxyオブジェクトを通常の配列に変換
      const rawCoordinates = JSON.parse(JSON.stringify(selectedCoordinates));

      // 必要な座標を計算
      const sectionCoordinates = [
        (rawCoordinates[0][0][1] + rawCoordinates[0][2][1]) / 2,
        (rawCoordinates[0][0][0] + rawCoordinates[0][2][0]) / 2
      ];
      console.log("sectionCoordinates", sectionCoordinates);


      //portDataからPortを作成      
      const Ports = this.portData.data.map(port => {
        const portDegrees = [port.lat, port.lon];
        const dist = turf.distance(portDegrees, sectionCoordinates) * 1000;
        return {
          dronePortName: port.dronePortName,
          distance: dist
        };
      });
      // 距離に基づいてソートし、dronePortNameだけを抽出
      const sortedPorts = Ports
        .sort((a, b) => a.distance - b.distance)
        .map(item => item.dronePortName);
      return sortedPorts;
    },

    selectDepatureSestion() {
      this.selectedDeparturePort = '---';

      this.sortedDeparturePorts = this.sortPortName(this.selectedDepartureSection);
      this.updateBasicInfomation();
    },


    selectArrivalSestion() {
      this.selectedArrivalPort = '---';

      this.sortedArrivalPorts = this.sortPortName(this.selectedArrivalSection);
      this.updateBasicInfomation();
    },

    selectDeparturePort(){
    this.updateBasicInfomation();
    const portDegrees = this.portData.data.find(port => port.dronePortName === this.selectedDeparturePort);
    this.departurePortDegrees = [portDegrees.lat, portDegrees.lon];
    },

    selectArrivalPort(){
    this.updateBasicInfomation();
    const portDegrees = this.portData.data.find(port => port.dronePortName === this.selectedArrivalPort);
    this.arrivalPortDegrees = [portDegrees.lat, portDegrees.lon];
    },
    
    getUniqueTypes() {
      const types = this.droneItems.aircraft.map(item => item.type);
      this.uniqueTypes = [...new Set(types)]; // 重複を排除
      this.updateBasicInfomation()
    },
    filterLengths() {
      this.airway.aircraftInfo = "",
      this.airway.aircraftInfoId = "",
      this.selectedLength = '---';
      this.selectedModel = '---';
      this.filterModels();
      this.updateBasicInfomation()
    },
    filterModels() {
      this.airway.aircraftInfo = "",
      this.airway.aircraftInfoId = "",
      this.selectedModel = '---';
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
        } else if (this.selectedLength === '---') {
          this.filteredModels = []; // 選択肢がない場合は空の配列を設定
          return;
        }
        this.filteredModels = this.droneItems.aircraft
          .filter(item => item.type === this.selectedType && item.length >= minLength && item.length < maxLength)
          .map(item => item.name);
      } else {
        console.error('droneItems.aircraft is undefined');
      }
      this.updateBasicInfomation()
    },
    getAircraftInfoId(selectedModel) {
      const droneData = this.droneData.aircraft;
      const result = droneData.find(aircraft => aircraft.name === selectedModel);
      if (result) {
        return result.aircraft_info_id;
      } else {
        return null;
      }
    },
    getAircraftInfo(selectedModel) {
      const droneData = this.droneData.aircraft;
      const result = droneData.find(aircraft => aircraft.name === selectedModel);
      if (result) {
        const { maker, model_number: modelNumber, name, type, length } = result;
        return { maker, modelNumber, name, type, length };
      } else {
      return null;
      }
    },
    handleIsEndIdFirst(value) {
      this.isEndIdFirst = value;
      this.updateBasicInfomation();
    },
  },
  created() {
    this.filteredRoutes = this.routes;
  },
  async mounted() {
    axios.get('/api/getAreaJsonData')
      .then(response => {
        // JSONデータの取得が成功した場合、routesに代入
        const areaItems = response.data;
        this.areaItems = areaItems;
        this.areaData = response.data;
      })
      .catch(error => {
        console.error('JSONの読み込みに失敗しました:', error);
      });
    
    // 事業者一覧情報を取得
    try {
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
    } catch (error) {
      console.error('事業者情報一覧の取得に失敗しました(operatorUrl):', error);
    }

    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const rangeUrl = `${airwayApiBaseUrl}/fall-tolerance-range`;
    const rangeRes = await axios_get(rangeUrl, {businessNumber: useRuntimeConfig().public.businessNumber}, {});
    if (rangeRes.status != 200) {
      console.error(`error: get fallTolerance info {status: ${rangeRes.status}}.`);
      this.falltrangeData = {};
      return;
    }

    this.falltrangeData = rangeRes.data;

    // 全ての航路情報を取得
    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, { all: 'true' }, {});
    console.log(airwayRes);
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      this.airwayData = {};
      return;
    }
    this.airwayResData = airwayRes.data;
    this.airwayData = useAirwayConvertConnectionOrder(airwayRes.data);
    console.log("airwayData", this.airwayData);
    const airwayAdministratorId = this.airwayData.airway.airwayAdministratorId;
    // 非同期処理を待機して、すべての結果を取得
    this.routes = this.airwayData.airway.airways.map((item, index) => ({
      id: index,
      airwayId: item.airwayId,
      airwayName: item.airwayName || '名称未設定',
      section: item.airwayJunctions.length > 1
        ? `${item.airwayJunctions[0].name}~${item.airwayJunctions[item.airwayJunctions.length - 1].name}`
        : '区間データ不足',
      details: '詳細',
      junctionList: item.airwayJunctions.flatMap(junction => junction.name),
      purpose: item.flightPurpose || '目的未設定',
      type: item.droneList.join(),
      area: getareaName(this.falltrangeData, item.airwayId),  // 非同期処理
      companyName: getcompanyName(this.operatorData, airwayAdministratorId),
    }));
    this.filteredRoutes = this.routes;

    const droneUrl = `${airwayApiBaseUrl}/aircraft`;
    const droneRes = await axios_get(droneUrl, {}, {});
    console.log("droneRes",droneRes);
    if (droneRes.status != 200) {
      console.error(`error: get drone info {status: ${droneRes.status}}.`);
      this.rangeData = null;
      return;
    }
    this.droneData = droneRes.data;
    this.droneItems = droneRes.data;
    this.getUniqueTypes();

    const droneApiBaseUrl = useRuntimeConfig().public.droneApiBaseUrl;
    const portUrl = `${droneApiBaseUrl}/droneport/info/list`;
    const portRes = await axios_get(portUrl, {
      activeStatus: '1,2',
      portType: '1,2'
    }, {});
    console.log("portRes",portRes);
    if (portRes.status != 200) {
      console.error(`error: get port info {status: ${portRes.status}}.`);
      this.portData = {};
      return;
    }
    this.portData = portRes.data;
    console.log("portData",this.portData);

  },
};
</script>

<style>
.field-size {
  height: 40px !important;
  width: 240px;
}

.v-field__input {
  min-height: 40px;
  height: 40px;
}

.c-formItem-spacer {
  width: 30px;
}

.selected {
  background-color: black;
  color: white;
}

#map {
  height: 100% !important;
}

.map-title-airway {
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-16) / var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
}

/* モーダルウィンドウのスタイル */
.popup {
  position: absolute;
  top: 180px;
  /* 画像ボタンの位置に合わせて調整 */
  left: 20px;
  /* 画像ボタンの位置に合わせて調整 */
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
  list-style: none;
  /* デフォルトのリストスタイルを削除 */
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

.e-textField-date-option {
  width: 139px;
  height: 25px !important;
  border: 1px solid var(--line_-999999);
}

.e-textField-select {
  width: 250px;
  height: 25px !important;
  border: 1px solid var(--line_-999999);
  padding-top: 5px;
  padding-bottom: 6px;
  padding-left: 10px;
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
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

.check-porpose {
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
  padding-right: 10px;
}

.v-label.v-label--clickable.font-weight-black {
  font-size: 14px !important;
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
  accent-color: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
  /* 塗りつぶしの色を変更 */
  border: 1px solid var(--line_-999999);
  width: 16px;
  height: 16px;
  border-radius: 0;
}

/* チェックマークの色を変更 */
input[type="checkbox"]:checked::before {
  accent-color: var(--unnamed-color-ffffff) 0% 0% no-repeat padding-box;
  /* 塗りつぶしの色を変更 */
  color: 2px solid var(--txt_-333333);
  /* チェックマークの色を変更 */
}

.c-tableControl-setting {
  display: grid;
  grid-template-columns: 40% 60%;
  column-gap: var(--margin-unit);
  padding: 0 var(--margin-unit2);
  align-content: start;
  align-items: stretch;
}

.container {
  padding: 1px;
}

.table-container {
  width: 100%;
  height: 473px;
}

.button-group {
  margin-bottom: 0.5rem;
  display: flex;
}

.list-group {
  margin-left: auto;
}

.button {
  border-bottom: 1px solid #000000;
  border-right: 1px solid #000000;
  background-color: #FFFFFF;
  color: #000000;
  cursor: pointer;
  padding: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.button-filter {
  border: 1px solid #000000;
  background-color: #FFFFFF;
  color: #000000;
  cursor: pointer;
  padding-left: 3rem;
  padding-right: 3rem;
}

.button-list {
  border: 1px solid #000000;
  background-color: #FFFFFF;
  color: #000000;
  cursor: pointer;
  padding-left: 3rem;
  padding-right: 3rem;
  right: 0;
}

h1 {
  display: inline;
  padding-right: 1rem;
  font-size: 1.3rem;
}

.header {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

tr.even-row td,
tr.odd-row td {
  border-top: 1px solid;
  padding: 0.5rem;
  text-align: left;
  vertical-align: middle;
}

.v-table__wrapper table thead tr th {
  position: relative;
  padding: 0.3rem;
  text-align: left;
  background-color: #FFFFFF;
  border-bottom: 1px solid;
  line-height: 1.5;
  color: #000;
  /* ヘッダー文字色を黒に設定 */
  vertical-align: middle;
}

.v-table--density-default {
  --v-table-header-height: 35px !important;
  --v-table-row-height: 40px !important;
}

.v-data-table-footer__items-per-page {
  display: none !important;
}

th:not(:first-child) {
  position: relative;

  &:before {
    content: "";
    width: 1px;
    height: 1rem;
    display: block;
    background-color: #000000;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    margin: auto;
  }
}

.selected {
  background-color: black !important;
  color: white !important;
}

.c-previewTableContainer {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 40% 60%;
  grid-template-rows: 100%;
  column-gap: var(--margin-unit);

  .c-tableContainer {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  .c-tablePreview {
    grid-row: 1 / 2;
    grid-column: 2 / 3;

    &>div {
      width: 100%;
      height: 100%;
    }

    & dd {
      width: 100%;
      height: 100%;
    }
  }
}

#dummyImageRoute {
  display: block;
  width: 100%;
  height: 100%;
  background-image: url("~/assets/css/img/dummyImg/reservedFlightRoute.png");
  background-repeat: no-repeat;
  background-size: 100%;
}

.even-row {
  background-color: #f9f9f9;
}

.odd-row {
  background-color: #ffffff;
}

.custom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.v-data-table-footer__items-per-page {
  display: none !important;
}

td.change-black a {
  color: black;
  text-decoration: none;
}

tr.selected td.change-black a {
  color: white;
}

.v-table.v-table--has-top.v-table--has-bottom.v-theme--light.v-table--density-default.v-data-table.elevation-1 {
  border: 1px solid #999999 !important;
  height: calc(100dvh - 300px);
}

.c-formItemContainer {
  display: flex;
}

.placeLabel {
  font-size: 16px;
  font-weight: bold;
}

#aircraftIdField {
  border: 0!important;
  width: 180px;
}

/* クリック時のアウトラインを消す */
input:focus {
    outline: none;
}

.full-width-select {
  width: calc(100% + 18px);
  margin-right: -18px; /* 画像の幅分マイナスのマージンを設定 */
}

</style>
