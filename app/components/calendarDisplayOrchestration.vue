<template>
  <div>
    <FullCalendar ref="fullCalendarRef" :options="calendarOptions"/>
    <div v-if="showPopup" class="popup" :style="popupStyle">
      <p>{{ popupEvent.title }}</p>
      <p>{{ popupEvent.start }}~{{ popupEvent.end }}</p>
      <p v-if="popupEvent.classNames === 'aiway-all'">航路: {{ popupEvent.airwayName }}</p>
      <p v-if="popupEvent.classNames === 'aiway-all'">離陸場: ---</p>
      <p v-if="popupEvent.classNames === 'aiway-all'">陸場: ---</p>

      <p v-if="popupEvent.classNames === 'airway-port-all'">航路: {{ popupEvent.airwayName }}</p>
      <p v-if="popupEvent.classNames === 'airway-port-all'">離陸場: {{ popupEvent.departurePort }}</p>
      <p v-if="popupEvent.classNames === 'airway-port-all'">陸場: {{ popupEvent.arrivalPort }}</p>

      <p v-if="popupEvent.classNames === 'airway-port-departure'">航路: {{ popupEvent.airwayName }}</p>
      <p v-if="popupEvent.classNames === 'airway-port-departure'">離陸場: {{ popupEvent.departurePort }}</p>
      <p v-if="popupEvent.classNames === 'airway-port-departure'">陸場: ---</p>

      <p v-if="popupEvent.classNames === 'airway-port-arrival'">航路: {{ popupEvent.airwayName }}</p>
      <p v-if="popupEvent.classNames === 'airway-port-arrival'">離陸場: ---</p>
      <p v-if="popupEvent.classNames === 'airway-port-arrival'">陸場: {{ popupEvent.arrivalPort }}</p>

      <p v-if="popupEvent.classNames === 'port-all'">航路: ---</p>
      <p v-if="popupEvent.classNames === 'port-all'" >離陸場: {{ popupEvent.departurePort }}</p>
      <p v-if="popupEvent.classNames === 'port-all'">陸場: {{ popupEvent.arrivalPort }}</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';

