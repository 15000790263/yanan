<template>
  <div class="notice-page">
    <!-- 顶部导航栏 -->
    <div class="nav-header">
      <div class="nav-left" @click="goBack">
        <van-icon name="arrow-left" class="back-icon" />
        <span class="nav-title">通知公告</span>
      </div>
      <div class="nav-right">
        <span class="add-btn" @click="showAddPopup = true">新增</span>
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
        <div
          v-for="(item, index) in cardList"
          :key="index"
          class="card-item"
          @click="openDetailPopup(item)"
        >
          <div class="card-content-wrap">
            <div class="card-header">
              <span v-if="activeTab === 'notice'" class="card-type" :class="'type-' + item.type">{{
                getTypeLabel(item.type)
              }}</span>
              <span class="card-time">{{ item.time }}</span>
            </div>
            <p class="card-title">{{ item.title }}</p>
            <p class="card-content">{{ item.content }}</p>
          </div>
          <div class="card-image">
            <img
              v-if="item.imageList && item.imageList.length > 0"
              :src="item.imageList[0]"
              alt=""
            />
            <img v-else src="@/assets/image/notice/bg.png" alt="" />
          </div>
        </div>
        <van-empty v-if="!loading && cardList.length === 0" description="暂无数据" />
      </div>
      <!-- 其他标签 -->
      <div v-else class="empty-wrap">
        <van-empty description="暂无数据" />
      </div>
    </div>

    <!-- 新增弹窗 -->
    <van-popup v-model:show="showAddPopup" position="bottom" round :style="{ height: '70%' }">
      <div class="add-popup">
        <div class="popup-header">
          <span class="popup-title">新增通知</span>
          <van-icon name="cross" @click="showAddPopup = false" />
        </div>
        <van-form @submit="handleSubmit">
          <van-cell-group>
            <van-field
              v-model="addForm.title"
              name="title"
              label="标题"
              placeholder="请输入标题"
              :rules="[{ required: true, message: '请输入标题' }]"
            />
            <van-field
              v-model="addForm.type"
              is-link
              readonly
              name="type"
              label="类型"
              placeholder="请选择类型"
              @click="showTypePicker = true"
              :rules="[{ required: true, message: '请选择类型' }]"
            />
            <van-field v-model="addForm.publishDate" readonly name="publishDate" label="发布日期" />
            <van-field
              v-model="addForm.content"
              name="content"
              label="内容"
              type="textarea"
              rows="4"
              placeholder="请输入内容"
              :rules="[{ required: true, message: '请输入内容' }]"
            />
            <van-field name="images" label="图片">
              <template #input>
                <van-uploader
                  v-model="addForm.imageFiles"
                  multiple
                  :max-count="9"
                  :after-read="handleImageUpload"
                />
              </template>
            </van-field>
          </van-cell-group>
          <div class="popup-footer">
            <van-button round block type="primary" native-type="submit" :loading="submitLoading">
              提交
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 类型选择器 -->
    <van-popup v-model:show="showTypePicker" position="bottom">
      <van-picker
        :columns="typeColumns"
        @confirm="onTypeConfirm"
        @cancel="showTypePicker = false"
      />
    </van-popup>

    <!-- 详情弹窗 -->
    <van-popup v-model:show="showDetailPopup" position="bottom" round :style="{ height: '90%' }">
      <div v-if="detailItem" class="detail-popup">
        <div class="popup-header">
          <span class="popup-title">详情</span>
          <van-icon name="cross" @click="showDetailPopup = false" />
        </div>
        <div class="detail-content">
          <!-- 图片轮播 -->
          <div v-if="detailItem.imageList && detailItem.imageList.length > 0" class="detail-swipe-wrap">
            <van-swipe class="detail-swipe" :loop="true" indicator-color="#fff">
              <van-swipe-item v-for="(img, idx) in detailItem.imageList" :key="idx">
                <img :src="img" @click="previewImage(detailItem.imageList, idx)" alt="" />
              </van-swipe-item>
            </van-swipe>
          </div>
          <!-- 标题 -->
          <h2 class="detail-title">{{ detailItem.title }}</h2>
          <!-- 信息标签 -->
          <div class="detail-info">
            <span v-if="activeTab === 'notice'" class="detail-type" :class="'type-' + detailItem.type">{{ getTypeLabel(detailItem.type) }}</span>
            <span class="detail-time">{{ detailItem.time }}</span>
          </div>
          <!-- 内容 -->
          <div class="detail-text">{{ detailItem.content }}</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getBusinessNoticeList, addNotice, batchUpload, getFileInfo } from '@/api/notice';
