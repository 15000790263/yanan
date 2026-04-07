import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api_pipeline } from '@/api/inspect';
import { createLoading } from '../../utils/loading-fn';
import service from '@/utils/service.js';
import config from '../../config';

export const useStationStore = defineStore('station', () => {
  const cache = ref(null);

  const stations = ref([]);

  function saveCache(data) {
    cache.value = data;
  }

  function clearCache() {
    cache.value = null;
  }

  function getAllStation() {
    service
      .get(
        // `${config.url}/equipment/equipmentverify/basestationlist?pageNum=1&pageSize=10&equipmenttypeid=5005`
        `${config.url}/equipment/equipmentverify/basestationlistpatrol`
      )
      .then(res => {
        stations.value = res.data.rows.map(item => ({
          ...item,
          isHighPressure: item.designpressure === '3.8',
        }));
      });
  }
  return {
    cache,
    stations,
    saveCache,
    clearCache,
    getAllStation,
  };
});
