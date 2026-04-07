<script setup>
import { computed } from 'vue';

const props = defineProps({
  taskCount: {
    type: Number,
    default: 0,
  },
  finishCount: {
    type: Number,
    default: 0,
  },
});

const total = computed(() => +props.taskCount + +props.finishCount);

const percent = computed(() => {
  if (total.value === 0) return 0;
  return (+props.finishCount / +total.value) * 100;
});

const percentInt = computed(() => {
  // return Math.floor(percent.value);
  // 保留一位小数
  return percent.value.toFixed(1);
});

const colorGroup = computed(() => {
  console.log('percent.value', percent.value);
  if (percent.value >= 80) {
    return {
      bg: 'rgba(0, 176, 153, 0.11)',
      bar: '#00B099',
    };
  } else if (percent.value >= 50) {
    return {
      bg: '#e8f3ff',
      bar: '#25A0E2',
    };
  }

  return {
    bg: 'rgba(255, 106, 0, 0.11)',
    bar: '#FF6A00',
  };
});
</script>

<template>
  <div class="statistic-container">
    <div class="finish-task">
      <div class="info task">任务 {{ total }}</div>
      <div class="info finish">完成 {{ props.finishCount }}</div>
    </div>

    <div class="progress">
      <span :style="{ color: colorGroup.bar }">进度</span>
      <div class="progress-bar" :style="{ background: colorGroup.bg }">
        <div
          class="progress-bar-inner"
          :style="{ background: colorGroup.bar, width: `${percent}%` }"
        ></div>
      </div>
      <span :style="{ color: colorGroup.bar }">{{ percentInt }}%</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.statistic-container {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .progress {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    color: #ff6a00;
    height: 8px;
    font-size: 14px;

    .progress-bar {
      flex: 1;
      position: relative;
      height: 8px;
      border-radius: 20px;
      margin: 0px 4px;
      .progress-bar-inner {
        position: absolute;
        top: 0;
        left: 0;
        height: 8px;
        border-radius: 20px;
      }
    }
  }

  .finish-task {
    display: flex;
    justify-content: center;
    align-items: center;
    .info {
      flex-wrap: nowrap;
      margin-right: 8px;
      min-width: 69px;
      height: 28px;
      border-radius: 4px;
      padding: 4px;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .task {
      color: #ff6a00;
      background: rgba(255, 106, 0, 0.11);
    }

    .finish {
      background: rgba(0, 176, 153, 0.11);
      color: #00b099;
    }
  }
}
</style>
