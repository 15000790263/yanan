<template>
  <div class="wrapper">
    <Calendar
      v-model:pages="pages"
      ref="calendar"
      expanded
      :attributes="attrs"
      @dayclick="dayclick"
    >
    </Calendar>
    <Transition name="today-btn">
      <div
        v-if="
          pages[0]?.id !== dayjs().format('YYYY-MM') || choiceDay !== dayjs().format('YYYY-MM-DD')
        "
        class="today"
      >
        <van-button type="primary" @click="moveToday" round size="small">
          <span style="font-size: 14px">今</span>
        </van-button>
      </div>
    </Transition>
    <div class="grid-wrapper">
      <div class="title">排班详情({{ choiceDay }})</div>
      <van-list :finished="true" :finished-text="dutyList.length ? '没有更多了' : '暂无数据'">
        <template v-for="item in dutyList" :key="item.department">
          <van-cell-group :title="item.department">
            <van-cell class="header">
              <template #title>
                <div class="titles">
                  <div>值班类型</div>
                  <div>人员</div>
                  <div>电话</div>
                </div>
              </template>
              <template #value> </template>
            </van-cell>
            <template v-for="(value, index) in item.list" :key="index">
              <van-cell>
                <template #title>
                  <div class="titles">
                    <div>{{ getDutytype(value.dutytype) }}</div>
                    <div>{{ value.username }}</div>
                    <div>
                      <van-icon name="phone" />
                      <a :href="`tel:${value.dutyPhone}`">{{ value.dutyPhone }}</a>
                    </div>
                  </div>
                </template>
              </van-cell>
            </template>
          </van-cell-group>
        </template>
      </van-list>
    </div>
  </div>
</template>

<script setup>
import { Calendar } from 'v-calendar';
import dayjs from 'dayjs';
import { getDutyDataList } from '@/api/duty';
import { systemStore } from '../../stores/system';

const sysStore = systemStore();

const calendar = ref(null);

function moveToday() {
  calendar.value.move(new Date());
  dayclick({ id: currentDay });
}

let currentDay = dayjs().format('YYYY-MM-DD');
const choiceDay = ref(currentDay);

function dayclick(day) {
  if (choiceDay.value !== day.id) {
    choiceDay.value = day.id;
    getDataList(day.id);
  }
}

function getDataList(cd = currentDay) {
  getDutyDataList(cd).then(
    res => {
      let dl = res.data.data;
      if (dl.length) {
        dl = dl
          .map(item => {
            const value = sysStore.depts.find(item2 => item2.deptName === item.department);
            return {
              ...item,
              num: value ? value.orderNum : 10000,
            };
          })
          .sort((a, b) => a.num - b.num);
      }
      dutyList.value = dl;
    },
    () => {
      dutyList.value = [];
    }
  );
}

getDataList();

const attrs = ref([
  {
    key: 'today',
    highlight: true,
    dates: new Date(),
  },
]);

const pages = ref([]);

const dutyList = ref([]);

function getDutytype(type) {
  const item = sysStore.dictMap.sys_duty_type.find(item => item.dictValue === type);
  if (item) {
    return item.dictLabel;
  }

  return '';
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  padding: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  :deep(.vc-container) {
    .is-not-in-month > * {
      opacity: 0.5 !important;
      pointer-events: unset !important;
    }
  }

  .today {
    position: absolute;
    bottom: 16px;
    right: 16px;
    z-index: 99;

    .van-button {
      height: 30px;
      width: 30px;
    }
  }

  .today-btn-enter-active,
  .today-btn-leave-active {
    transition: transform 0.4s linear;
  }

  .today-btn-enter-from,
  .today-btn-leave-to {
    transform: translateX(80px);
  }

  .grid-wrapper {
    margin-top: 20px;
    border-radius: 8px;
    border: 1px solid #ddd;
    overflow: hidden;

    :deep(.van-cell__value) {
      display: none;
    }

    .titles {
      display: flex;
      align-items: center;
      text-align: center;

      > div {
        flex: 1;
      }
    }

    :deep(.van-cell) {
      border-top: 1px solid #ddd;

      &.header {
        border-top: none;
        background: linear-gradient(180deg, #d9efea 0%, #d3f0ff 100%);
      }
    }

    .title {
      height: 50px;
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 20px;
      color: #333752;
      background: url('/src/assets/image/duty/2.png') no-repeat center/cover;
    }

    :deep(.van-cell-group__title) {
      height: 50px;
      font-weight: 700;
      font-size: 20px;
      color: #333752;
      padding-left: 50px;
      background: url('/src/assets/image/duty/1.png') no-repeat 5px / 40px;
    }

    :deep(.van-list) {
      max-height: 100%;
      overflow-y: scroll;
    }
  }
}
</style>
