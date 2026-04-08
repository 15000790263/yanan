<template>
  <div class="construction-log">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h1 class="page-title">施工日志</h1>
        <p class="page-date">{{ currentDate }}</p>
      </div>
      <div class="header-weather">
        <van-icon :name="getWeatherIcon()" class="weather-icon" />
        <span class="weather-text">{{ logData.weather || '加载中...' }}</span>
      </div>
    </div>

    <!-- 基本信息 -->
    <div class="info-section">
      <div class="section-title">
        <van-icon name="info-o" />
        <span>基本信息</span>
      </div>
      <div class="info-card">
        <van-cell-group>
          <van-field
            v-model="logData.projectName"
            label="项目名称"
            placeholder="请选择进度计划"
            readonly
          />
          <van-field
            v-model="logData.section"
            label="标段"
            readonly
          />
          <van-field
            v-model="logData.onsiteLeader"
            label="现场负责人"
            placeholder="请输入现场负责人"
          />
        </van-cell-group>
      </div>
    </div>

    <!-- 今日施工内容 -->
    <div class="work-section">
      <div class="section-title">
        <van-icon name="orders-o" />
        <span>今日施工内容</span>
        <van-button size="small" type="primary" plain hairline round @click="handleAddProcess">
          <van-icon name="plus" />
          添加
        </van-button>
      </div>
      <div class="work-card">
        <div v-if="logData.processes.length === 0" class="empty-process">
          <van-empty description="暂无施工工序" />
        </div>
        <div v-else class="process-list">
          <div v-for="(process, index) in logData.processes" :key="index" class="process-item">
            <van-icon name="cross" class="delete-icon" @click="handleDeleteProcess(index)" />
            <van-field
              v-model="process.processNo"
              label="工序"
              placeholder="请选择工序"
              is-link
              readonly
              clickable
              @click="handleSelectProcess(index)"
            />
            <van-field
              v-model="process.todayContent"
              label="完成内容"
              placeholder="描述今日完成情况"
              type="textarea"
              rows="2"
              autosize
            />
            <van-field
              v-model="process.cumulativeProgress"
              label="累计进度"
              placeholder="0-100"
              type="number"
              :min="0"
              :max="100"
              @blur="
                () => {
                  if (process?.cumulativeProgress < 0) process.cumulativeProgress = 0;
                  if (process?.cumulativeProgress > 100) process.cumulativeProgress = 100;
                }
              "
            >
              <template #right-icon>
                <span class="progress-unit">%</span>
              </template>
            </van-field>
            <van-field
              v-model="process.problems"
              label="存在问题"
              placeholder="请输入存在问题"
              type="textarea"
              rows="2"
              autosize
            />
            <!-- 附件上传 -->
            <van-field label="附件" class="attachment-field">
              <template #input>
                <van-uploader
                  v-model="process.attachmentFiles"
                  accept="image/*, .pdf, .docx, .doc, .xlsx, .xls"
                />
              </template>
            </van-field>
          </div>
        </div>
      </div>
    </div>

    <!-- 工序选择弹窗 -->
    <van-popup v-model:show="showProcessPicker" position="bottom" round>
      <van-cascader
        v-model="cascaderValue"
        title="选择工序"
        :options="processCascaderOptions"
        :placeholder="processCascaderOptions.length === 0 ? '请先选择标段获取工序' : '请选择工序'"
        closeable
        @close="showProcessPicker = false"
        @finish="handleProcessCascaderFinish"
      />
    </van-popup>

    <!-- 明日计划 -->
    <div class="plan-section">
      <div class="section-title">
        <van-icon name="calendar-o" />
        <span>明日施工计划</span>
        <van-button size="small" type="primary" plain hairline round @click="handleAddPlan">
          <van-icon name="plus" />
          添加
        </van-button>
      </div>
      <div class="plan-card">
        <div v-if="logData.plans.length === 0" class="empty-process">
          <van-empty description="暂无明日计划" />
        </div>
        <div v-else class="process-list">
          <div v-for="(plan, index) in logData.plans" :key="index" class="process-item">
            <van-icon name="cross" class="delete-icon" @click="handleDeletePlan(index)" />
            <van-field
              v-model="plan.processName"
              label="工序"
              placeholder="请选择工序"
              is-link
              readonly
              clickable
              @click="handleSelectPlanProcess(index)"
            />
            <van-field
              v-model="plan.content"
              label="明日计划"
              placeholder="描述明日施工计划"
              type="textarea"
              rows="2"
              autosize
            />
            <van-field
              v-model="plan.progress"
              label="累计进度"
              placeholder="0-100"
              type="number"
              :min="0"
              :max="100"
              @blur="
                () => {
                  if (process?.cumulativeProgress < 0) process.cumulativeProgress = 0;
                  if (process?.cumulativeProgress > 100) process.cumulativeProgress = 100;
                }
              "
            >
              <template #right-icon>
                <span class="progress-unit">%</span>
              </template>
            </van-field>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="submit-section">
      <van-button type="primary" round block @click="handleSubmit"> 提交日志 </van-button>
    </div>

    <!-- 提交Loading -->
    <van-overlay v-model:show="submitting" :click-overlay="() => {}">
      <div class="submit-loading">
        <van-loading size="32px" color="#fff">提交中...</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast, showConfirmDialog } from 'vant';
