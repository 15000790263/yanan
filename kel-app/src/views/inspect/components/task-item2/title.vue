<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  cardType: {
    type: String,
    default: 'uncheck', // uncheck good error
  },
});
</script>

<template>
  <div :class="['title-wrapper', cardType]">
    {{ title }}
  </div>
</template>

<style lang="less" scoped>
.title-wrapper {
  height: 29px;
  width: 100%;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  // color: white;
}

.uncheck {
  color: #fff;
  background: rgba(255, 255, 255, 0.3);
}

.good {
  color: #2ec192;
  background: rgba(255, 255, 255, 0.3);
}

.error {
  color: #ff3636;
  background: rgba(255, 255, 255, 0.3);
}
</style>
