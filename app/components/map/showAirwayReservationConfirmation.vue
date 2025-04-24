<template>
  <div :id="changedId" style="height: 100%;">
    <div v-if="showCheckBox" class="layer-control-top-right">
      <MapProhibitedAreaControl :map="map" :map_moveend="map_moveend"></MapProhibitedAreaControl>
      <MapLayerControl :stepNo="stepNo" :map="map" :map_moveend="map_moveend" @Weather_Changeed="handleWeatherChanged" @MapLayerControl_Mounted="handleMapLayerControlMounted"></MapLayerControl>
    </div>
    <div v-if="showLegend" class="legend-bottom-left">
      <MapLegend />
    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import starticonUrl from '../assets/css/img/dummyImg/svg_airwaySectionStart.svg';
import goaliconUrl from '../assets/css/img/dummyImg/svg_airwaySectionGoal.svg';
import porticonUrl from '../assets/css/img/dummyImg/dummy_circle-dot-regular.svg';
import { ref, onMounted, computed } from 'vue';
import MapLayerControl from '../mapLayerControl.vue';
import MapProhibitedAreaControl from '../mapProhibitedAreaControl.vue';

export default {
  components: {
    MapLayerControl,
    MapProhibitedAreaControl,
  },
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    airwayId: {
      type: String,
      required: true,
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
    isEndIdFirst: {
      type: Boolean,
      required: true
    },
    stepNo: {
      type: String,
      required: false,
    }
  },
  setup(props) {
    const map = ref(null);
    const map_moveend = ref(false);
    let L;

    const MapLayerControlMounted = ref(true);

    const changedId = computed(() => {
      return props.id ? `mapShowAirwayReservationConfirmation${props.id}` : 'mapShowAirwayReservationConfirmation';
    });

    const renderMap = async (data, section, id) => {
      if (process.client) {
        if (map.value) {
          map.value.remove();
          map.value = null;
        }
        const leafletModule = await import('leaflet');
        L = leafletModule.default;

        map.value = L.map(changedId.value, {
          scrollWheelZoom: false,
        });

        L.tileLayer(
          useRuntimeConfig().public.mapTileUrl,
          {
            className: "grayscale-map",
            attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>',
          }
        ).addTo(map.value);

        map.value.zoomControl.setPosition('topleft');
        const allCoordinates = [];
        const sectionInfo = [];

        const sections = section.split("~");
        const start = sections[0].trim();
        const end = sections[1].trim();
        let FIND_START = false;

        map.value.on('moveend', (event) => {
          console.log(`MapLayerControlMounted: ${MapLayerControlMounted.value}`);
          if (!MapLayerControlMounted.value) {
            console.log(`map moved:${event}`);
            map_moveend.value = true;
          }
        });

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
              if (props.isEndIdFirst) {
                // endIdの方が先にヒットした場合
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

        const polyline = [];
        const blackLine = [];
        let count = 0;
        allCoordinates.forEach((coords) => {
          let x = 0;
          let y = 0;
          for (let i = 0; i < 4; i++) {
            if (coords[i][1] !== undefined && coords[i][0] !== undefined) {
              x += coords[i][1];
              y += coords[i][0];
            }
          }
          x /= 4;
          y /= 4;

          polyline.push([x, y]);
          const index = Math.floor(count / 2);
          if (sectionInfo[index] === true) {
            blackLine.push([x, y]);
          }
          count += 1;
        });

        if (polyline.length > 0) {
          L.polyline(polyline, {
            color: 'black',
            weight: 12,
            opacity: 1,
          }).addTo(map.value);

          L.polyline(polyline, {
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

        polyline.forEach((coord) => {
          if (coord[1] !== undefined && coord[0] !== undefined) {
            L.circleMarker([coord[0], coord[1]], {
              radius: 5,
              color: 'black',
              fill: true,
              fillColor: 'white',
              fillOpacity: 0.6,
            }).addTo(map.value);
          }
        });

        if (props.showMarker) {
          if (props.isEndIdFirst) {
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

        if (props.departurePort) {
          const portIcon = L.icon({ iconUrl: porticonUrl, iconSize: [15, 15] });
          L.marker(props.departurePort, { icon: portIcon, type: 'departurePort' }).addTo(map.value);
        }
        if (props.arrivalPort) {
          const portIcon = L.icon({ iconUrl: porticonUrl, iconSize: [15, 15] });
          L.marker(props.arrivalPort, { icon: portIcon, type: 'arrivalPort' }).addTo(map.value);
        }

        if (polyline.length > 0) {
          map.value.fitBounds(polyline);
        }
      }
    };

    onMounted(async () => {
      renderMap(props.chartData, props.section, props.airwayId);
    });

    return { map, map_moveend, MapLayerControlMounted, changedId };
  },
  methods: {
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
</style>
