<script setup>
import { computed } from 'vue';

import icon_right from '../../../../assets/image/check/icon_right.png';
import StatusTag from '../status-tag/index.vue';

const props = defineProps({
  title: {
    type: String,
    default: 'title',
  },
  desc: {
    type: String,
    default: 'desc',
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
  isTransItem: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['onItemClick']);

const handleClick = () => {
  emit('onItemClick', props.data);
};

// const transData = computed(() => {
//   const delegateDescription = props.data.delegateDescription ?? ''
//   return delegateDescription.split(',')
// })

const isTaskForNow = computed(() => {
  return +props.data.patrolStatus === 0;
});

const timeLabelStr = computed(() => {
  return isTaskForNow.value ? '计划时间' : '巡检时间';
});

const timeStr = computed(() => {
  let taskTime = props.data.patrolBeginDate;
  if (props.data.patrolEndDate) {
    taskTime = taskTime + ' - ' + props.data.patrolEndDate;
  }
  return isTaskForNow.value ? taskTime : props.data.practicalDate;
});
</script>

<template>
  <div class="task-item-container">
    <div class="content">
      <div class="title">
        {{ props.title }}
        <span v-if="showStatus" class="status">
          <status-tag :data="props.data" />
        </span>
      </div>

      <div class="desc">{{ props.desc }}</div>
      <div class="time">{{ timeLabelStr }}:{{ timeStr }}</div>

      <div v-if="props.isTransItem" class="trans">
        {{ props.data.delegateDescription }}
      </div>
    </div>

    <div class="action" @click="handleClick">
      <img :src="icon_right" width="24" height="24" alt="" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.task-item-container {
  margin: 8px 12px;
  background-color: #fff;
  display: flex;
  padding: 8px 16px;
  .content {
    flex: 1;
    color: #343435;
    font-size: 14px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .title {
      margin-bottom: 4px;
    }

    .time {
      margin-top: 4px;
    }
  }

  .action {
    width: 8%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .trans {
    color: #84abbb;
    font-size: 12px;
  }
}
</style>
