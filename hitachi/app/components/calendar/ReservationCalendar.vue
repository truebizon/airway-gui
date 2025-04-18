<script setup lang="ts">
import type { PropType } from 'vue'
import { ref } from 'vue'
import { DateTime } from 'luxon'
import { utils } from '~/utils/utils'

// 1日24時間のスロットを作成
const hours = Array.from({ length: 24 }, (_, i) => i + ':00')
// インターフェース一式
export interface EventInfo {
  // 予約ID
  id: string
  // 予約対象ID（機体IDorドローンポートID）
  reserveTargetId: string
  // 予約対象名（機体名orドローンポート名）
  name: string
  // 開始日時
  reservationTimeFrom: Date
  // 終了日時
  reservationTimeTo: Date
  // 編集フラグ（登録直後もしくは更新対象の場合true）
  isEdit: boolean
  // 状態（使用可orメンテナンスor使用不可）
  status: string
}

interface WeekDaysInfo {
  date: string
  day: string
  dateInfo: Date
  counter: number
}

// ここまで

// プロパティ設定
const props = defineProps({
  eventsList: {
    type: Array as PropType<EventInfo[]>,
    default: () => [{
      id: '',
      name: '',
      reservationTimeFrom: new Date(),
      reservationTimeTo: new Date(),
      isEdit: false,
      reserveTargetId: '',
      status: '',
    },
    ],
    required: false,
  },
  targetDate: {
    type: Date,
    default: new Date(),
    required: false,
  },
  dispList: {
    type: Array as PropType<string[]>,
    default: () => [],
    required: false,
  },
})

// 対象の日付を含む週の月曜を取得
const getMonday = () => {
  const date = DateTime.fromJSDate(targetDate)
  const monday = date.set({ weekday: 1 })
  return monday.toJSDate()
}

// 対象の日付を含む週の日曜を取得
const getSunday = () => {
  const date = DateTime.fromJSDate(targetDate)
  const sunday = date.set({ weekday: 7 })
  return sunday.toJSDate()
}

const defaultEventList: EventInfo[] = []
const defaultdispList: string[] = []
const events = ref<EventInfo[]>(props.eventsList ?? defaultEventList)
let targetDate = props.targetDate ?? new Date()
const dispList = ref<string[]>(props.dispList ?? defaultdispList)
let startDate = getMonday()
let endDate = getSunday()

const isLoading = useState('isLoading')
isLoading.value = false

// ここまで
const componentKey = ref(0)
// 画面の再描画
const contentReload = () => {
  if (componentKey.value === 0) {
    componentKey.value = 1
  }
  else {
    componentKey.value = 0
  }
}

// 表示カウンター
const dispPortCounter = ref(dispList.value.length)
const emit = defineEmits(['registReserve', 'updateReserve', 'changeWeek'])

const weekDays = ref<WeekDaysInfo[]>([])
const weekday = ['日', '月', '火', '水', '木', '金', '土']

// 1週文の日付を作成
const setWeekDays = () => {
  weekDays.value = []
  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)
  const date = structuredClone(startDate)
  for (let i = 0; i < 7; i++) {
    const object: WeekDaysInfo = { date: structuredClone(date.getDate().toString()),
      day: weekday[date.getDay()],
      dateInfo: structuredClone(date),
      counter: i,
    }
    weekDays.value.push(object)
    date.setDate(date.getDate() + 1)
  }
}

setWeekDays()
const updateList = () => {
  events.value = props.eventsList
  dispList.value = props.dispList
  dispPortCounter.value = props.dispList.length
}

// イベントリストの監視
watch(() => props.targetDate, () => {
  targetDate = props.targetDate
  startDate = getMonday()
  endDate = getSunday()
})

watch(() => props.eventsList, () => {
  updateList()
  setWeekDays()
  contentReload()
})

// 更新ボタン押下時
const update = () => {
  emit('changeWeek', { fromTime: utils.convertUTCtoJST(startDate.toISOString()), toTime: utils.convertUTCtoJST(endDate.toISOString()) })
}

// 時間スロットをクリックしたときの処理
const registReserve = (day: Date, hour: string, targetId: string) => {
  const fromTime = structuredClone(day)
  const toTime = structuredClone(day)
  fromTime.setHours(parseInt(hour, 10), 0, 0, 0)
  toTime.setHours(parseInt(hour + 1, 10), 0, 0, 0)

  emit('registReserve', { fromTime: utils.convertUTCtoJST(fromTime.toISOString()), toTime: utils.convertUTCtoJST(toTime.toISOString()), targetId: targetId })
}

