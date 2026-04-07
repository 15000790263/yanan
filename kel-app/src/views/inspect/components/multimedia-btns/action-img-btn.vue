<script setup>
import icon_action_photo from '../../../../assets/image/check/icon_action_photo.png';

const emit = defineEmits(['onActionClick']);
</script>

<template>
  <div class="action-btn-container" @click="emit('onActionClick')">
    <img :src="icon_action_photo" width="24" height="24" />
    <div class="text">上传图片</div>
  </div>
</template>

<style lang="less" scoped>
.action-btn-container {
  width: 140px;
  height: 70px;
  border-radius: 4px;
  background: #f7fdfd;
  border: 1px solid #bbcece;
  color: #84abbb;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .text {
    font-size: 14px;
  }
}
</style>
