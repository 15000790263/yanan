<script setup>
import dayjs from 'dayjs';

import KeywordSearch from '../task-search/index.vue';
import MonthSelector from '../month-selector/index.vue';
import LocationSearch from '../location-search/index.vue';
import TimeRangeSelector from '../time-range-selector/index';
import { getDateRange, getMonthInfo, getMonthRange } from '../../util/time';

const { before, endPlusOne: end } = getMonthRange();

const { month } = getMonthInfo();

const props = defineProps({
  timeSearchType: {
    type: String,
    default: 'month', // month range
  },

  // 当变化后立即通知
  // 发送onConditionChanged
  notifyOnChange: {
    type: Boolean,
    default: true,
  },

  // 是不是禁用掉后面的日期
  futureDateDisabled: {
    type: Boolean,
    default: false,
  },

  // 是否显示左侧
  showLeft: {
    type: Boolean,
    default: true,
  },

  // 是否显示右侧
  showRight: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  'onKeywordSearch',
  'onKeywordSearchClear',
  'onLocationSelected',
  'onMonthSelected',
  'onTimeRangeSelected',

  // 综合的方法
  // 任何一个条件变化将触发
  'onConditionChanged',
]);

// 向上提供的数据
let exposeData = {
  // 地点相关
  distance: undefined,
  roadName: undefined,
  area: undefined,

  // 时间相关
  // patrolDate: props.timeRange === 'month' ? month : undefined,
  // beginDate: props.timeRange === 'range' ? before : undefined,
  // endDate: props.timeRange === 'range' ? today : undefined,
  beginDate: before,
  endDate: end,

  // 关键词
  keyword: undefined,
};

// 整体的收口
const changeSearchCondition = data => {
  exposeData = {
    ...exposeData,
    ...data,
  };
  if (props.notifyOnChange) {
    emit('onConditionChanged', exposeData);
  }
};

// 关键词变化
const handleKeywordSearch = value => {
  console.log('----keyword search---', value);
  emit('onKeywordSearch', value);
  changeSearchCondition({ keyword: value });
};

// 关键词清空
const handleKeywordSearchClear = () => {
  emit('onKeywordSearchClear');
  changeSearchCondition({ keyword: undefined });
};

// 地点选择变化
const handleLocationSearch = (location, type, position) => {
  console.log(location, type);
  emit('onLocationSelected', { location, type, position });
  if (type === 'distance' && location === '全域') {
    changeSearchCondition({ distance: void 0 });
    return;
  }

  const positionCondition = {};
  if (position) {
    positionCondition.x = position.x;
    positionCondition.y = position.y;
  }
  changeSearchCondition({
    // 这三个条件是互斥
    distance: undefined,
    roadName: undefined,
    area: undefined,

    [type]: location,
    ...positionCondition,
  });
};

// 月份选择变化
const handleMonthSelected = month => {
  if (props.timeSearchType === 'range') return;

  // emit('onMonthSelected', month);
  // changeSearchCondition({ patrolDate: month });
  const { before: beginDate, endPlusOne: endDate } = getMonthRange(month);
  changeSearchCondition({
    beginDate,
    endDate,
  });
};

// 时间范围选择变化
const handleTimeRangeSelected = timeRange => {
  if (props.timeSearchType === 'month') return;
  emit('onTimeRangeSelected', timeRange);
  const beginDate = dayjs(timeRange.start).format('YYYY-MM-DD');
  const endDate = dayjs(timeRange.end).format('YYYY-MM-DD');

  changeSearchCondition({
    beginDate,
    endDate,
  });
};
</script>

<template>
  <div class="composition-container">
    <div class="line-first">
      <div v-if="showLeft" class="loc-btn-container left">
        <slot name="common-search-left">
          <location-search @onLocationSearch="handleLocationSearch" />
        </slot>
      </div>

      <div v-if="showRight" class="month-btn-container right">
        <month-selector
          :futureDateDisabled="futureDateDisabled"
          v-if="timeSearchType === 'month'"
          @onMonthSelected="handleMonthSelected"
        />
        <time-range-selector v-else @onTimeRangeSelected="handleTimeRangeSelected" />
      </div>
    </div>
    <div class="line-keyword">
      <keyword-search
        v-bind="$attrs"
        @onSearch="handleKeywordSearch"
        @onSearchClear="handleKeywordSearchClear"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
.composition-container {
  .line-first {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .loc-btn-container {
      width: 40%;
    }
    .month-btn-container {
      width: 60%;
      margin-left: auto;
    }
    .left {
      display: flex;
      justify-content: flex-start;
    }
    .right {
      display: flex;
      justify-content: flex-end;
    }
  }

  .line-keyword {
    margin-top: 12px;
  }
}
</style>
