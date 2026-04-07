<template>
  <div class="wrapper">
    <div class="days">
      安全生产运行天数
      <span>
        {{ num }}
      </span>
      天
    </div>
    <div class="inspect-statistic">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        "
      >
        <div class="title">巡检统计</div>
        <div class="date">
          <div class="left">日期</div>
          <div class="right" @click="pickDate">
            <span>
              {{ date }}
            </span>
            <van-icon name="calendar-o" />
          </div>
        </div>
      </div>

      <div class="list-wrapper">
        <template v-for="(item, index) in showData">
          <inspectItem :item="item"></inspectItem>
        </template>
      </div>
    </div>
    <div class="pitfall-statistic">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        "
      >
        <div class="title">隐患统计</div>
        <div class="date">
          <van-radio-group v-model="checked" @change="typeChange">
            <van-radio :name="0" icon-size="24px">
              <template #icon>当日</template>
            </van-radio>
            <van-radio :name="1" icon-size="24px">
              <template #icon>本月</template>
            </van-radio>
            <van-radio :name="2" icon-size="24px">
              <template #icon>本周</template>
            </van-radio>
            <van-radio :name="3" icon-size="24px">
              <template #icon>本年</template>
            </van-radio>
          </van-radio-group>
        </div>
      </div>
      <div class="pitfall-content">
        <div class="normal">
          <div class="name">一般隐患</div>
          <div class="item">
            <div>
              <div class="top" style="color: #1e73f3">{{ data.a.all }}</div>
              <div class="bottom">总数</div>
            </div>
            <div>
              <div class="top" style="color: #32ef1d">{{ data.a.complete }}</div>
              <div class="bottom">已处理</div>
            </div>
            <div>
              <div class="top" style="color: #e3b933">{{ data.a.processing }}</div>
              <div class="bottom">处理中</div>
            </div>
            <div>
              <div class="top" style="color: #f41e03">{{ data.a.pending }}</div>
              <div class="bottom">未处理</div>
            </div>
          </div>
        </div>
        <div class="important">
          <div class="name">重大隐患</div>
          <div class="item">
            <div>
              <div class="top" style="color: #1e73f3">{{ data.b.all }}</div>
              <div class="bottom">总数</div>
            </div>
            <div>
              <div class="top" style="color: #32ef1d">{{ data.b.complete }}</div>
              <div class="bottom">已处理</div>
            </div>
            <div>
              <div class="top" style="color: #e3b933">{{ data.b.processing }}</div>
              <div class="bottom">处理中</div>
            </div>
            <div>
              <div class="top" style="color: #f41e03">{{ data.b.pending }}</div>
              <div class="bottom">未处理</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="repair-health-statistic">
      <div class="title" style="margin-bottom: 12px">维保检统计</div>
      <div class="repair-health-content">
        <template v-for="(value, key) in rhData">
          <div>
            <div class="name">{{ key }}</div>
            <div>
              <template v-for="(v2, key2) in value">
                <div class="item">
                  <div :class="`top ${key2}`">
                    {{ v2 }}
                  </div>
                  <div class="bottom">{{ map[key2] }}</div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
    </div>
    <DateSelector v-model="showDatePup" :columnsType="columnsType" @choice="handleChoice" />
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import inspectItem from '../components/inspect-item.vue';
import {
  getPipeline,
  getPressureRegulatingBox,
  getValvePit,
  hazardInformation,
  maintenanceStatistics,
  getSafetyDays,
} from '@/api/cockpit';
import DateSelector from '@/views/inspect/components/date-selector/index.vue';

const num = ref('--');

const checked = ref(0);

//
const date = ref(dayjs().format('YYYY-MM-DD'));
const showData = ref([]);
const area = [
  {
    name: '老城区',
    workArea: 'L',
  },
  {
    name: '新城区',
    workArea: 'X',
  },
  {
    name: '开发区',
    workArea: 'K',
  },
  {
    name: '输配区',
    workArea: 'S',
  },
  {
    name: '次高压组',
    workArea: 'C',
  },
];

const indexFind = {
  L: 0,
  X: 1,
  K: 2,
  S: 3,
  C: 4,
};

const showDatePup = ref(false);

function pickDate() {
  showDatePup.value = true;
}

function handleChoice(data) {
  date.value = data;
  search();
}

const option = {
  tooltip: {
    trigger: 'item',
    // confine: true,
    appendToBody: true,
    position: ['50%', '50%'],
  },
  series: [],
};

const itemData = {
  name: '',
  workArea: '',
  pipeline: {
    // 巡检长度
    distance: 0,
    // 总巡检数量
    total: 0,
    // 正常数量 patrol_status == 1
    normal: 0,
    // 异常数量 patrol_status == 2
    error: 0,
  },
  box: {
    // 总巡检数量 label == 'total'
    total: 0,
    // 正常数量   label == 'right'
    normal: 0,
    // 异常数量 label == 'error'
    error: 0,
    // 未巡检 label == "notInspected"
    notInspected: 0,
  },
  valvePit: {
    // 总巡检数量 label == 'total'
    total: 0,
    // 正常数量   label == 'right'
    normal: 0,
    // 异常数量 label == 'error'
    error: 0,
    // 未巡检 label == "notInspected"
    notInspected: 0,
  },
  option: {},
};