export default {
  components: {
    FullCalendar,
  },
  props: {
    newEvent: {
      type: Object,
      required: true
    },
    reservationData: {
      type: Object,
      required: true
    },
    airwayData: {
      type: Object,
      required: true
    },
    airwayId: {
      type: String,
      required: true
    },
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    },
    departurePort: {
      type: String,
      required: true
    },
    arrivalPort: {
      type: String,
      required: true
    },
    portsReservationData: {
      type: Object,
      required: true
    },
    isEndIdFirst: {
      type: Boolean,
      required: true
    },
  },
  setup(props, { expose, emit  }) {
    const dialogVisible = ref(false);
    const newEvent = ref({ title: '', start: '', end: '', color: '' });
    const events = ref([]);
    const operatorData = ref(null);

    const reserveList = [];

    const loadEvent = async (start, end) => {
      if(props.isEndIdFirst){
        // startとendの中身を入れ替える
        [start, end] = [end, start];
      }
      let sectionList = useAirwayGetSectionIdListFromCorridorPointList(props.airwayData, [start, end], props.airwayId);
      props.reservationData.forEach((reserve, index) => {
        
        let hitReserve = false;
        reserve['airwaySections'].forEach((section) => {
          if (sectionList.includes(section["airwaySectionId"])) {
            hitReserve = true;
          }
        })
        if (hitReserve && reserve.status === "RESERVED") {
          reserveList.push({ ...reserve, index: index });
        }
      })

      // 事業者一覧取得
      const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
      const operatorUrl = `${miscApiBaseUrl}/operator`;
      const operatorRes = await axios_get(operatorUrl);
      if (operatorRes.status === 200 && operatorRes.data != undefined) {
        operatorData.value = operatorRes.data;
        console.log(`operatorData: ${JSON.stringify(operatorData.value)}`);
      } else {
        console.error(`error: get operator info {status: ${operatorRes.status}}.`);
        return;
      }

      reserveList.forEach((reserve) => {
      let classNames = 'aiway-all';
      const startAt = reserve['airwaySections'][0]['startAt'];
      const endAt = reserve['airwaySections'][0]['endAt'];
      const companyName = getcompanyName(operatorData.value, reserve['operatorId']);
      const matchingStartPort = props.portsReservationData.data.find(port => 
        port.reservationTimeFrom === startAt && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort)
      );
      const matchingEndtPort = props.portsReservationData.data.find(port => 
        port.reservationTimeTo === endAt && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort)
      );

      if (matchingStartPort && matchingEndtPort) {
        classNames = 'airway-port-all';
      } else {
        const startMatch = props.portsReservationData.data.some(port => port.reservationTimeFrom === startAt && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort));
        const endMatch = props.portsReservationData.data.some(port => port.reservationTimeTo === endAt && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort));

        if (startMatch && !endMatch) {
          classNames = 'airway-port-departure';
        } else if (!startMatch && endMatch) {
          classNames = 'airway-port-arrival';
        }
      }

      events.value.push({
        id: reserve.index,
        title: companyName,
        start: useDateStringUTCtoLocal(startAt).slice(0, 19),
        end: useDateStringUTCtoLocal(endAt).slice(0, 19),
        color: '#D3D3D380',
        textColor: '#333333',
        classNames: classNames,
      });
    });
    props.portsReservationData.data.forEach(port => {
      const isMatched = reserveList.some(reserve => 
        reserve['airwaySections'][0]['startAt'] === port.reservationTimeFrom ||  
        reserve['airwaySections'][0]['endAt'] === port.reservationTimeTo
      );
      if (!isMatched && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort))  {
        events.value.push({
          title: getcompanyName(operatorData.value, port.operatorId),
          start: useDateStringUTCtoLocal(port.reservationTimeFrom).slice(0, 19),
          end: useDateStringUTCtoLocal(port.reservationTimeTo).slice(0, 19),
          color: '#D3D3D380',
          textColor: '#333333',
          classNames: 'port-all',
        });
      }
      })
    }

    const currentView = ref('timeGridWeek');
    const fullCalendarRef = ref(null);

    const showPopup = ref(false);
    const popupEvent = ref({});
    const popupStyle = ref({});
    const popupElement = ref(null);

    const handleEventMouseEnter = (info) => {

      const extractTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }

      const startTime = extractTime(info.event.start);
      const endTime = extractTime(info.event.end);

      const extractTimeFromISO = (isoString) => {
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5); // "HH:MM"形式に変換
      };

      const departurePort = props.portsReservationData.data.find(port => extractTimeFromISO(port.reservationTimeFrom) === startTime && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort) && port.usageType === 1)?.dronePortName || '---';
      const arrivalPort = props.portsReservationData.data.find(port => extractTimeFromISO(port.reservationTimeTo ) === endTime && (port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort) && port.usageType === 2)?.dronePortName || '---';

      let airwayName = '---';
      if (info.event.id && props.reservationData[info.event.id]?.airwayReservationId) {
        let airwayId = useAirwayGetAirwayIdFromSectionId(props.airwayData, props.reservationData[info.event.id]['airwaySections'][0]['airwaySectionId']) // 予約に含まれる航路区画IDをもとに航路IDを特定
        airwayName = useAirwayGetAirwayNameFromAirwayId(props.airwayData, airwayId);
      }
      popupEvent.value = {
        title: info.event.title,
        start: startTime,
        end: endTime,
        classNames: info.event.classNames.join(' '), // 配列を文字列に変換,
        airwayName: airwayName,
        departurePort: departurePort,
        arrivalPort: arrivalPort,
      };

      const eventElement = info.el.getBoundingClientRect();

      const popupWidth = 200; // ポップアップの幅を設定
      const windowWidth = window.innerWidth;

      let left = eventElement.right + 10; // デフォルトはイベントの右側に表示
      if (left + popupWidth > windowWidth) {
       left = eventElement.left - popupWidth - 10; // 右端に切れそうな場合は左側に表示
      }

      popupStyle.value = {
        position: 'fixed',
        top: `${eventElement.top + window.scrollY}px`,
        left: `${left}px`
      };
      showPopup.value = true;
    };

    const handleEventMouseLeave = () => {
      showPopup.value = false;
    };

    const calendarOptions = ref({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: currentView.value,
      locales: [jaLocale],
      locale: 'ja',
      customButtons: {
        calendarcontrol: {
          text: 'カレンダー',
          click: function() {
            const calendarApi = fullCalendarRef.value.getApi();
            if (currentView.value === 'timeGridWeek') {
              currentView.value = 'dayGridMonth';
              calendarApi.changeView('dayGridMonth');
            } else {
              currentView.value = 'timeGridWeek';
              calendarApi.changeView('timeGridWeek');
           }
          }
        }
      },
      headerToolbar: {
        start: 'calendarcontrol today prev next title',
        center: '',
        end: '',
      },
      events: events.value,
      allDaySlot: false,
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false,
        hour12: false
      },
      eventMouseEnter: handleEventMouseEnter,
      eventMouseLeave: handleEventMouseLeave,
      datesSet: (info) => {
        setCustomTitle(info);
        highlightTodayHeader(props.newEvent.departureDate);
      },
      dayHeaderContent: (arg) => {
        if (currentView.value === 'timeGridWeek') {
          const date = new Date(arg.date);
          const day = date.getDate().toString().padStart(2, '0');
          const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' });
          return {
            html: `<span>${day}</span><span>${weekday}</span>`
          };
        }else {
          const date = new Date(arg.date);
          const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' });
          return {
            html: `<span>${weekday}</span>`
          };
        }
      },

      eventContent: function(arg) {
        let timeText = arg.timeText.replace('時', ':00');
        return { html: `<div class="fc-event-time">${timeText}</div><div class="fc-event-title">${arg.event.title}</div>` };
      },
      eventDidMount: function(info) {
        // ブロックイベントにクラスを変更
        if (!info.event.allDay && !info.event.end) {
          info.el.classList.remove('fc-daygrid-dot-event');
          info.el.classList.add('fc-daygrid-block-event');
        }
        // イベントの色を設定
        info.el.style.backgroundColor = info.event.extendedProps.color || info.event.backgroundColor;
        info.el.style.color = info.event.extendedProps.textColor || info.event.textColor;
      }
    });

    const updatePopupPosition = () => {
      if (showPopup.value && popupElement.value) {
        const eventElement = document.querySelector('.fc-event-clicked').getBoundingClientRect();

        const popupWidth = 200; // ポップアップの幅を設定
        const windowWidth = window.innerWidth;

        let left = eventElement.right + 10; // デフォルトはイベントの右側に表示
        if (left + popupWidth > windowWidth) {
          left = eventElement.left - popupWidth - 10; // 右端に切れそうな場合は左側に表示
        }

        popupStyle.value = {
          position: 'fixed',
          top: `${eventElement.top + window.scrollY}px`,
          left: `${left}px`
        };
      }
    };

    onMounted(() => {
      window.addEventListener('scroll', updatePopupPosition);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', updatePopupPosition);
    });

    const setCustomTitle = (info) => {
      const titleElement = document.querySelector('.fc-toolbar-title');
      if (currentView.value === 'timeGridWeek') {
        const start = new Date(info.start);
        const end = new Date(info.end);
        end.setDate(end.getDate() - 1); // 1日減らす
        const startDate = start.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
        const endDate = end.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
        if (titleElement) {
          titleElement.textContent = ''; // ここでデフォルトのタイトルをクリア
          // 少し待機してからカスタムタイトルを設定
          setTimeout(() => {
            titleElement.textContent = `${startDate} ～ ${endDate}`;
          }, 100);
        }
      }else {
        const titleMonth = info.view.title;    
        if (titleElement) {
          titleElement.textContent = ''; // ここでデフォルトのタイトルをクリア
          setTimeout(() => {
            titleElement.textContent = titleMonth; // ここでデフォルトのタイトルを設定
          }, 100);
        }
      }
    };
    // 初期表示時にカスタムタイトルを設定
    onMounted(() => {
      const calendarApi = fullCalendarRef.value.getApi();
      const currentView = calendarApi.view;
      setTimeout(() => {
        setCustomTitle({ start: currentView.activeStart, end: currentView.activeEnd, view: currentView });
      }, 300);
    });

    function highlightTodayHeader(departureDate) {
      const today = new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '-');
      const headerCells = document.querySelectorAll('.fc-col-header-cell');

      // すべてのspanElementのスタイルを元に戻す
      headerCells.forEach(cell => {
        const spanElement = cell.querySelector('span');
        if (spanElement) {
          spanElement.style.color = ''; 
          spanElement.style.backgroundColor = ''; 
          spanElement.style.borderRadius = ''; 
          spanElement.style.padding = ''; 
          spanElement.style.display = ''; 
          spanElement.style.width = ''; 
          spanElement.style.height = ''; 
          spanElement.style.textAlign = ''; 
        }
       });

      headerCells.forEach(cell => {
        const cellDate = cell.getAttribute('data-date');
        if (cellDate === today || cellDate === departureDate) {
          const spanElement = cell.querySelector('span');
         if (spanElement) {
          spanElement.style.color = '#ffffff'; 
          spanElement.style.backgroundColor = '#000000'; 
          spanElement.style.borderRadius = '50%'; 
          spanElement.style.padding = '5px'; 
          spanElement.style.display = 'inline-block'; 
          spanElement.style.width = '35px'; 
          spanElement.style.height = '35px'; 
          spanElement.style.textAlign = 'center'; 
          }
        }
      });
    }

