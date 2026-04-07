<script setup>
import { computed } from 'vue';

const props = defineProps({
  activeImg: {
    type: String,
    default: '',
  },
  inactiveImg: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  noItemImg: {
    // 不要图片
    type: Boolean,
    default: false,
  },
});

const imgSrc = computed(() => {
  return props.isActive ? props.activeImg : props.inactiveImg;
});

const textStyle = computed(() => {
  return {
    color: props.isActive ? '#2EC192' : '#BBCECE',
  };
});
</script>

<template>
  <div class="item">
    <img v-if="!noItemImg" class="img" :src="imgSrc" width="64" height="64" />
    <div class="name" :style="textStyle">{{ props.name }}</div>
    <div class="line" v-if="isActive"></div>
  </div>
</template>

<style lang="less" scoped>
.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  .img {
  }
  .name {
    color: #bbcece;
    font-size: 12px;
  }
  .line {
    position: absolute;
    width: 24px;
    height: 4px;
    left: 50%;
    bottom: 10px;
    border-radius: 10px;
    transform: translate(-50%);
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
  }
}
</style>
