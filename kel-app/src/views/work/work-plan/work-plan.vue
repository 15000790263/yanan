<template>
  <div class="work-plan">
    <div class="work-plan-title">
      <div class="all-button" @click="goToAllList">全部</div>
      <div class="total-show">进行中 {{ dataIndex + 1 }}/{{ workList.length }}</div>
      <van-button
        class="add-button"
        round
        color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
        size="small"
        @click="handleAdd"
      >
        新增
      </van-button>
    </div>
    <van-pull-refresh style="height: calc(100% - 56px)" v-model="isRefresh" @refresh="onRefresh">
      <div class="work-plan-list">
        <slot name="content" :getEnterpriseInfo="getEnterpriseInfo">
          <van-swipe v-if="workList.length" ref="swipe" style="height: 100%" @change="dataChange">
            <van-swipe-item class="work-plan-list-item" v-for="(item, i) in workList" :key="i">
              <!-- <van-button @click="confirm(i)">aaaaa</van-button> -->
              <WorkPlanItem
                v-bind="item"
                :workTypeList="workTypeList.filter(value => item.type?.includes(value.formId))"
                :enterpriseInfo="getEnterpriseInfo(item.company)"
                @work-click="handleWorkClick(item)"
                @work-plan-finish="handleFinish(i)"
                @work-plan-deprecate="handleFinish(i)"
              ></WorkPlanItem>
            </van-swipe-item>
            <template #indicator> </template>
          </van-swipe>
        </slot>
        <div class="loading" v-show="loading">
          <div class="loading-icon"></div>
        </div>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import WorkPlanItem from './components/work-plan-item.vue';
import { getWorkList, getSupplierWorkList } from '@/api/work';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { onActivated } from 'vue';
import { getWorkType } from '../../../api/work';
import { useWorkStore } from '../../../stores/work/index';

const swipe = ref(null);
const router = useRouter();

// 作业计划表
const workList = ref([]);
// 单位信息表
const supplierList = ref([]);
const dataIndex = ref(-1);

const loading = ref(false);

const workStore = useWorkStore();

const workPlanTimeoutLimit = workStore.workPlanTimeoutLimit;

// 获取作业计划(审批通过 reviewStatus === '1', 且未过期, 未完成 )
async function init() {
  await getWorkList().then(({ data }) => {
    workList.value = data.rows
      .map(item => {
        const endTime = dayjs(item.endTime)
          .add(workPlanTimeoutLimit, 'hour')
          .format('YYYY-MM-DD HH:mm:ss');

        return {
          ...item,
          endTime,
          beginTimestamp: dayjs(item.beginTime).unix(),
          endTimestamp: dayjs(endTime).unix(),
        };
      })
      .filter(
        item =>
          item.reviewStatus === '1' &&
          item.endTimestamp > dayjs().unix() &&
          item.status === '0' &&
          item.beginTimestamp < dayjs().unix()
      );
    if (workList.value.length) {
      dataIndex.value = dataIndex.value !== -1 ? dataIndex.value : 0;
    }
  });
}

getSupplierWorkList().then(({ data }) => {
  supplierList.value = data.rows;
});

function getEnterpriseInfo(company) {
  return supplierList.value.find(item => item.id == company);
}

// 查看全部作业计划
function goToAllList() {
  router.push('/work/work-plan-all');
}

function dataChange(index) {
  dataIndex.value = index;
}

function handleFinish(index) {
  let i;
  if (index === 0) {
    i = workList.value.length - 2;
  } else if (index === workList.value.length - 1) {
    i = workList.value.length - 2;
  } else {
    i = dataIndex.value - 1;
  }
  loading.value = true;
  setTimeout(() => {
    workList.value.splice(index, 1);
    if (workList.value.length < 2) {
      dataIndex.value = workList.value.length - 1;
      loading.value = false;
      return;
    }
    swipe.value.swipeTo(i, {
      immediate: true,
    });
    setTimeout(() => {
      swipe.value.next();
    }, 200);
    loading.value = false;
  }, 2000);
}

// 点击作业计划跳转作业计划详情
function handleWorkClick(item) {
  router[Symbol(0)] = item;
  router.push('/work/work-plan-detail');
}

// 新增作业计划
function handleAdd() {
  router.push('/work/add-work-plan');
}

onActivated(init);

const workTypeList = ref([]);

getWorkType().then(res => {
  workTypeList.value = res.data.data.records;
});

// 下拉刷新
const isRefresh = ref(false);

async function onRefresh() {
  workList.value = [];
  await init();
  isRefresh.value = false;
}
</script>

<style scoped lang="less">
* {
  box-sizing: border-box !important;
}
.work-plan {
  height: 100%;
  &-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    font-size: 14px;
    .all-button {
      color: #55596c;
      padding: 0 20px;
    }
    .total-show {
      color: #888a95;
    }
    .add-button {
      width: 68px;
      height: 32px;
    }
  }
  &-list {
    height: calc(100% - 56px);
    height: 100%;
    position: relative;

    &-item {
      height: 100%;
      overflow-y: scroll;
      width: 100vw;
      padding: 0 16px;
    }
    .loading {
      width: 100%;
      height: 100%;
      background: #ffffff80;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      .loading-icon {
        width: 48px;
        height: 48px;
        background: conic-gradient(
          from 180deg at 50% 50%,
          #2ec192 0deg,
          rgba(37, 160, 226, 0) 360deg
        );
        border-radius: 50%;
        mask: radial-gradient(transparent 15px, #000 15px);
        animation: rotate linear 2s infinite;
        @keyframes rotate {
          0% {
            transform: rotateZ(0deg);
          }
          50% {
            transform: rotateZ(180deg);
          }
          100% {
            transform: rotateZ(360deg);
          }
        }
      }
    }
  }
}
</style>
