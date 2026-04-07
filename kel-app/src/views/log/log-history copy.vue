<template>
  <div class="log-history">
    <!-- 时间筛选 -->
    <div class="time-filter">
      <van-tabs v-model:active="activeTab" @change="handleTabChange">
        <van-tab title="全部" name="all" />
        <van-tab title="今日" name="today" />
        <van-tab title="本周" name="week" />
        <van-tab title="本月" name="month" />
      </van-tabs>
      <div class="date-range" @click="showDatePicker = true">
        <span>{{ dateRangeText }}</span>
        <van-icon name="arrow-down" />
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stats-card">
        <div class="stats-value">{{ stats.total }}</div>
        <div class="stats-label">提交总数</div>
      </div>
      <div class="stats-card highlight">
        <div class="stats-value">{{ stats.pending }}</div>
        <div class="stats-label">待审核</div>
      </div>
      <div class="stats-card success">
        <div class="stats-value">{{ stats.approved }}</div>
        <div class="stats-label">已通过</div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="log-list">
      <div
        v-for="(log, index) in filteredLogs"
        :key="log.id"
        class="log-card"
        @click="handleViewDetail(log)"
      >
        <div class="log-header">
          <div class="log-date-badge">
            <span class="day">{{ formatDay(log.date) }}</span>
            <span class="month">{{ formatMonth(log.date) }}</span>
          </div>
          <div class="log-info">
            <div class="log-title">{{ log.title }}</div>
            <div class="log-meta">
              <span class="meta-item">
                <van-icon name="user-o" />
                {{ log.recorder }}
              </span>
              <span class="meta-item">
                <van-icon name="clock-o" />
                {{ log.time }}
              </span>
            </div>
          </div>
          <div class="log-status">
            <van-tag :type="statusType[log.status]" size="medium">
              {{ statusText[log.status] }}
            </van-tag>
          </div>
        </div>

        <div class="log-summary">
          <div class="summary-item">
            <span class="label">施工工序</span>
            <span class="value">{{ log.processCount }}项</span>
          </div>
          <div class="summary-item">
            <span class="label">完成进度</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: log.progress + '%' }"></div>
            </div>
            <span class="value">{{ log.progress }}%</span>
          </div>
          <div v-if="log.problem" class="summary-item problem">
            <span class="label">存在问题</span>
            <span class="value text-warning">{{ log.problem }}</span>
          </div>
        </div>

        <div class="log-footer">
          <van-button size="small" type="primary" plain hairline @click.stop="handleEdit(log)">
            编辑
          </van-button>
          <van-button size="small" type="info" plain hairline @click.stop="handleShare(log)">
            分享
          </van-button>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <van-loading size="20px">加载中...</van-loading>
      </div>

      <!-- 空状态 -->
      <van-empty
        v-if="filteredLogs.length === 0"
        description="暂无历史记录"
        image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
      />
    </div>

    <!-- 日期范围选择弹窗 -->
    <van-popup v-model:show="showDatePicker" position="bottom" round>
      <van-calendar
        v-model:show="showDatePicker"
        type="range"
        :default-value="dateRange"
        @confirm="handleDateConfirm"
      />
    </van-popup>

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <div class="detail-popup">
        <van-nav-bar title="日志详情" left-arrow @click-left="showDetail = false" />
        <div class="detail-content" v-if="currentLog">
          <div class="detail-header">
            <h2>{{ currentLog.title }}</h2>
            <van-tag :type="statusType[currentLog.status]" size="large">
              {{ statusText[currentLog.status] }}
            </van-tag>
          </div>

          <div class="detail-section">
            <h3>基本信息</h3>
            <van-cell-group inset>
              <van-cell title="记录人" :value="currentLog.recorder" />
              <van-cell title="提交时间" :value="currentLog.date + ' ' + currentLog.time" />
              <van-cell title="天气情况" :value="currentLog.weather || '晴'" />
            </van-cell-group>
          </div>

          <div class="detail-section">
            <h3>施工内容</h3>
            <div class="process-list">
              <div v-for="(p, i) in currentLog.processes" :key="i" class="process-item">
                <div class="process-name">{{ p.name }}</div>
                <div class="process-content">{{ p.completedContent || '无' }}</div>
                <div class="process-progress">进度: {{ p.progress || 0 }}%</div>
              </div>
            </div>
          </div>

          <div v-if="currentLog.problem" class="detail-section">
            <h3>存在问题</h3>
            <div class="problem-info">
              {{ currentLog.problem }}
            </div>
          </div>

          <div class="detail-section">
            <h3>明日计划</h3>
            <div class="plan-info">
              {{ currentLog.tomorrowPlan || '无' }}
            </div>
          </div>

          <div v-if="currentLog.attachments" class="detail-section">
            <h3>附件</h3>
            <div class="attachment-list">
              <div v-for="(att, i) in currentLog.attachments" :key="i" class="attachment-item">
                <van-image width="60" height="60" fit="cover" :src="att" radius="8" />
              </div>
            </div>
          </div>

          <div v-if="currentLog.reviewer" class="detail-section">
            <h3>审核信息</h3>
            <van-cell-group inset>
              <van-cell title="审核人" :value="currentLog.reviewer" />
              <van-cell title="审核时间" :value="currentLog.reviewTime" />
              <van-cell title="审核意见" :value="currentLog.reviewComment || '无'" />
            </van-cell-group>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { showToast, showConfirmDialog } from 'vant';

