
import { onMounted, watch, ref } from 'vue'
import { useMqtt } from '~/composables/useMqtt'
import { useDateString1 } from '~/composables/useDateString'
import { axios_get } from '~/composables/useAPI'

const chartData = ref([]);

async function fetchAirwayReservationId(dronePortReservationId) {
  let airwayReservationId = '';
  if (dronePortReservationId) {
    try {
      const url = '/api/getAirwayReservationIdFrom';
      let response = await axios_get(url, {id: dronePortReservationId}, {});
      if (response.status === 200) {
        const rsvId = response.data.id;
        if (rsvId !== '') airwayReservationId = rsvId;
      } else {
        console.error(`error: getAirwayReservationIdFrom {status: ${response.status}}.`);
      }
    } catch (err) {
      console.error('Error: fetchAirwayReservationId: ', err);
    }
  }
  return airwayReservationId;
}

export function useGetNotice() {
  try {
const { latestMessage, topicName, connectMqtt } = useMqtt();
const notifyStored = localStorage.getItem("noticeDB")  || '[]';
const airwayEvaluationStored = localStorage.getItem("airwayEvaluationDB")  || '[]';
let data = ref();
const notifyData = ref(JSON.parse(notifyStored));
const maxId = notifyData.value.length ? Math.max(...notifyData.value.map(route => route.id)) : 0;
const airwayEvaluationData = ref(JSON.parse(airwayEvaluationStored));
const routeCurrentId = ref(maxId + 1);

onMounted( () => {
  connectMqtt([
    'airway/operator/+/airwayEvaluationNotify/+',
    'airway/operator/+/airwayDeviationNotification',
    'airway/operator/+/airwayReservation/+',
    'airway/operator/+/vis/droneport/+/+/cmd'
  ])
  console.log("接続");
})

watch([latestMessage, topicName], ([newMsg, newTopic]) => {
  if (!newMsg){ return } // newMsg が空の場合は何もしない
  const storedBadge = localStorage.getItem('notificationBadge');

  console.log('latestMessage:', newMsg);
  console.log('topicName:', newTopic);

  const currentDate = new Date();
  const notifyDate = useDateString1(currentDate);
  let msg = JSON.parse(newMsg);
  const tokens = newTopic.split('/');
  if (tokens.length >= 0) {
    if (tokens[3] === 'airwayEvaluationNotify') {
      let airwayName = useAirwayGetAirwayNameFromAirwayId(chartData.value,msg.airwayReservationId);
      let notifyType = '';
      if(msg.evaluationResults === true){
        notifyType = "　運航中　";
      }else{
        switch (msg.type) {
          case "weather":
            notifyType = "気象異常";
            break;
          case "event":
            notifyType = "規制イベント";
            break;
          case "railway":
            notifyType = "鉄道異常";
            break;
          case "intrusion":
            notifyType = "人立ち入り";
            break;
          default:
            notifyType = msg.type;
            break;
        }
      }

      let airwayEvaluationType = '';
      let reasons = '';
      if(msg.evaluationResults === true){
        airwayEvaluationType = "　運航中　";
        reasons = ""
      }else{
        airwayEvaluationType = msg.type;
        reasons = msg.reasons;
      }
      
      const addAirwayEvaluationRoute = {
        receiveTime: currentDate,
        reservationId: msg.airwayReservationId,
        evaluationResults: msg.evaluationResults,
        type: airwayEvaluationType,
        reasons: reasons
      }
      
      airwayEvaluationData.value.push(addAirwayEvaluationRoute);
      localStorage.setItem('airwayEvaluationDB', JSON.stringify(airwayEvaluationData.value));

      const addRoute = {
        id: routeCurrentId.value,
        notifyDate: notifyDate,
        reservationId: msg.airwayReservationId,
        notifyType: notifyType,
        airwayName: airwayName
      }

      notifyData.value.push(addRoute);
      routeCurrentId.value ++;
      localStorage.setItem('noticeDB', JSON.stringify(notifyData.value));
      data = notifyData;
      if (!storedBadge) {
        // null の場合はローカルストレージから削除する
        localStorage.setItem('notificationBadge', String("1"));
      } else {
        // 数値を文字列化して保存する
        localStorage.setItem('notificationBadge', String(parseInt(storedBadge, 10) + 1));
      }
    } else if (tokens[3] === 'airwayDeviationNotification') {
      let airwayName = useAirwayGetAirwayNameFromAirwayId(chartData.value,msg.airwayReservationId);
      let notifyType = '';
      if(msg.evaluationResults === true){
        notifyType = "　運航中　";
      }else{
        notifyType = "航路逸脱";
      }

      const addRoute = {
        id: routeCurrentId.value,
        notifyDate: notifyDate,
        reservationId: msg.airwayReservationId,
        notifyType: notifyType,
        airwayName: airwayName
      }

      notifyData.value.push(addRoute);
      routeCurrentId.value ++;
      localStorage.setItem('noticeDB', JSON.stringify(notifyData.value));
      data = notifyData;

      if (!storedBadge) {
        // null の場合はローカルストレージから削除する
        localStorage.setItem('notificationBadge', String("1"));
      } else {
        // 数値を文字列化して保存する
        localStorage.setItem('notificationBadge', String(parseInt(storedBadge, 10) + 1));
      }

    } else if (tokens[3] === 'airwayReservation') {
      let airwayName = useAirwayGetAirwayNameFromAirwayId(chartData.value,msg.airwayReservationId);
      let notifyType = '';
      if(msg.evaluationResults === true){
        notifyType = "　運航中　";
      }else{
        switch (msg.status) {
          case "AVAILABLE":
            notifyType = "予約可能";
            break;
          case "RESERVED":
            notifyType = "予約済み";
            break;
          case "CANCELED":
            notifyType = "（運航者から）取消済み";
            break;
          case "RESCINDED":
            notifyType = " （航路運営者から）撤回済み";
            break;
          default:
            notifyType = msg.status;
            break;
        }
      }

      const addRoute = {
        id: routeCurrentId.value,
        notifyDate: notifyDate,
        reservationId: msg.airwayReservationId,
        notifyType: notifyType,
        airwayName: airwayName
      }

      notifyData.value.push(addRoute);
      routeCurrentId.value ++;
      localStorage.setItem('noticeDB', JSON.stringify(notifyData.value));
      data = notifyData;
      if (!storedBadge) {
        // null の場合はローカルストレージから削除する
        localStorage.setItem('notificationBadge', String("1"));
      } else {
        // 数値を文字列化して保存する
        localStorage.setItem('notificationBadge', String(parseInt(storedBadge, 10) + 1));
      }
    } else if (tokens[4] === 'droneport') {
      const dronePortReservationId = msg.dronePortReservationId;
      const requestKind = msg.requestKind;

      fetchAirwayReservationId(dronePortReservationId)
      .then((res) => {
        console.log('[mqtt] res:', res);
        const airwayReservationId = res;
        if (airwayReservationId === '') {
          console.error('Error: airwayReservationId empty, portId:', dronePortReservationId);
        } else {
          let airwayName = useAirwayGetAirwayNameFromAirwayId(chartData.value, airwayReservationId);

          let notifyType = '';
          switch (requestKind) {
          case 0: notifyType = '離陸準備指示'; break;
          case 1: notifyType = '着陸準備指示'; break;
          case 2: notifyType = '離陸通知'; break;
          case 3: notifyType = '着陸通知'; break;
          case 4: notifyType = '離陸キャンセル通知'; break;
          case 5: notifyType = '着陸キャンセル通知'; break;
          default: break;
          }

          const addRoute = {
            id: routeCurrentId.value,
            notifyDate: notifyDate,
            reservationId: airwayReservationId,
            notifyType: notifyType,
            airwayName: airwayName
          }

          notifyData.value.push(addRoute);
          routeCurrentId.value ++;
          localStorage.setItem('noticeDB', JSON.stringify(notifyData.value));
          data = notifyData;
          console.log('[mqtt] recv droneport topic:', airwayReservationId, dronePortReservationId, notifyType, airwayName);
          if (!storedBadge) {
            localStorage.setItem('notificationBadge', String("1"));
          } else {
            localStorage.setItem('notificationBadge', String(parseInt(storedBadge, 10) + 1));
          }
        }
      })
      .catch((err) => {
        console.error('Error: airwayReservationId empty, portId:', dronePortReservationId);
      })
    } else {
      console.log('想定外のトピックです:', newTopic);
    }
  } else {
    console.log('トピックの形式が不正です:', newTopic);
  }
})
  return {
    data,           // 通知リスト
    routeCurrentId, // 連番ID
  }
} catch (err) {
  // useGetNotice() の「setup 処理」全体で発生したエラーを捕捉
  console.error('useGetNotice() 内部でエラーが発生:', err);
  // 必要に応じて throw する
  throw err;
}
}