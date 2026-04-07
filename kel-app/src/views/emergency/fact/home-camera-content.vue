<template>
  <div class="home-camera-content">
    <video
      class="video-container"
      :src="config.videoUrl + '/' + videoData.APP + '/' + videoData.STREAM + '.live.mp4'"
      controls
      autoplay
    ></video>
  </div>
</template>

<script setup>
import config from '../../../config';
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { titleStore } from '@/stores/title';

const titleStoreData = titleStore();
const route = useRoute();
const videoData = ref({});

onMounted(() => {
  videoData.value = route.query;
  titleStoreData.changeTitle(videoData.value.NAME);
});
</script>

<style scoped lang="less">
.home-camera-content {
  width: calc(100% - 16px * 2);
  padding: 16px;
  .video-container {
    width: 100%;
  }
}
</style>
