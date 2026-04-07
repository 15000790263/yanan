<template>
  <div class="progress-plan">
    <!-- 统计 -->
    <div class="stats-section">
      <div
        class="stats-card"
        :class="{ active: activeStatus === '' }"
        @click="handleStatusChange('')"
      >
        <div class="stats-value">{{ stats.all }}</div>
        <div class="stats-label">全部</div>
      </div>
      <div
        class="stats-card"
        :class="{ active: activeStatus === '0' }"
        @click="handleStatusChange('0')"
      >
        <div class="stats-value pending">{{ stats.pending }}</div>
        <div class="stats-label">未开始</div>
      </div>
      <div
        class="stats-card"
        :class="{ active: activeStatus === '1' }"
        @click="handleStatusChange('1')"
      >
        <div class="stats-value">{{ stats.inProgress }}</div>
        <div class="stats-label">进行中</div>
      </div>
      <div
        class="stats-card"
        :class="{ active: activeStatus === '2' }"
        @click="handleStatusChange('2')"
      >
        <div class="stats-value completed">{{ stats.completed }}</div>
        <div class="stats-label">已完成</div>
      </div>
    </div>

    <!-- 列表 -->
    <div class="list-section">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="item in scheduleList"
            :key="item.id"
            class="schedule-card"
            @click="handleViewDetail(item)"
          >
            <div class="card-header">
              <div class="process-name">{{ item.processNo }}</div>
              <van-tag :type="statusTagType[item.status]" size="small">{{
                statusLabel[item.status]
              }}</van-tag>
            </div>
            <div class="card-body">
              <div class="info-row">
                <span class="label">项目：</span>
                <span class="value">{{ item.projectName }}</span>
              </div>
              <div class="info-row">
                <span class="label">标段：</span>
                <span class="value">{{ item.section }}</span>
              </div>
              <div class="info-row">
                <span class="label">工序：</span>
                <span class="value"
                  >{{ item.level1Process }} / {{ item.level2Process }} /
                  {{ item.level3Process }}</span
                >
              </div>
              <div class="info-row">
                <span class="label">计划：</span>
                <span class="value">{{ item.plannedStartDate }} ~ {{ item.plannedEndDate }}</span>
              </div>
              <div class="info-row">
                <span class="label">完成率：</span>
                <span class="value">{{ item.completionRate || 0 }}%</span>
              </div>
            </div>
          </div>
          <van-empty v-if="scheduleList.length === 0 && !loading" description="暂无进度计划" />
        </van-list>
      </van-pull-refresh>
    </div>

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <div class="detail-popup">
        <van-nav-bar title="进度详情" left-arrow @click-left="showDetail = false" />
        <div class="detail-content" v-if="detailData">
          <van-cell-group>
            <van-cell title="项目名称" :value="detailData.projectName" />
            <van-cell title="标段" :value="detailData.section" />
            <van-cell title="工序编号" :value="detailData.processNo" />
            <van-cell
              title="工序"
              :value="`${detailData.level1Process} / ${detailData.level2Process} / ${detailData.level3Process}`"
            />
            <van-cell title="计划开始" :value="detailData.plannedStartDate || '-'" />
            <van-cell title="计划结束" :value="detailData.plannedEndDate || '-'" />
            <van-cell title="实际开始" :value="detailData.actualStartDate || '-'" />
            <van-cell title="实际结束" :value="detailData.actualEndDate || '-'" />
            <van-cell title="累计完成" :value="`${detailData.cumulativeCompletion || 0}%`" />
            <van-cell title="完成率" :value="`${detailData.completionRate || 0}%`" />
            <van-cell title="状态" :value="statusLabel[detailData.status]" />
          </van-cell-group>

          <van-cell-group v-if="detailData.problems">
            <van-cell title="存在问题" :value="detailData.problems" />
          </van-cell-group>

          <van-cell-group v-if="attachmentUrls.length > 0">
            <van-cell title="附件" />
            <div class="attachment-list">
              <van-image
                v-for="(url, idx) in attachmentUrls"
                :key="idx"
                width="80"
                height="80"
                fit="cover"
                :src="url"
                radius="6"
              />
            </div>
          </van-cell-group>
        </div>
        <van-loading v-else-if="!detailData" size="24px" />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { showToast } from 'vant';
