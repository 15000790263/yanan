<template>
  <van-pull-refresh v-model="loading" @refresh="onRefresh" :disabled="disabled">
    <div class="item-wrapper">
      <!-- 开工进行中按钮 -->
      <div class="three-btn">
        <div class="btn1" :class="{ active: currentIndex === 0 }" @click="typeClick(0)">
          <div class="count">
            <!-- 待审核：未审核且未过期 且未完成 -->
            {{ dayWorkList.filter(i => i.reviewStatus === '0' && i.status === '0').length }}
          </div>
          <div>待审核</div>
        </div>
        <div class="btn2" :class="{ active: currentIndex === 1 }" @click="typeClick(1)">
          <div class="count">
            {{ dayWorkList.filter(i => i.reviewStatus !== '0').length }}
          </div>
          <div>已审核</div>
        </div>
        <div class="btn3" :class="{ active: currentIndex === 2 }" @click="typeClick(2)">
          <div class="count">
            {{
              dayWorkList.filter(
                i => (i.reviewStatus === '0' && i.status === '0') || i.reviewStatus !== '0'
              ).length
            }}
          </div>
          <div>总数</div>
        </div>
      </div>
      <!-- 搜搜框 -->
      <!-- <div class="search">
      <van-search v-model.trim="searchValue" shape="round" placeholder="请输入搜索工作计划">
        <template #right-icon>
          <div class="search-btn">搜索</div>
        </template>
      </van-search>
    </div> -->
      <!-- 列表 -->
      <div class="list" ref="listRef">
        <ul>
          <template v-for="item in dayWorkApproveList" :key="item.id">
            <li @click="workItemClick(item)">
              <div class="work-plan">
                <van-checkbox
                  v-if="currentIndex === 0 && active !== 3"
                  @click.stop
                  v-model="item.checked"
                />
                <div style="flex: 1">
                  <van-text-ellipsis :content="item.projectName" />
                  <span style="font-size: 12px; color: #84abbb">
                    {{ item.beginTime }}
                  </span>
                </div>
              </div>
              <!-- 已完工 -->
              <div v-if="item.status === '1'" class="status finish">已完工</div>
              <!-- 已超时 -->
              <div v-else-if="item.endTimestamp <= dayjs().unix()" class="status timeout">
                已超时
              </div>

              <!-- 待审核 -->
              <div v-else-if="item.reviewStatus === '0'" class="status pending">待审核</div>

              <!-- 待开工 -->
              <div
                v-else-if="item.reviewStatus === '1' && item.beginTimestamp > dayjs().unix()"
                class="status waiting"
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
              <div v-else-if="item.reviewStatus === '2'" class="status failed">未通过</div>
              <!-- 未开工目前只考虑审批通过但是超时的情况，没考虑审批中(添加审批中) -->

              <div class="icon"></div>
            </li>
          </template>
        </ul>

        <div v-if="!dayWorkApproveList.length">
          <van-empty description="暂无数据" />
        </div>
      </div>
      <div v-if="dayWorkApproveList.find(item => item.checked)" style="padding: 15px 0 0">
        <van-button type="primary" block color="#00B099" @click="handlePass">计划通过</van-button>
      </div>
    </div>
  </van-pull-refresh>
</template>

<script setup>
import { getWorkList, getUserInfo, passWorkPlanAll, getWorkApproveList } from '@/api/work';
import dayjs from 'dayjs';
import { ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkStore } from '../../../../stores/work/index';
import { showToast } from 'vant';

const props = defineProps(['rangeTimes', 'active']);
const { rangeTimes } = toRefs(props);

// 按照日期的全部的作业计划
const dayWorkList = ref([]);

// 按照审核状态的全部的作业计划
const dayWorkApproveList = ref([]);

const workStore = useWorkStore();

const workPlanTimeoutLimit = workStore.workPlanTimeoutLimit;

async function getData() {
  // 获取全部作业计划
  await getWorkApproveList().then(({ data }) => {
    dayWorkList.value = data.rows
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
          item.beginTimestamp >= rangeTimes.value[0] && item.beginTimestamp <= rangeTimes.value[1]
      );

    dayWorkApproveList.value = dayWorkList.value
      .filter(item => item.reviewStatus === '0')
      .map(item => ({ ...item, checked: false }));
  });
}

