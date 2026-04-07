<script setup>
import { ref, computed } from 'vue';

import { getMonthInfo, getMonthRange } from '../../util/time';
import IconTime from '../../../../assets/image/check/icon_time.png';

const emit = defineEmits(['onMonthSelected']);

const monthInfo = getMonthInfo();

const timeStr = ref(monthInfo.str);
const currentDate = ref([monthInfo.year, monthInfo.month]);
const columnsType = ['year', 'month'];
const showPicker = ref(false);

const props = defineProps({
  // 是不是禁用掉后面的日期
  futureDateDisabled: {
    type: Boolean,
    default: false,
  },
});

const handleBtnClick = () => {
  showPicker.value = true;
};

const handleMonthConfirm = () => {
  console.log('currentDate', currentDate);
  const monthStr = currentDate.value[0] + '-' + currentDate.value[1];

  emit('onMonthSelected', monthStr);

  timeStr.value = monthStr;
  showPicker.value = false;
};

const maxDate = computed(() => {
  if (props.futureDateDisabled) {
    const { endDate } = getMonthRange();
    return endDate;
  }

  return new Date(2025, 5, 1);
});
</script>

<template>
  <div class="btn-wrapper" @click="handleBtnClick">
    <img :src="IconTime" width="22" height="22" />
    <span class="time">
      {{ timeStr }}
    </span>
  </div>
  <van-popup v-model:show="showPicker" round position="bottom">
    <van-date-picker
      @confirm="handleMonthConfirm"
      @cancel="showPicker = false"
      v-model="currentDate"
      title="选择月份"
      :min-date="new Date(2020, 0, 1)"
      :max-date="maxDate"
      :columns-type="columnsType"
    />
  </van-popup>
</template>

<style lang="less" scoped>
.btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  .time {
    color: #343435;
    font-size: 14px;
  }
}
</style>
