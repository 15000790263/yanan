<template>
  <div class="emergency-warning-progress">
    <van-steps direction="vertical">
      <van-step v-for="(item, i) in messageList" :key="i">
        <h3>{{ item.eventTime }}</h3>
        <p>{{ item.content }}</p>
      </van-step>
    </van-steps>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { getEventProcess } from '@/api/emergency';
import { warningStore } from '@/stores/emergency/warning';

const useWarning = warningStore();

const messageList = ref([]);

watch(
  () => useWarning.warning,
  () => {
    searchProgress();
  },
  {
    deep: true,
  }
);

onMounted(() => {
  searchProgress();
});

function searchProgress() {
  getEventProcess(useWarning.warning.id).then(res => {
    messageList.value = res.data.rows;
  });
}
</script>

<style scoped lang="less">
.emergency-warning-progress {
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
  overflow: auto;
}
</style>
