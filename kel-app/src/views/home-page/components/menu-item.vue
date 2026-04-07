<template>
  <div class="menu-item" @click="handleClick">
    <img class="menu-item-icon" :src="icon || defaultIcon" alt="" />
    <div class="menu-item-title">{{ title }}</div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
});

// 默认图标
const defaultIcon = new URL('../../assets/image/home/icon-bolt.png', import.meta.url).href;

function handleClick() {
  // TODO: 实现页面跳转
}
</script>

<style scoped lang="less">
.menu-item {
  height: 106px;
  width: 106px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #e4eef4 0%, #d4e4f4 100%);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #e4eef4 0%, #d4e4f4 100%);
    z-index: 0;
  }

  &:active {
    transform: scale(0.95);
    &::before {
      background: linear-gradient(135deg, #d4e4f4 0%, #c4d4e4 100%);
    }
    .menu-item-icon {
      transform: scale(1.1);
    }
  }

  .menu-item-icon {
    height: 44px;
    width: 32px;
    object-fit: contain;
    position: relative;
    z-index: 1;
    transition: transform 0.3s ease;
  }

  .menu-item-title {
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: #34394f;
    font-weight: 500;
    margin-top: 6px;
  }
}
</style>
