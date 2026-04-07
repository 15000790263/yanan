<script setup>
import { ref } from 'vue';
// 图片资源路径
const navHome = new URL('@/assets/image/home/nav-home.png', import.meta.url).href;
const navProfile = new URL('@/assets/image/home/nav-profile.png', import.meta.url).href;

const active = ref('home');
</script>

<template>
  <nav
    class="bottom-nav"
    role="navigation"
  >
    <button class="nav-item" :class="{ active: active === 'home' }" @click="active = 'home'">
      <img :src="navHome" alt="home" class="nav-icon" />
      <span class="nav-label" :class="{ 'nav-label-active': active === 'home' }">首页</span>
    </button>
    <button class="nav-item" :class="{ active: active === 'profile' }" @click="active = 'profile'">
      <img :src="navProfile" alt="profile" class="nav-icon" />
      <span class="nav-label" :class="{ 'nav-label-active': active === 'profile' }">个人</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  width: 100%;
  height: 56px;
  flex-shrink: 0;
  background-color: #fff;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.05);
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 7px 0;
}
.nav-icon {
  width: 26px;
  height: 24px;
  object-fit: contain;
}
.nav-label {
  font-family: 'PingFang SC', sans-serif;
  font-size: 10px;
  color: #8B8B8B;
  text-align: center;
}
.nav-label-active {
  color: #216FB8;
}
</style>