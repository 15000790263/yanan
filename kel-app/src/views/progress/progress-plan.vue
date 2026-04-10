<template>
  <div class="progress-plan">
    <!-- 统计 -->
    <div class="stats-section">
      <div class="stats-scroll">
        <div
          class="stats-item"
          :class="{ active: activeStatus === '' }"
          @click="handleStatusChange('')"
        >
          <div class="stats-value">{{ stats.all }}</div>
          <div class="stats-label">全部</div>
        </div>
        <div
          class="stats-item"
          :class="{ active: activeStatus === '1' }"
          @click="handleStatusChange('1')"
        >
          <div class="stats-value pending">{{ stats.status1 }}</div>
          <div class="stats-label">未开始</div>
        </div>
        <div
          class="stats-item"
          :class="{ active: activeStatus === '2' }"
          @click="handleStatusChange('2')"
        >
          <div class="stats-value delayed">{{ stats.status2 }}</div>
          <div class="stats-label">延期未开始</div>
        </div>
        <div
          class="stats-item"
          :class="{ active: activeStatus === '3' }"
          @click="handleStatusChange('3')"
        >
          <div class="stats-value in-progress">{{ stats.status3 }}</div>
          <div class="stats-label">进行中</div>
        </div>
        <div
          class="stats-item"
          :class="{ active: activeStatus === '4' }"
          @click="handleStatusChange('4')"
        >
          <div class="stats-value completed">{{ stats.status4 }}</div>
          <div class="stats-label">正常完成</div>
        </div>
        <div
          class="stats-item"
          :class="{ active: activeStatus === '5' }"
          @click="handleStatusChange('5')"
        >
          <div class="stats-value delayed-complete">{{ stats.status5 }}</div>
          <div class="stats-label">延期完成</div>
        </div>
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
            v-for="(item, index) in scheduleList"
            :key="item.id"
            class="schedule-card"
            :class="`status-${item.status}`"
            @click="handleViewDetail(item)"
          >
            <div class="card-status-bar"></div>
            <div class="card-content">
              <div class="card-top">
                <div class="card-index">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="project-name">{{ item.projectName }}</div>
                <div class="status-badge" :class="`badge-${item.status}`">
                  <van-icon :name="statusIcon[item.status]" size="10" />
                  <span>{{ statusLabel[item.status] }}</span>
                </div>
              </div>
              <div class="card-meta">
                <div class="meta-item">
                  <span class="meta-label">标段</span>
                  <span class="meta-value">{{ item.section || '-' }}</span>
                </div>
                <div class="meta-divider"></div>
                <div class="meta-item">
                  <span class="meta-label">工序</span>
                  <span class="meta-value">{{ formatProcess(item) }}</span>
                </div>
              </div>
              <div class="card-timeline">
                <div class="timeline-dates">
                  <div class="date-node start">
                    <div class="node-dot"></div>
                    <div class="node-info">
                      <span class="node-label">计划开始</span>
                      <span class="node-value">{{ item.plannedStartDate || '-' }}</span>
                    </div>
                  </div>
                  <div class="timeline-line"></div>
                  <div class="date-node end">
                    <div class="node-dot"></div>
                    <div class="node-info">
                      <span class="node-label">计划结束</span>
                      <span class="node-value">{{ item.plannedEndDate || '-' }}</span>
                    </div>
                  </div>
                </div>
                <div class="timeline-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: (item.completionRate || 0) + '%' }"
                    ></div>
                    <div
                      class="progress-glow"
                      :style="{ left: (item.completionRate || 0) + '%' }"
                    ></div>
                  </div>
                  <div class="progress-info">
                    <van-icon name="chart-trending-o" size="12" class="progress-icon" />
                    <span class="progress-text">{{ item.completionRate || 0 }}%</span>
                  </div>
                </div>
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
        <van-nav-bar :title="detailData?.projectName || '进度详情'" left-arrow @click-left="showDetail = false" />
        <div class="detail-content" v-if="detailData">
          <!-- 状态头卡 -->
          <div class="detail-header" :class="`header-${detailData.status}`">
            <div class="header-left">
              <div class="header-status" :class="`badge-${detailData.status}`">
                <van-icon :name="statusIcon[detailData.status]" size="14" />
                <span>{{ statusLabel[detailData.status] }}</span>
              </div>
              <div class="header-project">{{ detailData.projectName }}</div>
            </div>
            <div class="header-metrics">
              <div class="metric-card primary">
                <div class="metric-value">{{ detailData.completionRate || 0 }}<span class="metric-unit">%</span></div>
                <div class="metric-label">完成率</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">{{ detailData.cumulativeCompletion || 0 }}<span class="metric-unit">%</span></div>
                <div class="metric-label">累计完成</div>
              </div>
            </div>
          </div>

          <!-- 进度条 -->
          <div class="detail-progress-card">
            <div class="progress-header">
              <span class="progress-title">进度</span>
              <span class="progress-value" :style="{ color: getStatusColor(detailData.status) }">{{ detailData.completionRate || 0 }}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :class="`fill-${detailData.status}`" :style="{ width: (detailData.completionRate || 0) + '%' }"></div>
            </div>
          </div>

          <!-- 时间轴 -->
          <div class="detail-section">
            <div class="section-title">
              <van-icon name="clock-o" size="14" />
              <span>时间安排</span>
            </div>
            <div class="timeline-card">
              <div class="timeline-row">
                <div class="time-col planned">
                  <div class="time-label">
                    <van-icon name="calendar-o" size="12" />
                    <span>计划开始</span>
                  </div>
                  <div class="time-value">{{ detailData.plannedStartDate || '-' }}</div>
                </div>
                <div class="time-arrow">
                  <van-icon name="arrow" size="12" color="#d0d0d0" />
                </div>
                <div class="time-col planned">
                  <div class="time-label">
                    <van-icon name="calendar-o" size="12" />
                    <span>计划结束</span>
                  </div>
                  <div class="time-value">{{ detailData.plannedEndDate || '-' }}</div>
                </div>
              </div>
              <div class="timeline-row" v-if="detailData.actualStartDate || detailData.actualEndDate">
                <div class="time-col actual">
                  <div class="time-label">
                    <van-icon name="todo-o" size="12" />
                    <span>实际开始</span>
                  </div>
                  <div class="time-value">{{ detailData.actualStartDate || '-' }}</div>
                </div>
                <div class="time-arrow">
                  <van-icon name="arrow" size="12" color="#d0d0d0" />
                </div>
                <div class="time-col actual">
                  <div class="time-label">
                    <van-icon name="todo-o" size="12" />
                    <span>实际结束</span>
                  </div>
                  <div class="time-value">{{ detailData.actualEndDate || '-' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-title">
              <van-icon name="info-o" size="14" />
              <span>基本信息</span>
            </div>
            <div class="info-grid">
              <div class="info-item" v-if="detailData.section">
                <div class="info-label">标段</div>
                <div class="info-value">{{ detailData.section }}</div>
              </div>
              <div class="info-item" v-if="detailData.processNo">
                <div class="info-label">工序编号</div>
                <div class="info-value">{{ detailData.processNo }}</div>
              </div>
              <div class="info-item full">
                <div class="info-label">工序</div>
                <div class="info-value">{{ formatProcess(detailData) }}</div>
              </div>
            </div>
          </div>

          <!-- 存在问题 -->
          <div class="detail-section" v-if="detailData.problems">
            <div class="section-title danger">
              <van-icon name="warning-o" size="14" />
              <span>存在问题</span>
            </div>
            <div class="problem-card">
              <div class="problem-text">{{ detailData.problems }}</div>
            </div>
          </div>

          <!-- 附件 -->
          <div class="detail-section" v-if="attachmentUrls.length > 0">
            <div class="section-title">
              <van-icon name="photograph-o" size="14" />
              <span>附件 ({{ attachmentUrls.length }})</span>
            </div>
            <div class="attachment-grid">
              <van-image
                v-for="(url, idx) in attachmentUrls"
                :key="idx"
                width="90"
                height="90"
                fit="cover"
                :src="url"
                radius="10"
                class="attachment-img"
              />
            </div>
          </div>
        </div>
        <van-loading v-else-if="!detailData" size="24px" />
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { showToast } from 'vant';
import { getScheduleList, getScheduleDetail, getScheduleStats } from '@/api/schedule';
import { getFileInfo } from '@/api/system';

defineOptions({
  name: 'ProgressPlan',
});

// 统计
const stats = reactive({
  all: 0,
  status1: 0,
  status2: 0,
  status3: 0,
  status4: 0,
  status5: 0,
});

// 状态
const activeStatus = ref('');
const statusLabel = { 1: '未开始', 2: '延期未开始', 3: '进行中', 4: '正常完成', 5: '延期完成' };
const statusIcon = { 1: 'clock-o', 2: 'warning-o', 3: 'play-circle-o', 4: 'checked', 5: 'underway-o' };
const statusColor = { 1: '#999', 2: '#f44', 3: '#ff9800', 4: '#07c160', 5: '#f44' };
function getStatusColor(status) { return statusColor[status] || '#999'; }

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

// 格式化工序显示
function formatProcess(data) {
  const parts = [];
  if (data.level1Process) parts.push(data.level1Process);
  if (data.level2Process) parts.push(data.level2Process);
  if (data.level3Process) parts.push(data.level3Process);
  return parts.length > 0 ? parts.join(' / ') : '-';
}

// 获取统计
async function fetchStats() {
  try {
    const { data: res } = await getScheduleStats();
    if (res.code === 200 && res.data) {
      const d = res.data;
      stats.all = d.total || 0;
      stats.status1 = d.status1 || 0;
      stats.status2 = d.status2 || 0;
      stats.status3 = d.status3 || 0;
      stats.status4 = d.status4 || 0;
      stats.status5 = d.status5 || 0;
    }
  } catch (error) {
    // ignore
  }
}

fetchStats();

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
  loading.value = true;
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
  height: calc(100vh - 46px);
  background: #f5f5f5;
}

// 统计
.stats-section {
  padding: 12px 16px 8px;
  background: #fff;
}

.stats-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
}

