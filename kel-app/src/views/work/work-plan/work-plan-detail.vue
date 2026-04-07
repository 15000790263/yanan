<template>
  <div
    class="wrapper"
    :class="{
      'not-pass': ['0', '2'].includes(info.reviewStatus),
      'review-role': getUserRole() === '1',
    }"
  >
    <template v-if="!saved">
      <!-- <div v-if="$route.query?.showToolbar" class="toolbar"> -->
      <div v-if="!getUserRole() && ['0', '2'].includes(info.reviewStatus)" class="toolbar">
        <!-- <div class="all" @click="$router.replace(`/work/work-plan-all`)">全部</div> -->
        <div class="edit" @click="handleEdit">编辑</div>
        <div class="del" @click="delPlan">删除</div>
      </div>
      <div class="header">
        <div class="work name">{{ info.projectName }}</div>
        <div class="work status">
          <div>
            {{
              // getUserRole() === '1' && info.reviewStatus === '0'
              info.reviewStatus === '0' ? '未审核' : info.reviewStatus === '1' ? '已通过' : '未通过'
            }}
          </div>
        </div>
      </div>
      <ul class="content">
        <template v-for="(item, index) in list" :key="index">
          <li v-if="item.value">
            <div class="title">{{ item.title }}：</div>
            <div class="value" v-html="item.value"></div>
          </li>
        </template>
      </ul>
      <div class="footer" v-if="info.reviewStatus === '0' && dayjs(info.endTime).isAfter(dayjs())">
        <div class="pass" @click="handlePass">计划通过</div>
        <div class="reject" @click="handleReject">计划不通过</div>
      </div>
    </template>

    <transition name="slide-left">
      <template v-if="saved">
        <div class="status">
          <div class="icon"></div>
          <div class="text">作业计划已通过</div>
          <div class="route">{{ time }}秒后跳转首页</div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { getWorkType, deletePlan, updatePlan, getUserInfo } from '@/api/work';
import { showConfirmDialog } from 'vant';
import { getUserRole } from '@/utils/session';
import dayjs from 'dayjs';
import { getUserinfoById } from '../../../api/work';

import { systemStore } from '@/stores/system.js';

const sysStore = systemStore();

const router = useRouter();
const symbol = Object.getOwnPropertySymbols(router).pop();

const info = router[symbol];
// // 是否内部单位
// const isInnerDept = ref(false);
// isInnerDept.value = info.deptId.split(',')[1] == '101';

getWorkType().then(({ data }) => {
  list.value.find(i => i.key === 1).value = data.data.records
    .filter(item => info.type?.split(',').includes(String(item.formId)))
    .map(item => `<div>${item.name}</div>`)
    .toString()
    .replace(/,/g, '');
});

info?.reviewUserId &&
  getUserinfoById(info.reviewUserId).then(res => {
    list.value.find(i => i.key === 2).value = res.data.nickName;
  });

const list = ref([
  {
    title: '部门名称',
    value: info?.deptName,
  },
  {
    title: '作业计划名称',
    value: `${info?.projectName}`,
  },
  {
    title: '作业片区',
    // value: info?.projectLocation // 这个感觉有歧义
    value: info?.workArea,
  },
  {
    title: '作业起止时间',
    value: `${info?.beginTime}至${info?.endTime}`,
  },
  {
    title: '作业对象类型',
    value:
      sysStore.dictMap.object_type.find(item => item.dictValue === info?.objectType)?.dictLabel ||
      '',
  },
  {
    title: '计划类别',
    value: info?.planType == '1' ? '高危作业计划' : '一般作业计划',
  },
  {
    title: '作业施工单位',
    value: info?.company,
  },
  {
    title: '甲方姓名',
    value: info?.firstName,
  },
  {
    title: '甲方联系电话',
    value: info?.firstPhone,
  },
  {
    title: '承包方姓名',
    value: info?.secondName,
  },
  {
    title: '承包商联系电话',
    value: info?.secondPhone,
  },
  {
    key: 1,
    title: '高危作业类型',
    value: '',
  },
  {
    title: '作业内容',
    value: info?.content,
  },
  {
    title: '申请人',
    value: info?.createBy,
  },
  {
    title: '申请时间',
    value: info?.createTime,
  },
  {
    title: '审核人',
    value: '',
    key: 2,
  },
  {
    title: '审核意见',
    value: info?.reviewComments,
  },
  {
    title: '审核时间',
    value: info?.reviewDate,
  },
]);

// 作业计划编辑
function handleEdit() {
  router.push(`/work/add-work-plan?id=${info.id}`);
}

