import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api_pipeline, api_plan } from '@/api/inspect';
import { createLoading } from '../../utils/loading-fn';

export const useLocationStore = defineStore('location', () => {
  const positionArr = ref([]);
  const checkId = ref();
  const cacheData = ref(null);
  const patrolType = ref('');
  const planId = ref('');

  let times = 0;

  async function autoExecForLocationChange({ longitude, latitude, speed, direction, address }) {
    times++;
    if (times > 3) {
      if (patrolType.value === '101') {
        await api_plan.kxCoordinate({
          longitude,
          latitude,
          patrolId: planId.value,
          speed,
          direction,
          address,
          batchCode: checkId.value,
        });
      } else {
        await api_pipeline.coordinate({
          longitude,
          latitude,
          patrolId: checkId.value,
          speed,
          direction,
          address,
        });
      }
    }

    // .then(
    //   () => {},
    //   () => {
    //     // isLoaded.value = false;
    //     initData();
    //     // 定位不准报错，删除新增的数据
    //     api_pipeline.deleteCheck(checkId.value);
    //     throw new Error('错误');
    //   }
    // );
  }

  async function addPipelineData(data) {
    patrolType.value = data.patrolType;
    planId.value = data.id;
    // 没有id，先创建一个ID
    const destroy = createLoading();
    const res = await api_pipeline.startCheck({ planId: data.id }).catch(() => {
      destroy();
    });
    if (res.status === 200 && res.data.code === 200) {
      const id = res.data.data;
      checkId.value = id;
    }
    destroy();
  }

  function savaData(data) {
    cacheData.value = data;
  }

  function clear() {
    cacheData.value = null;
  }

  function hasCache() {
    return !!cacheData.value;
  }

  function initTimes() {
    times = 0;
  }

  return {
    positionArr,
    checkId,
    cacheData,
    autoExecForLocationChange,
    addPipelineData,
    savaData,
    clear,
    hasCache,
    initTimes,
  };
});
