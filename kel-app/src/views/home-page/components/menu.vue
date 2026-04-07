<template>
  <div class="menu fade-in">
    <div class="menu-title">{{ menu.type }}</div>
    <div class="item">
      <div
        v-for="(item, index) in menu.items"
        :key="index"
        class="menu-item-wrapper"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="handleMenuClick(item)"
      >
        <MenuItem v-bind="item" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MenuItem from './menu-item.vue';

defineProps({
  menu: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['change']);

function handleMenuClick(item) {
  emit('change', item);
}
</script>

<style scoped lang="less">
.menu {
  .menu-title {
    height: 16px;
    line-height: 16px;
    font-size: 14px;
    font-weight: bold;
    color: #34394f;
    border-left: 6px solid #1463ae;
    padding-left: 10px;
    margin-bottom: 12px;
  }

  .menu-item-wrapper {
    width: 100%;
    animation: slideUp 0.4s ease-out backwards;
  }

  .item {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

.menu + .menu {
  margin-top: 12px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