import {
  saveConstructionLog,
  saveConstructionToday,
  saveConstructionTomorrow,
  getProcessTree,
  getLogDetail,
  updateConstructionLog,
  deleteConstructionToday,
  deleteConstructionTomorrow,
} from '@/api/construction-log';
import { batchUpload, getFileInfo } from '@/api/system';
import dayjs from 'dayjs';
import useUserStore from '@/stores/user';

import { useDict } from '@/utils/dict';

defineOptions({
  name: 'ConstructionLog',
});

const { project_name } = useDict('project_name');

// 路由
const router = useRouter();
const route = useRoute();

// 用户Store
const userStore = useUserStore();

// 编辑模式 - 判断是否是从历史记录点击编辑进来的
const isEditMode = computed(() => !!route.query.logId);
const editLogId = computed(() => (route.query.logId ? Number(route.query.logId) : null));

// 当前日期
const currentDate = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
});

// 天气代码映射
const weatherCodeMap = {
  0: '晴',
  1: '晴',
  2: '多云',
  3: '阴',
  45: '雾',
  48: '雾',
  51: '小雨',
  53: '中雨',
  55: '大雨',
  56: '雨夹雪',
  57: '雨夹雪',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  66: '小雪',
  67: '中雪',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  77: '雪粒',
  80: '小雨',
  81: '中雨',
  82: '大雨',
  85: '小雪',
  86: '大雪',
  95: '雷暴',
  96: '雷暴',
  99: '雷暴',
};

// 日志数据
const logData = reactive({
  projectCode: '',
  projectName: '',
  section: '',
  weather: '',
  onsiteLeader: '',
  emergencyEvent: '',
  logNo: '',
  logDate: '',
  status: 1, // 默认"未审核"
  processes: [
    {
      processNo: '',
      level1Process: '',
      level2Process: '',
      level3Process: '',
      todayContent: '',
      cumulativeProgress: '',
      problems: '',
      attachment: '',
      attachmentFiles: [],
    },
  ],
  plans: [
    {
      processName: '',
      content: '',
      progress: '',
    },
  ],
});

