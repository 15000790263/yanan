<template>
  <div class="verification-show">
    <div class="verification-show-title">
      <div class="">{{ props.verification.people }}</div>
      <div class="">{{ props.verification.time }}</div>
    </div>
    <div class="verification-show-desc">
      {{ props.verification.desc }}
    </div>
    <div class="verification-show-img-list">
      <van-image
        class="verification-show-img-list-item"
        v-for="(item, i) in props.verification.imgList"
        :key="i"
        :src="item"
        lazy-load
      >
        <template v-slot:loading>
          <van-loading type="spinner" size="20" />
        </template>
      </van-image>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  verification: {
    type: Object,
    required: false,
    default: () => {},
  },
});
</script>

<style scoped lang="less">
.verification-show {
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  &-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &-desc {
    color: #949b97;
  }
  &-img-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    &-item {
      width: 80px;
      height: 80px;
      flex: 80px 0 0;
    }
  }
}
</style>
