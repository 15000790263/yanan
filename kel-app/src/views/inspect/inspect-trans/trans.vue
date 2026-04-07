<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { api_regulator, api_well, api_pipeline, api_yinbao } from '@/api/inspect';
import {
  list_regulator_adapter,
  list_well_adapter,
  list_pipeline_adapter,
  list_yinbao_adapter,
} from '../util/dataAdapter';

// import TaskSearch from '../components/task-search/index.vue'
import TypeSwitcher from '../components/type-switcher2/index.vue';
// import QrButton from '../components/qr-code-btn/index.vue'
import TransItem from '../components/trans-item/index.vue';
import { usePage } from '../hooks/usePage';

const router = useRouter();

const defaultActive = 'regulator';
const tabActive = ref(defaultActive);
const list = ref([]);
const loading = ref(false);
const finished = ref(false);

const keyword = ref('');

const isKeywordSearching = computed(() => {
  return !!keyword.value;
});

const { pageNum, pageSize, addPage, getOnKeyWordPage } = usePage(tabActive);

const apiList = computed(() => {
  switch (tabActive.value) {
    case 'regulator':
      return api_regulator.getList;
    case 'well':
      return api_well.getList;
    case 'pipeline':
      return api_pipeline.getList;
    case 'yinbao':
      return api_yinbao.getList;
    default:
      return api_regulator.getList;
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
      return { pipelineNo: keyword };
    default:
      return list_regulator_adapter;
  }
};

// const api_regulator = "http://60.13.219.226:30001/safe/valveplan/list?pageSize=10&pageNum=1"

const onNextPageLoad = async () => {
  if (isKeywordSearching.value) return;

  loading.value = true;
  console.log('on load...');
  await addPage();
  await getList();
  loading.value = false;
};

const handleTabChange = type => {
  console.log(type);
  tabActive.value = type;
  // page重置的部分在hooks里面做了
  list.value = [];
  finished.value = false;
  getList();
};

onMounted(() => {
  getList();
});

const getList = async keyword => {
  console.log('isKeywordSearching.value::', isKeywordSearching.value);
  const basicParams = {
    delegateStatus: '1', // 转派
    patrolStatus: '0', // 未查询
  };

  let params = {
    ...basicParams,
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
  const res = await apiList.value(params);
  if (res.status === 200 && res.data.code === 200) {
    const newData = listDataAdapter.value(res.data.rows);
    if (!isKeywordSearching.value) {
      // 不是关键字搜索 // 追加数据
      list.value = [...list.value, ...newData];
    } else {
      list.value = newData;
    }

    if (list.value.length === res.data.total) {
      finished.value = true;
    }
  }
};

const handleItemClick = data => {
  router.push(`/inspect/checking/${data.id}?type=${tabActive.value}&formType=edit`);
};

const isListEmpty = computed(() => {
  return list.value.length === 0;
});
</script>

<template>
  <div class="main-container">
    <div class="tabs-container">
      <type-switcher
        :defaultActive="defaultActive"
        @onActiveChange="handleTabChange"
        withoutTrans
      />
    </div>

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
        <trans-item
          v-for="item in list"
          :key="item.id"
          :title="item.title"
          :desc="item.desc"
          :data="item"
          isTransItem
          @onItemClick="() => handleItemClick(item)"
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

  .search-container {
    display: flex;
    margin-top: 8px;
    justify-content: center;
  }
  .list-container {
    overflow-y: scroll;
    max-height: calc(100% - 95px);
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
