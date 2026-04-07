<template>
  <div class="progress-query">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <div
          v-for="item in filterTabs"
          :key="item.value"
          class="filter-tab"
          :class="{ active: currentFilter === item.value }"
          @click="handleFilterChange(item.value)"
        >
          {{ item.label }}
          <span v-if="item.count" class="tab-count">{{ item.count }}</span>
        </div>
      </div>
      <div class="filter-actions">
        <van-button size="small" type="primary" plain hairline @click="showExport = true">
          <van-icon name="orders-o" />
          导出
        </van-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="searchKey"
        placeholder="搜索工序名称"
        shape="round"
        background="#fff"
        @search="handleSearch"
      />
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value" style="color: #52c41a">{{ statsData.complete }}</div>
        <div class="stat-label">已完成</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #1890ff">{{ statsData.inProgress }}</div>
        <div class="stat-label">进行中</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #fa8c16">{{ statsData.delayed }}</div>
        <div class="stat-label">已延期</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: #999">{{ statsData.pending }}</div>
        <div class="stat-label">待开始</div>
      </div>
    </div>

    <!-- 进度时间线 -->
    <div class="timeline-section">
      <div class="section-header">
        <h2 class="section-title">进度时间线</h2>
        <van-switch v-model="showGantt" size="16px" />
      </div>

      <div v-if="!showGantt" class="timeline-list">
        <div
          v-for="(item, index) in filteredTasks"
          :key="item.id"
          class="timeline-item"
          :class="{ 'is-current': index === 0 }"
        >
          <div class="timeline-marker">
            <div class="marker-dot" :class="`status-${item.status}`"></div>
            <div v-if="index < filteredTasks.length - 1" class="marker-line"></div>
          </div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div class="timeline-title">{{ item.name }}</div>
              <van-tag :type="statusType[item.status]" size="small">
                {{ statusText[item.status] }}
              </van-tag>
            </div>
            <div class="timeline-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ item.progress }}%</span>
            </div>
            <div class="timeline-meta">
              <span class="meta-item">
                <van-icon name="clock-o" />
                {{ item.planStart }} ~ {{ item.planEnd }}
              </span>
              <span v-if="item.problem" class="meta-item problem">
                <van-icon name="warning-o" />
                {{ item.problem }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 甘特图视图 -->
      <div v-else class="gantt-chart">
        <div class="gantt-header">
          <div class="gantt-row-title">工序</div>
          <div class="gantt-timeline">
            <div
              v-for="day in ganttDays"
              :key="day"
              class="gantt-day"
              :class="{ today: day === todayStr }"
            >
              {{ day }}
            </div>
          </div>
        </div>
        <div class="gantt-body">
          <div v-for="task in filteredTasks" :key="task.id" class="gantt-row">
            <div class="gantt-row-title">{{ task.name }}</div>
            <div class="gantt-row-bars">
              <div
                class="gantt-bar"
                :style="getGanttBarStyle(task)"
              >
                <div class="bar-progress" :style="{ width: task.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出弹窗 -->
    <van-popup v-model:show="showExport" position="bottom" round>
      <div class="export-popup">
        <div class="popup-header">
          <h3>导出进度报表</h3>
          <van-icon name="cross" @click="showExport = false" />
        </div>
        <div class="popup-content">
          <van-radio-group v-model="exportType">
            <van-cell-group inset>
              <van-cell title="导出全部" clickable @click="exportType = 'all'">
                <template #right-icon>
                  <van-radio name="all" />
                </template>
              </van-cell>
              <van-cell title="仅导出进行中" clickable @click="exportType = 'progress'">
                <template #right-icon>
                  <van-radio name="progress" />
                </template>
              </van-cell>
              <van-cell title="导出已完成" clickable @click="exportType = 'complete'">
                <template #right-icon>
                  <van-radio name="complete" />
                </template>
              </van-cell>
            </van-cell-group>
          </van-radio-group>
          <div class="popup-footer">
            <van-button round block type="primary" @click="handleExport">确认导出</van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { showToast } from 'vant'

defineOptions({
  name: 'ProgressQuery',
})

// 筛选标签
const filterTabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '进行中', value: 'in-progress', count: 2 },
  { label: '已完成', value: 'complete', count: 4 },
  { label: '已延期', value: 'delayed', count: 1 },
])
const currentFilter = ref('all')
const searchKey = ref('')
const showGantt = ref(false)
const showExport = ref(false)
const exportType = ref('all')

