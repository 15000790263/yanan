<template>
  <div class="wrapper">
    <div class="tab-container">
      <van-tabs v-model:active="active" type="card" @click-tab="handleClickTab">
        <van-tab title="当日"></van-tab>
        <van-tab title="本周"></van-tab>
        <van-tab title="本月"></van-tab>
        <van-tab title="本年"></van-tab>
        <van-tab :title="tab5title"></van-tab>
      </van-tabs>
    </div>

    <div class="title">
      <div class="left">高危作业票统计</div>
      <div class="right" @click="show = true">{{ currentArea }}</div>
    </div>

    <div class="content-container" id="statistic-container">
      <div class="content">
        <ul v-for="item in contentList" :key="item.name">
          <li class="all">
            <div class="a-name">{{ item.name }}</div>
            <div class="a-count">{{ item.count }}</div>
          </li>
          <template v-if="item.level">
            <li class="detail">
              <template v-for="value in item.level" :key="value.lName">
                <div>
                  <div class="l-count">{{ value.lCount }}</div>
                  <div class="l-name">{{ value.lName }}</div>
                </div>
              </template>
            </li>
          </template>
        </ul>
      </div>
    </div>

    <SelectArea v-model:show="show" v-model:currentArea="currentArea"></SelectArea>
    <!-- v-model:supplierName="currentItem.value"
      v-model:supplierId="supplierId" -->

    <van-popup v-model:show="showBottom" position="bottom" style="height: 30%; overflow: hidden">
      <van-date-picker
        v-model="currentDate"
        title="选择日期"
        @cancel="showBottom = false"
        @confirm="handleConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SelectArea from './components/select-area.vue';
import { getWorkCount } from '../../../api/work';
import { watch } from 'vue';
import dayjs from 'dayjs';
import cloneDepp from 'lodash-es/cloneDeep';

const active = ref(0);
// 展示全部
const SHOW_ALL = '全部';

const baseList = [
  {
    name: '高处安全',
    count: '0',
    level: [
      {
        lCount: '0',
        lName: 'I级',
        key: '1',
      },
      {
        lCount: '0',
        lName: 'II级',
        key: '2',
      },
      {
        lCount: '0',
        lName: 'III级',
        key: '3',
      },
      {
        lCount: '0',
        lName: 'IV级',
        key: '4',
      },
    ],
  },
  {
    name: '动火安全',
    count: '0',
    level: [
      {
        lCount: '0',
        lName: '特级',
        key: '0',
      },
      {
        lCount: '0',
        lName: '一级',
        key: '1',
      },
      {
        lCount: '0',
        lName: '二级',
        key: '2',
      },
    ],
  },
  {
    name: '吊装安全',
    count: '0',
    level: [
      {
        lCount: '0',
        lName: '一级',
        key: '1',
      },
      {
        lCount: '0',
        lName: '二级',
        key: '2',
      },
      {
        lCount: '0',
        lName: '三级',
        key: '3',
      },
    ],
  },
  {
    name: '有限空间安全',
    count: '0',
  },
  {
    name: '盲板抽堵安全',
    count: '0',
  },
  {
    name: '临时用电',
    count: '0',
  },
  {
    name: '动土安全',
    count: '0',
  },
  {
    name: '断路安全',
    count: '0',
  },
];

const contentList = ref();

contentList.value = cloneDepp(baseList);

const show = ref(false);

const currentArea = ref('');

function getData(beginDate, endDate) {
  let params;
  if (!beginDate) {
    params = {
      workArea: currentArea.value === SHOW_ALL ? void 0 : currentArea.value,
      mark: active.value + 1,
    };
  } else {
    params = {
      workArea: currentArea.value === SHOW_ALL ? void 0 : currentArea.value,
      mark: void 0,
      beginDate,
      endDate,
    };
  }
  getWorkCount(params).then(({ data }) => {
    const arr = data.data;

    contentList.value = cloneDepp(baseList);
    if (arr.length) {
      arr.forEach(item => {
        const content = contentList.value.find(value =>
          item.work_operation_type.includes(value.name)
        );

        if (content) {
          /* 诈骗到了 */
          content.count = String(+content.count + item.num);
          if (content.level) {
            const lItem = content.level.find(l => l.key === item.operration_grade);
            if (lItem) {
              lItem.lCount = String(+lItem.lCount + item.num);
            }
          }
        }
      });
    }
  });
}

const tab5title = ref('自定义日期');
const showBottom = ref(false);

watch(currentArea, () => {
  getData();
});

watch(active, value => {
  if (value !== 4) {
    getData();
    tab5title.value = '自定义日期';
    currentDate.value = dayjs().format('YYYY.MM.DD').split('.');
  }
});

function handleClickTab({ name }) {
  if (name === 4) {
    showBottom.value = true;
  }
}

const currentDate = ref(dayjs().format('YYYY.MM.DD').split('.'));

