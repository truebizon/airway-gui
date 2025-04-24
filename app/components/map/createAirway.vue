<template>
  <div id="createAirwayMap" style="height: 75dvh; position: relative;"></div> 
  <div class="control-window">
    <div class="area-control">
      <button type="button" @click="clearSetting">
        <img src="../../assets/css/img/dummyImg/svg_create.svg" alt="clear" style="width: 30px; height: 30px;">
      </button>
      <p>削除</p>
    </div>
    <div class="layer-control-top-right">
      <MapProhibitedAreaControl :map="l_map" :map_moveend="map_moveend"></MapProhibitedAreaControl>
      <MapLayerControl :stepNo="stepNo" :map="l_map" :map_moveend="map_moveend" @Weather_Changeed="handleWeatherChanged" @MapLayerControl_Mounted="handleMapLayerControlMounted"></MapLayerControl>
    </div>
    <div class="legend-bottom-left">
      <MapLegend />
    </div> 
  </div>
</template>

<script lang="ts">
import "leaflet/dist/leaflet.css";
import clickIconUrl from "../assets/css/img/map/circle-solid.svg";
import { ref, onMounted } from "vue";
import { Chart, registerables } from 'chart.js';
import * as turf from "@turf/turf";
import MapLayerControl from '../mapLayerControl.vue';
import MapProhibitedAreaControl from '../mapProhibitedAreaControl.vue';
Chart.register(...registerables);

