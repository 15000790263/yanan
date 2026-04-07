<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'device', // device | line
  },
});

const emit = defineEmits(['onSwitch']);
</script>

<template>
  <div class="my-switch" @click="emit('onSwitch', $event)">
    <div
      :class="{
        active: props.type === 'device',
        item: true,
      }"
    >
      设备
    </div>
    <div
      :class="{
        active: props.type === 'line',
        item: true,
      }"
    >
      管线
    </div>
  </div>
</template>

<style lang="less" scoped>
.my-switch {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  background-color: #e5e5e5;
  border-radius: 16px;
  color: #666;
  font-size: 13px;
  .item {
    flex: 1;
    width: 50%;
    background-color: transparent;
    padding: 4px;
    border-radius: 16px;
    text-align: center;
  }
  .active {
    background-color: #2a82e4;
    color: #fff;
  }
}
</style>