// 次週に進めた場合
const changeNextWeek = () => {
  startDate.setDate(startDate.getDate() + 7)
  endDate.setDate(endDate.getDate() + 7)
  emit('changeWeek', { fromTime: utils.convertUTCtoJST(startDate.toISOString()), toTime: utils.convertUTCtoJST(endDate.toISOString()) })
}

// 前週に進めた場合
const changePrevWeek = () => {
  startDate.setDate(startDate.getDate() - 7)
  endDate.setDate(endDate.getDate() - 7)
  emit('changeWeek', { fromTime: utils.convertUTCtoJST(startDate.toISOString()), toTime: utils.convertUTCtoJST(endDate.toISOString()) })
}
// イベントスロットをクリックしたときの処理
const updateReserve = (day: Date, hour: string, event: EventInfo) => {
  const fromTime = structuredClone(event.reservationTimeFrom)
  const toTime = structuredClone(event.reservationTimeTo)
  if (event.isEdit) {
    emit('updateReserve', { fromTime: utils.convertUTCtoJST(fromTime.toISOString()), toTime: utils.convertUTCtoJST(toTime.toISOString()), reserveTargetId: event.reserveTargetId, reserveId: event.id })
  }
  else {
    // nop
  }
}

const convertDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }) + '(' + weekday[date.getDay()] + ')'
}

const getEventClass = (event: EventInfo) => {
  // 登録直後もしくは更新対象
  if (event.isEdit) {
    return 'v-sheet: v-theme--light bg-blue v-calendar-internal-event event-cell'
  }
  // 使用不可のドローンポート情報
  else if (event.status === 'notAvailable') {
    return 'v-sheet: v-theme--light bg-blue-grey-lighten-2 v-calendar-internal-event event-cell'
  }
  // メンテナンス中のドローンポート情報
  else if (event.status === 'maintenance') {
    return 'v-sheet: v-theme--light bg-yellow-accent-2 v-calendar-internal-event event-cell'
  }
  else {
    return 'v-sheet: v-theme--light bg-blue-grey-lighten-2 v-calendar-internal-event event-cell'
  }
}

// イベントスロットのスタイルを動的に設定
const getEventStyle = (dateInfo: Date, hour: string, event: EventInfo) => {
  const baseStartTimeObject = structuredClone(dateInfo)
  const baseEndTimeObject = structuredClone(dateInfo)
  baseStartTimeObject.setHours(parseInt(hour, 10), 0, 0, 0)
  baseEndTimeObject.setHours(parseInt(hour, 10) + 1, 0, 0, 0)
  const hei = (event.reservationTimeTo.getTime() - event.reservationTimeFrom.getTime()) / (60 * 1000)
  return {
    height: hei + 'px',
    marginTop: (event.reservationTimeFrom.getTime() - baseStartTimeObject.getTime()) / (60 * 1000) + 'px',
    width: 100 + '%',
  }
}

// 時間表示に形式を変換
function formatTime(date: Date) {
  // 時間を取得
  const hours = date.getHours()

  // 分を取得
  const minutes = date.getMinutes()

  // ゼロ埋め (例: 8 -> 08, 0 -> 00)
  const dispMinutes = minutes < 10 ? '0' + minutes : minutes

  // フォーマットされた時間を返す
  return hours + ':' + dispMinutes
}
</script>

