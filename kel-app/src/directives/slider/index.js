export default {
  mounted(el, binding) {
    let startY = 0;

    // 滑动的阈值
    let HIDE_THRESHOLD = 100;

    // 获取要隐藏的元素高度
    const height = el.getBoundingClientRect().height;

    const handleTouchstart = e => {
      startY = e.touches[0].clientY;
    };

    const handleTouchmove = e => {
      const deltaY = e.touches[0].clientY - startY;
      if (deltaY < 0) {
        // 说明向上滑动
        el.style.cssText = `transform: translateY(${deltaY}px)`;
      }
    };

    const handleTouchend = e => {
      const deltaY = e.changedTouches[0].clientY - startY;

      // 超过阈值执行
      if (-deltaY > HIDE_THRESHOLD) {
        el.style.cssText = `
        transition: transform 0.3s; transform: translateY(${-height}px)
        `;

        binding?.value && binding?.value();
      } else {
        el.style.cssText = `transition: transform 0.3s; transform: translateY(0)`;
      }
    };

    el.addEventListener('touchstart', handleTouchstart);
    el.addEventListener('touchmove', handleTouchmove);
    el.addEventListener('touchend', handleTouchend);

    el.touchstartEvent = handleTouchstart;
    el.touchmoveEvent = handleTouchmove;
    el.touchendEvent = handleTouchend;
  },
  unmounted(el) {
    // 移除事件的监听器
    el.removeEventListener('touchstart', el.touchstartEvent);
    el.removeEventListener('touchmove', el.touchmoveEvent);
    el.removeEventListener('touchend', el.touchendEvent);
  },
};
