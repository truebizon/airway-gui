<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { useTemplateRef } from 'vue'
import type { Map, LatLngBoundsLiteral } from 'leaflet'

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
  west: {
    type: [Number, null],
    default: null,
    required: false,
  },
  east: {
    type: [Number, null],
    default: null,
    required: false,
  },
  south: {
    type: [Number, null],
    default: null,
    required: false,
  },
  north: {
    type: [Number, null],
    default: null,
    required: false,
  },
})
const kukei = ref(false) // 選択スタート押下判定
const bounds: { [key: string]: any | null } = ref(null)// 矩形範囲
const emit = defineEmits(['update:dialogVisible', 'updateBounds'])
const defaultLat = Number(useRuntimeConfig().public.baseCenterLat)
const defaultLon = Number(useRuntimeConfig().public.baseCenterLon)
const baseZoom = Number(useRuntimeConfig().public.baseZoom)
const zoom = ref(Number(baseZoom))
const tileUrl = useRuntimeConfig().public.mapTileUrl
const isOpen = ref(props.dialogVisible)
const centerLat = ref(defaultLat)
const centerLon = ref(defaultLon)

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
    // zoom.value = Number(baseZoom)
    leafletMount()
  }
  else {
    clearRect()
    deleteRect()
    removeMapInstance()
  }
  emit('update:dialogVisible', isOpen.value)
})

let leafletMap: Map // 地図インスタンス
const mapRef = useTemplateRef('mapRef') // Vue3.5.*のref
let L: any // Leafletインスタンス

/**
 * v-dialogの表示がtrueになった際に地図インスタンスの初期化
 */
const leafletMount = async () => {
  nextTick(async () => {
    if (import.meta.client && mapRef.value) {
      if (!utils.isNullUndefined(props.west) && !utils.isNullUndefined(props.east) && !utils.isNullUndefined(props.south) && !utils.isNullUndefined(props.north)) {
        centerLat.value = Number(props.south) + (Number(props.north) - Number(props.south)) / 2
        centerLon.value = Number(props.west) + (Number(props.east) - Number(props.west)) / 2
      }
      else {
        centerLat.value = defaultLat
        centerLon.value = defaultLon
        zoom.value = baseZoom
      }
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
        zoomControl: false,
      })

      // タイルレイヤーの追加
      L.tileLayer(tileUrl, { maxZoom: maxZoom, attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html">地理院タイル</a>' }).addTo(leafletMap)
      // マップズームドラッグ終了イベント
      leafletMap.on('moveend', () => {
        onMoveEnd(leafletMap)
      })
      // マウスイベントの設定
      leafletMap.on('mousedown', onMouseDown)
      leafletMap.on('mousemove', onMouseMove)
      leafletMap.on('mouseup', onMouseUp)

      // 東西南北の座標情報がある場合矩形を描画
      if (!utils.isNullUndefined(props.west) && !utils.isNullUndefined(props.east) && !utils.isNullUndefined(props.south) && !utils.isNullUndefined(props.north)) {
        rectangle.value = L.rectangle([[props.south, props.west], [props.north, props.east]], { color: 'black', weight: 2, dashArray: '6,6' }).addTo(leafletMap)
      }

      window.addEventListener('resize', onResize)
    }
  })
}
let startLatLng: any = null // マウスダウン時の開始位置
// let rectangle: any = null // 矩形オブジェクト
const rectangle: any = ref(null) // 矩形オブジェクト
let mouseDown: boolean = false
/**
 * 範囲選択ボタン押下
 */
const onKukeiClick = () => {
  deleteRect()
  kukei.value = true
}
/**
 * 矩形スタート
 */
