<template>
  <div class="home">
    <div class="scroll-content">
      <HeroHeader />
      <div class="content-bg">
        <div class="sections-rail">
          <!-- <ProgressSection /> -->
          <!-- <div class="section-gap"></div> -->
          <SmartBuildSection />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import HeroHeader from './components/HeroHeader.vue';
import ProgressSection from './components/ProgressSection.vue';
import SmartBuildSection from './components/SmartBuildSection.vue';
import BottomNav from './components/BottomNav.vue';
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
  font-family: 'PingFang SC', 'Inter', system-ui, sans-serif;
}
.scroll-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.content-bg {
  padding-bottom: 12px;
  background: #ecf3f7;
  flex: 1;
}
.sections-rail {
  width: 100%;
  padding: 12px 0 0 0;
  box-sizing: border-box;
}
.section-gap {
  height: 12px;
}
.fixed-chrome {
  flex-shrink: 0;
}
</style>
