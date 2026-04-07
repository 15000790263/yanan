export default {
  beforeMount(el, binding) {
    // 定义一个处理点击外部事件的函数
    const handleClickOutside = event => {
      // 检查点击的目标是否在绑定的元素内部
      if (!el.contains(event.target)) {
        // 如果不在内部，则执行绑定的方法
        binding?.value(el);
      }
    };

    // 将处理函数绑定到全局点击事件
    document.addEventListener('click', handleClickOutside);

    // 将处理函数存储在元素的属性上，以便在 unmounted 钩子中移除
    el.clickOutsideEvent = handleClickOutside;
  },
  unmounted(el) {
    // 移除全局点击事件的监听器
    document.removeEventListener('click', el.clickOutsideEvent);
  },
};
