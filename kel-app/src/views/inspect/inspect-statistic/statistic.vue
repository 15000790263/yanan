<template>
  <div class="wrapper">
    <div class="tabs-container">
      <type-switcher
        bgTransparent
        defaultActive="regulator"
        @onActiveChange="handleTabChange"
        ref="tabSwitcherRef"
      />
    </div>

    <div class="date-choice" @click="handleDateChoice">
      <transition name="animate" mode="out-in">
        <template v-if="tabActive === 'pipeline'">
          <span class="date-time" @click="choiceDate">{{ dateValue }}</span>
        </template>
        <template v-else-if="tabActive === 'station'">
          <div class="animate-wrapper">
            <span data-value="1" :class="{ active: dateType === 1 }">日</span>
            <span data-value="2" :class="{ active: dateType === 2 }">月</span>
            <!-- <span data-value="3" :class="{ active: dateType === 3 }">年</span> -->
            <span data-value="4" :class="{ active: dateType === 4 }">自定义</span>
            <span class="date-time" @click="choiceDate">{{ dateValue }}</span>
          </div>
        </template>
        <template v-else>
          <div class="animate-wrapper">
            <span data-value="1" :class="{ active: dateType === 1 }">日</span>
            <span data-value="2" :class="{ active: dateType === 2 }">月</span>
            <span data-value="3" :class="{ active: dateType === 3 }">年</span>
            <span data-value="4" :class="{ active: dateType === 4 }">自定义</span>
            <span class="date-time" @click="choiceDate">{{ dateValue }}</span>
          </div>
        </template>
      </transition>
    </div>

    <div class="scroll-container">
      <div class="completion-rate" v-if="tabActive !== 'station'">
        <div class="title-wrapper">
          <div class="left"></div>
          <div class="title">{{ Enum[tabActive] }}巡检完成{{ dateType === 3 ? '率' : '统计' }}</div>
          <div class="right"></div>
        </div>

        <div class="chart">
          <template v-for="(item, index) in sList" :key="index">
            <div class="pillar">
              <span class="count">
                {{
                  (dateType === 3
                    ? (
                        (statisticInfo?.[item.id]?.inspectCount
                          ? statisticInfo?.[item.id]?.inspectCount / statisticInfo?.[item.id]?.total
                          : 0) * 100
                      ).toFixed(1) + '%'
                    : statisticInfo?.[item.id]?.inspectCount) || 0
                }}
              </span>
              <span
                class="content"
                :style="{
                  height: getHeight(item.id),
                }"
              ></span>
              <span class="area">{{ item.text }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="completion-count">
        <div class="title-wrapper">
          <div class="left"></div>
          <div class="title">{{ Enum[tabActive] }}巡检数</div>
          <div class="right"></div>
        </div>
        <div class="area-list">
          <template v-for="(item, index) in sList" :key="index">
            <AreaCountItem
              :data="statisticInfo?.[item.id]"
              :name="item.text"
              :dateType="dateType"
              :showMid="!['pipeline', 'station'].includes(tabActive)"
            />
          </template>
        </div>
      </div>
    </div>

    <DateSelector v-model="showDatePup" :columnsType="columnsType" @choice="handleChoice" />
  </div>
</template>

<script setup>
import TypeSwitcher from '../components/type-switcher3/index.vue';
import AreaCountItem from '../components/area-count-item';
import DateSelector from '../components/date-selector';
import dayjs from 'dayjs';

import { api_regulator, api_well, api_yinbao } from '../../../api/inspect';
import { createLoading } from '../../../utils/loading-fn';
import { api_pipeline, api_station } from '../../../api/inspect';

const Enum = Object.freeze({
  regulator: '调压箱',
  well: '阀井',
  pipeline: '管线',
  station: '调压站',
});

const tabActive = ref('regulator');

function handleTabChange(type) {
  tabActive.value = type;
  if (type !== 'pipeline') {
    if (dateValue.value === '请选择') {
      // 自定义时默认不发送请求
      statisticInfo.value = {};
      return;
    }
    getData();
  } else {
    // 从日月年切换到管线统计时
    if (dateType.value !== 4) {
      handleDateChoice({
        target: {
          dataset: {
            value: 4,
          },
        },
      });
    } else {
      // 从自定义切换到管线统计
      if (dateValue.value === '请选择') {
        // 自定义时默认不发送请求
        statisticInfo.value = {};
        return;
      }
      getData();
    }
  }
}

const dateType = ref(1);

function handleDateChoice(e) {
  if (e.target.dataset.value) {
    if (dateType.value !== Number(e.target.dataset.value)) {
      dateType.value = Number(e.target.dataset.value);
      const arr1 = ['', 'YYYY-MM-DD', 'YYYY-MM', 'YYYY', '请选择'];
      dateValue.value = dayjs().format(arr1[dateType.value]);

      const arr2 = ['', '3', '2', '1'];
      mark.value = arr2[dateType.value];

      if (dateValue.value === '请选择') {
        // 自定义时默认不发送请求
        statisticInfo.value = {};
        return;
      }
      getData();
    }
  }
}

const dateValue = ref(dayjs().format('YYYY-MM-DD'));

const showDatePup = ref(false);

const columnsType = computed(() => {
  let value = ['year', 'month', 'day'];
  switch (dateType.value) {
    case 1:
      value = ['year', 'month', 'day'];
      break;
    case 2:
      value = ['year', 'month'];
      break;
    case 3:
      value = ['year'];
      break;
    case 4:
      value = ['range'];
      break;
    default:
      break;
  }
  return value;
});

function choiceDate() {
  showDatePup.value = true;
}

function handleChoice(date) {
  dateValue.value = date;
  getData();
}

// 请求参数：level, mark, patrolDate, patrolBeginDate, patrolEndDate
const level = ref('1');
const mark = ref('3');
const patrolDate = computed(() => {
  let dv = dateValue.value;
  if (dateType.value === 2 && tabActive.value !== 'station') {
    // 选择月，dv: 2024-07，需要修改为2024-07-01
    dv += '-01';
  }
  return dv;
});

const patrolBeginDate = computed(() => {
  let dv = dateValue.value;
  if (dateType.value === 4) {
    dv = dv.split('~')[0];
  }
  return dv;
});

const patrolEndDate = computed(() => {
  let dv = dateValue.value;
  if (dateType.value === 4) {
    dv = dv.split('~')[1];
  }
  return dv;
});

const params = computed(() => {
  let p = {
    level: level.value,
    mark: mark.value,
    patrolDate: patrolDate.value,
  };
  if (dateType.value === 4) {
    // 范围选择，修改参数
    p = {
      level: level.value,
      patrolBeginDate: patrolBeginDate.value,
      patrolEndDate: patrolEndDate.value,
    };
  }

  // 管线统计
  if (tabActive.value === 'pipeline') {
    p = {
      beginDate: patrolBeginDate.value,
      endDate: patrolEndDate.value,
    };
  }

  // // 阴保统计
  // if (tabActive.value === 'yinbao') {
  //   console.log(11111);
  // }
  return p;
});

const getStatisticInfo = computed(() => {
  let v = api_regulator.getStatisticInfo;
  switch (tabActive.value) {
    case 'regulator':
      v = api_regulator.getStatisticInfo;
      break;
    case 'well':
      v = api_well.getStatisticInfo;
      break;
    case 'pipeline':
      v = api_pipeline.getStatisticInfo;
      break;
    case 'station':
      v = api_station.getStatisticInfo;
      break;
    case 'yinbao':
      v = api_yinbao.getStatisticInfo;
      break;
    default:
      break;
  }
  return v;
});

async function getData() {
  const destroyLoading = createLoading();
  const res = await getStatisticInfo.value(params.value);
  destroyLoading();
  if (tabActive.value !== 'pipeline') {
    statisticInfo.value = listToTree(res.data.data);
  } else {
    statisticInfo.value = pipelineListToTree(res.data.data);
  }
}

function listToTree(list) {
  const tree = {};
  const temp = new Set();
  list.forEach(item => {
    if (!temp.has(item.workArea)) {
      tree[item.workArea] = {};
      // 任务总数
      tree[item.workArea].total = 0;
      // 巡检正常数
      tree[item.workArea].right = 0;
      // 巡检异常数
      tree[item.workArea].error = 0;
      // 已巡检总数 = 巡检正常数 + 巡检异常数
      Object.defineProperty(tree[item.workArea], 'inspectCount', {
        get() {
          return this.right + this.error;
        },
      });
      // 已确认数：state = 1, label != total
      tree[item.workArea].confirmed = 0;
      // 未确认数：state = 0, label != total、notInspected
      tree[item.workArea].unconfirmed = 0;
      // 未巡检数，在月统计数据中有返回
      tree[item.workArea].notInspected = 0;

      // 已确认正常数：state = 1, label = right
      tree[item.workArea].confirmRight = 0;

      // 已确认异常数：state = 1, label = error
      tree[item.workArea].confirmError = 0;

      temp.add(item.workArea);
    }

    if (item.label === 'total') {
      tree[item.workArea].total += item.num ?? 0;
    }
    if (item.label === 'right') {
      tree[item.workArea].right += item.num ?? 0;
    }
    if (item.label === 'error') {
      tree[item.workArea].error += item.num ?? 0;
    }

    if (item.state === '1' && item.label !== 'total') {
      tree[item.workArea].confirmed += item.num ?? 0;
    }

    if (item.state === '0' && item.label !== 'total' && item.label !== 'notInspected') {
      tree[item.workArea].unconfirmed += item.num ?? 0;
    }

    if (item.label === 'notInspected') {
      tree[item.workArea].notInspected += item.num ?? 0;
    }

    if (item.label === 'right' && item.state === '1') {
      tree[item.workArea].confirmRight += item.num ?? 0;
    }

    if (item.label === 'error' && item.state === '1') {
      tree[item.workArea].confirmError += item.num ?? 0;
    }
  });
  return tree;
}

function pipelineListToTree(list) {
  const tree = {};
  const temp = new Set();

  list.forEach(item => {
    if (!temp.has(item.work_area)) {
      tree[item.work_area] = {};
      // 任务总数
      tree[item.work_area].total = 0;
      // 巡检正常数: patrol_status === 1
      tree[item.work_area].right = 0;
      // 巡检异常数: patrol_status === 2
      tree[item.work_area].error = 0;
      // 已巡检总数 = 巡检正常数 + 巡检异常数
      Object.defineProperty(tree[item.work_area], 'inspectCount', {
        get() {
          return this.right + this.error;
        },
      });
      // 已确认数：state = 1
      tree[item.work_area].confirmed = 0;
      // 未确认数：state = 0
      tree[item.work_area].unconfirmed = 0;
      // 未巡检数，在月统计数据中有返回
      tree[item.work_area].notInspected = 0;

      // 已确认正常数：state = 1, patrol_status = 1
      tree[item.work_area].confirmRight = 0;

      // 已确认异常数：state = 1, patrol_status = 2
      tree[item.work_area].confirmError = 0;

      temp.add(item.work_area);
    }

    if (item.patrol_status === 1) {
      tree[item.work_area].right += item.numb;
    }

    if (item.patrol_status === 2) {
      tree[item.work_area].error += item.numb;
    }

    if (item.state === 1) {
      tree[item.work_area].confirmed += item.numb;
    }

    if (item.state === 0) {
      tree[item.work_area].unconfirmed += item.numb;
    }

    if (item.state === 1 && item.patrol_status === 1) {
      tree[item.work_area].confirmRight += item.numb;
    }

    if (item.state === 1 && item.patrol_status === 2) {
      tree[item.work_area].confirmError += item.numb;
    }
  });

  return tree;
}

getData();

const statisticInfo = ref({});

const maxInspectCount = computed(() => {
  const o = statisticInfo.value;
  const arr = Object.keys(o).map(item => o[item].inspectCount);
  return arr.sort((x, y) => x - y).pop();
});

const sList = computed(() => {
  if (tabActive.value !== 'station') {
    return [
      {
        id: 'K',
        text: '开发区',
      },
      {
        id: 'L',
        text: '老城区',
      },
      {
        id: 'X',
        text: '新城区',
      },
      {
        id: 'S',
        text: '输配区',
      },
      {
        id: 'C',
        text: '次高压',
      },
    ];
  }
  return [
    {
      id: 'C',
      text: '次高压',
    },
  ];
});

function getHeight(id) {
  let height =
    maxInspectCount.value > 0
      ? `${((statisticInfo.value?.[id]?.inspectCount || 0) / maxInspectCount.value) * 100}%`
      : '0px';

  if (dateType.value === 3) {
    // 按年，显示年度百分比完成率
    height = statisticInfo.value?.[id]?.total
      ? `${(statisticInfo.value?.[id]?.inspectCount / statisticInfo.value?.[id]?.total) * 100}%`
      : '0px';
  }

  return height;
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;

  .tabs-container {
    width: 100%;
    height: 113px;
    box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);
  }

  .date-choice {
    padding: 0 24px;
    height: 45px;
    display: grid;
    align-items: center;

    .animate-wrapper {
      display: grid;
      grid-template-columns: repeat(3, 1fr) 3fr auto;
      column-gap: 4px;
      align-items: center;
    }

    span {
      border-radius: 4px;
      background: #bbcece;
      display: inline-block;
      height: 30px;
      display: grid;
      place-items: center;

      font-family: 思源黑体;
      font-size: 14px;
      color: #ffffff;

      &.date-time {
        color: #34394f;
        padding-left: 24px;
        background: url('/src/assets/image/check/icon-time-fill.png') no-repeat left / 22px;
        display: inline-flex;
      }

      &.active {
        background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
      }
    }
  }

  .scroll-container {
    height: calc(100% - 113px - 45px);
    padding: 10px 24px;
    overflow-y: scroll;

    .completion-rate {
      height: 246px;
      border-radius: 8px;
      background: linear-gradient(180deg, #d4f3ec 0%, #d3f0ff 100%);
      padding: 16px;

      .title-wrapper {
        display: grid;
        grid-template-columns: repeat(3, auto);
        align-items: center;
        justify-items: center;
        height: 60px;
        margin-top: -12px;

        .title {
          height: 48px;
          line-height: 48px;

          font-family: 思源黑体;
          font-size: 16px;
          font-variation-settings: 'opsz' auto;
          font-feature-settings: 'kern' on;
          /* app-text-1 */
          color: #34394f;
        }

        .left,
        .right {
          width: 51px;
          height: 8px;
          background: #80d7c2;
        }
      }

      .chart {
        height: 166px;
        border-radius: 8px;
        padding: 25px;
        display: grid;
        grid-template-columns: repeat(5, 30px);
        column-gap: 20px;
        justify-content: center;
        background:
          url('/src/assets/image/check/icon-line2x.png') no-repeat 50% 72.5% / 90%,
          url('/src/assets/image/check/icon-line.png') no-repeat 8% / 8px 70%;
        background-color: #e6fffb;

        .pillar {
          display: grid;
          grid-template-rows: auto 1fr auto;
          row-gap: 5px;
          justify-items: center;

          > span {
            display: inline-block;
          }
          .count {
            font-family: Source Han Sans;
            font-size: 12px;
            color: #34394f;
          }

          .content {
            width: 26px;
            background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
            border-radius: 4px 4px 0 0;
            align-self: flex-end;
            height: 50%;
          }

          .area {
            width: 36px;
            height: 17px;
            font-family: Source Han Sans;
            font-size: 12px;
            color: #34394f;
          }
        }
      }
    }

    .completion-count {
      .title-wrapper {
        .completion-rate > .title-wrapper();
        margin-top: 0;
        height: 72px;
      }

      .area-list {
        display: grid;
        grid-template-rows: repeat(4, auto);
        gap: 16px;
      }
    }
  }

  .animate-enter-active,
  .animate-leave-active {
    transition: opacity 0.2s ease;
  }

  .animate-enter-from,
  .animate-leave-to {
    opacity: 0.5;
  }
}
</style>
