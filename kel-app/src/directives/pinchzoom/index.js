// PinchZoomDirective.js
import Hammer from 'hammerjs';

export default {
  mounted(el) {
    // 初始化 Hammer.js
    var hammer = new Hammer(el);

    // 启用 pinch 识别
    hammer.get('pinch').set({ enable: true });

    // 定义初始缩放比例
    var scale = 1;
    var currentScale = 1;

    var posX = 0,
      posY = 0;
    var lastPosX = 0,
      lastPosY = 0;

    // 监听 pinch 事件
    hammer.on('pinchstart pinchmove', function (ev) {
      if (ev.type === 'pinchstart') {
        // 记录当前的缩放比例
        currentScale = scale;
      }

      // 根据手势缩放图片
      scale = currentScale * ev.scale;

      // 应用缩放效果
      el.style.transform = 'translate(' + lastPosX + 'px, ' + lastPosY + 'px) scale(' + scale + ')';
    });

    // 配置 pan 手势
    hammer.add(
      new Hammer.Pan({
        event: 'pan', // 事件名称（可选，默认为 'pan'）
        // pointers: 2, // 需要 2 根手指来触发 pan 手势
        threshold: 2, // 设置手指移动 5 像素即触发拖动
        // direction: Hammer.DIRECTION_HORIZONTAL, // 仅允许水平方向拖动
      })
    );

    // 启用 pan 识别
    hammer.get('pan').set({ enable: true });

    // 监听 pan 事件
    hammer.on('panmove', function (ev) {
      posX = lastPosX + ev.deltaX;
      posY = lastPosY + ev.deltaY;

      // 更新图片位置
      el.style.transform = 'translate(' + posX + 'px, ' + posY + 'px) scale(' + scale + ')';
    });

    hammer.on('panend', function () {
      // 记录结束时的位置
      lastPosX = posX;
      lastPosY = posY;
    });
  },
};
