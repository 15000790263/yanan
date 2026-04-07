import { defineStore } from 'pinia';

export const useInspectPicStore = defineStore('inspectPic', () => {
  const pictureCache = ref([]);

  function setPictureCache(pics) {
    pictureCache.value = pics;
  }

  function clearPictureCache() {
    pictureCache.value = [];
  }

  const pipelinePictureCache = ref([]);

  function setPipelinePictureCache(pics) {
    pipelinePictureCache.value = pics;
  }

  function clearPipelinePictureCache() {
    pipelinePictureCache.value = [];
  }

  return {
    pictureCache,
    pipelinePictureCache,
    setPictureCache,
    clearPictureCache,
    setPipelinePictureCache,
    clearPipelinePictureCache,
  };
});
