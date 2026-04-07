<script setup>
import { showToast, showFailToast, showSuccessToast, showConfirmDialog } from 'vant';
import { ref, onMounted, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import {
  api_regulator,
  api_well,
  api_pipeline,
  api_station,
  // getStaffs
} from '@/api/inspect';
import {
  list_regulator_adapter,
  list_well_adapter,
  list_pipeline_adapter,
} from '../util/dataAdapter';
import { getMonthInfo } from '../util/time';
import { navigateByLocation } from '../../../utils/cordova-tools';

import CommonSearchComposition from '../components/common-search-composition/index.vue';
import TypeSwitcher from '../components/type-switcher2/index.vue';
import QrButton from '../components/qr-code-btn/index.vue';
import TaskItem from '../components/task-item2/index.vue';
import TaskProgress from '../components/task-progress/index.vue';
import FormPipeline from '../components/checking-form/form-pipelinev2.vue';
import FormPipelineModify from '../components/checking-form/form-pipelinev2-modify.vue';
import FormStation from '../components/checking-form/form-station.vue';
import FormStationModify from '../components/checking-form/form-station-modify.vue';
import { usePage } from '../hooks/usePage';
import { qrScanner2 } from '@/utils/qrscanner2';
import { createLoading } from '../../../utils/loading-fn';
import { mediaCacheInstance } from '../util/mediaCache';
import { useStationStore } from '../../../stores/inspect/station';
import { getLoc } from '../util/location';
import { getUserByDeptId } from '@/api/work';
import { getUserInfo } from '../../../utils/session';
import debounce from 'lodash.debounce';

const router = useRouter();
const route = useRoute();

// 管线巡检修改时，会传pipelineId
const pipelineId = route.query.pipelineId;

// 调压站巡检修改时，会传stationId
const stationId = route.query.stationId;

const monthInfo = getMonthInfo();

const defaultActive = 'pipeline';
const tabSwitcherRef = ref();
const tabActive = ref(defaultActive);
const list = ref([]);
const loading = ref(false);
const finished = ref(false);

const checkingMonth = ref(monthInfo.str);

const keyword = ref('');

const conditionRef = ref({});

const taskCount = ref(0);

const finishCount = ref(0);

const isKeywordSearching = computed(() => {
  return !!keyword.value;
});

const { pageNum, pageSize, addPage, getOnKeyWordPage, resetPage } = usePage(tabActive);

const apiList = computed(() => {
  switch (tabActive.value) {
    case 'regulator':
      return api_regulator.getList;
    case 'well':
      return api_well.getList;
    case 'pipeline':
      return api_pipeline.getList;
    case 'station':
      return api_station.getList;
    default:
      return api_regulator.getList;
  }
});

const apiCheckIn = computed(() => {
  switch (tabActive.value) {
    case 'regulator':
      return api_regulator.checkIn;
    case 'well':
      return api_well.checkIn;
    case 'pipeline':
      return api_pipeline.checkIn;
    default:
      return api_regulator.checkIn;
  }
});

const listDataAdapter = computed(() => {
  switch (tabActive.value) {
    case 'regulator':
      return list_regulator_adapter;
    case 'well':
      return list_well_adapter;
    case 'pipeline':
      return list_pipeline_adapter;
    default:
      return list_regulator_adapter;
  }
});

const getKeywordSearchParam = keyword => {
  switch (tabActive.value) {
    case 'regulator':
      return { regulatorNumber: keyword };
    case 'well':
      return { valveNumber: keyword };
    case 'pipeline':
      return { pipelineNo: keyword };
    default:
      return { regulatorNumber: keyword };
  }
};

// 需要展示列表和统计
const isListShow = computed(() => {
  const arr = ['station', 'pipeline'];
  return !arr.includes(tabActive.value);
});

// const api_regulator = "http://60.13.219.226:30001/safe/valveplan/list?pageSize=10&pageNum=1"

const onNextPageLoad = debounce(
  async () => {
    if (isKeywordSearching.value) return;

    loading.value = true;
    await addPage().catch(() => {
      loading.value = false;
    });
    await getList().catch(() => {
      loading.value = false;
    });
    loading.value = false;
  },
  50,
  {
    leading: true,
    trailing: false,
  }
);

const stationStore = useStationStore();

const handleTabChange = async type => {
  transIdList.value = [];
  const oldTabActive = tabActive.value;
  tabActive.value = type;
  if (type !== 'station') {
    nextTick(() => {
      stationStore.clearCache();
    });
  }

  // 如果在管线巡检，点击切换调压箱、阀井时需要手动执行查询附近500米

  // page重置的部分在hooks里面做了
  list.value = [];
  finished.value = false;
  if (['pipeline', 'station'].includes(oldTabActive)) {
    conditionRef.value = {};
  }
  getList();
};

// 当扫描二维码得到编号之后
// 根据设备编号查询列表（不需要展示）
// 对列表排序
// 得到时间最近的ID
// 跳转填报页面
const getNoFromQR = async deviceNO => {
  const basicParams = {
    // delegateStatus: "0", // 不是转派任务
    patrolStatus: '0', // 未查询
  };

  const params = {
    ...basicParams,
    ...getOnKeyWordPage(),
    ...getKeywordSearchParam(deviceNO),
  };
  const res = await apiList.value(params);
  if (res.status === 200 && res.data.code === 200) {
    // 时间点最近的
    const sorted = (res.data.rows ?? []).sort((a, b) => {
      const dateA = new Date(a.createTime);
      const dateB = new Date(b.createTime);
      return dateB.getTime() - dateA.getTime();
    });

    if (sorted.length > 0) {
      const data = sorted[0];
      router.push(`/inspect/checking/${data.id}?type=${tabActive.value}&formType=edit`);
    } else {
      showToast('没有此设备的巡检任务');
    }
  } else {
    showToast('没有此设备的巡检任务');
  }
};

const handleQRBtnClick = () => {
  qrScanner2().then(res => {
    if (res) {
      getNoFromQR(res.split(':').pop());
    }
  });
};

onMounted(async () => {
  checkBackFromForActive('detailType');

  if (!history.state.forward) {
    getList();
  }

  // 详情页返回
});

const checkBackFromForActive = type => {
  const detailType = localStorage.getItem(type);
  if (detailType) {
    tabSwitcherRef?.value?.setActive(detailType);
  }
  localStorage.removeItem(type);
};

const getList = debounce(async (keyword, conditions) => {
  const basicParams = {
    // delegateStatus: '0', // 不是转派任务
    patrolStatus: '0', // 未查询
    planStatus: '1', // 非中止任务 0 为中止
    patrolDate: checkingMonth.value, // 按月份查询
  };

  let patrolDate = conditions?.patrolDate ?? checkingMonth.value;

  if (patrolDate.split('-').length === 2) {
    patrolDate = patrolDate + '-01';
  }

  let params = {
    ...basicParams,
    ...conditionRef.value,
    patrolDate,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  };

  if (keyword) {
    params = {
      ...basicParams,
      patrolDate,
      ...getOnKeyWordPage(),
      ...getKeywordSearchParam(keyword),
    };
  }

  if (conditions) {
    conditionRef.value = conditions;
    params = {
      ...params, // 可能还有关键词
      ...basicParams,
      // ...getOnKeyWordPage(),
      ...conditions,

      patrolDate,
    };
  }

  const destroy = createLoading();
  const res = await apiList.value(params);
  if (res.status === 200 && res.data.code === 200) {
    const newData = listDataAdapter.value(res.data.rows);
    taskCount.value = res.data.total;

    if (pageNum.value !== 1) {
      // 追加数据
      list.value = [...list.value, ...newData];
    } else {
      list.value = newData;
    }

    if (list.value.length >= res.data.total) {
      finished.value = true;
    }
    loading.value = false;
    await getFinishedCountByTheWay(params);
  }

  destroy();
});

const getFinishedCountByTheWay = async params => {
  const res = await apiList.value({
    ...params,
    patrolStatus: '100',
  });

  if (res.status === 200 && res.data.code === 200) {
    finishCount.value = res.data.total;
  }
};

const handleItemClick = async data => {
  // 转派业务
  if (transIdList.value.length) {
    if (transIdList.value.includes(data.id)) {
      const index = transIdList.value.indexOf(data.id);
      transIdList.value.splice(index, 1);
    } else {
      transIdList.value.push(data.id);
    }
    return;
  }
  // 这里不需要签到
  router.push(`/inspect/checking/${data.id}?type=${tabActive.value}&formType=edit`);
};

const isListEmpty = computed(() => {
  return list.value.length === 0;
});

const showQRButton = computed(() => {
  return tabActive.value === 'regulator';
});

const listContainerStyle = computed(() => {
  return {
    maxHeight: showQRButton.value
      ? 'calc(100% - 114px - 46px - 64px - 32px - 36px )'
      : 'calc(100% - 114px - 46px - 32px - 36px )',
  };
});

const handleConditions = condition => {
  list.value = [];
  finished.value = false;
  resetPage();

  const { keyword, ...otherCondition } = condition;
  // 任务列表月份过滤调整
  otherCondition.patrolDate = otherCondition.beginDate;
  delete otherCondition.beginDate;
  delete otherCondition.endDate;
  getList(keyword, otherCondition);
};

// 导航
const handleNavigation = async data => {
  const { latitude, longitude } = data;

  if (!window.cordova) {
    // 本地环境
    return;
  }

  let addr = '新疆库尔勒市';
  if (tabActive.value === 'regulator') {
    addr += `${data.roadName}${data.regulatorLocation}`;
  }

  if (tabActive.value === 'well') {
    addr += `${data.roadName}${data.valveLocation}`;
  }

  navigateByLocation(latitude, longitude, addr);
};

const transIdList = ref([]);
function handleLongPress(data) {
  // transIdList.value包含id 选中
  // transIdList.value有值，不包含id，半选中
  // transIdList.value.length === 0 ，不选中

  if (transIdList.value.length) {
    return;
  }

  transIdList.value.push(data.id);
}

const showTransDialog = ref(false);
const showPicker = ref(false);

const handleTrans = () => {
  showTransDialog.value = true;
};

const delegatePersonName = ref('');
const delegatePersonId = ref('');

const staffs = ref([]);

function getDeptPersonList() {
  getUserByDeptId(JSON.parse(getUserInfo()).deptId).then(res => {
    staffs.value = res.data.rows.map(item => {
      return {
        text: item.nickName,
        value: item.userId,
      };
    });
  });
}

getDeptPersonList();

const onStaffPickerConfirm = ({ selectedOptions }) => {
  showPicker.value = false;
  delegatePersonName.value = selectedOptions[0].text;
  delegatePersonId.value = selectedOptions[0].value;
};

const apiTrans = computed(() => {
  switch (tabActive.value) {
    case 'regulator':
      return api_regulator.transTaskAnother;
    case 'well':
      return api_well.transTaskAnother;
    case 'pipeline':
      return api_pipeline.transTaskAnother;
    case 'station':
      return api_station.transTaskAnother;
    default:
      return api_regulator.transTaskAnother;
  }
});

const handleClickTransConfirm = async () => {
  const promises = transIdList.value.map(item =>
    apiTrans.value(item, delegatePersonName.value, delegatePersonId.value)
  );

  await Promise.all(promises);
  transIdList.value = [];
  showSuccessToast('操作成功');
  getList();
};

function handleCancel() {
  showConfirmDialog({
    title: '提示',
    message: '数据未保存，确定取消吗？',
  })
    .then(() => {
      transIdList.value = [];
    })
    .catch(() => {
      // on cancel
    });
}
</script>

<template>
  <div class="main-container">
    <div class="tabs-container">
      <type-switcher
        :defaultActive="defaultActive"
        @onActiveChange="handleTabChange"
        ref="tabSwitcherRef"
      />
    </div>

    <!-- 查询和统计 -->
    <div v-if="isListShow" class="search-condition-container">
      <common-search-composition
        timeSearchType="month"
        futureDateDisabled
        @onConditionChanged="handleConditions"
      />
      <div style="margin-top: 8px">
        <task-progress :taskCount="taskCount" :finishCount="finishCount" />
      </div>
    </div>

    <!-- 列表 -->
    <div v-if="isListShow" class="list-container" :style="listContainerStyle">
      <div v-if="loading" class="loading">
        <van-loading size="24" />
      </div>
      <van-empty v-if="isListEmpty" description="暂无数据" />

      <van-list
        v-else
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onNextPageLoad"
        offset="5"
      >
        <task-item
          v-for="item in list"
          :key="item.id"
          :title="item.title"
          :desc="item.desc"
          :data="item"
          :transIdList="transIdList"
          @onItemClick="() => handleItemClick(item)"
          @onNavigation="() => handleNavigation(item)"
          @onLongPress="handleLongPress(item)"
          needNavigation
        />
      </van-list>
    </div>
    <template v-else-if="tabActive === 'pipeline'">
      <form-pipeline v-if="!pipelineId" />
      <FormPipelineModify v-else />
    </template>
    <template v-else-if="tabActive === 'station'">
      <FormStation v-if="!stationId" />
      <FormStationModify v-else />
    </template>

    <div v-if="transIdList.length" class="trans-btn">
      <van-button size="small" type="success" @click="handleCancel">取消</van-button>
      <van-button size="small" type="primary" @click="handleTrans">转派</van-button>
    </div>
    <div v-if="isListShow && showQRButton" class="qr-container">
      <qr-button @onClickQR="handleQRBtnClick" />
    </div>

    <van-dialog
      @confirm="handleClickTransConfirm"
      v-model:show="showTransDialog"
      :confirm-button-disabled="!delegatePersonName"
      title="请输入转派人员姓名"
      show-cancel-button
    >
      <van-cell-group inset>
        <van-field
          is-link
          v-model="delegatePersonName"
          label="姓名"
          readonly
          placeholder="请选择姓名"
          @click="showPicker = true"
        />
      </van-cell-group>
    </van-dialog>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :columns="staffs" @cancel="showPicker = false" @confirm="onStaffPickerConfirm" />
    </van-popup>

    <!-- 管线部分直接就是表单 -->
  </div>
</template>

<style lang="less" scoped>
.main-container {
  height: 100%;
  background-color: #f7fafa;
  position: relative;

  .search-condition-container {
    margin: 10px 24px;
  }
  .list-container {
    overflow-y: scroll;
    // max-height: calc(100% - 95px - 46px );
  }
  .trans-btn {
    position: absolute;
    padding: 12px 16px;
    width: 100%;
    background-color: #fff;
    bottom: 0;
    z-index: 2;
    display: flex;
    justify-content: space-around;

    .van-button {
      border-radius: 17px;
      height: 34px;
      font-size: 14px;
      padding: 0 30px;
    }
  }
  .qr-container {
    width: 100%;
    position: absolute;
    bottom: 0px;
  }
  .loading {
    display: flex;
    justify-content: center;
  }
}
</style>
