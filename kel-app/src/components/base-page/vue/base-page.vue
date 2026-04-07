<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="transitionName">
      <keep-alive :include="aliveRoutes">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup>
import { useTransition } from '@/utils/transition.js';
const transitionName = useTransition();

defineProps({
  aliveRoutes: {
    default: () => [],
    type: Array,
  },
});
</script>

<style scoped lang="less">
:deep(*) {
  box-sizing: border-box !important;
}
</style>