watch(
  project_name,
  value => {
    if (value[0]?.value) {
      logData.projectName = value[0].label;
      logData.projectCode = value[0].value;
      fetchProcessTree();
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

// 提交中状态
const submitting = ref(false);

async function fetchProcessTree() {
  try {
    const { data: res } = await getProcessTree(
      logData.projectCode,
      userStore.deptId,
      dayjs().format('YYYY-MM-DD')
    );
    if (res.code === 200 && res.data) {
      processCascaderOptions.value = transformProcessTree(res.data);
    }
  } catch (error) {
    // 静默处理错误
  }
}

function transformProcessTree(data, level = 0) {
  level += 1;
  return data.map(item => {
    const o = {
      text: item.name,
      value: item.name,
      children: item.children ? transformProcessTree(item.children, level) : [],
    };

    if (level === 3) {
      delete o.children;
    }

    return o;
  });
}

// 初始化记录人和天气
onMounted(async () => {
  logData.logDate = new Date().toISOString().slice(0, 10);
  logData.logNo = 'LOG' + Date.now();
  logData.section = userStore.deptName;
  fetchWeather();

  // 编辑模式 - 加载已有日志数据
  if (isEditMode.value && editLogId.value) {
    await loadLogData(editLogId.value);
  }
});

// 加载日志数据（编辑用）
async function loadLogData(id) {
  try {
    const { data: res } = await getLogDetail(id);
    if (res.code === 200 && res.data) {
      const log = res.data.log;
      // 基本信息
      logData.projectCode = log.projectCode;
      logData.projectName = log.projectName;
      logData.section = log.section;
      logData.weather = log.weather;
      logData.onsiteLeader = log.onsiteLeader || '';
      logData.logNo = log.logNo;
      logData.logDate = log.logDate;
      logData.status = log.status;

      // 获取工序树
      if (log.projectCode) {
        await fetchProcessTree();
      }

      // 今日施工内容
      const todayList = res.data.todayList || [];
      // 处理附件（关联ID和URL，便于后续处理删除）
      const processWithAttachments = await Promise.all(
        todayList.map(async p => {
          let attachmentFiles = [];
          if (p.attachment) {
            const fileIds = p.attachment.split(',').filter(Boolean);
            const fileInfos = await Promise.all(
              fileIds.map(async id => {
                try {
                  const fileRes = await getFileInfo(id);
                  if (fileRes.data.code === 200) {
                    const url = fileRes.data.data.url;
                    // 只保留图片类型
                    const ext = url.toLowerCase().split('.').pop();
                    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
                      return { id, url };
                    }
                  }
                } catch {
                  // ignore
                }
                return null;
              })
            );
            attachmentFiles = fileInfos.filter(Boolean);
          }
          return {
            processNo: p.processNo,
            level1Process: p.level1Process,
            level2Process: p.level2Process,
            level3Process: p.level3Process,
            todayContent: p.todayContent,
            cumulativeProgress: p.cumulativeProgress,
            problems: p.problems || '',
            attachment: p.attachment || '',
            attachmentFiles,
          };
        })
      );
      logData.processes = processWithAttachments;
      if (logData.processes.length === 0) {
        logData.processes.push({
          processNo: '',
          level1Process: '',
          level2Process: '',
          level3Process: '',
          todayContent: '',
          cumulativeProgress: '',
          problems: '',
          attachment: '',
          attachmentFiles: [],
        });
      }

      // 明日施工计划
      const tomorrowList = res.data.tomorrowList || [];
      logData.plans = tomorrowList.map(p => ({
        processName: p.processName,
        processNo: p.processNo,
        level1Process: p.level1Process,
        level2Process: p.level2Process,
        content: p.tomorrowPlan,
        progress: p.plannedProgress,
      }));
      if (logData.plans.length === 0) {
        logData.plans.push({
          processName: '',
          processNo: '',
          content: '',
          progress: '',
        });
      }
    }
  } catch (error) {
    showToast('加载数据失败');
  }
}

// 获取天气
async function fetchWeather() {
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=36.860317&longitude=109.325230&current_weather=true'
    );
    const data = await res.json();
    if (data.current_weather) {
      const { temperature, weathercode } = data.current_weather;
      const weatherText = weatherCodeMap[weathercode] || '未知';
      logData.weather = `${weatherText} ${temperature}℃`;
    }
  } catch (error) {
    // 静默处理错误，使用默认值
    logData.weather = '晴 0℃';
  }
}

// 获取天气图标
function getWeatherIcon() {
  if (!logData.weather) return 'Sunny';
  if (logData.weather.includes('晴')) return 'Sunny';
  if (logData.weather.includes('多云')) return 'cloud-o';
  if (logData.weather.includes('阴')) return 'cloud-o';
  if (logData.weather.includes('雨')) return 'rain';
  if (logData.weather.includes('雪')) return 'snowflake';
  if (logData.weather.includes('雷')) return 'lightning';
  if (logData.weather.includes('雾')) return 'cloud-o';
  return 'Sunny';
}

// 控制状态

// 工序选择相关
const showProcessPicker = ref(false);
const currentProcessIndex = ref(-1);
const cascaderValue = ref('');

// 工序级联选择器数据
const processCascaderOptions = ref([]);

// 方法
// 直接添加施工内容
function handleAddProcess() {
  logData.processes.push({
    processNo: '',
    level1Process: '',
    level2Process: '',
    level3Process: '',
    todayContent: '',
    cumulativeProgress: '',
    problems: '',
    attachment: '',
    attachmentFiles: [],
  });
}

