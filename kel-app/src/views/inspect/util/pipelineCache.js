class PipelineCache {
  // 当前表单的内容
  formData = undefined;

  // 拼写就是错的
  annormalPoint = [];

  id = '';

  steps = undefined;

  timer = -1;

  clearWatch = null;

  positionArr = [];

  hideBarrage = null;

  init() {
    this.clear();
  }

  clear() {
    this.id = '';
    this.formData = undefined;
    this.annormalPoint = [];
    this.steps = undefined;
    this.timer = -1;
    this.clearWatch = null;
    this.positionArr = [];
    this.hideBarrage = null;
  }

  cacheData(id, formData, annormalPoint, steps, timer, clearWatch, positionArr, hideBarrage) {
    this.id = id;
    this.formData = formData;
    this.annormalPoint = annormalPoint;
    this.steps = steps;
    this.timer = timer;
    this.clearWatch = clearWatch;
    this.positionArr = positionArr;
    this.hideBarrage = hideBarrage;
  }

  getData() {
    return {
      id: this.id,
      formData: this.formData,
      annormalPoint: this.annormalPoint,
      steps: this.steps,
      timer: this.timer,
      clearWatch: this.clearWatch,
      positionArr: this.positionArr,
      hideBarrage: this.hideBarrage,
    };
  }

  hasCache() {
    return this.id !== '';
  }
}

const pipelineCacheInstance = new PipelineCache();

// window.pipelineCacheInstance = pipelineCacheInstance

export { pipelineCacheInstance };
