<template>
  <div class="wrapper">
    <van-popup
      v-model:show="showLeft"
      position="left"
      :style="{ width: '100%' }"
      :overlay-style="{
        background: 'transparent',
      }"
    >
      <van-tabs
        title-active-color="#00B099"
        title-inactive-color="#84ABBB"
        :line-height="0"
        @change="tabChange"
      >
        <van-tab title="基础设备" style="height: 100%">
          <van-tree-select
            height="100%"
            v-model:active-id="activeId"
            v-model:main-active-index="activeIndex"
            :items="baseTreeData"
            @click-item="handleClickItem"
          >
            <template #nav-text="item">
              <div>{{ item.label }}</div>
            </template>
          </van-tree-select>
        </van-tab>
        <van-tab title="其他设备" style="height: 100%">
          <van-tree-select
            height="100%"
            v-model:active-id="active2Id"
            v-model:main-active-index="active2Index"
            :items="baseTreeDataAll"
            @click-item="handleClickItem"
          >
            <template #nav-text="item">
              <div>{{ item.label }}</div>
            </template>
          </van-tree-select>
        </van-tab>
      </van-tabs>
    </van-popup>

    <div class="device-title">
      <div class="all-button">{{ title }}</div>
      <van-button
        class="add-button"
        round
        color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
        size="small"
        @click="handleChose"
      >
        选择设备
      </van-button>
    </div>

    <div class="menu-wrapper">
      <PullUpRefresh v-if="startObserve" @loadMore="handleLoadMore">
        <template v-for="(item, index) in list" :key="index">
          <div class="menu-item" @click="goDetail(item)">
            <div class="menu-item-content">单号：{{ item.oddnumbers }}</div>
            <div class="menu-item-content">设备编号：{{ item.equipmentnum }}</div>
            <div class="menu-item-content">维修级别：{{ getValue(item.maintainlevel, 53) }}</div>
            <div class="menu-item-content">计划开始时间：{{ item.planstartdate }}</div>
            <div class="menu-item-content">计划结束时间：{{ item.planenddate }}</div>
            <van-button
              class="add-button"
              round
              color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
              size="small"
              @click.stop="checkApprove(item)"
            >
              {{ item.judgestate === '1' ? '提交' : '查看审核' }}
            </van-button>
            <!-- 状态图标 -->
            <div class="menu-item-status">
              <span>{{ getValue(item.judgestate, 54) }}</span>
            </div>
          </div>
        </template>
      </PullUpRefresh>
    </div>
  </div>
</template>

<script setup>
import { getDeviceTree, getDeviceTreeAll, getDeviceRepair } from '../../../api/device';
import PullUpRefresh from 'components/pull-up-refresh';
import { getValue } from '../hooks/useDict';

const router = useRouter();
const activeId = ref();
const activeIndex = ref(0);
const active2Id = ref();
const active2Index = ref(0);

function handleChose() {
  showLeft.value = true;
}

function checkApprove(item) {
  console.log(item);
  // const { deployId, procInsId, taskId } = item.listemf[0];
  // router.push('/device/device-repair-detail');
}

let pageSize = 20;
let pageNum = 1;
let loadAll = false;
let equipmentcode = '';

const showLeft = ref(false);

const baseTreeData = ref([]);
getDeviceTree().then(res => {
  baseTreeData.value = res.data.data[0].children.map(item => {
    item.children.forEach(value => {
      value.text = value.label;
      value.pName = item.label;
    });
    return item;
  });

  beforeGetData();
});

const baseTreeDataAll = ref([]);
getDeviceTreeAll().then(res => {
  baseTreeDataAll.value = res.data.data
    .filter(item => item.id !== '1005')
    .map(item => {
      item.children.forEach(value => {
        value.text = value.label;
        value.pName = item.label;
      });
      return item;
    });
});

function beforeGetData() {
  activeId.value = baseTreeData.value[0].children[0].id;
  title.value = baseTreeData.value[0].label + ' - ' + baseTreeData.value[0].children[0].text;
  equipmentcode = baseTreeData.value[0].children[0].eqcode;
  getData();
}

function tabChange() {}

const title = ref('');

const list = ref([]);
const startObserve = ref(false);

// 参数初始化
function initParams() {
  pageNum = 1;
  pageSize = 20;
  startObserve.value = false;
  list.value = [];
  loadAll = false;
}

function handleClickItem(item) {
  if (['1000', '1001', '1006'].includes(item.pid)) {
    activeId.value = null;
  } else {
    active2Id.value = null;
  }
  if (item.text !== title.value) {
    title.value = item.pName + ' - ' + item.text;
    showLeft.value = false;
    equipmentcode = item.eqcode;
    initParams();
    getData();
  }
}

function getData() {
  getDeviceRepair({ pageNum, pageSize, equipmentcode }).then(res => {
    if (pageNum * pageSize >= res.data.total) {
      // 加载完了
      loadAll = true;
    }
    list.value.push(...res.data.rows);
    startObserve.value = true;
  });
}

function handleLoadMore(cb) {
  if (!loadAll) {
    pageNum++;
    getData();
  } else {
    cb();
  }
}

function goDetail(item) {
  console.log(item);
  router.push(`/device/device-repair-detail?id=${item.emtId}`);
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  background-color: rgba(245, 245, 245, 1);
  padding: 16px;

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
    font-size: 14px;
    height: 40px;
    padding-bottom: 16px;

    .all-button {
      color: #55596c;
      padding: 0 8px;
    }

    .add-button {
      width: 68px;
      height: 32px;
    }
  }

  .menu-wrapper {
    display: grid;
    gap: 12px;
    height: calc(100% - 40px);
    overflow-y: scroll;

    .menu-item {
      width: 100%;
      background-color: #fff;
      border-radius: 8px;
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      position: relative;

      &-content {
        font-size: 12px;
      }

      &-content:nth-child(1) {
        width: 100%;
      }

      :deep(.van-button) {
        width: 80px;
        justify-self: self-end;
      }
    }
  }

  /* oooo */
  @topHeight: 46px;
  // @bottomHeight: 50px;
  @popupHeight: calc(100% - @topHeight);

  .van-popup--left {
    width: 100%;
    height: @popupHeight;
    border-bottom: 1px solid #f1f5f6;
    top: calc(@popupHeight / 2 + @topHeight);
  }

  .van-tabs {
    height: 100%;

    :deep(.van-tabs__content) {
      height: calc(100% - 44px);
      padding: 16px;
    }
  }

  .pull-up-wrapper {
    display: grid;
    gap: 16px;
    grid-auto-flow: row;
    grid-auto-rows: max-content;
  }

  .menu-item-status {
    position: absolute;
    width: 60px;
    height: 60px;
    background: url('../../../assets/image/device/icon-no-text.png') no-repeat center/contain;
    opacity: 0.7;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -75%);

    span {
      display: block;
      font-size: 14px;
      color: #fff;
      transform: rotateZ(-34deg) translate(-5%, 80%);
    }
  }
}
</style>