const onMouseDown = (e: any) => {
  if (!kukei.value) return
  if (mouseDown) {
    // case:ドラッグ中にはみ出た場合
    onMouseUp()
    return
  }
  // ドラッグ・ズーム無効
  leafletMap.dragging.disable()
  leafletMap.scrollWheelZoom.disable()
  // 開始位置
  startLatLng = e.latlng
  // 矩形をマップへバインド
  rectangle.value = L.rectangle([startLatLng, startLatLng], { color: 'black', weight: 2, dashArray: '6,6' }).addTo(leafletMap)
  // マウス移動での矩形描画時判定用
  mouseDown = true
}
/**
 * 矩形描画
 */
const onMouseMove = (e: any) => {
  if (!mouseDown) return
  if (!kukei.value) return
  if (!rectangle.value) return

  // (スタート位置,カーソル位置)で矩形設定
  const bounds = L.latLngBounds(startLatLng, e.latlng)
  // 矩形更新
  rectangle.value.setBounds(bounds)
}
/**
 * 矩形エンド
 */
const onMouseUp = () => {
  if (!mouseDown) return
  if (!kukei.value) return
  if (!rectangle.value) return

  // 矩形情報
  const rectBounds = rectangle.value.getBounds()
  // 矩形範囲
  bounds.value = {
    north: rectBounds.getNorth(),
    south: rectBounds.getSouth(),
    east: rectBounds.getEast(),
    west: rectBounds.getWest(),
  }
  // クリア
  clearRect()
}
/**
 * 矩形クリア
 */
const clearRect = () => {
  // ドラッグ・ズーム有効
  leafletMap.dragging.enable()
  leafletMap.scrollWheelZoom.enable()
  // リセット
  startLatLng = null
  mouseDown = false
  kukei.value = false
}
/**
 * 矩形削除
 */
const deleteRect = () => {
  clearRect()
  bounds.value = null
  if (rectangle.value) {
    leafletMap.removeLayer(rectangle.value)
    rectangle.value = null
  }
}
/**
 * 確定
 */
const onKakutei = () => {
  emit('updateBounds', bounds.value.north, bounds.value.east, bounds.value.south, bounds.value.west)
  isOpen.value = false
}
/**
 * クリア
 */
const onClear = () => {
  deleteRect()
  emit('updateBounds', null, null, null, null)
  // isOpen.value = false
}
/**
 * 地図表示位置変更時にズーム値を保持
 */
const onMoveEnd = (map: any) => {
  // ズーム値を継続
  zoom.value = map.getZoom()
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
    clearRect()
    deleteRect()
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
          >
            <div
              class="leaflet-top leaflet-left"
              style="margin-left: 0px;margin-top: 0px;"
              @wheel.stop
              @mousedown.stop
            >
              <div
                class="leaflet-control"
                style="background-color: none; padding: 0px; font-size: 15px;"
                @wheel.stop
                @mousedown.stop
              >
                <v-btn
                  variant="flat"
                  :disabled="kukei"
                  class="e-button-scoped"
                  size="x-large"
                  border="sm"
                  style="border-color:white !important"
                  @click="onKukeiClick"
                >
                  選択開始
                </v-btn>
              </div>
            </div>
          </div>
        </ClientOnly>
      </v-card-text>
      <v-card-actions class="mb-2">
        <v-row
          justify="space-between"
          class="px-2"
        >
          <div>
            <button
              class="e-button-back"
              @click="isOpen = false"
            >
              閉じる
            </button>
          </div>
          <div style="display: flex;">
            <button
              class="e-button-scoped"
              :disabled="utils.isNullUndefined(rectangle)"
              @click="onClear"
            >
              クリア
            </button>
            <div class="px-1" />
            <button
              class="e-button"
              :disabled="utils.isNullUndefined(bounds)"
              @click="onKakutei"
            >
              確定
            </button>
          </div>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
/** グローバルCSS「.e-button」流用 */
.e-button-scoped {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0px 16px;
  font-size: 18px;
  font-weight: 500;
  border-radius: 50px;
  background-color: #2c69ff;
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  position: relative; /* 必要に応じて追加 */
  height: 48px !important;
}
.e-button-scoped:disabled {
  background-color: #A6BFFF;
}
.e-button:disabled {
  background-color: #A6BFFF;
}
</style>
