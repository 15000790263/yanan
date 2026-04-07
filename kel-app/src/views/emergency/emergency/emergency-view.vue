<template>
  <div class="emergency-view">
    <div class="emergency-view-warning" @click="showWaringList = true">
      <div class="">{{ useWarning.warning.name }}</div>
    </div>
    <div class="emergency-view-router">
      <div
        class="emergency-view-router-item"
        :class="item.name === activeRouter ? 'active' : ''"
        v-for="(item, i) in routerList"
        :key="i"
        @click="routerChange(item)"
      >
        <img :src="item.name === activeRouter ? item.activeUrl : item.url" alt="" />
        <div class="emergency-view-router-item-text">
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="emergency-view-content">
      <router-view></router-view>
    </div>
    <van-popup v-model:show="showWaringList" title="事件列表" round position="bottom">
      <van-picker
        :columns="warningList"
        :columns-field-names="fieldNames"
        @cancel="showWaringList = false"
        @confirm="onConfirm"
      />
    </van-popup>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { warningStore } from '@/stores/emergency/warning';
import { useRouter } from 'vue-router';
import { getEventList } from '@/api/emergency';

const router = useRouter();

const activeRouter = ref('事件详情');
const routerList = [
  {
    name: '事件详情',
    url: new URL('../../../assets/image/emergency/emergency/info.png', import.meta.url).href,
    activeUrl: new URL('../../../assets/image/emergency/emergency/info-active.png', import.meta.url)
      .href,
    to: 'emergency-warning-info',
  },
  {
    name: '事件进展',
    url: new URL('../../../assets/image/emergency/emergency/progress.png', import.meta.url).href,
    activeUrl: new URL(
      '../../../assets/image/emergency/emergency/progress-active.png',
      import.meta.url
    ).href,
    to: 'emergency-warning-progress',
  },
  {
    name: '事件现场',
    url: new URL('../../../assets/image/emergency/emergency/scene.png', import.meta.url).href,
    activeUrl: new URL(
      '../../../assets/image/emergency/emergency/scene-active.png',
      import.meta.url
    ).href,
    to: 'emergency-warning-scene',
  },
];

const useWarning = warningStore();
const warningList = ref([]);
const showWaringList = ref(false);

const fieldNames = { text: 'name', value: 'id', children: 'children' };

onMounted(() => {
  searchWarningList();
});

function searchWarningList() {
  getEventList().then(res => {
    warningList.value = res.data.rows;
    useWarning.changeWarning(warningList.value[0]);
  });
}

function routerChange(data) {
  activeRouter.value = data.name;
  router.push({
    name: data.to,
  });
}

function onConfirm({ selectedOptions }) {
  showWaringList.value = false;
  useWarning.changeWarning(selectedOptions[0]);
}
</script>

<style scoped lang="less">
.emergency-view {
  width: 100%;
  height: 100%;
  &-warning {
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  }
  &-router {
    padding: 8px;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    &-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      &-text {
        padding: 6px 0;
      }
    }
    .active {
      background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-fill-color: transparent;
      &:after {
        content: '';
        width: 60%;
        height: 2px;
        background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
      }
    }
  }
  &-content {
    //width: calc(100% - 16px * 2) !important;
    height: calc(100% - 37px - 75px - 16px * 2);
    padding: 16px;
  }
}
</style>
