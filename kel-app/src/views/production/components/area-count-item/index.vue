<template>
  <div class="item">
    <div class="top">
      <div class="content">{{ name }}</div>
    </div>
    <div class="mid" v-if="showMid">计划总数 {{ data.total || 0 }}</div>
    <div class="bottom">
      <div class="static-current">
        <div class="all">
          <span>{{ dateType === 1 ? '当日' : '本期' }}总数</span>
          <span>{{ data.inspectCount || 0 }}</span>
        </div>
        <div class="ok">
          <span>正常数</span>
          <span>{{ data.right || 0 }}</span>
        </div>
        <div class="err">
          <span>异常数</span>
          <span>{{ data.error || 0 }}</span>
        </div>
      </div>
      <div class="static-confirm">
        <div class="all">
          <span>{{ dateType === 1 ? '当日' : '本期' }}确认数</span>
          <span>{{ data.confirmed || 0 }}</span>
        </div>
        <div class="ok">
          <span>正常数</span>
          <span>{{ data.confirmRight || 0 }}</span>
        </div>
        <div class="err">
          <span>异常数</span>
          <span>{{ data.confirmError || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  name: {
    type: String,
    default: '',
  },
  dateType: {
    type: Number,
    default: 0,
  },
  showMid: {
    type: Boolean,
    default: true,
  },
});
</script>

<style lang="less" scoped>
.item {
  /* 自动布局子元素 */
  width: 100%;
  height: 100%;
  padding-bottom: 16px;
  border-radius: 8px;
  background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
  display: grid;
  row-gap: 12px;

  .top {
    height: 37px;
    padding: 0 12px;

    .content {
      width: 100%;
      height: 100%;
      border-bottom: 1px solid rgba(255, 255, 255, 0.3);
      font-family: Source Han Sans;
      font-size: 16px;
      color: #fff;
      position: relative;
      display: flex;
      align-items: center;
      padding-left: 20px;

      &::before {
        content: '';
        display: inline-block;
        position: absolute;
        left: 0;
        top: 10px;
        width: 10px;
        height: 20px;
        background: linear-gradient(180deg, #ff6a00 0%, #ffc70e 100%);
      }
    }
  }

  .mid {
    height: 25px;
    display: grid;
    place-items: center;
    font-family: 思源黑体;
    font-size: 14px;
    color: #fff;
  }

  .bottom {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    padding: 0 16px;

    > div {
      height: 110px;
      width: 100%;
      border-radius: 4px;
      background: rgba(52, 57, 79, 0.3);
      font-family: 思源黑体;
      font-size: 14px;
      color: #fff;
      padding: 15px 23px;
      display: grid;
      place-items: center;
      grid-template-rows: repeat(3, 1fr);

      > div {
        display: flex;
        justify-content: space-between;
        width: 100%;
      }

      .all {
        color: #fff;
      }

      .ok {
        color: #52ff18;
      }

      .err {
        color: #ff9b53;
      }
    }
  }
}
</style>
