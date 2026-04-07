<script setup>
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  value: {
    type: String,
    default: '',
  },
  defaultValue: {
    type: String,
    default: '--',
  },
  paddingBottom: {
    type: Number,
    default: 8,
  },
});
</script>

<template>
  <div class="one-attr" :style="{ paddingBottom: props.paddingBottom + 'px' }">
    <div class="label">{{ props.label }}:</div>
    <div class="value">{{ props.value ?? props.defaultValue }}</div>
    <slot name="icon"></slot>
  </div>
</template>

<style lang="less" scoped>
.one-attr {
  display: flex;
  align-items: start;
  .label {
    font-size: 14px;
    color: rgb(50, 50, 51);
    margin-right: 8px;
  }
  .value {
    font-size: 14px;
    flex: 1;
    color: rgb(150, 151, 153);
    // 文字缩略样式
    // overflow: hidden;
    // text-overflow: ellipsis;
    // white-space: nowrap;
  }
}
</style>
