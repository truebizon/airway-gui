<script setup lang="ts">
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import ReferenceImagePreview from '~/components/register/ReferenceImagePreview.vue'
import MapDialog from '~/components/dialogs/MapDialog.vue'
import CommonDialog from '~/components/dialogs/CommonDialog.vue'
import PageNavigation from '~/components/navigation/pageNavigation.vue'

definePageMeta({
  layout: 'system-global-navigation',
})

const { getRole } = useCreated()
const { toFixed } = useMyFilter()
const route = useRoute()
const router = useRouter()
const aircraftId = route.params.id as string // パラメータ（機体ID）
const { getCodeByType } = useCode()
const isRegister = computed(() => utils.isNullUndefined(aircraftId))
const initialOption = { value: null, title: '' }
const coordinatesDecimal = 7 // 座標桁数（整形用）
const maxTakeoffWeightDecimal = 3 // 最大離陸重量桁数（整形用）
const bodyWeightDecimal = 3 // 重量桁数（整形用）
const maxFlightSpeedDecimal = 0 // 最大速度桁数（整形用）
const maxFlightTimeDecimal = 0 // 最大飛行時間桁数（整形用）
const { constants } = useMyConstant()
const myRole = ref()
const ownpageRole = ['1']

const isLoading = useState('isLoading')// スピナー表示

let isChanged = false // 項目変更フラグ（入力破棄確認チェック用）
let pendingNavigation: ((arg?: boolean) => void) | null = null // ナビゲーションを保持（入力破棄確認用）
const isCorrectNavigation = ref(false) // システムによるナビゲーションの場合は入力破棄確認不要
const validForm = ref() // バリデーションチェック用フォームrefs
const validated = ref(false) // バリデーションチェックOKのときtrue
const errorDetail = ref('') // エラー詳細

/** ダイアログ表示フラグ */
const destructionConfirmDialogVisible = ref(false) // 入力破棄確認ダイアログ
const getFailedDialogVisible = ref(false) // 詳細取得失敗ダイアログ
const mapDialogVisible = ref(false) // マップダイアログ
const registerConfirmDialogVisible = ref(false) // 登録確認ダイアログ
const registerSuccessDialogVisible = ref(false) // 登録成功ダイアログ
const registerFailedDialogVisible = ref(false) // 登録失敗ダイアログ
const updateConfirmDialogVisible = ref(false) // 更新確認ダイアログ
const updateSuccessDialogVisible = ref(false) // 更新成功ダイアログ
const updateFailedDialogVisible = ref(false) // 更新失敗ダイアログ
const deleteConfirmDialogVisible = ref(false) // 削除確認ダイアログ
const deleteSuccessDialogVisible = ref(false) // 削除成功ダイアログ
const deleteFailedDialogVisible = ref(false) // 削除失敗ダイアログ

/** フォームデータ */
const formData = ref<Record<string, any>>({
  aircraftId: null, // 機体ID
  aircraftName: '', // 機体名
  manufacturer: '', // 製造メーカー
  manufacturingNumber: '', // 製造番号
  aircraftType: null, // 機体の種類
  maxTakeoffWeight: null, // 最大離陸重量
  bodyWeight: null, // 重量(kg)
  maxFlightSpeed: null, // 最大速度(km/h)
  maxFlightTime: null, // 最大飛行時間
  certification: false, // 機体認証の有無
  dipsRegistrationCode: '', // DIPS登録記号
  lat: null, // 緯度
  lon: null, // 経度
  ownerType: null, // 機体所有種別
  ownerId: null, // 所有者ID
  imageData: '', // base64Text
})

