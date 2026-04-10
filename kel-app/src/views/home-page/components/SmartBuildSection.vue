<script setup>
// 图片资源路径
const smartTitleIcon = new URL('@/assets/image/home/smart-title-icon.png', import.meta.url).href;
const iconJihua = new URL('@/assets/image/home/icon-jihua.png', import.meta.url).href;
const iconRizhi = new URL('@/assets/image/home/icon-rizhi.png', import.meta.url).href;
const iconBaoshen = new URL('@/assets/image/home/icon-baoshen.png', import.meta.url).href;
const iconBaoyan = new URL('@/assets/image/home/icon-baoyan.png', import.meta.url).href;
const iconZhiliang = new URL('@/assets/image/home/icon-zhiliang.png', import.meta.url).href;
const iconAnquan = new URL('@/assets/image/home/icon-anquan.png', import.meta.url).href;
const iconXietiao = new URL('@/assets/image/home/icon-xietiao.png', import.meta.url).href;
const iconTongzhi = new URL('@/assets/image/home/icon-tongzhi.png', import.meta.url).href;

const menuItems = [
  { icon: iconJihua, label: '进度计划', url: '/progress/plan' },
  // { icon: iconRizhi, label: '施工日志', url: '/log/entry' },
  { icon: iconRizhi, label: '施工日志', url: '/log/index' },
  { icon: iconBaoshen, label: '资料报审' },
  { icon: iconBaoyan, label: '物资报验' },
  { icon: iconZhiliang, label: '质量监督' },
  { icon: iconAnquan, label: '安全监督' },
  { icon: iconXietiao, label: '问题协调' },
  { icon: iconTongzhi, label: '通知公告', url: '/notice/index' },
];
</script>

<template>
  <div class="smart-section">
    <div class="card-inner">
      <div class="section-header">
        <img :src="smartTitleIcon" alt="" class="section-icon" />
        <span class="section-title">数智建造</span>
      </div>
      <div class="divider"></div>
      <div class="menu-grid">
        <button
          v-for="item in menuItems"
          :key="item.label"
          class="menu-item"
          @click="item.url && $router.push(item.url)"
        >
          <div class="icon-box">
            <img :src="item.icon" :alt="item.label" class="menu-icon" />
            <span class="menu-label">{{ item.label }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.smart-section {
  position: relative;
  margin: 0 12px;
  border-radius: 15px;
  overflow: hidden;
}
.card-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 15px;
}
.card-inner {
  position: relative;
  z-index: 1;
  padding: 18px 8px 17px 8px;
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
  background: #d8e1e4;
  margin-bottom: 12px;
}
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 3px 4px;
  cursor: pointer;
}
.icon-box {
  width: 74px;
  height: 74px;
  background: #ecf3f7;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.menu-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.menu-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 12px;
  color: #666666;
  text-align: center;
  white-space: nowrap;
}
</style>
