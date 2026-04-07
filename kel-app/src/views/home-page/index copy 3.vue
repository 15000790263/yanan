<template>
  <div class="home">
    <!-- 顶部横幅 -->
    <div class="banner-wrap" @click="handleBannerClick">
      <img class="banner" :src="bannerBg" alt="banner" />
      <!-- 最新通知标题 -->
      <div v-if="latestNotice" class="notice-title">
        <img class="notice-icon" :src="noticeIcon" alt="notice" />
        <span class="title-text">{{ latestNotice.title }}</span>
      </div>
    </div>
    <!-- 菜单列表 -->
    <div class="menu-list">
      <Menu v-for="menu in menuList" :key="menu.type" :menu="menu" @change="handleMenuChange" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Menu from './components/menu.vue';
import { getMenuConfig } from './menu.config';

const router = useRouter();
const menuList = ref([]);
const latestNotice = ref(null);

// 图片资源路径
const bannerBg = new URL('../../assets/image/home/home-bg.png', import.meta.url).href;
const noticeIcon = new URL('../../assets/image/home/home-message.png', import.meta.url).href;

/** 加载最新通知 */
async function loadLatestNotice() {
  // try {
  //   const res = await getNoticePage({ pageNo: 1, pageSize: 1 })
  //   if (res?.list?.length) {
  //     latestNotice.value = res.list[0]
  //   }
  // } catch (e) {
  //   console.error('获取最新通知失败:', e)
  // }
}

/** 页面加载 */
function onPageLoad() {
  menuList.value = getMenuConfig();
  loadLatestNotice();
}

onPageLoad();

/** 处理横幅点击 */
function handleBannerClick() {
  if (!latestNotice.value?.id) {
    return;
  }
}

/** 处理菜单点击 */
function handleMenuChange(value) {
  router.push(value.url);
}
</script>

<style scoped lang="less">
.home {
  height: calc(100vh - 46px - 50px);
  background-color: #f5f5f5;
  overflow-y: auto;
}

.banner-wrap {
  position: relative;
  width: 100%;
  height: 180px;

  .banner {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  .notice-title {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 350px;
    height: 50px;
    display: flex;
    align-items: center;

    .notice-icon {
      width: 100%;
      object-fit: contain;
    }

    .title-text {
      position: absolute;
      left: 120px;
      flex: 1;
      font-size: 14px;
      color: #333;
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.menu-list {
  padding: 16px;
}
</style>