const formSetting = {
  // ラベル名・必須・最大長・セレクトリスト内容・チェックボックス内容設定用
  aircraftId: { label: '機体ID' },
  aircraftName: { label: '機体名', maxLength: '24', required: true },
  manufacturer: { label: '製造メーカー', maxLength: '24', required: false },
  manufacturingNumber: { label: '製造番号', maxLength: '20', required: false },
  aircraftType: { label: '機体の種類', options: [initialOption, ...getCodeByType('aircraftType')], required: false },
  maxTakeoffWeight: { label: '最大離陸重量(kg)', maxLength: '8', required: false },
  bodyWeight: { label: '重量(kg)', maxLength: '8', required: false },
  maxFlightSpeed: { label: '最大速度(km/h)', maxLength: '4', required: false },
  maxFlightTime: { label: '最大飛行時間(分)', maxLength: '4', required: false },
  dipsRegistrationCode: { label: 'DIPS登録記号', maxLength: '12', required: false },
  lat: { label: '機体位置(緯度)', maxLength: '12', required: false },
  lon: { label: '機体位置(経度)', maxLength: '12', required: false },
  ownerType: { label: '機体所有種別', options: [initialOption, ...getCodeByType('ownerType')], required: true },
  ownerId: { label: '所有者ID', maxLength: '36', required: false },
  certification: { label: '機体認証の有無', maxLength: '', required: false },
}

onBeforeMount(async () => {
  myRole.value = await getRole(ownpageRole) // ロール
})

onMounted(async () => {
  await getAircraftInfo()
})

const loadOn = () => {
  isLoading.value = true
}

const loadOff = () => {
  isLoading.value = false
}

/** バリデーションチェック */
const requiredValidation = (value: any) => {
  if (utils.isBlank(value)) return '入力必須項目です'
  return !!value || value === 0
}
const latRangeValidation = (value: any) => {
  if (value < -90 || 90 < value) return '-90~90の範囲で入力してください'
  return -90 <= value || value <= 90
}
const lonRangeValidation = (value: any) => {
  if (value < -180 || 180 < value) return '-180~180の範囲で入力してください'
  return -180 <= value || value <= 180
}

/**
 * 機体情報詳細取得
 */
const getAircraftInfo = async () => {
  // spinerOn
  await loadOn()
  if (isRegister.value) {
    await loadOff()
    return
  }
  const apiResult = await useRestApiAircraftGetByPk(aircraftId)
  if (utils.isNormalStatusResponse(apiResult.status)) {
    const aircraftInfo = await apiResult.json()
    // 更新画面の場合、取得した機体情報をバインド
    formData.value.aircraftId = aircraftInfo.aircraftId
    formData.value.aircraftName = aircraftInfo.aircraftName
    formData.value.manufacturer = aircraftInfo.manufacturer
    formData.value.manufacturingNumber = aircraftInfo.manufacturingNumber
    formData.value.aircraftType = aircraftInfo.aircraftType
    formData.value.maxTakeoffWeight = utils.isNullUndefined(aircraftInfo.maxTakeoffWeight) ? null : Number(toFixed(aircraftInfo.maxTakeoffWeight, maxTakeoffWeightDecimal))
    formData.value.bodyWeight = utils.isNullUndefined(aircraftInfo.bodyWeight) ? null : Number(toFixed(aircraftInfo.bodyWeight, bodyWeightDecimal))
    formData.value.maxFlightSpeed = aircraftInfo.maxFlightSpeed
    formData.value.maxFlightTime = aircraftInfo.maxFlightTime
    formData.value.dipsRegistrationCode = aircraftInfo.dipsRegistrationCode
    formData.value.lat = utils.isNullUndefined(aircraftInfo.lat) ? null : Number(toFixed(aircraftInfo.lat, coordinatesDecimal))
    formData.value.lon = utils.isNullUndefined(aircraftInfo.lon) ? null : Number(toFixed(aircraftInfo.lon, coordinatesDecimal))
    formData.value.ownerType = aircraftInfo.ownerType
    formData.value.ownerId = aircraftInfo.ownerId
    formData.value.certification = aircraftInfo.certification
    formData.value.imageData = aircraftInfo.imageData
  }
  else {
    const responseBody = await apiResult.json()
    getFailedDialogVisible.value = true
    if (responseBody.errorDetail) {
      errorDetail.value = `機体情報の取得に失敗しました。(エラー詳細：${responseBody.errorDetail})`
    }
    else {
      errorDetail.value = `機体情報の取得に失敗しました。(エラー詳細：)`
    }
  }
  await loadOff()
}

