<template>
  <div class="emergency-warning-scene">
    <div class="emergency-warning-scene-overview">
      <div class="scene-overview-text-content">
        <div class="scene-overview-text-content-title">现场播报中</div>
        <div class="scene-overview-text-content-num">现场共上报{{ verificationList.length }}次</div>
      </div>
      <div class="scene-overview-icon">
        <img
          src="../../../assets/image/emergency/warning/camera-c.png"
          alt=""
          @click="toSceneReporting"
        />
      </div>
    </div>
    <div class="emergency-warning-scene-verification-lists">
      <verification-show
        class="emergency-warning-scene-verification-lists-item"
        v-for="(item, i) in verificationList"
        :key="i"
        :verification="item"
      ></verification-show>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import VerificationShow from '@/views/emergency/components/verification-show.vue';
import { useRouter } from 'vue-router';
import { warningStore } from '@/stores/emergency/warning';

const router = useRouter();

const useWarning = warningStore();

const verificationList = ref([]);

watch(
  () => useWarning.warning,
  () => {
    searchVerification();
  },
  {
    deep: true,
  }
);

onMounted(() => {
  searchVerification();
});

function searchVerification() {
  verificationList.value = [
    {
      people: '张三',
      time: '2023-01-01 00:00:00',
      desc: '现场情况是现场情况是现场现场情况是现场情况是现场现场情况是现场情况是现场',
      imgList: ['', '', '', '', '', ''],
    },
    {
      people: '张三',
      time: '2023-01-01 00:00:00',
      desc: '现场情况是现场情况是现场现场情况是现场情况是现场现场情况是现场情况是现场',
      imgList: ['', '', ''],
    },
    {
      people: '张三',
      time: '2023-01-01 00:00:00',
      desc: '现场情况是现场情况是现场现场情况是现场情况是现场现场情况是现场情况是现场',
      imgList: ['', '', ''],
    },
    {
      people: '张三',
      time: '2023-01-01 00:00:00',
      desc: '现场情况是现场情况是现场现场情况是现场情况是现场现场情况是现场情况是现场',
      imgList: ['', '', ''],
    },
  ];
}

function toSceneReporting() {
  router.push({
    name: 'scene-reporting',
    query: {
      id: useWarning.warning.id,
    },
  });
}
</script>

<style scoped lang="less">
.emergency-warning-scene {
  height: 100%;
  overflow: auto;
  &-overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
    padding: 16px;
    margin-bottom: 12px;
    .scene-overview {
      &-text-content {
        display: flex;
        flex-direction: column;
        gap: 9px;
        &-title {
          font-size: 14px;
          font-weight: bold;
          color: #1e1e1e;
        }
        &-num {
          font-size: 12px;
          color: #949b97;
        }
      }
      &-icon {
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #ecf3f3;
      }
    }
  }
  &-verification-lists {
    display: flex;
    flex-direction: column;
    gap: 12px;
    &-item {
      border-radius: 4px;
      background-color: #fff;
      box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
      padding: 16px;
    }
  }
}
</style>
