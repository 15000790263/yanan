<template>
  <div class="wrapper">
    <div class="menu-wrapper">
      <template v-for="(item, index) in menuList" :key="index">
        <div class="menu-item" @click="$router.push(item.path)">
          <span>
            {{ item.text }}
          </span>
          <span><van-icon name="arrow" /></span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const menuList = ref([
  {
    text: '设备维修',
    path: '/device/device-repair',
  },
  {
    text: '设备保养',
    path: '/device/device-health',
  },
  {
    text: '设备检定',
    path: '/device/device-verification',
  },
]);
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: rgba(245, 245, 245, 1);

  .menu-wrapper {
    display: grid;
    gap: 8px;
    padding: 24px;

    .menu-item {
      width: 100%;
      height: 48px;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      padding: 0 24px;

      background-color: #fff;
      border-radius: 8px;

      font-family: Source Han Sans;
      font-size: 14px;
      color: #34394f;
    }
  }
}
</style>
