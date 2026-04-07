<template>
  <div class="gantt-container">
    <van-nav-bar title="项目甘特图" left-arrow @click-left="$router.back()" />

    <!-- 甘特图主体 -->
    <div class="gantt-wrapper">
      <!-- 左侧任务名称（固定不滑动） -->
      <div class="gantt-tasks">
        <div class="task-header">任务名称</div>
        <div v-for="item in mockData" :key="item.name" class="task-item" :style="{ height: rowHeight + 'px' }">
          <div class="task-name">{{ item.name }}</div>
          <div class="task-dates">{{ item.startDate }} ~ {{ item.endDate }}</div>
        </div>
      </div>

      <!-- 右侧时间轴（可滑动查看全部） -->
      <div class="gantt-timeline">
        <!-- 表头日期 -->
        <div class="timeline-header" :style="{ width: totalWidth + 'px' }">
          <div v-for="(date, idx) in allDates" :key="idx" class="header-cell">
            {{ date }}
          </div>
        </div>

        <!-- 任务条 -->
        <div class="timeline-body" :style="{ width: totalWidth + 'px' }">
          <div v-for="item in mockData" :key="item.name" class="timeline-row" :style="{ height: rowHeight + 'px' }">
            <!-- 背景网格 -->
            <div class="row-bg">
              <div v-for="n in totalDays" :key="n" class="bg-cell"></div>
            </div>
            <!-- 任务条：已完成部分 + 全部背景 -->
            <div class="task-bar-wrapper" :style="getBarStyle(item)">
              <!-- 全部周期灰色背景 -->
              <div class="bar-bg"></div>
              <!-- 已完成部分 -->
              <div
                class="bar-progress"
                :class="item.status"
                :style="getProgressStyle(item)"
              >
                <span class="bar-label" v-if="item.progress > 0">{{ item.progress }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div class="gantt-legend">
      <div class="legend-item">
        <span class="legend-color completed"></span>
        <span>已完成</span>
      </div>
      <div class="legend-item">
        <span class="legend-color in-progress"></span>
        <span>进行中</span>
      </div>
      <div class="legend-item">
        <span class="legend-color pending"></span>
        <span>未开始</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const rowHeight = 40
const cellWidth = 30
const startDate = new Date(2026, 2, 1) // 3月1日
const endDate = new Date(2026, 3, 20) // 4月20日

// 模拟数据
const mockData = [
  { name: '项目立项', startDate: '03-01', endDate: '03-05', status: 'completed', progress: 100 },
  { name: '需求分析', startDate: '03-03', endDate: '03-10', status: 'completed', progress: 100 },
  { name: '系统设计', startDate: '03-08', endDate: '03-18', status: 'completed', progress: 100 },
  { name: '数据库搭建', startDate: '03-15', endDate: '03-22', status: 'in-progress', progress: 70 },
  { name: '后端开发', startDate: '03-20', endDate: '04-05', status: 'in-progress', progress: 45 },
  { name: '前端开发', startDate: '03-25', endDate: '04-10', status: 'in-progress', progress: 30 },
  { name: '接口联调', startDate: '04-01', endDate: '04-08', status: 'pending', progress: 0 },
  { name: '测试验收', startDate: '04-05', endDate: '04-15', status: 'pending', progress: 0 },
  { name: '上线部署', startDate: '04-12', endDate: '04-18', status: 'pending', progress: 0 },
  { name: '项目验收', startDate: '04-16', endDate: '04-20', status: 'pending', progress: 0 }
]

// 计算总天数
const totalDays = computed(() => {
  return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
})

// 总宽度
const totalWidth = computed(() => {
  return totalDays.value * cellWidth
})

// 所有日期数组
const allDates = computed(() => {
  const dates = []
  const current = new Date(startDate)
  while (current <= endDate) {
    dates.push(`${current.getMonth() + 1}-${current.getDate()}`)
    current.setDate(current.getDate() + 1)
  }
  return dates
})

// 解析日期为天数偏移
const parseDayOffset = (dateStr) => {
  const [month, day] = dateStr.split('-').map(Number)
  const targetDate = new Date(2026, month - 1, day)
  return Math.floor((targetDate - startDate) / (1000 * 60 * 60 * 24))
}

// 计算整个任务条的位置和宽度
const getBarStyle = (item) => {
  const startOffset = parseDayOffset(item.startDate)
  const endOffset = parseDayOffset(item.endDate)
  const duration = endOffset - startOffset + 1

  const left = startOffset * cellWidth
  const width = duration * cellWidth

  return {
    left: left + 'px',
    width: width + 'px'
  }
}

// 计算已完成部分的宽度
const getProgressStyle = (item) => {
  const startOffset = parseDayOffset(item.startDate)
  const endOffset = parseDayOffset(item.endDate)
  const totalDuration = endOffset - startOffset + 1

  // 根据进度计算已完成天数
  const completedDays = Math.round(totalDuration * item.progress / 100)

  return {
    width: (completedDays * cellWidth) + 'px'
  }
}
</script>

<style scoped>
.gantt-container {
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.gantt-wrapper {
  display: flex;
  background: #fff;
  overflow: hidden;
}

.gantt-tasks {
  flex-shrink: 0;
  width: 100px;
  border-right: 1px solid #eee;
  z-index: 10;
  background: #fff;
}

.task-header {
  height: 30px;
  line-height: 30px;
  padding: 0 8px;
  font-size: 11px;
  color: #999;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.task-item {
  padding: 4px 8px;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.task-name {
  font-size: 11px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-dates {
  font-size: 9px;
  color: #999;
  margin-top: 2px;
}

.gantt-timeline {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.timeline-header {
  display: flex;
  height: 30px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 5;
}

.header-cell {
  width: 30px;
  flex-shrink: 0;
  line-height: 30px;
  text-align: center;
  font-size: 10px;
  color: #999;
  border-right: 1px solid #f0f0f0;
}

.timeline-body {
  position: relative;
  min-height: 400px;
}

.timeline-row {
  position: relative;
  border-bottom: 1px solid #f5f5f5;
}

/* 背景网格 */
.row-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
}

.bg-cell {
  width: 30px;
  flex-shrink: 0;
  border-right: 1px solid #f5f5f5;
  box-sizing: border-box;
}

/* 任务条容器 */
.task-bar-wrapper {
  position: absolute;
  top: 8px;
  height: 24px;
  display: flex;
}

/* 全部周期灰色背景 */
.bar-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #e8e8e8;
  border-radius: 4px;
}

/* 已完成部分 */
.bar-progress {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bar-progress.completed {
  background: linear-gradient(90deg, #07c160, #09ce7a);
}

.bar-progress.in-progress {
  background: linear-gradient(90deg, #1989fa, #3ba1f5);
}

.bar-progress.pending {
  background: linear-gradient(90deg, #bfbfbf, #d9d9d9);
}

.bar-label {
  font-size: 10px;
  color: #fff;
  font-weight: 500;
  padding: 0 4px;
  border-radius: 2px;
  white-space: nowrap;
  z-index: 1;
}

.gantt-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 15px;
  background: #fff;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.completed { background: #07c160; }
.legend-color.in-progress { background: #1989fa; }
.legend-color.pending { background: #bfbfbf; }
</style>