defineOptions({
  name: 'LogHistory',
});

// 时间筛选
const activeTab = ref('all');
const showDatePicker = ref(false);
const dateRange = ref([new Date(), new Date()]);

const dateRangeText = computed(() => {
  return '选择日期范围';
});

// 状态映射
const statusText = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};
const statusType = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

// 统计数据
const stats = reactive({
  total: 28,
  pending: 5,
  approved: 23,
});

// 日志列表
const logList = ref([
  {
    id: 1,
    title: '施工日志 - 2026年3月25日',
    date: '2026-03-25',
    time: '18:30',
    recorder: '张三',
    processCount: 3,
    progress: 75,
    problem: '',
    status: 'approved',
    weather: '晴',
    processes: [
      { name: '施工前准备阶段', completedContent: '完成设备进场', progress: 100 },
      { name: '临建配套', completedContent: '完成临时设施搭建', progress: 80 },
    ],
    tomorrowPlan: '继续进行罐区基础施工',
    attachments: [],
    reviewer: '李四',
    reviewTime: '2026-03-26 09:00',
    reviewComment: '符合要求',
  },
  {
    id: 2,
    title: '施工日志 - 2026年3月24日',
    date: '2026-03-24',
    time: '18:15',
    recorder: '张三',
    processCount: 2,
    progress: 60,
    problem: '材料供应延迟',
    status: 'approved',
    weather: '多云',
    processes: [{ name: '基础土方开挖', completedContent: '完成30%', progress: 60 }],
    tomorrowPlan: '加快材料调配',
    attachments: [],
    reviewer: '李四',
    reviewTime: '2026-03-25 09:30',
    reviewComment: '',
  },
  {
    id: 3,
    title: '施工日志 - 2026年3月23日',
    date: '2026-03-23',
    time: '18:45',
    recorder: '王五',
    processCount: 4,
    progress: 100,
    problem: '',
    status: 'pending',
    weather: '晴',
    processes: [
      { name: '通水', completedContent: '完成', progress: 100 },
      { name: '通电', completedContent: '完成', progress: 100 },
    ],
    tomorrowPlan: '准备进行下阶段工作',
    attachments: [],
    reviewer: '',
    reviewTime: '',
    reviewComment: '',
  },
]);

const hasMore = ref(false);
const showDetail = ref(false);
const currentLog = ref(null);

// 计算属性
const filteredLogs = computed(() => {
  let result = logList.value;

  // 根据时间筛选
  if (activeTab.value === 'today') {
    const today = new Date().toISOString().split('T')[0];
    result = result.filter(log => log.date === today);
  } else if (activeTab.value === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    result = result.filter(log => new Date(log.date) >= weekAgo);
  } else if (activeTab.value === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    result = result.filter(log => new Date(log.date) >= monthAgo);
  }

  return result;
});

