<template>
  <div class="outer">
    <van-dropdown-menu ref="menuRef" z-index="9999">
      <template v-for="(item, index) in list" :key="index">
        <van-dropdown-item :title="item.title" @opened="itemOpened(index)" :lazy-render="false">
          <template v-for="(value, indey) in item.list" :key="indey">
            <van-cell center :title="value.text" @click.stop="value.callback">
              <template #right-icon>
                <van-tag type="danger">未巡</van-tag>
              </template>
            </van-cell>
          </template>
        </van-dropdown-item>
      </template>
    </van-dropdown-menu>
  </div>
</template>

<script setup>
defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const menuRef = ref(null);

let currentIndex = 0;

let a, b;
function initScroll() {
  let startY = 0;
  const list = document.querySelectorAll('.van-dropdown-item > .van-dropdown-item__content');

  list[currentIndex].addEventListener(
    'touchstart',
    (a = e => {
      startY = e.touches[0].clientY;
      e.stopPropagation(); // 阻止事件冒泡到地图
    })
  );

  list[currentIndex].addEventListener(
    'touchmove',
    (b = e => {
      const deltaY = e.touches[0].clientY - startY;
      list[currentIndex].scrollTop -= deltaY; // 更新滚动位置
      startY = e.touches[0].clientY;
      e.stopPropagation(); // 阻止地图拖拽
    })
  );
}

function itemOpened(index) {
  const list = document.querySelectorAll('.van-dropdown-item > .van-dropdown-item__content');
  list[currentIndex].removeEventListener('touchstart', a);
  list[currentIndex].removeEventListener('touchmove', b);

  nextTick(() => {
    currentIndex = index;
    initScroll();
  });
}
</script>

<style lang="less" scoped>
.outer {
  width: 100%;
  height: 50px;
  background-color: #bfa;

  :deep(.van-dropdown-item) {
    top: 50px !important;
  }
}
</style>
