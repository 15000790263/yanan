<template>
  <div class="wrapper">
    <div>
      <van-swipe>
        <template v-for="item in eventList[0]" :key="item.id">
          <van-swipe-item>
            <div style="padding: 0 4px">
              <div class="tips" @click="goDetail(item.id, item.times)">
                <div class="left">
                  <div class="title">
                    <van-text-ellipsis :content="item.name" />
                  </div>
                  <div class="time">{{ item.receiveTime }}接警</div>
                  <div class="contacts">{{ item.submitBy }}</div>
                  <div class="phone-number">{{ item.submitPhone }}</div>
                  <div class="position">
                    {{ item.description }}
                  </div>
                </div>
                <div class="right">
                  <div :class="`type ext${item.type}`">{{ getType(item.type) }}</div>
                  <div class="statistics">
                    <div class="count">{{ item.level ? intToRoman(item.level) : '无' }}</div>
                    <div class="name">等级</div>
                  </div>
                </div>
              </div>
            </div>
          </van-swipe-item>
        </template>
      </van-swipe>
    </div>

    <div class="content">
      <template v-for="(item, index) in eventList[1]" :key="index">
        <div class="item">
          <div class="year" v-if="!isThisYear(Object.keys(item)[0])">
            {{ Object.keys(item)[0] }}年
          </div>
          <template v-for="value in item[Object.keys(item)[0]]" :key="value.id">
            <div class="item-wrapper" @click="goDetail(value.id, value.times)">
              <div class="date">
                <div class="day">{{ value.day }}</div>
                <div class="month">{{ value.month }}月</div>
              </div>
              <div v-intersect="() => loadImage(value)" class="img">
                <img :src="getImgSrc(value)" alt="" />
              </div>
              <div class="detail">
                <div class="info">
                  <van-text-ellipsis rows="2" :content="value.name" />
                </div>
                <div class="all-count">共{{ value.times }}条记录</div>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getEventInfoList, getEventList, getMessage } from '../../../api/emergency';
import { ref, onActivated } from 'vue';
import { intToRoman } from '../../../utils/tools';
import dayjs from 'dayjs';
import { createLoading } from '../../../utils/loading-fn';

const router = useRouter();

function goDetail(id, times) {
  router.push({
    path: '/emergency/fact-detail',
    query: {
      id,
      times, // 消息条数
    },
  });
}

// 首次加载组件时不要执行onActivated的函数
let flag = false;

const eventList = ref([]);

function init() {
  getEventList().then(async ({ data }) => {
    const destroy = createLoading();
    flag = true;

    // 应急抢险
    eventList.value[0] = await Promise.all(
      data.rows
        .filter(item => {
          return item.eventStatus === '2';
        })
        .map(async item => {
          const { data } = await getEventInfoList({
            eventId: item.id,
            pageSize: 1,
          });

          return {
            ...item,
            times: data.total,
          };
        })
    );

    // 结束
    eventList.value[1] = await Promise.all(
      data.rows
        .filter(item => {
          return item.eventStatus === '3';
        })
        .map(async item => {
          const { receiveTime } = item;
          const [year, month, day] = receiveTime.split(' ')[0].split('-');

          // 可以优化，后台返回个数
          const { data } = await getEventInfoList({
            eventId: item.id,
            pageSize: 1,
          });

          return {
            ...item,
            year,
            month,
            day,
            times: data.total,
          };
        })
    );

    eventList.value[1].sort((v1, v2) => v2.year - v1.year);
    eventList.value[1] = groupByKey(eventList.value[1], 'year');

    // 误报
    eventList.value[2] = data.rows.filter(item => {
      return item.eventStatus === '4';
    });

    destroy();
  });
}

// 获取时间类型
function getType(type) {
  const typeMap = {
    1: '停气',
    2: '泄漏',
    3: '火灾',
    4: '爆炸',
  };
  return typeMap[type];
}

// 判断是不是今年
function isThisYear(dateString) {
  const inputDate = dayjs(dateString);
  const currentYear = dayjs().year();
  return inputDate.year() === currentYear;
}

// 根据某个字段对数组元素进行分类
function groupByKey(arr, key) {
  const a = [];
  let keyValue = '';
  let index = -1;
  arr.forEach(item => {
    if (item[key] !== keyValue) {
      keyValue = item[key];
      index++;
      a[index] = {};
      a[index][keyValue] = [];
    }
    a[index][keyValue].push(item);
  });
  return a;
}

init();

onActivated(async () => {
  if (flag) {
    eventList.value[0] = await Promise.all(
      eventList.value[0].map(async item => {
        const { data } = await getEventInfoList({
          eventId: item.id,
          pageSize: 1,
        });

        return {
          ...item,
          times: data.total,
        };
      })
    );
  }
});

