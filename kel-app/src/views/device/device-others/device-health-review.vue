<template>
  <div class="wrapper">
    <div class="menu-wrapper">
      <div class="menu-item">
        <div class="menu-item-title">名称: 高处安全作业 流程版本: v3</div>
        <div class="menu-item-title">流程分类: 1</div>
        <span class="status">发起流程</span>
      </div>
      <div class="menu-item">
        <div class="menu-item-title">名称: 高处安全作业 流程版本: v3</div>
        <div class="menu-item-title">流程分类: 1</div>
        <span class="status">正在审核</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: #eee;

  .menu-wrapper {
    display: grid;
    gap: 12px;
    padding: 12px;
    .menu-item {
      width: 100%;
      padding: 15px 12px 8px 12px;
      font-size: 12px;
      background-color: #fff;
      border-radius: 8px;
      position: relative;
      &-title {
        margin: 0 0 6px 0;
      }
      .status {
        position: absolute;
        right: 23px;
        top: 23px;
        font-size: 14px;
        color: green;
      }
    }
  }
}
</style>
