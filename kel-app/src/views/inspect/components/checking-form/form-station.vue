<template>
  <div class="main-container-2" :class="{ 'form-device': !!fromDevice }">
    <div class="card form">
      <check-item
        label="调压站名称<i class='stationName-required' style='color: red;'>*</i>"
        :labelOneLine="true"
      >
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['stationName']"
            label=""
            label-align="top"
            readonly
            placeholder="请输入调压站名称"
            :error-message="formData['stationName'] ? '' : errorMessage"
            @click="showPup = true"
          />
        </div>
      </check-item>

      <check-item label="巡检人" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['practicalPerson']"
            label=""
            readonly
            label-align="top"
            placeholder="请输入"
            @click="showPup2 = true"
          />
        </div>
      </check-item>

      <check-item label="作业区域" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['workAreaText']"
            label=""
            label-align="top"
            disabled
            placeholder="请输入"
          />
        </div>
      </check-item>

      <div class="card2">
        <ImgBtn @onMultiBtnClick="handleMultiBtnClick" />
      </div>

      <template v-for="item in itemList" :key="item.field">
        <check-item
          v-if="item.category === 'yesOrNo'"
          :label="item.label"
          :showPhoto="formData[item.field] !== '1'"
          allowPhoto
          @onPhotoClick="handleItemRecord(item.label)"
        >
          <div class="check-wrapper">
            <van-radio-group
              :disabled="!isStarting"
              v-model="formData[item.field]"
              shape="dot"
              direction="horizontal"
            >
              <van-radio name="0" icon-size="16px" checked-color="#00B099">否</van-radio>
              <van-radio name="1" icon-size="16px" checked-color="#00B099">是</van-radio>
            </van-radio-group>
          </div>
        </check-item>

        <check-item
          v-else-if="item.category === 'inputNumber'"
          :label="
            item.key === 'needBtn'
              ? item.label
              : `${item.label}<i class='stationName-required' style='color: red;'>*</i>`
          "
          :labelOneLine="true"
        >
          <div class="input-container">
            <van-field
              border
              :disabled="!isStarting"
              v-model.trim="formData[item.field]"
              label=""
              type="number"
              label-align="top"
              placeholder="请输入"
              :error-message="
                item.key === 'needBtn' ? '' : String(formData[item.field]) ? '' : errorMessage
              "
            >
              <template #right-icon>
                <span style="color: #888">{{ item.extra }}</span>
              </template>
              <template v-if="item.key === 'needBtn'" #button>
                <div
                  style="padding: 2px 10px; color: #fff; border-radius: 4px"
                  :style="{ 'background-color': isStarting ? '#2ab1b8' : '#2ab1b866' }"
                  @click="isStarting && (formData[item.field] = '')"
                >
                  无
                </div>
              </template>
            </van-field>
          </div>
        </check-item>

        <div v-else style="height: 50px; line-height: 50px; font-weight: 600; font-size: 18px">
          现场工艺参数控制项目
        </div>
      </template>

      <check-item label="上述项目除外和临时巡检内容" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['other']"
            label=""
            :disabled="!isStarting"
            label-align="top"
            placeholder="请输入"
          >
          </van-field>
        </div>
      </check-item>

      <check-item label="出站时间" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['exitTime']"
            label=""
            label-align="top"
            placeholder="请输入"
            readonly
            :disabled="!isStarting"
            @click-input="showBottom = true"
          >
          </van-field>
        </div>
      </check-item>
    </div>

    <div class="card btns">
      <van-row gutter="16">
        <van-col span="12" v-if="isStarting">
          <van-button @click="handleCancel" size="small" block round type="success">
            取消
          </van-button>
        </van-col>
        <van-col span="12" v-if="isStarting">
          <van-button
            @click="handleConfirm"
            size="small"
            block
            round
            type="success"
            color="#FF6A00"
          >
            结束巡检
          </van-button>
        </van-col>

        <van-button
          v-else
          @click="handleStartCheck"
          size="small"
          block
          round
          type="success"
          color="#FF6A00"
          :disabled="!formData['stationName']"
          >开始巡检</van-button
        >
      </van-row>
    </div>
    <van-popup v-model:show="showPup" position="bottom" :style="{ height: '30%' }">
      <div class="pop-content">
        <ul>
          <li
            :class="{
              active: item.equipment === formData['stationName'],
              disabled: item.patrolstatus === '1',
            }"
            v-for="item in allStations"
            :key="item.dataid"
            @click="stationClick(item)"
          >
            {{ item.equipment }}
          </li>
        </ul>
      </div>
    </van-popup>
    <van-popup v-model:show="showPup2" position="bottom" :style="{ height: '30%' }">
      <div class="pop-content">
        <ul>
          <li
            :class="{ active: formData['practicalPerson'].includes(item.nickName) }"
            v-for="item in deptPersonList"
            :key="item.deptId"
            @click="personClick"
          >
            {{ item.nickName }}
          </li>
        </ul>
      </div>
    </van-popup>

    <!-- 选择日期时间 -->
    <van-popup v-model:show="showBottom" position="bottom" :style="{ 'min-height': '30%' }">
      <van-picker-group
        title=""
        :tabs="['选择日期', '选择时间']"
        @confirm="onConfirm"
        @cancel="showBottom = false"
      >
        <van-date-picker v-model="currentDate" />
        <van-time-picker v-model="currentTime" :columns-type="['hour', 'minute']" />
      </van-picker-group>
    </van-popup>
  </div>
