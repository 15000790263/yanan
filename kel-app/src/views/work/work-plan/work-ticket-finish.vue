<template>
  <div class="wrapper">
    <div class="icon">作业票已保存</div>
    <van-button class="btn" round plain type="success" @click="checkFinishTicket"
      >查询归档作业票</van-button
    >
    <div class="text">{{ currentTime }}s后跳转首页</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const currentTime = ref(3);
let timer;
function time() {
  if (currentTime.value === 0) {
    router.goBack();
    return;
  }
  timer = setTimeout(() => {
    currentTime.value--;
    time();
  }, 1000);
}
onMounted(time);
onUnmounted(() => {
  clearTimeout(timer);
});

const route = useRoute();

function checkFinishTicket() {
  const { procInsId, id } = route.query;
  router.push({
    path: '/work/work-ticket-detail',
    query: {
      procInsId,
      id,
    },
  });
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box !important;
}

.wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  .icon {
    flex: 1;
    background: url('/src/assets/image/work/icon-saved.png') no-repeat 50% 40%/60px;
    display: grid;
    place-items: center;

    font-family: 思源黑体;
    font-size: 14px;
    color: #34394f;
  }

  .btn {
    height: 40px;
    width: 203px;
    height: 38px;
    border-radius: 156px;
    border: 1px solid #00b099;

    font-family: 思源黑体;
    font-size: 14px;

    font-feature-settings: 'kern' on;
    color: #00b099;
  }
  .text {
    height: 90px;
    margin-top: 8px;

    font-size: 14px;
    color: #bbcece;
  }
}
</style>
