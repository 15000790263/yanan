import { defineStore } from 'pinia';
import { ref } from 'vue';
import service from '@/utils/service.js';
import config from '../config';

export const systemStore = defineStore('system', () => {
  const system = ref('');

  const workArea = ref([]);

  const dictMap = ref({});

  const depts = ref([]);

  function changeSystem(data) {
    system.value = data;
  }

  function getDickValue(dictType) {
    service
      .get(`${config.url}/system/dict/data/list?pageNum=1&pageSize=100&dictType=${dictType}`)
      .then(res => {
        workArea.value = res.data.rows;
      });
  }

  async function getDictInfo(args) {
    const promises = args.map(item =>
      service.get(`${config.url}/system/dict/data/list?pageNum=1&pageSize=100&dictType=${item}`)
    );

    const res = await Promise.all(promises);
    res.forEach((item, index) => {
      dictMap.value[args[index]] = item.data.rows;
    });
  }

  function getDictValue(key, value) {
    if (!value) {
      return '';
    }
    return dictMap.value[key].find(item => item.dictValue === value)?.dictLabel;
  }

  async function getDeptList() {
    const res = await service.get(`${config.url}/system/dept/list`);
    depts.value = res.data.data;
  }

  return {
    system,
    dictMap,
    workArea,
    depts,
    changeSystem,
    getDickValue,
    getDictInfo,
    getDictValue,
    getDeptList,
  };
});