// 选择工序
function handleSelectProcess(index) {
  if (!logData.section) {
    showToast('请先选择标段');
    return;
  }
  currentProcessIndex.value = index;
  cascaderValue.value = '';
  showProcessPicker.value = true;
}

function handleDeleteProcess(index) {
  logData.processes.splice(index, 1);
}

// 明日计划选择工序
const currentPlanIndex = ref(-1);

function handleAddPlan() {
  logData.plans.push({
    processName: '',
    processNo: '',
    level1Process: '',
    level2Process: '',
    content: '',
    progress: '',
  });
}

function handleDeletePlan(index) {
  logData.plans.splice(index, 1);
}

function handleSelectPlanProcess(index) {
  if (!logData.section) {
    showToast('请先选择标段');
    return;
  }
  currentPlanIndex.value = index;
  cascaderValue.value = '';
  showProcessPicker.value = true;
}

// 处理级联选择完成
function handleProcessCascaderFinish({ selectedOptions }) {
  // 判断是今日施工内容还是明日计划
  const isTomorrow = currentPlanIndex.value >= 0;
  const index = isTomorrow ? currentPlanIndex.value : currentProcessIndex.value;
  const list = isTomorrow ? logData.plans : logData.processes;
  const item = list[index];

  if (item && selectedOptions.length >= 3) {
    if (isTomorrow) {
      // 明日计划
      item.level1Process = selectedOptions[0].text;
      item.level2Process = selectedOptions[1].text;
      item.level3Process = selectedOptions[2].text;
      item.processName = selectedOptions.map(opt => opt.text).join(' / ');
      item.processNo = selectedOptions.map(opt => opt.text).join(' / ');
    } else {
      // 今日施工内容
      item.level1Process = selectedOptions[0].text;
      item.level2Process = selectedOptions[1].text;
      item.level3Process = selectedOptions[2].text;
      item.processNo = selectedOptions.map(opt => opt.text).join(' / ');
    }
  } else if (item && selectedOptions.length === 2) {
    if (isTomorrow) {
      item.level1Process = selectedOptions[0].text;
      item.level2Process = selectedOptions[1].text;
      item.processName = selectedOptions.map(opt => opt.text).join(' / ');
      item.processNo = selectedOptions.map(opt => opt.text).join(' / ');
    } else {
      item.level1Process = selectedOptions[0].text;
      item.level2Process = selectedOptions[1].text;
      item.processNo = selectedOptions.map(opt => opt.text).join(' / ');
    }
  } else if (item && selectedOptions.length === 1) {
    if (isTomorrow) {
      item.level1Process = selectedOptions[0].text;
      item.processName = selectedOptions[0].text;
      item.processNo = selectedOptions[0].text;
    } else {
      item.level1Process = selectedOptions[0].text;
      item.processNo = selectedOptions[0].text;
    }
  }

  // 重置索引
  currentProcessIndex.value = -1;
  currentPlanIndex.value = -1;
  showProcessPicker.value = false;
}

