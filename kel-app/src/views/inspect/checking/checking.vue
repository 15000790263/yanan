<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { showToast, showDialog, showConfirmDialog } from 'vant';

import CheckingForm from '../components/checking-form/index.vue';
import CheckingFormShow from '../components/checking-form-show/index.vue';
import DeviceDetail from '../components/device-detail/index.vue';
import TaskDetail from '../components/task-detail/index.vue';
import { getLoc } from '../util/location';
import {
  api_regulator,
  api_well,
  api_pipeline,
  api_station,
  getDeptId,
  api_yinbao,
} from '@/api/inspect';
import { getUserByDeptId } from '@/api/work';
import { mediaCacheInstance } from '../util/mediaCache';
import { throttle } from 'lodash-es';
import { createLoading } from '../../../utils/loading-fn';
import { useInspectPicStore } from '@/stores/inspect/inspect-pic';
import emitter from '../../../utils/event-bus';

const canFormConfirm = ref(false);
const inspectPic = useInspectPicStore();

const type = ref('regulator');
const id = ref('');
const formType = ref('edit'); // show | edit
const activeIndex = ref(0);
const itemData = ref({});
const route = useRoute();
const router = useRouter();

const staffs = ref([]);

let flag = true;

onActivated(() => {
  type.value = route.query.type;
  id.value = route.params.id;
  formType.value = route.query.formType;

  // 这里标识当前是从哪个tab进入
  // 主要是为了在详情页返回时，回到进入的tab
  localStorage.setItem('detailType', route.query.type);
  if (route.query?.isfrompipeline === '1') {
    localStorage.setItem('detailType', 'pipeline');
  }

  if (!router.options.history.state.forward?.includes('/inspect/add-picture')) {
    getDetail();
  }

  getDepartStaffs();

  checkIfNeedClearMediaCache();

  flag = true;

  document.addEventListener('backbutton', exec, false);
});

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  return false;
}

const checkIfNeedClearMediaCache = () => {
  const id = route.params.id;
  const lastId = window.localStorage.getItem('lastId');
  if (!lastId || lastId !== id) {
    // 清理缓存
    mediaCacheInstance.clear();
  }

  window.localStorage.setItem('lastId', id);
};

onBeforeRouteLeave(to => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }

  if (
    ['/device/whole-set-detail', '/inspect/inspect-home'].includes(to.path) &&
    formType.value === 'edit' &&
    flag === false
  ) {
    setTimeout(() => {
      showConfirmDialog({
        title: '提示',
        message: '数据未保存，确认返回吗？',
      })
        .then(
          () => {
            isFromPipe();
            router.goBack();

            if (route.query.isDelegate !== 'true') {
              if (type.value === 'regulator') {
                api_regulator.deletePost(id.value);
              } else if (type.value === 'well') {
                api_well.deletePost(id.value);
              }
            }
          },
          () => {}
        )
        .finally(() => {
          flag = true;
        });
    }, 100);

    return false;
  } else if (!to.path.includes('/inspect/multimedia') && !(to.path === '/inspect/add-picture')) {
    inspectPic.clearPictureCache();
  }
});

function isFromPipe() {
  if (route.query?.isfrompipeline) {
    sessionStorage.setItem('isfrompipeline', 'true');
  }
}

const getDepartStaffs = async () => {
  const deptId = getDeptId();

  const staffsRes = await getUserByDeptId(deptId);

  if (staffsRes.status === 200 && staffsRes.data.code === 200) {
    staffs.value = staffsRes.data.rows.map(item => {
      return {
        text: item.nickName,
        value: item.userId,
      };
    });
  }
};

const getDetail = async () => {
  const destroy = createLoading();

  let detailFn = api_regulator.getDetail;
  switch (type.value) {
    case 'well':
      detailFn = api_well.getDetail;
      break;
    case 'pipeline':
      detailFn = api_pipeline.getDetail;
      break;
    case 'station':
      detailFn = api_station.getDetail;
      break;
    case 'yinbao':
      detailFn = api_yinbao.getDetail;
      break;
  }

  const res = await detailFn(id.value);
  // return;

  destroy();

  if (res.status === 200 && res.data.code === 200) {
    itemData.value = res.data.data;
    await doCheckIn(res.data.data);

    // 水印可能会用到
    saveInfoForWatermark(res.data.data);
  }
};