const checkOverlap = (newEvent) => {
    console.log('checkOverlap called with newEvent:', newEvent);
    const newStart = new Date(`${newEvent.departureDate}T${newEvent.departureTime}`).getTime();
    const newEnd = new Date(`${newEvent.arrivalDate}T${newEvent.arrivalTime}`).getTime();

    // newStartがnewEndの前であるかのチェック
    if (newStart >= newEnd) {
        return 2; // NG
    }

    // reserveList(航路予約)をチェック
    for (const reserve of reserveList) {
        const reserveStart = new Date(reserve['airwaySections'][0]['startAt']).getTime();
        const reserveEnd = new Date(reserve['airwaySections'][0]['endAt']).getTime();

        if ((newStart >= reserveStart && newStart < reserveEnd) || 
            (newEnd > reserveStart && newEnd <= reserveEnd) || 
            (newStart <= reserveStart && newEnd >= reserveEnd)) {
            return 3; // 重複あり
        }
    }
   
    // portsReservationData(ポート予約)をチェック
    const filteredPortsData = props.portsReservationData.data.filter(port => 
      port.dronePortName === props.departurePort || port.dronePortName === props.arrivalPort
    );
    for (const reservation of filteredPortsData) {
        const reservationStart = new Date(reservation.reservationTimeFrom).getTime();
        const reservationEnd = new Date(reservation.reservationTimeTo).getTime();

        if ((newStart >= reservationStart && newStart < reservationEnd) || 
            (newEnd > reservationStart && newEnd <= reservationEnd) || 
            (newStart <= reservationStart && newEnd >= reservationEnd)) {
            return 3; // 重複あり
        }
    }
    return 1; // 重複なし
  };
  

    const addNewEvent = () => {
      if (props.newEvent.departureDate && props.newEvent.departureTime && props.newEvent.arrivalDate && props.newEvent.arrivalTime) {
        let flag = checkOverlap(props.newEvent);
        if (flag === 1) {
          emit('update-flag', flag);
        const event = {
          title: '',
          start: `${props.newEvent.departureDate}T${props.newEvent.departureTime}`,
          end: `${props.newEvent.arrivalDate}T${props.newEvent.arrivalTime}`,
          color: '#333333BF',
          textColor: '#FFFFFF',
          classNames: 'airway-port-reserve',

        };
        // 既存のイベントを残しつつ、新しいイベントを更新
        const existingEventIndex = events.value.findIndex(e => e.title === '');
        if (existingEventIndex !== -1) {
          events.value[existingEventIndex] = event;
        } else {
          events.value.push(event);
        }
	      const calendarApi = fullCalendarRef.value.getApi();
        const currentView = calendarApi.view;
        setCustomTitle({ start: currentView.activeStart, end: currentView.activeEnd, view: currentView });
        // departureDateに飛ぶ処理を追加
        calendarApi.gotoDate(props.newEvent.departureDate);
       } else {
        const existingEventIndex = events.value.findIndex(e => e.title === '');
          if (existingEventIndex !== -1) {
            events.value.splice(existingEventIndex, 1);
          }
          const calendarApi = fullCalendarRef.value.getApi();
          const currentView = calendarApi.view;
          setCustomTitle({ start: currentView.activeStart, end: currentView.activeEnd, view: currentView });
          emit('update-flag', flag);       
       }
      }
    };

    expose({ addNewEvent });

    onMounted(async () => {
      await loadEvent(props.start, props.end);
      highlightTodayHeader(props.newEvent.departureDate);
    });


    return {
      calendarOptions,
      dialogVisible,
      newEvent,
      events,
      fullCalendarRef,
      showPopup,
      popupEvent,
      popupStyle,
      popupElement
    };
  },
};
</script>

