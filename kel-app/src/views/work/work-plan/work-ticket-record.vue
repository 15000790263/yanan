<template>
  <div class="wrapper">
    <van-tabs
      v-model:active="active"
      animated
      title-active-color="#00B099"
      title-inactive-color="#84ABBB"
      :line-height="0"
      @click-tab="handleActive"
    >
      <van-tab v-for="(item, index) in tabList" :title="item.title" :key="index">
        <component ref="chart" :is="item.contentComp" @loaded="isLoaded = true" />
      </van-tab>
    </van-tabs>
    <van-loading v-if="!isLoaded" color="#1989fa" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TicketApproveRecord from './components/ticket-approve-record.vue';
import TicketFlowChart from './components/ticket-flow-chart.vue';
import FormInfo from './components/form-info.vue';

const active = ref(0);

const tabList = [
  {
    title: '流转记录',
    contentComp: TicketApproveRecord,
  },
  {
    title: '流程图',
    contentComp: TicketFlowChart,
  },
  {
    title: '详情',
    contentComp: FormInfo,
  },
];

const chart = ref();

function handleActive(value) {
  if (value.name === 1) {
    chart.value[1].position();
  }
}

const isLoaded = ref(false);
function beforeChange() {
  return isLoaded.value;
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box !important;
}

.wrapper {
  height: 100%;

  :deep(.van-tabs) {
    height: 100%;
    .van-tabs__wrap {
      height: 56px;
    }

    .van-tabs__content {
      height: calc(100% - 56px);
    }

    .van-tab__panel {
      height: 100%;
    }

    .van-tabs__nav--line {
      padding: 0;
    }
  }

  :deep(.van-loading) {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
  }
}
</style>