/**
 * 機体情報登録
 */
const registerAircraftInfo = async () => {
  // spinerOn
  await loadOn()
  registerConfirmDialogVisible.value = false
  formData.value.ownerId = utils.isBlank(formData.value.ownerId) ? null : formData.value.ownerId
  const apiResult = await useRestApiAircraftRegister(formData.value as AircraftRegisterRequestParams)
  if (utils.isNormalStatusResponse(apiResult.status)) {
    registerSuccessDialogVisible.value = true
  }
  else {
    const responseBody = await apiResult.json()
    registerFailedDialogVisible.value = true
    if (responseBody.errorDetail) {
      errorDetail.value = `機体情報の登録に失敗しました。(エラー詳細：${responseBody.errorDetail})`
    }
    else {
      errorDetail.value = `機体情報の登録に失敗しました。(エラー詳細：)`
    }
  }
  await loadOff()
}

/**
 * 機体情報更新
 */
const updateAircraftInfo = async () => {
  // spinerOn
  await loadOn()
  updateConfirmDialogVisible.value = false
  formData.value.ownerId = utils.isBlank(formData.value.ownerId) ? null : formData.value.ownerId
  const apiResult = await useRestApiAircraftUpdateByPk(aircraftId, formData.value as AircraftUpdateByPkRequestParams)
  if (utils.isNormalStatusResponse(apiResult.status)) {
    updateSuccessDialogVisible.value = true
  }
  else {
    const responseBody = await apiResult.json()
    updateFailedDialogVisible.value = true
    if (responseBody.errorDetail) {
      errorDetail.value = `機体情報の更新に失敗しました。(エラー詳細：${responseBody.errorDetail})`
    }
    else {
      errorDetail.value = `機体情報の更新に失敗しました。(エラー詳細：)`
    }
  }
  await loadOff()
}

/**
 * 機体情報削除
 */
const deleteAircraftInfo = async () => {
  // spinerOn
  await loadOn()
  deleteConfirmDialogVisible.value = false
  const apiResult = await useRestApiAircraftDeleteByPk(aircraftId)
  if (utils.isNormalStatusResponse(apiResult.status)) {
    deleteSuccessDialogVisible.value = true
  }
  else {
    const responseBody = await apiResult.json()
    deleteFailedDialogVisible.value = true
    if (responseBody.errorDetail) {
      errorDetail.value = `機体情報の削除に失敗しました。(エラー詳細：${responseBody.errorDetail})`
    }
    else {
      errorDetail.value = `機体情報の削除に失敗しました。(エラー詳細：)`
    }
  }
  await loadOff()
}

/**
 * 新規登録ボタン押下時処理
 */
const onRegisterButtonClick = async () => {
  if (isNaN(formData.value.maxTakeoffWeight)) {
    formData.value.maxTakeoffWeight = null
  }
  if (isNaN(formData.value.bodyWeight)) {
    formData.value.bodyWeight = null
  }
  if (isNaN(formData.value.maxFlightSpeed)) {
    formData.value.maxFlightSpeed = null
  }
  if (isNaN(formData.value.maxFlightTime)) {
    formData.value.maxFlightTime = null
  }
  // バリデーションチェック
  const valid = await validate()
  if (valid) {
    registerConfirmDialogVisible.value = true
  }
}
const validate = async () => {
  const { valid } = await validForm.value.validate()

  return valid
}

/**
 * 更新ボタン押下時処理
 */
const onUpdateButtonClick = async () => {
  if (isNaN(formData.value.maxTakeoffWeight)) {
    formData.value.maxTakeoffWeight = null
  }
  if (isNaN(formData.value.bodyWeight)) {
    formData.value.bodyWeight = null
  }
  if (isNaN(formData.value.maxFlightSpeed)) {
    formData.value.maxFlightSpeed = null
  }
  if (isNaN(formData.value.maxFlightTime)) {
    formData.value.maxFlightTime = null
  }
  // バリデーションチェック
  const valid = await validate()
  if (valid) {
    updateConfirmDialogVisible.value = true
  }
}

