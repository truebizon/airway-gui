<template>
  <div class="drn_form__header">
    <div class="drn_form__title">航路点設定</div>
  </div>
  <!-- 詳細情報 -->
  <v-card-text class="drn_content">
    <div class="drn_content__body">
      <!-- 左カラム：区間・ジャンクション名設定フォーム -->
      <v-sheet class="drn_content__data">
        <button @click="clearInputs" class="clear-button">全クリア</button>
        <v-timeline side="end" truncate-line="both" size="x-small" class="drn_timeline">
          <v-timeline-item v-for="(item, index) in combinedList" :key="index" v-bind:hide-dot="index % 2 == 0 ? false : true" v-bind:class="[index % 2 == 0 ? 'drn_timeline__item' : 'drn_timeline__item drn_timeline__item--via']">
            <template v-slot:icon>
              <span>{{ item.id }}</span>
            </template>
            <v-text-field 
              type="input"
              density="compact"
              variant="outlined"
              :placeholder="getPlaceholder(item.type)"
              v-model="item.name"
              class="drn_form__input"
              maxlength="200"
              @change="handleChangedCorridorDataAdded"
            >
            </v-text-field>
          </v-timeline-item>
        </v-timeline>
      </v-sheet>
      <!-- 右カラム：区間・ジャンクション地図 -->
      <v-sheet rounded="lg" color="default" class="drn_content__map">
        <MapComponent :corridorData="parsedcorridorData" :message="fallToleranceRangeId" class="nameSettingMap" :stepNo="stepNo"/>
      </v-sheet>
    </div>
  </v-card-text>
</template>

<script>
import MapComponent from '@/components/map/showAirwayDetail.vue';

export default {
  components: {
    MapComponent,
  },
  props: ['rangeData', 'stepNo'],
  data() {
    return {
      fallToleranceRangeId: this.rangeData.fallToleranceRangeId, 
      stepNo: this.stepNo,
      };
  },
computed: {
    corridorList() {
        const corridorData = this.rangeData.corridorData;
        console.log(corridorData);
        return corridorData.value;
    },
    parsedcorridorData() {
      try {
        // corridorListが文字列の場合のみJSON.parseを実行
        if (typeof this.corridorList === 'string') {
          return JSON.parse(this.corridorList);
        }
        return this.corridorList; // corridorListがオブジェクトの場合はそのまま返す
      } catch (error) {
        console.error('Error parsing JSON:', error.message);
        return {}; // エラーが発生した場合は空のオブジェクトを返す
      }
    },

    combinedList() {
      const points = this.parsedcorridorData.airwayJunctions || [];
      const sections = this.parsedcorridorData.airwaySections || [];
      const maxLength = Math.max(points.length, sections.length);
      const combined = [];

      for (let i = 0; i < maxLength; i++) {
        if (i < points.length) {
          combined.push({ id: i+1, type: 'c-landMarkNameField', name: points[i].airwayJunctionName });
        }
        if (i < sections.length) {
          combined.push({ id: i+1, type: 'c-sectionNameField', name: sections[i].airwaySectionName });
        }
      }
      return combined;
    },
    
  },
  watch: {
    combinedList: {
      handler() {
        this.isFormComplete();
      },
      deep: true
    }
  },
  methods: {
    isFormComplete() {
    const isComplete = this.combinedList.every(item => {
      return item.name.trim() !== '';
    });
    return isComplete;
    },
    clearInputs() {
      this.combinedList.forEach(item => {
        item.name = '';
      });
      this.$forceUpdate(); // 強制的に再レンダリングをトリガー
      this.isFormComplete(); // isFormComplete を再評価
      this.handleChangedCorridorDataAdded();
    },
    getPlaceholder(type) {
      return type === 'c-landMarkNameField' ? '航路点名を入力' : '航路区間名を入力';
    },
    handleChangedCorridorDataAdded() {
      const updatedCorridorData = {
        ...this.parsedcorridorData,
        airwayJunctions: this.parsedcorridorData.airwayJunctions.map((point, index) => ({
          ...point,
          airwayJunctionName: this.combinedList.filter(item => item.type === 'c-landMarkNameField')[index]?.name ||  ''
        })),
        airwaySections: this.parsedcorridorData.airwaySections.map((section, index) => ({
          ...section,
          airwaySectionName: this.combinedList.filter(item => item.type === 'c-sectionNameField')[index]?.name ||  ''
        }))
      };
      this.$emit('update:changedCorridorData', updatedCorridorData);
    },
  }
};
</script>

<style>
.nameSettingMap {
 height: 700px;
}

#map {
  height: 100%!important;
}

.clear-button {
  margin-left: 380px; 
}
 
</style>

