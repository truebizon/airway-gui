<template>
  <div id="leafletMap" style="height: 96.5vh; position: relative;"></div>
  <div v-if="showPopup" id="customPopup" class="custom-popup">
    <div class="popup-header">
      <span></span>
      <button class="close-button" @click="closePopup">×</button>
    </div>
    <table class="info-table">
      <tr>
        <td>航路番号</td>
        <td>{{ PopupContent.airway_id }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>航路</td>
        <td>{{ PopupContent.airway_name }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>区間</td>
        <td>{{ PopupContent.airway_section }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>総距離</td>
        <td>{{ PopupContent.airway_distance }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>飛行目的</td>
        <td>{{ PopupContent.airway_porpose }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <div class="popup-header">
      <span></span>
    </div>
    <div id="content" class="b-twoColumn">
      <div class="c-landmarkNamingForm">
        <div class="c-formItem">
          <ul class="c-landmarkFormList">
            <li v-for="(item, index) in combinedList()" :key="index" :class="item.type">
              <div class="e-dottedLine"></div>
              <div class="e-textField landmarkNamingField">{{ item.name }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <table class="info-table">
      <tr>
        <td>運航事業者</td>
        <td>{{ PopupContent.airway_operator }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>航路策定</td>
        <td>{{ PopupContent.airway_date }}</td>
      </tr>
    </table>
    <div class="spacer"></div>
  </div>
  <div v-if="showLocation" id="customPopup" class="custom-popup">
    <div class="popup-header">
      <span></span>
      <button class="close-button" @click="closePopup">×</button>
    </div>
    <table class="info-table">
      <tr>
        <td>予約番号</td>
        <td>{{ LocationData.reservation_id }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>状態</td>
        <td  v-if="LocationData.operational_status_flg" style="color: crimson;">{{ LocationData.operational_status_display }}</td>
        <td  v-else>{{ LocationData.operational_status_display }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <dev v-if="LocationData.operational_status_flg" >
      <table class="info-table">
        <tr>
          <td>発生地点</td>
          <td>{{ LocationData.airway_section_name }}</td>
        </tr>
      </table>
    </dev>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>航路</td>
        <td>{{ PopupContent.airway_name }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>航路区画</td>
        <td>{{ PopupContent.airway_section }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <div class="popup-header">
      <span></span>
    </div>
    <div id="content" class="b-twoColumn">
      <div class="c-landmarkNamingForm">
        <div class="c-formItem">
          <ul class="c-landmarkFormList">
            <li v-for="(item, index) in combinedList()" :key="index" :class="item.type">
              <div class="e-dottedLine"></div>
              <div class="e-textField landmarkNamingField">
                <div class="landmarkText" v-if="item.name == LocationData.airway_section_name && LocationData.operational_status_flg" style="color: crimson; border-color: crimson;">{{ item.passAt }} {{ item.name }}</div>
                <div class="landmarkText" v-else>{{ item.passAt }} {{ item.name }} </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <table class="info-table">
      <tr>
        <td>飛行時間</td>
        <td>{{ LocationData.airway_fligt_time }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>飛行距離</td>
        <td>{{ LocationData.airway_fligt_distance }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>総距離</td>
        <td>{{ PopupContent.airway_distance }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>飛行目的</td>
        <td>{{ PopupContent.airway_porpose }}</td>
      </tr>
    </table>
    <hr class="custom-hr" />
    <table class="info-table">
      <tr>
        <td>申請・更新日</td>
        <td>{{ LocationData.reservation_date }}</td>
      </tr>
    </table>
    <div class="spacer"></div>
  </div>
  <div class="airway-status-link">
    <v-btn-toggle
      v-model="viewType"
      mandatory
      variant="flat"
      rounded="pill"
      border
      density="comfortable"
      class="drn_toggle drn_toggle--viewtype"
    >
      <a href="/airwayStatus">
        <v-btn
          value="listview"
          class="drn_toggle__btn"
        >
          <img class="drn_toggle__map_btn" src="/assets/css/img/main/list-solid.svg" width="15" height="15">
        </v-btn>
      </a>
      <v-btn
        value="mapview"
        class="drn_toggle__btn"
      >
        <img src="/assets/css/img/main/map-regular.svg" width="20" height="20">
      </v-btn>
    </v-btn-toggle>
  </div>
  <div class="area-control-middle-right">
    <MapProhibitedAreaControl :map="map" :map_moveend="map_moveend"></MapProhibitedAreaControl>
    <MapLayerControl :map="map" :map_moveend="map_moveend" @Weather_Changeed="handleWeatherChanged" @MapLayerControl_Mounted="handleMapLayerControlMounted"></MapLayerControl>
  </div>
  <div class="area-control-bottom-left">
    <MapLegend></MapLegend>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import { onMounted, ref } from 'vue';
import iconUrl from '../assets/css/img/dummyImg/dummy_legendIcon_waypoint.svg';
import porticonUrl from '../assets/css/img/dummyImg/dummy_circle-dot-regular.svg';
import MapLegend from '../mapLegend.vue';
import MapLayerControl from '../mapLayerControl.vue';
import MapProhibitedAreaControl from '../mapProhibitedAreaControl.vue';

export default {
  props: {
    role: {
      type: Number,
      required: true,
    },
    cookie_role: {
      type: Object,
      required: true,
    }
  },
  components: {
    MapLegend,
    MapLayerControl,
    MapProhibitedAreaControl,
  },
  data() {
    return {
      viewType: 'mapview'
    }
  },
  setup(props) {
    const operationalStatus = {
      BEFORE: "RouteApproach",
      NORMAL: "NormalOperation",
      DEVIATION: "RouteDeviation"
    }
    // let L // Leafletインスタンス
    const map = ref(null);
    const showPopup = ref(false);
    const showLocation = ref(false);
    const map_moveend = ref(false);
    const locationList = ref([]);
    let timeout = ref(null);
    const MapLayerControlMounted = ref(true);

    const PopupContent = ref({
      airway_id: "Not found",
      airway_name: "Not found",
      airway_section: "Not found",
      airway_distance: "Not found",
      airway_altitude: "Not found",
      airway_operator: "Not found",
      airway_date: "Not found",
    });

    const LocationData = ref({
      reservation_id: "Not found",
      operational_status_flg: true,
      operational_status_display: "Not found",
      operational_status: "",
      airway_section_name: "Not found",
      airway_fligt_time: "Not found",
      airway_fligt_distance: "Not found",
      reservation_date: "Not found",
      latlng: ref([]),
      timestamp: "",
    });

    const closePopup = () => {
      showPopup.value = false;
      showLocation.value = false;
    };

    const zoomInit = 16;
    const centerInit = [useRuntimeConfig().public.centerInitLat, useRuntimeConfig().public.centerInitLon];
    const areas = ref([]);
    const airwayJunctions = ref([]);
    let rangeData = null;
    let airwayData = null;
    let reservationData = null;
    let portData = null;
    let operatorData = null;
    let chartData = null;

    const setPopupContent = async (id) => {
      // 画定番号
      PopupContent.value.airway_id = id;
      PopupContent.value.airway_name = useAirwayGetAirwayNameFromAirwayId(airwayData, id);
      PopupContent.value.airway_section = useAirwayGetCorridorPointRangeFromAirwayIdFullWidth(airwayData, id);
      PopupContent.value.airway_distance = useAirwayGetFullDistanceFromAirwayId(airwayData, id) + 'm';
      PopupContent.value.airway_date = useDateString2(useAirwayGetAirwayApplicationDateFromAirwayId(airwayData, id));
      PopupContent.value.airway_porpose = useAirwayGetPurposeFromAirwayId(airwayData, id);

      const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
      const airwayUrl = `${airwayApiBaseUrl}/airway`;
      const airwayRes = await axios_get(airwayUrl, {airwayId: id}, {});
      if (airwayRes.status != 200) {
        console.error(`error: get airway info {status: ${airwayRes.status}}.`);
        chartData = {};
        return;
      }
      chartData = useAirwayConvertConnectionOrder(airwayRes.data);
      PopupContent.value.airway_operator = getcompanyName(operatorData, chartData.airway.airwayAdministratorId);
      showPopup.value = true;
    };

    const setPopupLocation = async (deviationData, reservation, conformityAssessmentRes, latlng) => {
      const airwayId = deviationData.airwayId
      PopupContent.value.airway_id = airwayId
      LocationData.value.reservation_id = reservation.airwayReservationId;
      LocationData.value.airway_section_name = useAirwaySectionNameFromSectionId(airwayData, deviationData.airwaySectionId);
      (deviationData.operationalStatus == operationalStatus.DEVIATION || conformityAssessmentRes.evaluationResults == 'false') ? LocationData.value.operational_status_flg = true : LocationData.value.operational_status_flg = false;
      LocationData.value.status_display = operationalStatusDisplay(deviationData.operationalStatus);
      LocationData.value.operational_status_display = "未確認";
      LocationData.value.operational_status = deviationData.operationalStatus
      PopupContent.value.airway_name = useAirwayGetAirwayNameFromAirwayId(airwayData, airwayId);
      PopupContent.value.airway_section = useAirwayGetCorridorPointRangeFromAirwayIdFullWidth(airwayData, airwayId);
      LocationData.value.airway_fligt_time = airwayFlightTime(reservation, deviationData.timestamp)
      LocationData.value.airway_fligt_distance = airwayFlightDistance(reservation, LocationData.value.airway_fligt_time) + 'm';
      PopupContent.value.airway_distance = useAirwayGetFullDistanceFromAirwayId(airwayData, airwayId) + 'm';
      PopupContent.value.airway_porpose = useAirwayGetPurposeFromAirwayId(airwayData, airwayId);
      LocationData.value.reservation_date = useDateString2(reservation.updatedAt);
      LocationData.value.latlng = latlng
      LocationData.value.timestamp = deviationData.timestamp
      LocationData.value.airwaySections = reservation.airwaySections
      LocationData.value.startDay = useDateString1(reservation['airwaySections'][0]['startAt']),
      LocationData.value.endDay = useDateString1(reservation['airwaySections'][0]['endAt']),
      LocationData.value.airway_section_id = reservation['airwaySections'][0]['airwaySectionId'];
      showLocation.value = true;
      const promises = []
      const routeRequest = setStatus(conformityAssessmentRes).then(async () => { // ※ 描画が完了してからラインを赤くするため非同期処理をしている 要修正
        // 適合性評価の結果を確認
        if (conformityAssessmentRes.evaluationResults == 'false') {
          applyDeviationStyles();
          return;
        }
        // 逸脱確認
        if (LocationData.value.operational_status_flg) {
          applyDeviationStyles(LocationData.value.airway_section_name);
        } else {
          revertDeviationStyles();
        }
      })
      promises.push(routeRequest);

      // 全ての非同期リクエストが完了するのを待つ
      await Promise.all(promises);
    };
    const setStatus = async (conformityAssessmentRes) => {
      // 適合性評価の結果を確認
      if (conformityAssessmentRes.evaluationResults == 'false') {
        LocationData.value.airway_section_name = '-'
        LocationData.value.operational_status_display = conformityAssessmentType(conformityAssessmentRes.type)
      } else {
        LocationData.value.operational_status_display = LocationData.value.status_display;
      }
    }

    const applyDeviationStyles = (airwaySectionId) => {
      let matchIndex = -1;

      const sectionFields = document.querySelectorAll('.c-sectionNameField');
      sectionFields.forEach((el, index) => {
        const textEl = el.children[1] ? el.children[1].children[0] : null;
        if (airwaySectionId) {
          if (textEl && textEl.textContent.trim() === airwaySectionId) {
            el.classList.add('deviation');
            matchIndex = index;
          } else {
            el.classList.remove('deviation');
          }
        } else {
          el.classList.add('deviation');
        }
      });

      const landMarkFields = document.querySelectorAll('.c-landMarkNameField');
      if (airwaySectionId && matchIndex >= 0) {
        
          // ・landMarkFields[matchIndex]：下半分だけ赤にする
          // ・landMarkFields[matchIndex+1]：上半分だけ赤にする
          landMarkFields[matchIndex].classList.remove('deviation');
          landMarkFields[matchIndex+1].classList.remove('deviation');
          landMarkFields[matchIndex].classList.add('half-deviation');
          landMarkFields[matchIndex+1].classList.add('half-deviation');
          // landMarkFields[matchIndex] の下半分赤用オーバーレイを追加
          let elem1 = landMarkFields[matchIndex];
          // 既に存在する場合は削除してから追加
          let lowerOverlay = elem1.querySelector('.half-overlay.lower');
          if (lowerOverlay) {
            lowerOverlay.remove();
          }
          lowerOverlay = document.createElement('div');
          lowerOverlay.classList.add('half-overlay', 'lower');
          elem1.appendChild(lowerOverlay);
        
          // landMarkFields[matchIndex+1] の上半分赤用オーバーレイを追加
          let elem2 = landMarkFields[matchIndex+1];
          let upperOverlay = elem2.querySelector('.half-overlay.upper');
          if (upperOverlay) {
            upperOverlay.remove();
          }
          upperOverlay = document.createElement('div');
          upperOverlay.classList.add('half-overlay', 'upper');
          elem2.appendChild(upperOverlay);
      } else {
        landMarkFields.forEach(el => el.classList.add('deviation'));
      }
    };

    const revertDeviationStyles = () => {
      const sectionFields = document.querySelectorAll('.c-sectionNameField');
      sectionFields.forEach(el => {
        el.classList.remove('deviation');
      });
      const landMarkFields = document.querySelectorAll('.c-landMarkNameField');
      landMarkFields.forEach(el => {
        el.classList.remove('deviation');
      });
    };

    const airwayFlightTime = (reservation, timestamp) => {
      const airwaySections = reservation.airwaySections
      const start = new Date(airwaySections[0].startAt)  // 開始時刻
      const end = new Date(timestamp)
      const diffTime = end.getTime() - start.getTime()
      if (diffTime < 0) return ""
      
      const seconds = Math.floor(diffTime / 1000); // ミリ秒を秒に変換
      const hours = Math.floor(seconds / 3600); // 秒を時間に
      const remainderSeconds = seconds % 3600;
      const minutes = Math.floor(remainderSeconds / 60); // 残り秒を分に
      const flightTime = hours.toString() +':' + (minutes < 10 ? '0' + minutes.toString() : minutes.toString())
      
      return flightTime
    };

    const airwayFlightDistance = (reservation, flightTime) => {
      if (!flightTime) return ''

      const airwaySections = reservation.airwaySections
      const start = new Date(airwaySections[0].startAt)  // 開始時刻
      const end = new Date(airwaySections[0].endAt)  // 到着時刻
      const totalDistance = useAirwayGetFullDistanceFromAirwayId(airwayData, PopupContent.value.airway_id)
      const speed =  totalDistance / ((end.getTime() - start.getTime()) / 1000)
      const parts = flightTime.split(':').map(part => parseInt(part, 10));

      if (parts.length !== 2) {
        throw new Error('flightTime is in invalid state.');
      }

      const hours = parts[0];
      const minutes = parts[1];

      const totalSeconds = hours * 3600 + minutes * 60; // 秒を計算

      const FlightDisatance = speed * totalSeconds
      
      return Math.floor(FlightDisatance)
    };

    const combinedList = () => {
      const points = useAirwayGetCorridorPointNameListFromAirwayId(airwayData, PopupContent.value.airway_id);
      const sections = useAirwayGetCorridorSectionNameListFromAirwayId(airwayData, PopupContent.value.airway_id);
      const maxLength = Math.max(points.length, sections.length);
      const combined = [];
      const passAt = []
      if (showLocation.value) {
        // 経過予想時刻の算出
        const airwaySections = LocationData.value.airwaySections
        const start = new Date(airwaySections[0].startAt)  // 開始時刻
        const end = new Date(airwaySections[0].endAt)  // 到着時刻
        const totalDistance = useAirwayGetFullDistanceFromAirwayId(airwayData, PopupContent.value.airway_id)
        const speed =  totalDistance / ((end.getTime() - start.getTime()) / 1000)
        passAt.push(('0' + start.getHours()).slice(-2) + ':' + ('0' + start.getMinutes()).slice(-2))

        let elapsedTime = 0
        for (let i = 0; i < points.length - 1; i++) {
          const sectionList = [points[i], points[i + 1]]
          // 航路区画の間の距離 (メートル)
          const distance = useAirwayGetDistanceFromJunctionNameList(airwayData, PopupContent.value.airway_id, sectionList)
          // 経過時間の計算
          elapsedTime = distance / speed + elapsedTime
          
          // Xメートル地点の通過時刻の計算
          const passageTime = new Date(start.getTime() + elapsedTime * 1000) // ミリ秒単位で計算
         
          passAt.push(('0' + passageTime.getHours()).slice(-2) + ':' + ('0' + passageTime.getMinutes()).slice(-2))
        } 
      }

      for (let i = 0; i < maxLength; i++) {
        if (i < points.length) {
          combined.push({ type: 'c-landMarkNameField', name: points[i], passAt: passAt[i] });
        }
        if (i < sections.length) {
          combined.push({ type: 'c-sectionNameField', name: sections[i] });
        }
      }
      return combined;
    }

    const conformityAssessmentType = (type) => {
      const resultType = ref('')
      switch (type) {
          case "weather":
            resultType.value = "気象異常";
            break;
          case "event":
            resultType.value = "規制イベント";
            break;
          case "railway":
            resultType.value = "鉄道異常";
            break;
          case "intrusion":
            resultType.value = "人立ち入り";
            break;
          default:
            resultType.value = "取得失敗";
            break;
        }
        return resultType.value
    }
    const operationalStatusDisplay = (status) => {
      let stat = ""
      switch (status) {
        case operationalStatus.BEFORE:
          stat = '航路進入前'
          break
        case operationalStatus.NORMAL:
          stat = '運航中'
          break
        case operationalStatus.DEVIATION:
          stat = '航路逸脱'
          break
        default:
          break
      }
      return stat
    }

    const polling = () => {
      timeout = setTimeout(async () => {
        await underwayMaerker()
        polling()
      },3000)
    }

    onMounted(async () => {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;

      map.value = L.map('leafletMap', {
        center: centerInit,
        zoom: zoomInit,
        scrollWheelZoom: false,
        zoomControl: true
      });

      L.tileLayer(
        useRuntimeConfig().public.mapTileUrl,
        {
          className: "grayscale-map",
          attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
        }
      ).addTo(map.value);

      /* Zoomコントロール位置移動 */
      map.value.zoomControl.setPosition('topleft');

      // 地図移動完了時イベントハンドラ
      map.value.on('moveend', (event) => {
        console.log(`MapLayerControlMounted: ${MapLayerControlMounted.value}`);
        if (!MapLayerControlMounted.value) {
          console.log(`map moved:${event}`);
          map_moveend.value = true;
        }
      });
      
      // 事業者一覧情報を取得
      try {
        const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
        const operatorUrl = `${miscApiBaseUrl}/operator`;
        const operatorRes = await axios_get(operatorUrl, {}, {timeout: useRuntimeConfig().public.timeoutValue});
        if (operatorRes.status === 200 && operatorRes.data != undefined) {
          operatorData = {};
          operatorData = operatorRes.data;
          console.log("operatorData",operatorData);
        } else {
          console.error(`error: get operator info {status: ${operatorRes.status}}.`);
          return;
        }
      } catch (error) {
        console.error('事業者情報一覧の取得に失敗しました(operatorUrl):', error);
      }

      /* ポートデータ取得 */
      const droneApiBaseUrl = useRuntimeConfig().public.droneApiBaseUrl;
      const portUrl = `${droneApiBaseUrl}/droneport/info/list`;
      const portRes = await axios_get(portUrl, {}, {});
      console.log("portRes",portRes);
      if (portRes.status != 200) {
        console.error(`error: get port info {status: ${portRes.status}}.`);
        portData = {};
        return;
      }
      portData = portRes.data.data.map(port => [port.lat, port.lon]);
      console.log("portData",portData);
      const portIcon = L.icon({ iconUrl: porticonUrl, iconSize: [15, 15] });
      portData.forEach(coords => {
        L.marker(coords, { icon: portIcon }).addTo(map.value);
      });

      /* 最大落下範囲データ取得 */
      const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
      const rangeUrl = `${airwayApiBaseUrl}/fall-tolerance-range`;
      const rangeRes = await axios_get(rangeUrl, {businessNumber: useRuntimeConfig().public.businessNumber}, {});
      console.log(rangeRes);
      if (rangeRes.status != 200) {
        console.error(`error: get fall tolerance range info {status: ${rangeRes.status}}.`);
        rangeData = null;
        return;
      }
      rangeData = rangeRes.data;
      /* エリア枠線描画 */
      rangeData['fallToleranceRanges'].forEach((range) => {
        let markerList = [];
        if (range['geometry']['coordinates'].length) {
          range['geometry']['coordinates'][0].forEach((coord) => {
            markerList.push([coord[1], coord[0]]);
          })
          areas.value.push(markerList);
        }
      });

      // 最大落下許容範囲を描画
      areas.value.forEach(area => {
        L.polygon(area, {
          fill: true,
          stroke: true,
          fillColor: "#000000",
          color: "#FFFFFF",
          weight: 3,
          fillOpacity: 0.3,
          opacity: 1
        }).addTo(map.value);
      });

      /* 航路データ取得 */
      const airwayUrl = `${airwayApiBaseUrl}/airway`;
      const airwayRes = await axios_get(airwayUrl, {all: 'true'}, {});
      console.log(airwayRes);
      if (airwayRes.status != 200) {
        console.error(`error: get airway info {status: ${airwayRes.status}}.`);
        airwayData = null;
        return;
      }
      airwayData = useAirwayConvertConnectionOrder(airwayRes.data);

      airwayData['airway']['airways'].forEach((airway) => {
        let airwayInfo = {id:airway['airwayId'], points:[]};
        let coordinateList = [];
        airway['airwayJunctions'].forEach((junction) => {
          let coordinates = junction['airways'][0]['airway']['geometry']['coordinates'];
          coordinateList.push(coordinates);
        })

        coordinateList.forEach((coordinates) => {
          airwayInfo.points.push([(coordinates[0][1] + coordinates[2][1]) / 2, (coordinates[0][0] + coordinates[2][0]) / 2]);
        })

        airwayJunctions.value.push(airwayInfo);
      });

      // Add airway markers and polylines
      airwayJunctions.value.forEach(airway => {
        const blackPolyline = L.polyline(airway.points, {
          color: "#000000",
          weight: 8
        }).addTo(map.value);

        const whitePolyline = L.polyline(airway.points, {
          color: "#FFFFFF",
          weight: 7
        }).addTo(map.value);
        whitePolyline.on('click', () => setPopupContent(airway.id));

        airway.points.forEach(markerCoords => {
          const icon = L.icon({
            iconUrl,
            iconSize: [15, 15],
          });
          L.marker(markerCoords, { icon }).addTo(map.value);
        });
      });

      // 予約データ取得
      let lastPage = 1;
      let currentPage = 1;
      let tmpReservationData = null;
      let reservationUrl = '';
      const reservationApiBaseUrl = useRuntimeConfig().public.reservationApiBaseUrl;
      if (props.role == 1) {
        reservationUrl = `${reservationApiBaseUrl}/admin/airwayReservations`;
      } else if (props.role == 2) {
        reservationUrl = `${reservationApiBaseUrl}/operator/${props.cookie_role.operatorId}/airwayReservations`;
      } else {
        console.log("error: get airway reservation info (permision denied.)");
        reservationData = {};
        return;
      }
      let reservationRes = await axios_get(reservationUrl, {}, {});
      console.log(reservationRes);
      if (reservationRes.status != 200) {
        console.error(`error: get airway reservation info {status: ${reservationRes.status}}.`);
        reservationData = {};
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

      
      reservationData = {result: []};
      tmpReservationData.result.forEach((reservation) => { 
        // 時刻チェック
        let isDateCheck = false;
        const now_date = new Date();
        const Departure_date = new Date(useDateString1(reservation['airwaySections'][0]['startAt']));
        const Arrival_date = new Date(useDateString1(reservation['airwaySections'][0]['endAt']));
        isDateCheck = (Departure_date <= now_date && Arrival_date >= now_date);
        console.log('now_date: ' + now_date);
        console.log('Departure_date: ' + Departure_date);
        console.log('Arrrival_date: ' + Arrival_date);
        if (isDateCheck == true) {
          reservationData.result.push(reservation);
        }
      })
      
      console.log(reservationData)

      await underwayMaerker()
            
      polling()
    });

    onUnmounted(() => {if(timeout) clearTimeout(timeout)}) 

    const underwayMaerker = async () => {
      reservationData.result.forEach(async (reservation) => {
        // 地図のドローンの位置を削除
        const maerked = locationList.value.find(r => r.reservID === reservation.airwayReservationId)
        if (maerked) {
          map.value.removeLayer(maerked.marker);
          locationList.value = locationList.value.filter(function( item ) {
            return item !== maerked;
          });
        }
      
        /* 位置情報取得 */
        let locationData = null;
        const safetyApiBaseUrl = useRuntimeConfig().public.safetyApiBaseUrl;
        const locationUrl = `${safetyApiBaseUrl}/get-current-location/` + reservation.airwayReservationId;
        const locationRes = await axios_get(locationUrl, {}, {});
        
        if (locationRes.status != 200) {
          return
        }
        locationData = locationRes.data;
        const latlng = [ locationData.latitude, locationData.longitude ]
        
        //適合性確認
        const conformityAssessmentRes = await getConformityAssessmentRes(reservation)
        if (!conformityAssessmentRes) return

        // icon セット
        let html = ref(null)
        if (locationData.operationalStatus !== operationalStatus.DEVIATION && conformityAssessmentRes.evaluationResults != 'false') {
          html.value = `<div class="wrapper"><div class="maru-normal"><p>×</p></div></div>`;
        } else {
          html.value = `<div class="wrapper"><div class="maru-red"><p>！</p></div><div class="maru-red"><p>×</p></div></div>`;
        }
        
        if (html.value) {
          const allowIcon = L.divIcon({
            className: '',
            html: html.value,
            iconSize: [50, 50]
          });
          const indexOffSet = 1000
          const addMarker = L.marker(latlng, { icon: allowIcon, zIndexOffset: indexOffSet }).addTo(map.value)
          addMarker.on('click', () => setPopupLocation(locationData, reservation, conformityAssessmentRes, latlng))
          const location = { reservID: reservation.airwayReservationId, marker: addMarker }
          locationList.value.push(location)
        }
      })
    }

    const getConformityAssessmentRes = async (reservation) => {
      // 適合性取得
      let conformityAssessment = null
      const safetyApiBaseUrl = useRuntimeConfig().public.safetyApiBaseUrl;
      const conformityAssessmentUrl = `${safetyApiBaseUrl}/conformity-assessment`;
      const url = '/api/getAircraftInfoFrom?id=' + reservation.airwayReservationId;
      const routeRequest = await axios_get(url, {}, {})
      if (routeRequest.status !== 200) {
        return conformityAssessment;
      }
      const aircraftInfo = routeRequest.data.aircraftInfo;

      const airwaySections = reservation.airwaySections
      console.log(airwaySections);

      for (const data of airwaySections) {
        const body = {
          "airwaySectionId": data.airwaySectionId,
          "startAt": data.startAt,
          "endAt": data.endAt,
          "aircraftInfo": {
            "maker": aircraftInfo.maker,
            "modelNumber": aircraftInfo.modelNumber,
            "name": aircraftInfo.name,
            "type": aircraftInfo.type,
            "length": aircraftInfo.length,
          }
        };
        console.log(body);
        const conformityAssessmentRes = await axios_post(conformityAssessmentUrl, body, {});
        console.log(conformityAssessmentRes);
        if (conformityAssessmentRes.status !== 200) {
          console.error(`error: post conformityAssessment info {status: ${conformityAssessmentRes.status}}.`);
          return conformityAssessment;
        }
        conformityAssessment = conformityAssessmentRes.data
        // 適合性評価の結果を確認
        if (conformityAssessment.evaluationResults == 'false') {
          return conformityAssessment
        }
      }

      return conformityAssessment;
    }

    return {
      showPopup,
      closePopup,
      map,
      map_moveend,
      PopupContent,
      LocationData,
      combinedList,
      setPopupContent,
      showLocation,
      setPopupLocation,
      underwayMaerker,
      locationList,
      MapLayerControlMounted,
    };
  },
  methods: {
    // 天候情報の変更完了ハンドラ
    handleWeatherChanged(changeed) {
      console.log(`map_moveend: ${this.map_moveend}.`);
      console.log(`Weather_Changeed: ${changeed}`);
      this.map_moveend = false;
    },
    // MapLayerControl Mounted 完了ハンドラ
    handleMapLayerControlMounted(Mounted) {
      console.log(`MapLayerControl_Mounted: ${Mounted}`);
      this.MapLayerControlMounted= false;
      console.log(`MapLayerControl_Mounted: ${this.MapLayerControlMounted}`);
    }
  },
}
</script>

<style>
#leafletMap {
  height: 100%;
  width: 100%;
  z-index: 0;
}

.grayscale-map .leaflet-tile {
  filter: grayscale(100%);
}

.area-control-middle-right {
  display: flex;        /* 横並びにする */
  position: absolute;
  top: 100px;
  right: 20px;
  z-index: 1000;
  font-size: 0.8rem;
  line-height: 2em;
  margin: 0;
  padding: 10px;
  flex-direction: column;     /* 子要素を縦並びにする */
  align-items: flex-end;      /* 右端に揃える */
}

.area-control-bottom-left {
  position: absolute;
  bottom: 20px;
  left: 10px;
  z-index: 1000;
  font-size: 0.8rem;
  line-height: 2em;
  margin: 0;
  padding: 10px;
}

.airway-status-link {
  position: absolute;
  top: 40px;
  right: 30px;
  z-index: 1000;
}

.custom-popup {
  position: absolute;
  top: 10px;
  right: 400px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 20px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  border-radius: 0;
  width: 400px;
  height: 600px;
  z-index: 2000;
  overflow-y: auto;
  font-family: 'BIZ UDPGothic';
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.close-button {
  background: white;
  border: 1px solid #aaa;
  border-radius: 0;
  font-size: 18px;
  cursor: pointer;
  padding: 1px;
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
  width: 40%;
  font-weight: bold;
  text-align: right;
}

.info-table td {
  padding: 5px;
}

.airway-detail-button {
  font-size: 15px;
  border: 2px solid #000000;
  padding: 3px 10px;
  text-decoration: none;
  color: #000000;
}

.spacer {
  height: 80px;
}

.maru-normal {
  height:25px;
  width:25px;
  border-radius:50%;
  line-height:25px;
  text-align:center;
  color: black;
  background: gray;
  font-size:24px;
  margin-right: 5px;
}

.maru-red {
  height:25px;
  width:25px;
  border-radius:50%;
  line-height:25px;
  text-align:center;
  color: white;
  background: crimson;
  font-size:24px;
  margin-right: 5px;
}

.wrapper {
  display: flex;
  right: 50px;
  position: absolute;
  right: 7.5px;
  top: 12.5px;
}
.c-sectionNameField.deviation::after {
  border-right: 2px solid crimson;
}

.c-sectionNameField::after {
  z-index: -3;
}

.landmarkText{
  margin-top: 1rem;
  margin-left: 0.5rem;
}

.c-landMarkNameField.deviation::after {
  content: "";
  position: absolute;
  top: 0;
  left: 1rem;
  z-index: -2;
  display: block;
  border-right: 2px solid crimson;
  width: 1px;
  height: 100%;
}

.c-landMarkNameField.half-deviation::after {
  content: "";
  position: absolute;
  top: 0;
  left: 1rem;
  z-index: -3;
  display: block;
  border-right: 2px solid #000000;
  width: 1px;
  height: 100%;
}

.half-overlay {
  position: absolute;
  left: 1rem;
  width: 1px;
  border-right: 2px solid crimson;
  z-index: -1;
}

 /* 下半分赤用 */
.half-overlay.lower {
  bottom: 0;
  height: 50%;
}

 /* 上半分赤用 */
.half-overlay.upper {
  top: 0;
  height: 50%;
}
</style>
<style scoped>
.landmarkNamingField {
  width: 14.642rem!important;
  border: 0!important;
  border-radius: 0!important;
  display: block !important;
}

.c-landmarkFormList {
  padding-left: 0;
}
</style>
