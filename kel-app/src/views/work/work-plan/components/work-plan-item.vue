<template>
  <div class="item-wrapper">
    <!-- 图标和计划信息 -->
    <van-row gutter="12" @click="$emit('work-click')">
      <van-col span="6">
        <div class="icon">
          <img src="/src/assets/image/work/icon-home-type.png" alt="" />
          <!-- '1' > 高危 -->
          <!-- '2' > 一般 -->
          <div class="type">{{ planType === '1' ? '高危' : '一般' }}</div>
        </div>
      </van-col>
      <van-col span="18">
        <div class="content">
          <div class="title">{{ projectName }}</div>
          <div class="desc">
            <div class="date">{{ beginTime }} 至 {{ endTime }}</div>
            <div>{{ enterpriseInfo?.enterpriseName }}</div>
            <div>{{ enterpriseInfo?.productionAddress }}</div>
          </div>
        </div>
      </van-col>
    </van-row>
    <!-- 甲方乙方 -->
    <div class="user-info">
      <div class="left-info">
        <div class="role"><span>甲方</span></div>
        <div>
          <div class="name">{{ firstName }}</div>
          <div class="number">{{ firstPhone }}</div>
        </div>
      </div>
      <div class="right-info">
        <div v-show="secondName" class="role"><span>承包</span></div>
        <div>
          <div class="name">{{ secondName }}</div>
          <div class="number">{{ secondPhone }}</div>
        </div>
      </div>
    </div>
    <!-- 工作票 -->
    <div class="work-ticket" @touchmove.stop>
      <OverlayScrollbarsComponent style="height: 100%; overflow: visible" defer>
        <template v-for="(item, index) in ticketList" :key="item.id">
          <work-ticket-item
            v-bind="item"
            :index="index + 1"
            :operationCompanyInfo="{ dept_name: enterpriseInfo?.productionAddress }"
            @click="handleTicketItem(item)"
          ></work-ticket-item>
        </template>
      </OverlayScrollbarsComponent>
    </div>
    <!-- 计划完成按钮 -->
    <div class="finish-btn">
      <slot name="footer">
        <van-button
          v-if="unApplyTickets.length || timeoutTickets.length"
          class="disabled"
          round
          type="primary"
          :icon="savePng"
          @click="deprecate"
        >
          作业计划废弃
          <template #icon>
            <van-icon name="delete" />
          </template>
        </van-button>
        <van-button
          v-else-if="isAllFinish"
          round
          type="warning"
          :icon="savePng"
          @click="workPlanFinish"
        >
          作业计划完成
        </van-button>
        <van-button v-else class="disabled" round disabled type="warning" :icon="savePng">
          作业计划完成
        </van-button>
      </slot>
    </div>
  </div>
</template>

<script setup>
import WorkTicketItem from './work-ticket-item.vue';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue';
import savePng from '../../../../assets/image/work/icon-survey-fill.png';
import {
  getTicketById,
  getOperationCompany,
  getTicketProcess,
  workPlanFinishRequest,
} from '@/api/work';
import { ref, onActivated, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog } from 'vant';
import { updatePlan } from '../../../../api/work';

const router = useRouter();

const props = defineProps([
  'projectName',
  'beginTime',
  'endTime',
  'firstName',
  'firstPhone',
  'secondName',
  'secondPhone',
  'id',
  'planType',
  'enterpriseInfo',
  'workTypeList',
  'workArea',
]);

const emit = defineEmits(['work-plan-finish']);

// 票列表
const ticketList = ref([]);
// 操作公司列表
const operationCompanyList = ref([]);

getOperationCompany().then(({ data }) => {
  operationCompanyList.value = data.data;
});

