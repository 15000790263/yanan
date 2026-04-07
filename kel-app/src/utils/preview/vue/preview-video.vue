<template>
  <div class="video-preview">
    <video ref="video" :src="url" controls @click.stop></video>
  </div>
</template>

<script setup>
defineProps({
  url: {
    type: String,
    default: '',
  },
});
</script>

<style lang="less" scoped>
.video-preview {
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;

  video {
    width: 100%;
  }
}
</style>