async function handleSubmit() {
  // 校验：至少有一个施工内容
  const validProcesses = logData.processes.filter(p => p.processNo || p.level1Process);
  if (validProcesses.length === 0) {
    showToast('请至少添加一个施工内容');
    return;
  }

  // 校验每个施工内容的必填字段
  for (let i = 0; i < logData.processes.length; i++) {
    const p = logData.processes[i];
    // 跳过空项
    if (!p.processNo && !p.level1Process) continue;

    if (!p.processNo && !p.level1Process) {
      showToast(`第${i + 1}个施工内容请选择工序`);
      return;
    }
    if (!p.todayContent) {
      showToast(`第${i + 1}个施工内容请输入完成内容`);
      return;
    }
    if (!p.cumulativeProgress && p.cumulativeProgress !== 0) {
      showToast(`第${i + 1}个施工内容请输入累计进度`);
      return;
    }
  }

  const confirmMsg = isEditMode.value ? '确定要重新提交施工日志吗？' : '确定要提交施工日志吗？';

  showConfirmDialog({
    title: '确认提交',
    message: confirmMsg,
  })
    .then(async () => {
      submitting.value = true;
      try {
        let logId;
        if (isEditMode.value) {
          // 编辑模式：更新日志
          const { data: res } = await updateConstructionLog({
            ...logData,
            id: editLogId.value,
            status: 1, // 重新提交后状态变为"未审核"
          });
          if (res.code === 200) {
            logId = editLogId.value;
          } else {
            submitting.value = false;
            showToast(res.msg || '提交失败');
            return;
          }

          // 编辑模式下，先删除旧的今日施工内容和明日计划
          // 获取详情以获取关联的ID
          const { data: detailRes } = await getLogDetail(logId);
          if (detailRes.code === 200 && detailRes.data) {
            // 删除旧的今日施工内容
            const todayIds = (detailRes.data.todayList || []).map(t => t.id).join(',');
            if (todayIds) {
              await deleteConstructionToday(todayIds);
            }
            // 删除旧的明日施工计划
            const tomorrowIds = (detailRes.data.tomorrowList || []).map(t => t.id).join(',');
            if (tomorrowIds) {
              await deleteConstructionTomorrow(tomorrowIds);
            }
          }
        } else {
          // 新增模式：创建日志，状态为"未审核"
          const { data: res } = await saveConstructionLog({
            ...logData,
            status: 1,
          });
          if (res.code === 200) {
            logId = res.data;
          } else {
            submitting.value = false;
            showToast(res.msg || '提交失败');
            return;
          }
        }

        if (logId && logData.processes.length > 0) {
          // 处理每个施工内容：上传附件并获取ID
          const todayData = await Promise.all(
            logData.processes.map(async p => {
              // 跳过空项
              if (!p.processNo && !p.level1Process) return null;

              // 获取需要上传的文件（过滤掉新增的文件，有file对象且没有url的）
              const filesToUpload = (p.attachmentFiles || [])
                .filter(f => f.file && !f.url)
                .map(f => f.file);

              // 上传附件获取ID
              let newAttachmentIds = '';
              if (filesToUpload.length > 0) {
                const uploadRes = await batchUpload(filesToUpload);
                if (uploadRes.data.code === 200 && uploadRes.data.data) {
                  newAttachmentIds = uploadRes.data.data.join(',');
                }
              }

              // 获取保留的原有附件ID（attachmentFiles中带有id的）
              const existingIds = (p.attachmentFiles || [])
                .filter(f => f.id)
                .map(f => f.id)
                .join(',');

              // 合并：保留的原有ID + 新上传的ID
              let finalAttachmentIds = '';
              if (existingIds && newAttachmentIds) {
                finalAttachmentIds = existingIds + ',' + newAttachmentIds;
              } else if (existingIds) {
                finalAttachmentIds = existingIds;
              } else if (newAttachmentIds) {
                finalAttachmentIds = newAttachmentIds;
              }

              return {
                processNo: p.processNo,
                level1Process: p.level1Process,
                level2Process: p.level2Process,
                level3Process: p.level3Process,
                todayContent: p.todayContent,
                cumulativeProgress: p.cumulativeProgress,
                problems: p.problems,
                attachment: finalAttachmentIds, // 最终的文件ID拼接
                logId: logId,
                todayDate: logData.logDate,
              };
            })
          );
          // 过滤掉空项
          const filteredTodayData = todayData.filter(Boolean);
          // 保存今日施工内容
          if (filteredTodayData.length > 0) {
            await saveConstructionToday(filteredTodayData);
          }

          // 保存明日施工计划
          if (logData.plans.length > 0) {
            const tomorrowData = logData.plans.map(p => ({
              processNo: p.processNo,
              processName: p.processName,
              level1Process: p.level1Process,
              level2Process: p.level2Process,
              tomorrowPlan: p.content,
              plannedProgress: p.progress,
              logId: logId,
              todayDate: logData.logDate,
              tomorrowDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
            }));
            await saveConstructionTomorrow(tomorrowData);
          }
        }

        showToast('提交成功');
        submitting.value = false;
        setTimeout(() => router.back(), 500);
      } catch (error) {
        submitting.value = false;
        showToast(error.message || '提交失败');
      }
    })
    .catch(() => {
      // 取消
    });
}
</script>

<style scoped lang="less">
.construction-log {
  min-height: calc(100vh - 46px - 50px);
  background: #f5f5f5;
  padding-bottom: 20px;
  overflow-y: auto;
}