// 点击作业票事件
function handleTicketItem({ procInsId, id, status, deployId, taskId, ...others }) {
  // 添加了一些没有作业票的类型，点击无操作
  if (!procInsId) {
    router.push(
      `/work/apply-work-ticket?deployId=${others.deploymentId}&procDefId=${id}&workOperationType=${others.name}&planId=${props.id}&projectName=${props.projectName}&workArea=${props.workArea}`
    );
    return;
  }
  // 手签完成作业票点击有ui设计图
  // 审批未通过作业票点击查看详情，有图
  //  超时作废作业票暂时不处理
  switch (status) {
    case '1':
      // 审批通过
      router.push(
        `/work/work-ticket-detail?procInsId=${procInsId}&id=${id}&deployId=${deployId}&taskId=${taskId}&workOperationType=${others.workOperationType}`
      );
      break;
    case '2':
      // 超时作废
      router.push(
        `/work/work-ticket-record?procInsId=${procInsId}&deployId=${deployId}&taskId=${taskId}&workOperationType=${others.workOperationType}`
      );
      break;
    case '3':
      // 已保存(类似保存为草稿)
      // router.push(`/work/work-ticket-detail?procInsId=${procInsId}&id=${id}`);
      break;
    default:
      // 审批未通过
      router.push(
        `/work/work-ticket-record?procInsId=${procInsId}&deployId=${deployId}&taskId=${taskId}&workOperationType=${others.workOperationType}`
      );
      break;
  }
}

// 是否可以点击作业计划完成（已完成、审核未通过、超时都可以点击）
// Damn！！需求变了，作业票全部完成才可以点击作业计划完成
// 其他都可以点击废弃
const isAllFinish = ref(false);

onActivated(() => {
  init();
});

onMounted(() => {
  setTimeout(() => {
    init();
  }, 100);
});

// 未申请的作业票数组
const unApplyTickets = ref([]);
// 超时作废的作业票数组
const timeoutTickets = ref([]);

function init() {
  // 获取作业票信息
  getTicketById(props.id).then(async ({ data }) => {
    ticketList.value = data.rows.filter(i => i.status !== '3');
    const ids = data.rows.filter(i => i.status !== '3').map(i => i.deployId);

    // 未申请的作业票
    const usefulArr =
      props.workTypeList?.filter(item => {
        return !ids.includes(item.deploymentId);
      }) || [];

    unApplyTickets.value = usefulArr;

    timeoutTickets.value = ticketList.value.filter(item => item.status === '2');

    ticketList.value = [...ticketList.value, ...usefulArr];

    // arr是审核通过的作业票数组
    const arr = data.rows.filter(item => {
      return item.status === '1';
    });

    if (arr.length === data.rows.length) {
      // 获取过程信息
      const promise = arr.map(item => getTicketProcess(item.procInsId));
      const res = await Promise.all(promise);

      if (res.some(item => item.data.rows.length === 0)) {
        isAllFinish.value = false;
      } else {
        // 作业票是否完成
        isAllFinish.value = res.every(
          item => item.data.rows[item.data.rows.length - 1]?.fileStatus === '1'
        );
      }
    } else {
      isAllFinish.value = false;
    }
  });
}

// 作业计划完成
async function workPlanFinish() {
  showConfirmDialog({
    title: '提示',
    message: `确定完成：作业计划名称 ${props.projectName} 吗？`,
    confirmButtonColor: '#007B81  ',
    confirmButtonText: '完成',
    className: 'finish-plan',
  }).then(async () => {
    await workPlanFinishRequest({
      id: props.id,
      status: '1',
    });
    emit('work-plan-finish');
  });
}

async function deprecate() {
  // status === '2'，说明是废弃
  showConfirmDialog({
    title: '提示',
    message: `确定废弃：作业计划名称 ${props.projectName} 吗？`,
    confirmButtonColor: '#007B81  ',
    confirmButtonText: '废弃',
    className: 'finish-plan',
  }).then(async () => {
    await updatePlan({ id: props.id, status: '2' });
    emit('work-plan-deprecate');
  });
}
</script>

