<template>
  <div class="pull-up-wrapper">
    <slot></slot>
    <div v-if="!isAll" class="d-transparent center-child" ref="pullUpRef">
      <slot name="loading">
        <van-loading style="margin: 10px" type="spinner" />
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue';

const pullUpRef = ref(null);

const emit = defineEmits(['loadMore']);

const ob = ref(null);

const isAll = ref(false);

// 第一次交叉标识
let flag = true;

function createObserve() {
  ob.value = new IntersectionObserver(
    (entries, ob) => {
      if (flag) {
        // 第一次进来把已交叉元素隐藏，说明不需要滚动加载
        for (const entry of entries) {
          // console.log(entry.target === pullUpRef.value); // true
          if (entry.isIntersecting) {
            entry.target.classList.add('hide');
            ob.unobserve(entry.target);
          } else {
            entry.target.classList.add('show-element');
          }
        }
        flag = false;
      } else {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            emit('loadMore', () => {
              isAll.value = true;
              ob.value?.disconnect();
            });
          }
        }
      }
    },
    {
      threshold: 0.1,
    }
  );

  // 解决控制台报错
  if (pullUpRef.value instanceof Element) {
    ob.value.observe(pullUpRef.value);
  }
}

onMounted(() => {
  createObserve();
});

onUnmounted(() => {
  ob.value?.disconnect();
});

defineExpose({
  createObserve,
  destroy() {
    ob.value?.disconnect();
  },
});
</script>

<style lang="less" scoped>
.d-transparent {
  opacity: 0;

  &.center-child {
    display: grid;
    place-items: center;
  }
}

.hide {
  display: none !important;
}

.show-element {
  opacity: 1 !important;
}
</style>