<style>
.popup {
  background: #707070;
  color: #ffffff;
  padding: 10px;
  width: 150px;
  height: 150px;
}

.dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.dialog-content {
  display: flex;
  flex-direction: column;
}
.dialog-content input {
  margin-bottom: 10px;
}
.dialog-content button {
  margin-right: 10px;
}

.calendar-control {
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.fc-col-header-cell-cushion {
  color:black;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.fc-col-header-cell-cushion span {
  display: block;
  line-height: 1.2;
}

.fc-toolbar-title {
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-bold) var(--unnamed-font-size-16)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic)!important;
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  margin-left: 2rem!important;
}

.fc-toolbar-chunk {
  display: flex;
  align-items: center;
}

.fc-prev-button, .fc-next-button {
  background-color: white!important;
  border-color: #FFFFFF00!important;
  color: black!important;
  padding: 0.1em 0.6em!important;
  border-radius: 0rem!important;
}

.fc-calendarcontrol-button {
  padding: 0.1em 2.0em!important;
  background-color: white!important;
  border-color: #FFFFFF00!important;
  color: black!important;
  border-radius: 0rem!important;
}

.fc-today-button {
  padding: 0.1em 3.0em!important;
  background-color: white!important;
  border-color: #FFFFFF00!important;
  color: black!important;
  opacity: 1.0!important;
  border-radius: 0rem!important;
}


