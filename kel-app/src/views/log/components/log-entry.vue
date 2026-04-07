<template>
  <div class="log-entry">
    <!-- 施工日志填报 -->
    <div class="entry-card" @click="goToFill">
      <div class="entry-icon">
        <van-icon name="edit" size="32" color="#1989fa" />
      </div>
      <div class="entry-content">
        <div class="entry-title">施工日志填报</div>
        <div class="entry-desc">填写今日施工情况</div>
      </div>
      <div class="entry-arrow">
        <van-icon name="arrow" size="16" color="#969799" />
      </div>
    </div>

    <!-- 施工历史记录 -->
    <div class="entry-card" @click="goToHistory">
      <div class="entry-icon">
        <van-icon name="orders-o" size="32" color="#1989fa" />
      </div>
      <div class="entry-content">
        <div class="entry-title">施工历史记录</div>
        <div class="entry-desc">查看历史填报记录</div>
      </div>
      <div class="entry-arrow">
        <van-icon name="arrow" size="16" color="#969799" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

defineOptions({
  name: 'LogEntry',
});

const router = useRouter();

/** 跳转到施工日志填报页面 */
function goToFill() {
  router.push('/log/construction-log');
}

/** 跳转到施工历史记录页面 */
function goToHistory() {
  router.push('/log/log-history');
}
</script>

<style scoped lang="less">
.log-entry {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entry-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  display: flex;
  align-items: center;
  transition: transform 0.15s ease;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
}

.entry-icon {
  width: 48px;
  height: 48px;
  background: #e6f4ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.entry-content {
  flex: 1;
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.entry-title {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.entry-desc {
  font-size: 13px;
  color: #969799;
}

.entry-arrow {
  flex-shrink: 0;
  margin-left: 8px;
}
</style>