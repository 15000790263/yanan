<template>
  <div class="notice-page">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-left" @click="goBack">
        <van-icon name="arrow-left" class="back-icon" />
        <span class="nav-title">通知公告</span>
      </div>
      <div class="nav-right">
        <span class="add-btn">新增</span>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tab-bar">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: activeTab === tab.key }]"
        @click="switchTab(tab.key)"
      >
        <span class="tab-text">{{ tab.name }}</span>
        <span v-if="tab.key === 'todo' && tab.badge > 0" class="badge">{{ tab.badge }}</span>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content">
      <!-- 公告列表 -->
      <div v-if="cardList.length > 0" class="card-list">
        <div v-for="(item, index) in cardList" :key="index" class="card-item">
          <!-- 图片轮播 -->
          <van-swipe
            v-if="item.imageList && item.imageList.length > 0"
            class="card-image"
            :loop="true"
            indicator-color="#fff"
          >
            <van-swipe-item v-for="(img, imgIndex) in item.imageList" :key="imgIndex">
              <img :src="img" @click="previewImage(item.imageList, imgIndex)" alt="" />
            </van-swipe-item>
          </van-swipe>
          <div v-else class="card-image"></div>
          <div class="card-text">
            <div class="card-header">
              <span class="card-time">{{ item.time }}</span>
            </div>
            <p class="card-title">{{ item.title }}</p>
            <p class="card-content">{{ item.content }}</p>
          </div>
        </div>
        <van-empty v-if="!loading && cardList.length === 0" description="暂无数据" />
      </div>
      <!-- 其他标签 -->
      <div v-else class="empty-wrap">
        <van-empty description="暂无数据" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getBusinessNoticeList } from '@/api/notice';
import {
  showToast,
  showLoadingToast,
  closeToast,
  Empty as vanEmpty,
  showImagePreview,
  Swipe as vanSwipe,
  SwipeItem as vanSwipeItem,
} from 'vant';
import { useDict } from '@/utils/dict';
import config from '@/config';

const router = useRouter();

const activeTab = ref('todo');
const cardList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 获取字典数据
const { notice_announcement_announcement_type } = useDict('notice_announcement_announcement_type');

// 标签页映射
const tabs = computed(() => {
  const baseTabs = [{ name: '待办', key: 'todo', badge: 3 }];
  if (notice_announcement_announcement_type.value) {
    notice_announcement_announcement_type.value.forEach(item => {
      baseTabs.push({
        name: item.label,
        key: item.value,
        badge: 0,
      });
    });
  }
  return baseTabs;
});

// 获取通知列表
async function fetchNoticeList() {
  loading.value = true;
  showLoadingToast({ message: '加载中...', forbidClick: true });
  try {
    const { data: res } = await getBusinessNoticeList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      type: activeTab.value,
    });

    console.log('获取通知列表', res);
    if (res.code === 200) {
      cardList.value = res.rows.map(item => {
        // 处理图片地址
        let imageList = [];
        if (item.files) {
          const fileArr = item.files.split(';');
          imageList = fileArr.map(url => {
            // 如果已经是完整URL则直接返回，否则拼接fileUrl
            if (url.startsWith('http')) return url;
            return config.fileUrl + url;
          });
        }
        return {
          id: item.id,
          title: item.title,
          content: item.content,
          time: item.publishDate || item.createTime,
          type: item.type,
          files: item.files,
          status: item.status,
          imageList: imageList,
        };
      });
    } else {
      showToast(res.msg || '获取列表失败');
    }
  } catch (error) {
    showToast('获取列表失败');
  } finally {
    closeToast();
    loading.value = false;
  }
}

// 切换标签
function switchTab(key) {
  activeTab.value = key;
  pageNum.value = 1;
  if (key !== 'todo') {
    fetchNoticeList();
  } else {
    cardList.value = []; // 待办显示暂无数据
  }
}

function goBack() {
  router.back();
}

// 预览图片
function previewImage(images, startPosition) {
  if (images && images.length > 0) {
    showImagePreview({
      images,
      startPosition: startPosition,
    });
  }
}
</script>

<style scoped lang="less">
.notice-page {
  width: 100%;
  height: 100vh;
  background: #f0f2f5;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 顶部导航栏 */
.nav-header {
  height: 48px;
  background: linear-gradient(90deg, #1565c0 0%, #42a5f5 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-icon {
  color: #fff;
  font-size: 18px;
}

.nav-title {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  margin-left: 8px;
}

.nav-right {
  display: flex;
  align-items: center;
}

.add-btn {
  color: #fff;
  font-size: 14px;
  padding: 6px 12px;
  border: 1px solid #fff;
  border-radius: 6px;
}

/* 标签页 */
.tab-bar {
  position: fixed;
  top: 48px;
  left: 0;
  right: 0;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
  z-index: 99;
  overflow-x: auto;
}

.tab-item {
  flex-shrink: 0;
  padding: 8px 16px;
  border: 1px solid #1976d2;
  border-radius: 999px;
  color: #1976d2;
  font-size: 14px;
  position: relative;
  background: #fff;
}

.tab-item.active {
  background: #1976d2;
  color: #fff;
}

.tab-text {
  position: relative;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  background: #f44336;
  color: #fff;
  font-size: 11px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

/* 内容区域 */
.content {
  padding: 12px 16px;
  padding-top: 76px;
  overflow-y: auto;
  height: calc(100vh - 48px);
}

.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.card-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-image {
  width: 100%;
  height: 0;
  padding-bottom: 56%;
  background: #d0d0d0;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

// .card-image img {
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
// }

// :deep(.van-swipe) {
//   height: 100%;
//   position: absolute;
//   top: 0;
//   left: 0;
// }

// :deep(.van-swipe-item) {
//   width: 100%;
//   height: 100%;
// }

.card-text {
  padding: 12px 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.card-type {
  font-size: 12px;
  color: #1976d2;
  background: #e3f2fd;
  padding: 2px 8px;
  border-radius: 4px;
}

.card-time {
  font-size: 12px;
  color: #999;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.4;
}

.card-content {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* 标准属性 */
  line-clamp: 2;
}
</style>
