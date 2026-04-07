<template>
  <div class="warning-item">
    <div class="warning-item-top">
      <div class="warning-item-top-message">
        <div class="warning-name">{{ props.warning.name }}</div>
        <div class="">报警时间：{{ props.warning.receiveTime }}</div>
        <div class="">接警人：{{ props.warning.submitBy }}</div>
        <div class="">报警电话：{{ props.warning.submitPhone }}</div>
        <div class="warning-pos">{{ props.warning.address }}</div>
      </div>
      <div class="warning-item-top-level" :style="`color:${level[props.warning.level - 1]?.color}`">
        <div class="level-value" :style="`border-color:${level[props.warning.level - 1]?.color}`">
          {{ props.warning.level || '未评' }}级
        </div>
        <div class="level-name">{{ level[props.warning.level - 1]?.name }}</div>
      </div>
    </div>
    <div class="warning-item-des">
      {{ props.warning.description }}
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  warning: {
    type: Object,
    required: false,
    default: () => {},
  },
});
const level = ref([
  {
    value: 1,
    name: '一级',
    color: '#FF5656',
  },
  {
    value: 1,
    name: '二级',
    color: '#ff9c56',
  },
  {
    value: 1,
    name: '三级',
    color: '#3e8ffa',
  },
]);
</script>

<style scoped lang="less">
.warning-item {
  &-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    &-message {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 12px;
      color: #949b97;
      .warning-name {
        font-weight: bold;
        font-size: 14px;
        color: #1e1e1e;
        padding-bottom: 8px;
      }
      .warning-pos {
        padding: 12px 0 8px 0;
      }
    }
    &-level {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      .level-value {
        width: 38px;
        height: 38px;
        border: 4px solid;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .level-name {
      }
    }
  }
  &-des {
    background: #ecf3f3;
    padding: 8px;
    font-size: 12px;
    color: #949b97;
    margin-bottom: 12px;
  }
}
</style>