import {
  showToast,
  showLoadingToast,
  closeToast,
  Empty as vanEmpty,
  showImagePreview,
  Swipe as vanSwipe,
  SwipeItem as vanSwipeItem,
  Popup as vanPopup,
  Form as vanForm,
  Field as vanField,
  CellGroup as vanCellGroup,
  Button as vanButton,
  Uploader as vanUploader,
  Picker as vanPicker,
} from 'vant';
import { useDict } from '@/utils/dict';
import config from '@/config';

const router = useRouter();

const activeTab = ref('todo');
const cardList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);

// 新增弹窗相关
const showAddPopup = ref(false);
const submitLoading = ref(false);
const showTypePicker = ref(false);
const showDetailPopup = ref(false);
const detailItem = ref(null);

const addForm = ref({
  title: '',
  type: '',
  typeValue: '', // 类型对应的value值
  publishDate: getCurrentDateTime(),
  content: '',
  imageFiles: [], // 上传组件绑定的文件数组
  fileIds: [], // 上传后的文件ID数组
});

// 获取当前时间格式化字符串
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 获取字典数据
const { notice_announcement_announcement_type } = useDict('notice_announcement_announcement_type');

// 标签页映射
// 固定标签页
const tabs = ref([
  { name: '待办', key: 'todo', badge: 0 },
  { name: '公告', key: 'notice', badge: 0 },
  { name: '晨会', key: 'meeting', badge: 0 },
  { name: '规章', key: 'regulation', badge: 0 },
]);

// 类型选择器列
const typeColumns = computed(() => {
  if (notice_announcement_announcement_type.value) {
    return notice_announcement_announcement_type.value.map(item => ({
      text: item.label,
      value: item.value,
    }));
  }
  return [];
});

