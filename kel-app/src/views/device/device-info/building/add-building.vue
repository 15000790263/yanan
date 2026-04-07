<template>
  <div class="wrapper">
    <van-dropdown-menu :close-on-click-outside="false" ref="dropMenuRef">
      <van-dropdown-item
        :title="dropTitle"
        @open="handleOpen"
        @closed="
          searchValue = '';
          showSearch = false;
        "
      >
        <template v-for="(item, index) in option">
          <div
            v-if="counter > index"
            class="drop-item"
            :key="item.pid"
            :class="{ active: value === item.pid }"
            @click="handleItemClick(item)"
          >
            <span>{{ item.community }}</span>
          </div>
        </template>
      </van-dropdown-item>
    </van-dropdown-menu>
    <div class="search-wrapper" v-if="showSearch">
      <van-search v-model.trim="searchValue" placeholder="请输入" />
    </div>

    <div class="content">
      <template v-for="item in buildList" :key="item.sid">
        <van-field
          label-width="80%"
          placeholder=""
          type="checkbox"
          input-align="right"
          label-class="building-name"
          :label="item.community + item.name"
        >
          <template #input>
            <van-checkbox
              v-model="item.checked"
              shape="square"
              :class="{ 'half-checked': item.boxcode && !item.checked }"
              @click="handleClick(item)"
            />
          </template>
        </van-field>
      </template>
    </div>
  </div>
</template>

<script setup>
import { uniqBy } from 'lodash';
import { updateBuilding, updateBuildingMore } from '@/api/device.js';
import { showConfirmDialog } from 'vant';
import { getAllBuilding, getBuildingUser, updateBuildingUser } from '../../../../api/device';
import { createLoading } from '../../../../utils/loading-fn';
import { getPressureBoxInfo } from '../../../../api/system';

const route = useRoute();

const equipmentsyscode = route.query.equipmentsyscode;
const equipmentcode = route.query.equipmentcode;

const allBuilding = ref([]);

const showSearch = ref(false);

const searchValue = ref('');

const dropMenuRef = ref();

async function getData() {
  const d = createLoading('加载中...');
  const res = await getAllBuilding().finally(d);
  allBuilding.value = res.data.data;
}

onMounted(async () => {
  await getData();
  value.value = allBuilding.value[0].pid;
});

// 区域dataid
const value = ref();

const option = computed(() => {
  return uniqBy(allBuilding.value, 'community')
    .filter(item => item.community !== ' ') // 有个小区是空的，过滤掉
    .filter(item => item.community.includes(searchValue.value));
});

// 某个小区的楼栋列表
const buildList = computed(() => {
  return allBuilding.value
    .filter(item => item.pid === value.value)
    .map(item => {
      return {
        checked: equipmentsyscode === item.boxcode,
        ...item,
      };
    });
});

// 辅助函数
async function updateUser({ equipmentcode, buildingid, dataid, compressorboxcode }) {
  await updateBuildingUser({
    equipmentcode,
    buildingid,
    dataid,
    compressorboxcode,
  });
}

// 关联楼栋信息
async function handleClick(item) {
  const sid = item.sid;
  const boxcode = item.boxcode;
  let buildingid = item.buildingid;
  let userList = [];

  const newBuildingid = `${equipmentcode.replace('-', '_')}_${
    item.name.includes('号楼') ? item.name.replace('号楼', '') : 'S'
  }`;

  if (buildingid) {
    const res = await getBuildingUser({ buildingid });
    userList = res.data;
  }

  // 关联（没有boxcode，也就是buildingid为空或者是sid）
  if (!boxcode) {
    if (userList.length) {
      for (const item of userList) {
        await updateUser({
          ...item,
          equipmentcode,
          compressorboxcode: equipmentsyscode,
          buildingid: newBuildingid,
        });
      }
    }

    await updateBuilding({
      boxcode: equipmentsyscode,
      buildingid: newBuildingid,
      sid,
    });

    getData();
  }
  // 取消关联楼栋信息
  else if (boxcode === equipmentsyscode) {
    // 调用户修改接口，修改equipmentcode = ''，buildingid = ''，传dataid
    // 上面写的注释不对，关联是箱子和楼栋，楼栋和优化的关系不能处理
    await updateBuilding({
      boxcode: '',
      buildingid: sid,
      sid,
    });

    if (userList.length) {
      for (const item of userList) {
        await updateUser({
          ...item,
          equipmentcode: '',
          compressorboxcode: '',
          buildingid: sid,
        });
      }
    }

    getData();
  } else {
    // 原来有值
    // 获取设备code
    let code = boxcode;

    const res = await getPressureBoxInfo({ guid: boxcode });

    if (res.data.rows.length) {
      code = res.data.rows[0].compressorboxcode;
    }

    showConfirmDialog({
      title: '提示',
      message: `当前楼栋已关联其他设备（${code}），是否替换为当前设备？`,
    })
      .then(async () => {
        if (userList.length) {
          for (const item of userList) {
            await updateUser({
              ...item,
              equipmentcode,
              compressorboxcode: equipmentsyscode,
              buildingid: newBuildingid,
            });
          }
        }

        await updateBuilding({
          boxcode: equipmentsyscode,
          buildingid: newBuildingid,
          sid,
        });
        getData();
      })
      .catch(() => {});
  }
}

function handleItemClick(item) {
  value.value = item.pid;
  dropMenuRef.value.close();
}

const dropTitle = computed(() => {
  return option.value.find(item => item.pid === value.value)?.community || '请选择小区';
});

const counter = ref(1);

function deferFn() {
  function update() {
    if (counter.value > option.value.length) {
      return;
    }
    counter.value += 1;
    requestAnimationFrame(update);
  }

  counter.value = 1;
  update();
}

function handleOpen() {
  deferFn();
  showSearch.value = true;
  nextTick(() => {
    function _scroll() {
      const el = document.querySelector('div.active');
      if (el) {
        el.scrollIntoView();
        return;
      }

      requestAnimationFrame(_scroll);
    }

    _scroll();
  });
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;

  .content {
    width: 100%;
    height: calc(100% - 48px);
    padding: 16px;
    overflow-y: scroll;

    display: grid;
    row-gap: 4px;
    grid-auto-rows: 44px;
  }

  .half-checked {
    border: 1px solid #00bfff;
    position: relative;

    &:after {
      content: '';
      display: inline-block;
      position: absolute;
      width: 40%;
      height: 40%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #00bfff55;
    }
  }

  :deep(.van-dropdown-item) {
    top: 148px !important;
  }

  .search-wrapper {
    position: fixed;
    top: 94px;
    left: 0;
    height: 54px;
    width: 100%;
    background-color: #fff;
    z-index: 9999;
  }

  ::v-deep .building-name > label {
    display: inline-block;
    width: 100%;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .drop-item {
    padding: 0 16px;
    line-height: 40px;
    display: grid;
    align-items: center;

    font-size: 14px;
    color: #323233;

    > span {
      display: inline-block;
      width: 100%;
      border-top: 1px solid #eee;
    }

    &.active {
      color: #1989fa;
    }
  }
}
</style>