getData();

onActivated(async () => {
  await getData();
  nextTick(() => {
    typeClick(currentIndex.value);
  });
});

const router = useRouter();

function workItemClick(item) {
  if (item.reviewStatus === '0' && item.endTimestamp >= dayjs().unix()) {
    // router.push(`/work/reject-page?id=${item.id}`);
    router[Symbol(0)] = item;
    router.push('/work/work-plan-detail');
  } else {
    router.push(`/work/plan-all-detail?id=${item.id}`);
  }
}

const currentIndex = ref(0);
//待审核边框
function typeClick(index) {
  currentIndex.value = index;

  dayWorkApproveList.value.forEach(item => (item.checked = false));

  if (index === 0) {
    // 待审核
    dayWorkApproveList.value = dayWorkList.value.filter(item => item.reviewStatus === '0');
  } else if (index === 1) {
    dayWorkApproveList.value = dayWorkList.value.filter(item => item.reviewStatus !== '0');
  }

  // 总数：已审核和未审核
  else if (index === 2) {
    dayWorkApproveList.value = dayWorkList.value.filter(
      item => item.reviewStatus !== '0' || item.reviewStatus === '0'
    );
  }
}

defineExpose({
  typeClick,
});

const loading = ref(false);

const disabled = ref(false);

const listRef = ref(null);

async function onRefresh() {
  await getData();
  nextTick(() => {
    typeClick(currentIndex.value);
  });
  loading.value = false;
}

onMounted(() => {
  listRef.value.onscroll = function () {
    disabled.value = this.scrollTop !== 0;
  };
});

async function handlePass() {
  const ids = dayWorkApproveList.value.filter(item => item.checked).map(item => item.id);

  const { data: res } = await getUserInfo();
  const reviewUserId = res.data.userId;
  const reviewUserName = res.data.nickName;

  const data = {
    ids,
    reviewComments: '通过',
    reviewDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    reviewStatus: '1',
    reviewUserId,
    reviewUserName,
  };
  await passWorkPlanAll(data);
  showToast('操作成功');
  getData();
}
</script>

<style lang="less" scoped>
.item-wrapper {
  width: 100%;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.three-btn {
  width: 100%;
  padding: 0 25px;
  display: grid;
  column-gap: 16px;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 12px;

  > div {
    height: 63px;
    background: #e0f3f4;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-family: 思源黑体;
    border-radius: 4px;

    > div {
      font-size: 14px;
      letter-spacing: 0em;
    }

    .count {
      font-size: 24px;
      letter-spacing: 0em;
      z-index: 0;
    }

    &.btn1 {
      color: #ff3700;
      &.active {
        border: 1px solid #ff3700;
      }
    }

    &.btn2 {
      color: #1d73ff;
      &.active {
        border: 1px solid #1d73ff;
      }
    }

    &.btn3 {
      color: #00b099;
      &.active {
        border: 1px solid #00b099;
      }
    }
  }
}

.search {
  padding: 8px 25px;

  :deep(.van-search) {
    width: 100%;
    padding: 0;
    height: 34px;
    border-radius: 30px;
    background: #fff;
    border: 1px solid #bbcece;

    .van-search__content {
      width: calc(100% - 12px);
      flex: unset;
    }

    .van-cell {
      height: 100%;
      background-color: #fff;
    }
  }

  .search-btn {
    font-family: 思源黑体;
    font-size: 14px;
    color: #00b099;
    z-index: 0;
    position: relative;
    padding-left: 16px;

    &::before {
      content: '';
      position: absolute;
      display: inline-block;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 1px;
      height: 20px;
      background-color: #84abbb;
    }
  }
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
        display: flex;

        .van-checkbox {
          width: 30px;
        }
      }

      .status {
        &.pending {
          color: #ff3700;
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

        &.reject {
          color: #ff3700;
        }

        &.timeout {
          color: #ff8800;
        }

        &.waiting {
          color: #00a2ff;
        }

        &.failed {
          color: #7e8183;
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
