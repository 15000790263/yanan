<script setup>
import { ref } from 'vue';
import { getDateRange } from '../../util/time';

const DATE_SPLIT = ' 到 ';

const { before, today, todayDate, beforeDate } = getDateRange();

const defaultDate = `${before}${DATE_SPLIT}${today}`;

const props = defineProps({
  type: {
    type: String,
    default: 'regulator',
  },
});

const emit = defineEmits(['onConditionSearch']);

const showPickerDate = ref(false);
const isShowPanel = ref(false);

const date = ref(defaultDate);
const deviceNO = ref('');
const statusChecked = ref(['1', '2']);

function formatDate(date) {
  return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
}

const onConfirmDatePicker = values => {
  const [start, end] = values;
  showPickerDate.value = false;
  date.value = `${formatDate(start)}${DATE_SPLIT}${formatDate(end)}`;
};

const dealDeviceNO = () => {
  let val = deviceNO.value;
  if (val) {
    if (props.type === 'regulator') {
      return {
        regulatorNumber: val,
      };
    } else if (props.type === 'well') {
      return {
        valveNumber: val,
      };
    } else if (props.type === 'pipeline') {
      return {
        pipelineNo: val,
      };
    }
  }

  return {};
};

const dealStatus = () => {
  const statusValueArr = statusChecked.value;
  const statusSum = +(statusValueArr[0] ?? 0) + +(statusValueArr[1] ?? 0);

  if (statusSum === 1) {
    return {
      patrolStatus: '1',
    };
  }

  if (statusSum === 2) {
    return {
      patrolStatus: '2',
    };
  }
  if (statusSum === 0 || statusSum === 3) {
    return {};
  }

  return {};
};

const addEndDatePlusOne = dateStr => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const dealDate = () => {
  const dateArr = date.value.split(DATE_SPLIT);

  if (dateArr.length === 2) {
    return {
      beginDate: dateArr[0],
      endDate: addEndDatePlusOne(dateArr[1]),
    };
  }

  return {};
};

const onSubmitSearch = () => {
  // 设备编号
  // 根据类型不同参数不同
  let deviceNOParams = dealDeviceNO();

  // 巡检状态
  let statusParams = dealStatus();

  let dateParams = dealDate();

  console.log('dateParams', dateParams);

  const params = {
    ...deviceNOParams,
    ...statusParams,
    ...dateParams,
  };

  // console.log('params:::', params)
  emit('onConditionSearch', params);

  isShowPanel.value = false;
};
function getOneYearAgo(date = new Date()) {
  const oneYearAgo = new Date(date);
  oneYearAgo.setFullYear(date.getFullYear() - 1);
  return oneYearAgo;
}
</script>

<template>
  <div class="search-btn-container">
    <div class="btn">
      <van-icon v-if="!isShowPanel" name="search" @click="isShowPanel = true" />
      <van-icon v-if="isShowPanel" name="arrow-up" @click="isShowPanel = false" />
    </div>
  </div>

  <div v-if="isShowPanel" class="panel">
    <van-cell-group inset>
      <van-field
        clearable
        input-align="right"
        v-model="deviceNO"
        name="编号"
        label="设备编号"
        placeholder="编号"
      />
      <van-field input-align="right" name="checkboxGroup" label="搜索状态">
        <template #input>
          <van-checkbox-group v-model="statusChecked" direction="horizontal">
            <van-checkbox name="1">正常</van-checkbox>
            <van-checkbox name="2">异常</van-checkbox>
          </van-checkbox-group>
        </template>
      </van-field>
      <van-cell
        title-style="min-width: 80px ; flex-grow: 0;"
        title="日期区间"
        :value="date"
        @click="showPickerDate = true"
      />
    </van-cell-group>

    <van-calendar
      :min-date="getOneYearAgo()"
      :default-date="[beforeDate, todayDate]"
      v-model:show="showPickerDate"
      type="range"
      @confirm="onConfirmDatePicker"
    />

    <div style="margin: 16px; display: flex; justify-content: space-around">
      <van-button
        style="margin-right: 24px"
        @click="isShowPanel = false"
        round
        block
        type="primary"
        plain
        color="#00B099"
      >
        取消
      </van-button>
      <van-button @click="onSubmitSearch" round block type="primary" icon="search" color="#00B099">
        搜索
      </van-button>
    </div>
  </div>
</template>

<style lang="less" scoped>
.search-btn-container {
  position: absolute;
  right: 16px;
  top: 25px;

  .btn {
    border: 1px solid rgba(38, 55, 73, 0.1);
    width: 40px;
    height: 40px;
    font-size: 18px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #00b099;
    background-color: #fff;
    box-shadow: 0px 0px 4px 0px rgba(38, 55, 73, 0.1);
  }
}

.panel {
  position: absolute;
  width: 100vw;
  background-color: #fff;
  border-bottom: 1px solid rgba(38, 55, 73, 0.1);
  border-top: 1px solid rgba(38, 55, 73, 0.1);

  // box-shadow: 0px 0px 4px 0px rgba(38, 55, 73, 0.1);
  z-index: 1000;
  top: 85px;
}
</style>