.fc .fc-button .fc-icon {
  font-size: 1.0em; 
  vertical-align: baseline; 
}

.fc-icon-chevron-left::before {
  content: "◀";
}

.fc-icon-chevron-right::before {
  content: "▶";
}

.fc-theme-standard .fc-scrollgrid {
  border: none; 
}

.fc-theme-standard td, .fc-theme-standard th {
  border: none; 
}

.fc-col-header  {
  height: 60px!important;
}

.fc-col-header-cell-cushion span {
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/24px var(--unnamed-font-family-biz-udpgothic)!important;
  font-size: 18px !important;;
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: center;
  height: 35px;
  width: 35px;
  padding: 5px; 
}

.fc .fc-timegrid-col {
  border: 1px solid #999999!important;
}

/*30分の線を消す*/
.fc .fc-timegrid-slot.fc-timegrid-slot-lane.fc-timegrid-slot-minor {
  border: none;
}

.fc-timegrid-slot.fc-timegrid-slot-label.fc-timegrid-slot-minor {
  border-right: 1px solid #999999!important;
}

/*横ヘッダーの1時間の線を消す*/
.fc .fc-timegrid-slot.fc-timegrid-slot-label.fc-scrollgrid-shrink {
  border: none;
  border-right: 1px solid #999999;
}

