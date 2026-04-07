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
          />
        </div>
        <template v-for="item in tabList" :key="item.id">
          <van-tab :title="item.text" :name="item.id" style="height: 100%">
            <div class="content">
              <div class="top-info">
                <span>管线总长度{{ summaryData.sumValue }}km</span>
                <span>{{ lineLengthStr }}</span>
              </div>
              <div class="content-list">
                <PullUpRefresh v-if="startObserve" @loadMore="handleLoadMore">
                  <ul class="pipeline-list">
                    <template v-for="(item, index) in pipelineList" :key="index">
                      <li @click="handleItemClick(item)">
                        <van-row gutter="20">
                          <van-col span="24">
                            <div class="title">管线名称：</div>
                            <div class="cont">{{ item.pipelinename }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">管线编号：</div>
                            <div class="cont">{{ item.pipelineno }}</div>
                          </van-col>
                          <van-col span="24"
                            ><div class="title">长度：</div>
                            <div class="cont">{{ item.managelength }}</div></van-col
                          >
                          <van-col span="24">
                            <div class="title">所属区域：</div>
                            <div class="cont">{{ getValue(item.region, 0) }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">管理班组：</div>
                            <div class="cont">{{ getValue(item.manageteam, 1) }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">管线材质：</div>
                            <div class="cont">{{ getValue(item.material, 2) }}</div>
                          </van-col>
                          <van-col span="24">
                            <div class="title">投运日期：</div>
                            <div class="cont">{{ item.inuseworkdate }}</div>
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
import { getPipeList, getDictType, getSummaryData } from '../../../api/device';
import PullUpRefresh from 'components/pull-up-refresh';
import { watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import { useAliveTab } from '@/hooks/use-alive.js';

const tabList = ref([
  { text: '高压A级', id: 1010 },
  { text: '次高压A级', id: 1020 },
  { text: '中压A级', id: 1030 },
  { text: '低压', id: 1040 },
]);

const active = ref();

useAliveTab(active);

const pipelineList = ref([]);

let pageSize = 20;
let pageNum = 1;
let pipelinetypeid = tabList.value[0].id;
let loadAll = false;

function getData() {
  getPipeList({ pipelinetypeid, pageSize, pageNum }).then(res => {
    console.log(res.data.rows);
    if (pageNum * pageSize >= res.data.total) {
      // 加载完了
      loadAll = true;
    }
    pipelineList.value.push(...res.data.rows);
    startObserve.value = true;
  });
}

// getData();

const dictTypeList = reactive([
  {
    key: 'region_type',
    value: [],
  },
  {
    key: 'manage_team',
    value: [],
  },
  {
    key: 'pipe_line_type',
    value: [],
  },
]);

function getDict() {
  getDictType('region_type').then(res => {
    dictTypeList[0].value = res.data.rows;
  });
  getDictType('manage_team').then(res => {
    dictTypeList[1].value = res.data.rows;
    console.log(res.data.rows);
  });
  getDictType('pipe_line_type').then(res => {
    dictTypeList[2].value = res.data.rows;
  });
}

getDict();

const summaryData = ref({});
getSummaryData().then(res => {
  summaryData.value = res.data.data;
});

function getValue(value, index) {
  return dictTypeList[index].value.find(item => item.dictValue === value)?.dictLabel;
}

// 参数初始化
function initParams() {
  pageNum = 1;
  pageSize = 20;
  startObserve.value = false;
  pipelineList.value = [];
  loadAll = false;
  watchEffect(() => {
    if (!summaryData.value.pipelineClassificationStatisticsVo?.length) {
      return;
    }
    const obj = {
      1010: `高压A级管线${summaryData.value.pipelineClassificationStatisticsVo[0].sumValue}km`,
      1020: `次高压A级管线${summaryData.value.pipelineClassificationStatisticsVo[1].sumValue}km`,
      1030: `庭院${summaryData.value.pipelineClassificationStatisticsVo[2].sumValue}km、市政${summaryData.value.pipelineClassificationStatisticsVo[3].sumValue}km`,
      1040: `低压管线${summaryData.value.pipelineClassificationStatisticsVo[4].sumValue}km`,
    };
    lineLengthStr.value = obj[pipelinetypeid];
  });
}

function tabChange(name) {
  searchValue.value = '';
  pipelinetypeid = name;
  initParams();
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

const lineLengthStr = ref('');

const router = useRouter();

function handleItemClick(item) {
  console.log(item);
  const { dataid } = item;
  router.push(`/device/pipeline-detail?dataId=${dataid}`);
}

// 搜索
const searchValue = ref('');

function handleSearch() {
  const { value } = searchValue;
  if (value) {
    const promises = [
      getPipeList({ pipelinetypeid, pageSize: 10, pageNum: 1, pipelinename: value }),
      getPipeList({ pipelinetypeid, pageSize: 10, pageNum: 1, pipelineno: value }),
    ];
    Promise.all(promises).then(res => {
      initParams();
      loadAll = true;

      //
      const res1L = res[0].data.rows;
      const res2L = res[1].data.rows;
      if (res1L.length && res2L.length) {
        pipelineList.value.push(...(res1L.length > res2L.length ? res2L : res1L));
      } else {
        res.forEach(item => {
          pipelineList.value.push(...item.data.rows);
        });
      }
      startObserve.value = true;
      //
    });
  } else {
    initParams();
    getData();
  }
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
    }

    .van-tabs {
      height: 100%;

      :deep(.van-tabs__content) {
        height: calc(100% - 44px);
        padding: 16px;
        padding-top: 70px;
      }

      :deep(.van-tabs__nav--line) {
        box-sizing: content-box !important;
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

      .top-info {
        height: 60px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 24px;
      }

      .content-list {
        height: calc(100% - 60px);
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