</template>

<script setup>
import { getIsInspect, getUserInfo } from '../../../../utils/session';
import { showSuccessToast, showConfirmDialog } from 'vant';

import CheckItem from '../check-item-common/index.vue';
import { api_station } from '@/api/inspect';
import { mediaCacheInstance } from '../../util/mediaCache';
import dayjs from 'dayjs';
import { createLoading } from '@/utils/loading-fn';
import { useStationStore } from '../../../../stores/inspect/station';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { getLoc } from '../../util/location';
import { showToast, showDialog } from 'vant';
import { getUserByDeptId } from '@/api/work';
import { useRegulatorStore } from '@/stores/inspect/regulator';

const regulatorStore = useRegulatorStore();

const stationStore = useStationStore();

const showPup2 = ref(false);
const deptPersonList = ref([]);

function getDeptPersonList() {
  getUserByDeptId(JSON.parse(getUserInfo()).deptId).then(res => {
    console.log(res.data.rows);
    deptPersonList.value = res.data.rows;
  });
}

getDeptPersonList();

const initForm = {
  // 安全通道是否畅通(0,否 1,是)
  safePassage: '1',
  // 灭火器是否正常(0,否 1,是)
  fireExtinguisher: '1',
  // 环境、设备卫生是否良好(0,否 1,是)
  environment: '1',
  // 门、窗、防护栏是否完好(0,否 1,是)
  doors: '1',
  // 电气设备及线路是否正常运行(0,否 1,是)
  line: '1',
  // 安全标志是否清晰、完好(0,否 1,是)
  mark: '1',
  // 漆面、防腐层是否完好(0,否 1,是)
  paintwork: '1',
  // 阀门运行状态牌(开、关)是否悬挂正确(0,否 1,是)
  valveStatus: '1',
  // 设备是否无泄痛(0,否 1,是)
  leakage: '1',
  // 仪表设备是否显示正常(0,否 1,是)
  deviceNormal: '1',
  // 静电跨接线连接，是否完好(0,否 1,是)
  staticElectricity: '1',
  // 排污池是否干净(0,否 1,是)
  sewageTank: '1',
  // 进口压力值(次高压:0.8Mpa-1.6Mpa; 高压:2.5mpa-3.8Mpa)
  importPressure: 0,
  // 出口压力值(0.2Mpa-0.4Mpa
  exportPressure: 0,
  // 进口温度值(-16℃-60℃)
  importTemperature: 0,
  // 出口温度值(-16℃-60℃)
  exportTemperature: 0,
  // 一支路过滤器压差值(<300mbar)
  firstPressure: 0,
  // 二支路过滤器压差值(<300mbar)
  secondPressure: 0,
  // 三支路过滤器压差值(<300mbar)
  thirdPressure: 0,
  // 上述项目除外和临时巡检内容
  other: '',
  // 进站时间
  entryTime: '',
  // 出站时间
  exitTime: '',

  // UPS进排风是否通畅，风扇运转正常，无异响(0,否 1,是)
  upsFan: '1',
  // UPS主机运行指示灯是否显示正常排污池是否干净(0,否 1,是)
  upsLight: '1',
  // UPS蓄电池外观是否完好，无外壳变形和渗漏(0,否 1,是)
  upsStorage: '1',
  // 一次表与二次表是否显示一致(0,否 1,是)
  displayCorrect: '1',
  // UPS设备间环境工作温度(-20℃-40℃)
  upsTemperature: 0,
  // 过滤器及安全附件运行情况是否正常
  filterSafe: '1',
  // 汇管及安全附件运行情况是否正常
  pipeSafe: '1',
  // UPS设备间空调运行是否正常
  upsAc: '1',
  stationName: '',
  stationNum: '',
  equipmentsyscode: '',
  practicalPerson: JSON.parse(getUserInfo()).nickName,
  remark: '',
  workArea: '',
  workAreaText: JSON.parse(getUserInfo()).dept.deptName,
};

