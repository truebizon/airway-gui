<script setup>
// 航路運営者向けサイドバー
import GlobalNavigationRM from "~/components/navigation/globalNavigationRouteManager.vue";
// 運航事業者向けサイドバー
import GlobalNavigation from "~/components/navigation/globalNavigation.vue";
// 関係者向けサイドバー
import GlobalNavigationSH from "~/components/navigation/globalNavigationStakeholder.vue";
import PageNavigation from "../components/navigation/pageNavigation.vue"
import airwaySetting from "../components/airwayReservation/airwaySetting.vue"
import datetimeSetting from "../components/airwayReservation/datetimeSetting.vue"
import confirmation from "../components/airwayReservation/confirmation.vue"
import { roleVerification } from '~/composables/useRole.js'
import { ref } from "vue"
import { useRouter } from 'vue-router';
import LoadingDialog from '~/components/dialogs/LoadingSpiner.vue'

const step = ref(0)
const stepTitle = ref('航路予約')
const nextButton = ref('日時選択')
const isDialogVisible = ref(false)

const aircraftId = ref('')
const airwayId = ref('')
const purpose = ref('')
const type = ref('')
const aircraftInfo = ref('')
const aircraftInfoId = ref('')
const airwayName = ref('')
const junctionList = ref([])
const section = ref('')
const departurePort = ref('')
const arrivalPort = ref('')
const departurePortId = ref('')
const arrivalPortId = ref('')
const departurePortDegrees = ref('')
const arrivalPortDegrees = ref('')
const datetime = ref('')
const departure = ref('')
const arrival = ref('')
const postJsonData = ref('')
const postDepaturePortJsonData = ref('')
const postArrivalPortJsonData = ref('')
const postConformityAssessmentJsonData = ref('');
const postLinkageJsonData = ref('')
const cookie_role = ref(null)
const role = ref(null)
const reservationId = ref('')
const reservationOk = ref(true)
const datetimeSettingKey = ref(0)
const confirmationKey = ref(0)
const isEndIdFirst = ref(false)
const rangeData = {
  aircraftId,
  airwayId,
  purpose,
  type,
  aircraftInfo,
  aircraftInfoId,
  airwayName,
  junctionList,
  section,
  departurePort,
  arrivalPort,
  departurePortId,
  arrivalPortId,
  departurePortDegrees,
  arrivalPortDegrees,
  datetime,
  departure,
  arrival,
  postJsonData,
  postDepaturePortJsonData,
  postArrivalPortJsonData,
  isEndIdFirst,
};
const router = useRouter();
const isProcessing = ref(false);
const isLoading = useState('isLoading')// スピナー表示状態
// ローディング解除
isLoading.value = false;

const rolecheck = async () => {
  // ロールチェック
  const ownpage_role = ["2"];
  cookie_role.value = await roleVerification(ownpage_role);
  if (Object.keys(cookie_role).length == 0) {
    console.error(`airwayReservation get role error.`);
    return;
  }
  switch (cookie_role.value.virtual_role) {
    case "2":
      role.value = 2;  // 運航事業者
      break;
    default:
      role.value = null;
      break;
  }
  console.log(`virtual_role: ${cookie_role.value.virtual_role}, role: ${role.value}`);
}
if (process.client) {
  console.log(`process.client: ${process.client}`);
  rolecheck();
}

const handleAirwayDataUpdate = (airway) => {
  aircraftId.value = airway.aircraftId
  airwayId.value = airway.airwayId
  purpose.value = airway.purpose
  type.value = airway.type
  aircraftInfo.value = airway.aircraftInfo
  aircraftInfoId.value = airway.aircraftInfoId
  airwayName.value = airway.airwayName
  section.value = airway.section
  departurePort.value = airway.departurePort
  arrivalPort.value = airway.arrivalPort
  departurePortId.value = airway.departurePortId
  arrivalPortId.value = airway.arrivalPortId
  junctionList.value = airway.junctionList
  departurePortDegrees.value = airway.departurePortDegrees
  arrivalPortDegrees.value = airway.arrivalPortDegrees
  isEndIdFirst.value = airway.isEndIdFirst
}

