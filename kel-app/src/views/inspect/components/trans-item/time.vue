<script setup>
import { computed } from 'vue';

import icon_time_uncheck from '../../../../assets/image/check/icon_time_uncheck.png';
import icon_time_good from '../../../../assets/image/check/icon_time_good.png';
import icon_time_error from '../../../../assets/image/check/icon_time_error.png';
import icon_arrow_dark from '../../../../assets/image/check/icon_arrow_dark.png';
import icon_arrow_light from '../../../../assets/image/check/icon_arrow_light.png';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  cardType: {
    type: String,
    default: 'uncheck', // uncheck good error
  },

  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const timeImg = computed(() => {
  switch (props.cardType) {
    case 'uncheck':
      return icon_time_uncheck;
    case 'good':
      return icon_time_good;
    case 'error':
      return icon_time_error;
    default:
      return icon_time_uncheck;
  }
});

const arrowImg = computed(() => {
  if (props.cardType === 'uncheck') {
    return icon_arrow_light;
  }

  return icon_arrow_dark;
});

// const timeStr = computed(() => {
//   let taskTime = props.data.patrolBeginDate
//   if (props.data.patrolEndDate) {
//     taskTime = taskTime + " - " + props.data.patrolEndDate
//   }
//   return isTaskForNow.value
//     ? taskTime
//     : props.data.practicalDate
// })

const startTime = computed(() => {
  return props.data.patrolBeginDate ?? '暂无';
});

const endTime = computed(() => {
  return props.data.patrolEndDate ?? '暂无';
});
</script>

<template>
  <div class="time-wrapper">
    <div class="time-item">
      <img :src="timeImg" width="24" height="24" />
      <span :class="['time-text', cardType]">{{ startTime }}</span>
    </div>

    <img class="arrow" :src="arrowImg" width="27" height="5" />

    <div class="time-item">
      <img :src="timeImg" width="24" height="24" />
      <span :class="['time-text', cardType]">{{ endTime }}</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.time-wrapper {
  margin-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .time-item {
    margin-left: 2px;
    display: flex;
    align-items: center;
    justify-content: start;
    min-width: 100px;
    color: white;
    font-size: 14px;
  }

  .arrow {
    margin: 0px 20px;
  }
}

.uncheck {
  color: #fff;
}

.good {
  color: #34394f;
}

.error {
  color: #34394f;
}
</style>
