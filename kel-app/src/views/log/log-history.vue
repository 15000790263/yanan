<template>
  <div class="log-history">
    <!-- 统计区域 -->
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
        <div class="stats-label">待修改</div>
      </div>
      <div
        class="stats-card"
        :class="{ active: activeStatus === '1' }"
        @click="handleStatusChange('1')"
      >
        <div class="stats-value">{{ stats.waiting }}</div>
        <div class="stats-label">未审核</div>
      </div>
      <div
        class="stats-card"
        :class="{ active: activeStatus === '2' }"
        @click="handleStatusChange('2')"
      >
        <div class="stats-value completed">{{ stats.approved }}</div>
        <div class="stats-label">已审核</div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="log-list">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div v-for="log in logList" :key="log.id" class="log-card" @click="handleViewDetail(log)">
            <div class="log-header">
              <div class="log-date-badge">
                <span class="day">{{ formatDay(log.logDate) }}</span>
                <span class="month">{{ formatMonth(log.logDate) }}</span>
              </div>
              <div class="log-info">
                <div class="log-title">
                  {{ log.projectName }}
                  <van-tag :type="statusTagType[log.status]" size="small">{{
                    statusLabel[log.status]
                  }}</van-tag>
                </div>
                <div class="log-meta">
                  <span class="meta-item">
                    <van-icon name="user-o" />
                    {{ log.recorder }}
                  </span>
                  <span class="meta-item">
                    <van-icon name="flag-o" />
                    {{ log.section }}
                  </span>
                </div>
              </div>
            </div>

            <div class="log-summary">
              <div class="summary-item">
                <span class="label">天气</span>
                <span class="value">{{ log.weather || '-' }}</span>
              </div>
              <div v-if="log.onsiteLeader" class="summary-item">
                <span class="label">现场负责人</span>
                <span class="value">{{ log.onsiteLeader }}</span>
              </div>
            </div>
            <!-- 待修改状态显示编辑按钮 -->
            <van-button
              v-if="log.status === '0'"
              type="warning"
              size="small"
              round
              class="edit-btn"
              @click.stop="handleEdit(log)"
            >
              修改
            </van-button>
          </div>

          <van-empty v-if="logList.length === 0 && !loading" description="暂无历史记录" />
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
        <van-nav-bar title="日志详情" left-arrow @click-left="showDetail = false" />
        <div class="detail-content" v-if="detailData.log">
          <!-- 基本信息 -->
          <div class="detail-section">
            <h3>基本信息</h3>
            <van-cell-group>
              <van-cell title="项目名称" :value="detailData.log.projectName" />
              <van-cell title="标段" :value="detailData.log.section" />
              <van-cell title="记录人" :value="detailData.log.recorder" />
              <van-cell title="记录日期" :value="detailData.log.logDate" />
              <van-cell title="天气" :value="detailData.log.weather" />
              <van-cell title="现场负责人" :value="detailData.log.onsiteLeader || '-'" />
            </van-cell-group>
          </div>

          <!-- 今日施工内容 -->
          <div v-if="detailData.todayList?.length > 0" class="detail-section">
            <h3>今日施工内容</h3>
            <div class="process-list">
              <div v-for="(p, i) in detailData.todayList" :key="i" class="process-item">
                <div class="process-name">{{ p.processNo }}</div>
                <div class="process-content">{{ p.todayContent || '无' }}</div>
                <div class="process-info">
                  <span>进度: {{ p.cumulativeProgress }}%</span>
                  <span v-if="p.problems" class="problem">问题: {{ p.problems }}</span>
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
          <div v-if="detailData.tomorrowList?.length > 0" class="detail-section">
            <h3>明日施工计划</h3>
            <div class="plan-list">
              <div v-for="(p, i) in detailData.tomorrowList" :key="i" class="plan-item">
                <div class="plan-name">{{ p.processName }}</div>
                <div class="plan-content">{{ p.tomorrowPlan || '无' }}</div>
                <div class="plan-info">
                  <span>计划进度: {{ p.plannedProgress }}%</span>
                </div>
              </div>
            </div>
          </div>

          <van-empty
            v-if="!detailData.todayList?.length && !detailData.tomorrowList?.length"
            description="暂无施工内容"
          />

          <!-- 审核按钮：有权限且状态为未审核时显示 -->
          <div v-if="hasAuditPermission && detailData.log?.status === '1'" class="audit-section">
            <van-button type="primary" round block @click="showAuditPopup = true">
              审核
            </van-button>
          </div>
        </div>
        <van-loading v-else-if="!detailData.log" size="24px" />
      </div>
    </van-popup>

    <!-- 审核弹窗 -->
    <van-popup v-model:show="showAuditPopup" round :style="{ width: '85%', padding: '20px' }">
      <div class="audit-popup">
        <div class="audit-title">一级审核</div>
        <div class="audit-content">
          <div class="audit-actions">
            <van-button
              :class="{ 'btn-selected': auditAction === 'pass' }"
              type="success"
              round
              plain
              @click="handleAuditPass"
            >
              通过
            </van-button>
            <van-button
              :class="{ 'btn-selected': auditAction === 'reject' }"
              type="danger"
              round
              plain
              @click="handleAuditReject"
            >
              拒绝
            </van-button>
          </div>
          <van-field
            v-model="auditComment"
            type="textarea"
            placeholder="请输入拒绝原因（必填）"
            rows="3"
            :disabled="auditAction !== 'reject'"
            :required="auditAction === 'reject'"
          />
        </div>
        <div class="audit-footer">
          <van-button round @click="showAuditPopup = false">取消</van-button>
          <van-button type="primary" round :loading="auditing" @click="submitAudit">
            确定
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { getLogList, getLogDetail, updateConstructionLog } from '@/api/construction-log';
import { getFileInfo, getUserPermissionsInfo } from '@/api/system';
import dayjs from 'dayjs';

