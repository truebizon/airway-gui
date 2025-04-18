<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { useTemplateRef } from 'vue'
import type { Map, LatLngBoundsLiteral, Marker } from 'leaflet'

const props = defineProps({
  lat: {
    type: Number,
    default: 0,
    required: false,
  },
  lon: {
    type: Number,
    default: 0,
    required: false,
  },
  visible: {
    type: Boolean,
    default: false,
    required: false,
  },
})

// デフォルト表示位置
const baseZoom = Number(useRuntimeConfig().public.baseZoom)
const center = ref([props.lat, props.lon])
const zoom = ref(Number(baseZoom))
const tileUrl = useRuntimeConfig().public.mapTileUrl
const markerLat = ref(props.lat)
const markerLon = ref(props.lon)
const minZoom = Number(useRuntimeConfig().public.mapMinZoom)
const maxZoom = Number(useRuntimeConfig().public.mapMaxZoom)
const maxBoundsSouth = Number(useRuntimeConfig().public.maxBoundSouth)
const maxBoundsWest = Number(useRuntimeConfig().public.maxBoundWest)
const maxBoundsNorth = Number(useRuntimeConfig().public.maxBoundNorth)
const maxBoundsEast = Number(useRuntimeConfig().public.maxBoundEast)
const maxBounds: LatLngBoundsLiteral = [
  // 日本が表示される境界値を設定
  [maxBoundsSouth, maxBoundsWest],
  [maxBoundsNorth, maxBoundsEast],
]
let marker: Marker
let leafletMap: Map // 地図インスタンス
const mapRef = useTemplateRef('mapRef') // Vue3.5.*のref
let L: any // Leafletインスタンス

// 再表示
watch(() => props.visible, (newVal) => {
  if (newVal) {
    leafletMount()
  }
  else {
    removeMapInstance()
  }
})
// 座標切替
watch(() => [props.lat, props.lon], () => {
  zoom.value = baseZoom
  markerLat.value = props.lat
  markerLon.value = props.lon
  center.value = [markerLat.value, markerLon.value]
  if (props.visible) {
    removeMapInstance()
    leafletMount()
  }
},
)

/**
 * v-dialogの表示がtrueになった際に地図インスタンスの初期化
 */
const leafletMount = async () => {
  nextTick(async () => {
    if (import.meta.client && mapRef.value) {
      // マップの初期化
      leafletMap = L.map(mapRef.value, {
        center: center.value,
        zoom: zoom.value,
        doubleClickZoom: false, // ダブルクリックズームを無効化
        minZoom: minZoom, // 最小ズームレベル
        maxZoom: maxZoom, // 最大ズームレベル
        dragging: true, // 地図のドラッグを有効化
        bounceAtZoomLimits: false, // ズーム制限到達時にバウンス
        worldCopyJump: false, // 世界地図のコピーを作成しない
        maxBounds: maxBounds, // マップの境界制限
        maxBoundsViscosity: 1.0, // 境界制限の粘度
        scrollWheelZoom: false, // ホイールズーム無効
      })
      marker = L.marker([markerLat.value, markerLon.value])

      marker.addTo(leafletMap)

      // タイルレイヤーの追加
      L.tileLayer(tileUrl, { maxZoom: maxZoom, attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>' }).addTo(leafletMap)

      window.addEventListener('resize', onResize)
    }
  })
}
/**
 * 地図インスタンスの破棄
 */
const removeMapInstance = () => {
  if (leafletMap) {
    window.removeEventListener('resize', onResize)
    leafletMap.remove()
  }
}
/**
 * mounted
 */
onMounted(async () => {
  nextTick(async () => {
    if (import.meta.client) {
      // クライアントインポート
      L = await import('leaflet')
      // ビルド実行時に画像パスが不正になる
      const isDev = useRuntimeConfig().app.buildId === 'dev'
      if (!isDev) {
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
          iconUrl: '/leaflet/images/marker-icon.png',
          shadowUrl: '/leaflet/images/marker-shadow.png',
        })
      }
    }
  })
})
let resizeTimeout: any
const onResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = setTimeout(() => {
    if (leafletMap) {
      leafletMap.invalidateSize()
    }
  }, 300)
}
/**
 * beforeUnmount
 */
onUnmounted(async () => {
  // 地図インスタンスの破棄
  if (!utils.isNullUndefined(props.lat) && !utils.isNullUndefined(props.lon)) {
    removeMapInstance()
  }
})
</script>

<template>
  <ClientOnly>
    <div
      ref="mapRef"
      style="height: 100%; width: 100%;"
    />
  </ClientOnly>
</template>

<style scoped>
.title{
  font-size: 25px;
  font-weight: bold;
  padding-left: 10px;
  padding-top: 10px;
}
</style>
