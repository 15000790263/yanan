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
                <van-list
                  v-model:loading="loading"
                  finished-text="没有更多了"
                  :finished="finished"
                  :immediate-check="false"
                  @load="onLoad"
                >
                  <ul class="pipeline-list">
                    <template v-for="(item, index) in specialList" :key="index">
                      <!-- 汇管 -->
                      <li v-if="value.id === 7010" @click="handleItemClick(item, 7010)">
                        <van-row gutter="20">
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.productno" span="24">
                            <div class="title">出厂产品编号：</div>
                            <div class="cont">{{ item.productno }}</div>
                          </van-col>
                          <van-col v-if="item.manufacturer" span="24">
                            <div class="title">生产厂家：</div>
                            <div class="cont">{{ item.manufacturer }}</div>
                          </van-col>
                          <van-col v-if="item.number" span="24">
                            <div class="title">数量：</div>
                            <div class="cont">{{ item.number }}</div>
                          </van-col>
                          <van-col v-if="item.status" span="24">
                            <div class="title">设备状态：</div>
                            <div class="cont">
                              {{ sysStore.getDictValue('equipment_state_static', item.status) }}
                            </div>
                          </van-col>
                        </van-row>
                      </li>
                      <!-- 过滤器 -->
                      <li v-if="value.id === 6016" @click="handleItemClick(item, 6016)">
                        <van-row gutter="20">
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">过滤器名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.productno" span="24">
                            <div class="title">出厂产品编号：</div>
                            <div class="cont">{{ item.productno }}</div>
                          </van-col>
                          <van-col v-if="item.manufacturer" span="24">
                            <div class="title">生产厂家：</div>
                            <div class="cont">{{ item.manufacturer }}</div>
                          </van-col>
                          <van-col v-if="item.number" span="24">
                            <div class="title">数量：</div>
                            <div class="cont">{{ item.number }}</div>
                          </van-col>
                          <van-col v-if="item.status" span="24">
                            <div class="title">设备状态：</div>
                            <div class="cont">
                              {{ sysStore.getDictValue('equipment_state_static', item.status) }}
                            </div>
                          </van-col>
                        </van-row>
                      </li>
                      <!-- 工业管道（站内） -->
                      <li v-if="value.id === 7012" @click="handleItemClick(item, 7012)">
                        <van-row gutter="20">
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.pipename" span="24">
                            <div class="title">管道名称：</div>
                            <div class="cont">{{ item.pipename }}</div>
                          </van-col>
                          <van-col v-if="item.completiondate" span="24">
                            <div class="title">安装竣工日期：</div>
                            <div class="cont">{{ item.completiondate }}</div>
                          </van-col>
                          <van-col v-if="item.usedate" span="24">
                            <div class="title">投用日期：</div>
                            <div class="cont">{{ item.usedate }}</div>
                          </van-col>
                          <van-col v-if="item.status" span="24">
                            <div class="title">设备状态：</div>
                            <div class="cont">
                              {{ sysStore.getDictValue('equipment_state_static', item.status) }}
                            </div>
                          </van-col>
                          <van-col v-if="item.manageuser" span="24">
                            <div class="title">负责人：</div>
                            <div class="cont">
                              {{ item.manageuser }}
                            </div>
                          </van-col>
                          <van-col v-if="item.phone" span="24">
                            <div class="title">电话：</div>
                            <div class="cont">
                              {{ item.phone }}
                            </div>
                          </van-col>
                        </van-row>
                      </li>
                      <!-- 安全附件下的设备 -->
                      <li
                        v-if="
                          [5011, 5017, 5019, 5015, 5016, 7004, 4702, 5018, 5030].includes(value.id)
                        "
                        @click="handleItemClick(item, value.id)"
                      >
                        <van-row gutter="20">
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.specmodel" span="24">
                            <div class="title">型号：</div>
                            <div class="cont">{{ item.specmodel }}</div>
                          </van-col>
                          <van-col v-if="item.specification" span="24">
                            <div class="title">规格：</div>
                            <div class="cont">{{ item.specification }}</div>
                          </van-col>
                          <van-col v-if="item.status" span="24">
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
import { getSpecialList } from '../../../api/device';
import { systemStore } from '@/stores/system.js';
import debounce from 'lodash.debounce';

defineOptions({
  name: 'DeviceSpecialListPage'
})

const sysStore = systemStore();

const tabList = ref([
  {
    text: '压力容器(管道)',
    id: 7010,
    children: [
      { text: '汇管', value: 7010 },
      { text: '过滤器', value: 6016 },
      { text: '工业管道（站内）', value: 7012 },
    ],
  },
  {
    text: '安全附件',
    id: 5011,
    children: [
      { text: '安全阀', value: 5011 },
      { text: '压力表', value: 5017 },
      { text: '固定式可燃气体报警器', value: 5019 },
      { text: '温度变送器', value: 5015 },
      { text: '压力变送器', value: 5016 },
      { text: '差压变送器', value: 7004 },
      { text: '双金属温度计', value: 4702 },
      { text: '雷电防护装置', value: 5018 },
      { text: '静电释放器（无需检验）', value: 5030 },
    ],
  },
]);

const searchValue = ref('');

let pageSize = 20;
let pageNum = 1;
let url = '';
let equipmenttypeid = '';

const loading = ref(false);
const finished = ref(false);

const specialList = ref([]);

function getData() {
  getSpecialList({ equipmenttypeid, pageSize, pageNum, url }).then(res => {
    console.log(res.data.rows);
    if (pageNum * pageSize >= res.data.total) {
      // 加载完了
      finished.value = true;
    }
    specialList.value.push(...res.data.rows);
    loading.value = false;
  });
}

const map = {
  7010: '/baseequipmentfilter/baseequipmentfilterlist',
  6016: '/baseequipmentfilter/baseequipmentfilterlist',
  7012: '/baseequipmentfilter/baseequipmentfilterlist',

  5011: '/baseequipmentvalve/baseequipmentvalvelist',
  5017: '/baseequipmentvalve/baseequipmentvalvelist',
  5019: '/baseequipmentvalve/baseequipmentvalvelist',
  5015: '/baseequipmentvalve/baseequipmentvalvelist',
  5016: '/baseequipmentvalve/baseequipmentvalvelist',
  7004: '/baseequipmentvalve/baseequipmentvalvelist',
  4702: '/baseequipmentvalve/baseequipmentvalvelist',
  5018: '/baseequipmentvalve/baseequipmentvalvelist',
  5030: '/baseequipmentvalve/baseequipmentvalvelist',
};
const tabChange = debounce(name => {
  console.log(11111111);
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
  specialList.value = [];
  finished.value = false;
}

// onActivated(() => {
//   initParams();
//   getData();
// });

function onLoad() {
  if (specialList.value.length) {
    pageNum++;
    getData();
  }
}

function handleSearch() {
  const { value } = searchValue;
  if (value) {
    getSpecialList({ equipmenttypeid, pageSize: 10, pageNum: 1, url, equipment: value }).then(
      res => {
        initParams();
        finished.value = true;
        specialList.value.push(...res.data.rows);
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
  router.push(
    `/device/special-detail?dataId=${dataid}&typeValue=${typeValue}&equipmentcode=${equipmentcode}&equipment=${equipment}&equipmentsyscode=${equipmentsyscode}&espId=${espId}`
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
