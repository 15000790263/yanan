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
      </van-tree-select></van-popup
    >

    <div class="title" @click="showLeft = true">{{ title }}</div>
    <div class="search-wrapper">
      <van-search
        v-model="searchValue"
        placeholder="请输入"
        input-align="center"
        right-icon="search"
        left-icon=""
        @click-right-icon="handleSearch"
        @clear="handleSearch"
      />
    </div>
    <div class="content">
      <div class="device-list">
        <PullUpRefresh v-if="startObserve" @loadMore="handleLoadMore">
          <ul class="pipeline-list">
            <template v-for="(item, index) in baseDeviceList" :key="index">
              <!-- 阀门 -->
              <li v-if="['5011', '5012', '5013'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">管设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">驱动类型：</div>

                    <div class="cont">{{ getValue(item.drivetype, 0) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">阀构造类型：</div>

                    <div class="cont">{{ getValue(item.constructiontype, 1) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">阀门功能：</div>

                    <div class="cont">{{ getValue(item.valvefunction, 2) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">公称直径(mm)：</div>

                    <div class="cont">{{ item.diameter }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 计量设备 -->
              <li v-if="['5014'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 仪器仪表 -->
              <li
                v-if="
                  ['4702', '5017', '5018', '5019', '5020', '5021', '5022'].includes(
                    item.equipmenttypeid
                  )
                "
              >
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">生产厂家：</div>

                    <div class="cont">{{ item.manufacturer }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 工机具 -->
              <li v-if="['5023'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">生产厂家：</div>

                    <div class="cont">{{ item.manufacturer }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 车辆 -->
              <li v-if="['6012', '6013'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">车牌号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">车辆品牌：</div>

                    <div class="cont">{{ item.vehiclebrand }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">车架号：</div>

                    <div class="cont">{{ item.framenumber }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">国别：</div>

                    <div class="cont">{{ getValue(item.national, 4) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">车辆状态：</div>

                    <div class="cont">{{ getValue(item.vehiclestatus, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 自动化仪表 -->
              <li v-if="['5015', '5016'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">生产厂家：</div>

                    <div class="cont">{{ item.manufacturer }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 阴极保护 -->
              <li v-if="['5025'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">桩名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">桩编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">材质：</div>

                    <div class="cont">{{ getValue(item.material, 5) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">所属管道：</div>

                    <div class="cont">{{ item.pipelineId }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 阴极保护 -->
              <li v-if="['5026'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">恒电位仪编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格：</div>

                    <div class="cont">{{ item.specification }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">安装位置：</div>

                    <div class="cont">{{ item.installationposition }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 电器设备及系统 -->
              <li v-if="['4699'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">生产厂家：</div>

                    <div class="cont">{{ item.manufacturer }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 机泵 -->
              <li v-if="['5027', '5028'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <template v-if="item.equipmenttypeid === 5027">
                    <van-col span="24"
                      ><div class="title">工艺编号：</div>

                      <div class="cont">{{ item.processnumber }}</div>
                    </van-col>
                    <van-col span="24"
                      ><div class="title">点位名称：</div>

                      <div class="cont">{{ item.scadapointlabel }}</div>
                    </van-col>
                    <van-col span="24"
                      ><div class="title">设备状态：</div>

                      <div class="cont">{{ getValue(item.status, 3) }}</div>
                    </van-col>
                  </template>
                  <van-col v-else span="24"
                    ><div class="title">主体材质：</div>

                    <div class="cont">{{ getValue(item.material, 5) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 通讯设备 -->
              <li v-if="['5029'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">国别：</div>

                    <div class="cont">{{ getValue(item.national, 4) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 消防设施 -->
              <li v-if="['5030', '5031', '5032', '5033', '5034'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col v-if="item.equipmenttypeid !== '5032'" span="24"
                    ><div class="title">尺寸：</div>

                    <div class="cont">{{ item.size }}</div>
                  </van-col>
                  <van-col v-if="item.equipmenttypeid === '5033'" span="24"
                    ><div class="title">材质：</div>

                    <div class="cont">{{ getValue(item.material, 5) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 过滤器 -->
              <li v-if="['6016'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">过滤器编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">材质：</div>

                    <div class="cont">{{ getValue(item.bodymaterial, 5) }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">生产厂家：</div>

                    <div class="cont">{{ item.manufacturer }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
              <!-- 其他设备 -->
              <li v-if="['5036', '5037', '5038'].includes(item.equipmenttypeid)">
                <van-row gutter="20">
                  <van-col span="24"
                    ><div class="title">设备名称：</div>

                    <div class="cont">{{ item.equipment }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备编号：</div>

                    <div class="cont">{{ item.equipmentcode }}</div>
                  </van-col>
                  <van-col v-if="item.equipmenttypeid !== '5038'" span="24"
                    ><div class="title">规格型号：</div>

                    <div class="cont">{{ item.specmodel }}</div>
                  </van-col>
                  <van-col v-if="item.equipmenttypeid !== '5037'" span="24"
                    ><div class="title">生产厂家：</div>

                    <div class="cont">{{ item.manufacturer }}</div>
                  </van-col>
                  <van-col span="24"
                    ><div class="title">设备状态：</div>

                    <div class="cont">{{ getValue(item.status, 3) }}</div>
                  </van-col>
                </van-row>
              </li>
            </template>
          </ul>
        </PullUpRefresh>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { getDeviceTree, getDeviceList, getDictType } from '../../../api/device';
import PullUpRefresh from 'components/pull-up-refresh';

const baseTreeData = ref([]);
const activeId = ref('');
const activeIndex = ref(0);

let pageSize = 20;
let pageNum = 1;
let loadAll = false;
let url = '';

getDeviceTree().then(res => {
  console.log(res.data.data[0].children);
  baseTreeData.value = res.data.data[0].children.map(item => {
    item.children.forEach(value => {
      value.text = value.label;
      value.pName = item.label;
      switch (item.id) {
        case '1200':
          value.url = '/baseequipmentvalve/baseequipmentvalvelist';
          break;
        case '1800':
          value.url = '/basemeasuringinstrument/basemeasuringinstrumentlist';
          break;
        case '2000':
          value.url = '/basemeasuringinstrument/basedetectioninstrumentlist';
          break;
        case '2200':
          value.url = '/baseequipmentvalve/baseequipmentvalvelist';
          break;
        default:
          break;
      }
      switch (value.id) {
        case '5019':
          value.url = '/baseGasDetectionController/baseGasDetectionList';
          break;
        case '5020':
          value.url = '/baseGasDetectionController/baseGasDetectionList';
          break;
        case '6012':
          value.url = '/baseequipmentspecial/baseequipmentspeciallist';
          break;
        case '6013':
          value.url = '/baseInspectionVehicle/baseInspectionVehicleList';
          break;
        case '5015':
          value.url = '/baseautomaticcontrol/baseautomaticcontrollist';
          break;
        case '5016':
          value.url = '/basePressureTransmitter/basePressureTransmitterList';
          break;
        case '5025':
          value.url = '/equipmentProtectionPileControl/equipmentprotectionpilelist';
          break;
        case '5026':
          value.url = '/baseElectricDisplacement/baseElectricDisplacementList';
          break;
        case '4699':
          value.url = '/baseequipmentelectrical/baseequipmentelectricallist';
          break;
        case '5027':
          value.url = '/basemeasuringinstrument/baseEquipmentPumpList';
          break;
        case '5028':
          value.url = '/baseElectricMachineController/baseElectricMachineList';
          break;
        case '5029':
          value.url = '/baseLawEnforcement/baseLawEnforcementList';
          break;
        case '5030':
          value.url = '/basemeasuringinstrument/baseEquipmentReleaseList';
          break;
        case '5031':
          value.url = '/baseEquipmentSoundAlarmController/baseEquipmentSoundAlarmList';
          break;
        case '5032':
          value.url = '/BaseEquipmentAirController/baseEquipmentAirList';
          break;
        case '5033':
          value.url = '/baseEquipmentTripod/baseEquipmentTripodList';
          break;
        case '5034':
          value.url = '/baseEquipmentExtinguisher/baseEquipmentExtinguisherList';
          break;
        case '6016':
          value.url = '/baseequipmentfilter/baseequipmentfilterlist';
          break;
        case '5036':
          value.url = '/baseInsulatedJoint/baseInsulatedJointList';
          break;
        case '5037':
          value.url = '/baseEquipmentBlind/baseEquipmentBlindList';
          break;
        case '5038':
          value.url = '/baseFlameArrester/baseFlameArresterList';
          break;
        default:
          break;
      }
    });
    return item;
  });

  beforeGetData();
});

function beforeGetData() {
  activeId.value = baseTreeData.value[0].children[0].id;
  title.value = baseTreeData.value[0].label + ' - ' + baseTreeData.value[0].children[0].text;
  url = baseTreeData.value[0].children[0].url;
  getData();
}

const startObserve = ref(false);

const baseDeviceList = ref([]);

function getData() {
  getDeviceList({ pageNum, pageSize, equipmenttypeid: activeId.value, url }).then(res => {
    if (pageNum * pageSize >= res.data.total) {
      // 加载完了
      loadAll = true;
    }
    baseDeviceList.value.push(...res.data.rows);
    startObserve.value = true;
  });
}

const showLeft = ref(false);

function handleLoadMore(cb) {
  if (!loadAll) {
    pageNum++;
    getData();
  } else {
    cb();
  }
}

const title = ref('');

function handleClickItem(item) {
  console.log(item);
  if (item.text !== title.value) {
    searchValue.value = '';
    title.value = item.pName + ' - ' + item.text;
    showLeft.value = false;
    initParams();
    url = item.url;
    getData();
  }
}

// 参数初始化
function initParams() {
  pageNum = 1;
  pageSize = 20;
  startObserve.value = false;
  baseDeviceList.value = [];
  loadAll = false;
}

const dictTypeList = reactive([
  {
    key: 'drivetype',
    value: [],
  },
  {
    key: 'constructiontype',
    value: [],
  },
  {
    key: 'state',
    value: [],
  },
  {
    key: 'equipment_state',
    value: [],
  },
  {
    key: 'notional_type',
    value: [],
  },
  {
    key: 'well_material',
    value: [],
  },
]);

function getDict() {
  getDictType('drive_type').then(res => {
    dictTypeList[0].value = res.data.rows;
  });
  getDictType('construction_type').then(res => {
    console.log(res.data.rows);
    dictTypeList[1].value = res.data.rows;
  });
  getDictType('valve_function').then(res => {
    dictTypeList[2].value = res.data.rows;
  });
  getDictType('equipment_state').then(res => {
    dictTypeList[3].value = res.data.rows;
  });
  getDictType('notional_type').then(res => {
    dictTypeList[4].value = res.data.rows;
  });
  getDictType('well_material').then(res => {
    dictTypeList[5].value = res.data.rows;
  });
}

getDict();

function getValue(value, index) {
  return dictTypeList[index]?.value.find(item => item.dictValue === value)?.dictLabel;
}

// 搜索
const searchValue = ref('');

function handleSearch() {
  const { value } = searchValue;
  if (value) {
    const promises = [
      getDeviceList({
        pageSize: 10,
        pageNum: 1,
        equipmenttypeid: activeId.value,
        url,
        equipment: value,
      }),
      getDeviceList({
        pageSize: 10,
        pageNum: 1,
        equipmenttypeid: activeId.value,
        url,
        equipmentcode: value,
      }),
    ];
    Promise.all(promises).then(res => {
      initParams();
      loadAll = true;
      const res1L = res[0].data.rows;
      const res2L = res[1].data.rows;
      if (res1L.length && res2L.length) {
        baseDeviceList.value.push(...(res1L.length > res2L.length ? res2L : res1L));
      } else {
        res.forEach(item => {
          baseDeviceList.value.push(...item.data.rows);
        });
      }
      startObserve.value = true;
    });
  } else {
    initParams();
    getData();
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 16px;
  background-color: rgba(245, 245, 245, 1);

  @topHeight: 46px;
  // @bottomHeight: 50px;
  @popupHeight: calc(100% - @topHeight);

  .van-popup--left {
    width: 100%;
    height: @popupHeight;
    border-bottom: 1px solid #f1f5f6;
    top: calc(@popupHeight / 2 + @topHeight);
  }

  .title {
    height: 40px;
    font-family: 思源黑体;
    font-size: 14px;
  }

  .content {
    font-size: 12px;
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    border-radius: 16px;
    box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);
    padding: 16px;
    height: calc(100% - 110px);
  }

  .device-list {
    height: 100%;
    overflow-y: scroll;

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

  .search-wrapper {
    width: 100vw;
    margin-left: -16px;
    border-top: 1px solid #ddd;
    margin-bottom: 16px;
  }
}

.van-col.van-col--24 {
  display: flex;
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  .title {
    height: unset;
    font-size: unset;
    width: 100px;
  }

  .cont {
    flex: 1;
  }
}
</style>
