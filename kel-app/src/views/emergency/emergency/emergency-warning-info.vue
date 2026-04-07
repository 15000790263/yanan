<template>
  <div class="emergency-warning-info">
    <div class="warning-item-content">
      <div class="warning-type-title">接警</div>
      <warning-item :warning="useWarning.warning"></warning-item>
    </div>
    <div class="warning-item-content">
      <div class="warning-type-title">现场核实</div>
      <div class="verification-lists">
        <verification-show
          v-for="(item, i) in verificationList"
          :key="i"
          :verification="item"
        ></verification-show>
      </div>
    </div>
    <div class="warning-item-content">
      <div class="warning-type-title">预警</div>
      <div class="early-warning-content">{{ earlyWarning }}</div>
    </div>
  </div>
</template>

<script setup>
import WarningItem from '@/views/emergency/components/warning-item.vue';
import { warningStore } from '@/stores/emergency/warning';
import { onMounted, ref, watch } from 'vue';
import VerificationShow from '@/views/emergency/components/verification-show.vue';

const useWarning = warningStore();
const earlyWarning = ref('');
const verificationList = ref([]);

watch(
  () => useWarning.warning,
  () => {
    searchWarningData();
  },
  {
    deep: true,
  }
);

onMounted(() => {
  searchWarningData();
});

function searchWarningData() {
  earlyWarning.value = useWarning.warning.description;
  searchVerification();
}

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
  ];
}
</script>

<style scoped lang="less">
.emergency-warning-info {
  height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  .warning-item-content {
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
    padding: 16px;
  }
  .warning-type-title {
    padding-bottom: 16px;
    font-weight: bolder;
    color: #1e1e1e;
  }
  .verification-lists {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .early-warning-content {
    font-size: 12px;
    color: #949b97;
  }
}
</style>