// 获取最新的调压站巡检点
function getLastAllStation() {
  stationStore.getAllStation();
}
getLastAllStation();

const allStations = computed(() => stationStore.stations);

const route = useRoute();
const equipmentsyscode = route.query.equipmentsyscode;

const fromDevice = ref(equipmentsyscode);

onMounted(() => {
  if (equipmentsyscode) {
    const res = allStations.value.find(item => item.equipmentsyscode === equipmentsyscode);
    nextTick(() => {
      formData.value['stationName'] = res.equipment;
      formData.value['stationNum'] = res.equipmentcode;
      formData.value['equipmentsyscode'] = res.equipmentsyscode;
    });
  }
});

const itemList = ref([
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '安全通道是否畅通',
    field: 'safePassage',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '灭火器是否正常',
    field: 'fireExtinguisher',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '环境、设备卫生是否良好',
    field: 'environment',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '门、窗、防护栏是否完好',
    field: 'doors',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '电气设备及线路是否正常运行',
    field: 'line',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '安全标志是否清晰、完好',
    field: 'mark',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '漆面、防腐层是否完好',
    field: 'paintwork',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '阀门运行状态牌(开、关)是否悬挂正确',
    field: 'valveStatus',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '设备是否无泄漏',
    field: 'leakage',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '仪表设备是否显示正常',
    field: 'deviceNormal',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '静电跨接线连接，是否完好',
    field: 'staticElectricity',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '排污池是否干净',
    field: 'sewageTank',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '一次表与二次表是否显示一致',
    field: 'displayCorrect',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '过滤器及安全附件运行情况是否正常',
    field: 'filterSafe',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: '汇管及安全附件运行情况是否正常',
    field: 'pipeSafe',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: 'UPS主机运行指示灯是否显示正常',
    field: 'upsLight',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: 'UPS进排风是否通畅，风扇运转正常，无异响',
    field: 'upsFan',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: 'UPS蓄电池外观是否完好，无外壳变形和渗漏',
    field: 'upsStorage',
  },
  {
    key: 'aaaaaa',
    category: 'yesOrNo',
    label: 'UPS设备间空调运行是否正常',
    field: 'upsAc',
  },
  {},
  {
    key: 'aaaaaa',
    category: 'inputNumber',
    label: '进口压力值(次高压:0.8Mpa-1.6Mpa; 高压:2.5mpa-3.8Mpa)',
    field: 'importPressure',
    extra: 'Mpa',
  },
  {
    key: 'aaaaaa',
    category: 'inputNumber',
    label: '进口温度值(-16℃-60℃)',
    field: 'importTemperature',
    extra: '℃',
  },
  {
    key: 'aaaaaa',
    category: 'inputNumber',
    label: '出口压力值(0.2Mpa-0.4Mpa)',
    field: 'exportPressure',
    extra: 'Mpa',
  },
  {
    key: 'aaaaaa',
    category: 'inputNumber',
    label: '出口温度值(-16℃-60℃)',
    field: 'exportTemperature',
    extra: '℃',
  },
  {
    key: 'needBtn',
    category: 'inputNumber',
    label: '一支路过滤器压差值(<300mbar)',
    field: 'firstPressure',
    extra: 'Mbar',
  },
  {
    key: 'needBtn',
    category: 'inputNumber',
    label: '二支路过滤器压差值(<300mbar)',
    field: 'secondPressure',
    extra: 'Mbar',
  },
  {
    key: 'needBtn',
    category: 'inputNumber',
    label: '三支路过滤器压差值(<300mbar)',
    field: 'thirdPressure',
    extra: 'Mbar',
  },
  {
    key: 'aaaaaa',
    category: 'inputNumber',
    label: 'UPS设备间环境工作温度（-20℃-40℃）',
    field: 'upsTemperature',
    extra: '℃',
  },
]);

