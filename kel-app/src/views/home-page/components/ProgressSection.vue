<script setup>
// 图片资源路径
const progressTitleIcon = new URL('@/assets/image/home/smart-title-icon.png', import.meta.url).href;
const progressBar1 = new URL('@/assets/image/home/progress-bar-1.png', import.meta.url).href;
const progressBar2 = new URL('@/assets/image/home/progress-bar-2.png', import.meta.url).href;
const progressBar3 = new URL('@/assets/image/home/progress-bar-3.png', import.meta.url).href;
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
        <span class="pct-label">17%</span>
        <div class="main-bar-row">
          <div class="bar-label-pill">
            <span class="pill-text">施工进度</span>
          </div>
          <div class="main-bar-track">
            <div class="main-bar-fill"></div>
          </div>
        </div>
      </div>

      <!-- Sub progress rows -->
      <div class="sub-rows">
        <div class="sub-row">
          <img :src="progressBar1" alt="" class="sub-bar-img" />
          <span class="sub-label">一标段</span>
          <div class="sub-track">
            <img :src="progressBar1" alt="" class="bar-progress-img" />
          </div>
          <span class="sub-pct">21%</span>
        </div>

        <div class="sub-row">
          <span class="sub-label">二标段</span>
          <div class="sub-track">
            <img :src="progressBar2" alt="" class="bar-progress-img" />
          </div>
          <span class="sub-pct">15%</span>
        </div>

        <div class="sub-row">
          <span class="sub-label">三标段</span>
          <div class="sub-track">
            <img :src="progressBar3" alt="" class="bar-progress-img" />
          </div>
          <span class="sub-pct">12%</span>
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