onMounted(() => {
  search();
  getValues();
  getRepairHealth();
  getSafeDay();
});

function search() {
  const d = [];
  area.forEach(item => {
    d.push({
      ...JSON.parse(JSON.stringify(itemData)),
      ...item,
    });
  });
  const a = getPipeline({
    beginDate: dayjs(date.value).format('YYYY-MM-DD'),
    endDate: dayjs(date.value).add(1, 'day').format('YYYY-MM-DD'),
  });
  const a1 = getPressureRegulatingBox({
    patrolDate: dayjs(date.value).format('YYYY-MM-01'),
    level: 1,
    mark: 2,
  });
  const a2 = getValvePit({
    patrolDate: dayjs(date.value).format('YYYY-MM-01'),
    level: 1,
    mark: 2,
  });
  Promise.all([a, a1, a2]).then(res => {
    res[0].data.data.forEach(item => {
      const index = indexFind[item.work_area];
      d[index].pipeline.distance += item.distance;
      d[index].pipeline.total += item.numb;
      if (item.patrol_status === 1) {
        d[index].pipeline.normal += item.numb;
      }
      if (item.patrol_status === 2) {
        d[index].pipeline.error += item.numb;
      }
    });

    res[1].data.data.forEach(item => {
      const index = indexFind[item.workArea];
      switch (item.label) {
        case 'total':
          d[index].box.total += item.num;
          break;
        case 'right':
          d[index].box.normal += item.num;
          break;
        case 'error':
          d[index].box.error += item.num;
          break;
        case 'notInspected':
          d[index].box.notInspected += item.num;
          break;
        default:
          break;
      }
    });

    res[2].data.data.forEach(item => {
      const index = indexFind[item.workArea];
      switch (item.label) {
        case 'total':
          d[index].valvePit.total += item.num;
          break;
        case 'right':
          d[index].valvePit.normal += item.num;
          break;
        case 'error':
          d[index].valvePit.error += item.num;
          break;
        case 'notInspected':
          d[index].valvePit.notInspected += item.num;
          break;
        default:
          break;
      }
    });
    d.forEach(item => {
      setOption(item);
    });
    showData.value = d;

    console.log(showData.value);
  });
}

