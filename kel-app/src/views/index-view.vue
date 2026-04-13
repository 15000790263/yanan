<template>
  <div class="index-view">
    <van-config-provider class="config-provider" theme="light">
      <van-nav-bar
        class="index-view-title"
        :title="titleStoreData.title"
        @click-left="returnBack"
      />
      <div class="index-view-content" :class="{ 'has-menu': menu.length }">
        <RouterView></RouterView>
      </div>
      <van-tabbar v-if="menu.length" v-model="active" active-color="#2EC192" @change="onChange">
        <van-tabbar-item v-for="(item, i) in menu" :key="i" :name="item.name">
          <span>{{ item.text }}</span>
          <template #icon="props">
            <img :src="props.active ? item.active : item.inactive" alt="" />
          </template>
        </van-tabbar-item>
      </van-tabbar>
    </van-config-provider>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import emitter from '../utils/event-bus';
import { useTitle } from '@/hooks/use-title';
import { checkUpdate } from '../utils/check-update';

const { titleStoreData } = useTitle();

const router = useRouter();
const route = useRoute();

const active = ref('');
const menu = ref([]);

// 首页和个人中心 tabbar 菜单
const mainMenu = [
  {
    name: 'home',
    text: '首页',
    active: new URL('../assets/image/home/homeHL2.png', import.meta.url).href,
    inactive: new URL('../assets/image/home/home2.png', import.meta.url).href,
  },
  {
    name: 'mine',
    text: '个人',
    active: new URL('../assets/image/home/userHL2.png', import.meta.url).href,
    inactive: new URL('../assets/image/home/user2.png', import.meta.url).href,
  },
];

function onDeviceReady() {
  // 检查更新
  checkUpdate();
}

onMounted(() => {
  // 默认加载首页和个人中心 tabbar
  menu.value = mainMenu;
  active.value = 'home';

  document.addEventListener('deviceready', onDeviceReady, false);
});

onBeforeUnmount(() => {
  document.removeEventListener('deviceready', onDeviceReady);
});

function onChange(data) {
  switch (data) {
    case 'home':
      router.replace('/index/home');
      break;
    case 'mine':
      router.replace('/index/mine');
      break;
    default:
      break;
  }
}

function returnBack() {
  emitter.emit('leftBack');

  if (route.meta.isBack) {
    router.push('/index');
  } else {
    router.back();
  }
}
</script>

<style scoped lang="less">
.index-view {
  width: 100%;
  height: 100%;

  &-title {
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);

    :deep(.van-nav-bar__content) {
      .van-haptics-feedback {
        .van-badge__wrapper {
          color: #fff;
        }
      }

      .van-nav-bar__title {
        color: #fff;
      }
    }
  }

  &-content {
    width: 100%;
    height: calc(100% - 46px);
    background: #f5f5f5;
    position: relative;
    overflow-y: auto;

    &.has-menu {
      height: calc(100% - 46px - 50px) !important;
    }
  }
}

:deep(.van-tabbar) {
  // top: calc(100vh - 50px) !important;
  bottom: unset !important;
  left: 0 !important;
  width: 100vw !important;
}
</style>
