<template>
    <div :id="changedId" style="height: 100%;">
      <div v-if="showCheckBox" class="layer-control-top-right">
        <<MapProhibitedAreaControl :map="map" :map_moveend="map_moveend"></MapProhibitedAreaControl>
        <MapLayerControl :stepNo="stepNo" :map="map" :map_moveend="map_moveend" @Weather_Changeed="handleWeatherChanged" @MapLayerControl_Mounted="handleMapLayerControlMounted"></MapLayerControl>
      </div>
      <div v-if="showLegend" class="legend-bottom-left">
        <MapLegend />
      </div>
      <div id="selectAirwayFromList" class="map-select-airway-from-list"></div>
    </div>
  </template>
  
  <script>
  // 必要なモジュールをインポート
  import 'leaflet/dist/leaflet.css';
  import starticonUrl from '../assets/css/img/dummyImg/svg_airwaySectionStart.svg';
  import goaliconUrl from '../assets/css/img/dummyImg/svg_airwaySectionGoal.svg';
  import porticonUrl from '../assets/css/img/dummyImg/dummy_circle-dot-regular.svg';
  import { ref, onMounted, watch, computed } from 'vue'; // Vue 3 の Composition API
  import MapLayerControl from '../mapLayerControl.vue';
  import MapProhibitedAreaControl from '../mapProhibitedAreaControl.vue';

