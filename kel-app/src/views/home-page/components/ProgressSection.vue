<script setup>
import { Progress } from 'vant';
import 'vant/lib/progress/style';
import { ref, onMounted } from 'vue';
import { getScheduleProgress } from '@/api/schedule';

// 图片资源路径
const progressTitleIcon = new URL('@/assets/image/home/smart-title-icon.png', import.meta.url).href;

// 标段进度数据
const mainProgress = ref(0);
const subSections = ref([
  { name: '一标段', progress: 0, color: 'linear-gradient(90deg, #2C5DFF 0%, #3BE5FF 102%)' },
  { name: '二标段', progress: 0, color: 'linear-gradient(270deg, #FF3731 0%, #FF6D3D 100%)' },
  { name: '三标段', progress: 0, color: 'linear-gradient(90deg, #FFF531 0%, #FFA83D 99%)' },
]);

// 获取进度数据
const fetchProgress = async () => {
  try {
    const res = await getScheduleProgress();
    const data = res.data.data;
    mainProgress.value = Math.round(data.overallProgress);
    subSections.value[0].progress = Math.round(data.section1Progress);
    subSections.value[1].progress = Math.round(data.section2Progress);
    subSections.value[2].progress = Math.round(data.section3Progress);
  } catch (error) {
    console.error('获取进度数据失败:', error);
  }
};

onMounted(() => {
  fetchProgress();
});
</script>

<template>
  <div class="progress-section">
    <div class="card-inner">
      <!-- Header row -->
      <div class="section-header">
        <img :src="progressTitleIcon" alt="" class="section-icon" />
        <span class="section-title">施工进度</span>
      </div>
      <div class="divider"></div>

      <!-- Main progress bar with label -->
      <div class="main-progress-area">
        <span class="pct-label">{{ mainProgress }}%</span>
        <div class="main-bar-row">
          <div class="bar-label-pill">
            <span class="pill-text">施工进度</span>
          </div>
          <div class="main-bar-track">
            <van-progress
              class="w-full"
              :percentage="mainProgress"
              :stroke-width="12"
              :show-pivot="false"
              color="linear-gradient(90deg, #2c99ff, #6cff3b)"
              track-color="#e8eaec"
            />
          </div>
        </div>
      </div>

      <!-- Sub progress rows -->
      <div class="sub-rows">
        <div class="sub-row">
          <span class="sub-label">{{ subSections[0].name }}</span>
          <div class="sub-track">
            <van-progress
              class="w-full"
              :percentage="subSections[0].progress"
              :stroke-width="12"
              :show-pivot="false"
              :color="subSections[0].color"
              track-color="#e8eaec"
            />
          </div>
          <span class="sub-pct">{{ subSections[0].progress }}%</span>
        </div>

        <div class="sub-row">
          <span class="sub-label">{{ subSections[1].name }}</span>
          <div class="sub-track">
            <van-progress
              class="w-full"
              :percentage="subSections[1].progress"
              :stroke-width="12"
              :show-pivot="false"
              :color="subSections[1].color"
              track-color="#e8eaec"
            />
          </div>
          <span class="sub-pct">{{ subSections[1].progress }}%</span>
        </div>

        <div class="sub-row">
          <span class="sub-label">{{ subSections[2].name }}</span>
          <div class="sub-track">
            <van-progress
              class="w-full"
              :percentage="subSections[2].progress"
              :stroke-width="12"
              :show-pivot="false"
              :color="subSections[2].color"
              track-color="#e8eaec"
            />
          </div>
          <span class="sub-pct">{{ subSections[2].progress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-section {
  position: relative;
  margin: 0 12px;
  border-radius: 16px;
  overflow: hidden;
}
.card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 16px;
}
.card-inner {
  position: relative;
  z-index: 1;
  padding: 18px 12px 14px 12px;
  border-radius: 16px;
  background: #ffffff;
}
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.section-icon {
  width: 15px;
  height: 12px;
  object-fit: contain;
}
.section-title {
  font-family: 'PingFang SC', sans-serif;
  font-size: 16px;
  color: #666666;
}
.divider {
  height: 2px;
  background: #d9e1e4;
  margin: 0 0 6px 0;
}
.main-progress-area {
  padding: 0 0 8px;
}
.pct-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #448ccd;
  display: block;
  margin-bottom: 2px;
  padding-left: 74px;
}
.main-bar-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.bar-label-pill {
  background: #216fb8;
  border-radius: 4px;
  padding: 4px 8px;
  flex-shrink: 0;
}
.pill-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #fff;
  white-space: nowrap;
}
.main-bar-track {
  flex: 1;
  height: 12px;
  background: #e8eaec;
  border-radius: 6px;
  overflow: hidden;
}
.main-bar-fill {
  width: 17%;
  height: 100%;
  background: linear-gradient(90deg, #2c99ff, #6cff3b);
  border-radius: 6px;
}

/* Sub rows */
.sub-rows {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.sub-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f4f4f4;
  border-radius: 4px;
  padding: 13px 16px 13px 28px;
  box-sizing: border-box;
}
.sub-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 13px;
  color: #8f9193;
  flex-shrink: 0;
  width: 43px;
}
.sub-track {
  flex: 1;
  height: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.bar-progress-img {
  width: 100%;
  height: 12px;
  object-fit: contain;
}
.sub-bar-img {
  display: none;
}
.sub-pct {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 300;
  color: #888a8c;
  flex-shrink: 0;
  width: 30px;
  text-align: right;
}
</style>
