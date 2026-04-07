<template>
  <div class="warning-view">
    <warning-item
      class="warning-view-list-item"
      v-for="(item, i) in warningList"
      :key="i"
      :warning="item"
    >
      <div class="warning-view-list-item-button">
        <van-button plain round type="primary" color="#2EC192" size="small" @click="tell(item.tel)">
          <div style="display: flex; align-items: center">
            <img src="../../../assets/image/emergency/warning/phone.png" alt="" />
            联系报警人
          </div>
        </van-button>
        <van-button
          round
          type="primary"
          color=" linear-gradient(180deg, #1BAEFD 0%, #25A0E2 100%)"
          size="small"
          :disabled="item.eventStatus === '3'"
          @click="checkWarning(item)"
        >
          <div style="display: flex; align-items: center">
            <img src="../../../assets/image/emergency/warning/camera.png" alt="" />
            现场核实
          </div>
        </van-button>
      </div>
    </warning-item>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import WarningItem from '@/views/emergency/components/warning-item.vue';
import { getEventList } from '@/api/emergency';

const warningList = ref([]);

const router = useRouter();

onMounted(() => {
  searchList();
});

function searchList() {
  getEventList().then(res => {
    warningList.value = res.data.rows;
  });
}

function tell(tel) {
  const a = document.createElement('a');
  a.href = `tel:${tel}`;
  a.click();
  a.remove();
}

function checkWarning(data) {
  if (data.eventStatus !== '3') {
    router.push({
      name: 'field-verification',
      query: {
        id: data.id,
      },
    });
  }
}
</script>

<style scoped lang="less">
.warning-view {
  width: calc(100% - 16px * 2) !important;
  height: calc(100% - 16px * 2);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: auto;
  &-list-item {
    padding: 16px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
    &-button {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