// 作业计划删除
function delPlan() {
  showConfirmDialog({
    title: '提示',
    message: `确定要删除：作业计划名称 ${info.projectName} 吗？`,
    confirmButtonColor: '#FF3700',
    confirmButtonText: '删除',
    className: 'del-plan',
  }).then(async () => {
    await deletePlan(info.id);
    // router.replace(`/work/work-plan-all`);
    router.goBack(-2);
  });
}

// 定时器
let timer = -1;
const time = ref(3);

// 计划通过
const saved = ref(false);
async function handlePass() {
  const { data: res } = await getUserInfo();
  const reviewUserId = res.data.userId;
  const reviewUserName = res.data.nickName;

  const data = {
    id: info.id,
    reviewComments: '通过',
    reviewDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    reviewStatus: '1',
    reviewUserId,
    reviewUserName,
  };
  await updatePlan(data);
  saved.value = true;
  timer = setInterval(() => {
    time.value--;
    if (time.value === 0) {
      clearInterval(timer);
      goHome();
    }
  }, 1000);
}

onUnmounted(() => {
  clearInterval(timer);
});

function goHome() {
  // router.push('/work/work-plan-approve');
  router.goBack();
}

// 计划不通过
function handleReject() {
  router.replace(`/work/reject-page?id=${info.id}`);
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box !important;
}

.wrapper {
  height: 100%;
  padding: 20px 16px;
  display: grid;
  grid-template-rows: auto auto 1fr;
  row-gap: 16px;

  .toolbar {
    display: grid;
    grid-template-columns: 1fr auto auto;
    align-items: center;
    padding: 0 16px;
    color: #55596c;
    margin-top: -5px;

    .del {
      color: #ff3700;
      margin-left: 24px;
    }
  }

  .header {
    width: 100%;
    height: 80px;
    border-radius: 16px;
    background: #bee4f1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;

    .name {
      height: 23px;
      font-family: Source Han Sans;
      font-size: 16px;
      font-weight: bold;
      color: #17617e;
      width: 60vw;

      // 超出显示省略号
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }

    .status {
      width: 64px;
      height: 56px;
      background: url('/src/assets/image/work/icon-pass-no-text.png') no-repeat center/contain;

      font-family: 思源黑体;
      font-size: 16.8px;
      font-feature-settings: 'kern' on;
      color: #eeeeee;

      display: grid;
      align-items: center;

      > div {
        transform: rotateZ(327deg) translate(6px);
      }
    }
  }

  .content {
    height: 100%;
    padding: 0 22px;
    display: grid;
    row-gap: 20px;
    align-items: center;
    overflow-y: scroll;
    font-size: 14px;
    color: #34394f;
    align-content: baseline;

    > li {
      display: grid;
      grid-template-columns: 136px 1fr;

      .value {
        overflow-wrap: anywhere;
      }
    }
  }

  .footer {
    display: none;
  }

  &.not-pass {
    .header,
    .content {
      filter: grayscale(1);
    }
  }

  &.review-role {
    grid-template-rows: 80px auto;
  }

  &.not-pass.review-role {
    position: relative;
    .header,
    .content {
      filter: unset;
    }

    .header {
      .status {
        background: url('/src/assets/image/work/容器 6209.png') no-repeat left -4px/ 75%;
        > div {
          transform: translateY(28px);
          width: 48px;
          height: 23px;
          font-family: 思源黑体;
          font-size: 16px;
          font-feature-settings: 'kern' on;
          color: #ff6a00;
        }
      }
    }

    .content {
      height: calc(100% - 58px);
    }

    .footer {
      display: block;
      position: absolute;
      height: 58px;
      width: 100%;
      left: 0;
      bottom: 0;
      background: #fff;
      padding: 12px 80px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      column-gap: 15px;
      align-items: center;

      .pass {
        width: 100px;
        height: 34px;
        border-radius: 30px;
        background: #00b099;
        display: grid;
        place-items: center;
        color: #fff;
      }

      .reject {
        width: 100px;
        height: 34px;
        border-radius: 30px;
        opacity: 1;
        box-sizing: border-box;
        border: 1px solid #ff6a00;
        display: grid;
        place-items: center;
        color: #ff6a00;
      }
    }
  }

  .status {
    height: 100%;

    .icon {
      width: 72px;
      height: 72px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -90px);
      background: url('/src/assets/image/work/icon-correct.png') no-repeat center/contain;
    }

    .text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .route {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #84abbb;
    }
  }
}
</style>

<style>
.del-plan > .van-dialog__header {
  color: #ff3700;
}
</style>