const handleDatetimeUpdate = (departureDate, departureTime, arrivalTime) => {
  datetime.value = departureDate
  departure.value = departureTime
  arrival.value = arrivalTime
}

const handlePostJsonDataUpdate = (jsonData, DepaturePortJsonData, ArrivalPortJsonData) => {
  postJsonData.value = jsonData;
  postDepaturePortJsonData.value = DepaturePortJsonData;
  postArrivalPortJsonData.value = ArrivalPortJsonData;

  postConformityAssessmentJsonData.value = postJsonData.value.airwaySections.map(section => ({
    "airwaySectionId": section.airwaySectionId,
    "startAt": section.startAt,
    "endAt": section.endAt,
    "aircraftInfo": aircraftInfo.value,
  }));
  postLinkageJsonData.value = {
    "airwayReservationId": '',
      "uasId": {
      "registrationId": aircraftId.value,
      },
    "aircraftInfoId": aircraftInfoId.value,
  };
}

const navigate = (next) => {
  const stepNo = ref(next ? step.value + 1 : step.value - 1)
  const errorMessage = ref('')
  // 条件チェック関数
  const checkConditions = (step) => {
    const isInvalid = (value) => value === '' || value === '---';
    switch (step) {
      case 0:
        return true
      case 1:
        // ステップ1の条件チェック
        if (isInvalid(aircraftId.value) ||
            isInvalid(airwayId.value) ||
            isInvalid(purpose.value) ||
            isInvalid(type.value) ||
            isInvalid(airwayName.value) ||
            isInvalid(section.value) ||
            isInvalid(departurePort.value) ||
            isInvalid(arrivalPort.value) ||
            isInvalid(departurePortId.value) ||
            isInvalid(arrivalPortId.value) ||
            isInvalid(junctionList.value) ||
            isInvalid(aircraftInfo.value) ||
            isInvalid(aircraftInfoId.value)) {
          errorMessage.value = 'すべての項目を入力してください。'
          return false
        }
        return true;
      case 2:
        // ステップ2の条件チェック
        if (isInvalid(datetime.value) ||
            isInvalid(departure.value) ||
            isInvalid(arrival.value)) {
          errorMessage.value = '日時を選択してください。'
          return false
        }
        return true; 
      default:
        return true;
    }
  }

  if (!checkConditions(stepNo.value)) {
    // 条件が満たされていない場合はエラーメッセージを表示
    alert(errorMessage.value)
    return;
  }

  switch (stepNo.value) {
    case -1:
      console.log(stepNo.value)
      router.push('/airwayReservation');
      return
    case 0:
      nextButton.value = '日時選択'
      stepTitle.value = '航路予約'
      break
    case 1:
      nextButton.value = '予約確認'
      stepTitle.value = '航路予約'
      if (next) {
        datetime.value = ''
        departure.value = ''
        arrival.value = ''
        datetimeSettingKey.value = datetimeSettingKey.value + 1
      }
      break
    case 2:
      nextButton.value = '予約申請'
      stepTitle.value = '航路予約'
      if (next) confirmationKey.value = confirmationKey.value + 1
      break
    case 3:
      showModal()
      return
    default:
      return
  }
  step.value = stepNo.value
}
const showModal = async () => {
  // 初期化
  const postCommonHeader = {headers: {'Content-Type': 'application/json'}};
  const safetyApiBaseUrl = useRuntimeConfig().public.safetyApiBaseUrl;
  const droneApiBaseUrl = useRuntimeConfig().public.droneApiBaseUrl;
  const reservationApiBaseUrl = useRuntimeConfig().public.reservationApiBaseUrl;
  let reservationFailed = false;
  let depaturePortReserved = false;
  let arrivalPortReserved = false;
  let airwayPortReserved = false;
  let portDepatureReservationId = '';
  let portArrivalReservationId = '';
  let airwayReservationId = '';

  // 予約正常系
  try {
    // 予約申請ボタン無効化
    isProcessing.value = true;
    console.log(`予約申請ボタン無効化:${isProcessing.value}`);
    // ローディング開始
    isLoading.value = true;
    console.log(`予約申請ローディング開始:${isLoading.value}`);
    // 1. 適合性評価
    console.log("postConformityAssessment",postConformityAssessmentJsonData.value);
    const conformityAssessmentUrl = `${safetyApiBaseUrl}/conformity-assessment`;
    for (const data of postConformityAssessmentJsonData.value) {
      console.log(data);
      const conformityAssessmentRes = await axios_post(conformityAssessmentUrl, data, {});
      if (conformityAssessmentRes.status !== 200) {
        throw new Error(`1. failed to post conformityAssessment info, status: ${conformityAssessmentRes.status}`);
      }
      // 適合性評価の結果を確認
      if (conformityAssessmentRes.data.evaluationResults == 'false') {
        throw new Error(`1. conformityAssessment is false, status: ${conformityAssessmentRes.data.reasons}`);
      }
    }
    console.log("1. conformity-assessment OK");

    // 2. 離陸ポート予約
    const portUrl = `${droneApiBaseUrl}/droneport/reserve`;
    const depaturePortRes = await axios_post(portUrl, postDepaturePortJsonData.value, {});
    if (depaturePortRes.status !== 200) {
      throw new Error(`2. failed to post depaturePort info, status: ${depaturePortRes.status}`);
    }
    portDepatureReservationId = depaturePortRes.data.dronePortReservationIds[0];
    depaturePortReserved = true;
    console.log("2. depature port reservation OK");

    // 3. 着陸ポート予約
    const arrivalPortRes = await axios_post(portUrl, postArrivalPortJsonData.value, {});
    if (arrivalPortRes.status !== 200) {
      throw new Error(`3. failed to post arrivalPort info, status: ${arrivalPortRes.status}`);
    }
    portArrivalReservationId = arrivalPortRes.data.dronePortReservationIds[0];
    arrivalPortReserved = true;
    console.log("3. arrival port reservation OK");

    // 4. 航路予約
    const reservationUrl = `${reservationApiBaseUrl}/airwayReservations`;
    const reservationRes = await axios_post(reservationUrl, postJsonData.value, postCommonHeader);
    if (reservationRes.status !== 200) {
      throw new Error(`4. failed to post airway reservation info, status: ${reservationRes.status}`);
    }
    airwayReservationId = reservationRes.data.airwayReservationId;
    reservationId.value = airwayReservationId;
    airwayPortReserved = true;
    console.log("4. airway reservation OK");

    // 予約直後に紐づけAPIを送ると失敗するため、暫定で待機とリトライ処理を入れる。
    const waitTimeLinkage = useRuntimeConfig().public.airwayReservationWaittimeBeforeLinkage; // 単位は秒
    const sleepBeforeLinkage = (time) => new Promise((resolve) => setTimeout(resolve, time)); // 引数の単位はミリ秒
    await sleepBeforeLinkage(waitTimeLinkage * 1000);
    const retryCountLinkage = useRuntimeConfig().public.airwayReservationRetryCountBeforeLinkage; // リトライ回数

    // 5. 航路予約IDとリモートIDの紐付け
    postLinkageJsonData.value.airwayReservationId = airwayReservationId;
    console.log("postLinkageJsonData", postLinkageJsonData.value);
    const ignoreLinkageFailure_ = useRuntimeConfig().public.airwayReservationIgnoreLinkageFailure; // TODO: 紐づけAPIが正常動作するようになれば、左記の行は削除してOK
    const ignoreLinkageFailure = (isNaN(ignoreLinkageFailure_))? false : Boolean(Number(ignoreLinkageFailure_)); // TODO: 紐づけAPIが正常動作するようになれば、左記の行は削除してOK
    console.log("ignoreLinkageFailure:", ignoreLinkageFailure); // TODO: 紐づけAPIが正常動作するようになれば、左記の行は削除してOK
    const linkageUrl = `${safetyApiBaseUrl}/linkage`;
    const linkageRes = await axios_post(linkageUrl, postLinkageJsonData.value, {});
    if (linkageRes.status !== 201) {
      for (let i = retryCountLinkage; i > 0; i--) {
        await sleepBeforeLinkage(waitTimeLinkage * 1000);
        const linkageResRetry = await axios_post(linkageUrl, postLinkageJsonData.value, {});
        if (linkageResRetry.status !== 201) {
          if (i == 1) {
            if (!ignoreLinkageFailure) // TODO: 紐づけAPIが正常動作するようになれば、左記の行は削除してOK
            throw new Error(`5. failed to link airwayReservationId and remoteId, status: ${linkageRes.status}`);
          }
          continue;
        } else {
          console.log("5. link airwayReservationId and remoteId OK");
          console.log(`retry count = ${i}`);
          break;
        }
      }  
    } else {
      console.log("5. link airwayReservationId and remoteId OK");
    }

    // 6. ポート予約IDと航路予約IDを紐づけDBへ登録
    const postInsertIdJsonData = {
      "airwayReservationId": airwayReservationId,
      "dronePortReservationIdFrom": portDepatureReservationId,
      "dronePortReservationIdTo": portArrivalReservationId,
      "aircraftRemoteId": aircraftId.value,
      "aircraftInfo": aircraftInfo.value,
    }
    console.log("postInsertIdJsonData",postInsertIdJsonData);
    const insertIdUrl = '/api/insertAirwayReservationIdWith';
    const insertIdRes = await axios_post(insertIdUrl, postInsertIdJsonData, postCommonHeader);
    if (insertIdRes.status !== 200) {
      throw new Error(`6. failed to post insertId info, status: ${insertIdRes.status}`);
    }
    console.log("6. DB insert OK");
  } catch (error) {
    console.error(error);
    reservationFailed = true;
    reservationOk.value = false;
  } // end of 予約正常系

  // 予約異常系
  if (reservationFailed) {
    // 予約に成功した各種予約をキャンセル
    //   各キャンセル操作に失敗しても処理を継続する
    //   共通関数 axios_XXX は例外を throw しないため、以下の実装において特に try-catch は行わない

    // 離陸ポート予約をキャンセル
    if (depaturePortReserved) {
      const portDepatureUrl = `${droneApiBaseUrl}/droneport/reserve/${portDepatureReservationId}`;
      const deleteDepaturePortRes = await axios_delete_body(portDepatureUrl, {operatorId: postDepaturePortJsonData.value.operatorId});
      if (deleteDepaturePortRes.status === 200) {
        console.log('[ROLLBACK] deleteDepaturePort OK');
      } else {
        console.error(`[ROLLBACK] failed to post deleteDepaturePort info, status: ${deleteDepaturePortRes.status}`);
      }
    }

    // 着陸ポート予約をキャンセル
    if (arrivalPortReserved) {
      const portArrivalUrl = `${droneApiBaseUrl}/droneport/reserve/${portArrivalReservationId}`;
      const deleteArrivalPortRes = await axios_delete_body(portArrivalUrl, {operatorId: postArrivalPortJsonData.value.operatorId});
      if (deleteArrivalPortRes.status === 200) {
        console.log('[ROLLBACK] deleteArrivalPort OK');
      } else {
        console.error(`[ROLLBACK] failed to post deleteArrivalPort info, status: ${deleteArrivalPortRes.status}`);
      }
    }

    // 航路予約をキャンセル
    //   新規航路予約が可能なロールは運航事業者のみの想定のため、キャンセル操作のみ実装しておく(撤回操作は実装していない)
    if (airwayPortReserved) {
      const urlCancel = `${reservationApiBaseUrl}/airwayReservations/${airwayReservationId}/cancel`;
      let res = await axios_put(urlCancel, {}, postCommonHeader);
      if (res.status === 200) {
        console.log('[ROLLBACK] airwayReservation cancel OK');
      } else {
        console.error(`[ROLLBACK] failed to cancel airwayReservation, ${res.status}`);
      }
    }
  } // end of 予約異常系

  // 予約申請ボタン無効化解除
  isProcessing.value = false;
  console.log(`予約申請ボタン無効化解除:${isProcessing.value}`);
  // ローディング終了
  isLoading.value = false;
  console.log(`予約申請ローディング終了:${isLoading.value}`);
  // ここまで来たら、ダイアログを表示
  isDialogVisible.value = true;
};


