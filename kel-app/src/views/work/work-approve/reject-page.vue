<template>
  <div class="wrapper">
    <template v-if="!saved">
      <div class="plan-name">作业计划 {{ planInfo?.projectName }}</div>
      <div class="info">
        <div class="name">{{ name }}</div>
        <div class="dept">{{ planInfo?.deptName?.split('-')?.shift() }}</div>
        <div class="date">{{ planInfo?.createTime }}</div>
      </div>
      <div class="content">
        <van-field v-model.trim="view" label="" placeholder="请输入" type="textarea" />
      </div>
      <div class="footer">
        <div class="confirm" @click="confirm">确定</div>
        <div class="cancel" @click="$router.goBack()">取消</div>
      </div>
    </template>
    <transition name="slide-left">
      <template v-if="saved">
        <div class="status">
          <div class="icon"></div>
          <div class="text">作业计划不通过</div>
          <div class="route">{{ time }}秒后跳转首页</div>
        </div>
      </template>
    </transition>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getUserInfo, getUserinfoById, getWorkById, updatePlan } from '../../../api/work';
import { onUnmounted } from 'vue';
import dayjs from 'dayjs';
import { showToast } from 'vant';

const route = useRoute();
const router = useRouter();

const planInfo = ref(null);

const name = ref('');

onMounted(() => {
  const id = route.query.id;
  if (id) {
    getWorkById(id).then(res => {
      planInfo.value = res.data.data;
      getUserinfoById(res.data.data.sysuserId).then(res => {
        name.value = res.data.nickName;
      });
    });
  }
});

// 定时器
let timer = -1;
const time = ref(3);

// 审批拒绝意见
const view = ref('');

const saved = ref(false);
async function confirm() {
  if (!view.value) {
    showToast('请输入原因！');
    return;
  }
  const { data: res } = await getUserInfo();
  const reviewUserId = res.data.userId;

  const data = {
    id: planInfo.value.id,
    reviewComments: view.value,
    reviewDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    reviewStatus: '2',
    reviewUserId,
  };
  await updatePlan(data);
  saved.value = true;
  timer = setInterval(() => {
    time.value--;
    if (time.value === 0) {
      clearInterval(timer);
      goHome();
    }
  }, 1000);
}

function goHome() {
  router.goBack();
}

onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}

.wrapper {
  height: 100%;
  width: 100%;
  padding: 30px;
  background-color: #fff;
  position: relative;

  .plan-name {
    width: 100%;
    text-align: center;
    color: #52899e;
    margin-bottom: 30px;
  }

  .info {
    display: grid;
    grid-template-columns: 1fr auto 3fr;
    column-gap: 16px;
    justify-content: space-between;
    align-items: center;
    color: #34394f;
    font-size: 14px;

    .dept {
      background-color: #ade4dd;
      padding: 2px;
      color: #17617e;
      display: grid;
      place-items: center;
    }

    .date {
      justify-self: end;
      color: #84abbb;
    }
  }

  .content {
    margin-top: 20px;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;

    :deep(.van-field__control) {
      height: 50vh;
    }
  }

  .footer {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 58px;
    background: #fff;
    padding: 12px 80px;
    display: grid;
    grid-template-columns: repeat(2, auto);
    column-gap: 15px;

    .confirm {
      width: 100px;
      height: 34px;
      border-radius: 30px;
      background: #ff6a00;
      color: #fff;
      display: grid;
      place-items: center;
    }

    .cancel {
      width: 100px;
      height: 34px;
      border-radius: 30px;
      box-sizing: border-box;
      border: 1px solid #8db5c5;
      color: #8db5c5;
      display: grid;
      place-items: center;
    }
  }

  .status {
    height: 100%;

    .icon {
      width: 72px;
      height: 72px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -90px);
      background: url('/src/assets/image/work/icon-error.png') no-repeat center/contain;
    }

    .text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .route {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #84abbb;
    }
  }
}
</style>