// 方法
function formatDay(date) {
  return date.split('-')[2];
}

function formatMonth(date) {
  return `${date.split('-')[1]}月`;
}

function handleTabChange() {
  showToast('切换筛选条件');
}

function handleDateConfirm({ selectedOptions }) {
  showDatePicker.value = false;
  showToast('日期筛选已更新');
}

function handleViewDetail(log) {
  currentLog.value = log;
  showDetail.value = true;
}

function handleEdit(log) {
  showToast('编辑功能开发中');
}

function handleShare(log) {
  showConfirmDialog({
    title: '分享日志',
    message: '确定要分享此日志吗？',
  })
    .then(() => {
      showToast('分享功能开发中');
    })
    .catch(() => {});
}
</script>

<style scoped lang="less">
.log-history {
  min-height: calc(100vh - 46px - 50px);
  background: #f5f5f5;
  padding-bottom: 20px;
}

// 时间筛选
.time-filter {
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px 12px;

  :deep(.van-tabs) {
    flex: 1;

    .van-tabs__nav {
      background: transparent;
    }

    .van-tab {
      color: #666;
      font-size: 13px;
    }

    .van-tab--active {
      color: #2c5282;
      font-weight: 600;
    }

    .van-tabs__line {
      background: #2c5282;
    }
  }

  .date-range {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: #f5f5f5;
    border-radius: 16px;
    font-size: 12px;
    color: #666;
    cursor: pointer;
  }
}

// 统计概览
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px;

  .stats-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    text-align: center;

    .stats-value {
      font-size: 24px;
      font-weight: 700;
      color: #333;
      margin-bottom: 4px;
    }

    .stats-label {
      font-size: 12px;
      color: #999;
    }

    &.highlight {
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      color: #fff;

      .stats-value {
        color: #fff;
      }

      .stats-label {
        color: rgba(255, 255, 255, 0.8);
      }
    }

    &.success {
      background: linear-gradient(135deg, #065f46 0%, #059669 100%);
      color: #fff;

      .stats-value {
        color: #fff;
      }

      .stats-label {
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }
}

// 日志列表
.log-list {
  padding: 0 16px;
}

.log-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:active {
    transform: scale(0.98);
  }

  .log-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;

    .log-date-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;

      .day {
        font-size: 18px;
        font-weight: 700;
        line-height: 1;
      }

      .month {
        font-size: 10px;
        opacity: 0.8;
        margin-top: 2px;
      }
    }

    .log-info {
      flex: 1;

      .log-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 4px;
      }

      .log-meta {
        display: flex;
        gap: 12px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;
        }
      }
    }

    .log-status {
      flex-shrink: 0;
    }
  }

  .log-summary {
    background: #f9f9f9;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 12px;
        color: #999;
        min-width: 70px;
      }

      .value {
        font-size: 13px;
        color: #333;
        font-weight: 500;
      }

      .progress-bar {
        flex: 1;
        height: 4px;
        background: #eee;
        border-radius: 2px;
        overflow: hidden;

        .progress-fill {
          height: 100%;
          background: #2c5282;
        }
      }

      &.problem {
        .value {
          color: #fa8c16;
        }
      }

      .text-warning {
        color: #fa8c16;
      }
    }
  }

  .log-footer {
    display: flex;
    gap: 8px;
  }
}

// 加载更多
.load-more {
  text-align: center;
  padding: 20px;
  color: #999;
}

// 详情弹窗
.detail-popup {
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h2 {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
      }
    }

    .detail-section {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 12px;

      h3 {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin: 0 0 12px 0;
      }

      .process-list {
        .process-item {
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
          margin-bottom: 8px;

          &:last-child {
            margin-bottom: 0;
          }

          .process-name {
            font-size: 14px;
            font-weight: 600;
            color: #333;
            margin-bottom: 4px;
          }

          .process-content {
            font-size: 13px;
            color: #666;
            margin-bottom: 4px;
          }

          .process-progress {
            font-size: 12px;
            color: #38ef7d;
          }
        }
      }

      .problem-info,
      .plan-info {
        font-size: 14px;
        color: #666;
        line-height: 1.6;
      }

      .attachment-list {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    }
  }
}
</style>