.stats-item {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;

  .stats-value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    color: #333;
  }

  .stats-label {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
    white-space: nowrap;
  }

  &.active {
    background: #ff6700;

    .stats-value,
    .stats-label {
      color: #fff;
    }
  }

  .pending {
    color: #999;
  }

  .in-progress {
    color: #ff9800;
  }

  .delayed {
    color: #f44;
  }

  .completed {
    color: #07c160;
  }

  .delayed-complete {
    color: #f44;
  }
}

// 列表
.list-section {
  padding: 14px 16px 16px;
  height: calc(100% - 110px);
  overflow-y: auto;
}

.schedule-card {
  position: relative;
  display: flex;
  background: #fff;
  border-radius: 14px;
  margin-bottom: 14px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: scale(0.985);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  // 左侧状态色条
  .card-status-bar {
    width: 5px;
    flex-shrink: 0;
    background: #d9d9d9;
  }

  &.status-1 .card-status-bar { background: linear-gradient(180deg, #d9d9d9, #c0c0c0); }
  &.status-2 .card-status-bar { background: linear-gradient(180deg, #f44, #d93030); }
  &.status-3 .card-status-bar { background: linear-gradient(180deg, #ff9800, #f08800); }
  &.status-4 .card-status-bar { background: linear-gradient(180deg, #07c160, #05a050); }
  &.status-5 .card-status-bar { background: linear-gradient(180deg, #ff6b6b, #f44); }

  .card-content {
    flex: 1;
    padding: 14px 14px 12px;
    min-width: 0;
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 10px;
  }

  // 序号角标
  .card-index {
    width: 22px;
    height: 22px;
    background: #f0f0f0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: #999;
    flex-shrink: 0;
    margin-top: 1px;
    font-family: 'Courier New', monospace;
  }

  .project-name {
    font-size: 15px;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.4;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  // 状态徽章
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;

    &.badge-1 {
      background: #f5f5f5;
      color: #999;
    }
    &.badge-2 {
      background: #fff0f0;
      color: #f44;
    }
    &.badge-3 {
      background: #fff8e6;
      color: #ff9800;
    }
    &.badge-4 {
      background: #e8fdf0;
      color: #07c160;
    }
    &.badge-5 {
      background: #fff0f0;
      color: #f44;
    }
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding: 8px 10px;
    background: linear-gradient(135deg, #fafafa, #f3f3f3);
    border-radius: 8px;
    border: 1px solid #f0f0f0;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .meta-label {
    font-size: 10px;
    color: #b0b0b0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .meta-value {
    font-size: 12px;
    color: #333;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .meta-divider {
    width: 1px;
    height: 28px;
    background: linear-gradient(180deg, transparent, #e5e5e5, transparent);
    flex-shrink: 0;
  }

  // 时间轴
  .card-timeline {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .timeline-dates {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .date-node {
    display: flex;
    align-items: center;
    gap: 5px;

    &.start { flex: 1; }
    &.end { flex: 1; justify-content: flex-end; }
  }

  .node-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #d9d9d9;
    flex-shrink: 0;
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px #d9d9d9;
  }

  .status-2 & .node-dot { background: #f44; box-shadow: 0 0 0 1px #f44; }
  .status-3 & .node-dot { background: #ff9800; box-shadow: 0 0 0 1px #ff9800; }
  .status-4 & .node-dot { background: #07c160; box-shadow: 0 0 0 1px #07c160; }
  .status-5 & .node-dot { background: #f44; box-shadow: 0 0 0 1px #f44; }

  .node-info {
    display: flex;
    flex-direction: column;
  }

  .start .node-info { align-items: flex-start; }
  .end .node-info { align-items: flex-end; }

  .node-label {
    font-size: 9px;
    color: #c0c0c0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
  }

  .node-value {
    font-size: 11px;
    color: #666;
    font-weight: 500;
    font-family: 'Courier New', monospace;
  }

  .timeline-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, #e5e5e5, #d0d0d0, #e5e5e5);
    margin: 0 6px;
    position: relative;
    top: -3px;
  }

  // 进度条
  .timeline-progress {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .progress-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .progress-bar {
    flex: 1;
    height: 7px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: visible;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, #ff9800, #ff6700);
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
  }

  .progress-glow {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 12px;
    height: 12px;
    background: #ff6700;
    border-radius: 50%;
    box-shadow: 0 0 8px 2px rgba(255, 103, 0, 0.5);
    transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &.status-4 .progress-fill {
    background: linear-gradient(90deg, #07c160, #05c160);
  }

  &.status-4 .progress-glow {
    background: #07c160;
    box-shadow: 0 0 8px 2px rgba(7, 193, 96, 0.5);
  }

  &.status-5 .progress-fill {
    background: linear-gradient(90deg, #f44, #e03030);
  }

  &.status-5 .progress-glow {
    background: #f44;
    box-shadow: 0 0 8px 2px rgba(255, 68, 68, 0.5);
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
  }

  .progress-icon {
    color: #ff6700;
  }

  .progress-text {
    font-size: 13px;
    font-weight: 700;
    color: #ff6700;
    min-width: 38px;
    text-align: right;
    font-family: 'Courier New', monospace;
  }

  &.status-4 .progress-text,
  &.status-4 .progress-icon {
    color: #07c160;
  }

  &.status-5 .progress-text,
  &.status-5 .progress-icon {
    color: #f44;
  }
}

// 详情弹窗
.detail-popup {
  height: 100%;
  background: #f2f2f2;
  display: flex;
  flex-direction: column;

  :deep(.van-nav-bar) {
    flex-shrink: 0;
    background: #fff;
  }

  :deep(.van-nav-bar__title) {
    font-weight: 600;
    color: #1a1a1a;
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 14px 16px 24px;
  }
}

// 状态头卡
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 5px solid #d9d9d9;

  &.header-1 { border-left-color: #d9d9d9; }
  &.header-2 { border-left-color: #f44; }
  &.header-3 { border-left-color: #ff9800; }
  &.header-4 { border-left-color: #07c160; }
  &.header-5 { border-left-color: #f44; }

  .header-left {
    flex: 1;
    min-width: 0;
    margin-right: 12px;
  }

  .header-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 8px;

    &.badge-1 { background: #f5f5f5; color: #999; }
    &.badge-2 { background: #fff0f0; color: #f44; }
    &.badge-3 { background: #fff8e6; color: #ff9800; }
    &.badge-4 { background: #e8fdf0; color: #07c160; }
    &.badge-5 { background: #fff0f0; color: #f44; }
  }

  .header-project {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.4;
  }

  .header-metrics {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .metric-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 64px;
    padding: 8px 10px;
    background: #f7f7f7;
    border-radius: 10px;

    .metric-value {
      font-size: 22px;
      font-weight: 800;
      color: #333;
      line-height: 1;
      font-family: 'Courier New', monospace;
    }

    .metric-unit {
      font-size: 13px;
      font-weight: 600;
    }

    .metric-label {
      font-size: 10px;
      color: #b0b0b0;
      margin-top: 3px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 600;
    }

    &.primary {
      background: linear-gradient(135deg, #fff8e6, #fff3d6);
      border: 1px solid #ffe0a0;

      .metric-value {
        color: #ff9800;
      }
    }
  }
}

// 进度卡
.detail-progress-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .progress-title {
    font-size: 13px;
    font-weight: 600;
    color: #666;
  }

  .progress-value {
    font-size: 18px;
    font-weight: 800;
    font-family: 'Courier New', monospace;
  }

  .progress-track {
    height: 10px;
    background: #f0f0f0;
    border-radius: 5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.5s ease;

    &.fill-1 { background: linear-gradient(90deg, #d9d9d9, #c0c0c0); }
    &.fill-2 { background: linear-gradient(90deg, #f44, #e03030); }
    &.fill-3 { background: linear-gradient(90deg, #ff9800, #ff6700); }
    &.fill-4 { background: linear-gradient(90deg, #07c160, #05a050); }
    &.fill-5 { background: linear-gradient(90deg, #f44, #e03030); }
  }
}

// 详情通用区块
.detail-section {
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: #666;
  margin-bottom: 8px;
  padding: 0 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.danger {
    color: #f44;
  }
}

// 时间轴卡片
.timeline-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .timeline-row {
    display: flex;
    align-items: center;

    & + .timeline-row {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed #f0f0f0;
    }
  }

  .time-col {
    flex: 1;
  }

  .time-arrow {
    padding: 0 8px;
  }

  .time-label {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: #b0b0b0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .time-value {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    font-family: 'Courier New', monospace;
  }

  .planned .time-value {
    color: #333;
  }

  .actual .time-value {
    color: #ff9800;
  }
}

// 信息网格
.info-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .info-item {
    width: calc(50% - 4px);

    &.full {
      width: 100%;
    }

    .info-label {
      font-size: 10px;
      color: #b0b0b0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 13px;
      color: #333;
      font-weight: 500;
      line-height: 1.4;
    }
  }
}

// 问题卡片
.problem-card {
  background: #fff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-left: 4px solid #f44;

  .problem-text {
    font-size: 13px;
    color: #666;
    line-height: 1.6;
  }
}

// 附件网格
.attachment-grid {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .attachment-img {
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
}
</style>
