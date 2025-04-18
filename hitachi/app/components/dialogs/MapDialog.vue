<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { useTemplateRef } from 'vue'
import type { Map, LatLngBoundsLiteral, Marker } from 'leaflet'

const props = defineProps({
  title: {
    type: String,
    default: 'マップ',
    required: false,
  },
  dialogVisible: {
    type: Boolean,
    required: true,
  },
  lat: {
    type: Number,
    default: null,
    required: false,
  },
  lon: {
    type: Number,
    default: null,
    required: false,
  },
  moveMarker: {
    // マップ押下でマーカー移動
    type: Boolean,
    default: false,
    required: false,
  },
  moveCenter: {
    // マーカー移動時に表示も移動
    type: Boolean,
    default: false,
    required: false,
  },
  resetZoom: {
    // 表示するたびに初期zoomをセット
    type: Boolean,
    default: false,
    required: false,
  },
})
const emit = defineEmits(['update:dialogVisible', 'updateCoordinates', 'updateBounds'])
const defaultLat = Number(useRuntimeConfig().public.baseCenterLat)
const defaultLon = Number(useRuntimeConfig().public.baseCenterLon)
const baseZoom = Number(useRuntimeConfig().public.baseZoom)
const zoom = ref(Number(baseZoom))
const tileUrl = useRuntimeConfig().public.mapTileUrl
const isOpen = ref(props.dialogVisible)
const centerLat = ref(props.lat ?? defaultLat)
const centerLon = ref(props.lon ?? defaultLon)
const markerLat = ref(centerLat.value)
const markerLon = ref(centerLon.value)
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
watch(() => props.dialogVisible, (newVal) => {
  isOpen.value = newVal
})
watch(() => isOpen.value, (newVal) => {
  if (newVal) {
    if (props.resetZoom) {
      zoom.value = Number(baseZoom)
    }
    leafletMount()
    centerLat.value = markerLat.value ?? defaultLat as number
    centerLon.value = markerLon.value ?? defaultLon as number
  }
  else {
    removeMapInstance()
  }
  emit('update:dialogVisible', isOpen.value)
})
watch(() => props.lat, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    markerLat.value = newVal as number
  }
})
watch(() => props.lon, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    markerLon.value = newVal as number
  }
})

let moveCenterFlg = false
let marker: Marker
let leafletMap: Map // 地図インスタンス
const mapRef = useTemplateRef('mapRef') // Vue3.5.*のref
let L: any // Leafletインスタンス
/**
 * 地図押下時処理
 */
const onMapClick = (event: any) => {
  if (!props.moveMarker) return
  // 次の表示時に位置引継ぎ
  markerLat.value = event.latlng.lat as number
  markerLon.value = event.latlng.lng as number
  // マーカーの位置の移動
  marker.setLatLng([markerLat.value, markerLon.value])
  emit('updateCoordinates', { lat: markerLat.value, lon: markerLon.value })
  if (props.moveCenter) {
    // 次の表示時に位置引継ぎ
    centerLat.value = markerLat.value
    centerLon.value = markerLon.value
    // 地図表示位置の移動
    leafletMap.setView([centerLat.value, centerLon.value])
    moveCenterFlg = true
  }
}
/**
 * 地図表示位置変更時（ドラッグ・ズーム）処理
 */
const onMoveEnd = (map: any) => {
  // ズーム値を継続
  zoom.value = map.getZoom()
  if (moveCenterFlg) {
    // 通常のドラッグズームでのmoveイベントではemitしない
    const north = map.getBounds().getNorth()
    const east = map.getBounds().getEast()
    const south = map.getBounds().getSouth()
    const west = map.getBounds().getWest()
    emit('updateBounds', north, east, south, west)
    moveCenterFlg = false
  }
}
/**
 * v-dialogの表示がtrueになった際に地図インスタンスの初期化
 */
const leafletMount = async () => {
  nextTick(async () => {
    if (import.meta.client && mapRef.value) {
      // マップの初期化
      leafletMap = L.map(mapRef.value, {
        center: [centerLat.value, centerLon.value],
        zoom: zoom.value,
        doubleClickZoom: false, // ダブルクリックズームを無効化
        minZoom: minZoom, // 最小ズームレベル
        maxZoom: maxZoom, // 最大ズームレベル
        dragging: true, // 地図のドラッグを有効化
        bounceAtZoomLimits: false, // ズーム制限到達時にバウンス
        worldCopyJump: false, // 世界地図のコピーを作成しない
        maxBounds: maxBounds, // マップの境界制限
        maxBoundsViscosity: 1.0, // 境界制限の粘度
      })
      marker = L.marker([markerLat.value, markerLon.value])
      marker.addTo(leafletMap)

      // タイルレイヤーの追加
      L.tileLayer(tileUrl, { maxZoom: maxZoom, attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>' }).addTo(leafletMap)
      // マップズームドラッグ終了イベント設定
      leafletMap.on('moveend', () => {
        onMoveEnd(leafletMap)
      })
      leafletMap.on('click', (e) => {
        onMapClick(e)
      })

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
  if (isOpen.value) {
    removeMapInstance()
  }
})
</script>

<template>
  <v-dialog
    v-model="isOpen"
    no-click-animation
    width="60%"
    height="80%"
  >
    <v-card style="height: 100%">
      <v-card-title>
        <v-icon
          icon="mdi-map-marker-radius-outline"
          size="x-large"
          color="primary"
        />
        <b>
          {{ $props.title }}
        </b>
      </v-card-title>
      <v-card-text>
        <ClientOnly>
          <div
            ref="mapRef"
            style="height: 100%; width: 100%;"
          />
        </ClientOnly>
      </v-card-text>
      <v-card-actions class="mb-2">
        <v-row
          justify="space-between"
          class="px-2"
        >
          <button
            class="e-button-back"
            @click="isOpen = false"
          >
            閉じる
          </button>
          <div />
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