/**
 * 削除ボタン押下時処理
 */
const onDeleteButtonClick = async () => {
  deleteConfirmDialogVisible.value = true
}

/**
 * 画面遷移時入力破棄確認（画面遷移でトリガー）
 */
onBeforeRouteLeave((to, from, next) => {
  // 登録や更新後の画面遷移では破棄確認モーダルを表示しない
  if (isCorrectNavigation.value) {
    next()
    return
  }

  // 入力が変更されていない場合は破棄確認モーダルを表示しない
  if (isChanged) {
    destructionConfirmDialogVisible.value = true
    // ナビゲートfunctionの保持
    pendingNavigation = next
  }
  else {
    next()
  }
})
/**
 * 入力破棄確認OK
 */
const navigateOk = () => {
  destructionConfirmDialogVisible.value = false
  if (pendingNavigation) {
    // ナビゲーションを実行
    pendingNavigation()
    // 念のためクリア
    pendingNavigation = null
  }
}
/**
 * 入力破棄確認キャンセル
 */
const navigateCancel = () => {
  destructionConfirmDialogVisible.value = false
  if (pendingNavigation !== null) {
    // 保持しているナビゲーションをクリア
    // pendingNavigation = null
    pendingNavigation(false)
  }
}

/**
 * 機体情報一覧画面へ遷移
 */
const forwardAircraftList = () => {
  isCorrectNavigation.value = true
  router.push({ name: 'drone' })
}

/**
 * 項目変更判定
 */
const changeFormData = () => {
  isChanged = true
}

/**
 * 地点設定マップ表示から変更された場合の変更イベント発生処理
 */
const forceChangeEvent = () => {
  const inputElement = document.querySelector('.coordinate')
  if (inputElement) {
    // @changeイベントを手動で発火
    const event = new Event('change', { bubbles: true })
    inputElement.dispatchEvent(event)
  }
}

/**
 * 地点設定マップ表示
 */
const displayMapPopup = () => {
  mapDialogVisible.value = true
}
/**
 * 押下座標設定
 */
const updateCoordinates = (coordinates: { lat: number, lon: number }) => {
  formData.value.lat = Number(toFixed(coordinates.lat, coordinatesDecimal))
  formData.value.lon = Number(toFixed(coordinates.lon, coordinatesDecimal))
  forceChangeEvent()
}
/**
 * 緯度整形
 */
const toFixedInputLat = () => {
  if (formData.value.lat > 90) {
    formData.value.lat = 90
  }
  else if (formData.value.lat < -90) {
    formData.value.lat = -90
  }
}
const toFixedLat = () => {
  isChanged = true
  if (!utils.isBlank(formData.value.lat)) {
    formData.value.lat = Number(toFixed(formData.value.lat, coordinatesDecimal))
  }
  else {
    formData.value.lat = null
  }
}
/**
 * 経度整形
 */
const toFixedInputLon = () => {
  if (formData.value.lon > 180) {
    formData.value.lon = 180
  }
  else if (formData.value.lon < -180) {
    formData.value.lon = -180
  }
}
const toFixedLon = () => {
  isChanged = true
  if (!utils.isBlank(formData.value.lon)) {
    formData.value.lon = Number(toFixed(formData.value.lon, coordinatesDecimal))
  }
  else {
    formData.value.lon = null
  }
}

/**
 * 最大離陸重量整形
 */
