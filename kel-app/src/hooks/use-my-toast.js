import { showToast, showSuccessToast } from 'vant';

// 创建一个映射对象，将方法名映射到对应的 toast 方法
const toastMethods = {
  showToast,
  showSuccessToast,
};

export function useToast() {
  const proxy = getCurrentInstance();

  function showToastMessage(arg, toastMethod) {
    // 判断arg是字符串或者数字，则认为是message参数
    if (typeof arg === 'string' || typeof arg === 'number') {
      arg = {
        message: arg,
      };
    }

    toastMethod({ teleport: proxy.ctx.$el, ...arg });
  }

  return Object.keys(toastMethods).reduce((acc, method) => {
    acc[method] = arg => showToastMessage(arg, toastMethods[method]);
    return acc;
  }, {});
}
