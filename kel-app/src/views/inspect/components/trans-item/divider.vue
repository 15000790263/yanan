<script setup>
import { computed } from 'vue';

import divider_uncheck from '../../../../assets/image/check/divider_uncheck.png';
import divider_good from '../../../../assets/image/check/divider_good.png';
import divider_error from '../../../../assets/image/check/divider_error.png';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  cardType: {
    type: String,
    default: 'uncheck', // uncheck good error
  },

  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const dividerImg = computed(() => {
  switch (props.cardType) {
    case 'uncheck':
      return divider_uncheck;
    case 'good':
      return divider_good;
    case 'error':
      return divider_error;
    default:
      return divider_uncheck;
  }
});
</script>

<template>
  <div class="divider-wrapper">
    <img class="divider" :src="dividerImg" width="247" height="2" />
  </div>
</template>

<style lang="less" scoped>
.divider-wrapper {
  margin-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .divider {
  }
}
</style>
