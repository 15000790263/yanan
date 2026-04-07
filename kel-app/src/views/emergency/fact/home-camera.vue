<template>
  <div class="home-camera">
    <div class="change-buttons">
      <div class="button" @click="changePage">地图</div>
      <div class="button button-active">监控</div>
    </div>
    <div class="camera-list-content">
      <div
        class="camera-list-item"
        v-for="(item, i) in cameraList"
        :key="i"
        @click="clickCamera(item)"
      >
        <img src="../../../assets/image/emergency/camera/camera.png" alt="" />
        {{ item.NAME }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { getCameraList } from '@/api/camera';
import { useRouter } from 'vue-router';

const router = useRouter();
const cameraList = ref([]);

onMounted(() => {
  searchList();
});

function searchList() {
  getCameraList().then(res => {
    cameraList.value = res.data.responseModelList[0].dataTable.stringRowsMaps;
  });
}

function changePage() {
  router.push('/emergency/home');
}

function clickCamera(data) {
  router.push({
    name: 'emergency-home-camera-content',
    query: data,
  });
}
</script>

<style scoped lang="less">
.home-camera {
  width: calc(100% - 16px * 2);
  height: calc(100% - 16px * 2);
  padding: 16px;
  .change-buttons {
    width: 134px;
    height: 34px;
    padding: 1%;
    margin: 0 auto 12px;
    border-radius: 50px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .button {
      flex: 1;
      height: 34px;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .button-active {
      color: #000;
      border-radius: 50px;
      background: linear-gradient(
        180deg,
        #ffffff 0%,
        rgba(172, 180, 212, 0.8788) 70%,
        #f2f3f7 100%
      );
    }
  }
  .camera-list-content {
    width: calc(100% - 12 * 2);
    height: calc(100% - 34px - 12px - 16px * 2);
    overflow: auto;
    border-radius: 4px;
    background: #ffffff;
    box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
    padding: 12px;
    .camera-list-item {
      padding: 16px;
      border-bottom: 1px solid #e1e8f3;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}
</style>
