<script setup>
import icon_qr from '../../../../assets/image/check/icon_qr.png';

const emit = defineEmits(['onClickQR']);
</script>

<template>
  <div class="btn-container">
    <div class="btn" @click="emit('onClickQR')">
      <img :src="icon_qr" width="24" height="24" />
      <span class="text">扫描设备二维码</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.btn-container {
  width: 100%;
  height: 58px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: white;
  .btn {
    position: absolute;
    width: 216px;
    height: 34px;
    border-radius: 30px;
    opacity: 1;
    background: #ff6a00;
    display: flex;
    justify-content: center;
    align-items: center;

    .text {
      margin-left: 8px;
      color: white;
      font-size: 16px;
    }
  }
}
</style>
