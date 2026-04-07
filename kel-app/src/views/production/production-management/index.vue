<template>
  <div class="wrapper">
    <div class="date-choice">
      <div class="animate-wrapper">
        <span class="date-time" @click="choiceDate" v-if="dateValue">
          {{ dateValue }}
        </span>
      </div>
    </div>
    <div
      class="content"
      :class="{ 'show-footer': dayjs(dateValue).isSame(dayjs(lastDay).add(1, 'day'), 'day') }"
    >
      <div class="content-list">
        <template v-for="(item, index) in dataList" :key="index">
          <div class="item-wrapper">
            <van-field
              v-model.trim="formData[item.key]"
              :label="item.label"
              label-width="130px"
              type="number"
              placeholder="0"
              colon
              :disabled="flag !== 1 || !item.canEdit"
            >
              <template v-if="!item.isCounter" #button>
                <div>nm³</div>
              </template>
            </van-field>
          </div>
        </template>
      </div>
    </div>
    <div class="footer" v-if="dayjs(dateValue).isSame(dayjs(lastDay).add(1, 'day'), 'day')">
      <van-button v-if="flag === 0" type="primary" @click="flag = 1">新增</van-button>
      <van-button v-if="flag === 1" type="success" @click="onConfirm">确定</van-button>
      <van-button v-if="flag === 1" type="danger" @click="onCancel">取消</van-button>
      <van-button v-if="flag === 2" type="primary" @click="change">修改</van-button>
    </div>

    <DateSelector
      v-model="showDatePup"
      :columnsType="['year', 'month', 'day']"
      :lastDay="lastDay"
      @choice="handleChoice"
    />
  </div>
</template>

<script setup>
import { getDataList, add, update } from '../../../api/production';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showConfirmDialog, showToast } from 'vant';
import DateSelector from '../components/date-selector';

const today = dayjs().format('YYYY-MM-DD');

/*
进来默认是新增，flag = 0，如果已经有值，flag = 2
点击新增后，flag = 1，点击确定flag = 2，点击取消flag = 0
点击修改后 flag = 1，点击确定flag = 2，点击取消flag = 2
*/
const flag = ref(0); // 0：新增 1：确定、取消 2：修改

const initForm = {
  skOne: void 0,
  skTwo: void 0,
  zyOne: void 0,
  zyTwo: void 0,
  cgyOne: void 0,
  cgyTwo: void 0,
  tzLlJsSh: void 0,
  tzLlJsGl: void 0,
  gjgsLlJs: void 0,
  jqz: void 0,
  shllj: void 0,
  glllj: void 0,
  sntoht: void 0,
  httosn: void 0,
};

// 最新填报日期
const lastDay = ref('');

async function getData(params) {
  const res = await getDataList(params);
  formData.value = { ...initForm };

  const row = res.data.rows[0];
  if (!row) return;

  if (!lastDay.value) {
    if (row.dayDate === today) {
      lastDay.value = dayjs(today).add(-1, 'day').format('YYYY-MM-DD');
      dateValue.value = today;
    } else {
      lastDay.value = row.dayDate;
      dateValue.value = dayjs(lastDay.value).add(1, 'day').format('YYYY-MM-DD');
    }
  }

  if (row.dayDate === today) {
    formData.value = row;
    flag.value = 2; // 修改
  } else if (params.dayDate) {
    formData.value = row;
    flag.value = 0; // 新增
  }
}

onMounted(() => {
  getData({ pageSize: 1 });
});

const router = useRouter();

const formData = ref({ ...initForm });