export default {
  components: {
    MapLayerControl,
    MapProhibitedAreaControl,
  },
  emits: ['update-data', 'isJunctionSetting'],
  props: {
    message: {
      type: String,
      required: true
    },
    drone: {
      type: String,
      required: false
    },
    stepNo: {
      type: String,
      required: true,
    }
  },
  setup(props, { emit }) {

    let markerListInit = [[null, null]];
    let markerCountInit = 0;
    let lineWeight = 13;
    const l_map = ref(null);
    let map_moveend = ref(false);
    const centerInit = [useRuntimeConfig().public.centerInitLat, useRuntimeConfig().public.centerInitLon];
    const zoomInit = 18;
    const markerList = ref(markerListInit);
    const markerCount = ref(markerCountInit);
    const geoJson = ref(null);
    const lines = ref<[number, number][][]>([]); // 描画する全ての線
    const intersections = ref<[number, number][][]>([]); // 交差点のリスト
    const rectWidth = ref<[number, number][][]>([]); // 四角形の横幅の座標
    const curRectWidth = ref<[number, number][][]>([]); // 四角形の横幅の座標(作業用)
    const landmarkNumbers = ref<[number, number][][]>([]); // ジャンクションの番号を置く座標のリスト
    const connectFlag = ref(false); // 接続ボタン押下フラグ
    const settingFlag = ref(false); // 設定ボタン押下フラグ
    const curLine = ref<[number, number][]>([]);
    const curIntersections = ref<[number, number][]>([]);
    const curJunctionIcon = ref(null);
    const curSectionLine = ref(null);
    const curSectionIconObj = ref(null);
    let curLandmark = [];
    let lat1;
    let lat2;
    let lng1;
    let lng2;
    let lat1Airway;
    let lat2Airway;
    let lng1Airway;
    let lng2Airway;
    let topHeight;
    let bottomHeight;
    let airwayMargin = 10; // 航路と逸脱範囲の隙間 (MVP2では 1m固定)
    let lineWeight_i = 45;
    let lineWeight_o = 53;
    let droneInfo = {}; // ダミーデータ挿入処理。ページからドローン情報が渡されるようになったら削除。
    let determinationId;
    let parabolaCoordsTmp = [];
    let LDN_section_name_list = []; // 航路区間名リスト
    let curSectionName = ""; // 航路区間名
    const PolygonLatLngList = [];
    const OuterLatLangs = [[-90,-180],[-90,180],[90,180],[90,-180]];
    const InsideLatLangs = [];
    const PolygonOptions = {
      opacity:0,
      fillOpacity:0.6,
      color:"#D3D3D3"
    };
    let LandmarkIndex = 0;
    let LandmarksvgText;
    let domParser;
    let parsedSVGDoc;
    let LandmarkSVG;
    let LDN_Setting;
    let chartlabel;
    let input_LDN;
    let errorMsg;
    let LandmarkIconList = [];
    let sectionIconList = [];
    let clickIconList = [];
    let lineList = [];
    let sectionLineList = [];
    let controlList = [];
    let arrowList = [];
    let corridor_points = [];
    let despersionNodes = [];
    let resJSON = {};
    const rangeErrorMsg = "範囲内で設定してください。";
    const elevationsErrorMsg = "標高と重なっています。";
    const featuresErrorMsg = "地物と重なっています。";
    const fallToleranceRangeErrorMsg = "最大落下許容範囲外です。";

    const svgTemplate = (number, iconSize_w = '33.818', iconSize_h = '33.818') => `
      <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize_w}" height="${iconSize_h}" viewBox="0 0 33.818 33.818">
        <g id="グループ_1434" data-name="グループ 1434" transform="translate(-17.05 -30.53)">
          <g id="グループ_167" data-name="グループ 167" transform="translate(17.05 30.53)">
            <g id="楕円形_45" data-name="楕円形 45" fill="#fff" stroke="#000" stroke-miterlimit="10" stroke-width="2">
              <circle cx="16.909" cy="16.909" r="16.909" stroke="none"/>
              <circle cx="16.909" cy="16.909" r="15.909" fill="none"/>
            </g>
            <g id="グループ_166" data-name="グループ 166" transform="translate(5.251 5.871)">
              <line id="線_208" data-name="線 208" x2="22.545" y2="22.545" fill="#fff" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
              <line id="線_209" data-name="線 209" x1="22.118" y2="22.118" transform="translate(0.427)" fill="#fff" stroke="#000" stroke-miterlimit="10" stroke-width="2"/>
            </g>
          </g>
          <g id="グループ_168" data-name="グループ 168" transform="translate(22.659 31.288)">
            <ellipse id="楕円形_46" data-name="楕円形 46" cx="10.789" cy="11.71" rx="10.789" ry="11.71" transform="translate(0 6.837)" fill="#fff" opacity="0.7"/>
            <text id="_6" data-name="6" transform="translate(10.274 23)" font-size="22" font-family="MeiryoUI-Bold, Meiryo UI" font-weight="700"><tspan x="-7.444" y="0">${number}</tspan></text>
            <text id="_6-2" data-name="6" transform="translate(10.274 23)" font-size="22" font-family="MeiryoUI-Bold, Meiryo UI" font-weight="700"><tspan x="-7.444" y="0">${number}</tspan></text>
          </g>
        </g>
      </svg>
    `;

    const leftTemplate = `
      <div style="
        font-size: 30PX;
      ">
        <p>L</p>
      </div>
    `

    const rightTemplate = `
      <div style="
        font-size: 30PX;
      ">
        <p>R</p>
      </div>
    `
    const MapLayerControlMounted = ref(true);

    const setMarker = async (event) => {
      // ランドマーク設定
      if (curJunctionIcon.value !== null) {
        console.log("settingLandmark() execute.");
        settingLandmark();
      } else {
        console.log("settingLandmark() not execute.");
      }

      connectFlag.value = false;
      if (curLine.value.length == 2) {
        if (settingFlag.value) { // 正しく設定されている場合
          clearControl();

          rectWidth.value.push([curRectWidth.value[0], curRectWidth.value[1]]);
          curRectWidth.value = [];
          curLine.value = [];
          curIntersections.value = [];
          settingFlag.value = false;
        } else { // 正しく設定されていない場合
          console.log("断面図が正しく設定されていません。");
          return;
        }
      }
      // クリックした地点にアイコンを表示
      const icon = L.icon({
        iconUrl: clickIconUrl,
        iconSize: [10, 10]
      });
      const clickMarker = L.marker(
        [event.latlng.lat, event.latlng.lng],
        {icon: icon}
      ).addTo(l_map.value);
      clickIconList.push(clickMarker);

      curLine.value.push([event.latlng.lat, event.latlng.lng]);
      if (curLine.value.length == 2) {
        if (await checkIntersections(curLine.value)) {
          lines.value.push([...curLine.value]);
          // LandmarkNumber SVG/icon 生成
          LandmarkIndex = LandmarkIndex + 1;
          let iconSizeW = 33.818;
          let iconSizeH = 33.818;
          LandmarksvgText = svgTemplate(LandmarkIndex, iconSizeW, iconSizeH);
          domParser = new DOMParser();
          parsedSVGDoc = domParser.parseFromString(LandmarksvgText, 'image/svg+xml');
          LandmarkSVG = parsedSVGDoc.childNodes[0];
          LDN_Setting = document.getElementById("LDN_Setting");
          LDN_Setting.appendChild(LandmarkSVG);
          input_LDN = document.createElement('input');
          input_LDN.setAttribute("type", "text");
          input_LDN.id = "LandMarkName";
          input_LDN.style.marginLeft = "10px";
          input_LDN.setAttribute("size", "20");
          input_LDN.setAttribute("maxlength", "200");
          input_LDN.style.border = '1px solid #000000';
          LDN_Setting.appendChild(input_LDN);
        } else {
          console.log("交点が2個になるように線を引いてください");
          curLine.value = [];
          curIntersections.value = [];
          clearClickIcon();
        }
      }
    }

    const loadGeoJson = async () => {
      const jsonFile = await fetch('/geojson/bldg_533877.geojson'); // ゼンリン地物情報未契約の場合は使用不可、コンテナ内からファイルを削除する
      geoJson.value = await jsonFile.json()
    }

    onMounted(async () => {
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;
      
      l_map.value = L.map('createAirwayMap', {
        center: centerInit,
        zoom: zoomInit,
        scrollWheelZoom: false,
        zoomControl: false,
        doubleClickZoom: false
      });

      L.tileLayer(
        useRuntimeConfig().public.mapTileUrl,
        {
          className: "grayscale-map",
          attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
        }
      ).addTo(l_map.value);

      l_map.value.on('click', setMarker);

      // 地物情報を読み込み
      await loadGeoJson();

      // ジャンクションの設定が1つ以下の場合は次へは進めないようにする
      emit('isJunctionSetting', false);
      
      droneInfo = JSON.parse(props.drone);
      airwayMargin = droneInfo['deviation_range'];
      console.log(droneInfo);

      // 落下空間取得 API で航路区画IDを取得する
      const headers = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
      const url = `${airwayApiBaseUrl}/fall-space`;
      const params = {
        "fallToleranceRangeId": props.message, // 最大落下許容範囲ID
        "numCrossSectionDivisions": 1000, // 断面分割数
        "droneList": [{
          aircraftInfoId: droneInfo.aircraft_info_id,
          maker: droneInfo.maker,
          modelNumber: droneInfo.model_number,
          name: droneInfo.name,
          type: droneInfo.type,
          ip: droneInfo.ip,
          length: droneInfo.length,
          weight: droneInfo.weight,
          maximumTakeoffWeight: droneInfo.maximum_takeoff_weight,
          maximumFlightTime: droneInfo.maximum_flight_time
        }]
      }
      try {
        const response = await axios_post(url, params, headers);
        if (response.status !== 201) {
          console.error('API request failed:', response.status);
          return;
        }
        determinationId = response.data.airwayDeterminationId;
      } catch (error) {
        console.error('API request failed:', error);
        return;
      }
      console.log(determinationId);

      /* 指定された最大落下許容範囲を特定 */
      let rangeId = props.message;

      const rangeUrl = `${airwayApiBaseUrl}/fall-tolerance-range`;
      const rangeRes = await axios_get(rangeUrl, {businessNumber: useRuntimeConfig().public.businessNumber}, {});
      console.log(rangeRes);
      if (rangeRes.status != 200) {
        console.error(`error: get fall tolerance range info {status: ${rangeRes.status}}.`);
        this.rangeData = null;
        return;
      }
      for (let i = 0; i < rangeRes.data.fallToleranceRanges.length; i++) {
        if (rangeRes.data.fallToleranceRanges[i]['fallToleranceRangeId'] == rangeId) {
          let coordinates = rangeRes.data.fallToleranceRanges[i]['geometry']['coordinates'][0];
          markerCount.value = coordinates.length;
          for (let j = 0; j < coordinates.length; j++) {
            markerList.value[j] = [coordinates[j][1], coordinates[j][0]];
            InsideLatLangs.push([coordinates[j][1], coordinates[j][0]]);
          }
          break;
        }
      }
      PolygonLatLngList.push(OuterLatLangs);
      PolygonLatLngList.push(InsideLatLangs);
      if (InsideLatLangs && InsideLatLangs.length > 0) {
        l_map.value.fitBounds(InsideLatLangs);

        // 最大落下許容範囲が広いと細かい操作ができないため、ズームレベルを1上げる
        const zoomLevel = l_map.value.getZoom();
        l_map.value.setZoom(zoomLevel + 1);
      } else {
      }

      // ポリラインを追加
      lines.value.forEach((line) => {
        L.polyline(line, { color: "#000000", weight: lineWeight }).addTo(l_map.value);
      });

      if (connectFlag.value) {
        console.log("Add polyline connect");
        L.polyline(landmarkNumbers.value, { color: "#E0E0E0", weight: lineWeight_i }).addTo(l_map.value);
        L.polyline(landmarkNumbers.value, { color: "#FFFFFF", weight: lineWeight_o }).addTo(l_map.value);
      }

      // ポリゴンを追加
      if (markerCount.value > 1) {
        L.polygon(PolygonLatLngList, {
          color: PolygonOptions.color,
          opacity: PolygonOptions.opacity,
          fillOpacity: PolygonOptions.fillOpacity
        }).addTo(l_map.value);
      }

      l_map.value.on('moveend', (event) => {
        console.log(`MapLayerControlMounted: ${MapLayerControlMounted.value}`);
        if (!MapLayerControlMounted.value) {
          console.log(`map moved:${event}`);
          map_moveend.value = true;
        }
      });
    });

    // 交差判定と交点計算
    async function checkIntersections(newLine: Array<number>[]): boolean {
      let lineChecked1 = turf.lineString([[newLine[0][1], newLine[0][0]], [newLine[1][1], newLine[1][0]]]);
      for (let i =0; i < markerList.value.length - 1; i++) {
        let lineChecked2 = turf.lineString([
          [markerList.value[i][1], markerList.value[i][0]],
          [markerList.value[i + 1][1], markerList.value[i + 1][0]]
        ]);
        let tmpIntersect = turf.lineIntersect(lineChecked1, lineChecked2);
        if (tmpIntersect.features.length > 0) {
          curIntersections.value.push([tmpIntersect.features[0].geometry.coordinates[1], tmpIntersect.features[0].geometry.coordinates[0]]);
        }
      }
      let intersectionCount = curIntersections.value.length;

      if (intersectionCount == 2)  {
        // 交点を設定時(グラフ作成時)は次へ進めないようにする
        emit('isJunctionSetting', false);
        // 交点が2個の場合のみ距離計算
        let startCoord = [curIntersections.value[0][1], curIntersections.value[0][0]];
        let endCoord = [curIntersections.value[1][1], curIntersections.value[1][0]];
        let startPoint = turf.point(startCoord);
        let endPoint = turf.point(endCoord);
        let dist = turf.distance(startPoint, endPoint) * 1000;

        // 座標計算の誤差で直線が最大落下範囲からはみ出ることがあるので、固定値だけ内側にずらす
        var tmpCurLine = turf.lineString([startCoord, endCoord]);
        let tmpStartPoint = turf.along(tmpCurLine, 0.003, {units: 'kilometers'});
        startCoord = [tmpStartPoint.geometry.coordinates[0], tmpStartPoint.geometry.coordinates[1]];
        var tmpCurLine = turf.lineString([endCoord, startCoord]);
        let tmpEndPoint = turf.along(tmpCurLine, 0.003, {units: 'kilometers'});
        endCoord = [tmpEndPoint.geometry.coordinates[0], tmpEndPoint.geometry.coordinates[1]];
        dist = turf.distance(tmpStartPoint, tmpEndPoint) * 1000;

        // 最初の断面図は見る方向が不明なため、南から北に見た向きで固定
        // 西側の点が start になる
        let start;
        let end;
        if (startCoord[0] >= endCoord[0] && startCoord[1] >= endCoord[1]) {
          start = endCoord;
          end = startCoord;
        } else if (startCoord[0] >= endCoord[0] && startCoord[1] < endCoord[1]) {
          start = endCoord;
          end = startCoord;
        } else if (startCoord[0] < endCoord[0] && startCoord[1] >= endCoord[1]) {
          start = startCoord;
          end = endCoord;
        } else {
          start = startCoord;
          end = endCoord;
        }

        // 二個目以降の断面図は進行方向で見る向きに調整する
        if (curLandmark.length > 0) {
          let tmpLng = curLandmark[1];
          let tmpLat = curLandmark[0];

          // 線分の両端を無限に延長した直線の方程式(y = mx + c )を求める
          const m = (end[1] - start[1]) / (end[0] - start[0]);
          const c = start[1] - m * start[0];

          // 直前に置かれたジャンクションの緯度は直線上のどこに位置するか
          const y = m * tmpLng + c;

          // 実際の経度と比較
          if (tmpLat > y) {
            // 北から南に見る
            const tmpCoord = start;
            start = end;
            end = tmpCoord;
            console.log('北から南');
          } else {
            // 南から北に見る
          }
        }

        // 矩形表示のための座標を修正
        curIntersections.value[0] = [start[1], start[0]];
        curIntersections.value[1] = [end[1], end[0]];
        intersections.value.push(curIntersections.value[0]);
        intersections.value.push(curIntersections.value[1]);

        // 直線状の標高と地物の高さを取得
        let geoInfo = await calculateGeoInfo(start, end);

        // 落下空間(断面)取得 API で、放物線の座標を取得
        const headers = {
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
        const url = `${airwayApiBaseUrl}/fall-space-cross-section`;
        const params = {
          "airwayDeterminationId": determinationId,
          "geometry": {
            "type": "LineString",
            "coordinates": [start, end]
          }
        }
        let parabolaCoords = [];
        try {
          const response = await axios_post(url, params, headers);
          if (response.status !== 201) {
            console.error('API request failed:', response.status);
            return false;
          }
          parabolaCoords = response.data.data;
          let tmpDespersion = {
            name: 'despersion-' + despersionNodes.length,
            geometry: {
              type: 'LineString',
              coordinates: [start, end]
            },
            fallSpaceCrossSectionId: response.data.fallSpaceCrossSectionId
          };
          despersionNodes.push(tmpDespersion);
        } catch (error) {
          console.error('API request failed:', error);
          return false;
        }

        console.log(parabolaCoords);
        let parabolaList = [[0, 0]];
        const startEndDiff = Math.abs(end[0] - start[0]);
        parabolaCoords.forEach((coord) => {
          parabolaList.push([
            Math.abs(coord[0] - start[0]) / startEndDiff * dist,
            coord[2]
          ]);
        });
        parabolaList.sort((a, b) => a[0] - b[0]);
        parabolaCoordsTmp = parabolaList;

        let maxParabolaHeight = 0;
        let parabolaCount = 0;
        parabolaList.forEach((point) => {
          if (point[1] > maxParabolaHeight) {
            maxParabolaHeight = point[1];
          }
          parabolaCount++;
        })
        console.log(maxParabolaHeight);

        // グラフ作成
        await createChartWindow(l_map.value);
        createChart(dist, maxParabolaHeight, geoInfo, parabolaList);

        // クリックした地点のアイコンをクリア
        clearClickIcon();

        /* 直線を描画 */
        let tmpLine = [
          [start[1], start[0]],
          [end[1], end[0]]
        ]
        const line = L.polyline(tmpLine, { color: "#000000", weight: lineWeight }).addTo(l_map.value);
        lineList.push(line);

        // グラフを見る向きを表す LR を地図に描画
        const angleInRadians = Math.atan2(end[0] - start[0], end[1] - start[1]);
        const angleInDegrees = angleInRadians * (180 / Math.PI);
        let angle = angleInDegrees % 360;
        let radian = angle * Math.PI / 180;
        var anchor = [60 * Math.sin(radian), -60 * Math.cos(radian)];;
        var html = leftTemplate;
        let leftIcon = L.divIcon({
          className: '',
          html: html,
          iconAnchor: anchor
        })
        const leftIconObj = L.marker([start[1], start[0]], {icon: leftIcon}).addTo(l_map.value);
        arrowList.push(leftIconObj);
        anchor = [-60 * Math.sin(radian), 60 * Math.cos(radian)];;
        html = rightTemplate;
        let rightIcon = L.divIcon({
          className: '',
          html: html,
          iconAnchor: anchor
        })
        const rightIconObj = L.marker([end[1], end[0]], {icon: rightIcon}).addTo(l_map.value);
        arrowList.push(rightIconObj);

        return true;
      } else {
        return false;
      }
    }

    // 直線状の標高と地物の高さを取得
    async function calculateGeoInfo(
      startCoord: Array<[]>,
      endCoord: Array<[]>
    ): object {
      let intersectsList = [];
      let bldgXList = [];
      let bldgYList = [];
      let altitudeXList = [];
      let altitudeYList = [];
      let mergedXList = [];
      let mergedBldgYList = [];
      let mergedAltitudeYList = [];
      let result = {X:[], bldgY:[], altitudeY:[], minAltitude: null};

      /* 直線を作成 */
      let line = turf.lineString([startCoord, endCoord]);
      /* 各地物を走査し、交点を求める */
      geoJson.value.features.forEach(function(feature) {
        let pointNum = feature.geometry.coordinates[0].length;
        for (let i = 0; i < pointNum - 1; i++) {
          var tmpPoint1 = [feature.geometry.coordinates[0][i][0], feature.geometry.coordinates[0][i][1]];
          var tmpPoint2 = [feature.geometry.coordinates[0][i + 1][0], feature.geometry.coordinates[0][i + 1][1]];
          let eachLine = turf.lineString([tmpPoint1, tmpPoint2]);  
          let intersects = turf.lineIntersect(line, eachLine);
          /* 交点があれば、交点の座標と建物の高さを取得 */
          if (intersects.features.length > 0) {
            var tmpPoint1 = turf.point([intersects.features[0].geometry.coordinates[0], intersects.features[0].geometry.coordinates[1]]);
            var tmpPoint2 = turf.point(startCoord);
            let tmpIntersect = {x: turf.distance(tmpPoint1, tmpPoint2) * 1000, y: feature.properties.measuredHeight, point: tmpPoint1};
            /* 交点リストに追加 */
            intersectsList.push(tmpIntersect);
          }
        }
      })
      
      /* 直線の開始座標に近い順にソート */
      intersectsList.sort((a, b) =>
        a['x'] - b['x']
      );

      /* 直線を分割して各点の標高を取得 */
      var tmpPoint1 = turf.point(startCoord);
      var tmpPoint2 = turf.point(endCoord);
      var lineDistance = turf.distance(tmpPoint1, tmpPoint2);
      let divideNum = 30;
      for (let i = 0; i < divideNum + 1; i++) {
        let tmpPoint = turf.along(line, i * lineDistance / divideNum, {units: 'kilometers'});
        let tmpAltitude = await useGeoJsonGetSingleAltitude(tmpPoint.geometry.coordinates[0], tmpPoint.geometry.coordinates[1]);
        altitudeXList.push(i * lineDistance / divideNum * 1000);
        altitudeYList.push(tmpAltitude);
      }

      /* 対地高で表示するため、最小の標高を求めて各Y値から引く */
      const calculateMin = function (a, b) {return Math.min(a, b);}
      let minAltitudeY = altitudeYList.reduce(calculateMin);
      var i = 0;
      for (i = 0; i < altitudeYList.length; i++) {
        altitudeYList[i] = altitudeYList[i] - minAltitudeY;
      }

      /* 地物の床と天井の座標を交互に登録するために使用 */
      /* 制限: 直線の開始地点に地物が存在しないこと */
      let floorFlag = false;

      for (let i = 0; i < intersectsList.length; i++) {
        let tmpAltitude = await useGeoJsonGetSingleAltitude(intersectsList[i]['point'].geometry.coordinates[0], intersectsList[i]['point'].geometry.coordinates[1]);
        let bldgHeight = intersectsList[i]['y'] + tmpAltitude - minAltitudeY; //要修正。上で取得した標高が minAltitudeY よりも小さい可能性がある。
        if (floorFlag) {
          bldgXList.push(intersectsList[i]['x']);
          bldgXList.push(intersectsList[i]['x']);
          bldgYList.push(bldgHeight);
          bldgYList.push(0);
        } else {
          bldgXList.push(intersectsList[i]['x']);
          bldgYList.push(0);
          bldgYList.push(bldgHeight);
          bldgXList.push(intersectsList[i]['x']);
        }
        floorFlag = !floorFlag;
      }

      /* リスト長を合わせる */
      let bldgIndex = 0;
      let prevBldgY = 0;
      var i = 0;
      while (i < altitudeXList.length) {
        if (bldgIndex < bldgXList.length) {
          if (altitudeXList[i] < bldgXList[bldgIndex]) {
            mergedXList.push(altitudeXList[i]);
            mergedBldgYList.push(prevBldgY);
            mergedAltitudeYList.push(altitudeYList[i]);
            i++;
          } else if (altitudeXList[i] >= bldgXList[bldgIndex]) {
            mergedXList.push(bldgXList[bldgIndex]);
            mergedBldgYList.push(bldgYList[bldgIndex]);
            mergedAltitudeYList.push(altitudeYList[i]);
            prevBldgY = bldgYList[bldgIndex];
            bldgIndex++;
          }
        } else {
          mergedXList.push(altitudeXList[i]);
          mergedBldgYList.push(0);
          mergedAltitudeYList.push(altitudeYList[i]);
          i++;
        }
      }

      // グラフの縦軸定義用に高さ最大値を取得
      let maxY = 0;
      mergedAltitudeYList.forEach((alt) => {
        if (alt > maxY) {
          maxY = alt;
        }
      });
      mergedBldgYList.forEach((bld) => {
        if (bld > maxY) {
          maxY = bld;
        }
      })

      result['X'] = mergedXList;
      result['bldgY'] = mergedBldgYList;
      result['altitudeY'] = mergedAltitudeYList;
      result['minAltitude'] = minAltitudeY
      result['maxY'] = maxY;

      return result;
    }

    // 2点間を結ぶ線上の地点の緯度・経度を計算
    function interpolateLatLng(dist, minAltitude) {
      const t1 = Math.round(rectangleCoords.value.topLeft.x) / dist;
      lat1 = curIntersections.value[0][0] + (curIntersections.value[1][0] - curIntersections.value[0][0]) * t1;
      lng1 = curIntersections.value[0][1] + (curIntersections.value[1][1] - curIntersections.value[0][1]) * t1;
      lat1Airway = lat1 + (curIntersections.value[1][0] - curIntersections.value[0][0]) * airwayMargin / dist;
      lng1Airway = lng1 + (curIntersections.value[1][1] - curIntersections.value[0][1]) * airwayMargin / dist;

      const t2 = Math.round(rectangleCoords.value.topRight.x) / dist;
      lat2 = curIntersections.value[0][0] + (curIntersections.value[1][0] - curIntersections.value[0][0]) * t2;
      lng2 = curIntersections.value[0][1] + (curIntersections.value[1][1] - curIntersections.value[0][1]) * t2;
      lat2Airway = lat2 - (curIntersections.value[1][0] - curIntersections.value[0][0]) * airwayMargin / dist;
      lng2Airway = lng2 - (curIntersections.value[1][1] - curIntersections.value[0][1]) * airwayMargin / dist;

      // 航路情報の高さは対地高度
      topHeight = Math.round(rectangleCoords.value.topLeft.y);
      bottomHeight = Math.round(rectangleCoords.value.bottomLeft.y);

      curRectWidth.value[0] = [lat1, lng1];
      curRectWidth.value[1] = [lat2, lng2];
      const midLat = (lat1 + lat2) / 2;
      const midLng = (lng1 + lng2) / 2;
      curLandmark = [midLat, midLng];

      // ジャンクションIconセット
      let iconSizeW = 50;
      let iconSizeH = 50;
      let sectionIcon = L.divIcon({
        className: '',
        html: svgTemplate(LandmarkIndex, iconSizeW, iconSizeH),
        iconSize: [iconSizeW, iconSizeH],
      });
      if (curJunctionIcon.value !== null) {
        l_map.value.removeLayer(curJunctionIcon.value);
      }
      curJunctionIcon.value = L.marker([curLandmark[0], curLandmark[1]], { icon: sectionIcon }).addTo(l_map.value);
      return;
    }

    const chartCanvas = ref(null);
    const chart = ref(null);
    // 逸脱範囲の矩形
    const rectangleCoords = ref<{
      topLeft: { x: number; y: number };
      topRight: { x: number; y: number };
      bottomLeft: { x: number; y: number };
      bottomRight: { x: number; y: number };
    } | null>(null);
    // グラフ作成
    const createChart = (dist, maxParabolaHeight, geoInfo, parabolaList) => {
      if (div1.value) {
        const chartMarginY = 5;
        // 航路の矩形を作成できる範囲
        const flightAreaPlugin = {
          id: 'flightAreaPlugin',
          afterDraw: (chart) => {
            const { ctx, chartArea} = chart;
            const { left, right, top, bottom, height, width } = chartArea;
            const diffX = right - left;
            const diffY = bottom - top;

            // 断面の座標設定
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(left, bottom);
            parabolaList.forEach((coord) => {
              const x = coord[0] / dist * diffX + left;
              const y = bottom - (coord[1] / (maxParabolaHeight + chartMarginY) * diffY);
              ctx.lineTo(x, y);
            })
            ctx.lineTo(right, bottom);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();

            // 断面の外側に色を塗る
            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 0;
            ctx.moveTo(left, bottom);
            parabolaList.forEach((coord) => {
              const x = coord[0] / dist * diffX + left;
              const y = bottom - (coord[1] / (maxParabolaHeight + chartMarginY) * diffY);
              ctx.lineTo(x, y);
            })
            ctx.lineTo(right, bottom);
            ctx.lineTo(right, top);
            ctx.lineTo(left, top);
            ctx.lineTo(left, bottom);
            ctx.closePath();
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'lightgray';
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        };

        const textPlugin = {
          id: 'textPlugin',
          afterDraw: (chart) => {
            const { ctx, chartArea: { top, bottom, left, right } } = chart;
            ctx.save();

            // 左側のテキスト
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText('L', left - 13, (top + bottom) / 1.3);

            // 右側のテキスト
            ctx.fillText('R', right + 13, (top + bottom) / 1.3);

            ctx.restore();
          }
        };

        const dragPlugin = {
          id: "dragPlugin",
          beforeInit(chart: any) {
            const canvas = chart.canvas as HTMLCanvasElement;
            const dragData = {
              rect: null,
              isDragging: false,
              activeMarker: null,
            };

            const updateRectangleCoords = (rect, chart) => {
              if (!rect) return;

              const scales = chart.scales;

              rectangleCoords.value = {
                topLeft: {
                  x: scales.x.getValueForPixel(rect.x),
                  y: scales.y.getValueForPixel(rect.y),
                },
                topRight: {
                  x: scales.x.getValueForPixel(rect.x + rect.width),
                  y: scales.y.getValueForPixel(rect.y),
                },
                bottomLeft: {
                  x: scales.x.getValueForPixel(rect.x),
                  y: scales.y.getValueForPixel(rect.y + rect.height),
                },
                bottomRight: {
                  x: scales.x.getValueForPixel(rect.x + rect.width),
                  y: scales.y.getValueForPixel(rect.y + rect.height),
                },
              };

              interpolateLatLng(dist, geoInfo['minAltitude']);
            };

            const updateRectangle = (rect, marker, mouseX, mouseY) => {
              switch (marker) {
                case "topLeft":
                  rect.width += rect.x - mouseX;
                  rect.height += rect.y - mouseY;
                  rect.x = mouseX;
                  rect.y = mouseY;
                  break;
                case "topRight":
                  rect.width = mouseX - rect.x;
                  rect.height += rect.y - mouseY;
                  rect.y = mouseY;
                  break;
                case "bottomLeft":
                  rect.width += rect.x - mouseX;
                  rect.height = mouseY - rect.y;
                  rect.x = mouseX;
                  break;
                case "bottomRight":
                  rect.width = mouseX - rect.x;
                  rect.height = mouseY - rect.y;
                  break;
                case "topCenter": // 上辺の中央
                  rect.height += rect.y - mouseY;
                  rect.y = mouseY;
                  break;
                case "bottomCenter": // 下辺の中央
                  rect.height = mouseY - rect.y;
                  break;
                case "leftCenter": // 左辺の中央
                  rect.width += rect.x - mouseX;
                  rect.x = mouseX;
                  break;
                case "rightCenter": // 右辺の中央
                  rect.width = mouseX - rect.x;
                  break;
              }
            };

            // 座標がポリゴン内にあるかどうか
            const isPointInPolygon = (coodsList, polyList) => {
              const poly = turf.polygon([polyList]);
              for (let i = 0; i < coodsList.length; i++) {
                const b = turf.booleanPointInPolygon(turf.point(coodsList[i]), poly);
                if (b === true) {
                  return true;
                }
              }
              return false;
            };

            // ドラッグ時のエラー処理
            const dragError = (errMsg) => {
              dragData.rect = null;
              console.log(errMsg);
              errorMsg.textContent = errMsg;
              chart.update();
              clearCurJunctionIcon();
              clearCurSectionLine();
              clearCurSectionIconObj();
            };

            // 頂点計算
            const calculateVertices = (x1, y1, x2, y2) => {
              const rectX = Math.min(x1, x2);
              const rectY = Math.min(y1, y2);
              const rectWidth = Math.abs(x1 - x2);
              const rectHeight = Math.abs(y1 - y2);
              return {
                topLeft: { x: rectX, y: rectY + rectHeight },
                topRight: { x: rectX + rectWidth, y: rectY + rectHeight },
                bottomLeft: { x: rectX, y: rectY },
                bottomRight: { x: rectX + rectWidth, y: rectY }
              };
            };

            // Mouse down event
            canvas.addEventListener("mousedown", (event) => {
              const rect = canvas.getBoundingClientRect();
              const mouseX = event.clientX - rect.left;
              const mouseY = event.clientY - rect.top;

              dragData.rect = null;
              chart.update();

              dragData.rect = { x: mouseX, y: mouseY, width: 0, height: 0 };
              dragData.isDragging = true;
              dragData.activeMarker = null;
            });

            // Mouse move event
            canvas.addEventListener("mousemove", (event) => {
              if (!dragData.isDragging || !dragData.rect) return;

              const rect = canvas.getBoundingClientRect();
              const mouseX = event.clientX - rect.left;
              const mouseY = event.clientY - rect.top;

              if (dragData.activeMarker) {
                updateRectangle(dragData.rect, dragData.activeMarker, mouseX, mouseY);
              } else {
                dragData.rect.width = mouseX - dragData.rect.x;
                dragData.rect.height = mouseY - dragData.rect.y;
              }

              updateRectangleCoords(dragData.rect, chart); // スケール変換後の座標を更新
              connectLandmark();

              chart.update();
            });

            // Mouse up event
            canvas.addEventListener("mouseup", () => {
              dragData.isDragging = false;
              dragData.activeMarker = null;

              updateRectangleCoords(dragData.rect, chart); // 最終スケール座標を更新

              // ドラッグアンドドロップをどの位置から始めても問題ないように対応
              const vertices = calculateVertices(
                rectangleCoords.value.topLeft.x,
                rectangleCoords.value.topLeft.y,
                rectangleCoords.value.bottomRight.x,
                rectangleCoords.value.bottomRight.y
              );

              // ドラッグアンドドロップで描いた四角形の座標が逸脱範囲内にあるかどうかを確認
              const ptTopLeft = turf.point([vertices.topLeft.x, vertices.topLeft.y]);
              const ptTopRight = turf.point([vertices.topRight.x, vertices.topRight.y]);
              const lastElement = parabolaCoordsTmp[parabolaCoordsTmp.length - 1];
              if (!(lastElement[0] === 0 && lastElement[1] === 0)) {
                // 始点と終点を一致させる
                parabolaCoordsTmp.push([0, 0]);
              }
              const polyParabolaCoords = turf.polygon([parabolaCoordsTmp]);
              const isPtInPolyTopLeft1 = turf.booleanPointInPolygon(ptTopLeft, polyParabolaCoords);
              const isPtInPolytopRight1 = turf.booleanPointInPolygon(ptTopRight, polyParabolaCoords);
              if (!(isPtInPolyTopLeft1 && isPtInPolytopRight1)) {
                dragError(rangeErrorMsg);
                return;
              }

              // 標高内にドラッグアンドドロップで描いた四角形の座標があるかどうかを確認
              const elevations = geoInfo['X'].map((value, index) => [value, geoInfo['altitudeY'][index]]);
              const elevationsLastElement = elevations[elevations.length - 1];
              // 標高を囲み、始点・終点を一致させる
              elevations.push([elevationsLastElement[0], 0]);
              elevations.push([0, 0]);
              elevations.unshift([0, 0]);
              // 四角形の下辺の座標作成
              // 下辺のみ確認すれば問題ないはず
              // x座標を整数で埋める
              const xStart = Math.ceil(vertices.bottomLeft.x); // 次の整数に切り上げ
              const xEnd = Math.floor(vertices.bottomRight.x);    // 小数点を切り捨て
              let bottom = [];
              // xの値を範囲内で増加させながら新たな座標を生成する
              for (let x = xStart; x <= xEnd; x++) {
                  // y座標は、2つの始点と終点で一定なので、任意のy座標を利用
                  bottom.push([x, vertices.bottomLeft.y]);
              }
              const isBottomElevations = isPointInPolygon(bottom, elevations);
              if (isBottomElevations === true) {
                dragError(elevationsErrorMsg);
                return;
              }

              // 地物内にドラッグアンドドロップで描いた四角形の座標があるかどうかを確認
              const features = geoInfo['X'].map((value, index) => [value, geoInfo['bldgY'][index]]);
              const featuresLastElement = features[features.length - 1];
              // 地物を囲み、始点・終点を一致させる
              features.push([featuresLastElement[0], 0]);
              features.push([0, 0]);
              features.unshift([0, 0]);
              const isBottomFeatures = isPointInPolygon(bottom, features);
              if (isBottomFeatures === true) {
                dragError(featuresErrorMsg);
                return;
              }

              // 矩形座標を結んだ線が最大落下許容範囲と交わっているかを確認
              if (rectWidth.value.length >= 1) {
                const i = rectWidth.value.length - 1; // ひとつ前の矩形座標を取得
                // 矩形座標を結んだ線がクロスしているかをチェック
                let lineChecked1;
                let lineChecked2;
                lineChecked1 = turf.lineString([[rectWidth.value[i][0][1], rectWidth.value[i][0][0]], [curRectWidth.value[0][1], curRectWidth.value[0][0]]]);
                lineChecked2 = turf.lineString([[rectWidth.value[i][1][1], rectWidth.value[i][1][0]], [curRectWidth.value[1][1], curRectWidth.value[1][0]]]);
                let tmpIntersect = turf.lineIntersect(lineChecked1, lineChecked2);
                if (tmpIntersect.features.length > 0) { // ラインがクロスしている場合はクロスしないようにラインを作成する
                  console.log(`line cross`);
                  lineChecked1 = turf.lineString([[rectWidth.value[i][0][1], rectWidth.value[i][0][0]], [curRectWidth.value[1][1], curRectWidth.value[1][0]]]);
                  lineChecked2 = turf.lineString([[rectWidth.value[i][1][1], rectWidth.value[i][1][0]], [curRectWidth.value[0][1], curRectWidth.value[0][0]]]);
                }
                for (let j =0; j < markerList.value.length - 1; j++) {
                  let fallToleranceRangeLine = turf.lineString([
                    [markerList.value[j][1], markerList.value[j][0]],
                    [markerList.value[j + 1][1], markerList.value[j + 1][0]]
                  ]);
                  let tmp1 = turf.lineIntersect(lineChecked1, fallToleranceRangeLine);
                  let tmp2 = turf.lineIntersect(lineChecked2, fallToleranceRangeLine);
                  if (tmp1.features.length > 0 || tmp2.features.length > 0) {
                    dragError(fallToleranceRangeErrorMsg);
                    return;
                  }
                }
              }
              errorMsg.textContent = '';
            });

            chart.dragData = dragData;
          },
          beforeDraw(chart: any) {
            const ctx = chart.ctx;
            const { rect } = chart.dragData;

            if (rect) {
              // 逸脱範囲矩形の描画
              ctx.save();
              ctx.fillStyle = "gray";
              ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
              ctx.restore();

              // 航路矩形の描画 (MVP2では 1m 内側)
              ctx.save();
              ctx.fillStyle = "lightgray";
              const scales = chart.scales
              let x;
              let y;
              let width;
              let height;
              
              if (rect.width > 0 && rect.height > 0) {
                x = scales.x.getValueForPixel(rect.x) + airwayMargin;
                y = scales.y.getValueForPixel(rect.y) - airwayMargin;
                width = scales.x.getValueForPixel(rect.width) - airwayMargin * 2;
                height = scales.y.getValueForPixel(rect.height) + airwayMargin * 2;
              } else if (rect.width > 0 && rect.height < 0) {
                x = scales.x.getValueForPixel(rect.x) + airwayMargin;
                y = scales.y.getValueForPixel(rect.y) + airwayMargin;
                width = scales.x.getValueForPixel(rect.width) - airwayMargin * 2;
                height = scales.y.getValueForPixel(rect.height) - airwayMargin * 2;
              } else if (rect.width < 0 && rect.height > 0) {
                x = scales.x.getValueForPixel(rect.x) - airwayMargin;
                y = scales.y.getValueForPixel(rect.y) - airwayMargin;
                width = scales.x.getValueForPixel(rect.width) + airwayMargin * 2;
                height = scales.y.getValueForPixel(rect.height) + airwayMargin * 2;
              } else {
                x = scales.x.getValueForPixel(rect.x) - airwayMargin;
                y = scales.y.getValueForPixel(rect.y) + airwayMargin;
                width = scales.x.getValueForPixel(rect.width) + airwayMargin * 2;
                height = scales.y.getValueForPixel(rect.height) - airwayMargin * 2;
              }
              x = scales.x.getPixelForValue(x);
              y = scales.y.getPixelForValue(y);
              width = scales.x.getPixelForValue(width);
              height = scales.y.getPixelForValue(height);
              ctx.fillRect(x, y, width, height);
              ctx.restore();

              // 矩形上の点の描画
              const markerPositions = [
                { x: rect.x, y: rect.y }, // Top left
                { x: rect.x + rect.width, y: rect.y }, // Top right
                { x: rect.x, y: rect.y + rect.height }, // Bottom left
                { x: rect.x + rect.width, y: rect.y + rect.height }, // Bottom right
                { x: rect.x + rect.width / 2, y: rect.y }, // Top center
                { x: rect.x + rect.width / 2, y: rect.y + rect.height }, // Bottom center
                { x: rect.x, y: rect.y + rect.height / 2 }, // Left center
                { x: rect.x + rect.width, y: rect.y + rect.height / 2 }, // Right center
                { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }, // Center
              ];
              ctx.fillStyle = "black";
              ctx.strokeStyle = "black";
              ctx.lineWidth = 1;
              const markerSize = 4;
              markerPositions.forEach((marker) => {
                ctx.fillRect(marker.x - markerSize / 2, marker.y - markerSize / 2, markerSize, markerSize);
                ctx.strokeRect(marker.x - markerSize / 2, marker.y - markerSize / 2, markerSize, markerSize);
              });
            }
          },
        };

        if (chart.value) {
          chart.value.destroy();
        }
        chart.value = new Chart(chartCanvas.value, {
          type: 'line',
          data: {
            labels: geoInfo['X'],
            datasets: [{
              label: '標高',
              data: geoInfo['altitudeY'],
              tension: 0,
              borderColor: 'dimgray',
              backgroundColor: "dimgray",
              borderWidth: 2,
              fill: true,
            },{
              label: '地物',
              data: geoInfo['bldgY'],
              tension: 0,
              borderColor: '#000000',
              backgroundColor: "#000000",
              borderWidth: 2,
              fill: true,
            },],
          },
          options: {
            layout: {
              padding: {
                top: 30,
                left: 30,
                bottom: 100,
                right: 30
              },
            },
            scales: {
              x: {
                type: "linear",
                min: 0,
                max: Math.floor(dist),
                ticks: {
                  callback: function(value, index, ticks) {
                    if (Number.isInteger(value)) {
                      return value + 'm';
                    }
                    return '';
                  },
                  stepSize: 100,
                }
              },
              y: {
                type: "linear",
                beginAtZero: true,
                min: 0, // Y軸最小値
                max: Math.floor(maxParabolaHeight) + chartMarginY, // Y軸最大
                ticks: {
                  callback: function(value, index, ticks) {
                    if (Number.isInteger(value)) {
                      return value + 'm';
                    }
                    return '';
                  },
                  stepSize: 100 // 目盛り間隔
                }
              }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              }
            },
            elements: {
              line: {
                tension: 0.4,  // 曲線の角度
              },
              point: {
                radius: 0,  // プロットを非表示にする
                backgroundColor: '#42A5F5',  // 背景色
                borderColor: '#42A5F5',  // 枠線色
              },
            },
          },
          plugins: [flightAreaPlugin, dragPlugin, textPlugin]
        });
      }
    };

    const div1 = ref(null);
    const createChartWindow = async (map: any) => {
      const customControl = L.Control.extend({
        onAdd: function(map) {
          div1.value = L.DomUtil.create('div', 'custom-control');
          // 親
          div1.value.style.position = 'absolute';
          div1.value.style.left = '10px';
          div1.value.style.bottom = '50px';
          div1.value.style.width = '50dvh';
          div1.value.style.height = '65dvh';
          div1.value.style.backgroundColor = '#FFFFFF';
          div1.value.style.border = '1px solid #000000';
          div1.value.id = "div1";
          L.DomEvent.disableClickPropagation(div1.value);

          const title = document.createElement('div');
          title.innerText = '航路点';
          title.style.textAlign = 'left';
          title.style.marginTop = "10px";
          title.style.marginLeft = "77px";
          div1.value.appendChild(title);
          LDN_Setting = document.createElement('div');
          LDN_Setting.setAttribute("class", "LDN_Setting");
          LDN_Setting.id = "LDN_Setting";
          div1.value.appendChild(LDN_Setting);
          chartlabel = document.createElement('div');
          chartlabel.innerText = '高度・幅設定';
          chartlabel.style.fontSize='1rem';
          chartlabel.style.textAlign = 'left';
          chartlabel.style.marginTop = "10px";
          chartlabel.style.marginLeft = "30px";
          div1.value.appendChild(chartlabel);
          errorMsg = document.createElement('span');
          errorMsg.textContent = '';
          errorMsg.style.marginLeft = "30px";
          errorMsg.style.color = 'red';
          chartlabel.appendChild(errorMsg);
          chartCanvas.value = document.createElement('canvas');
          div1.value.appendChild(chartCanvas.value);
          
          l_map.value = map;
          return div1.value;
        }
      });
      const control = new customControl({ position: 'bottomleft' });
      control.addTo(map);
      controlList.push(control);
    }

    // ランドマーク接続
    function connectLandmark() {
      // ランドマークが一つの時は接続不可
      if (landmarkNumbers.value.length < 1) {
        return;
      }
      const i = landmarkNumbers.value.length -1;
      // 航路区画を計算
      curSectionName = `A-${i+1}`;
      const middlePoint = [
        (landmarkNumbers.value[i][0] + curLandmark[0]) / 2,
        (landmarkNumbers.value[i][1] + curLandmark[1]) / 2,
      ];
      // 航路区画表示
      if (curSectionLine.value !== null) {
        l_map.value.removeLayer(curSectionLine.value);
      }
      curSectionLine.value = L.polyline(
        [
          [landmarkNumbers.value[i][0], landmarkNumbers.value[i][1]],
          [curLandmark[0], curLandmark[1]]
        ],
        {
          color: "#E0E0E0",
          weight: lineWeight_i,
          fill: true,
          fillColor: "#E0E0E0"
        }
      ).addTo(l_map.value); 
      // 航路区画Icon表示
      // 1文字のサイズ(px)
      const fontSize = 12
      // sectionNameの長さを取得
      const sectionNameLen = curSectionName.length;
      // 長さに基づいて横幅を計算
      const boxWidth = sectionNameLen * fontSize + fontSize; // px単位
      // 長さに基づいて縦幅を計算
      const boxHeight = fontSize * 2; // px単位
      let html = `
        <div style="
          background-color: white;
          font-size: ${fontSize}px;
          font-weight: bold;
          display: flex;
          width:${boxWidth}px;
          justify-content: center; // 水平揃え
          height: ${boxHeight}px;
          align-items: center;     // 垂直揃え
        ">
          <p>${curSectionName}</p>
        </div> 
      `;
      let sectionIcon = L.divIcon({
        html: html
      });
      if (curSectionIconObj.value !== null) {
        l_map.value.removeLayer(curSectionIconObj.value);
      }
      curSectionIconObj.value = L.marker(middlePoint, {icon: sectionIcon}).addTo(l_map.value);
    }

    // ジャンクション設定
    const settingLandmark = async () => {
      const LDN_name_elem = document.getElementById("LandMarkName");
      if (LDN_name_elem === null || LDN_name_elem.value === '') {
        errorMsg.textContent = '航路点名を入力してください。';
        console.log("航路点名を入力してください。");
        return;
      }
      if (curRectWidth.value.length != 0) {
        landmarkNumbers.value.push(curLandmark);
        
        settingFlag.value = true;
        const deviation = [
          [lat1, lng1, topHeight],
          [lat1, lng1, bottomHeight],
          [lat2, lng2, bottomHeight],
          [lat2, lng2, topHeight],
          [lat1, lng1, topHeight],
        ];
        const airway = [
          [lat1Airway, lng1Airway, topHeight - airwayMargin],
          [lat1Airway, lng1Airway, bottomHeight + airwayMargin],
          [lat2Airway, lng2Airway, bottomHeight + airwayMargin],
          [lat2Airway, lng2Airway, topHeight - airwayMargin],
          [lat1Airway, lng1Airway, topHeight - airwayMargin],
        ]

        let Corridor_Point_JSON = {};
        Corridor_Point_JSON.LDN_name = LDN_name_elem.value;
        Corridor_Point_JSON.LDN_coordinates = deviation;
        Corridor_Point_JSON.LDN_airway_coordinates = airway;
        corridor_points.push(Corridor_Point_JSON);

        // 一個目の矩形のみ座標が逆回りになっているかチェックし修正する
        // 二個目以降の断面図は進行方向に見る向きで揃えているのでずれない
        if (corridor_points.length == 2) {
          // 左上同士を結んだ直線と右上同士を結んだ直線が交差するかチェック
          const coordTopRight = corridor_points[1]['LDN_coordinates'][3];
          const coordTopLeft = corridor_points[1]['LDN_coordinates'][0];
          const FirstCoordTopRight = corridor_points[0]['LDN_coordinates'][3];
          const FirstCoordTopLeft = corridor_points[0]['LDN_coordinates'][0];
          const leftLine = turf.lineString(
            [
              [coordTopLeft[1], coordTopLeft[0]],
              [FirstCoordTopLeft[1], FirstCoordTopLeft[0]]
            ]
          );
          const rightLine = turf.lineString(
            [
              [coordTopRight[1], coordTopRight[0]],
              [FirstCoordTopRight[1], FirstCoordTopRight[0]]
            ]
          );

          // 逆回りなので要調整
          if (turf.booleanIntersects(leftLine, rightLine)) {
            console.log('reverse!');
            const tmpFirstCoords = structuredClone(corridor_points[0]);
            corridor_points[0]['LDN_coordinates'][0] = tmpFirstCoords['LDN_coordinates'][3];
            corridor_points[0]['LDN_coordinates'][1] = tmpFirstCoords['LDN_coordinates'][2];
            corridor_points[0]['LDN_coordinates'][2] = tmpFirstCoords['LDN_coordinates'][1];
            corridor_points[0]['LDN_coordinates'][3] = tmpFirstCoords['LDN_coordinates'][0];
            corridor_points[0]['LDN_coordinates'][4] = tmpFirstCoords['LDN_coordinates'][3];
            corridor_points[0]['LDN_airway_coordinates'][0] = tmpFirstCoords['LDN_airway_coordinates'][3];
            corridor_points[0]['LDN_airway_coordinates'][1] = tmpFirstCoords['LDN_airway_coordinates'][2];
            corridor_points[0]['LDN_airway_coordinates'][2] = tmpFirstCoords['LDN_airway_coordinates'][1];
            corridor_points[0]['LDN_airway_coordinates'][3] = tmpFirstCoords['LDN_airway_coordinates'][0];
            corridor_points[0]['LDN_airway_coordinates'][4] = tmpFirstCoords['LDN_airway_coordinates'][3];
          }
        }

        LandmarkIconList.push(curJunctionIcon.value);
        sectionLineList.push(curSectionLine.value);
        sectionIconList.push(curSectionIconObj.value);
        curJunctionIcon.value = null;
        curSectionLine.value = null;
        curSectionIconObj.value = null;
        // データ送信
        if (curSectionName !== "") {
          // 航路点が1つの場合空となるため
          LDN_section_name_list.push(curSectionName);
        }
        curSectionName = "";
        resJSON.corridor_points = corridor_points;
        resJSON.corridor_sections = LDN_section_name_list;
        resJSON.determination_id = determinationId;
        resJSON.despersion_nodes = despersionNodes;
        clearArrow();
        // ジャンクションを結ぶ線が1つ以上(ジャンクションが2つ以上)設定されている場合のみデータ送信
        if (0 < LDN_section_name_list.length) {
          sendData();
          emit('isJunctionSetting', true);
        }
      } else {
      }
    }

    // ジャンクションのIconクリア
    const clearLandmarkIcon = () => {
      for (let i = 0; i < LandmarkIconList.length; i++) {
        l_map.value.removeLayer(LandmarkIconList[i]);
      }
      LandmarkIconList = [];
    }

    // 航路区間のIconクリア
    const clearsectionIcon = () => {
      for (let i = 0; i < sectionIconList.length; i++) {
        if (sectionIconList[i] === null) {
          continue;
        }
        l_map.value.removeLayer(sectionIconList[i]);
      }
      sectionIconList = [];
    }

    // クリックした点のIconクリア
    const clearClickIcon = () => {
      for (let i = 0; i < clickIconList.length; i++) {
        if (clickIconList[i] === null) {
          continue;
        }
        l_map.value.removeLayer(clickIconList[i]);
      }
      clickIconList = [];
    }

    // 直線のクリア
    const clearLine = () => {
      for (let i = 0; i < lineList.length; i++) {
        l_map.value.removeLayer(lineList[i]);
      }
      lineList = [];
    }

    // 航路区画直線のクリア
    const clearSectionLine = () => {
      for (let i = 0; i < sectionLineList.length; i++) {
        if (sectionLineList[i] === null) {
          continue;
        }
        l_map.value.removeLayer(sectionLineList[i]);
      }
      sectionLineList = [];
    }

    // グラフのクリア
    const clearControl = () => {
      for (let i = 0; i < controlList.length; i++) {
        l_map.value.removeControl(controlList[i]);
      }
      controlList = [];
    }

    // 断面図の向きアイコンをクリア
    const clearArrow = () => {
      for (let i = 0; i < arrowList.length; i++) {
        l_map.value.removeLayer(arrowList[i]);
      }
      arrowList = [];
    }

    // カレントのジャンクションアイコンをクリア
    const clearCurJunctionIcon = () => {
      if (curJunctionIcon.value !== null) {
        l_map.value.removeLayer(curJunctionIcon.value);
      }
      curJunctionIcon.value = null;
    }

    // カレントの航路区画直線をクリア
    const clearCurSectionLine = () => {
      if (curSectionLine.value !== null) {
        l_map.value.removeLayer(curSectionLine.value);
      }
      curSectionLine.value = null;
    }

    // カレントの航路区間のIconクリア
    const clearCurSectionIconObj = () => {
      if (curSectionIconObj.value !== null) {
        l_map.value.removeLayer(curSectionIconObj.value);
      }
      curSectionIconObj.value = null;
    }

    // クリアボタン押下時の処理
    const clearSetting = () => {

      if (!LDN_Setting) {
          console.error("LDN_Setting is null or undefined.");
          return;
      }
      div1.value.removeChild(LDN_Setting); 
      LDN_Setting = document.createElement('div');
      LDN_Setting.setAttribute("class", "LDN_Setting");
      LDN_Setting.id = "LDN_Setting";
      div1.value.appendChild(LDN_Setting);

      if (!chartlabel) {
          console.error("chartlabel is null or undefined.");
          return;
      }
      div1.value.removeChild(chartlabel);
      chartlabel = document.createElement('div');
      chartlabel.innerText = '航路設定';
      chartlabel.style.textAlign = 'left';
      chartlabel.style.marginTop = "10px";
      chartlabel.style.marginLeft = "30px";
      div1.value.appendChild(chartlabel);

      if (!chartCanvas.value) {
          console.error("chartCanvas.value is null or undefined.");
          return;
      }    
      div1.value.removeChild(chartCanvas.value);
      chartCanvas.value = document.createElement('canvas');
      div1.value.appendChild(chartCanvas.value);

      rectWidth.value = [];
      curRectWidth.value = [];
      curLine.value = [];
      curIntersections.value = [];
      despersionNodes = [];
      lines.value = [];
      landmarkNumbers.value = [];
      intersections.value = [];
      corridor_points = [];
      curLandmark = [];
      LandmarkIndex = 0;
      LDN_section_name_list = [];
      clearCurJunctionIcon();
      clearCurSectionLine();
      clearCurSectionIconObj();
      clearLandmarkIcon();
      clearsectionIcon();
      clearClickIcon();
      clearLine();
      clearSectionLine();
      clearControl();
      clearArrow();
      resJSON = {};
      emit('update-data', resJSON);
      emit('isJunctionSetting', false);
    }

    // 子から親へ値を渡す
    const sendData = () => {
      // resJSONが空でないことをチェック
      if (Object.keys(resJSON).length > 0) {
        console.log("Emitting data to parent: ", resJSON);
        emit('update-data', resJSON);
      } else {
      }
    }

    return {
      sendData,
      settingLandmark,
      clearSetting,
      map_moveend,
      MapLayerControlMounted,
      l_map
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
      this.MapLayerControlMounted = false;
      console.log(`MapLayerControl_Mounted: ${this.MapLayerControlMounted}`);
    }
  }
};
</script>

<style>
#createAirwayMap {
  width: 100%;
  height: 100%;
  z-index: 0;
}
.grayscale-map .leaflet-tile {
  filter: grayscale(100%);
}
.custom-control {
  position: absolute;
  left: 10px;
  bottom: 50px;
  width: 30dvh;
  height: 50dvh;
  background-color: #FFFFFF;
  border: 1px solid #000;
  z-index: 1000;
}
.control-window {
  display: flex;
}
.area-control {
  position: absolute;
  top: 20px;
  right: 200px;
  z-index: 1000;
  font-size: 0.8rem;
  line-height: 2em;
  margin: 0;
  padding: 10px;
  text-align: center;
  border-width: 1px;
  border-style: solid;
  border-color: #000000;
  background-color: #FFFFFF;
}
.layer-control-top-right {
  position: absolute;
  top: 0px;
  right: 20px;
  z-index: 1000;
  font-size: 0.8rem;
  line-height: 2em;
  margin: 0;
  padding: 10px;
}
.LDN_Setting {
  padding-top: 10px;
  padding-left: 30px;
  display: flex;
  flex-direction: row;
}
.legend-bottom-left {
  position: absolute;
  bottom: 20px;
  left: 10px;
  z-index: 1000;
  font-size: 0.8rem;
  line-height: 2em;
  margin: 0;
  padding: 10px;
}
</style>