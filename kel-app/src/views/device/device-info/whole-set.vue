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
            :show-action="showActionCondition"
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
          <van-tab :title="value.text" :name="value.id" style="height: 100%">
            <div class="content">
              <div class="content-list">
                <PullUpRefresh v-if="startObserve" @loadMore="handleLoadMore">
                  <ul class="pipeline-list">
                    <template v-for="(item, index) in wholeSetList" :key="index">
                      <li
                        v-if="value.id === 5005"
                        @click="handleItemClick(item, 5005)"
                        v-long-press="() => handlePress(item.equipment)"
                      >
                        <van-row gutter="20">
                          <van-col v-if="item.equipmentcode" span="24">
                            <div class="title">场站编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">场站名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.widths" span="24">
                            <div class="title">场站尺寸：</div>
                            <div class="cont">{{ item.widths }}</div>
                          </van-col>
                          <van-col v-if="item.floorspace" span="24">
                            <div class="title">征地面积：</div>
                            <div class="cont">{{ item.floorspace }}</div>
                          </van-col>
                          <van-col v-if="item.address" span="24">
                            <div class="title">所在位置：</div>
                            <div class="cont">{{ item.address }}</div>
                          </van-col>
                          <van-col v-if="item.manageuser" span="24">
                            <div class="title">负责人：</div>
                            <div class="cont">{{ item.manageuser }}</div>
                          </van-col>
                          <van-col v-if="item.phone" span="24">
                            <div class="title">电话:</div>
                            <div class="cont">{{ item.phone }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <li v-if="value.id === 6011" @click="handleItemClick(item, 6011)">
                        <van-row gutter="20">
                          <van-col v-if="item.equipmentcode" span="24">
                            <div class="title">阴保站编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col v-if="item.equipment" span="24">
                            <div class="title">阴保站名称：</div>
                            <div class="cont">{{ item.equipment }}</div>
                          </van-col>
                          <van-col v-if="item.lineCode" span="24">
                            <div class="title">管线编码：</div>
                            <div class="cont">{{ item.lineCode }}</div>
                          </van-col>
                          <van-col v-if="listDvices.length" span="24">
                            <div class="title">恒电位仪：</div>
                            <div class="cont">
                              {{
                                listDvices.length &&
                                listDvices.find(i => i.value === item.potentiostat)?.label
                              }}
                            </div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">运行状态：</div>
                            <div class="cont">{{ getValue(item.status, 0) }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <li v-if="value.id === 5001" @click="handleItemClick(item, 5001)">
                        <van-row gutter="20">
                          <van-col span="24" v-if="item.equipmentcode">
                            <div class="title">调压箱(柜)编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.compressorboxtype">
                            <div class="title">调压箱(柜)类型：</div>
                            <div class="cont">
                              {{ getValue(item.compressorboxtype, 1) }}
                            </div>
                          </van-col>
                          <van-col span="24" v-if="item.configurationType">
                            <div class="title">配置类型：</div>
                            <div class="cont">
                              {{ getValue(item.configurationType, 2) }}
                            </div>
                          </van-col>
                          <van-col span="24" v-if="item.inletdiameter">
                            <div class="title">进口管径：</div>
                            <div class="cont">{{ item.inletdiameter }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.outletdiameter">
                            <div class="title">出口管径：</div>
                            <div class="cont">{{ item.outletdiameter }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.compressorboxlocation"
                            ><div class="title">安装位置：</div>

                            <div class="cont">{{ item.compressorboxlocation }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.compressorboxroad">
                            <div class="title">所在路段：</div>
                            <div class="cont">{{ item.compressorboxroad }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.manufacturer">
                            <div class="title">生产厂家：</div>
                            <div class="cont">{{ item.manufacturer }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <li v-if="value.id === 5010" @click="handleItemClick(item, 5010)">
                        <van-row gutter="20">
                          <van-col v-if="item.localtion" span="24">
                            <div class="title">阀井位置：</div>
                            <div class="cont">{{ item.localtion }}</div>
                          </van-col>
                          <van-col v-if="item.equipmentcode" span="24">
                            <div class="title">阀井编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col v-if="item.valvewelltype" span="24">
                            <div class="title">阀井类型：</div>
                            <div class="cont">
                              {{
                                item.valvewelltype.length !== 1
                                  ? item.valvewelltype
                                  : getValue(item.valvewelltype, 3)
                              }}
                            </div>
                          </van-col>
                          <!-- <van-col span="24"><div class="title"></div>所属部门：<div class="cont"></div>{{ item.floorspace }}</van-col> -->
                          <van-col v-if="item.pipeline" span="24">
                            <div class="title">所属管线：</div>
                            <div class="cont">{{ item.pipeline }}</div>
                          </van-col>
                          <!-- <van-col span="24"
                            ><div class="title">所属管线：</div>
                            <div class="cont">{{ item.pipeline }}</div>
                          </van-col> -->
                          <van-col v-if="item.roadname" span="24">
                            <div class="title">所在路段：</div>
                            <div class="cont">{{ item.roadname }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <li v-if="value.id === 6014" @click="handleItemClick(item, 6014)">
                        <van-row gutter="20">
                          <van-col span="24">
                            <div class="title">设备编号：</div>
                            <div class="cont">{{ item.equipmentcode }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">控制器类型：</div>
                            <div class="cont">{{ getValue(item.controllertype, 4) }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">型号：</div>
                            <div class="cont">{{ getValue(item.pumpmode, 5) }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">管线类型：</div>
                            <div class="cont">{{ getValue(item.pipelinetype, 6) }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">安装位置：</div>
                            <div class="cont">{{ item.address }}</div>
                          </van-col>
                        </van-row>
                      </li>
                      <li v-if="value.id === 6015" @click="handleItemClick(item, 6015)">
                        <van-row gutter="20">
                          <van-col span="24" v-if="item.deviceCode">
                            <div class="title">设备编号：</div>
                            <div class="cont">{{ item.deviceCode }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.deviceName">
                            <div class="title">设备名称：</div>
                            <div class="cont">{{ item.deviceName }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.easycvrChannelName">
                            <div class="title">通道名称：</div>
                            <div class="cont">{{ item.easycvrChannelName }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.easycvrHostName">
                            <div class="title">主机名称：</div>
                            <div class="cont">{{ item.easycvrHostName }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.stationName">
                            <div class="title">站场名称：</div>
                            <div class="cont">{{ item.stationName }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.stationChargeName">
                            <div class="title">管理人：</div>
                            <div class="cont">{{ item.stationChargeName }}</div>
                          </van-col>
                          <van-col span="24" v-if="item.stationChargePhone">
                            <div class="title">联系电话：</div>
                            <div class="cont">{{ item.stationChargePhone }}</div>
                          </van-col>
                        </van-row>
                      </li>
                    </template>
                  </ul>
                </PullUpRefresh>
              </div>
            </div>
          </van-tab>
        </template>
      </van-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {
  getWholeSetList,
  getDictType,
  listDeviceBasicSearch,
  getJGYTList,
} from '../../../api/device';
import PullUpRefresh from 'components/pull-up-refresh';
import { canEditDevice } from '@/utils/user-permission';
import { createLoading } from '../../../utils/loading-fn';

const tabList = ref([
  { text: '调压站', id: 5005 },
  // { text: '阴保站', id: 6011 },
  { text: '调压箱(柜)', id: 5001 },
  { text: '阀门井', id: 5010 },
  { text: '加臭设备', id: 6014 },
  { text: '激光云台', id: 6015 },
]);

const active = ref();

const wholeSetList = ref([]);

let pageSize = 20;
let pageNum = 1;
let url = '';
let equipmenttypeid = tabList.value[0].id;
let loadAll = false;

function getData() {
  const destroy = createLoading();
  getWholeSetList({ equipmenttypeid, pageSize, pageNum, url })
    .then(async res => {
      if (pageNum * pageSize >= res.data.total) {
        // 加载完了
        loadAll = true;
      }

      if (equipmenttypeid == '6015') {
        const res2 = await getJGYTList();

        const rows = res2.data.rows;

        res.data.rows.forEach(item => {
          const v = rows.find(value => value.id === item.stationId);
          item.dataid = item.id;
          if (v) {
            item.stationChargeName = v.stationChargeName;
            item.stationChargePhone = v.stationChargePhone;
            item.stationName = v.stationName;
          }
        });
      }

      wholeSetList.value.push(...res.data.rows);
      startObserve.value = true;
    })
    .finally(() => {
      destroy();
    });
}

const dictTypeList = reactive([
  {
    key: 'equipment_state',
    value: [],
  },
  {
    key: 'compressor_box_type',
    value: [],
  },
  {
    key: 'configuration_type',
    value: [],
  },
  {
    key: 'valvewell_type',
    value: [],
  },
  {
    key: 'controller_type_oet',
    value: [],
  },
  {
    key: 'pump_mode',
    value: [],
  },
  {
    key: 'pipe_line_level',
    value: [],
  },
]);

function getDict() {
  getDictType('equipment_state').then(res => {
    dictTypeList[0].value = res.data.rows;
  });
  getDictType('compressor_box_type').then(res => {
    dictTypeList[1].value = res.data.rows;
    console.log(res.data.rows);
  });
  getDictType('configuration_type').then(res => {
    dictTypeList[2].value = res.data.rows;
  });
  getDictType('valvewell_type').then(res => {
    dictTypeList[3].value = res.data.rows;
  });
  getDictType('controller_type_oet').then(res => {
    dictTypeList[4].value = res.data.rows;
  });
  getDictType('pump_mode').then(res => {
    dictTypeList[5].value = res.data.rows;
  });
  getDictType('pipe_line_level').then(res => {
    dictTypeList[6].value = res.data.rows;
  });
}

getDict();

function getValue(value, index) {
  return dictTypeList[index].value.find(item => item.dictValue === value)?.dictLabel;
}

// 参数初始化
function initParams() {
  pageNum = 1;
  pageSize = 20;
  startObserve.value = false;
  wholeSetList.value = [];
  loadAll = false;
}

const map = {
  5005: '/equipmentverify/basestationlist',
  6011: '/basecathodicstationcontroller/basecathodicstationlist',
  5001: '/basemeasuringinstrument/baseequipmentregulatorlist',
  5010: '/basevalvewell/basevalvewelllist',
  6014: '/baseEquipmentDeodorizing/baseEquipmentDeodorizingList',
  6015: '/safe/jgyt/device/list',
};

function tabChange(name) {
  searchValue.value = '';
  equipmenttypeid = name;
  initParams();
  url = map[name];
  getData();
}

const startObserve = ref(false);

function handleLoadMore(cb) {
  if (!loadAll) {
    pageNum++;
    getData();
  } else {
    cb();
  }
}

const listDvices = ref([]);

listDeviceBasicSearch({}, 'EG').then(res => {
  listDvices.value = [];
  res.data.data.forEach(item => {
    listDvices.value.push({
      value: item.equipmentcode,
      label: `${item.installationposition}-${item.equipment}`,
    });
  });
});

const router = useRouter();

function handleItemClick(item, typeValue) {
  const { dataid, equipmentcode, equipment, equipmentsyscode } = item;
  router.push(
    `/device/whole-set-detail?dataId=${dataid}&typeValue=${typeValue}&equipmentcode=${equipmentcode}&equipment=${equipment}&equipmentsyscode=${equipmentsyscode}`
  );
}

// 搜索
const searchValue = ref('');

function handleSearch() {
  const { value } = searchValue;
  if (value) {
    // 激光云台加个判断
    getWholeSetList({
      equipmenttypeid,
      pageSize: 10,
      pageNum: 1,
      url,
      equipmentcode: value,
      deviceCode: value,
    }).then(res => {
      initParams();
      loadAll = true;
      wholeSetList.value.push(...res.data.rows);
      startObserve.value = true;
    });
  } else {
    initParams();
    getData();
  }
}

const showActionCondition = computed(() => {
  // 目前只有调压箱(柜)
  return active.value === 5001 && canEditDevice();
});

// 管理人员才有的新增功能
function add() {
  router.push(`/device/add?typeValue=${active.value}`);
}

onActivated(() => {
  initParams();
  getData();
});

function handlePress(name) {
  console.log(`${name}被长按了`);
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;

  .tab-list {
    height: 100%;
    width: 100%;
    position: relative;

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
    }

    .van-tabs {
      height: 100%;

      :deep(.van-tabs__content) {
        height: calc(100% - 44px);
        padding: 16px;
        padding-top: 70px;
      }
    }

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
  }
}

:deep(.van-tabs__nav--line) {
  box-sizing: content-box !important;
}

:deep(.van-search--show-action) {
  padding-right: 12px;
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