// 异步加载封面图
async function loadImage(value) {
  const res = await getMessage({ eventId: value.id });
  if (res.data.rows.length) {
    const arr = res.data.rows.filter(item => !item.image.startsWith('data:video'));
    if (arr.length) {
      arr.sort((a, b) => (dayjs(a.eventTime).isBefore(b.eventTime) ? 1 : -1));
      value.image = arr[0].image;
    }
  }
}

function getImgSrc(value) {
  return (
    value.image ?? new URL('../../../assets/image/emergency/icon-default.png', import.meta.url).href
  );
}
</script>

<style scoped lang="less">
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;

  .tips {
    width: 100%;
    height: 185px;
    border-radius: 16px;
    background: linear-gradient(180deg, #ff4a44 0%, #ff9553 100%);
    padding: 16px;
    margin-bottom: 16px;

    display: grid;
    gap: 18px;
    grid-template-columns: auto 72px;

    .left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .title {
        height: 23px;
        font-family: Source Han Sans;
        font-size: 16px;
        font-weight: bold;
        font-variation-settings: 'opsz' auto;
        color: #fff;
        margin-bottom: 8px;
      }

      .time,
      .contacts,
      .phone-number,
      .position {
        height: 17px;
        font-family: 思源黑体;
        font-size: 12px;
        font-variation-settings: 'opsz' auto;
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 4px;
        padding-left: 20px;
        min-height: 17px;
      }
      .time {
        background: url('/src/assets/image/emergency/time-fill.png') no-repeat left/16px;
      }
      .contacts {
        background: url('/src/assets/image/emergency/contacts-fill.png') no-repeat left/16px;
      }
      .phone-number {
        background: url('/src/assets/image/emergency/cellphone-fill.png') no-repeat left/16px;
      }
      .position {
        background: url('/src/assets/image/emergency/map-pin-2-fill.png') no-repeat left top/16px;
        height: auto;
        min-height: 17px;
      }
    }

    .right {
      display: grid;
      gap: 12px;
      grid-auto-rows: repeat(2, auto);

      .type {
        width: 72px;
        height: 92px;
        border-radius: 4px;
        padding: 8px;
        padding-top: calc(100% - 4px);
        text-align: center;

        font-family: 思源黑体;
        font-size: 12px;
        font-variation-settings: 'opsz' auto;
        color: #fff;

        &.ext1 {
          background: url('/src/assets/image/emergency/icon-1-64px-停气.png') no-repeat center 4px/64px
            rgba(0, 0, 0, 0.11);
        }
        &.ext2 {
          background: url('/src/assets/image/emergency/icon-1-64px-泄漏.png') no-repeat center 4px/64px
            rgba(0, 0, 0, 0.11);
        }
        &.ext3 {
          background: url('/src/assets/image/emergency/icon-1-64px-火灾.png') no-repeat center 4px/64px
            rgba(0, 0, 0, 0.11);
        }
        &.ext4 {
          background: url('/src/assets/image/emergency/icon-1-64px-爆炸.png') no-repeat center 4px/64px
            rgba(0, 0, 0, 0.11);
        }
      }

      .statistics {
        width: 72px;
        height: 49px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.11);
        padding: 5px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        font-family: Source Han Sans;
        font-size: 12px;
        font-weight: bold;
        color: #fff;
      }
    }
  }

  .content {
    padding: 0 20px;
    overflow-y: scroll;

    .item {
      display: grid;
      grid-template-rows: repeat(auto-fill, 58px);
      gap: 16px;

      .year {
        font-family: 思源黑体;
        font-size: 20px;
        font-weight: bold;
        color: #1e1e1e;
        padding-top: 35px;
      }

      .item-wrapper {
        height: 58px;
        overflow: hidden;
        display: grid;
        grid-template-columns: 1fr 2fr 4fr;
        gap: 12px;

        .date {
          height: 58px;
          padding: 5px 0;
          padding-right: 4px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          font-family: 思源黑体;
          color: #34394f;

          .day {
            font-size: 20px;
            font-weight: bold;
          }

          .month {
            font-size: 12px;
          }
        }

        .img {
          height: 58px;
          width: 100%;
          img {
            height: 100%;
            width: 100%;
          }
        }

        .detail {
          font-family: 思源黑体;
          font-size: 12px;
          display: flex;
          flex-flow: column;
          justify-content: space-between;

          .info {
            color: #34394f;
          }

          .all-count {
            color: #84abbb;
          }
        }
      }
    }
  }

  .van-swipe {
    // height: 185px;

    // :deep(.van-swipe-item) {
    //   padding: 16px 12px;
    //   padding-right: 0;
    // }

    :deep(.van-swipe__indicators) {
      bottom: 24px;

      .van-swipe__indicator--active {
        background-color: #fff;
      }
    }
  }

  :deep(.van-loading) {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
  }
}
</style>
