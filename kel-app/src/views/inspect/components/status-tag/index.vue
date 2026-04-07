<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

console.log('props.data.patrolStatus', props.data.patrolStatus);
</script>

<template>
  <van-tag v-if="props.data.patrolStatus === undefined" plain type="primary">未知</van-tag>
  <van-tag v-if="+props.data.patrolStatus === 0" plain type="primary">未检</van-tag>
  <van-tag v-if="+props.data.patrolStatus === 1" type="success">正常</van-tag>
  <van-tag v-if="+props.data.patrolStatus === 2" type="warning">异常</van-tag>
</template>

<style lang="stylus" scoped></style>