defineOptions({
  name: 'LogHistory',
});

// 路由
const router = useRouter();

// 统计（写死）
const stats = reactive({
  all: 10,
  pending: 2,
  waiting: 3,
  approved: 3,
});

// 状态
const activeStatus = ref('');
const statusLabel = { 0: '待修改', 1: '未审核', 2: '已审核' };
const statusTagType = { 0: 'danger', 1: 'warning', 2: 'success' };

// 列表数据
const logList = ref([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const pageNum = ref(1);
const pageSize = 10;

// 详情数据
const showDetail = ref(false);
const detailData = reactive({
  log: null,
  todayList: [],
  tomorrowList: [],
});

// 审核相关
import useUserStore from '@/stores/user';
const userStore = useUserStore();
const hasAuditPermission = computed(() => {
  return userStore.roles?.includes('log_audit_first');
});
const showAuditPopup = ref(false);
const auditAction = ref(''); // 'pass' 或 'reject'
const auditComment = ref('');
const auditing = ref(false);

// 审核通过
function handleAuditPass() {
  auditAction.value = 'pass';
  auditComment.value = '';
}

// 审核拒绝
function handleAuditReject() {
  auditAction.value = 'reject';
  auditComment.value = '';
}

// 提交审核
async function submitAudit() {
  if (!auditAction.value) {
    showToast('请选择审核操作');
    return;
  }
  if (auditAction.value === 'reject' && !auditComment.value.trim()) {
    showToast('请填写拒绝原因');
    return;
  }

  auditing.value = true;
  try {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const params = {
      id: detailData.log.id,
      status: auditAction.value === 'pass' ? '2' : '0',
      reviewTime: now,
      reviewer: userStore.nickName,
    };
    if (auditAction.value === 'reject') {
      params.reviewComment = auditComment.value;
    }
    const { data: res } = await updateConstructionLog(params);
    if (res.code === 200) {
      showToast('审核成功');
      showDetail.value = false;
      showAuditPopup.value = false;
      // 刷新列表
      pageNum.value = 1;
      finished.value = false;
      logList.value = [];
      onLoad();
    } else {
      showToast(res.msg || '审核失败');
    }
  } catch (error) {
    showToast('审核失败');
  } finally {
    auditing.value = false;
  }
}

// 切换状态筛选
function handleStatusChange(status) {
  activeStatus.value = status;
  pageNum.value = 1;
  finished.value = false;
  logList.value = [];
  loading.value = true;
  fetchList();
}

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
    const { data: res } = await getLogList(params);
    loading.value = false;
    refreshing.value = false;

    if (res.code === 200) {
      const newList = res.rows || [];

      // Determine whether to replace the list (first page) or append (subsequent pages)
      if (pageNum.value === 1) {
        logList.value = newList; // Replace the list for the first page
      } else {
        logList.value.push(...newList); // Append for subsequent pages
      }

      // 数据不够一页时标记已完成
      if (newList.length < pageSize) {
        finished.value = true;
      }

      pageNum.value++; // Increment pageNum AFTER it's used to update logList

      // 收集需要查询的用户ID
      const userIds = [...new Set(newList.map(item => item.recorder).filter(Boolean))];
      const userNameMap = {};

      // 批量获取用户昵称
      if (userIds.length > 0) {
        await Promise.all(
          userIds.map(async userId => {
            try {
              const userRes = await getUserPermissionsInfo(userId);
              if (userRes.data.code === 200 && userRes.data.data) {
                userNameMap[userId] = userRes.data.data.nickName;
              }
            } catch {
              // ignore
            }
          })
        );
      }

      // 替换 recorder 为昵称
      newList.forEach(item => {
        if (item.recorder && userNameMap[item.recorder]) {
          item.recorder = userNameMap[item.recorder];
        }
      });
    }
  } catch (error) {
    loading.value = false;
    refreshing.value = false;
    showToast('获取失败');
  }
}