/*横ヘッダーの30分の線を消す*/
.fc-timegrid-slot-minor {
  border: none!important;
}

/*1時間の線を点線にする*/
.fc .fc-timegrid-slot {
  border-top: 2px dotted #999999;
}

.fc .fc-daygrid-day, .fc .fc-timegrid-axis, .fc .fc-timegrid-col {
 border:1px solid #999999;
}

.fc .fc-col-header-cell {
  border: 1px solid #999999;
}

.fc-timeGridWeek-view.fc-view.fc-timegrid {
  border: none;
}

.fc .fc-day-today {
  background-color: transparent !important;
}

.fc-view-harness.fc-view-harness-active {
  height: 650px!important;
}

.fc-scroller::-webkit-scrollbar {
  width: 5px;
  background: white;
}

.fc-scroller::-webkit-scrollbar-thumb {
  background-color: #999999;
  border-radius: 20px;
  width: 5px;
}

.fc .fc-daygrid-day-number {
  color: #999999!important;
  text-decoration: none;
}

.fc-dayGridMonth-view.fc-view.fc-daygrid {
  border: 1px solid #999999;
}

.fc-timegrid-event {
  border-radius: 0px;
}

.fc-event-time, .fc-event-title {
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-12)/16px var(--unnamed-font-family-biz-udpgothic)!important;
  letter-spacing: var(--unnamed-character-spacing-0);
}

.fc .fc-timegrid-slot {
  height: 30px;
}

.fc-direction-ltr .fc-timegrid-slot-label-frame  {
  margin-top: -25px;
}

.fc-calendarcontrol-button {
  margin-left: 3rem!important;
}

.fc-next-button {
  margin-left: 2rem!important;
}

.fc .fc-timegrid-slot-label {
  width:60px;
}

th.fc-col-header-cell:not(:first-child) {
  position: relative;

  &:before {
    display: none;
  }
}

.airway-port-all, .airway-port-reserve, .aiway-all, .port-all, .airway-port-departure, .airway-port-arrival {
  position: relative; /* 擬似要素の位置を相対的に設定 */
  padding-left: 18px!important; /* 左側の余白を調整 */
}


.airway-port-all::before, .airway-port-all::after,
.airway-port-reserve::before, .airway-port-reserve::after,
.aiway-all::before, .port-all::before,
.airway-port-departure::before, .airway-port-arrival::before
{
  content: '';
  position: absolute;
  top: 3px; 
  bottom: 3px; 
  width: 3px; 
}

.airway-port-all::before, .aiway-all::before, .port-all::before,.airway-port-departure::before, .airway-port-arrival::before {
  left: 3px; /* 1本目の線の位置 */
  background-color: #707070; 
}

.airway-port-all::after {
  left: 8px; /* 2本目の線の位置 */
  background: linear-gradient(
    to bottom,
    #707070 0%,
    #707070 13px,
    transparent 13px,
    transparent calc(100% - 13px),
    #707070 calc(100% - 13px),
    #707070 100%
  ); 
}

.airway-port-reserve::before {
  left: 3px; 
  background-color: #ffffff; 
}

.airway-port-reserve::after {
  left: 8px; 
  background: linear-gradient(
    to bottom,
    #ffffff 0%,
    #ffffff 13px,
    transparent 13px,
    transparent calc(100% - 13px),
    #ffffff calc(100% - 13px),
    #ffffff 100%
  ); 
}

.airway-port-departure::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 8px; /* 2本目の線の位置 */
  height: 13px;
  width: 3px;
  background: #707070; 
}

.airway-port-arrival::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 8px; /* 2本目の線の位置 */
  height: 13px;
  width: 3px;
  background: #707070; 
}
</style>
