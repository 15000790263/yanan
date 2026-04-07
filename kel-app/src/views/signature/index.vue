<template>
  <div class="wrapper">
    <template v-if="userStore.signature">
      <div style="padding: 8px">旧签名：</div>
      <div style="height: 198px; width: 100%; padding: 8px">
        <img
          style="border: 3px dashed #d4d4d4; border-radius: 6px"
          :src="userStore.signature"
          alt=""
        />
      </div>
    </template>

    <div style="margin-top: 10px; padding: 8px">新签名：</div>
    <van-signature
      background-color="#fff0"
      type=""
      :line-width="4"
      :clear-button-text="haveS ? '清空' : '取消'"
      @submit="onSubmit"
      @clear="onClear"
      @end="onEnd"
    />
  </div>
</template>

<script setup>
import { updateUser, getUserPermissionsInfo } from '@/api/system.js';
import useUserStore from '../../../src/stores/user';
import { showToast } from 'vant';

const userStore = useUserStore();

const router = useRouter();

const image = ref('');

const haveS = ref(false);

function onEnd() {
  haveS.value = true;
}

async function onSubmit(data) {
  if (!data.image) {
    return;
  }
  image.value = data.image;
  const res = await getUserPermissionsInfo(userStore.userId);
  await updateUser({
    ...{
      ...res.data.data,
      postIds: res.data.postIds,
      posts: res.data.posts,
      roleIds: res.data.roleIds,
      roles: res.data.roles,
    },
    signature: data.image,
  });
  await userStore.getInfo();
  showToast('操作成功');
  setTimeout(() => {
    router.replace('/index');
  }, 500);
}

function onClear() {
  if (haveS.value) {
    haveS.value = false;
    initName();
  } else {
    router.replace('/index');
  }
}

onMounted(() => {
  initName();
});

function initName() {
  const canvasEl = document.querySelector('canvas');

  const ctx = canvasEl.getContext('2d');

  // 设置字体
  ctx.font = '12px Arial'; // 字体大小和字体类型

  const name = userStore.nickName;

  const nameLength = name.length;

  // 设置填充颜色
  ctx.fillStyle = 'red';
  // 在画布上绘制填充文本
  ctx.fillText(
    name,
    canvasEl.getBoundingClientRect().width - 30 - nameLength * 12,
    canvasEl.getBoundingClientRect().height - 30
  ); // 文本内容，x坐标，y坐标
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: #fff;
  padding: 16px;
  padding-top: 0;

  .van-signature {
    height: 40vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  :global(.van-signature__content) {
    background-color: #fff;
    border: 3px dashed #d4d4d4;
  }

  .van-signature {
  }
}
</style>
