<template>
  <van-pull-refresh v-model="loading" @refresh="onRefresh" :disabled="disabled">
    <div class="item-wrapper">
      <!-- 列表 -->
      <div class="list" ref="listRef">
        <ul>
          <template v-for="item in dayWorkApproveList" :key="item.id">
            <li @click="workItemClick(item)">
              <div class="work-plan">
                <div>
                  <van-text-ellipsis :content="item.projectName" />
                </div>
                <span style="font-size: 12px; color: #84abbb">
                  {{ item.beginTime }}
                </span>
              </div>
              <!-- 已完工 -->
              <div v-if="item.status === '1'" class="status finish">已完工</div>
              <!-- 已超时 -->
              <div v-else-if="item.endTimestamp <= dayjs().unix()" class="status pending">
                已超时
              </div>

              <!-- 待审核 -->
              <div v-else-if="item.reviewStatus === '0'" class="status pending">未审核</div>

              <!-- 待开工 -->
              <div
                v-else-if="item.reviewStatus === '1' && item.beginTimestamp > dayjs().unix()"
                class="status pending"
              >
                待开工
              </div>
              <!-- 进行中 --><!-- 7月30日增加已废弃状态，status === '2' -->
              <div
                v-else-if="
                  item.reviewStatus === '1' &&
                  item.beginTimestamp < dayjs().unix() &&
                  item.status === '0'
                "
                class="status processing"
              >
                进行中
              </div>
              <div
                v-else-if="item.reviewStatus === '1' && item.beginTimestamp < dayjs().unix()"
                class="status processing"
              >
                已废弃
              </div>
              <!-- 未开工目前只考虑审批通过但是超时的情况，没考虑审批中(添加审批中) -->
              <div v-else-if="item.reviewStatus === '2'" class="status pending">未通过</div>
              <div class="icon"></div>
            </li>
          </template>
        </ul>

        <div v-if="!dayWorkApproveList.length">
          <van-empty description="暂无数据" />
        </div>
      </div>
    </div>
  </van-pull-refresh>
</template>

<script setup>
import { getWorkList } from '@/api/work';
import dayjs from 'dayjs';
import { ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { getParamsById } from '../../../../api/system';

const props = defineProps(['rangeTimes']);
const { rangeTimes } = toRefs(props);

const workPlanTimeoutLimit = ref(0);

async function getParams() {
  const res = await getParamsById(109);
  workPlanTimeoutLimit.value = Number(res.data.data.configValue);
  getData();
}

getParams();

// 按照日期的全部的作业计划
const dayWorkList = ref([]);

// 按照审核状态的全部的作业计划
const dayWorkApproveList = ref([]);

async function getData() {
  // 获取全部作业计划
  await getWorkList().then(({ data }) => {
    dayWorkList.value = data.rows
      .map(item => {
        const endTime = dayjs(item.endTime)
          .add(workPlanTimeoutLimit.value, 'hour')
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
          item.beginTimestamp >= rangeTimes.value[0] && item.beginTimestamp <= rangeTimes.value[1]
      );

    dayWorkApproveList.value = dayWorkList.value.filter(item => item.reviewStatus === '1');
  });
}

const router = useRouter();

function workItemClick(item) {
  // if (item.reviewStatus === '0' && item.endTimestamp >= dayjs().unix()) {
  //   // router.push(`/work/reject-page?id=${item.id}`);
  //   router[Symbol(0)] = item;
  //   router.push('/work/work-plan-detail');
  // } else {
  //   router.push(`/work/plan-all-detail?id=${item.id}`);
  // }
  if (item.status === '1') {
    router[Symbol(0)] = item;
    router.push('/work/finished-plan-detail');
  } else {
    router.push(`/work/plan-all-detail?id=${item.id}`);
  }
}

const loading = ref(false);

const disabled = ref(false);

const listRef = ref(null);

async function onRefresh() {
  await getData();
  loading.value = false;
}

onMounted(() => {
  listRef.value.onscroll = function () {
    disabled.value = this.scrollTop !== 0;
  };
});
</script>

<style lang="less" scoped>
.item-wrapper {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.list {
  flex: 1;
  overflow-y: scroll;

  > ul {
    display: flex;
    flex-direction: column;
    gap: 12px;

    > li {
      display: flex;
      height: 48px;
      padding: 0 12px;
      font-family: 思源黑体;
      font-size: 14px;
      background-color: #fff;
      align-items: center;

      .work-plan {
        color: #34394f;
        flex: 1;
        padding-right: 10px;
      }

      .status {
        &.pending {
          color: #ff3700;
        }
        &.waiting {
          color: #ff8800;
        }
        &.processing {
          color: #1d73ff;
        }

        &.finish {
          color: #00b099;
        }
        &.stop {
          color: #9c27b0;
        }
      }

      .icon {
        width: 24px;
        height: 24px;
        margin-left: 8px;
        background: url('/src/assets/image/work/icon-arrows.png') no-repeat center 4px/6px 12px;
      }
    }
  }
}
</style>
