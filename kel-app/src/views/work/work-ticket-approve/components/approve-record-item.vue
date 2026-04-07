<template>
  <div
    class="item-wrapper"
    :class="{ refuse: comment.type === '2' }"
    :data-first-name="assigneeName?.charAt(0)"
  >
    <div class="common-info">
      <span>{{ taskName }}</span>
      <span>{{ assigneePhone }}</span>
    </div>
    <div class="main-info">
      <div>办理人：{{ assigneeName }}</div>
      <div>接收时间：{{ createTime }}</div>
      <div>处理时间：{{ finishTime }}</div>
      <div>
        处理意见：<span class="comment">{{ comment?.comment }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps([
  'candidate',
  'assigneeName',
  'assigneePhone',
  'comment',
  'createTime',
  'finishTime',
  'taskName',
]);
</script>

<style lang="less" scoped>
.item-wrapper {
  width: 100%;
  // width: 287px;
  // height: 144px;
  border-radius: 4px;
  position: relative;
  background: linear-gradient(180deg, #d4f3ec 0%, #d3f0ff 100%);
  padding: 8px 12px 12px 24px;

  &::before {
    content: attr(data-first-name);
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(-50%, -50%);
    width: 38px;
    height: 38px;
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    border: 1px solid #ffffff;
    border-radius: 50%;
    display: grid;
    place-items: center;

    font-family: 思源黑体;
    font-size: 24px;
    color: #ffffff;
  }

  .common-info {
    height: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #34394f;

    font-family: 思源黑体;
    font-size: 14px;
    color: #34394f;
    opacity: 0.5;
  }

  .main-info {
    margin-top: 8px;
    font-family: 思源黑体;
    font-size: 14px;
    color: #34394f;
    > div {
      line-height: 21px;
    }
  }

  &.refuse {
    background: linear-gradient(180deg, #f3d4d4 0%, #ffe5d3 100%);

    &::before {
      background: #ff3700;
    }

    .comment {
      font-family: 思源黑体;
      font-size: 14px;
      text-align: justify; /* 浏览器可能不支持 */
      color: #ff3700;
    }
  }
}
</style>