const formData = ref({ ...initForm });

const isStarting = ref(false);

const router = useRouter();

const handleMultiBtnClick = () => {
  // router.push("")
  if (isStarting.value) {
    localStorage.setItem('detailType', 'station');
    router.push(`/inspect/multimedia/123?type=edit`);
  }
};

const handleItemRecord = checkingStr => {
  checkingStr = checkingStr.split('是否').shift();
  window.localStorage.setItem('watermark_checkingItem', checkingStr);
  mediaCacheInstance.cacheCheckingItem(checkingStr);
  handleMultiBtnClick();
};

const errorMessage = ref('');

const fileBlobs = ref([]);

function isHeigh(name) {
  const item = allStations.value.find(item => item.equipment === name);
  return item?.isHighPressure;
}

function getPatrolStatus() {
  const res = itemList.value.find(item => {
    if (item.category && item.category === 'yesOrNo') {
      return formData.value[item.field] == '0';
    } else if (item.key) {
      let map = {
        //   importPressure: [[0.8, 1.6], [2.5 - 3.8]],
        exportPressure: [0.2, 0.4],
        importTemperature: [-16, 60],
        exportTemperature: [-16, 60],
        firstPressure: [0, 300],
        secondPressure: [0, 300],
        thirdPressure: [0, 300],
        upsTemperature: [-20, 40],
      };

      //
      if (item.field === 'importPressure') {
        if (!isHeigh(formData.value['stationName'])) {
          return +formData.value['importPressure'] > 1.6 || formData.value['importPressure'] < 0.8;
        } else {
          return +formData.value['importPressure'] > 3.8 || formData.value['importPressure'] < 2.5;
        }
      } else {
        return (
          +formData.value[item.field] < map[item.field][0] ||
          +formData.value[item.field] > map[item.field][1]
        );
      }
    }
  });

  return {
    patrolStatus: !res ? 1 : 2,
  };
}

function validate() {
  if (!formData.value['stationName']) {
    errorMessage.value = '必填项不能为空';
    document.querySelector('.stationName-required').scrollIntoView();
    return;
  }
  const res = itemList.value.find(item => {
    if (
      item.category === 'inputNumber' &&
      !String(formData.value[item.field]) &&
      item.key !== 'needBtn'
    ) {
      errorMessage.value = '必填项不能为空';
      return true;
    }
  });

  if (res) {
    return false;
  }

  return true;
}

function getFileBlobs() {
  const files = mediaCacheInstance.getMediaListFromCache();
  fileBlobs.value = [];

  if (files?.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileBlobs.value.push(file);
    }
  }
}

function handleConfirm() {
  const res = validate();
  if (!res) {
    return;
  }

  showConfirmDialog({
    title: '提示',
    message: '确定结束巡检吗？',
  })
    .then(async () => {
      getFileBlobs();
      const destroy = createLoading('数据上传中，请稍等', { duration: 30000 });
      const res = await api_station
        .putCheckForm(
          {
            ...formData.value,
            ...getPatrolStatus(),
          },
          fileBlobs.value
        )
        .finally(() => {
          destroy();
        });

      console.log(res.data.data);
      const id = res.data.data;

      const isInspect = getIsInspect();
      if (isInspect) {
        if (!regulatorStore.stationIdList.includes(id)) {
          regulatorStore.setStationIdList(id);
        }
      }

      // 异常加入隐患系统
      if (getPatrolStatus(formData.value).patrolStatus === 2) {
        showConfirmDialog({
          title: '提示',
          message: '本次巡检结果存在异常，是否加入隐患系统？',
        })
          .then(() => {
            router.push('/inspect/inspect-pitfall-add?source=station');
          })
          .catch(() => {});
      } else {
        showSuccessToast('操作成功');
      }

      getLastAllStation();
      initData();
    })
    .catch(() => {
      // on cancel
    });
}

function initData() {
  formData.value = { ...initForm };
  nextTick(() => {
    // 取消时不提示必填项
    errorMessage.value = '';
  });
  isStarting.value = false;

  mediaCacheInstance.clear();
  stationStore.clearCache();
}

function handleCancel() {
  showConfirmDialog({
    title: '提示',
    message: '确定取消巡检吗？',
  })
    .then(() => {
      initData();
    })
    .catch(() => {
      // on cancel
    });
}