// 页面头部
.page-header {
  background: linear-gradient(135deg, #065f46 0%, #059669 100%);
  padding: 20px 16px;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-info {
    .page-title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 4px 0;
    }

    .page-date {
      font-size: 13px;
      opacity: 0.9;
      margin: 0;
    }
  }

  .header-weather {
    display: flex;
    flex-direction: column;
    align-items: center;

    .weather-icon {
      font-size: 28px;
    }

    .weather-text {
      font-size: 12px;
      margin-top: 2px;
      opacity: 0.9;
    }
  }
}

// 通用区块
.info-section,
.schedule-section,
.work-section,
.problem-section,
.plan-section {
  margin: 16px;
  margin-bottom: 12px;

  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;

    :deep(.van-icon) {
      color: #059669;
    }

    .van-button {
      margin-left: auto;
    }

    .van-switch {
      margin-left: auto;
    }
  }
}

// 明日计划
.plan-card {
  .process-list {
    background: #f5f5f5;

    .process-item {
      background: #fff;
      border-radius: 8px;
      padding: 16px 24px;
      margin-bottom: 12px;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }

      .delete-icon {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 20px;
        color: #ee6666;
        cursor: pointer;
        padding: 4px;
        z-index: 1;

        &:hover {
          color: #f56c6c;
        }
      }

      :deep(.van-cell) {
        background: transparent;
        padding: 12px 0;

        &:not(:last-child)::after {
          border-bottom: 1px solid #ebedf0;
        }
      }

      .progress-unit {
        color: #666;
      }
    }
  }
}

// 施工工序
.work-card {
  .empty-process {
    padding: 20px;
    text-align: center;
  }

  .process-list {
    background: #f5f5f5;

    .process-item {
      background: #fff;
      border-radius: 8px;
      padding: 16px 24px;
      margin-bottom: 12px;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }

      .delete-icon {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 20px;
        color: #ee6666;
        cursor: pointer;
        padding: 4px;
        z-index: 1;

        &:hover {
          color: #f56c6c;
        }
      }

      :deep(.van-cell) {
        background: transparent;
        padding: 12px 0;

        &:not(:last-child)::after {
          border-bottom: 1px solid #ebedf0;
        }
      }

      .progress-unit {
        color: #666;
      }
    }
  }
}

// 预设工序快捷选择
.preset-process {
  padding: 0 16px;

  .preset-title {
    font-size: 13px;
    color: #999;
    margin: 12px 0 8px;
  }

  .preset-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .preset-tag {
      cursor: pointer;
    }
  }
}

// 提交按钮
.submit-section {
  padding: 16px;
  margin-top: 8px;
}

// 提交Loading
.submit-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
}

// 添加工序弹窗
.add-process-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #eee;

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

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding-top: 16px;

    :deep(.van-cell-group--inset) {
      margin: 0 16px;
      border-radius: 8px;
    }

    .popup-footer {
      padding: 16px;
    }
  }
}

// 进度计划选择弹窗
.schedule-picker-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #eee;

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

  .popup-content {
    flex: 1;
    overflow-y: auto;
    padding-top: 16px;

    :deep(.van-cell-group--inset) {
      margin: 0 16px;
      border-radius: 8px;
    }

    .schedule-label {
      color: #666;
      font-size: 13px;
    }
  }
}

// 工序选择弹窗
.process-picker-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #fff;
    border-bottom: 1px solid #eee;

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

  .popup-content {
    flex: 1;
    overflow-y: auto;
  }
}

// 附件上传样式
.attachment-field {
  :deep(.van-field__input) {
    display: flex;
    align-items: flex-start;
  }
}

.attachment-area {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.attachment-content {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #f7f8fa;
  border: 1px dashed #dcdee0;
  border-radius: 8px;
  cursor: pointer;

  .upload-icon {
    font-size: 24px;
    color: #969799;
  }

  .attachment-count {
    font-size: 12px;
    color: #969799;
    margin-top: 4px;
  }
}

.attachment-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .preview-item {
    position: relative;
    width: 80px;
    height: 80px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
    }

    .preview-delete {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 18px;
      color: #ee6666;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
    }
  }
}

// 图片选择弹窗
.type-select-content {
  display: flex;
  justify-content: space-around;
  padding: 30px 20px;

  .type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;

    img {
      width: 60px;
      height: 60px;
    }

    div {
      font-size: 14px;
      color: #333;
    }
  }
}
</style>
