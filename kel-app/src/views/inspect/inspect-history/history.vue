<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api_regulator, api_well, api_pipeline, api_station, api_yinbao } from '@/api/inspect';
import {
  list_regulator_adapter,
  list_well_adapter,
  list_pipeline_adapter,
  list_station_adapter,
  list_yinbao_adapter,
} from '../util/dataAdapter';
import { getMonthRange } from '../util/time';
import TypeSwitcher from '../components/type-switcher2/index.vue';
import CommonSearchComposition from '../components/common-search-composition/index.vue';
import TaskItem from '../components/task-item2/index.vue';
import StatisticInfo from '../components/statistic-info/index';
import { usePage } from '../hooks/usePage';
import { navigateByLocation } from '../../../utils/cordova-tools';

const router = useRouter();

const defaultTimeRange = getMonthRange();

const defaultActive = 'pipeline';
const tabSwitcherRef = ref();
const tabActive = ref(defaultActive);
const list = ref([]);
const loading = ref(false);
const finished = ref(false);
const conditionRef = ref({});

const keyword = ref('');

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
    case 'yinbao':
      return api_yinbao.getList;
    default:
      return api_regulator.getList;
  }
});

const apiStatistic = computed(() => {
  switch (tabActive.value) {
    case 'regulator':
      return api_regulator.getStatistic;
    case 'well':
      return api_well.getStatistic;
    case 'pipeline':
      return api_pipeline.getStatistic;
    case 'station':
      return api_station.getStatistic;
    case 'yinbao':
      return api_yinbao.getStatistic;
    default:
      return api_regulator.getStatistic;
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
    case 'station':
      return list_station_adapter;
    case 'yinbao':
      return list_yinbao_adapter;
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
      return { pipelineName: keyword };
    case 'station':
      return { stationName: keyword };
    case 'yinbao':
      return { potentNumber: keyword };
    default:
      return list_regulator_adapter;
  }
};

// const api_regulator = "http://60.13.219.226:30001/safe/valveplan/list?pageSize=10&pageNum=1"

const onNextPageLoad = async () => {
  if (isKeywordSearching.value) return;

  loading.value = true;
  await addPage();

  // 滚动加载，数据会重置，需要添加conditionRef.value
  await getList(undefined, { ...conditionRef.value }).catch(() => {
    loading.value = false;
  });
  loading.value = false;
};

const commonSearch = ref(null);
const showCommonSearch = ref(true);
const showStatistic = ref(true);

const handleTabChange = async type => {
  // 重置common-search组件和statistic-info组件
  showCommonSearch.value = false;
  showStatistic.value = false;
  await nextTick();
  showCommonSearch.value = true;
  showStatistic.value = true;

  // 重置之后会有参数残留，需要清除，但是要保留patrolStatus
  conditionRef.value = { patrolStatus: conditionRef.value.patrolStatus };

  tabActive.value = type;
  hasInitStatisticValue.value = false;

  // page重置的部分在hooks里面做了
  list.value = [];
  finished.value = false;
  resetPage();
  getList();
  getStatistic();
};

onMounted(() => {
  getList();
  getStatistic();
  checkDetailType();
});

const checkDetailType = () => {
  const detailType = localStorage.getItem('detailType');
  if (detailType) {
    setTimeout(() => {
      tabSwitcherRef?.value?.setActive(detailType);
    }, 300);
  }
  localStorage.removeItem('detailType');
};

const addEndDatePlusOne = dateStr => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

// 每次查询结果total字段的数据
// const allStateTotal = ref(0);

const getList = async (keyword, conditions) => {
  loading.value = true;
  conditionRef.value = { patrolStatus: '100' }; // 0 未巡检 1 正常 2 异常 100 已巡检

  const basicParams = {
    beginDate: defaultTimeRange.before,
    endDate: addEndDatePlusOne(defaultTimeRange.end),
    ...conditionRef.value,
  };

  let params = {
    ...basicParams,
    ...conditionRef.value,
    pageNum: pageNum.value,
    pageSize: pageSize.value,
  };

  if (keyword) {
    params = {
      ...basicParams,
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
    };
  }

  const res = await apiList.value(params).catch(() => {
    loading.value = false;
  });
  if (res.status === 200 && res.data.code === 200) {
    const newData = listDataAdapter.value(res.data.rows);
    if (pageNum.value !== 1) {
      // 追加数据
      list.value = [...list.value, ...newData];
    } else {
      list.value = newData;
    }

    if (list.value.length === res.data.total) {
      finished.value = true;
    }

    loading.value = false;
  }
};

// 切换正常异常
const handleViewStateSelected = type => {
  let condition = {
    patrolStatus: 100,
  };
  if (type === 'all') {
    condition = {
      patrolStatus: 100,
    };
  } else if (type === 'ok') {
    condition = {
      patrolStatus: 1,
    };
  } else {
    condition = {
      patrolStatus: 2,
    };
  }

  hasInitStatisticValue.value = false;
  // page重置的部分在hooks里面做了
  list.value = [];
  finished.value = false;
  getList(undefined, { ...conditionRef.value, ...condition });

  // 这样写会导致参数异常问题，特别是分页加载多页数据时
  // 改成上面和切换调压箱(柜)/阀井相同逻辑会好些
  // getList(undefined, { ...conditionRef.value, ...condition });
};

const handleItemClick = data => {
  console.log(data);
  router.push(`/inspect/checking/${data.id}?type=${tabActive.value}&formType=show`);
};

const isListEmpty = computed(() => {
  return list.value.length === 0;
});

const statisticValue = ref({});

const hasInitStatisticValue = ref(false);

const handleConditions = condition => {
  list.value = [];
  finished.value = false;
  resetPage();

  const { keyword, ...otherCondition } = condition;

  getList(keyword, { ...conditionRef.value, ...otherCondition });
  // 下面写法在根据距离过滤数据时会报错
  // getStatistic(condition);
  // 改为下面写法，但是会有点问题，比如附近500米没有已巡检设备，但是上面的数字还在（问题不可避免）
  // getStatistic({ beginDate: condition.beginDate, endDate: condition.endDate });

  hasInitStatisticValue.value = false;
  getStatistic(condition);
};

// 这里也是为了解决上面问题
// watch(list, value => {
//   if (!value.length) {
//     statisticValue.value = {
//       okCount: 0,
//       errCount: 0,
//       totalCount: 0,
//     };
//   }
// });

const getStatistic = async (condition = {}) => {
  if (hasInitStatisticValue.value) return;

  const res = await apiStatistic.value(condition);

  if (res && res.status === 200 && res.data.code === 200) {
    if (res.data.data.length === 0) {
      statisticValue.value = {
        okCount: 0,
        errCount: 0,
        totalCount: 0,
      };
    }

    let okNum = 0;
    let errNum = 0;
    res.data.data.forEach(({ patrol_status, numb }) => {
      if (+patrol_status === 1) {
        okNum = numb;
      }
      if (+patrol_status === 2) {
        errNum = numb;
      }
    });

    statisticValue.value = {
      okCount: okNum,
      errCount: errNum,
      totalCount: errNum + okNum,
    };

    hasInitStatisticValue.value = true;
  }
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

  // if (tabActive.value === 'pipeline') {
  //   addr += `${data.roadName}${data.regulatorLocation}`
  // }
  // const { roadName, regulatorLocation } = data

  navigateByLocation(latitude, longitude, addr);
};
</script>

<template>
  <div class="main-container">
    <div class="tabs-container">
      <type-switcher
        bgTransparent
        :defaultActive="defaultActive"
        @onActiveChange="handleTabChange"
        ref="tabSwitcherRef"
      />
    </div>

    <div class="statistic-container">
      <statistic-info
        v-if="showStatistic"
        :statisticValue="statisticValue"
        @onViewStateSelected="handleViewStateSelected"
      />
      <!-- :allStateTotal="allStateTotal" -->
    </div>
    <div class="search-condition-container">
      <common-search-composition
        ref="commonSearch"
        v-if="showCommonSearch"
        futureDateDisabled
        :showLeft="tabActive !== 'pipeline' && tabActive !== 'station'"
        :placeholder="
          tabActive === 'pipeline'
            ? '请输入管线名称'
            : tabActive === 'station'
              ? '请输入调压站名称'
              : void 0
        "
        @onConditionChanged="handleConditions"
      />
    </div>

    <!-- <history-search :type="tabActive" @onConditionSearch="handleConditionSearch" /> -->

    <!-- <div class="search-container">
      <task-search 
        @onSearch="handleSearch" 
        @onSearchClear="handleSearchClear"
      />
    </div> -->

    <div class="list-container">
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
          :type="tabActive"
          :needNavigation="tabActive !== 'pipeline' && tabActive !== 'station'"
          showStatus
          @onItemClick="() => handleItemClick(item)"
          @onNavigation="() => handleNavigation(item)"
        />
      </van-list>
    </div>
    <!--     
    <div class="qr-container">
      <qr-button @onClickQR="handleQRBtnClick" />
    </div> -->
  </div>
</template>

<style lang="less" scoped>
.main-container {
  height: 100%;
  background-color: #f7fafa;
  position: relative;

  .tabs-container {
    background-color: white;
    box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);
  }

  .statistic-container {
    margin-bottom: 10px;
  }
  .search-condition-container {
    margin: 0px 24px;
    margin-bottom: 4px;
  }
  .search-container {
    display: flex;
    justify-content: center;
  }
  .list-container {
    overflow-y: scroll;
    max-height: calc(100% - 114px - 68px - 64px);
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
