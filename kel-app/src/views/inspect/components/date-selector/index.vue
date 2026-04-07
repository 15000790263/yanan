<template>
  <div>
    <van-calendar
      v-if="columnsType[0] === 'range'"
      v-model:show="showBottom"
      type="range"
      :min-date="minDate"
      @confirm="onConfirm"
    />

    <van-popup v-else v-model:show="showBottom" position="bottom" :style="{ height: '30%' }">
      <van-date-picker
        v-model="currentDate"
        title="选择"
        :max-date="maxDate"
        :columns-type="columnsType"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      />
    </van-popup>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import { showFailToast } from 'vant';
import { getLastDaysOfEvenMonths, isDateInRange } from '../../../../utils/date-tool';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  columnsType: {
    type: Array,
    default: ['year', 'month', 'day'],
  },
});
const emit = defineEmits(['update:modelValue', 'choice']);

const minDate = dayjs().subtract(10, 'year').toDate();
const maxDate = dayjs().toDate();

const showBottom = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  },
});

const currentDate = ref([dayjs().year(), dayjs().month() + 1, dayjs().date()]);

watch(
  () => props.columnsType,
  value => {
    const strV = JSON.stringify(value);
    switch (strV) {
      case '["year"]':
        currentDate.value = [dayjs().year()];
        break;
      case '["year","month"]':
        currentDate.value = [dayjs().year(), dayjs().month() + 1];
        break;
      case '["year","month","day"]':
        currentDate.value = [dayjs().year(), dayjs().month() + 1, dayjs().date()];
        break;
      case '["range"]':
        currentDate.value = [dayjs().year(), dayjs().month() + 1, dayjs().date()];
        break;
      default:
        // 可能是日期范围选择
        break;
    }
  }
);

function handleConfirm({ selectedValues }) {
  emit('choice', selectedValues.slice().join('-'));
  showBottom.value = false;
}

function handleCancel() {
  showBottom.value = false;
}

function onConfirm([start, end]) {
  const s = dayjs(start).format('YYYY-MM-DD');
  const e = dayjs(end).format('YYYY-MM-DD');

  const y = dayjs(start).format('YYYY');
  const arr = getLastDaysOfEvenMonths(y);
  const res = arr.findIndex(item => isDateInRange(item, [s, e]));
  // if (res !== -1) {
  //   showFailToast('不能跨计划查询，请重试！');
  //   return;
  // }

  emit('choice', `${s}~${e}`);
  showBottom.value = false;
}
</script>

<style lang="less" scoped></style>
