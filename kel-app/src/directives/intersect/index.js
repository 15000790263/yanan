export default {
  // 在绑定时调用
  mounted(el, binding) {
    // 创建 IntersectionObserver 对象
    const observer = new IntersectionObserver(entries => {
      // 当元素出现在视口中时
      if (entries[0].isIntersecting) {
        // 执行绑定的方法
        binding.value();
      }
    });

    // 将元素添加到 IntersectionObserver 中
    observer.observe(el);

    // 在元素被销毁时取消观察
    el._observer = observer;
  },
  // 在解绑时调用
  unmounted(el) {
    // 取消观察元素
    el._observer.disconnect();
  },
};
