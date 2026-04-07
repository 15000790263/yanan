<template>
  <div class="mine-view">
    <div class="mine-view-user">
      <div class="mine-view-user-dept">
        <div class="mine-view-user-dept-icon">
          <img src="../../../assets/image/emergency/page/click-user.png" alt="" />
        </div>
        <div class="">{{ user.dept }}</div>
      </div>
      <div class="">{{ user.name }}</div>
    </div>
    <div class="mine-view-list">
      <div class="mine-view-list-content">
        <div class="list-item" v-for="(value, key) in showList" :key="key">
          <div class="list-item-year">{{ key }}年</div>
          <div class="list-item-content" v-for="(item, i) in value" :key="i">
            <div class="list-item-content-time">
              <div class="list-item-content-time-day">{{ dayjs(item.time).format('DD') }}</div>
              <div class="list-item-content-time-month">{{ dayjs(item.time).format('MM') }}月</div>
            </div>
            <div class="list-item-content-img">
              <img :src="item.imgs[0]" alt="" @click="showImgs(item.imgs)" />
            </div>
            <div class="list-item-content-contain">
              <div class="list-item-content-contain-desc">{{ item.desc }}</div>
              <div class="list-item-content-contain-tips">
                <div class="list-item-content-contain-tips-total">
                  共{{ item.imgs.length || 0 }}张
                </div>
                <div class="list-item-content-contain-tips-delete">
                  <van-icon name="delete" size="16" color="#FF5959" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import dayjs from 'dayjs';
import { showImagePreview } from 'vant';

const user = ref({});

const showList = ref({});

onMounted(() => {
  searchDatas();
  user.value = {
    name: '张三',
    dept: '管道分公司运行管理部',
  };
});

function searchDatas() {
  const data = [
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-10-01 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-09-28 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-09-20 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-09-10 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-09-01 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-08-14 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2023-07-17 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2022-12-17 12:00:00',
    },
    {
      imgs: ['', '', '', '', '', ''],
      desc: '现场救援人员已到位，正在进行抢险作业，无人员伤亡。',
      time: '2022-12-10 12:00:00',
    },
  ];
  processDatas(data);
}

function processDatas(data) {
  const process = {};
  data.forEach(item => {
    const year = dayjs(item.time).format('YYYY');
    if (process[year]) {
      process[year].push(item);
    } else {
      process[year] = [item];
    }
  });
  showList.value = process;
}

function showImgs(data) {
  showImagePreview(data);
}
</script>

<style scoped lang="less">
.mine-view {
  height: 100%;
  &-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    background-color: #fff;
    color: #1e1e1e;
    font-size: 14px;
    &-dept {
      display: flex;
      align-items: center;
      gap: 11px;
      &-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background-color: #ecf3f3;
      }
    }
  }
  &-list {
    height: calc(100% - 58px - 16px * 2);
    padding: 16px;
    &-content {
      width: calc(100% - 16px * 2) !important;
      height: calc(100% - 16px * 2);
      overflow: auto;
      padding: 16px;
      border-radius: 4px;
      background-color: #fff;
      box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
      .list-item {
        &-year {
          padding: 16px 0;
          font-size: 20px;
          font-weight: bold;
          color: #1e1e1e;
        }
        &-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 24px;
          gap: 12px;
          &-time {
            flex: 40px 0 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #1e1e1e;
            &-day {
              font-size: 20px;
              font-weight: bold;
            }
            &-month {
              font-size: 12px;
            }
          }
          &-img {
            flex: 85px 0 0;
            width: 85px;
            height: 58px;
            background: #d8d8d8;
            img {
              width: 100%;
              height: 100%;
            }
          }
          &-contain {
            &-desc {
              color: #1e1e1e;
              font-size: 12px;
            }
            &-tips {
              display: flex;
              align-items: center;
              justify-content: space-between;
              &-total {
                font-size: 12px;
                color: #949b97;
              }
              &-delete {
              }
            }
          }
        }
      }
    }
  }
}
</style>
