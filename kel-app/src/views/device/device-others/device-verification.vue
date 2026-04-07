<template>
  <div class="wrapper">
    <van-overlay :show="treeShow">
      <div class="wrapper" @click.stop>
        <div class="treeHead">
          设备类型选择
          <van-icon name="cross" @click="treeShow = false" />
        </div>
        <van-tree-select
          v-model:active-id="activeId"
          v-model:main-active-index="activeIndex"
          :items="items"
          @click-item="choseDevice"
        />
      </div>
    </van-overlay>
    <van-popup v-model:show="pickerShow" title="事件列表" round position="bottom">
      <van-picker :columns="columns" @confirm="onConfirm" @cancel="onCancel" @change="onChange" />
    </van-popup>

    <div class="device-title">
      <div class="device-title-li">
        <div class="all-button">安全阀列表</div>
        <van-button
          class="add-button"
          round
          color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
          size="small"
          @click="handleChose"
        >
          选择类型
        </van-button>
      </div>
      <div class="device-title-li">
        <div class="all-button">选择型号</div>
        <van-button
          class="add-button"
          round
          color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
          size="small"
          @click="handlePicker"
        >
          型号
        </van-button>
      </div>
    </div>

    <div class="menu-wrapper">
      <div class="menu-item">
        <div class="menu-item-content">名称：<span>安全阀111</span></div>
        <div class="menu-item-content">设备编号：<span>JF-FMA-3434</span></div>
        <div class="menu-item-content">驱动类型：<span>电力</span></div>
        <div class="menu-item-content">阀井结构类型：<span>角阀</span></div>
        <div class="menu-item-content">阀门功能：<span>截断阀</span></div>
        <van-button
          class="add-button"
          round
          color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
          size="small"
          @click="handleDetail"
        >
          提交
        </van-button>
        <van-button
          class="add-button"
          round
          color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
          size="small"
          @click="handleDetail"
        >
          查看审核
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeId = ref();
const activeIndex = ref(0);
const treeShow = ref(false);
const pickerShow = ref(false);
const items = [
  {
    text: '阀门',
    children: [
      { text: '安全阀', id: 1 },
      { text: '闸板阀', id: 2 },
      { text: '电动阀', id: 3 },
    ],
  },
  {
    text: '计量设备',
    children: [{ text: '流量计', id: 4 }],
  },
];

function choseDevice(item) {
  treeShow.value = false;
}

function handleChose() {
  treeShow.value = true;
}

function handlePicker() {
  pickerShow.value = true;
}

const columns = [
  { text: '杭州', value: 'Hangzhou' },
  { text: '宁波', value: 'Ningbo' },
  { text: '温州', value: 'Wenzhou' },
  { text: '绍兴', value: 'Shaoxing' },
  { text: '湖州', value: 'Huzhou' },
];
const onConfirm = ({ selectedValues }) => {
  console.log(`当前值: ${selectedValues.join(',')}`);
  pickerShow.value = false;
};
const onChange = ({ selectedValues }) => {
  console.log(`当前值: ${selectedValues.join(',')}`);
};
const onCancel = () => {
  pickerShow.value = false;
};

function handleDetail() {
  router.push('/device/device-health-review');
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  background-color: #eee;
  overflow: scroll;
  .treeHead {
    width: 100%;
    height: 50px;
    background: #fff;
    text-align: center;
    line-height: 50px;
    font-size: 16px;
    color: rgba(50, 50, 51);
    position: relative;
    .van-icon-cross {
      color: #ccc;
      position: absolute;
      right: 20px;
      top: 16px;
      font-size: 18px;
    }
  }

  .van-tree-select {
    height: 100% !important;
    .van-sidebar-item--select:before {
      background-color: rgba(238, 10, 36, 1);
    }
    .van-tree-select__item--active {
      color: rgba(238, 10, 36, 1);
    }
  }

  .device-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 8px 0 8px;
    font-size: 14px;
    &-li {
      line-height: 32px;
    }
    .all-button {
      color: #55596c;
      padding: 0 8px;
      float: left;
    }
    .add-button {
      width: 68px;
      height: 32px;
      float: left;
    }
  }

  .menu-wrapper {
    display: grid;
    gap: 12px;
    padding: 12px;
    .menu-item {
      width: 100%;
      // height: 100px;
      background-color: #fff;
      border-radius: 8px;
      padding: 10px 0 0 12px;
      &-content {
        width: 50%;
        font-size: 12px;
        margin: 0 0 8px 0;
        float: left;
      }
      &-content:nth-child(1) {
        width: 100%;
      }
      .add-button {
        float: right;
        margin: 5px 10px 10px 0;
        width: 80px;
      }
    }
  }
}
</style>