// 状态映射
const statusText = {
  pending: '待开始',
  'in-progress': '进行中',
  complete: '已完成',
  delayed: '已延期',
}
const statusType = {
  pending: 'default',
  'in-progress': 'primary',
  complete: 'success',
  delayed: 'danger',
}

// 统计数据
const statsData = reactive({
  complete: 4,
  inProgress: 2,
  delayed: 1,
  pending: 1,
})

// 工序列表
const taskList = ref([
  {
    id: 1,
    name: '施工前准备阶段',
    level: 1,
    planStart: '2026/3/1',
    planEnd: '2026/3/4',
    progress: 100,
    problem: '',
    status: 'complete',
  },
  {
    id: 2,
    name: '临建配套',
    level: 2,
    planStart: '2026/3/1',
    planEnd: '2026/3/4',
    progress: 100,
    problem: '',
    status: 'complete',
  },
  {
    id: 3,
    name: '通水',
    level: 3,
    planStart: '2026/3/2',
    planEnd: '2026/3/3',
    progress: 100,
    problem: '',
    status: 'complete',
  },
  {
    id: 4,
    name: '通电',
    level: 3,
    planStart: '2026/3/1',
    planEnd: '2026/3/4',
    progress: 100,
    problem: '',
    status: 'complete',
  },
  {
    id: 5,
    name: '基础土方开挖',
    level: 2,
    planStart: '2026/3/5',
    planEnd: '2026/3/8',
    progress: 60,
    problem: '设备调配延迟',
    status: 'in-progress',
  },
  {
    id: 6,
    name: '罐区基础',
    level: 2,
    planStart: '2026/3/9',
    planEnd: '2026/3/12',
    progress: 30,
    problem: '',
    status: 'in-progress',
  },
  {
    id: 7,
    name: '资料报审',
    level: 3,
    planStart: '2026/3/1',
    planEnd: '2026/3/10',
    progress: 80,
    problem: '等待审核',
    status: 'delayed',
  },
  {
    id: 8,
    name: '装卸区基础',
    level: 3,
    planStart: '2026/3/15',
    planEnd: '2026/3/20',
    progress: 0,
    problem: '',
    status: 'pending',
  },
])

// 甘特图日期范围
const todayStr = computed(() => {
  const today = new Date()
  return `${today.getMonth() + 1}/${today.getDate()}`
})

const ganttDays = computed(() => {
  const days = []
  for (let i = 1; i <= 20; i++) {
    days.push(`${i}`)
  }
  return days
})

// 筛选后的任务
const filteredTasks = computed(() => {
  let result = taskList.value

  if (currentFilter.value !== 'all') {
    result = result.filter(task => task.status === currentFilter.value)
  }

  if (searchKey.value) {
    result = result.filter(task =>
      task.name.toLowerCase().includes(searchKey.value.toLowerCase())
    )
  }

  return result
})

// 方法
function handleFilterChange(value) {
  currentFilter.value = value
}

function handleSearch() {
  showToast('搜索功能开发中')
}

function getGanttBarStyle(task) {
  // 简化的甘特图样式计算
  return {
    width: `${Math.min(100, task.progress)}%`,
  }
}

function handleExport() {
  showToast('导出功能开发中')
  showExport.value = false
}
</script>