<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col>
          <v-btn
            class="e-button-scoped"
            @click="update()"
          >
            更新
          </v-btn>
        </v-col>
        <v-col
          :key="componentKey"
          class="table-upper"
        >
          {{ convertDate(startDate) }}～{{ convertDate(endDate) }}
          <v-icon
            color="primary"
            size="x-large"
            icon="mdi-chevron-left-box"
            @click="changePrevWeek()"
          />
          <v-icon
            color="primary"
            size="x-large"
            icon="mdi-chevron-right-box"
            @click="changeNextWeek()"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col :key="componentKey">
          <div class="v-calendar v-calendar-weekly">
            <div class="v-calendar__container days__7">
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="v-calendar-day__container"
              >
                <!-- 曜日（７日でループ） -->
                <div class="v-calendar-weekly__head-weekday">
                  <div
                    class="v-btn v-btn--icon v-theme--light v-btn--density-default v-btn--size-default v-btn--variant-text "
                    style=""
                  >
                    <span
                      class="v-btn__overlay"
                    />
                    <span
                      class="v-btn__underlay"
                    />
                    <span
                      class="v-btn__content"
                      data-no-activator=""
                    >
                      {{ day.date }}
                      <br>
                      {{ day.day }}
                    </span>
                  </div>
                </div>
                <div v-if="day.counter===0">
                  <!-- 一番左端の列は時刻表示が必要であるため、別処理を実施 -->
                  <div
                    v-for="hour in hours"
                    :key="hour"
                    style="height: 60px"
                  >
                    <div
                      class="v-calendar-day__row-with-label"
                      style="height: 60px"
                    >
                      <div class="v-calendar-day__row-label">
                        <slot name="intervalFormat">
                          {{ hour }}
                        </slot>
                      </div>
                      <div class="v-calendar-day__row-hairline" />
                      <div
                        class="v-calendar-day__row-content"
                      >
                        <slot
                          name="intervalBody"
                        >
                          <div
                            v-for="n in dispPortCounter"
                            :key="n"
                            style="display: flex; min-width: 25%; width: 100%;"
                            @click="registReserve(day.dateInfo, hour, dispList[n-1])"
                          >
                            <div
                              v-for="event in events.filter(x => (x.reservationTimeFrom.getHours() + ':00') === hour && convertDate(x.reservationTimeFrom) === convertDate(day.dateInfo) && x.reserveTargetId === dispList[n-1])"
                              :key="event.id"
                              :class="getEventClass(event)"
                              density="comfortable"
                              :style="getEventStyle(day.dateInfo, hour, event)"
                              @click="updateReserve(day.dateInfo, hour, event); $event.stopPropagation()"
                            >
                              <!-- クライアントサイドでのみツールチップを表示 -->
                              <client-only>
                                <v-tooltip
                                  location="top"
                                >
                                  <template #activator="{ props: activatorProps }">
                                    <div v-bind="activatorProps">
                                      {{ formatTime(event.reservationTimeFrom) }}～{{ formatTime(event.reservationTimeTo) }}<br>{{ event.name }}
                                    </div>
                                  </template>
                                  <template #default>
                                    <!-- ツールチップの内容 -->
                                    {{ formatTime(event.reservationTimeFrom) }}～{{ formatTime(event.reservationTimeTo) }}<br>{{ event.name }}
                                  </template>
                                </v-tooltip>
                              </client-only>
                            </div>
                          </div>
                        </slot>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else>
                  <div
                    v-for="hour in hours"
                    :key="day.date + hour"
                    style="height: 60px"
                  >
                    <div
                      class="v-calendar-day__row-without-label"
                      style="height: 60px"
                    >
                      <div
                        class="v-calendar-day__row-content"
                      >
                        <slot
                          name="intervalBody"
                        >
                          <div
                            v-for="n in dispPortCounter"
                            :key="n"
                            style="display: flex; min-width: 25%; width: 100%;"
                            @click="registReserve(day.dateInfo, hour, dispList[n-1])"
                          >
                            <div
                              v-for="event in events.filter(x => (x.reservationTimeFrom.getHours() + ':00') === hour && convertDate(x.reservationTimeFrom) === convertDate(day.dateInfo) && x.reserveTargetId === dispList[n-1])"
                              :key="event.id"
                              :class="getEventClass(event)"
                              density="comfortable"
                              :style="getEventStyle(day.dateInfo, hour, event)"
                              @click="updateReserve(day.dateInfo, hour, event); $event.stopPropagation()"
                            >
                              <!-- クライアントサイドでのみツールチップを表示 -->
                              <client-only>
                                <v-tooltip
                                  location="top"
                                >
                                  <template #activator="{ props: activatorProps }">
                                    <div v-bind="activatorProps">
                                      {{ formatTime(event.reservationTimeFrom) }}～{{ formatTime(event.reservationTimeTo) }}<br>{{ event.name }}
                                    </div>
                                  </template>
                                  <template #default>
                                    <!-- ツールチップの内容 -->
                                    {{ formatTime(event.reservationTimeFrom) }}～{{ formatTime(event.reservationTimeTo) }}<br>{{ event.name }}
                                  </template>
                                </v-tooltip>
                              </client-only>
                            </div>
                          </div>
                        </slot>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<style scoped>
/* テーブルのセルにスタイルを適用 */

.table-upper{
  text-align: right;
}

.event-cell{
  font-size: 10px;
  z-index: 2;
  border-right: 0.5px solid #000000;
  border-left: 0.5px solid #000000;
}

.v-calendar-day__row-without-label .v-calendar-day__row-content {
  height: 60px;
  min-width: 100px;
  overflow: visible;
  display: flex;
}

.v-calendar-day__row-with-label .v-calendar-day__row-content {
  height: 60px;
  min-width: 120px;
  overflow: visible;
  display: flex;
}

.v-calendar-day__row-with-label{
  grid-template-columns: 30px 8px 1fr;
}

/** グローバルCSS「.e-button」流用 */
.e-button-scoped {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 50px;
  background-color: #2c69ff;
  color: #ffffff;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s;
  position: relative; /* 必要に応じて追加 */
}
</style>