// @input
const toFixedInputMaxTakeoffWeight = () => {
  const inputMaxTakeoffWeight: string = String(formData.value.maxTakeoffWeight)
  const numberMaxTakeoffWeight = parseFloat(inputMaxTakeoffWeight)
  if (Number.isNaN(numberMaxTakeoffWeight)) {
    formData.value.maxTakeoffWeight = NaN
  }
  if (numberMaxTakeoffWeight > 1000) {
    formData.value.maxTakeoffWeight = 1000
  }
  else if (numberMaxTakeoffWeight < 0) {
    formData.value.maxTakeoffWeight = 0
  }
}
// @change
const toFixedMaxTakeoffWeight = () => {
  isChanged = true
  if (!utils.isBlank(formData.value.maxTakeoffWeight) && !isNaN(formData.value.maxTakeoffWeight)) {
    formData.value.maxTakeoffWeight = Number(toFixed(formData.value.maxTakeoffWeight, maxTakeoffWeightDecimal))
  }
  else {
    formData.value.maxTakeoffWeight = NaN
  }
}

/**
 * 重量整形
 */
const toFixedInputBodyWeight = () => {
  const inputBodyWeight: string = String(formData.value.bodyWeight)
  const numberBodyWeight = parseFloat(inputBodyWeight)
  if (Number.isNaN(numberBodyWeight)) {
    formData.value.bodyWeight = NaN
  }
  if (numberBodyWeight > 1000) {
    formData.value.bodyWeight = 1000
  }
  else if (numberBodyWeight < 0) {
    formData.value.bodyWeight = 0
  }
}
const toFixedBodyWeight = () => {
  isChanged = true
  if (!utils.isBlank(formData.value.bodyWeight) && !isNaN(formData.value.bodyWeight)) {
    formData.value.bodyWeight = Number(toFixed(formData.value.bodyWeight, bodyWeightDecimal))
  }
  else {
    formData.value.bodyWeight = NaN
  }
}

/**
 * 最大速度整形
 */
const toFixedInputMaxFlightSpeed = () => {
  const inputMaxFlightSpeed: string = String(formData.value.maxFlightSpeed)
  const numberMaxFlightSpeed = parseFloat(inputMaxFlightSpeed)
  if (Number.isNaN(numberMaxFlightSpeed)) {
    formData.value.maxFlightSpeed = NaN
  }
  if (numberMaxFlightSpeed > 1000) {
    formData.value.maxFlightSpeed = 1000
  }
  else if (numberMaxFlightSpeed < 0) {
    formData.value.maxFlightSpeed = 0
  }
}
const toFixedMaxFlightSpeed = () => {
  isChanged = true
  if (!utils.isBlank(formData.value.maxFlightSpeed) && !isNaN(formData.value.maxFlightSpeed)) {
    formData.value.maxFlightSpeed = Number(toFixed(formData.value.maxFlightSpeed, maxFlightSpeedDecimal))
  }
  else {
    formData.value.maxFlightSpeed = NaN
  }
}

/**
 * 最大飛行時間整形
 */
const toFixedInputMaxFlightTime = () => {
  const inputMaxFlightTime: string = String(formData.value.maxFlightTime)
  const numberMaxFlightTime = parseFloat(inputMaxFlightTime)
  if (Number.isNaN(numberMaxFlightTime)) {
    formData.value.maxFlightTime = NaN
  }
  if (numberMaxFlightTime > 1000) {
    formData.value.maxFlightTime = 1000
  }
  else if (numberMaxFlightTime < 0) {
    formData.value.maxFlightTime = 0
  }
}
const toFixedMaxFlightTime = () => {
  isChanged = true
  if (!utils.isBlank(formData.value.maxFlightTime) && !isNaN(formData.value.maxFlightTime)) {
    formData.value.maxFlightTime = Number(toFixed(formData.value.maxFlightTime, maxFlightTimeDecimal))
  }
  else {
    formData.value.maxFlightTime = NaN
  }
}
</script>