import { getScheduleList, getScheduleDetail } from '@/api/schedule';
import { getFileInfo } from '@/api/system';

defineOptions({
  name: 'ProgressPlan',
});

// 统计（写死）
const stats = reactive({
  all: 6,
  pending: 1,
  inProgress: 2,
  completed: 3,
});

// 状态
const activeStatus = ref('');
const statusLabel = { 0: '未开始', 1: '进行中', 2: '已完成' };
const statusTagType = { 0: 'default', 1: 'warning', 2: 'success' };

// 列表数据
const scheduleList = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageNum = ref(1);
const pageSize = 10;

// 详情数据
const showDetail = ref(false);
const detailData = ref(null);
const attachmentUrls = ref([]);

// 获取列表
async function fetchList() {
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize,
    };
    if (activeStatus.value !== '') {
      params.status = activeStatus.value;
    }
    const { data: res } = await getScheduleList(params);
    loading.value = false;
    refreshing.value = false;
    if (res.code === 200) {
      const newList = res.rows || [];
      if (pageNum.value === 1) {
        scheduleList.value = newList;
      } else {
        scheduleList.value.push(...newList);
      }
      if (newList.length < pageSize) {
        finished.value = true;
      }
      pageNum.value++;
    }
  } catch (error) {
    loading.value = false;
    refreshing.value = false;
    showToast('获取失败');
  }
}

// 加载更多
function onLoad() {
  if (finished.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  fetchList();
}

// 刷新
function onRefresh() {
  pageNum.value = 1;
  finished.value = false;
  fetchList();
}

// 切换状态筛选
function handleStatusChange(status) {
  activeStatus.value = status;
  pageNum.value = 1;
  finished.value = false;
  scheduleList.value = [];
  onLoad();
}

// 查看详情
async function handleViewDetail(item) {
  showDetail.value = true;
  detailData.value = null;
  attachmentUrls.value = [];
  try {
    const { data: res } = await getScheduleDetail(item.id);
    if (res.code === 200 && res.data) {
      detailData.value = res.data;
      // 处理附件
      if (res.data.attachment) {
        const fileIds = res.data.attachment.split(',').filter(Boolean);
        const urls = await Promise.all(
          fileIds.map(async id => {
            try {
              const fileRes = await getFileInfo(id);
              return fileRes.data.code === 200 ? fileRes.data.data.url : '';
            } catch {
              return '';
            }
          })
        );
        attachmentUrls.value = urls.filter(Boolean);
      }
    }
  } catch (error) {
    showToast('获取详情失败');
  }
}
</script>

<style scoped lang="less">
.progress-plan {
  min-height: calc(100vh - 46px - 50px);
  background: #f5f5f5;
}

// 统计
.stats-section {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
}

.stats-card {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  border-radius: 8px;
  background: #f5f5f5;

  .stats-value {
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .stats-label {
    font-size: 12px;
    color: #666;
    margin-top: 4px;
  }

  &.active {
    background: #ff6700;
    color: #fff;

    .stats-value,
    .stats-label {
      color: #fff;
    }
  }

  .pending {
    color: #999;
  }

  .completed {
    color: #07c160;
  }
}

// 列表
.list-section {
  padding: 12px 16px;
}

.schedule-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 10px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .process-name {
      font-size: 15px;
      font-weight: 600;
      color: #333;
    }
  }

  .card-body {
    .info-row {
      display: flex;
      font-size: 13px;
      margin-bottom: 6px;

      .label {
        color: #999;
        min-width: 50px;
      }

      .value {
        color: #333;
      }
    }
  }
}

// 详情弹窗
.detail-popup {
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  :deep(.van-nav-bar) {
    flex-shrink: 0;
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;

    .attachment-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 0 16px 16px;
    }
  }
}
</style>
