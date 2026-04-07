<template>
  <div class="wrapper">
    <div class="date-choice">
      <div class="animate-wrapper">
        <span class="date-time" @click="choiceDate">{{ dateValue }}</span>
      </div>
    </div>

    <div v-if="statisticInfo.length" class="scroll-container">
      <div class="completion-rate">
        <div class="title-wrapper">
          <div class="left"></div>
          <div class="title">同期对比（nm³）</div>
          <div class="right"></div>
        </div>

        <div class="chart">
          <div class="top-area">
            <div class="top-left">今年</div>
            <div class="top-right">去年</div>
          </div>
          <template v-for="item in statisticInfo">
            <div class="bottom-area">
              <div class="left">{{ item.name }}</div>
              <div class="right">
                <div class="r-l">{{ item.today }}</div>
                <div class="r-r">{{ item.lastyear }}</div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <template v-else>
      <van-empty description="当前日期无数据" />
    </template>

    <DateSelector v-model="showDatePup" :columnsType="columnsType" @choice="handleChoice" />
  </div>
</template>

<script setup>
import DateSelector from '../components/date-selector';
import dayjs from 'dayjs';
import { getStatisticInfo } from '../../../api/production';
import { createLoading } from '../../../utils/loading-fn';

const dateType = ref(1);

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

async function getData() {
  const destroyLoading = createLoading();
  let res;
  try {
    res = await getStatisticInfo(dateValue.value);
    destroyLoading();
  } catch (error) {
    statisticInfo.value = [];
    destroyLoading();
    return;
  }

  const arr = new Array(res.data.data.today.length).fill(1);
  statisticInfo.value = arr.map((item, index) => {
    return {
      name: res.data.data.name[index],
      today: res.data.data.today[index],
      lastyear: res.data.data.lastyear[index],
    };
  });
}

getData();

const statisticInfo = ref([]);
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;

  .date-choice {
    padding: 0 24px;
    height: 45px;
    display: grid;
    align-items: center;

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
    height: calc(100% - 45px);
    padding: 10px 24px;
    overflow-y: scroll;

    .completion-rate {
      // height: 380px;
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
        // height: 300px;
        border-radius: 8px;
        padding: 12px;
        // background:
        // url('/src/assets/image/check/icon-line2x.png') no-repeat 50% 72.5% / 90%,
        // url('/src/assets/image/check/icon-line.png') no-repeat 8% / 8px 70%;
        background-color: #e6fffb;
        color: #34394f;

        .top-area {
          // background-color: #bfa;
          margin-left: 110px;
          width: calc(100% - 110px);
          height: 50px;

          display: flex;
          justify-content: space-around;
          align-items: center;
        }

        .bottom-area {
          display: flex;
          height: fit-content;
          border-bottom: 1px solid #d4f3ed;

          &:last-of-type {
            border-bottom: none;
          }

          .left {
            width: 110px;
            min-height: 50px;
            font-size: 13px;
            display: grid;
            place-items: center;
            justify-items: flex-start;
          }

          .right {
            flex: 1;
            display: flex;
            justify-content: space-around;
            align-items: center;
            text-align: center;

            > div {
              flex: 1;
              // max-width: 40vw;
              word-break: break-all;
              padding: 0 6px;
            }
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
}
</style>