const dataList = [
  {
    key: 'skOne',
    label: '上库1路',
    canEdit: true,
  },
  {
    key: 'skTwo',
    label: '上库2路',
    canEdit: true,
  },
  {
    key: 'zyOne',
    label: '中压1路',
    canEdit: true,
  },
  {
    key: 'zyTwo',
    label: '中压2路',
    canEdit: true,
  },
  {
    key: 'cgyOne',
    label: '次高压1路',
    canEdit: true,
  },
  {
    key: 'cgyTwo',
    label: '次高压2路',
    canEdit: true,
  },
  {
    key: 'shllj',
    label: '流量计数（生活）',
    isCounter: true,
    canEdit: true,
  },
  {
    key: 'tzLlJsSh',
    label: '生活',
    canEdit: true,
  },
  {
    key: 'glllj',
    label: '流量计数（锅炉）',
    isCounter: true,
    canEdit: true,
  },
  {
    key: 'tzLlJsGl',
    label: '锅炉',
    canEdit: true,
  },
  {
    key: 'gjgsLlJs',
    label: '公交公司流量计数',
    isCounter: true,
    canEdit: true,
  },
  {
    key: 'jqz',
    label: '加气站',
    canEdit: true,
  },
  {
    key: 'sntoht',
    label: '深能输洪通输气量',
    canEdit: true,
  },
  {
    key: 'httosn',
    label: '洪通输深能输气量',
    canEdit: true,
  },
  /*
  不可编辑
  */
  {
    key: 'tzDayTotal',
    label: '塔指基地结算气量',
  },
  {
    key: 'sqTzReduce',
    label: '输气站日结算气量减塔指结算气量',
  },
  {
    key: 'gjgsJs',
    label: '公交公司日结算气量',
  },
  {
    key: 'sqTzGjReduce',
    label: '输气站日量减塔指计算减公交结算',
  },
  {
    key: 'snbzDayTotal',
    label: '深能巴州燃气当日总量（包含上库)',
  },
  {
    key: 'lastyearDayTzGjReduce',
    label: '去年同期日用量减塔指减公交',
  },
  {
    key: 'snbzYearTotal',
    label: '深能巴州燃气当年累计量(包含上库)',
  },
  {
    key: 'snbzMonthTotal',
    label: '深能煲粥燃气当月累计量(包含上库)',
  },
  {
    key: 'monthDiff',
    label: '月累差',
  },
  {
    key: 'lastyearDayTotal',
    label: '去年同期日用量(包含上库)',
  },
  {
    key: 'lastyearMonthTotal',
    label: '去年同期月累(包含上库)',
  },
  {
    key: 'yearDiff',
    label: '年累差',
  },
  {
    key: 'lastyearYearTotal',
    label: '去年同期年累(包含上库)',
  },
  {
    key: 'skDayTotal',
    label: '上库日用量',
  },
  {
    key: 'skMonthTotal',
    label: '上库月累',
  },
  {
    key: 'lastyearDaySk',
    label: '去年同期上库日用量',
  },
  {
    key: 'aveMonth',
    label: '当月日平均量',
  },
];

async function onConfirm() {
  if (!formData.value.id) {
    // 新增
    const res = await add({ ...formData.value, dayDate: dateValue.value });
    if (dateValue.value === today) {
      formData.value = res.data.data;
      flag.value = 2;
    } else {
      formData.value = { ...initForm };
      flag.value = 0;
      lastDay.value = '';
      getData({ pageSize: 1 });
    }
  } else {
    // 更新
    const res = await update({
      id: formData.value.id,
      skOne: +formData.value.skOne,
      skTwo: +formData.value.skTwo,
      zyOne: +formData.value.zyOne,
      zyTwo: +formData.value.zyTwo,
      cgyOne: +formData.value.cgyOne,
      cgyTwo: +formData.value.cgyTwo,
      tzLlJsSh: +formData.value.tzLlJsSh,
      tzLlJsGl: +formData.value.tzLlJsGl,
      gjgsLlJs: +formData.value.gjgsLlJs,
      jqz: +formData.value.jqz,
      shllj: +formData.value.shllj,
      glllj: +formData.value.glllj,
      sntoht: +formData.value.sntoht,
      httosn: +formData.value.httosn,
    });
    formData.value = res.data.data;
    flag.value = 2;
  }
  showToast('操作成功');
}

function onCancel() {
  showConfirmDialog({
    title: '提示',
    message: '数据未保存，确认取消吗？',
  })
    .then(() => {
      flag.value = formData.value.id ? 2 : 0;
      if (currentO) {
        formData.value = currentO;
        currentO = void 0;
      }
    })
    .catch(() => {});
}

let currentO;

function change() {
  flag.value = 1;
  currentO = { ...formData.value };
}

const showDatePup = ref(false);

function choiceDate() {
  showDatePup.value = true;
}

const dateValue = ref('');

function handleChoice(dayDate) {
  dateValue.value = dayDate;
  getData({ dayDate });
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: rgba(245, 245, 245, 1);

  .date-choice {
    height: 45px;
    display: grid;

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

  .content {
    width: 100%;
    height: calc(100% - 45px);
    border-radius: 16px;
    background-color: #fff;
    padding: 16px;

    .content-list {
      width: 100%;
      height: 100%;
      overflow-y: scroll;

      .item-wrapper {
        display: flex;
        align-items: center;
        min-height: 50px;
        font-size: 14px;
        color: #34394f;

        :deep(.van-field__body) {
          border: 1px solid #ddd;
          padding: 0 4px;
          border-radius: 4px;
        }
      }
    }

    &.show-footer {
      height: calc(100% - 70px - 45px);
    }
  }

  .footer {
    height: 58px;
    margin-top: 12px;
    // background: #ffffff;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .van-button {
      flex: 1;

      margin-left: 12px;

      &:first-of-type {
        margin-left: 0;
      }
    }
  }
}
</style>
