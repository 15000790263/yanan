<template>
  <div
    class="wrapper"
    :class="{
      // 未通过
      'not-pass': workItem.reviewStatus === '0' && workItem.status === '0',
      // 超时(不论是否通过，只要未完成)，后期要加入审批中
      timeout: dayjs(workItem.endTime).unix() < dayjs().unix() && workItem.status === '0',
      finished: workItem.status === '1',
      'review-role': getUserRole() === '1',
      'secure-role': getUserRole() === '2',
    }"
  >
    <!-- 导致白屏 -->
    <!-- v-if="workItem && enterpriseInfo" -->

    <div class="all-btn" @click="$router.push('/work/work-plan-all')">全部</div>
    <!-- 框内信息 -->
    <div class="work-info" v-if="workItem.id">
      <WorkPlanItem
        v-bind="workItem"
        :enterpriseInfo="enterpriseInfo"
        @work-click="handleWorkClick"
      >
        <template #footer>
          <div class="check">作业计划已归档</div>
        </template>
      </WorkPlanItem>
      <div class="status">
        <div>
          {{
            workItem.reviewStatus === '0'
              ? '未审核'
              : workItem.reviewStatus === '1'
                ? '已审核'
                : '未通过'
          }}
        </div>
      </div>
    </div>

    <ul class="content">
      <li v-for="(item, index) in list" :key="index">
        <div class="title">{{ item.title }}：</div>
        <div class="value" v-html="item.value"></div>
      </li>
    </ul>

    <ul class="timeout content">
      <li>
        <div class="title">工作进展：</div>
        <div class="value">超时作废 <van-icon color="#fff" name="cross" size="12px" /></div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';
import dayjs from 'dayjs';
import WorkPlanItem from './components/work-plan-item.vue';
import { getWorkById, getSupplierWorkList, getUserinfoById, getPostById } from '@/api/work';
import { computed } from 'vue';
import { reactive } from 'vue';
import { getUserRole } from '@/utils/session';
import { useWorkStore } from '../../../stores/work/index';

const route = useRoute();
const router = useRouter();

const workItem = ref({});
const enterpriseInfo = ref(null);

const workStore = useWorkStore();

const workPlanTimeoutLimit = workStore.workPlanTimeoutLimit;

async function init() {
  const { data } = await getWorkById(route.query.id);
  const endTime = dayjs(data.data.endTime)
    .add(workPlanTimeoutLimit, 'hour')
    .format('YYYY-MM-DD HH:mm:ss');

  workItem.value = { ...data.data, endTime };

  const { data: value } = await getSupplierWorkList();
  enterpriseInfo.value = value.rows.find(item => item.id == workItem.value.company);

  if (data.data.reviewUserId) {
    getUserinfoById(data.data.reviewUserId).then(async res => {
      reviewInfo.name = res.data.nickName;
      if (res.data.postIds?.length) {
        const postArr = await Promise.all(res.data.postIds.map(id => getPostById(id)));
        reviewInfo.post = postArr.map(i => i.data.data.postName).toString();
      }
    });
  }
}

const reviewInfo = reactive({
  name: '',
  post: '',
});

const list = ref([
  {
    title: '审核人',
    value: computed(() => reviewInfo.name),
  },
  {
    title: '职位',
    value: computed(() => reviewInfo.post),
  },
  {
    title: '审批时间',
    value: computed(() => workItem.value.reviewDate || ''),
  },
  {
    title: '处理意见',
    value: computed(() => `<div style=color:#00B099;>${workItem.value.reviewComments || ''}</div>`),
  },
]);

init();

function handleWorkClick() {
  router[Symbol(0)] = workItem.value;
  router.push('/work/work-plan-detail');
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}

.wrapper {
  height: 100%;
  padding: 20px 16px 12px;
  display: flex;
  flex-direction: column;

  .all-btn {
    display: none;
  }

  :deep(.item-wrapper) {
    > .work-ticket,
    .finish-btn {
      display: none;
    }
  }

  .work-info {
    position: relative;
    .status {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 91px;
      height: 79px;
      background: url('/src/assets/image/work/icon-pass-no-text.png') no-repeat center/contain;

      font-family: 思源黑体;
      font-size: 24px;
      font-feature-settings: 'kern' on;
      color: #eee;

      display: grid;
      align-items: center;

      > div {
        text-align: center;
        transform: rotateZ(327deg);
      }
    }
  }

  .content {
    padding: 0 22px 16px;
    display: grid;
    row-gap: 20px;
    align-items: center;
    align-content: start;
    height: calc(100% - 204px);
    overflow-y: scroll;
    font-size: 14px;
    color: #34394f;

    > li {
      display: grid;
      grid-template-columns: 108px auto;
    }
  }

  .timeout.content {
    display: none;
  }

  // 通过但是超时样式
  &.timeout {
    .work-info > .item-wrapper {
      opacity: 0.7;
    }

    .timeout.content {
      display: block;
      border-top: 1px solid #d8d8d8;
      padding-top: 24px;
      .value {
        position: relative;
        color: #ff3700;

        .van-icon {
          position: absolute;
          z-index: 1;
          left: 65px;
          top: 4px;
        }

        &::after {
          content: '';
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          position: absolute;
          right: 110px;
          top: 0;
          background-color: #ff3700;
        }
      }
    }
  }

  // 已完工样式
  &.finished {
    .all-btn {
      display: block;
      padding-left: 20px;
      margin-bottom: 18px;
      font-size: 14px;
      color: #55596c;
    }
    .work-info {
      height: calc(100% - 35px);

      .status {
        display: none;
      }

      :deep(.item-wrapper) {
        margin-bottom: 0;
        height: 100%;
        background: #bee4f1;

        .icon {
          background: #93c0d0;
        }

        .content *,
        .user-info * {
          color: #17617e;
          -webkit-text-fill-color: unset;
        }

        .content .date {
          border-top-color: #84abbb;
        }

        .user-info .role {
          background-color: #bee4f191;
          background-blend-mode: difference;
        }

        > .work-ticket {
          display: block;
          height: calc(100% - 180px);

          .ticket-item-wrapper {
            background: #d7fafd;
          }
        }

        .finish-btn {
          display: grid;
        }

        .check {
          padding-left: 20px;
          background: url('/src/assets/image/work/icon-red-check.png') no-repeat left 4px/13px;
          margin-top: 10px;
          color: #17617e;
        }
      }
    }

    .content {
      display: none;
    }

    // review role样式
    &.review-role {
      .all-btn {
        display: none;
      }

      .work-info {
        height: 100%;
      }
    }

    &.secure-role {
      .all-btn {
        display: none;
      }

      .work-info {
        height: 100%;
      }
    }
  }

  // 未通过样式
  &.not-pass {
    .work-info > .item-wrapper {
      opacity: 0.3;
    }

    .work-info > .status {
      filter: grayscale(1);
      opacity: 0.7;
    }
  }
}
</style>
