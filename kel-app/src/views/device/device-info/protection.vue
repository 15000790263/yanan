<template>
  <div class="wrapper">
    <div class="tab-list">
      <van-tabs
        v-model:active="active"
        title-active-color="#00B099"
        title-inactive-color="#84ABBB"
        :line-height="0"
        @change="tabChange"
      >
        <div class="search-wrapper">
          <van-search
            v-model="searchValue"
            placeholder="请输入"
            input-align="center"
            right-icon="search"
            left-icon=""
            @click-right-icon="handleSearch"
            @clear="handleSearch"
          >
            <template #action>
              <div class="add-btn" @click="add">
                <van-icon name="plus" size="16px" color="#999" />
              </div>
            </template>
</van-search>
</div>
<template v-for="value in tabList" :key="value.id">
          <van-tab v-if="value.children" title-class="has-dropdown" :name="value.id">
            <template #title>
              <van-dropdown-menu active-color="#00B099">
                <van-dropdown-item
                  v-model="value.id"
                  :title="value.text"
                  :options="value.children"
                />
              </van-dropdown-menu>
            </template>
<div class="content">
  <div class="content-list">
    <van-list v-model:loading="loading" finished-text="没有更多了" :finished="finished" :immediate-check="false"
      @load="onLoad">
      <ul class="pipeline-list">
        <template v-for="(item, index) in materialList" :key="index">
                      <!-- 阴保 -->
                      <li v-if="value.id === 5023" @click="handleItemClick(item, 5023)">
                        <van-row gutter="20">
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">物资名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.specmodel" span="24">
                            <div class="title">规格型号：</div>
                            <div class="cont">{{ item.specmodel }}</div>
                          </van-col>
                          <van-col v-if="item.status" span="24">
                            <div class="title">状态：</div>
                            <div class="cont">
                              {{ sysStore.getDictValue('equipment_state_static', item.status) }}
                            </div>
                          </van-col>
                          <van-col v-if="item.manufacturer" span="24">
                            <div class="title">存放地点：</div>
                            <div class="cont">{{ item.manufacturer }}</div>
                          </van-col>
                          <van-col v-if="item.manageuser" span="24">
                            <div class="title">负责人：</div>
                            <div class="cont">{{ item.manageuser }}</div>
                          </van-col>
                          <van-col v-if="item.phone" span="24">
                            <div class="title">电话：</div>
                            <div class="cont">{{ item.phone }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <!-- 备品备件 -->
                      <li v-if="value.id === 7011" @click="handleItemClick(item, 7011)">
                        <van-row gutter="20">
                          <van-col span="24" v-if="item.equipmentcode">
                            <div class="title">物资名称：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.specification">
                            <div class="title">规格型号：</div>
                            <div class="cont">{{ item.specification }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.partsnum">
                            <div class="title">数量：</div>
                            <div class="cont">{{ item.partsnum }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.position">
                            <div class="title">存放地点：</div>
                            <div class="cont">{{ item.position }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.manageuser">
                            <div class="title">负责人：</div>
                            <div class="cont">{{ item.manageuser }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.phone">
                            <div class="title">电话：</div>
                            <div class="cont">{{ item.phone }}</div>
                          </van-col>
                        </van-row>
                      </li>
                    </template>
      </ul>
    </van-list>
  </div>
</div>
</van-tab>
<van-tab v-else :title="value.text" :name="value.id" style="height: 100%">
  <div class="content">
    <div class="content-list">
      <van-list v-model:loading="loading" finished-text="没有更多了" :finished="finished" :immediate-check="false"
        @load="onLoad">
        <ul class="pipeline-list">
          <template v-for="(item, index) in materialList" :key="index">
                      <li v-if="value.id === 5026" @click="handleItemClick(item, 5026)">
                        <van-row gutter="20">
                          <van-col span="24">
                            <div class="title">设备名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">设备编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">规格型号：</div>
                            <div class="cont">{{ item.specification }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">安装位置：</div>
                            <div class="cont">{{ item.installationposition }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">生产厂家：</div>
                            <div class="cont">{{ item.manufacturer }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <li v-if="value.id === 5025" @click="handleItemClick(item, 5025)">
                        <van-row gutter="20">
                          <van-col span="24" v-if="item.equipment">
                            <div class="title">设备名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.equipmentcode">
                            <div class="title">设备编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.specmodel">
                            <div class="title">规格型号：</div>
                            <div class="cont">{{ item.specmodel }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.manufacturer">
                            <div class="title">生产厂家：</div>
                            <div class="cont">{{ item.manufacturer }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">设备状态：</div>
                            <div class="cont">
                              {{ sysStore.getDictValue('equipment_state_static', item.status) }}
                            </div>
                          </van-col>
                        </van-row>
                      </li>
                    </template>
        </ul>
      </van-list>
    </div>
  </div>
</van-tab>
</template>
</van-tabs>
</div>
</div>
</template>

<script setup>
import { getProtectionsList } from '../../../api/device';
import { systemStore } from '@/stores/system.js';
import debounce from 'lodash.debounce';

const sysStore = systemStore();

const tabList = ref([
  { text: '恒电位仪', id: 5026 },
  { text: '测试桩', id: 5025 },
]);

const searchValue = ref('');

let pageSize = 20;
let pageNum = 1;
let url = '';
let equipmenttypeid = '';

const loading = ref(false);
const finished = ref(false);

const materialList = ref([]);

function getData() {
  getProtectionsList({ equipmenttypeid, pageSize, pageNum, url }).then(res => {
    if (pageNum * pageSize >= res.data.total) {
      // 加载完了
      finished.value = true;
    }
    materialList.value.push(...res.data.rows);
    loading.value = false;
  });
}

const map = {
  5026: '/baseElectricDisplacement/baseElectricDisplacementList',
  5025: '/equipmentProtectionPileControl/equipmentprotectionpilelist',
};
const tabChange = debounce(name => {
  if (equipmenttypeid === name) {
    return;
  }
  searchValue.value = '';
  equipmenttypeid = name;
  initParams();
  url = map[name];
  getData();
});

// 参数初始化
function initParams() {
  pageNum = 1;
  pageSize = 20;
  materialList.value = [];
  finished.value = false;
}

function onLoad() {
  if (materialList.value.length) {
    pageNum++;
    getData();
  }
}

function handleSearch() {
  const { value } = searchValue;
  if (value) {
    getProtectionsList({ equipmenttypeid, pageSize: 10, pageNum: 1, url, equipmentcode: value }).then(
      res => {
        initParams();
        finished.value = true;
        materialList.value.push(...res.data.rows);
      }
    );
  } else {
    initParams();
    getData();
  }
}

const router = useRouter();

function handleItemClick(item, typeValue) {
  const { dataid, equipmentcode, equipment, equipmentsyscode, espId } = item;
  console.log(item)
  router.push(
    `/device/protection-detail?dataId=${dataid}&typeValue=${typeValue}&equipmentcode=${equipmentcode}&equipment=${equipment}&equipmentsyscode=${equipmentsyscode}&espId=${espId}`
  );
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;

  .tab-list {
    height: 100%;
    width: 100%;
    position: relative;
  }

  /* 初始化tab和search 开始 */
  .van-tabs {
    height: 100%;

    :deep(.van-tab__panel) {
      height: 100%;
    }

    :deep(.van-tabs__content) {
      height: calc(100% - 44px);
      padding: 16px;
      padding-top: 70px;
    }

    :deep(.van-tab--active.has-dropdown) {
      .van-dropdown-menu__title {
        color: #00b099;
      }
    }

    :deep(.van-tabs__nav--line) {
      box-sizing: content-box !important;
    }
  }

  :deep(.has-dropdown) {
    .van-dropdown-menu__bar {
      background: unset;
      box-shadow: none;
    }

    .van-dropdown-menu__title {
      color: rgb(132, 171, 187);
    }
  }

  .search-wrapper {
    position: absolute;
    width: 100%;
    left: 0;
    top: 44px;
    border-top: 1px solid #ddd;

    :deep(.van-search__action) {
      padding: 0;
      width: 34px;
      height: 34px;
    }

    .add-btn {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      border: 1px solid #f7f8fa;
    }

    :deep(.van-search--show-action) {
      padding-right: 12px;
    }
  }
  /* 初始化tab和search 结束 */

  .content {
    height: 100%;
    padding: 16px;
    color: #fff;
    font-size: 12px;
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    border-radius: 16px;
    box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);

    .content-list {
      height: 100%;
      overflow-y: scroll;
    }

    .pipeline-list {
      display: grid;
      gap: 16px;
      grid-auto-flow: row;
      grid-auto-rows: max-content;

      li {
        padding: 12px;
        background: #c0e9e7;
        border-radius: 4px;
        box-shadow: inset 0px 4px 30px 0px rgba(255, 255, 255, 0.3);

        font-family: 思源黑体;
        font-size: 12px;
        line-height: 16px;
        color: #17617e;
      }
    }
  }

  :deep(.van-list__finished-text) {
    color: #fffc;
  }
}

.van-col.van-col--24 {
  display: flex;
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  .title {
    width: 100px;
  }

  .cont {
    flex: 1;
  }
}
</style>