function setOption(item) {
  const a = {
    name: '调压箱(柜)',
    type: 'pie',
    radius: ['60%', '80%'],
    avoidLabelOverlap: false,
    label: {
      show: false,
      position: 'center',
      formatter: '{b}: {d}%',
    },
    tooltip: {
      formatter: '{a}<br />{b}: {c}',
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    labelLine: {
      show: false,
    },
    data: [
      // { value: item.box.total, name: '总巡检数量' },
      {
        value: item.box.normal,
        name: '正常数量',
        itemStyle: { color: 'rgb(93, 255, 39)' },
      },
      {
        value: item.box.error,
        name: '异常数量',
        itemStyle: { color: 'rgb(255, 58, 58)' },
      },
      {
        value: item.box.notInspected,
        name: '未巡检',
        itemStyle: { color: '#888' },
      },
    ],
  };
  const b = {
    name: '阀井',
    type: 'pie',
    radius: ['20%', '40%'],
    avoidLabelOverlap: false,
    label: {
      show: false,
      position: 'center',
      formatter: '{b}: {d}%',
    },
    tooltip: {
      formatter: '{a}<br />{b}: {c}',
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    labelLine: {
      show: false,
    },
    data: [
      // { value: item.valvePit.total, name: '总巡检数量' },
      {
        value: item.valvePit.normal,
        name: '正常数量',
        itemStyle: { color: 'rgb(93, 255, 39)' },
      },
      {
        value: item.valvePit.error,
        name: '异常数量',
        itemStyle: { color: 'rgb(255, 58, 58)' },
      },
      {
        value: item.valvePit.notInspected,
        name: '未巡检',
        itemStyle: { color: '#888' },
      },
    ],
  };
  item.option = JSON.parse(JSON.stringify(option));
  item.option.series = [a, b];
}

// 隐患统计

const pitFallDate = ref(dayjs().startOf('month').valueOf(), dayjs().endOf('month').valueOf());
function typeChange(type) {
  console.log(type);
  switch (type) {
    case 0:
      // 当日
      pitFallDate.value = [dayjs().valueOf(), dayjs().valueOf()];
      break;
    case 1:
      // 本周
      pitFallDate.value = [dayjs().startOf('week').valueOf(), dayjs().endOf('week').valueOf()];
      break;
    case 2:
      // 本月
      pitFallDate.value = [dayjs().startOf('month').valueOf(), dayjs().endOf('month').valueOf()];
      break;
    case 3:
      // 本年
      pitFallDate.value = [dayjs().startOf('year').valueOf(), dayjs().endOf('year').valueOf()];
      break;
    // 4的自定义不用操作
    default:
      break;
  }
  getValues();
}

const data = ref({
  a: {
    all: 0,
    complete: 0,
    pending: 0,
    processing: 0,
  },
  b: {
    all: 0,
    complete: 0,
    pending: 0,
    processing: 0,
  },
});

function getValues() {
  hazardInformation({
    startDate: dayjs(pitFallDate.value[0]).format('YYYY-MM-DD'),
    endDate: dayjs(pitFallDate.value[1]).format('YYYY-MM-DD'),
  }).then(res => {
    data.value = {
      a: {
        all: 0,
        complete: 0,
        pending: 0,
        processing: 0,
      },
      b: {
        all: 0,
        complete: 0,
        pending: 0,
        processing: 0,
      },
    };
    res.data.forEach(item => {
      let d = {};
      if (item.FAULTGRADE === '一般隐患') {
        d = data.value.a;
      } else {
        d = data.value.b;
      }
      switch (item.STATE) {
        case 'all':
          d.all = item.NUM;
          break;
        case '处理完成':
          d.complete = item.NUM;
          break;
        case '待处理':
          d.pending = item.NUM;
          break;
        case '处理中':
          d.processing = item.NUM;
          break;
        // case '作废':
        //   break
        default:
          break;
      }
    });
  });
}

const rhData = ref({});

// 维保检统计
function getRepairHealth() {
  maintenanceStatistics().then(res => {
    rhData.value = res.data.data;
    console.log(res.data.data);
  });
}

const map = {
  total: '总数',
  wh: '已维护设备数',
  by: '已保养设备数',
};

async function getSafeDay() {
  const res = await getSafetyDays();
  const safeDay = res.data.rows[0].configValue;
  num.value = dayjs().diff(safeDay, 'day');
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  background-color: #afcdfe;
  padding: 16px;
  overflow-y: scroll;
  display: grid;
  row-gap: 16px;

  .days {
    width: 100%;
    color: #3b487f;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
    height: 30px;

    span {
      color: #fff;
      font-size: 25px;
      line-height: 30px;
      background: linear-gradient(to top, #99befc, #31bcff);
      padding: 5px;
      border-radius: 4px;
    }
  }

  .inspect-statistic {
    color: #fff;
    padding: 14px;
    background-color: rgb(50, 137, 236);
    border-radius: 8px;

    .title {
      font-weight: 600;
    }

    .date {
      height: 30px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      padding: 0 10px;
      padding-right: 0;

      .left {
        padding-right: 10px;
      }

      .right {
        padding: 0 10px;
        background-color: #0004;
        border-radius: 4px;

        > span {
          padding-right: 10px;
        }
      }
    }

    .list-wrapper {
      display: grid;
      row-gap: 12px;
    }
  }

  .pitfall-statistic {
    color: #fff;
    padding: 14px;
    background-color: rgb(50, 137, 236);
    border-radius: 8px;

    .title {
      font-weight: 600;
    }

    .date {
      height: 30px;
      .van-radio-group {
        display: grid;
        grid-template-columns: repeat(4, 1fr);

        :deep(.van-radio) {
          padding: 6px;
          border: 1px solid #464f6789;
          border-left: none;

          &:first-child {
            border-left: 1px solid #464f6789;
            border-radius: 4px 0 0 4px;
          }

          &:last-child {
            border-radius: 0 4px 4px 0;
          }

          &[aria-checked='true'] {
            background: #63e2b7;
            box-shadow: 0 0 2px #464f6744;
            color: #000;
            border-color: #63e2b744;
          }

          .van-radio__icon {
            font-size: 14px !important;
          }
        }
      }
    }

    .pitfall-content {
      display: grid;
      grid-template-rows: 1fr 1fr;
      row-gap: 12px;

      .normal,
      .important {
        background-color: #324189;
        padding: 12px;
        border-radius: 8px;
        display: grid;
        row-gap: 12px;

        .name {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        .item {
          display: grid;
          grid-template-columns: repeat(4, 1fr);

          > div {
            display: grid;
            place-items: center;
            font-size: 12px;
            color: #858b9b;

            .top {
              font-size: 14px;
              font-weight: 600;
            }
          }
        }
      }
    }
  }

  .repair-health-statistic {
    color: #fff;
    padding: 14px;
    background-color: rgb(50, 137, 236);
    border-radius: 8px;

    .title {
      font-weight: 600;
    }

    .repair-health-content {
      display: grid;
      row-gap: 12px;

      > div {
        background-color: #324189;
        padding: 12px;
        border-radius: 8px;
        display: grid;
        row-gap: 12px;

        .name {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        > div {
          display: grid;
          grid-template-columns: repeat(3, 1fr);

          .item {
            display: grid;
            place-items: center;
            font-size: 12px;
            color: #858b9b;

            .top {
              font-size: 14px;
              font-weight: 600;

              &.total {
                color: #1e73f3;
              }

              &.wh {
                color: #32ef1d;
              }

              &.by {
                color: #e3b933;
              }
            }
          }
        }
      }
    }
  }
}
</style>
