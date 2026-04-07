class MediaCache {
  // private formData = undefined
  // 当前表单的内容
  formData = undefined;

  // 缓存的媒体信息
  mediaList = [];

  // 正在检查的项
  // 从检查项点进去
  // 可能需要打水印
  checkingItem = '';

  init() {
    this.clear();
  }

  clear() {
    this.formData = undefined;
    this.mediaList = [];
    this.checkingItem = '';
  }

  cacheCheckingItem(item) {
    this.checkingItem = item;
  }

  cacheFormData(formData) {
    this.formData = formData;
  }

  cacheMedia(list) {
    this.mediaList = list;
  }

  useCheckingItem() {
    const itemString = this.checkingItem;
    this.checkingItem = '';
    return itemString;
  }

  getFormDataFromCache() {
    return this.formData;
  }

  getMediaListFromCache() {
    if (this.mediaList.length === 0) return undefined;
    return this.mediaList;
  }
}

export const mediaCacheInstance = new MediaCache();
