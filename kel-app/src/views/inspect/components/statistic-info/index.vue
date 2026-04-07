<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  allStateTotal: {
    type: Number,
    default: 0,
  },
  statisticValue: {
    type: Object,
    default: () => {
      return {
        errCount: 0,
        okCount: 0,
        totalCount: 0,
      };
    },
  },
});

const emit = defineEmits(['onViewStateSelected']);

const activeType = ref('all');

const handleClick = type => {
  activeType.value = type;

  emit('onViewStateSelected', type);
};

const totalCount = computed(() => {
  console.log('props.statisticValue.totalCount', props.statisticValue.totalCount);
  return props.statisticValue.totalCount === 0
    ? props.allStateTotal
    : props.statisticValue.totalCount;
});
</script>

<template>
  <div class="infos">
    <div :class="['item', 'all', activeType === 'all' ? 'active' : '']" @click="handleClick('all')">
      <div class="count">{{ totalCount }}</div>
      <div class="label">已巡检</div>
    </div>

    <div
      :class="['item', 'error', activeType === 'error' ? 'active' : '']"
      @click="handleClick('error')"
    >
      <div class="count">{{ props.statisticValue.errCount }}</div>
      <div class="label">异常</div>
    </div>

    <div :class="['item', 'ok', activeType === 'ok' ? 'active' : '']" @click="handleClick('ok')">
      <div class="count">{{ props.statisticValue.okCount }}</div>
      <div class="label">正常</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.infos {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  padding: 12px 0px;
  padding-bottom: 0px;
  width: 100%;
  // background-color: white;
  // box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);

  .item {
    margin: 8px;
    width: 93px;
    height: 40px;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #e0f3f4;
  }
}
.active {
  border: 1px solid #00b099;
}
.error {
  color: #ff3700;
}

.ok {
  color: #1d73ff;
}
.all {
  color: #00b099;
}
.count {
  font-size: 24px;
}
.label {
  margin-left: 4px;
  font-size: 13px;
}
</style>