<template>
  <div class="page-content">
    <div class="b-pageContentHasSubMenu">
      <!-- メインコンテンツ -->
      <div class="b-pageContentHasNavigation">
        <div class="drn_main__app">
          <div class="drn_header">
            <div class="drn_header__item">
              <v-card-title class="drn_header__title">
                {{ `機体情報${isRegister ? '登録' : '更新削除'}` }}
              </v-card-title>
            </div>
          </div>
          <div class="content-body px-7">
            <v-container fluid>
              <v-form
                ref="validForm"
                v-model="validated"
                validate-on="submit"
                class="main-area"
              >
                <v-row>
                  <v-col cols="3">
                    <v-row no-gutters>
                      <v-col>
                        <!-- 機体ID -->
                        <label class="form-label">
                          <b>{{ formSetting.aircraftId.label + (isRegister ? '(自動採番)' : '') }}</b>
                        </label>
                        <v-text-field
                          v-model="formData.aircraftId"
                          outlined
                          dense
                          variant="outlined"
                          disabled
                        />
                      </v-col>
                    </v-row>
                    <v-row no-gutters>
                      <v-col>
                        <ReferenceImagePreview
                          v-model="formData.imageData"
                          @change="changeFormData"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col>
                    <v-row>
                      <v-col cols="4">
                        <!-- 機体名 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.aircraftName.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.aircraftName.label }}</b>
                        </label>
                        <v-text-field
                          v-model="formData.aircraftName"
                          :maxlength="formSetting.aircraftName.maxLength"
                          outlined
                          dense
                          :rules="formSetting.aircraftName.required ? [requiredValidation] : []"
                          variant="outlined"
                          @change="changeFormData"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- 製造メーカー -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.manufacturer.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.manufacturer.label }}</b>
                        </label>
                        <v-text-field
                          v-model="formData.manufacturer"
                          :maxlength="formSetting.manufacturer.maxLength"
                          outlined
                          dense
                          :rules="formSetting.manufacturer.required ? [requiredValidation] : []"
                          variant="outlined"
                          @change="changeFormData"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- 製造番号 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.manufacturingNumber.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.manufacturingNumber.label }}</b>
                        </label>
                        <v-text-field
                          v-model="formData.manufacturingNumber"
                          :maxlength="formSetting.manufacturingNumber.maxLength"
                          outlined
                          dense
                          :rules="formSetting.manufacturingNumber.required ? [requiredValidation] : []"
                          variant="outlined"
                          @change="changeFormData"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4">
                        <!-- 機体の種類 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.aircraftType.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.aircraftType.label }}</b>
                        </label>
                        <v-select
                          v-model="formData.aircraftType"
                          :items="formSetting.aircraftType.options"
                          item-value="value"
                          item-title="title"
                          :rules="formSetting.aircraftType.required ? [requiredValidation] : []"
                          variant="outlined"
                          @update:model-value="changeFormData"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- 最大離陸重量 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.maxTakeoffWeight.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.maxTakeoffWeight.label }}</b>
                        </label>
                        <v-text-field
                          v-model.number="formData.maxTakeoffWeight"
                          type="number"
                          :maxlength="formSetting.maxTakeoffWeight.maxLength"
                          outlined
                          dense
                          :hide-spin-buttons="true"
                          :rules="formSetting.maxTakeoffWeight.required ? [requiredValidation] : []"
                          variant="outlined"
                          @input="toFixedInputMaxTakeoffWeight()"
                          @change="toFixedMaxTakeoffWeight()"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- 重量 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.bodyWeight.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.bodyWeight.label }}</b>
                        </label>
                        <v-text-field
                          v-model.number="formData.bodyWeight"
                          type="number"
                          :maxlength="formSetting.bodyWeight.maxLength"
                          outlined
                          dense
                          :hide-spin-buttons="true"
                          :rules="formSetting.bodyWeight.required ? [requiredValidation] : []"
                          variant="outlined"
                          @input="toFixedInputBodyWeight()"
                          @change="toFixedBodyWeight()"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4">
                        <!-- 最大速度 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.maxFlightSpeed.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.maxFlightSpeed.label }}</b>
                        </label>
                        <v-text-field
                          v-model.number="formData.maxFlightSpeed"
                          type="number"
                          :maxlength="formSetting.maxFlightSpeed.maxLength"
                          outlined
                          dense
                          :hide-spin-buttons="true"
                          :rules="formSetting.maxFlightSpeed.required ? [requiredValidation] : []"
                          variant="outlined"
                          @input="toFixedInputMaxFlightSpeed()"
                          @change="toFixedMaxFlightSpeed()"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- 最大飛行時間 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.maxFlightTime.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.maxFlightTime.label }}</b>
                        </label>
                        <v-text-field
                          v-model.number="formData.maxFlightTime"
                          type="number"
                          :maxlength="formSetting.maxFlightTime.maxLength"
                          outlined
                          dense
                          :hide-spin-buttons="true"
                          :rules="formSetting.maxFlightTime.required ? [requiredValidation] : []"
                          variant="outlined"
                          @input="toFixedInputMaxFlightTime()"
                          @change="toFixedMaxFlightTime()"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- DIPS登録記号 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.dipsRegistrationCode.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.dipsRegistrationCode.label }}</b>
                        </label>
                        <v-text-field
                          v-model="formData.dipsRegistrationCode"
                          :maxlength="formSetting.dipsRegistrationCode.maxLength"
                          outlined
                          dense
                          :rules="formSetting.dipsRegistrationCode.required ? [requiredValidation] : []"
                          variant="outlined"
                          @change="changeFormData"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4">
                        <!-- 緯度 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.lat.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.lat.label }}</b>
                        </label>
                        <v-text-field
                          v-model.number="formData.lat"
                          class="coordinate"
                          type="number"
                          outlined
                          dense
                          :hide-spin-buttons="true"
                          :rules="formSetting.lat.required ? [latRangeValidation] : [latRangeValidation]"
                          variant="outlined"
                          @input="toFixedInputLat()"
                          @change="toFixedLat()"
                        >
                          <template #prepend>
                            <v-icon
                              size="x-large"
                              icon="mdi-map-marker"
                              @click="displayMapPopup"
                            />
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="4">
                        <!-- 経度 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.lon.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.lon.label }}</b>
                        </label>
                        <v-text-field
                          v-model.number="formData.lon"
                          class="coordinate"
                          type="number"
                          outlined
                          dense
                          :hide-spin-buttons="true"
                          :rules="formSetting.lon.required ? [lonRangeValidation] : [lonRangeValidation]"
                          variant="outlined"
                          @input="toFixedInputLon()"
                          @change="toFixedLon()"
                        />
                      </v-col>
                      <v-col cols="4">
                        <!-- 機体所有種別 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.ownerType.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.ownerType.label }}</b>
                        </label>
                        <v-select
                          v-model="formData.ownerType"
                          :items="formSetting.ownerType.options"
                          item-value="value"
                          item-title="title"
                          :rules="formSetting.ownerType.required ? [requiredValidation] : []"
                          variant="outlined"
                          @update:model-value="changeFormData"
                        />
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col cols="4">
                        <!-- 所有者ID -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.ownerId.required"
                            style="color: red"
                          >*</b>
                          <b>{{ formSetting.ownerId.label }}</b>
                        </label>
                        <v-text-field
                          v-model="formData.ownerId"
                          :maxlength="formSetting.ownerId.maxLength"
                          outlined
                          dense
                          :rules="formSetting.ownerId.required ? [requiredValidation] : []"
                          variant="outlined"
                          @change="changeFormData"
                        />
                      </v-col>
                      <v-col
                        cols="4"
                        style="align-content: center;"
                      >
                        <!-- 機体認証の有無 -->
                        <label class="form-label">
                          <b
                            v-if="formSetting.certification.required"
                            style="color: red"
                          >*</b>
                        </label>
                        <span style="display: flex;">
                          <v-checkbox
                            v-model="formData.certification"
                            hide-details="auto"
                            :label="formSetting.certification.label"
                            class="mx-2"
                            @change="changeFormData"
                          />
                        </span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-form>
            </v-container>
          </div>
          <!-- ページナビゲーション -->
          <PageNavigation
            :back="true"
            style="position: fixed;bottom: 0px;"
          >
            <ul
              class="e-buttonGroup"
              style="padding-right: 71px;"
            >
              <li v-if="isRegister">
                <button
                  class="e-button"
                  @click="onRegisterButtonClick"
                >
                  新規登録
                </button>
              </li>
              <li v-if="!isRegister">
                <button
                  class="e-button"
                  @click="onUpdateButtonClick"
                >
                  更新
                </button>
              </li>
              <li v-if="!isRegister">
                <button
                  class="e-button"
                  style="background-color: red !important;"
                  @click="onDeleteButtonClick"
                >
                  削除
                </button>
              </li>
            </ul>
          </PageNavigation>
          <!-- 入力破棄確認ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="destructionConfirmDialogVisible"
            title="入力した内容は破棄されます。"
            message="ページを「機体情報一覧」へ移動してよろしいですか"
            :dialog-type="constants.dialogType.confirm"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="いいえ"
                  @click="navigateCancel"
                />
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="はい"
                  @click="navigateOk"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 詳細取得失敗ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="getFailedDialogVisible"
            title="機体情報詳細取得 失敗"
            :message="errorDetail"
            :dialog-type="constants.dialogType.error"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="getFailedDialogVisible = false"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 地図ダイアログ -->
          <MapDialog
            v-model:dialog-visible="mapDialogVisible"
            :move-marker="true"
            :lat="formData.lat"
            :lon="formData.lon"
            @update-coordinates="updateCoordinates"
          />
          <!-- 登録確認ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="registerConfirmDialogVisible"
            title="機体登録"
            message="入力した内容で機体情報を登録してよろしいですか"
            :dialog-type="constants.dialogType.confirm"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="いいえ"
                  @click="registerConfirmDialogVisible = false"
                />
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="はい"
                  @click="registerAircraftInfo"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 登録完了ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="registerSuccessDialogVisible"
            title="機体登録 完了"
            message="機体情報の登録が完了しました"
            :dialog-type="constants.dialogType.info"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="forwardAircraftList"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 登録失敗ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="registerFailedDialogVisible"
            title="機体登録 失敗"
            :message="errorDetail"
            :dialog-type="constants.dialogType.error"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="registerFailedDialogVisible = false"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 更新確認ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="updateConfirmDialogVisible"
            title="機体更新"
            message="入力した内容で機体情報を更新してよろしいですか"
            :dialog-type="constants.dialogType.confirm"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="いいえ"
                  @click="updateConfirmDialogVisible = false"
                />
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="はい"
                  @click="updateAircraftInfo"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 更新完了ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="updateSuccessDialogVisible"
            title="機体更新 完了"
            message="機体情報の更新が完了しました"
            :dialog-type="constants.dialogType.info"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="forwardAircraftList"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 更新失敗ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="updateFailedDialogVisible"
            title="機体更新 失敗"
            :message="errorDetail"
            :dialog-type="constants.dialogType.error"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="updateFailedDialogVisible = false"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 削除確認ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="deleteConfirmDialogVisible"
            title="機体削除"
            message="機体情報を削除してよろしいですか"
            :dialog-type="constants.dialogType.confirm"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="いいえ"
                  @click="deleteConfirmDialogVisible = false"
                />
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="はい"
                  @click="deleteAircraftInfo"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 削除完了ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="deleteSuccessDialogVisible"
            title="機体削除 完了"
            message="機体情報の削除が完了しました"
            :dialog-type="constants.dialogType.info"
            @ok="forwardAircraftList"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="forwardAircraftList"
                />
              </v-row>
            </template>
          </CommonDialog>
          <!-- 削除失敗ダイアログ -->
          <CommonDialog
            v-model:dialog-visible="deleteFailedDialogVisible"
            title="機体削除 失敗"
            :message="errorDetail"
            :dialog-type="constants.dialogType.error"
          >
            <template #customDialogButton>
              <v-row>
                <v-btn
                  class="mx-2 dialog-button"
                  variant="outlined"
                  rounded="0"
                  size="large"
                  text="閉じる"
                  @click="deleteFailedDialogVisible = false"
                />
              </v-row>
            </template>
          </CommonDialog>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
input[type='number'] {
  text-align: right;
}
</style>
