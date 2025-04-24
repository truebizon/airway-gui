<template>
  <div id="leafletMap" style="height:76.5dvh; position: relative;">
    <div class="layer-control-top-right">
      <MapProhibitedAreaControl :map="l_map" :map_moveend="map_moveend"></MapProhibitedAreaControl>
      <MapLayerControl :stepNo="stepNo" :map="l_map" :map_moveend="map_moveend" @Weather_Changeed="handleWeatherChanged" @MapLayerControl_Mounted="handleMapLayerControlMounted"></MapLayerControl>
    </div>
    <div class="legend-bottom-left">
      <MapLegend />
    </div> 
  </div>
</template>

<script setup lang="js">
  import "leaflet/dist/leaflet.css";
  import { ref, onMounted } from "vue";
  import iconUrl from "../assets/css/img/dummyImg/dummy_legendIcon_waypoint.svg";
  import MapLayerControl from '../mapLayerControl.vue';
  import MapProhibitedAreaControl from '../mapProhibitedAreaControl.vue';

  const props = defineProps({
    area: {
      type: String,
      required: true,
    },
    areaInfo: {
      type: Object,
      required: true,
    },
    rangeId: {
      type: String,
      required: true,
    },
    rangeInfo: {
      type: Object,
      required: true,
    },
    stepNo: {
      type: String,
      required: true,
    }
  });

  const l_map = ref(null);
  const map_moveend = ref(false);
  let centerInit = [useRuntimeConfig().public.centerInitLat, useRuntimeConfig().public.centerInitLon];
  let outerLatLangs = [[-90,-180],[-90,180],[90,180],[90,-180]]; //範囲外をグレーアウトする
  let insideLatLangs = [];
  let polygon = [];
  let zoomInit = 16;

  const MapLayerControlMounted = ref(true);
  const stepNo = ref(props.stepNo);

  // 天候情報の変更完了ハンドラ
  const handleWeatherChanged = (changeed) => {
    console.log(`map_moveend: ${map_moveend.value}.`);
    console.log(`Weather_Changeed: ${changeed}`);
    map_moveend.value = false;
  }

  // MapLayerControl Mounted 完了ハンドラ
  const handleMapLayerControlMounted = (Mounted) => {
    console.log(`MapLayerControl_Mounted: ${Mounted}`);
    MapLayerControlMounted.value = false;
    console.log(`MapLayerControl_Mounted: ${MapLayerControlMounted.value}`);
  }

  onMounted(async () => {
    const leafletModule = await import('leaflet');
    const L = leafletModule.default;
    
    console.log("ShowFallToleranceRange mounted.");
    // create basemap layer
    l_map.value = L.map('leafletMap', {
      center: centerInit,
      zoom: zoomInit,
      scrollWheelZoom: false,
    });
    console.log("Create l_map");

    L.tileLayer(
      useRuntimeConfig().public.mapTileUrl,
      {
        className: "grayscale-map",
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
      }
    ).addTo(l_map.value);
    console.log("Set tileLayer");

    l_map.value.zoomControl.setPosition('topleft');

    // 最大落下許容範囲をすべて表示
    props.rangeInfo['fallToleranceRanges'].forEach((range) => {
      let markerList = [];
      if (range['geometry']['coordinates'].length) {
          range['geometry']['coordinates'][0].forEach((coord) => {
            markerList.push([coord[1], coord[0]]);
          })
        insideLatLangs.push(markerList)
      }
    });
    polygon.push(insideLatLangs);
    polygon.push(outerLatLangs);
    L.polygon(polygon, {
      color: "#D3D3D3",
      opacity: 0,
      fillOpacity: 0.6
    }).addTo(l_map.value);
    
    await drawAirLine();

    l_map.value.on('moveend', async (event) => {
      console.log(`MapLayerControlMounted: ${MapLayerControlMounted.value}`);
      if (!MapLayerControlMounted.value) {
        console.log(`map moved:${event}`);
        map_moveend.value = true;
        await drawAirLine();
      }
    });
  })

  // エリアにフォーカス
  watch(() => props.area, (newData) => {
    console.log(newData);
    
    // エリアの座標を特定する
    props.areaInfo.areas.forEach((area) => {
      if (area.name === newData) {
        centerInit = [area.geometry.coordinates[1], area.geometry.coordinates[0]];
        l_map.value.setView(centerInit);
      }
    })
  })

  // 最大落下許容範囲にフォーカス
  watch(() => props.rangeId, (newData) => {
    console.log(newData);
    
    // 最大落下許容範囲を特定する
    props.rangeInfo['fallToleranceRanges'].forEach((range) => {
      if (range['fallToleranceRangeId'] === newData) {
        let markerList = [];
        if (range['geometry']['coordinates'].length) {
          range['geometry']['coordinates'][0].forEach((coord) => {
            markerList.push([coord[1], coord[0]]);
          })
          l_map.value.fitBounds(markerList);
        }
      }
    });
  });

  async function drawAirLine() {

    const bounds = l_map.value.getBounds();
    const northwest = bounds.getNorthWest();
    const southeast = bounds.getSouthEast();

    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const airwayUrl = `${airwayApiBaseUrl}/airway-list`;

    const left = northwest.lng;
    const right = southeast.lng;
    const upper = northwest.lat;
    const lower = southeast.lat;

    const data = {
      point1:  `${left},${lower}`,
      point2:  `${right},${lower}`,
      point3:  `${right},${upper}`,
      point4:  `${left},${upper}`
    }

    const airwayRes = await axios_get(airwayUrl, data, {});
    console.log(airwayRes);
    if(airwayRes.status !== 200) {
      return;
    }

    const airwayData = useAirwayConvertConnectionOrder(airwayRes.data);
    for(let i=0; i<airwayData.airway.airways.length; i++){
      // 座標を格納するリスト
      const allCoordinates = [];
      const normalData = { ...airwayData.airway.airways[i] };
      // 座標を抽出
      normalData.airwayJunctions.forEach((point) => {
        point["airways"].forEach((coordinates) => {
          const coords = coordinates["airway"]["geometry"]["coordinates"];
          if (Array.isArray(coords)) {
            allCoordinates.push(coords);
          }
        });
      });
      
      // ポリライン用の座標を計算（平均座標を使用）
      const polyline = [];
      let count = 0;
      allCoordinates.forEach((coords) => {
        let x = 0;
        let y = 0;
        // 矩形の座標は 5 点だが、計算に使うのは 4 点
        for (let i = 0; i < 4; i++) {
          if (coords[i][1] !== undefined && coords[i][0] !== undefined) {
            x += coords[i][1];
            y += coords[i][0];
          }
        }
        x /= 4;
        y /= 4;

        polyline.push([x, y]);
        count += 1;
      });

      // 地図にポリラインを描画
      if (polyline.length > 0) {
        L.polyline(polyline, {
          color: "#000000",
          weight: 8
        }).addTo(l_map.value);

        L.polyline(polyline, {
          color: "#FFFFFF",
          weight: 7
        }).addTo(l_map.value);
      }
      polyline.forEach(markerCoords => {
        const icon = L.icon({
          iconUrl,
          iconSize: [15, 15],
        });
        L.marker(markerCoords, { icon }).addTo(l_map.value);
      });
    }  
  }

</script>

<style>
.grayscale-map .leaflet-tile {
  filter: grayscale(100%);
}
.layer-control-top-right {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  font-size: 0.8rem;
  line-height: 2em;
  margin: 0;
  padding: 10px;
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