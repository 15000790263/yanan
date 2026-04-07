<template>
  <div class="wrapper">
    <div class="total-count">总数：{{ total }}个</div>

    <van-tabs v-model:active="active" type="card">
      <template v-for="(item, index) in tabList" :key="index">
        <van-tab :title="item.title">
          <template #title>
            <div class="tab-title">
              <div style="font-size: 20px">{{ item.num }}</div>
              <div>
                {{ item.title }}
              </div>
            </div>
          </template>
          <div class="list">
            <template v-for="item in list">
              <div class="item" @click="goToDetail(item)">
                <div class="left">
                  <div class="name">{{ item.workOperationType }}</div>
                  <div class="time">{{ item.operationTime }}</div>
                </div>
                <div
                  class="mid"
                  :style="{ color: item.processStatus === '0' ? '#3381ff' : '#0db49e' }"
                >
                  {{ item.processStatus === '0' ? '进行中' : '已完成' }}
                </div>
                <div class="right">
                  <van-icon name="arrow" />
                </div>
              </div>
            </template>
          </div>
        </van-tab>
      </template>
    </van-tabs>
  </div>
</template>

<script setup>
import { getTicketsManage, getTicketsManageStatistic } from '@/api/work';
import { createLoading } from '../../../utils/loading-fn';

const router = useRouter();
const active = ref(0);

const tabList = ref([
  {
    title: '进行中',
    processStatus: '0',
    num: 0,
  },
  {
    title: '已完成',
    processStatus: '1',
    num: 0,
  },
]);

const total = ref(0);

let pageNum = 1;

// 加载条数
let pageSize = 1000;

const list = ref([]);

const params = computed(() => ({
  pageNum,
  pageSize,
  processStatus: tabList.value[active.value].processStatus,
}));

function init() {
  const destroy = createLoading();
  getTicketsManage(params.value)
    .then(async ({ data }) => {
      // list.value = [...list.value, ...data.rows];
      list.value = data.rows;
    })
    .finally(() => {
      destroy();
    });
}

function getStatistic() {
  getTicketsManageStatistic().then(({ data }) => {
    console.log(data.data.find(item => item.processStatus === '1').num);
    tabList.value[0].num = data.data.find(item => item.processStatus === '0')?.num || 0;
    tabList.value[1].num = data.data.find(item => item.processStatus === '1')?.num || 0;

    total.value = data.data.reduce((pre, cur) => {
      if (cur.processStatus) {
        // '0' or '1'
        return pre + cur.num;
      }
      return pre;
    }, 0);
  });
}

watchEffect(() => {
  init();
});

getStatistic();

function goToDetail(item) {
  const { procInsId, id, deployId, taskId, workOperationType } = item;
  router.push(
    `/work/work-ticket-detail?procInsId=${procInsId}&id=${id}&deployId=${deployId}&taskId=${taskId}&workOperationType=${workOperationType}`
  );
}
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

  .total-count {
    font-family: 思源黑体;
    font-size: 14px;
    color: #34394f;
    text-align: right;
    padding-bottom: 16px;
  }

  :deep(.van-tabs) {
    --van-tabs-card-height: 70px;
    .van-tabs__wrap {
      .van-tabs__nav {
        margin: 0 50px;
        border: none;

        .van-tab {
          background-color: #e0f3f4;
          border: 1px solid #0000;

          &.van-tab--active {
            // bgc
            border: 1px solid #26a69a;
          }
          .van-tab__text {
            font-weight: 600;
          }

          &:first-child {
            color: #3381ff;
          }

          &:last-child {
            color: #0db49e;
          }
        }
      }
    }
  }

  .tab-title {
    display: flex;
    flex-direction: column;
    height: 50px;
    justify-content: space-between;
    align-items: center;
  }

  .list {
    margin-top: 16px;
    display: grid;
    row-gap: 6px;
    overflow-y: scroll;
    height: calc(100vh - 200px);
    grid-template-rows: repeat(auto-fill, 48px);

    .item {
      height: 48px;
      background-color: #fff;
      display: flex;
      align-items: center;
      padding: 0 16px;
      color: #34394f;
      font-size: 14px;

      .left {
        flex: 1;
        padding-right: 10px;
        // 显示省略号
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;

        .time {
          font-size: 12px;
          color: #84abbb;
        }
      }

      .mid {
      }

      .right {
        padding-left: 16px;
      }
    }
  }
}
</style>
