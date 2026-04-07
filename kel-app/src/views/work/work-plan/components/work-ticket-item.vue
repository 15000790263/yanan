<template>
  <div class="ticket-item-wrapper">
    <div class="badge">
      <span>{{ index }}</span>
    </div>
    <div class="name">{{ workOperationType || name }}</div>
    <ul v-show="procInsId">
      <li v-show="operationTime">
        <img src="/src/assets/image/work/icon-map-pin-time-fill.png" alt="" />
        <span>{{ operationTime }}至{{ operationEndTime }}</span>
      </li>
      <li v-show="operationCompanyInfo?.dept_name">
        <img src="/src/assets/image/work/icon-map-pin-4-fill.png" alt="" />
        <span>{{ operationCompanyInfo?.dept_name }}</span>
      </li>
      <li>
        <img src="/src/assets/image/work/icon-work.png" alt="" />
        <span>作业环节{{ stepsList.length || 0 }}个</span>
      </li>
    </ul>
    <template v-if="isFinish">
      <div class="res-icon">
        <img src="/src/assets/image/work/home-label-accomplish.png" alt="" />
      </div>
    </template>
    <template v-if="isFinish === false">
      <div v-if="status === '2'" class="status timeout">超时作废</div>
      <!-- 没有未通过，只会被拒绝到某个阶段，直到通过或者超时，在这之前都是进行中 -->
      <div v-else-if="status === '1'" class="status valid">有效时间 {{ validTime }}</div>
      <div v-else-if="status === null && !isMyBack" class="status failed">审核中</div>
      <div v-else-if="status === null && isMyBack" class="status revoke">待提交</div>
      <div v-else class="status no-apply">未申请</div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { getTicketProcess, getFileByProcessId, worktodoList } from '../../../../api/work';
import { onActivated, onMounted } from 'vue';

const props = defineProps([
  'index',
  'workOperationType',
  'operationCompanyInfo',
  'operationTime',
  'operationEndTime',
  'status',
  'procInsId',
  'id',
  'name',
]);
const validTime = computed(() => {
  return dayjs(props.operationEndTime).fromNow(true);
});

// 作业票是否手签完成
const isFinish = ref();

// 获取当前作业票环节数
async function getStepCount() {
  if (props.procInsId) {
    const { data } = await getTicketProcess(props.procInsId);
    if (data.rows.length) {
      await getFileByProcessId(data.rows[data.rows.length - 1].id).then(({ data }) => {
        const { rows } = data;
        const arr = [];
        const filterByuuidArr = [];
        // 去除作业票手签上传的文件（作业票id===stepId）
        const newRows = rows.filter(item => props.id != item.stepId);
        isFinish.value = rows.findIndex(item => props.id == item.stepId) !== -1;
        /* 因为更新做成了新增，所以删除之前所有的图片后在新增会导致顺序错乱
          所以要reverse数组后使用unshift方法添加
        */
        newRows.reverse().forEach(item => {
          const stepId = item.stepId;
          if (arr.includes(stepId)) {
            filterByuuidArr
              .find(value => value.stepId === stepId)
              .workFilesUrl.push({ url: item.workFile });
          } else {
            arr.push(stepId);
            filterByuuidArr.unshift(item);
            item.workFilesUrl = [{ url: item.workFile }];
          }
        });

        // 问题：调换workFile=''和有值的顺序

        filterByuuidArr.forEach(item => {
          item.workFilesUrl = item.workFilesUrl.filter(item => item.url !== '');
        });

        if (stepsList.value.length) {
          const stepsId = stepsList.value.map(item => item.stepId);
          const arr = filterByuuidArr.filter(item => !stepsId.includes(item.stepId));
          stepsList.value.unshift(...arr);
        } else {
          stepsList.value = filterByuuidArr;
        }
      });
    } else {
      isFinish.value = false;
    }
  } else {
    isFinish.value = false;
  }
}
const stepsList = ref([]);
getStepCount();

onMounted(() => {
  getStepCount();
  getWorktodoList();
});

onActivated(() => {
  getStepCount();
  getWorktodoList();
});

// 已退回的状态
const isMyBack = ref(false);

function getWorktodoList() {
  if (props.status === null) {
    worktodoList({
      pageNum: 1,
      pageSize: 1000,
    }).then(res => {
      const { records } = res.data.data;
      if (records.length) {
        const o = records.find(item => item.procInsId == props.procInsId);
        isMyBack.value = !!o;
      } else {
        isMyBack.value = false;
      }
    });
  }
}
</script>

<style lang="less" scoped>
.ticket-item-wrapper {
  width: 302px;
  height: 103px !important;
  border-radius: 4px;
  background: #c0e9e7;
  box-shadow: inset 0px 4px 30px 0px rgba(255, 255, 255, 0.3);
  flex: 0 0 103px;
  position: relative;

  .badge {
    position: absolute;
    left: 0px;
    top: 8px;
    width: 28px;
    height: 24px;
    border-radius: 0px 12px 12px 0px;
    background: linear-gradient(270deg, #ff9b53 0%, #ffc70e 100%);

    > span {
      position: absolute;
      left: 8px;
      top: 2px;
      width: 28.57%;
      height: 70.83%;
      opacity: 1;

      font-family: Source Han Sans;
      font-size: 12px;
      font-weight: bold;
      line-height: normal;
      letter-spacing: 0em;

      color: #ffffff;
    }
  }

  .name {
    position: absolute;
    left: 32px;
    top: 10px;
    height: 19.42%;
    opacity: 1;

    font-family: 思源黑体;
    font-size: 14px;
    font-weight: normal;
    line-height: normal;
    letter-spacing: 0em;

    /* app-color-1 */
    color: #34394f;
  }

  ul {
    position: absolute;
    left: 30px;
    top: 34px;
    height: 59px;

    display: flex;
    flex-direction: column;
    padding: 0px;
    gap: 4px;
    justify-content: space-around;

    li {
      display: flex;
      align-items: center;

      > img {
        width: 16px;
        height: 16px;
      }
      > span {
        display: inline-block;
        height: 17px;
        font-family: 思源黑体;
        font-size: 12px;
        color: #17617e;
      }
    }
  }

  .status {
    position: absolute;
    left: 182px;
    top: 69px;
    width: 108px;
    height: 24px;
    border-radius: 4px;
    background: #169fa4;
    box-shadow: inset 0px 0px 11px 0px #007b81;

    font-family: 思源黑体;
    font-size: 12px;
    font-weight: normal;
    line-height: normal;
    text-align: center;
    letter-spacing: 0em;
    line-height: 24px;
    color: #ffffff;

    &.failed {
      background: #ee5151;
      box-shadow: inset 0px 0px 11px 0px #b00000;
    }

    &.timeout {
      background: #ff6a0e;
      box-shadow: inset 0px 0px 10px 0px rgba(59, 0, 0, 0.3);
    }

    &.no-apply {
      background: #ff9f0e;
      box-shadow: inset 0px 0px 10px 0px rgba(59, 0, 0, 0.3);
    }

    &.revoke {
      background: #16afe7;
      box-shadow: inset 0px 0px 10px 0px rgba(59, 0, 0, 0.3);
    }
  }

  .res-icon {
    position: absolute;
    right: 12px;
    top: 8px;
    width: 48px;
    height: 48px;
    opacity: 1;
  }
}
</style>
