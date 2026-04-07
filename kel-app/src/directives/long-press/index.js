import Hammer from 'hammerjs';

export default {
  // 在绑定时调用
  mounted(el, binding) {
    if (typeof binding.value === 'function') {
      binding.value = {
        action: binding.value,
        option: {
          time: 500,
        },
      };
    }

    const hammer = new Hammer(el);

    hammer.get('press').set({ time: binding.value.option.time }); // 设置长按时间为 500ms

    hammer.on('press', binding.value.action);
  },
};
