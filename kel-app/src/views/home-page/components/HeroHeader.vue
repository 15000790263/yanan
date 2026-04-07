<script setup>
// 图片资源路径
const heroBg = new URL('@/assets/image/home/hero-bg.png', import.meta.url).href;
const statusSignal = new URL('@/assets/image/home/status-signal.png', import.meta.url).href;
const statusWifi = new URL('@/assets/image/home/status-wifi.png', import.meta.url).href;
const statusBattery = new URL('@/assets/image/home/status-battery.png', import.meta.url).href;
</script>

<template>
  <div class="hero-header">
    <img class="hero-bg" :src="heroBg" alt="" />

    <div class="title-block">
      <p class="hero-title">郝家坪联合站迁建工程<br />数字化交付平台</p>
    </div>
  </div>
</template>

<style scoped>
.hero-header {
  position: relative;
  width: 100%;
  height: 153px;
  overflow: hidden;
  flex-shrink: 0;
}
.hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.status-bar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 0 36px;
  height: 42px;
  box-sizing: border-box;
}
.time {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #c3cae4;
}
.icons {
  display: flex;
  align-items: center;
  gap: 4px;
}
.icons img {
  height: 12px;
  object-fit: contain;
}
.title-block {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 42px;
}
.hero-title {
  margin: 0;
  font-family: 'PingFang SC', 'Inter', sans-serif;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  line-height: 30px;

  background: linear-gradient(180deg, #ffffff 0%, #ffffff 37%, #b4cff2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
</style>