export default {
  components: {
    MapLayerControl,
    MapProhibitedAreaControl,
  },
  props: {
    airwayId: {
      type: String,
      required: true,
    },
    airwayData: {
      type: Object,
      required: true,
    },
    chartData: {
      type: Object,
      required: false,
    },
    section: {
      type: String,
      required: false,
    },
    showCheckBox: {
      type: Boolean,
      required: true,
    },
    showLegend: {
      type: Boolean,
      required: true,
    },
    showMarker: {
      type: Boolean,
      required: true,
    },
    id: {
      type: String,
      required: false,
    },
    departurePort: {
      type: Array,
      required: false,
    },
    arrivalPort: {
      type: Array,
      required: false,
    },
    portData: {
      type: Object,
      required: false,
    },
    area: {
      type: String,
      required: true,
    },
    areaInfo: {
      type: Object,
      required: true,
    },
    stepNo: {
      type: String,
      required: true,
    },
  },
  emits: ['update:isEndIdFirst'],
  setup(props, { emit }) {
    const map = ref(null);  // 地図インスタンス
    const map_moveend = ref(false); // チェックボックス部品に渡す変数
    let L;  // Leafletライブラリのインスタンス

    const changedId = computed(() => {
      return props.id ? `mapShowAirwayReservationConfirmation${props.id}` : 'mapShowAirwayReservationConfirmation';
    });

    const airwayData = ref([]); // APIから取得した航路データ

    const MapLayerControlMounted = ref(true);

    // ページから渡された JSON をセットする
    const setAirwayData = async () => {
      airwayData.value = props.airwayData.airway;
    };
  
    // 地図を描画する非同期関数
    const renderMap = async (data, section, id) => {
      if (process.client) {  // クライアントサイドでのみ実行
        if (map.value) {
          // 既存の地図を削除
          map.value.remove();
          map.value = null; // mapインスタンスをリセット
        }
        // Leaflet モジュールを非同期でインポート
        const leafletModule = await import('leaflet');
        L = leafletModule.default;

        const container = L.DomUtil.get(changedId.value);
        if (container != null) {
        container._leaflet_id = null; // 既存のマップコンテナをリセット
        }
  
        // 地図を初期化
        map.value = L.map(changedId.value, {
          scrollWheelZoom: false,  // ホイールズームを無効化
        });

        // 国土地理院のタイルレイヤーを追加
        L.tileLayer(
          useRuntimeConfig().public.mapTileUrl,
          {
            className: "grayscale-map",
            attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
          }
        ).addTo(map.value);
  
        map.value.zoomControl.setPosition('topleft');
        
        // チェックボックス部品に渡す変数
        map.value.on('moveend', (event) => {
          console.log(`MapLayerControlMounted: ${MapLayerControlMounted.value}`);
          if (!MapLayerControlMounted.value) {
            console.log(`map moved:${event}`);
            map_moveend.value = true;
          }
        });
  
        // 座標を格納するリスト
        const allCoordinates = [];
        const sectionInfo = [];
        let isEndIdFirst = false;

        const sections = section ? section.split("~") : [];
        const start = sections[0]?.trim();
        const end = sections[1]?.trim();
        let FIND_START = false;

        // 航路JSONデータから座標を抽出
        data['airway']['airways'].forEach((airwayData) => {
          let startId = "";
          let endId = "";
          if (airwayData.airwayId === id) {
            airwayData.airwayJunctions.forEach((airwayJunction) => {
              if (airwayJunction.airwayJunctionName === start) {
                startId = airwayJunction.airwayJunctionId;
              } else if (airwayJunction.airwayJunctionName === end) {
                endId = airwayJunction.airwayJunctionId;
              }
            });
        
          // startIdとendIdの順序に応じて処理を切り替える
            if (airwayData.airwayJunctions.findIndex(j => j.airwayJunctionId === startId) > airwayData.airwayJunctions.findIndex(j => j.airwayJunctionId === endId)) {
              // endIdの方が先にヒットした場合
              isEndIdFirst = true;
              airwayData.airwaySections.forEach((section) => {
                // IDから黒線を描画する場所を取得
                if (section["airwayJunctionIds"][0] === endId) {
                  if (startId != '') {
                    FIND_START = true;
                  }
                }
                sectionInfo.push(FIND_START);

                if (section["airwayJunctionIds"][1] === startId) {
                  FIND_START = false;
                }

                // 航路順に座標データをpush
                section.airwayJunctionIds.forEach((id) => {
                  airwayData.airwayJunctions.forEach((point) => {
                    if (point.airwayJunctionId === id) {
                      const coords = point.airways[0].airway.geometry.coordinates;
                      if (Array.isArray(coords)) {
                        allCoordinates.push(coords);
                      }
                    }
                  });
                });
              });
            } else {
              // startIdの方が先にヒットした場合
              airwayData.airwaySections.forEach((section) => {
                // IDから黒線を描画する場所を取得
                if (section["airwayJunctionIds"][0] === startId) {
                  if (endId != '') {
                    FIND_START = true;
                  }
                }
                sectionInfo.push(FIND_START);

                if (section["airwayJunctionIds"][1] === endId) {
                  FIND_START = false;
                }

                // 航路順に座標データをpush
                section.airwayJunctionIds.forEach((id) => {
                  airwayData.airwayJunctions.forEach((point) => {
                    if (point.airwayJunctionId === id) {
                      const coords = point.airways[0].airway.geometry.coordinates;
                      if (Array.isArray(coords)) {
                        allCoordinates.push(coords);
                      }
                    }
                  });
                });
              });
            }
          }
        });
        emit('update:isEndIdFirst', isEndIdFirst);

        // ポリライン用の座標を計算（平均座標を使用）
        const polyline = [];
        const polylineCoords = [];
        const blackLine = [];
        
        const junctionNames = [];
        data['airway']['airways'].forEach((airwayData) => {
          if (airwayData.airwayId === id) {
            airwayData.airwayJunctions.forEach((junction) => {
              junctionNames.push(junction.airwayJunctionName);
            });
          }
        });

        let count = 0;
        allCoordinates.forEach((coords, idx) => {
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

          let junctionName;
          if (idx === 0) {
            junctionName = junctionNames[0]; // 最初の値はjunctionNamesの0番目
          } else if (idx === allCoordinates.length - 1) {
            junctionName = junctionNames[junctionNames.length - 1]; // 最後の値はjunctionNamesの最後
          } else {
            const junctionIndex = Math.floor((idx - 1) / 2) + 1;
            junctionName = junctionNames[junctionIndex]; // その間の値はjunctionNamesの値を2回ずつ
          }

          polyline.push([x, y, junctionName]);
          polylineCoords.push([x, y]); // ポリライン用の座標を追加
          const index = Math.floor(count / 2);
          if (sectionInfo[index] === true) {
            blackLine.push([x, y]);
          }
          count += 1;
        });
  
        // 地図にポリラインを描画
        if (polylineCoords.length > 0) {
          L.polyline(polylineCoords, {
            color: 'black',
            weight: 12,
            opacity: 1,
          }).addTo(map.value);

          L.polyline(polylineCoords, {
            color: 'white',
            weight: 10,
            opacity: 1,
          }).addTo(map.value);

          L.polyline(blackLine, {
            color: 'black',
            weight: 5,
            opacity: 1,
          }).addTo(map.value);
        }
  
        // 各座標にマーカーを追加（CircleMarker）
        polyline.forEach((coord) => {
          if (coord[1] !== undefined && coord[0] !== undefined) {
            const marker = L.circleMarker([coord[0], coord[1]], {
              radius: 5,
              color: 'black',
              fill: true,
              fillColor: 'white',
              fillOpacity: 0.6,
            }).addTo(map.value);
            marker.bindPopup(coord[2]); 
            marker.on('click', () => {
              marker.openPopup(); 
              });
          }
        });
  
        // 予約区画の始点と終点にマーカーを追加（Marker & Icon）
        if (props.showMarker) {
          if (isEndIdFirst) {
          var startIcon = L.icon({
            iconUrl: goaliconUrl,
            iconSize: [35, 35],
            iconAnchor: [17, 36],
          });
          var goalIcon = L.icon({
            iconUrl: starticonUrl,
            iconSize: [35, 35],
            iconAnchor: [17, 36],
          });
          }else{
          var startIcon = L.icon({
            iconUrl: starticonUrl,
            iconSize: [35, 35],
            iconAnchor: [17, 36],
          });
          var goalIcon = L.icon({
            iconUrl: goaliconUrl,
            iconSize: [35, 35],
            iconAnchor: [17, 36],
          });
          }
          for (let i = 0; i < blackLine.length; i++) {
            if (i == 0) {
              L.marker(blackLine[i], { icon: startIcon }).addTo(map.value);
            } else if (i == blackLine.length - 1) {
              L.marker(blackLine[i], { icon: goalIcon }).addTo(map.value);
            }
          }
        }
        // 地図をズームして範囲を調整
        if (polylineCoords.length > 0) {
          map.value.fitBounds(polylineCoords);
        }
      }
      if (props.portData && props.portData.data) {
      const portDegrees = props.portData.data.map(port => [port.lat, port.lon, port.dronePortName]);
      console.log(portDegrees);
      const portIcon = L.icon({ iconUrl: porticonUrl, iconSize: [15, 15] });
      portDegrees.forEach(coords => {
          const marker = L.marker([coords[0], coords[1]], { icon: portIcon }).addTo(map.value);
          marker.bindPopup(coords[2]); // ポップアップをバインド
          marker.on('click', () => {
            marker.openPopup(); // ポップアップを開く
          });
        });
      }
    };

    // 親から chartData が変更された時に再描画
    
    watch(() => props.chartData, (newData) => {
      renderMap(newData, props.section, props.airwayId);
    });

    watch(() => props.section, (newData) => {
      renderMap(props.chartData, newData, props.airwayId);
    });

    watch(() => props.airwayId, (newData) => {
      renderMap(props.chartData, props.section, newData);
    });

      // エリアにフォーカス
    watch(() => props.area, (newData) => {
      console.log(newData);
    
      // エリアの座標を特定して移動
      props.areaInfo.areas.forEach((area) => {
        if (area.name === newData) {
          const centerInit = [area.geometry.coordinates[1], area.geometry.coordinates[0]];
          map.value.setView(centerInit, 15);
          renderMapflg.value = true;
        }
      })
    })

    // 初期描画処理
    onMounted(async () => {
      await setAirwayData();
      renderMap(props.chartData || props.airwayData, props.section, props.airwayId);
    });

    return { map, map_moveend, MapLayerControlMounted, changedId };
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
  },
};
</script>

<style scoped>
.grayscale-map {
  filter: grayscale(100%)!important;
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
.map-select-airway-from-list {
  height: calc(100dvh - 300px);
}
</style>