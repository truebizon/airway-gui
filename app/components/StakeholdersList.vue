<template>
<div class="drn_main__app">
  <div variant="flat" class="drn_main__content">

    <!-- ヘッダ -->
    <div class="drn_header">
      <div class="drn_header__item">
        <v-card-title class="drn_header__title">関係者登録</v-card-title>
      </div>
      <div class="drn_header__action">
        <v-btn
          variant="outlined"
          rounded="pill"
          class="drn_header__btn drn_header__btn--filter"
          @click="togglePopup"
        >
          <img class="drn_btn__filter" src="/assets/css/img/main/filter-solid.svg" width="15" height="15">
          絞り込み
        </v-btn>
      </div>
    </div>
    <!-- .drn_header -->

    <!-- モーダルウィンドウ -->
    <div v-if="showPopup" class="popup">
      <!-- オプション検索の内容 -->
      <div class="item-center">
        <div class="option-item">
          <div class="e-fieldLabel-option">事業所・会社名　
            <input v-model="operatorName" type="text" class="e-textField-select" placeholder="事業者・会社名を入力してください" />
          </div>
        </div>
      </div>
      <div class="item-center">
        <input type="button" class="e-button-search" value="検索" @click="performSearch" />
      </div>
      <div class="item-center">
        <a style="color: #333333; text-decoration: none;" @click="reset">検索条件をリセットする</a>
      </div>
    </div>

    <!-- 関係者一覧テーブル -->
    <v-card-text class="drn_content">
      <div class="drn_content__body">
        <v-sheet class="drn_content__data">
          <div class="drn_list">
            <div class="drn_list__body">
              <v-data-table
              v-model:items-per-page="itemsPerPage"
              :headers="headers"
              :items="filteredStakeholders"
              item-value="operatorName"
              item-key="operatorName"
              class="drn_list__table"
              @update:sort-key="updateSort"
              :sort-key.sync="sortKey"
              :sort-order.sync="sortOrder"
              :items-per-page-options="[5, 10, 15, 20]"
              >
                <template v-slot:body="{ items }">
                  <tr
                  v-for="(item, index) in items"
                  :key="item.operatorName"
                  :class="{ 'drn_table__selected': selectedRow === item.operatorName }"
                  @click="selectRoute(item.operatorName)"
                  >
                  <td :class="{'drn_table__selected_first_td': selectedRow === item.operatorName }">{{ item.operatorName }}</td>
                  <td>{{ item.roleList }}</td>
                  </tr>
                </template>
              </v-data-table>
            </div>
             <!-- .drn_list__body -->
          </div>
           <!-- .drn_clist -->
        </v-sheet>
        <!-- .drn_content__data -->
      </div>
      <!-- .drn_content__body -->
    </v-card-text>
    <!-- .drn_content -->

  </div>
  <!-- .drn_main__content -->
</div>
<!-- .drn_main__app -->
</template>

<script>
export default {
props: {
  filter: {
    type: Object,
    required: false
  },
},
data() {
  return {
    headers: [
      { title: '事業者・会社名', align: 'start', key: 'operatorName', sortable: true },
      { title: '区分', align: 'start', key: 'roleList', sortable: true },
    ],
    stakeholders: [],
    selectedRow: null,
    itemsPerPage: 10,
    sortKey: '', // ソートキー
    sortOrder: 1, // 1: 昇順, -1: 降順
    showPopup: false,
    operatorName: '',
    filteredStakeholders: [],
  };
},
methods: {
  updateSort({ key, order }) {
    this.sortKey = key;
    this.sortOrder = order;

    console.log('Updated sortKey:', this.sortKey);
    console.log('Updated sortOrder:', this.sortOrder);
  },
  selectRoute(operatorName) {
    this.selectedRow = this.selectedRow === operatorName ? null : operatorName;
  },
  togglePopup() {
    this.showPopup = !this.showPopup;
  },
  performSearch() {
    this.filteredStakeholders = this.stakeholders.filter(item => {
      // this.operatorName が存在する場合にのみ比較を行う
      const isOperatorNameMatch = !this.operatorName || 
        item.operatorName.toLowerCase().includes(this.operatorName.toLowerCase());

      this.showPopup = !this.showPopup;

      return isOperatorNameMatch;
    });
  },
  reset() {
    this.operatorName = '';
    this.filteredStakeholders = this.stakeholders;
  },
},
created() {
  this.filteredStakeholders = this.stakeholders;
},
async mounted() {
  const miscApiBaseUrl = useRuntimeConfig().public.miscApiBaseUrl;
  const operatorUrl = `${miscApiBaseUrl}/operator`;
  const operatorHeaders = {
    headers: {
      'accept': 'application/json',
    },
  };
  const operatorRes = await axios_get(operatorUrl, {}, operatorHeaders);
  console.log(operatorRes);
  if (operatorRes.status != 200) {
    console.error(`error: get operator info {status: ${operatorRes.status}}.`);
    this.response = null;
    return;
  }
  this.response = operatorRes.data;

  const roleMap = {
    "1": "航路運営事業者",
    "2": "運航事業者",
    "3": "関係者"
  };
  this.stakeholders = this.response.operatorList.map(item => ({
    operatorId: item.operatorId, 
    notificationType: item.notificationType,
    operatorName: item.operatorName,
    roleList: item.roleList.map(item => roleMap[item]).join(", "),
    notificationTargetList: item.notificationTargetList,
    linkAirwayList: item.linkAirwayList, 
  }));
  this.filteredStakeholders = this.stakeholders;
  },
};
</script>

<style scoped>

/* モーダルウィンドウのスタイル */
.popup {
  position: absolute;
  left: 40dvh;
  top: 80px; /* 画像ボタンの位置に合わせて調整 */
  width: 1180px;
  height: 231px;
  background-color: #fefefe;
  border: 1px solid #888;
  padding-top: 21px;
  padding-left: 55px;
  padding-right: 55px;
  z-index: 10000;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.option-item {
  margin: 5px;
}

.item-center {
  display: flex;
  justify-content: center; 
}

.e-textField-select {
  width: 250px;
  height: 25px!important;
  border: 1px solid var(--line_-999999);
  padding-top: 5px;
  padding-bottom: 6px;
  padding-left: 10px;
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
}

.e-button-search {
  width: 98px;
  height: 25px;
  background: var(--txt_-333333) 0% 0% no-repeat padding-box;
  border: 1px solid var(--line_-999999);
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--unnamed-color-ffffff);
  text-align: center;
  margin-top: 15px;
  margin-bottom: 10px;
}

.e-fieldLabel-option {
  margin-bottom: 0.5rem;
  font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-bold) var(--unnamed-font-size-14)/var(--unnamed-line-spacing-14) var(--unnamed-font-family-biz-udpgothic);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--txt_-333333);
  text-align: left;
}

</style>
