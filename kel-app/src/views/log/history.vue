<template>
  <div class="log-history">
    <!-- 日期选择栏 -->
    <div class="date-selector-bar">
      <div class="date-group">
        <span class="arrow"><van-icon name="arrow-left" /></span>
        <span class="value">{{ currentYear }}</span>
        <span class="arrow"><van-icon name="arrow" /></span>
      </div>
      <div class="date-group">
        <span class="arrow"><van-icon name="arrow-left" /></span>
        <span class="value">{{ currentMonth }}月</span>
        <span class="arrow"><van-icon name="arrow" /></span>
      </div>
      <div class="date-group">
        <span class="arrow"><van-icon name="arrow-left" /></span>
        <span class="value">{{ currentDay }}日</span>
        <span class="arrow"><van-icon name="arrow" /></span>
      </div>
      <div class="calendar-btn" @click="showCalendar = !showCalendar">
        <span>日历</span>
      </div>
    </div>

    <!-- 日历组件 -->
    <div v-if="showCalendar" class="calendar-wrapper">
      <div class="calendar-legend">
        <span class="legend-item">
          <span class="dot not-filled"></span>
          <span>未填报</span>
        </span>
        <span class="legend-item">
          <span class="dot filled"></span>
          <span>已填报</span>
        </span>
      </div>
      <Calendar
        ref="calendarRef"
        v-model="selectedDate"
        :attributes="attributes"
        transparent
        borderless
        expanded
        @dayclick="handleDayClick"
        @did-move="handlePageChange"
      />
      <div class="calendar-footer">
        <van-button type="primary" size="small" round @click="goToToday">今天</van-button>
      </div>
    </div>

    <!-- 详情内容 -->
    <div
      v-if="showDetail && detailData.log"
      class="detail-section"
      :class="{ 'show-calendar': showCalendar }"
    >
      <div class="detail-header">
        <h3>日志详情</h3>
      </div>
      <!-- 基本信息 -->
      <div class="detail-block info-block">
        <h4>基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">项目名称</span>
            <span class="info-value">{{ detailData.log.projectName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">标段</span>
            <span class="info-value">{{ detailData.log.section || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">记录人</span>
            <span class="info-value">{{ detailData.log.recorderName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">记录日期</span>
            <span class="info-value">{{ detailData.log.logDate || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">天气</span>
            <span class="info-value">{{ detailData.log.weather || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">现场负责人</span>
            <span class="info-value">{{ detailData.log.onsiteLeader || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 今日施工内容 -->
      <div v-if="detailData.todayList?.length > 0" class="detail-block">
        <h4>今日施工内容</h4>
        <div class="process-list">
          <div v-for="(p, i) in detailData.todayList" :key="i" class="process-item">
            <!-- 工序名称 -->
            <div class="process-header">
              <div class="process-name-row">
                <span v-if="p.level3Process" class="process-name">{{ p.level3Process }}</span>
                <span v-else-if="p.level2Process" class="process-name">{{ p.level2Process }}</span>
                <span v-else-if="p.level1Process" class="process-name">{{ p.level1Process }}</span>
                <span v-else class="process-name">{{
                  p.processName || p.processNo || '工序' + (i + 1)
                }}</span>
                <span v-if="p.completionRate" class="process-rate">
                  (完成进度 {{ p.completionRate }}%)
                </span>
              </div>
              <span class="process-progress">{{ p.cumulativeProgress || 0 }}%</span>
            </div>
            <!-- 父级工序 -->
            <div v-if="p.level1Process || p.level2Process" class="process-parent">
              <span v-if="p.level1Process && p.level2Process"
                >{{ p.level1Process }} / {{ p.level2Process }}</span
              >
              <span v-else-if="p.level1Process">{{ p.level1Process }}</span>
            </div>
            <!-- 施工内容 -->
            <div class="process-content">{{ p.todayContent || '无' }}</div>
            <!-- 工作量信息 -->
            <div v-if="p.todayWorkload || p.totalWorkload" class="process-workload">
              <div v-if="p.todayWorkload" class="workload-item">
                <span class="label">今日工作量</span>
                <span class="value">{{ p.todayWorkload }}</span>
              </div>
              <div v-if="p.totalWorkload" class="workload-item">
                <span class="label">累计工作量</span>
                <span class="value">{{ p.totalWorkload }}</span>
              </div>
            </div>
            <!-- 进度信息 -->
            <!-- <div class="process-info-row">
              <span class="info-item">累计进度: {{ p.cumulativeProgress || 0 }}%</span>
            </div> -->
            <!-- 问题提示 -->
            <div v-if="p.problems" class="process-problem">
              <van-icon name="warning-o" size="14" />
              <span>存在问题: {{ p.problems }}</span>
            </div>
            <!-- 附件图片 -->
            <div v-if="p.attachmentUrls?.length" class="attachment-images">
              <van-image
                v-for="(url, idx) in p.attachmentUrls"
                :key="idx"
                width="60"
                height="60"
                fit="cover"
                :src="url"
                radius="6"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 明日施工计划 -->
      <div v-if="detailData.tomorrowList?.length > 0" class="detail-block">
        <h4>明日施工计划</h4>
        <div class="plan-list">
          <div v-for="(p, i) in detailData.tomorrowList" :key="i" class="process-item">
            <!-- 工序名称 -->
            <div class="process-header">
              <div class="process-name-row">
                <span v-if="p.level3Process" class="process-name">{{ p.level3Process }}</span>
                <span v-else-if="p.level2Process" class="process-name">{{ p.level2Process }}</span>
                <span v-else-if="p.level1Process" class="process-name">{{ p.level1Process }}</span>
                <span v-else class="process-name">{{ p.processName || '工序' + (i + 1) }}</span>
              </div>
              <span v-if="p.plannedProgress" class="process-progress"
                >{{ p.plannedProgress }}%</span
              >
            </div>
            <!-- 父级工序 -->
            <div v-if="p.level1Process || p.level2Process" class="process-parent">
              <span v-if="p.level1Process && p.level2Process"
                >{{ p.level1Process }} / {{ p.level2Process }}</span
              >
              <span v-else-if="p.level1Process">{{ p.level1Process }}</span>
            </div>
            <!-- 计划内容 -->
            <div class="process-content">{{ p.tomorrowPlan || '无' }}</div>
            <!-- 进度信息 -->
            <div class="process-info-row">
              <span class="info-item">计划进度: {{ p.plannedProgress || 0 }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 无数据提示 -->
    <div v-else-if="showDetail && !detailData.log" class="no-data-tip">
      <van-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getLogList, getLogDetail } from '@/api/construction-log';
import { getFileInfo, getUserPermissionsInfo } from '@/api/system';
import dayjs from 'dayjs';
import { Calendar } from 'v-calendar';
import 'v-calendar/style.css';

// 当前日期
const currentYear = ref(dayjs().year());
const currentMonth = ref(dayjs().month() + 1);
const currentDay = ref(dayjs().date());

// 日历相关
const showCalendar = ref(false);
const calendarRef = ref(null);
const selectedDate = ref(dayjs().toDate());

// 根据日志列表生成日历属性
const attributes = computed(() => {
  const result = [];

  // 构建日期到日志的映射
  const dateLogMap = {};
  logList.value.forEach(log => {
    if (log.logDate) {
      dateLogMap[log.logDate] = log;
    }
  });

  // 使用当前日历显示的月份
  const year = currentYear.value;
  const month = currentMonth.value;
  const daysInMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).daysInMonth();

  // 已填报的日期
  const filledDates = [];
  // 未填报的日期
  const notFilledDates = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dateObj = dayjs(dateStr).toDate();

    if (dateLogMap[dateStr]) {
      // 已填报 - 关联日志数据
      filledDates.push({
        date: dateObj,
        customData: dateLogMap[dateStr],
      });
    } else {
      // 未填报
      notFilledDates.push(dateObj);
    }
  }

  // 已填报 - 绿色，携带 customData
  if (filledDates.length > 0) {
    filledDates.forEach(item => {
      result.push({
        dot: {
          style: {
            backgroundColor: '#07c160',
            width: '8px',
            height: '8px',
          },
        },
        dates: item.date,
        customData: item.customData,
      });
    });
  }

  // 未填报 - 红色
  if (notFilledDates.length > 0) {
    result.push({
      dot: {
        style: {
          backgroundColor: '#ee6666',
          width: '8px',
          height: '8px',
        },
      },
      dates: notFilledDates,
    });
  }

  // 选中日期的高亮
  const selectedDateStr = `${currentYear.value}-${String(currentMonth.value).padStart(
    2,
    '0'
  )}-${String(currentDay.value).padStart(2, '0')}`;

  result.push({
    key: 'selected',
    highlight: {
      fillMode: 'outline',
      borderColor: '#118ad2',
    },
    dates: dayjs(selectedDateStr).toDate(),
  });

  // 今天的蓝色高亮
  result.push({
    key: 'today',
    highlight: true,
    dates: dayjs().toDate(),
  });

  return result;
});

// 点击日期
async function handleDayClick(day) {
  selectedDate.value = day.date;
  currentYear.value = dayjs(day.date).year();
  currentMonth.value = dayjs(day.date).month() + 1;
  currentDay.value = dayjs(day.date).date();

  // 无论有没有数据，都标记为已点击
  showDetail.value = true;

  // 检查是否有日志数据
  if (day.attributes) {
    // 查找有 customData 的属性
    const logAttr = day.attributes.find(attr => attr.customData && attr.customData.id);
    if (logAttr) {
      // 有数据，获取详情
      await fetchLogDetail(logAttr.customData.id);
    } else {
      // 无数据
      detailData.log = null;
      detailData.todayList = [];
      detailData.tomorrowList = [];
    }
  } else {
    // 无数据
    detailData.log = null;
    detailData.todayList = [];
    detailData.tomorrowList = [];
  }
}

// 获取日志详情
async function fetchLogDetail(logId) {
  detailData.log = null;
  detailData.todayList = [];
  detailData.tomorrowList = [];

  try {
    const { data: res } = await getLogDetail(logId);
    if (res.code === 200 && res.data) {
      detailData.log = res.data.log;
      const todayList = res.data.todayList || [];
      const tomorrowList = res.data.tomorrowList || [];

      // 处理今日施工内容的附件
      for (const item of todayList) {
        if (item.attachment) {
          const fileIds = item.attachment.split(',').filter(Boolean);
          const fileUrls = await Promise.all(
            fileIds.map(async id => {
              try {
                const fileRes = await getFileInfo(id);
                return fileRes.data.code === 200 ? fileRes.data.data.url : '';
              } catch {
                return '';
              }
            })
          );
          item.attachmentUrls = fileUrls.filter(Boolean);
        }
      }

      detailData.todayList = todayList;
      detailData.tomorrowList = tomorrowList;
    }
  } catch (error) {
    // ignore
  }
}

// 跳转到今天
async function goToToday() {
  const today = dayjs();
  selectedDate.value = today.toDate();
  currentYear.value = today.year();
  currentMonth.value = today.month() + 1;
  currentDay.value = today.date();
  // 跳转到今天所在的月份视图
  if (calendarRef.value) {
    calendarRef.value.move(today.toDate());
  }

  // 查询今天是否有填报日志
  showDetail.value = true;
  const todayStr = today.format('YYYY-MM-DD');
  const todayLog = logList.value.find(log => log.logDate === todayStr);

  if (todayLog && todayLog.id) {
    await fetchLogDetail(todayLog.id);
  } else {
    detailData.log = null;
    detailData.todayList = [];
    detailData.tomorrowList = [];
  }
}

// 日历切换月份
function handlePageChange(pages) {
  // return;
  if (pages && pages.length > 0) {
    const firstPage = pages[0];
    const year = firstPage.year;
    const month = firstPage.month;

    // 更新日期范围
    const startDate = dayjs(`${year}-${String(month).padStart(2, '0')}-01`);
    beginLogDate.value = startDate.format('YYYY-MM-DD');
    endLogDate.value = startDate.endOf('month').format('YYYY-MM-DD');

    // 更新顶部显示
    currentYear.value = year;
    currentMonth.value = month;

    // 重新获取数据
    fetchList();
  }
}

defineOptions({
  name: 'LogHistory',
});

// 路由
const router = useRouter();

// 列表数据
const logList = ref([]);

// 日期范围
const beginLogDate = ref('');
const endLogDate = ref('');

// 初始化日期范围（当月第一天到最后一天）
function initDateRange() {
  const now = dayjs();
  beginLogDate.value = now.startOf('month').format('YYYY-MM-DD');
  endLogDate.value = now.endOf('month').format('YYYY-MM-DD');
}

initDateRange();

// 详情数据
const showDetail = ref(false);
const detailData = reactive({
  log: null,
  todayList: [],
  tomorrowList: [],
});

// 获取列表
async function fetchList() {
  try {
    const params = {
      pageNum: 1,
      pageSize: 100,
      ['params[beginLogDate]']: beginLogDate.value,
      ['params[endLogDate]']: endLogDate.value,
    };
    const { data: res } = await getLogList(params);

    if (res.code === 200) {
      logList.value = res.rows || [];

      // 获取当天数据
      await initTodayDetail();
    }
  } catch (error) {
    // ignore
  }
}

// 初始化当天详情数据
async function initTodayDetail() {
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayLog = logList.value.find(log => log.logDate === todayStr);

  showDetail.value = true;

  if (todayLog && todayLog.id) {
    await fetchLogDetail(todayLog.id);
  } else {
    detailData.log = null;
    detailData.todayList = [];
    detailData.tomorrowList = [];
  }
}

// 获取当前月份的日志数据
fetchList();

// 查看详情
async function handleViewDetail(log) {
  showDetail.value = true;
  detailData.log = null;
  detailData.todayList = [];
  detailData.tomorrowList = [];

  try {
    const { data: res } = await getLogDetail(log.id);
    if (res.code === 200 && res.data) {
      const logData = res.data.log;

      // 查询记录人昵称
      if (logData.recorder) {
        try {
          const userRes = await getUserPermissionsInfo(logData.recorder);
          if (userRes.data.code === 200 && userRes.data.data) {
            logData.recorder = userRes.data.data.nickName;
          }
        } catch {
          // ignore
        }
      }

      detailData.log = logData;
      const todayList = res.data.todayList || [];
      const tomorrowList = res.data.tomorrowList || [];

      // 处理今日施工内容的附件
      for (const item of todayList) {
        if (item.attachment) {
          const fileIds = item.attachment.split(',').filter(Boolean);
          const fileUrls = await Promise.all(
            fileIds.map(async id => {
              try {
                const fileRes = await getFileInfo(id);
                return fileRes.data.code === 200 ? fileRes.data.data.url : '';
              } catch {
                return '';
              }
            })
          );
          item.attachmentUrls = fileUrls.filter(Boolean);
        }
      }

      detailData.todayList = todayList;
      detailData.tomorrowList = tomorrowList;
    }
  } catch (error) {
    showToast('获取详情失败');
  }
}

// 编辑日志
function handleEdit(log) {
  router.push({
    path: '/log/daily',
    query: { logId: log.id },
  });
}

// 格式化日期
function formatDay(date) {
  if (!date) return '-';
  return date.split('-')[2];
}

function formatMonth(date) {
  if (!date) return '-';
  const month = date.split('-')[1];
  return `${month}月`;
}
</script>

<style scoped lang="less">
// 饿了么风格 - 橙色主题
@ele-orange: #ff6700;
@ele-orange-light: #ff9700;
@ele-gray: #f7f8fa;
@ele-text: #333;
@ele-text-light: #666;
@ele-text-gray: #999;

.log-history {
  height: calc(100vh - 46px);
  background: @ele-gray;
  padding-bottom: 20px;
}

// 日期选择栏
.date-selector-bar {
  height: 48px;
  background: #118ad2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .date-group {
    display: flex;
    align-items: center;
    gap: 6px;

    .arrow {
      color: #fff;
      font-size: 14px;
      opacity: 0.7;
      cursor: pointer;
    }

    .value {
      color: #fff;
      font-size: 14px;
      min-width: 40px;
      text-align: center;
    }
  }

  .calendar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #9ab3ff;
    padding: 6px 12px;
    border-radius: 999px;
    margin-left: 8px;
    cursor: pointer;

    span {
      color: #fff;
      font-size: 13px;
    }
  }
}

// 日历容器
.calendar-wrapper {
  background: #fff;
  margin: 0;
  width: 100vw;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  .calendar-legend {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #666;

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;

        &.not-filled {
          background: #ee6666;
        }

        &.filled {
          background: #07c160;
        }
      }
    }
  }

  .calendar-footer {
    padding: 10px 16px;
    display: flex;
    justify-content: center;
    border-top: 1px solid #f0f0f0;
  }
}

// 详情内容
.detail-section {
  padding: 12px 16px;
  height: calc(100% - 48px);
  overflow-y: auto;

  &.show-calendar {
    height: calc(100% - 48px - 366px);
  }

  .detail-header {
    margin-bottom: 12px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .detail-block {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:last-child {
      margin-bottom: 0;
    }

    h4 {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin: 0 0 12px 0;
      padding-left: 10px;
      border-left: 3px solid #118ad2;
    }

    .process-list,
    .plan-list {
      .process-item,
      .plan-item {
        padding: 12px;
        background: #f7f8fa;
        border-radius: 6px;
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }

        // 工序头部：名称 + 进度
        .process-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;

          .process-name-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 6px;
          }

          .process-name {
            font-size: 14px;
            font-weight: 600;
            color: #333;
          }

          .process-rate {
            font-size: 12px;
            color: #666;
          }

          .process-progress {
            font-size: 13px;
            font-weight: 600;
            color: #118ad2;
            background: rgba(17, 138, 210, 0.1);
            padding: 2px 8px;
            border-radius: 4px;
          }
        }

        // 父级工序
        .process-parent {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
          padding-left: 4px;
        }

        .process-name,
        .plan-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 6px;
        }

        .process-content,
        .plan-content {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 10px;
          padding: 8px;
          background: #fff;
          border-radius: 4px;
          border: 1px solid #eee;
        }

        // 工作量信息
        .process-workload {
          display: flex;
          gap: 16px;
          margin-bottom: 8px;

          .workload-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;

            .label {
              color: #999;
            }

            .value {
              color: #07c160;
              font-weight: 500;
            }
          }
        }

        // 进度信息行
        .process-info-row {
          display: flex;
          gap: 12px;
          font-size: 12px;
          color: #118ad2;
          margin-bottom: 8px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        // 问题提示
        .process-problem {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 12px;
          color: #ee6666;
          background: rgba(238, 102, 102, 0.1);
          padding: 6px 10px;
          border-radius: 4px;
          margin-top: 8px;
        }

        .process-info,
        .plan-info {
          font-size: 12px;
          color: #118ad2;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .problem {
            color: #ee6666;
          }
        }

        .attachment-images {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
      }
    }

    :deep(.van-cell) {
      padding: 12px 16px;

      .van-cell__title {
        color: #999;
        font-size: 13px;
      }

      .van-cell__value {
        color: #333;
        font-size: 14px;
      }
    }

    // 基本信息网格布局
    &.info-block {
      padding: 12px;

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        width: 100%;
        box-sizing: border-box;
      }

      .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 12px;
        background: #f7f8fa;
        border-radius: 6px;
        min-width: 0;

        .info-label {
          font-size: 12px;
          color: #999;
        }

        .info-value {
          font-size: 14px;
          color: #333;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}

// 无数据提示
.no-data-tip {
  padding: 40px 16px;
  text-align: center;
}

// 详情弹窗 - 饿了么风格
.detail-popup {
  height: 100%;
  background: @ele-gray;
  display: flex;
  flex-direction: column;

  :deep(.van-nav-bar) {
    background: linear-gradient(135deg, @ele-orange 0%, @ele-orange-light 100%);

    .van-nav-bar__title {
      color: #fff;
    }

    .van-icon {
      color: #fff;
    }
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;

    .detail-section {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      h3 {
        font-size: 15px;
        font-weight: 600;
        color: @ele-text;
        margin: 0 0 14px 0;
        padding-left: 10px;
        border-left: 3px solid @ele-orange;
      }

      // 今日施工内容卡片
      .process-list,
      .plan-list {
        .process-item,
        .plan-item {
          padding: 12px;
          background: @ele-gray;
          border-radius: 6px;
          margin-bottom: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .process-name,
          .plan-name {
            font-size: 14px;
            font-weight: 600;
            color: @ele-text;
            margin-bottom: 6px;
          }

          .process-content,
          .plan-content {
            font-size: 13px;
            color: @ele-text-light;
            line-height: 1.5;
            margin-bottom: 8px;
          }

          .process-info,
          .plan-info {
            font-size: 12px;
            color: @ele-orange;
            display: flex;
            align-items: center;
            gap: 12px;

            .problem {
              color: #ee6666;
            }
          }

          // 附件图片
          .attachment-images {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid rgba(0, 0, 0, 0.05);

            :deep(.van-image) {
              border-radius: 4px;
            }
          }

          .attachment-info {
            display: none;
          }
        }
      }

      // vant cell样式优化
      :deep(.van-cell) {
        padding: 12px 16px;

        .van-cell__title {
          color: @ele-text-gray;
          font-size: 13px;
        }

        .van-cell__value {
          color: @ele-text;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
