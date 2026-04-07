<script setup>
import { ref } from 'vue';

import { getDateRange } from '../../util/time';
import IconTime from '../../../../assets/image/check/icon_time.png';

const DATE_SPLIT = '至';

const { before, nextDay, todayDate, beforeDate, nextDayDate } = getDateRange();

const defaultDate = `${before}${DATE_SPLIT}${nextDay}`;

const emit = defineEmits(['onTimeRangeSelected']);

const date = ref(defaultDate);

const showPickerDate = ref(false);

function formatDate(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

const onConfirmDatePicker = values => {
  const [start, end] = values;
  showPickerDate.value = false;
  date.value = `${formatDate(start)}${DATE_SPLIT}${formatDate(end)}`;
  // console.log( { start, end })
  emit('onTimeRangeSelected', { start, end });
};

function getOneYearAgo(date = new Date()) {
  const oneYearAgo = new Date(date);
  oneYearAgo.setFullYear(date.getFullYear() - 1);
  return oneYearAgo;
}
</script>

<template>
  <div class="btn-wrapper" @click="showPickerDate = true">
    <img :src="IconTime" width="22" height="22" />
    <span class="time">
      {{ date }}
    </span>
  </div>

  <van-calendar
    type="range"
    v-model:show="showPickerDate"
    color="#00B099"
    :min-date="getOneYearAgo()"
    :default-date="[beforeDate, nextDayDate]"
    @confirm="onConfirmDatePicker"
  />
</template>

<style lang="less" scoped>
.btn-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  .time {
    color: #343435;
    font-size: 14px;
    white-space: nowrap;
  }
}
</style>