const saveInfoForWatermark = data => {
  let location = data['regulatorLocation'] ?? '';
  if (type.value === 'well') location = data['valveLocation'] ?? '';
  window.localStorage.setItem('watermark_address', location);
};

onDeactivated(() => {
  setTimeout(() => {
    window.localStorage.removeItem('watermark_address');
  }, 1000);

  document.removeEventListener('backbutton', exec, false);
});

const apiCheckIn = computed(() => {
  switch (type.value) {
    case 'regulator':
      return api_regulator.checkIn;
    case 'well':
      return api_well.checkIn;
    case 'pipeline':
      return api_pipeline.checkIn;
    case 'yinbao':
      return api_yinbao.checkIn;
    default:
      return api_regulator.checkIn;
  }
});

const location = ref(null);

const deviceCheckIn = async data => {
  let noKey = 'regulatorNumber';
  switch (type.value) {
    case 'regulator':
      noKey = 'regulatorNumber';
      break;
    case 'well':
      noKey = 'valveNumber';
      break;
    case 'pipeline':
      noKey = 'pipelineNo';
      break;
    case 'yinbao':
      noKey = 'valveNumber';
      break;
    default:
      noKey = 'regulatorNumber';
  }
  // 点击进去之前需要判断
  location.value = await getLoc();
  if (location.value) {
    const { longitude: x, latitude: y } = location.value;

    const res = await apiCheckIn.value({
      x,
      y,
      [noKey]: data.equipmentsyscode,
    });

    return +res.data.data > 0;
    // return true;
  }
};

const doCheckIn = async data => {
  if (!data) return;

  if (formType.value === 'show') {
    return;
  }

  const checkInRes = await deviceCheckIn(data);
  if (checkInRes) {
    showToast({ message: '签到成功', overlay: true, duration: 1000 });
    canFormConfirm.value = true;
  } else if (checkInRes === undefined) {
    // 没有定位成功
    showDialog({
      title: '定位失败',
      message:
        '您的当前位置无法定位，请确认定位权限已开启，并关闭手机省电模式，移动至开阔地带后重试！',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '知道了',
    });
  } else {
    showDialog({
      title: '不在范围内',
      message: '您的当前位置不在设备范围内，巡检表单将无法提交，请移动到设备范围内再进行签到！',
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '知道了',
    });
  }
};

const onRefresh = throttle(() => {
  getDetail();
  getDepartStaffs();
  checkIfNeedClearMediaCache();
}, 4000);

emitter.on('leftBack', () => {
  if (route.path.includes('/inspect/checking')) {
    flag = false;
  }
});
</script>

<template>
  <div class="main-container">
    <div class="tabs">
      <van-tabs v-model:active="activeIndex" color="#2EC192">
        <van-tab title="填报信息"></van-tab>
        <van-tab title="任务详情"></van-tab>
        <van-tab v-if="type !== 'pipeline' && type !== 'station'" title="设备信息"></van-tab>
      </van-tabs>
    </div>

    <!-- 填报 -->
    <CheckingForm
      v-if="activeIndex === 0 && formType === 'edit'"
      :location="location"
      :type="type"
      :data="itemData"
      :staffs="staffs"
      :canFormConfirm="canFormConfirm"
      @refresh="onRefresh"
    />
    <!-- 展示 -->
    <CheckingFormShow
      v-if="activeIndex === 0 && formType === 'show'"
      :type="type"
      :data="itemData"
    />
    <TaskDetail v-if="activeIndex === 1" :type="type" :data="itemData" />
    <DeviceDetail v-if="activeIndex === 2" :type="type" :data="itemData" />
  </div>
</template>

<style lang="less" scoped>
.main-container {
  background-color: #f7fafa;
  --van-tabs-nav-background: transparent;
  height: 100%;
}

.tabs {
  padding: 0px 52px;
  padding-top: 12px;
  margin-bottom: 12px;
}
</style>
