<template>
  <div class="wrapper">
    <div class="total-count">总数：{{ total }}个</div>
    <van-tabs v-model:active="active" type="card" :lazy-render="false">
      <template v-for="(item, index) in tabList" :key="index">
        <van-tab :title="item.title">
          <PlanAllItem :active="active" :rangeTimes="item.rangeTimes"></PlanAllItem>
        </van-tab>
      </template>
    </van-tabs>
  </div>
</template>

<script setup>
import { ref, nextTick, onActivated } from 'vue';
import dayjs from 'dayjs';
import { getWorkList } from '@/api/work';
import PlanAllItem from './components/plan-all-item.vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';

const router = useRouter();
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
  {
    title: '后日',
    rangeTimes: [
      dayjs().add(2, 'day').startOf('day').unix(),
      dayjs().add(2, 'day').endOf('day').unix(),
    ],
  },
  {
    title: '往期',
    rangeTimes: [0, dayjs().add(-1, 'day').endOf('day').unix()],
  },
];

const total = ref(0);

let pageNum = 0;

// 加载条数
let pageSize = 2;

function init() {
  pageNum += 1;
  getWorkList({ pageSize, pageNum }).then(async ({ data }) => {
    total.value = data.total;
  });
}

init();

function toggleTab() {
  const { active: a = 0 } = router;
  active.value = a;
}

toggleTab();

onBeforeRouteLeave(to => {
  if (to.path === '/work/work-plan') {
    router.scrollTop = 0;
    router.active = 0;
  }
});
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
    flex-direction: column;
    grid-template-rows: 30px auto;
    row-gap: 8px;

    .van-tabs__wrap {
      width: 216px;
      height: 30px;

      .van-tabs__nav {
        border: none;
        margin: 0 !important;
        display: grid;
        grid-template-columns: repeat(4, 48px);
        column-gap: 8px;

        .van-tab {
          border: none;
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
      flex: 1;
    }

    .van-tab__panel {
      height: 100%;
    }
  }

  .total-count {
    position: absolute;
    left: 289px;
    top: 21px;
    font-family: 思源黑体;
    font-size: 14px;
    color: #34394f;
  }
}

:deep(.van-loading) {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>
