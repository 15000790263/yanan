<template>
  <div class="progress-index">
    <van-nav-bar
      class="index-view-title"
      :title="titleStoreData?.title"
      left-arrow
      @click-left="returnBack"
    />
    <router-view class="router-view-content" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useTitle } from '@/hooks/use-title';

defineOptions({
  name: 'ProgressIndex',
});

const { titleStoreData } = useTitle();
const router = useRouter();

/** 返回上一页 */
function returnBack() {
  router.back();
}
</script>

<style scoped lang="less">
.progress-index {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.index-view-title {
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.progress-index :deep(.router-view-content) {
  margin-top: 46px;
}
</style>
