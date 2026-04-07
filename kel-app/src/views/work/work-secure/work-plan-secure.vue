<template>
  <div class="wrapper">
    <van-tabs v-model:active="active" type="card">
      <template v-for="(item, index) in tabList" :key="index">
        <van-tab :title="item.title">
          <PlanAllItem ref="planItem" :rangeTimes="item.rangeTimes"></PlanAllItem>
        </van-tab>
      </template>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import PlanAllItem from './components/plan-all-item.vue';

const active = ref(0);
const tabList = [
  {
    title: '今日',
    rangeTimes: [dayjs().startOf('day').unix(), dayjs().endOf('day').unix()],
  },
  {
    title: '明日',
    rangeTimes: [
      dayjs().add(1, 'day').startOf('day').unix(),
      dayjs().add(1, 'day').endOf('day').unix(),
    ],
  },
  // {
  //   title: '后日',
  //   rangeTimes: [
  //     dayjs().add(2, 'day').startOf('day').unix(),
  //     dayjs().add(2, 'day').endOf('day').unix()
  //   ]
  // },
  {
    title: '往期',
    rangeTimes: [0, dayjs().add(-1, 'day').endOf('day').unix()],
  },
];
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box !important;
}

.wrapper {
  height: 100%;
  padding: 16px;
  position: relative;
  display: flex;
  flex-direction: column;

  :deep(.van-tabs) {
    flex: 1;
    display: grid;
    grid-template-rows: 30px auto;
    row-gap: 8px;
    justify-items: center;

    .van-tabs__wrap {
      width: 216px;
      height: 30px;

      .van-tabs__nav {
        border: none;
        margin: 0 !important;
        background-color: #f6f8f8;
        justify-content: center;

        .van-tab {
          border: none;
          margin-left: 8px;
          flex: unset;
          /* button-date-4-default */

          width: 48px;
          height: 30px;
          border-radius: 4px;
          background: #bbcece;
          font-family: 思源黑体;
          font-size: 14px;
          color: #ffffff;

          &.van-tab--active {
            background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
            font-weight: normal;
          }
        }
      }
    }

    .van-tabs__content {
      width: 100%;
    }

    .van-tab__panel {
      height: 100%;
    }
  }
}
</style>