<style lang="less" scoped>
.item-wrapper {
  width: 343px;
  height: calc(100% - 16px);
  border-radius: 16px;

  /* app-vi-color-1 */
  background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
  box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);
  margin-bottom: 16px;
  padding: 24px 16px;

  .icon {
    width: 72px;
    height: 85px;
    border-radius: 4px;

    /* 自动布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    gap: 4px;
    background: #27a68f;
  }

  .type {
    /* 自动布局子元素 */
    height: 20%;
    font-family: '思源黑体';
    font-size: 12px;
    font-weight: normal;
    line-height: normal;
    letter-spacing: 0em;
    color: #d5f2eb;
    z-index: 1;
  }

  .content {
    width: 227px;
    height: 86px;

    /* 自动布局 */
    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 4px;

    .title {
      font-family: Source Han Sans;
      font-size: 16px;
      font-weight: bold;
      line-height: normal;
      letter-spacing: 0em;

      background: linear-gradient(180deg, #ffffff 0%, #89fff7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;

      max-height: 40px;
      // 超过两行显示...
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .desc {
      width: 225px;
      height: 56px;

      /* 自动布局 */
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 0px;
      gap: 2px;

      > div {
        width: 225px;
        height: 30.91%;
        font-family: '思源黑体';
        font-size: 12px;
        font-weight: normal;
        line-height: normal;
        letter-spacing: 0em;
        color: #d5f2eb;
      }

      .date {
        border-top: 1px solid #80d7c2;
        padding-top: 5px;
        flex: 1;
        height: unset;
      }
    }
  }
}

.user-info {
  width: 276px;
  height: 34px;
  display: flex;
  padding: 0px;
  gap: 24px;
  margin: 8px auto 12px;

  .left-info,
  .right-info {
    width: 126px;
    height: 34px;
    display: flex;
    gap: 5px;
  }

  .role {
    width: 48px;
    height: 34px;
    background: url('../../../../assets/image/work/label-img.png') no-repeat center center/48px;
    display: grid;
    place-items: center;

    span {
      display: inline-block;
      height: 67.65%;
      font-family: Source Han Sans;
      font-size: 16px;
      font-weight: bold;
      line-height: normal;

      font-feature-settings: 'kern' on;
      background: linear-gradient(180deg, #ffffff 0%, #89fff7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .name,
  .number {
    height: 50%;
    font-family: 思源黑体;
    font-size: 12px;
    font-weight: normal;
    line-height: normal;
    letter-spacing: 0em;
    color: #ffffff;
  }
}

.work-ticket {
  width: 302px;
  height: calc(100% - 175px);

  :deep(div[data-overlayscrollbars-contents]) {
    display: grid;
    grid-template-rows: repeat(auto-fill, 103px);
    padding: 8px 0px;
    row-gap: 12px;
    overflow-y: scroll;
  }

  :deep(.os-scrollbar-vertical) {
    height: 100%;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid rgba(169, 255, 234, 0.7);
    border-bottom: 8px solid rgba(169, 255, 234, 0.7);
    transform: translateX(18px);
    padding: 0;

    &::before {
      position: absolute;
      content: '';
      display: block;
      border-right: 2px dotted rgba(169, 255, 234, 0.3);
      height: 100%;
      margin-left: -1px;
    }

    .os-scrollbar-track {
      width: 16px;
      transform: translateX(-9px);
      pointer-events: none;
      .os-scrollbar-handle {
        width: 16px;
        height: 16px !important;
        border-radius: 50%;
        min-height: unset;
        background: rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(169, 255, 234, 0.7);
        position: relative;
        left: 1px;

        &::before {
          content: '';
          position: absolute;
          left: 3.5px;
          top: 3.5px;
          border-radius: 50%;
          width: 8px;
          height: 8px;
          background: rgba(169, 255, 234, 0.7);
        }
      }
    }
  }
}

.finish-btn {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding-top: 12px;

  .van-button {
    height: 34px;
    flex: 1;
    border-radius: 30px;
    background: #ff6a00;
    text-align: center;

    &.disabled {
      height: 34px;
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
<style>
.finish-plan > .van-dialog__header {
  color: #007b81;
}
</style>