onBeforeUnmount(() => {
  getFileBlobs();
  stationStore.saveCache({
    ...formData.value,
    fileBlobs: fileBlobs.value,
    isStarting: isStarting.value,
  });
});

function dataRecovery() {
  if (stationStore.cache) {
    const cache = stationStore.cache;
    fileBlobs.value = cache.fileBlobs;
    isStarting.value = cache.isStarting;

    delete cache.fileBlobs;
    delete cache.isStarting;

    formData.value = cache;

    stationStore.clearCache();
  }
}

onMounted(dataRecovery);

// 开始巡检
async function handleStartCheck() {
  mediaCacheInstance.clear();

  // 2024-9-2 场站编码字段有问题，无法确定定位范围（已修改）
  // 判断是否再范围内
  const location = await getLoc();
  if (location) {
    const { longitude: x, latitude: y } = location;

    const res = await api_station.checkIn({
      x,
      y,
      stationNum: formData.value['equipmentsyscode'],
    });

    console.log(res);

    if (+res.data.data > 0) {
      showToast({ message: '签到成功', overlay: true, duration: 1000 });
    } else {
      showDialog({
        title: '不在范围内',
        message: '您的当前位置不在设备范围内，巡检表单将无法提交，请移动到设备范围内再进行签到！',
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: '知道了',
      });
      return;
    }
  } else {
    // 没有定位成功
    showDialog({
      title: '定位失败',
      message:
        '您的当前位置无法定位，请确认定位权限已开启，并关闭手机省电模式，移动至开阔地带后重试！',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '知道了',
    });
    return;
  }

  isStarting.value = true;
  formData.value.entryTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
}

const showPup = ref(false);

function stationClick(data) {
  if (data.patrolstatus === '1') {
    return;
  }
  // formData.value['stationName'] = e.target.innerHTML;
  // formData.value['stationNum'] = e.target.dataset.equipmentcode;
  // formData.value['equipmentsyscode'] = e.target.dataset.equipmentsyscode;
  formData.value['stationName'] = data.equipment;
  formData.value['stationNum'] = data.equipmentcode;
  formData.value['equipmentsyscode'] = data.equipmentsyscode;
  showPup.value = false;
}

function personClick(e) {
  showPup2.value = false;
  if (JSON.parse(getUserInfo()).nickName !== e.target.innerHTML) {
    if (formData.value['practicalPerson'].includes(e.target.innerHTML)) {
      formData.value['practicalPerson'] = formData.value['practicalPerson'].split('，').shift();
      return;
    }
    formData.value['practicalPerson'] =
      JSON.parse(getUserInfo()).nickName + '，' + e.target.innerHTML;
  }
}

const showBottom = ref(false);
const currentDate = ref(dayjs().format('YYYY.MM.DD').split('.'));
const currentTime = ref(dayjs().format('HH.mm').split('.'));

function onConfirm() {
  const t = `${currentDate.value.join('-')} ${currentTime.value.join(':')}`;
  formData.value['exitTime'] = t;
  showBottom.value = false;
}
</script>

<style lang="less" scoped>
.main-container-2 {
  position: relative;
  padding-bottom: 60px;
  height: calc(100% - 113px);
  overflow-y: scroll;

  &.form-device {
    height: 100%;
    margin-top: -120px;

    .btns {
      position: fixed;
      bottom: 0;
      width: 100%;
    }
  }
}

.card {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: white;
  overflow-y: auto;
  overflow-x: hidden;
}

.btns {
  position: fixed;
  bottom: 50px;
  width: 100%;
}

.input-container {
  border-radius: 4px;
  opacity: 1;
  background: rgba(68, 116, 121, 0.1);
  border: 1px solid #e7eeee;
  width: 100%;

  :deep(.van-field) {
    // background-color: transparent;
  }
}
.empty {
  height: 32px;
}

.check-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;

  // .van-radio-group {
  //   pointer-events: none;
  // }
}

.pop-content {
  width: 100%;
  height: 100%;
  padding: 20px 0;

  ul {
    height: 100%;
    overflow-y: scroll;

    > li {
      line-height: 40px;
      width: 100%;
      text-align: center;
      color: #666;
      font-size: 14px;

      &.active {
        background-color: #8cb1ea;
        color: #fff;
      }
      &.disabled {
        color: #ddd;
      }
    }
  }
}
</style>