// 上拉加载
function onLoad() {
  if (finished.value) {
    loading.value = false;
    return;
  }
  loading.value = true;
  fetchList();
}

// 下拉刷新
function onRefresh() {
  pageNum.value = 1;
  finished.value = false;
  loading.value = true;
  fetchList();
}

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
  min-height: calc(100vh - 46px - 50px);
  background: @ele-gray;
  padding-bottom: 20px;
}

// 日志列表
.log-list {
  padding: 0 16px;
  padding-top: 16px;
}

.log-card {
  background: #fff;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }

  .log-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 12px;

    // 橙色日期徽章
    .log-date-badge {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, @ele-orange 0%, @ele-orange-light 100%);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(255, 103, 0, 0.3);

      .day {
        font-size: 18px;
        font-weight: 700;
        line-height: 1;
      }

      .month {
        font-size: 10px;
        font-weight: 500;
        opacity: 0.9;
        margin-top: 1px;
      }
    }

    .log-info {
      flex: 1;

      .log-title {
        font-size: 15px;
        font-weight: 600;
        color: @ele-text;
        margin-bottom: 6px;
        line-height: 1.3;
      }

      .log-meta {
        display: flex;
        gap: 16px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: @ele-text-light;

          .van-icon {
            font-size: 14px;
            color: @ele-text-gray;
          }
        }
      }
    }
  }

  .log-summary {
    background: @ele-gray;
    border-radius: 6px;
    padding: 10px 12px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 8px;

      &:not(:last-child) {
        margin-bottom: 6px;
      }

      .label {
        font-size: 12px;
        color: @ele-text-gray;
        min-width: 32px;
      }

      .value {
        font-size: 13px;
        color: @ele-text;
      }
    }
  }

  // 编辑按钮
  .edit-btn {
    margin-top: 10px;
    width: 100%;
  }
}

// 统计区域
.stats-section {
  display: flex;
  gap: 6px;
  padding: 12px 16px;
  background: #fff;
}

.stats-card {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;

  .stats-value {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .stats-label {
    font-size: 11px;
    color: #666;
    margin-top: 2px;
  }

  &.active {
    background: linear-gradient(135deg, @ele-orange 0%, @ele-orange-light 100%);
    color: #fff;

    .stats-value,
    .stats-label {
      color: #fff;
    }
  }

  .pending {
    color: #ee6666;
  }

  .completed {
    color: #07c160;
  }
}

// 审核区域
.audit-section {
  padding: 16px;
  background: #fff;
  margin-top: 12px;
}

// 审核弹窗
.audit-popup {
  .audit-title {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 20px;
    color: #333;
  }

  .audit-content {
    margin-bottom: 20px;

    .audit-actions {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      .van-button {
        flex: 1;

        &.btn-selected {
          &.van-button--success {
            background: #07c160;
            border-color: #07c160;
            color: #fff;
          }
          &.van-button--danger {
            background: #ee6666;
            border-color: #ee6666;
            color: #fff;
          }
        }
      }
    }
  }

  .audit-footer {
    display: flex;
    gap: 12px;

    .van-button {
      flex: 1;
    }
  }
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
