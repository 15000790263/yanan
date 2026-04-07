import { ref, watch } from 'vue';

const defaultCfg = {
  size: 10,
  start: 1,
};

export function usePage(tabActive) {
  const pageNum = ref(defaultCfg.start);
  const pageSize = ref(defaultCfg.size);

  const resetPage = () => {
    pageNum.value = defaultCfg.start;
    pageSize.value = defaultCfg.size;
  };

  watch(tabActive, () => {
    resetPage();
  });

  const addPage = () => {
    return new Promise(resolve => {
      pageNum.value += 1;
      setTimeout(() => {
        resolve();
      }, 0);
    });
  };

  const getOnKeyWordPage = () => {
    return {
      pageNum: 1,
      pageSize: 10000,
    };
  };

  return {
    pageNum,
    pageSize,
    addPage,
    getOnKeyWordPage,
    resetPage,
  };
}