function handleConfirm() {
  tab5title.value = currentDate.value.join('-');
  // 请求
  getData(tab5title.value, tab5title.value);
  showBottom.value = false;
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}

.wrapper {
  height: 100%;

  .tab-container {
    height: 58px;
    display: grid;
    place-items: center;
    background: #fff;
    box-shadow: 0px 0px 4px 0px rgba(38, 55, 73, 0.1);

    :deep(.van-tabs) {
      display: grid;
      flex-direction: column;
      grid-template-rows: 30px auto;

      .van-tabs__wrap {
        height: 30px;

        .van-tabs__nav {
          border: none;
          margin: 0 !important;
          display: grid;
          grid-template-columns: repeat(5, auto);
          column-gap: 8px;

          .van-tab {
            border: none;
            height: 30px;
            border-radius: 4px;
            background: #bbcece;
            font-family: 思源黑体;
            font-size: 14px;
            color: #ffffff;
            .van-tab__text {
              padding: 5px 8px;
            }

            &.van-tab--active {
              background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
              font-weight: normal;
            }
          }
        }
      }

      .van-tabs__content {
        flex: 1;
      }

      .van-tab__panel {
        height: 100%;
      }
    }
  }

  .title {
    height: 58px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;

    font-family: 思源黑体;
    font-size: 14px;
    font-variation-settings: 'opsz' auto;
    font-feature-settings: 'kern' on;
    color: #34394f;

    .right {
      padding-left: 18px;
      background: url('/src/assets/image/work/icon-map-pin-2-fill.png') no-repeat left / contain;
    }
  }

  .content-container {
    height: calc(100% - 58px - 58px);
    overflow-y: scroll;
    padding: 0 24px;

    .content {
      width: 100%;
      margin: 10px 0;
      display: grid;
      grid-template-columns: auto;
      grid-template-rows: repeat(3, 108px) 52px 78px;
      grid-template-areas:
        'a a a a a a'
        'b b b b b b'
        'c c c c c c'
        'd d d e e e'
        'f f g g h h';
      gap: 12px;
      column-gap: 16px;

      > ul {
        width: 100%;
        display: grid;
        align-items: center;
        grid-template-rows: 44px auto;
        padding: 0 12px;

        border-radius: 4px;
        background: linear-gradient(180deg, #d4f3ec 0%, #d3f0ff 100%);

        > li {
          display: grid;
        }

        .all {
          height: 44px;
          border-bottom: 1px solid rgba(68, 116, 121, 0.1);
          display: flex;
          justify-content: flex-start;
          align-items: center;

          .a-name {
            font-family: 思源黑体;
            font-size: 14px;
            color: #34394f;
            padding: 0 8px;
            position: relative;

            &::before {
              content: '';
              position: absolute;
              left: -2px;
              top: 2px;
              width: 4px;
              height: 16px;
              opacity: 1;
              background: linear-gradient(180deg, #ff6a00 0%, #ffc70e 100%);
            }
          }

          .a-count {
            font-family: 思源黑体;
            font-size: 14px;
            color: #00b099;
          }
        }

        .detail {
          grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
        }

        &:nth-last-child(-n + 5) {
          grid-template-rows: unset;
          .all {
            border: none;
          }
        }
        &:nth-last-child(-n + 3) {
          .all {
            flex-flow: column;
            justify-content: space-between;
          }
        }
      }

      @areaList: a, b, c, d, e, f, g, h;
      .w(@key, @i) when (@i > 0) {
        > ul:nth-child(@{i}) {
          grid-area: @key;
        }
      }
      .y(@key, @i) when (@i > 0)and(@i<4) {
        > ul:nth-child(@{i}) {
          // background-color: #f00;
          // grid-template-columns: 90px 60px repeat(4, 1fr);
        }
      }
      .loop(@i) when (@i < length(@areaList)+1) {
        .w(extract(@areaList, @i), @i);
        .y(extract(@areaList, @i), @i);
        .loop(@i+1);
      }
      .loop(1);

      .name {
        font-family: Source Han Sans;
        font-size: 14px;
        font-weight: bold;
        line-height: 17px;
        background: linear-gradient(180deg, #ffffff 0%, #ffffff 42%, #87addb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
      }

      .count {
        background: url('/src/assets/image/emergency-duty-page/label-img.png') no-repeat left/100%
          100%;
        height: 25px;
        display: grid;
        place-items: center;

        > span {
          font-family: Source Han Sans;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          background: linear-gradient(180deg, #ffffff 0%, #ffffff 42%, #87addb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          margin-left: -10px;
        }
      }

      .l-name {
        font-family: 思源黑体;
        font-size: 14px;
        text-align: center;
        color: #34394f;
      }

      .l-count {
        font-family: 思源黑体;
        font-size: 14px;
        text-align: center;
        font-variation-settings: 'opsz' auto;
        font-feature-settings: 'kern' on;
        color: #ff3700;
      }
    }
  }
}
</style>
