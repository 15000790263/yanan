<template>
  <div class="home-index">
    <!-- <van-button @click="pageToSystem('emergency')">应急</van-button> -->
    <div class="menu-item" @click="test">生产管理</div>
    <div class="menu-item" @click="$router.push('/test')">值班管理</div>
    <div class="menu-item">巡检管理</div>
    <div class="menu-item" @click="pageToSystem('work')">作业管理</div>
    <div class="menu-item">工单管理</div>
    <div class="menu-item">设备管理</div>
    <div class="menu-item">智慧管网</div>
    <div class="menu-item" @click="pageToSystem('emergency')">应急管理</div>
    <div class="logout" @click="logout">
      <van-icon name="revoke" size="24" />
      <div>退出登录</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { systemStore } from '@/stores/system';
import { getUserRole } from '@/utils/session';
import { clearToken } from '../../utils/session';
import { showConfirmDialog } from 'vant';

const router = useRouter();

const useSystem = systemStore();

function pageToSystem(type) {
  useSystem.changeSystem(type);
  switch (type) {
    case 'emergency':
      router.push('/emergency/fact');
      break;
    case 'work':
      handleWorkRouter();
      break;
    default:
      break;
  }
}

function handleWorkRouter() {
  const role = getUserRole();
  switch (role) {
    case '1':
      router.push('/work/work-plan-approve');
      break;
    case '2':
      router.push('/work/work-plan-secure');
      break;
    case '3':
      router.push('/work/work-statistics');
      break;
    default:
      router.push('/work/work-plan');
      break;
  }
}

function logout() {
  showConfirmDialog({
    title: '温馨提示',
    message: '您确定要退出登录吗？',
    className: 'update-app-dialog',
  }).then(() => {
    navigator.app?.exitApp();
    clearToken();
  });
}

function test() {
  // window.open(new URL('./test.html', import.meta.url).href, '_self');
}
</script>

<style scoped lang="less">
.home-index {
  height: 100%;
  width: 100%;
  background: url('/src/assets/image/login/bg.png') no-repeat center/100%;
  display: grid;
  place-items: center;
  grid-template-columns: repeat(2, 1fr);
  padding: 8vh 12vw 20vh;
  gap: 20px;

  .menu-item {
    font-family: SourceHanSansCN;
    font-size: 16px;
    text-align: center;
    color: #fff;
    padding: 80px 27px 14px;
    background:
      url('/src/assets/image/login/button-component-bg.png') no-repeat center/100%,
      url('/src/assets/image/login/icon-1.png') no-repeat center 15px/50%;
  }

  .logout {
    color: #fff;
    height: 10vh;
    width: 10vh;
    position: fixed;
    left: 50%;
    bottom: 4vh;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    background: url('/src/assets/image/login/button-component-bg.png') no-repeat center/100%;
  }
}
</style>
