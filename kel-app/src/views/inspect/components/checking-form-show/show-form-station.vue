<template>
  <div class="main-container-2">
    <div class="card form">
      <div class="card2">
        <basic-info type="station" :data="props.data" />
      </div>

      <div class="card2">
        <ImgBtn type="show" @onMultiBtnClick="handleMultiBtnClick" />
      </div>

      <template v-for="item in itemList" :key="item.field">
        <check-item
          v-if="item.category === 'yesOrNo'"
          :label="item.label"
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
          :label="item.label"
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
              :error-message="String(formData[item.field]) ? '' : errorMessage"
            >
              <template #extra>
                <span style="color: #888">{{ item.extra }}</span>
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
            label-align="top"
            disabled
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
    <div class="card">
      <van-row gutter="16" justify="space-around">
        <van-col span="8">
          <van-button @click="handleEdit" size="small" block round type="primary">
            修改
          </van-button>
        </van-col>
        <!-- <van-col span="8">
          <van-button @click="handleDel" size="small" block round type="danger"> 删除 </van-button>
        </van-col> -->
        <van-col span="8" v-if="userStore.permissions.includes('safe:plan:add')">
          <van-button @click="handleConfirm" size="small" block round type="success">
            确认
          </van-button>
        </van-col>
      </van-row>
    </div>

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
import { getUserInfo } from '../../../../utils/session';
import { showSuccessToast, showFailToast, showConfirmDialog, showToast, showDialog } from 'vant';

import CheckItem from '../check-item-common/index.vue';
import { api_station, getStaffs } from '@/api/inspect';
import { mediaCacheInstance } from '../../util/mediaCache';
import { useStationStore } from '../../../../stores/inspect/station';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { systemStore } from '../../../../stores/system';
import BasicInfo from '../device-detail/basic-info.vue';
import dayjs from 'dayjs';

import useUserStore from '../../../../stores/user';

const userStore = useUserStore();
const stationStore = useStationStore();
const useSystem = systemStore();

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const formData = ref({});

onMounted(() => {
  formData.value = props.data;
  const item = useSystem.workArea.find(item => item.dictValue === props.data.workArea);
  formData.value.workAreaText = item?.dictLabel || '';
});

watch(
  () => props.data,
  v => {
    formData.value = v;
    const item = useSystem.workArea.find(item => item.dictValue === v.workArea);
    formData.value.workAreaText = item?.dictLabel || '';
  }
);

const allStations = stationStore.stations;

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

const isStarting = ref(false);

const router = useRouter();

const handleMultiBtnClick = () => {
  router.push(`/inspect/multimedia/${props.data.id}?type=show&insType=station`);
};

const handleItemRecord = checkingStr => {
  checkingStr = checkingStr.split('是否').shift();
  window.localStorage.setItem('watermark_checkingItem', checkingStr);
  mediaCacheInstance.cacheCheckingItem(checkingStr);
  handleMultiBtnClick();
};

// 历史数据未确认，可编辑
async function handleEdit() {
  router.push(`/inspect/inspect-home?stationId=${props.data.id}`);
}

// 历史数据未确认，可删除
async function handleDel() {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除当前数据吗？',
  })
    .then(async () => {
      await api_station.deletePlanById(props.data.id);
      showToast('操作成功');
      setTimeout(() => {
        router.goBack();
      }, 800);
    })
    .catch(() => {
      // on cancel
    });
}

let resultConfirmDesp = '同意';

// 巡检确认
function handleConfirm() {
  showDialog({
    title: '请输入意见',
    message: h('input', {
      style: {
        display: 'inline-block',
        height: '30px',
        border: '1px solid #ddd',
        width: '100%',
        padding: '0 10px',
      },
      value: resultConfirmDesp,
      oninput(e) {
        resultConfirmDesp = e.target.value;
      },
      onblur(e) {
        if (e.target.value === '') {
          resultConfirmDesp = e.target.value = '同意';
        }
      },
    }),
    closeOnClickOverlay: true,
  }).then(async () => {
    await api_station.putCheckForm({
      id: props.data.id,
      state: '1',
      resultConfirm: userStore.nickName,
      resultConfirmId: userStore.userId,
      resultConfirmDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      resultConfirmDesp,
      isFollow: true
    });

    showToast('操作成功');
    setTimeout(() => {
      router.goBack();
    }, 800);
  });
}
</script>

<style lang="less" scoped>
.main-container-2 {
  position: relative;
  height: calc(100vh - 48px - 58px - 52px);
  overflow-y: auto;
}

.card {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: white;
  overflow-x: hidden;
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
</style>
