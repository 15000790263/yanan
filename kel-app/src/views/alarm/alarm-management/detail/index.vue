<template>
  <div class="wrapper">
    <div class="list">
      <template v-for="item in formOption" :key="item.key">
        <div class="item" :class="{ active: data['alarm'] === item.title, [item.key]: true }">
          <div class="left">{{ item.title }}</div>
          <div class="right">
            {{ data[item.key] }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const data = JSON.parse(route.query.data);

const formOption = [
  {
    title: '设备名称',
    key: 'dev_name',
  },
  {
    title: '设备编号',
    key: 'devsn',
  },
  {
    title: '检测状态',
    key: 'alarm',
  },
  {
    title: '通道号',
    key: 'channelno',
  },

  {
    title: '通道名称',
    key: 'channelname',
  },
  {
    title: '检测数据',
    key: 'channeldata',
  },
  {
    title: '检测单位',
    key: 'channelunit',
  },
  {
    title: '检测时间',
    key: 'recdate',
  },
  {
    title: '实时电压',
    key: 'voltage',
  },
  {
    title: '低报',
    key: 'minData',
  },
  {
    title: '高报',
    key: 'midData',
  },
  {
    title: '低低报',
    key: 'min_min_data',
  },
  {
    title: '高高报',
    key: 'maxData',
  },

  {
    title: '信号值',
    key: 'str_info',
  },
  {
    title: '采集间隔',
    key: 'collinterval',
  },
  {
    title: '报警电压',
    key: 'alarmvoltage',
  },
  {
    title: '数据时间',
    key: 'addtime',
  },
];
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: #f6f8f8;
  color: #34394f;
  font-size: 14px;

  .list {
    display: grid;
    row-gap: 4px;
    padding: 16px 0;
    height: 100%;
    overflow-y: scroll;

    .item {
      height: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 16px;
      background-color: #fff;

      &.alarm {
        .right {
          background-color: #07c160;
          padding: 0 4px;
          color: #fff;
        }
      }

      &.channeldata {
        .right {
          color: #45aff8;
          font-weight: 700;
          font-size: 16px;
        }
      }

      &.active {
        box-shadow: inset 0 0 14px #45aff8;
      }
    }
  }
}
</style>
