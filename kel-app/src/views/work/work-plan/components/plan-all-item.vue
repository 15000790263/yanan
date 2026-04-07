<template>
  <div class="item-wrapper">
    <!-- 开工进行中按钮 -->
    <div class="three-btn">
      <div class="btn1">
        <div class="count">
          <!-- 还在审批中, +审批通过，但是超时了，而且未完成+审核未通过 -->
          <!-- 
            (i.reviewStatus === '0' && i.status !== '1')
            上面的写法是因为有错误数据，
            发现id为192的数据，没有审核通过，但是已经完成了
          -->
          {{
            dayWorkList.filter(
              i =>
                // 超时作废
                (i.endTimestamp <= dayjs().unix() && ['0', '2'].includes(i.status)) ||
                // 待审核
                (i.endTimestamp > dayjs().unix() &&
                  i.reviewStatus === '0' &&
                  ['0', '2'].includes(i.status)) ||
                // 待开工
                (i.reviewStatus === '1' &&
                  i.beginTimestamp > dayjs().unix() &&
                  i.endTimestamp > dayjs().unix() &&
                  ['0', '2'].includes(i.status)) ||
                // 未通过
                (i.reviewStatus === '2' && ['0', '2'].includes(i.status))
            ).length
          }}
        </div>
        <div>未开工</div>
      </div>
      <div class="btn2">
        <div class="count">
          {{
            dayWorkList.filter(
              i =>
                i.reviewStatus === '1' &&
                i.endTimestamp > dayjs().unix() &&
                // 进行中、已废弃也是进行中
                ['0', '2'].includes(i.status) &&
                i.beginTimestamp < dayjs().unix()
            ).length
          }}
        </div>
        <div>进行中</div>
      </div>
      <div class="btn3">
        <div class="count">{{ dayWorkList.filter(i => i.status === '1').length }}</div>
        <div>已完工</div>
      </div>
    </div>
    <!-- 搜搜框 -->
    <div class="search">
      <van-search v-model.trim="searchValue" shape="round" placeholder="请输入搜索工作计划">
        <template #right-icon>
          <div class="search-btn">搜索</div>
        </template>
      </van-search>
    </div>
    <!-- 列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :disabled="disabled">
      <div class="list" ref="listRef">
        <van-empty v-if="!dayWorkList.length" description="暂无数据" />
        <van-list
          v-model:loading="loading"
          offset="100"
          :finished="finished"
          :finished-text="dayWorkList.length ? '没有更多了' : ''"
          @load="onLoad"
        >
          <ul>
            <template v-for="item in dayWorkList">
              <li
                :id="String(item.id)"
                :key="item.id"
                v-if="!searchValue || item.projectName.includes(searchValue)"
                @click="onItemClick(item)"
              >
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
                <!-- 未开工目前只考虑审批通过但是超时的情况，没考虑审批中(添加审批中) -->

                <div class="icon"></div>
              </li>
            </template>
          </ul>
        </van-list>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, toRefs, onActivated, onDeactivated, watchEffect, nextTick } from 'vue';
import dayjs from 'dayjs';
import { getWorkList } from '../../../../api/work';
import { useWorkStore } from '../../../../stores/work/index';

import debounce from 'lodash.debounce';

const props = defineProps(['rangeTimes', 'active']);

const emit = defineEmits('loadMore');

const searchValue = ref('');

const isLoaded = ref(false);

// 全部的作业计划
const dayWorkList = ref([]);

onActivated(() => {});

const workStore = useWorkStore();

const workPlanTimeoutLimit = workStore.workPlanTimeoutLimit;

let listElScrollTop = 0;

let pageNum = 0;

// 加载条数
const PAGESIZE = 11;
let pageSize = PAGESIZE;

const workList = ref([]);

const debounceScroll = debounce(
  () => {
    const top = Number(router.scrollTop);
    const active = Number(router.active);
    if (props.active === active && top) {
      const timer = setInterval(() => {
        if (listRef.value.scrollTop !== router.scrollTop) {
          listRef.value.scrollTo({ top: Number(router.scrollTop) });
        } else {
          clearInterval(timer);
        }
      }, 50);
      setTimeout(() => {
        clearInterval(timer);
      }, 5000);
    }
  },
  1000000,
  { leading: true, trailing: false }
);

async function init() {
  pageNum += 1;
  const { data } = await getWorkList({ pageSize, pageNum });

  const list = data.rows.map(item => {
    const endTime = dayjs(item.endTime)
      .add(workPlanTimeoutLimit, 'hour')
      .format('YYYY-MM-DD HH:mm:ss');

    return {
      ...item,
      endTime,
      beginTimestamp: dayjs(item.beginTime).unix(),
      endTimestamp: dayjs(endTime).unix(),
    };
  });

  workList.value.push(...list);

  dayWorkList.value = workList.value.filter(
    item => item.beginTimestamp >= props.rangeTimes[0] && item.beginTimestamp <= props.rangeTimes[1]
  );

  await nextTick();

  if (pageNum * pageSize >= data.total) {
    finished.value = true;
  } else {
    finished.value = false;
  }

  // 第一次数据加载完成，再滚动页面
  debounceScroll();
}

// setInterval(() => {
//   console.log(finished.value);
// }, 1000);

const loading = ref(false);
const finished = ref(false);

// 列表上拉刷新
async function onLoad() {
  console.log(11111111111);
  // 异步更新数据
  await init();
  loading.value = false;
}

const refreshing = ref(false);

const disabled = ref(false);

const listRef = ref(null);

// 下拉刷新
async function onRefresh() {
  loading.value = true;
  initParams();
  await onLoad();
  refreshing.value = false;
}

onMounted(() => {
  listRef.value.onscroll = function () {
    disabled.value = this.scrollTop !== 0;
    listElScrollTop = this.scrollTop;
  };
});

const router = useRouter();
function onItemClick(item) {
  router.push(`/work/plan-all-detail?id=${item.id}`);
  router.scrollTop = listElScrollTop;
  router.active = props.active;
}

async function initParams() {
  pageNum = 0;
  pageSize = PAGESIZE;
  workList.value = [];
  finished.value = false;
}

initParams();
</script>

<style lang="less" scoped>
.item-wrapper {
  width: 100%;
  height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
}

.three-btn {
  width: 100%;
  padding: 0 25px;
  display: grid;
  grid-template-columns: repeat(3, auto);
  column-gap: 16px;
  margin-bottom: 12px;

  > div {
    width: 100%;
    height: 63px;
    background: #e0f3f4;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-family: 思源黑体;

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
    }

    &.btn2 {
      color: #1d73ff;
    }

    &.btn3 {
      color: #00b099;
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

:deep(.van-pull-refresh) {
  flex: 1;
}

.list {
  // flex: 1;
  height: 100%;
  overflow-y: scroll;

  ul {
    display: grid;
    // flex-direction: column;
    grid-template-rows: repeat(48px, auto);

    row-gap: 12px;
    position: relative;

    li {
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
        &.processing {
          color: #1d73ff;
        }

        &.finish {
          color: #00b099;
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

  .hide {
    display: none;
  }
}

:deep(.van-loading) {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>