<style scoped lang="less">
.progress-query {
  min-height: calc(100vh - 46px - 50px);
  background: #f5f5f5;
  padding-bottom: 20px;
}

// 筛选栏
.filter-bar {
  background: #fff;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 46px;
  z-index: 10;

  .filter-tabs {
    display: flex;
    gap: 16px;

    .filter-tab {
      font-size: 14px;
      color: #666;
      padding: 4px 0;
      position: relative;
      cursor: pointer;

      &.active {
        color: #2c5282;
        font-weight: 600;

        &::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          right: 0;
          height: 2px;
          background: #2c5282;
          border-radius: 1px;
        }
      }

      .tab-count {
        display: inline-block;
        margin-left: 4px;
        padding: 0 6px;
        background: #2c5282;
        color: #fff;
        border-radius: 10px;
        font-size: 11px;
      }
    }
  }
}

// 搜索栏
.search-bar {
  :deep(.van-search) {
    padding: 8px 16px;
  }
}

// 统计卡片
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 0 16px 16px;

  .stat-card {
    background: #fff;
    border-radius: 8px;
    padding: 12px 8px;
    text-align: center;

    .stat-value {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: #999;
    }
  }
}

// 时间线区域
.timeline-section {
  padding: 0 16px;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
  }
}

// 时间线列表
.timeline-list {
  .timeline-item {
    display: flex;
    gap: 12px;
    padding-bottom: 24px;
    position: relative;

    &.is-current {
      .marker-dot {
        width: 12px;
        height: 12px;
        background: #2c5282;
        box-shadow: 0 0 0 4px rgba(44, 82, 130, 0.3);
      }
    }

    .timeline-marker {
      display: flex;
      flex-direction: column;
      align-items: center;

      .marker-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ccc;
        flex-shrink: 0;

        &.status-complete {
          background: #52c41a;
        }

        &.status-in-progress {
          background: #1890ff;
        }

        &.status-delayed {
          background: #fa8c16;
        }

        &.status-pending {
          background: #999;
        }
      }

      .marker-line {
        width: 2px;
        flex: 1;
        background: #eee;
        margin-top: 4px;
      }
    }

    .timeline-content {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .timeline-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
      }

      .timeline-progress {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

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

        .progress-text {
          font-size: 12px;
          color: #666;
          min-width: 36px;
        }
      }

      .timeline-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;

          &.problem {
            color: #fa8c16;
          }
        }
      }
    }
  }
}

// 甘特图
.gantt-chart {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  .gantt-header {
    display: flex;
    border-bottom: 1px solid #eee;

    .gantt-row-title {
      width: 80px;
      padding: 8px;
      font-size: 12px;
      font-weight: 600;
      color: #333;
      background: #fafafa;
      border-right: 1px solid #eee;
    }

    .gantt-timeline {
      flex: 1;
      display: flex;

      .gantt-day {
        flex: 1;
        padding: 8px 2px;
        text-align: center;
        font-size: 10px;
        color: #999;
        border-right: 1px solid #f0f0f0;

        &.today {
          background: rgba(44, 82, 130, 0.1);
          color: #2c5282;
          font-weight: 600;
        }
      }
    }
  }

  .gantt-body {
    .gantt-row {
      display: flex;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .gantt-row-title {
        width: 80px;
        padding: 8px;
        font-size: 12px;
        color: #333;
        background: #fff;
        border-right: 1px solid #eee;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gantt-row-bars {
        flex: 1;
        position: relative;
        height: 32px;
        display: flex;
        align-items: center;

        .gantt-bar {
          position: absolute;
          left: 0;
          height: 20px;
          background: #2c5282;
          border-radius: 4px;
          overflow: hidden;

          .bar-progress {
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }
    }
  }
}

// 导出弹窗
.export-popup {
  padding: 16px;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
    }

    :deep(.van-icon) {
      font-size: 20px;
      color: #666;
    }
  }

  .popup-footer {
    margin-top: 16px;
  }
}
</style>