</script>

<template>
    <ClientOnly>
      <!-- 読み込み中表示スピナー -->
      <LoadingDialog v-model:dialog-visible="isLoading" />
    </ClientOnly>
    <!-- グローバルナビゲーション -->
    <GlobalNavigationRM v-if = "role == 1"/>
    <GlobalNavigation v-if = "role == 2" />
    <GlobalNavigationSH v-if = "role == 3" />

    <!-- コンテンツ -->
    <main id="main" class="b-pageMain">
      <div class="b-pageContentHasSubMenu">

        <!-- メインコンテンツ -->
        <div class="b-pageContentHasNavigation">

          <v-stepper v-model="step">
            <v-stepper-header>

              <div class="drn_header">
                <div class="drn_header__item">
                  <v-card-title class="drn_header__title">{{ stepTitle }}</v-card-title>
                </div>
              </div>

              <v-stepper-item
              :complete="step > 0"
              title="航路選択"
              value="1"
              ></v-stepper-item>
              <v-divider></v-divider>

              <v-stepper-item
              :complete="step > 1"
              title="日時選択"
              value="2"
              ></v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
              :complete="step > 2"
              title="予約内容確認"
              value="3"
              ></v-stepper-item>

              <div class="drn_stepper_header__space"> </div> <!-- spacer -->
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item
              value="1"
              >
                <airwaySetting :stepNo="1" @update:airway="handleAirwayDataUpdate"/>
              </v-stepper-window-item>
              <v-stepper-window-item
              value="2"
              >
                <datetimeSetting :key="datetimeSettingKey" :rangeData="rangeData" @update:datetime="handleDatetimeUpdate"/>
              </v-stepper-window-item>
              <v-stepper-window-item
              value="3"
              >
                <confirmation :stepNo="3" :key="confirmationKey" :rangeData="rangeData" :roleData="cookie_role" @update:postJsonData="handlePostJsonDataUpdate"/>
              </v-stepper-window-item>
            </v-stepper-window>
          </v-stepper>
        </div>
        <!-- ページナビゲーション -->
        <PageNavigation :back="false">
          <ul class="e-buttonGroup">
            <li>
              <button @click="navigate(true)" class="e-button" :disabled="isProcessing">{{ nextButton }}</button>
            </li>
          </ul>
          <ul  class="e-buttonGroup">
            <li>
              <button class="e-button-back" @click="navigate(false)">戻る</button>
            </li>
          </ul>
        </PageNavigation> 
        <!-- オーバーレイ -->
        <div v-if="isDialogVisible" class="overlay"></div>
        <!-- ダイアログ -->
        <dialog class="c-dialog" v-if="isDialogVisible">
          <!-- 航路予約に成功した場合 -->
          <h2 class="e-dialogTitle" v-if="reservationOk">航路予約完了</h2>
          <p v-if="reservationOk">航路予約を完了しました</p>
          <table class="drn_table drn_table--reserve_conf" v-if="reservationOk">
            <tbody>
              <tr class="drn_table__row">
                <th class="drn_table__label">予約番号：</th>
                <td class="drn_table__data">{{ reservationId }}</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路：</th>
                <td class="drn_table__data">{{ airwayName }}</td>
              </tr>
              <tr class="drn_table__row">
                <th class="drn_table__label">航路発着日時：</th>
                <td class="drn_table__data">
                  <time>{{ datetime }}</time>
                  <time>{{ departure }}</time
                  ><span class="e-waveLine">から</span>
                  <time>{{ arrival }}</time>
                </td>
               </tr>
            </tbody>
          </table>
          <!-- 航路予約に失敗した場合 -->
          <h2 class="e-dialogTitle" v-if="!reservationOk">航路予約失敗</h2>
          <p v-if="!reservationOk">航路予約に失敗しました。<br>しばらく時間をあけて再度実行をお願いします。</p>
          <!-- 航路予約の成否に関わらず共通 -->
          <ul class="e-buttonGroup">
            <li v-if="reservationOk">
              <a href="/airwayReservation/newReservation" class="e-button-noright">続けて航路予約</a>
            </li>
            <li>
              <a href="/airwayReservation" class="e-button-noright">航路予約一覧</a>
            </li>
          </ul>
        </dialog>
      </div>
    </main>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* 黒で透過 */
  z-index: 999; /* ダイアログの下に表示 */
}

.c-dialog {
  z-index: 1000; /* オーバーレイの上に表示 */
  position: fixed;
  height: 60%;
  min-height: 8rem;
  width: 80%;
}

</style>
