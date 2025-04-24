<template>
<!-- 詳細情報 -->
<div id="content" class="b-dateTimeSchedulerContainer">
  <SelectTime 
    :newEvent="newEvent" 
    @update-dates="updateNewEvent" 
    :airwayName="airwayName" 
    :aircraftId="aircraftId" 
    :start="startJunction" 
    :end="endJunction" 
    :departurePort="departurePort" 
    :arrivalPort="arrivalPort" 
    @add-new-event="handleAddNewEvent" 
    @update-flag="updateFlag" 
    :flag="flag"
  />  
  <!-- カレンダーコントロール -->
  <CalendarDisplayOrchestration
    v-if="airwayData && reservationData && portData"
    :newEvent="newEvent"
    :reservationData="reservationData"
    :airwayData="airwayData"
    :airwayId="airwayId"
    :start="startJunction"
    :end="endJunction"
    :departurePort="departurePort" 
    :arrivalPort="arrivalPort"
    :isEndIdFirst="isEndIdFirst"
    ref="calendarComponent"
    @update-flag="updateFlag"
    :portsReservationData = "portData"
  />
</div>
</template>

<script>
import SelectTime from '../components/SelectTime.vue';
import CalendarDisplayOrchestration from '../components/calendarDisplayOrchestration.vue';

export default {
  components: {
    SelectTime,
    CalendarDisplayOrchestration,
  },
  props: ['rangeData'],
  data() {
    return {
      newEvent: {
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
      },
      reservationData: null,
      airwayData: null,

      aircraftId: this.rangeData.aircraftId,
      airwayName: this.rangeData.airwayName,  
      airwayId: this.rangeData.airwayId,
      section: this.rangeData.section,
      departurePort: this.rangeData.departurePort,
      arrivalPort: this.rangeData.arrivalPort,
      isEndIdFirst: this.rangeData.isEndIdFirst,
      flag: 0,
      portData: null,
      operatorData: null,
      cookie_role: null,
    };
  },
  computed: {
    sectionRange() {
      let sectionList = this.section.split(',');
      return sectionList[0] + ' ~ ' + sectionList[1];
    },
    startJunction() {
      let sectionList = this.section.split(',');
      return sectionList[0];
    },
    endJunction() {
      let sectionList = this.section.split(',');
      return sectionList[1];
    }
  },
  methods: {
    updateNewEvent(dates) {
      this.newEvent = dates;
    },
    handleAddNewEvent(event) {
      this.$refs.calendarComponent.addNewEvent(event);
      console.log(event);
      this.updateDatetime()
    },
    updateDatetime() {
      if(this.flag === 1){
        const departureDate = this.newEvent.departureDate;
        const departureTime = this.newEvent.departureTime;
        const arrivalTime = this.newEvent.arrivalTime;
        this.$emit('update:datetime', departureDate, departureTime, arrivalTime);
      }else{
        const departureDate = '';
        const departureTime = '';
        const arrivalTime = '';	
        this.$emit('update:datetime', departureDate, departureTime, arrivalTime);        
      }
    },
    updateFlag(flag) {
      this.flag = flag;
    },
  },
  async created() {
    if (process.client) {
      // ロールチェック
      const ownpage_role = ["1","2"];
      this.cookie_role = await roleVerification(ownpage_role);
      if (Object.keys(this.cookie_role).length == 0) {
        console.log(`airwayReservation get role error.`);
        return;
      }
      // 1:航路運営事業者権限付きユーザかチェック
      const is_Admin = this.cookie_role.roleList.includes("1");
      if (is_Admin) {
        // 1:航路運営事業者
        this.role = 1;
      } else {
        const is_general = this.cookie_role.roleList.includes("2");
        if (is_general) {
          // 2:運航事業者
          this.role = 2;
        } else {
          // 3:関係者またはその他
          this.role = null;
          console.error(`The specified user is not eligible to operate this system.`);
        }
      }
    }
  },
  async mounted() {
    const droneApiBaseUrl = useRuntimeConfig().public.droneApiBaseUrl;
    const portUrl = `${droneApiBaseUrl}/droneport/reserve/list`;
    const portRes = await axios_get(portUrl, {}, {});
    console.log("portRes",portRes);
    if (portRes.status != 200) {
      console.error(`error: get port info {status: ${portRes.status}}.`);
      this.portData = {};
      return;
    }
    this.portData = portRes.data;

    // 事業者一覧情報を取得
    try {
      const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
      const operatorUrl = `${miscApiBaseUrl}/operator`;
      const operatorRes = await axios_get(operatorUrl);
      if (operatorRes.status === 200 && operatorRes.data != undefined) {
        this.operatorData = {};
        this.operatorData = operatorRes.data;
      } else {
        console.error(`error: get operator info {status: ${operatorRes.status}}.`);
        return;
      }
    } catch (error) {
      console.error('事業者情報一覧の取得に失敗しました(operatorUrl):', error);
    }

    const airwayApiBaseUrl = useRuntimeConfig().public.airwayApiBaseUrl;
    const airwayUrl = `${airwayApiBaseUrl}/airway`;
    const airwayRes = await axios_get(airwayUrl, {all: 'true'}, {});
    console.log(airwayRes);
    if (airwayRes.status != 200) {
      console.error(`error: get airway info {status: ${airwayRes.status}}.`);
      airwayData = null;
      return;
    }
    this.airwayData = useAirwayConvertConnectionOrder(airwayRes.data);

    let lastPage = 1;
    let currentPage = 1;
    let tmpReservationData = null;
    let reservationUrl = '';
    const reservationApiBaseUrl = useRuntimeConfig().public.reservationApiBaseUrl;
    if (this.role == 1) {
      reservationUrl = `${reservationApiBaseUrl}/admin/airwayReservations`;
    } else if (this.role == 2) {
      reservationUrl = `${reservationApiBaseUrl}/operator/${this.cookie_role.operatorId}/airwayReservations`;
    } else {
      console.log("error: get airway reservation info (permision denied.)");
      this.reservationData = {};
      return;
    }
    let reservationRes = await axios_get(reservationUrl, {}, {});
    console.log(reservationRes);
    if (reservationRes.status != 200) {
      console.error(`error: get airway reservation info {status: ${reservationRes.status}}.`);
      this.reservationData = {};
      return;
    }
    tmpReservationData = reservationRes.data;
    currentPage = 1;
    lastPage = reservationRes.data.lastPage;

    while (currentPage < lastPage) {
      currentPage++;
      let reservationRes = await axios_get(reservationUrl, {page: currentPage}, {});
      console.log(reservationRes);
      if (reservationRes.status != 200) {
        console.error(`error: get airway reservation info {status: ${reservationRes.status}}.`);
        this.reservationData = {};
        return;
      }

      reservationRes.data.result.forEach((reservation) => {
        tmpReservationData.result.push(reservation);
      })
    }

    this.reservationData = tmpReservationData.result;

    // ログで確認
    console.log('New Airway Reservation Data:', this.reservationData);
  },
};
</script>