// 获取通知列表
async function fetchNoticeList() {
  loading.value = true;
  showLoadingToast({ message: '加载中...', forbidClick: true });
  try {
    const { data: res } = await getBusinessNoticeList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      type: '1', // 晨会 type=1
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
  if (key === 'todo' || key === 'regulation') {
    cardList.value = [];
  } else if (key === 'meeting') {
    fetchNoticeList(); // 单个类型
  } else if (key === 'notice') {
    fetchNoticeListByTypes(['2', '3', '4', '5']); // 多个类型
  }
}

// 查询多个类型的通知列表
async function fetchNoticeListByTypes(types) {
  loading.value = true;
  showLoadingToast({ message: '加载中...', forbidClick: true });
  try {
    const allRows = [];
    for (const type of types) {
      const { data: res } = await getBusinessNoticeList({
        pageNum: 1,
        pageSize: 100,
        type: type,
      });
      if (res.code === 200 && res.rows) {
        allRows.push(...res.rows);
      }
    }
    // 按时间倒序
    allRows.sort(
      (a, b) => new Date(b.publishDate || b.createTime) - new Date(a.publishDate || a.createTime)
    );
    cardList.value = allRows.map(item => {
      let imageList = [];
      if (item.files) {
        const fileArr = item.files.split(';');
        imageList = fileArr.map(url => {
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
  } catch (error) {
    showToast('获取列表失败');
  } finally {
    closeToast();
    loading.value = false;
  }
}

function goBack() {
  router.back();
}

// 显示详情弹窗
function openDetailPopup(item) {
  detailItem.value = item;
  showDetailPopup.value = true;
}

// 根据type获取类型标签
function getTypeLabel(type) {
  const typeMap = {
    2: '业主通知',
    3: '工作检查',
    4: '施工图文',
    5: '监理检查',
  };
  return typeMap[type] || '通知';
}

// 类型选择确认
function onTypeConfirm({ selectedValues, selectedOptions }) {
  const selectedItem = selectedOptions[0];
  addForm.value.type = selectedItem.text;
  addForm.value.typeValue = selectedItem.value;
  showTypePicker.value = false;
}

// 日期选择确认
// 图片上传后处理
async function handleImageUpload(file) {
  const files = Array.isArray(file) ? file : [file];
  const fileList = files.map(f => f.file);
  try {
    const { data: res } = await batchUpload(fileList);
    if (res.code === 200) {
      const fileIds = res.data || [];
      addForm.value.fileIds = [...addForm.value.fileIds, ...fileIds];
    } else {
      showToast('图片上传失败');
    }
  } catch (error) {
    showToast('图片上传失败');
  }
}

// 提交表单
async function handleSubmit() {
  submitLoading.value = true;
  try {
    // 获取文件详情，拼接fileName
    let filesStr = '';
    if (addForm.value.fileIds.length > 0) {
      const fileNamePromises = addForm.value.fileIds.map(id => getFileInfo(id));
      const fileNameRes = await Promise.all(fileNamePromises);
      const fileNames = fileNameRes
        .filter(res => res.data?.code === 200)
        .map(res => res.data.data.fileName);
      filesStr = fileNames.join(';');
    }

    const params = {
      title: addForm.value.title,
      type: addForm.value.typeValue,
      publishDate: addForm.value.publishDate,
      content: addForm.value.content,
      files: filesStr,
      status: '0', // 草稿状态
    };

    const { data: res } = await addNotice(params);
    if (res.code === 200) {
      showToast('提交成功');
      showAddPopup.value = false;
      // 重置表单
      addForm.value = {
        title: '',
        type: '',
        typeValue: '',
        publishDate: getCurrentDateTime(),
        content: '',
        imageFiles: [],
        fileIds: [],
      };
      // 刷新列表
      fetchNoticeList();
    } else {
      showToast(res.msg || '提交失败');
    }
  } catch (error) {
    showToast('提交失败');
  } finally {
    submitLoading.value = false;
  }
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
  display: flex;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 120px;
  cursor: pointer;
}

.card-content-wrap {
  flex: 1;
  padding: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
  background: #d0d0d0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.van-swipe-item) {
  img {
    width: 100%;
    height: 100%;
    object-fit: fill;
  }
}

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
  padding: 2px 8px;
  border-radius: 4px;
}

.card-type.type-2 {
  color: #1976d2;
  background: #e3f2fd;
}

.card-type.type-3 {
  color: #388e3c;
  background: #e8f5e9;
}

.card-type.type-4 {
  color: #f57c00;
  background: #fff3e0;
}

.card-type.type-5 {
  color: #7b1fa2;
  background: #f3e5f5;
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

/* 新增弹窗 */
.add-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.popup-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.popup-footer {
  padding: 16px;
  background: #fff;
}

/* 详情弹窗 */
.detail-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  background: #fff;
}

.detail-swipe-wrap {
  width: 100%;
  height: 250px;
  background: #f5f5f5;
}

.detail-swipe {
  width: 100%;
  height: 100%;
}

.detail-swipe img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  padding: 16px;
  margin: 0;
}

.detail-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 16px;
}

.detail-time {
  font-size: 12px;
  color: #999;
}

.detail-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  padding: 0 16px 16px;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-content-text {
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.detail-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.detail-type.type-2 {
  color: #1976d2;
  background: #e3f2fd;
}

.detail-type.type-3 {
  color: #388e3c;
  background: #e8f5e9;
}

.detail-type.type-4 {
  color: #f57c00;
  background: #fff3e0;
}

.detail-type.type-5 {
  color: #7b1fa2;
  background: #f3e5f5;
}

.detail-image-item {
  width: calc(50% - 4px);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
}

.detail-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
