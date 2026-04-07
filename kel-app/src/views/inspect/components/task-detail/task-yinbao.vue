<script setup>
import { computed } from 'vue';
import attr from '../attr-desc/index.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const isChecked = computed(() => {
  console.log('isChecked::', +props.data.patrolStatus !== 0);
  return +props.data.patrolStatus !== 0;
});

const checkedStatus = computed(() => {
  switch (+props.data.patrolStatus) {
    case 0:
      return '未巡检';
    case 1:
      return '正常';
    case 2:
      return '异常';
    default:
      return '未巡检';
  }
});

const planStatus = computed(() => {
  switch (+props.data.planStatus) {
    case 0:
      return '中止';
    case 1:
      return '正常';
    default:
      return '正常';
  }
});

const planType = computed(() => {
  switch (+props.data.planType) {
    case 1:
      return '长期计划';
    case 2:
      return '临时计划';
    default:
      return '正常';
  }
});

const delegateStatus = computed(() => {
  switch (+props.data.delegateStatus) {
    case 0:
      return '否';
    case 1:
      return '是';
    default:
      return '否';
  }
});

// const delegateDescription = computed(() => {
//   return (props.data.delegateDescription ?? "").split(',')
// })

const locationInfo = computed(() => {
  return `经度:${props.data.longitude ?? '--'}, 纬度:${props.data.latitude ?? '--'}`;
});
</script>

<template>
  <div>
    <van-row :gutter="[12, 12]">
      <van-col span="24">
        <attr label="计划月份" :value="data.patrolDate" />
      </van-col>

      <van-col span="24">
        <attr label="计划开始" :value="data.patrolBeginDate" />
      </van-col>

      <van-col span="24">
        <attr label="计划结束" :value="data.patrolEndDate" />
      </van-col>

      <!-- <van-col span="24">
        <attr label="计划频率" :value="data.patrolFrequency" />
      </van-col> -->

      <!-- <van-col span="24">
        <attr label="负责人员" :value="data.patrolPerson + `(编号:${data.patrolPersonId})`" />
      </van-col> -->

      <van-col span="24">
        <attr label="确认人员" :value="data.patrolConfirm ?? '--'" />
      </van-col>

      <van-col span="12">
        <attr label="是否转派" :value="delegateStatus" />
      </van-col>

      <van-col span="12">
        <attr v-if="delegateStatus === '是'" label="转派信息" :value="delegateDescription" />
      </van-col>

      <van-col span="12">
        <attr label="计划状态" :value="planStatus" />
      </van-col>

      <van-col span="12">
        <attr label="计划类型" :value="planType" />
      </van-col>

      <van-col span="12">
        <attr label="巡检级别" :value="data.regulatorLevel ?? '--'" />
      </van-col>

      <!-- <van-col span="12">
        <attr label="巡检类别" :value="data.patrolType" />
      </van-col> -->

      <van-col span="24">
        <attr label="巡检状态" :value="checkedStatus" />
      </van-col>
    </van-row>

    <div v-if="isChecked">
      <van-divider />
      <van-row :gutter="[12, 12]">
        <van-col span="24">
          <attr label="巡检日期" :value="data.practicalDate" />
        </van-col>
        <van-col span="24">
          <attr label="巡检人员" :value="data.practicalPerson" />
        </van-col>
        <van-col span="24">
          <attr label="巡检位置" :value="locationInfo + ``" />
        </van-col>
        <van-col span="24">
          <attr label="问题说明" :value="data.problemDescp" />
        </van-col>

        <!-- <van-col span="24">
          <attr label="备注" :value="data.remark" />
        </van-col> -->
      </van-row>
    </div>
  </div>
</template>

<style lang="less" scoped></style>
