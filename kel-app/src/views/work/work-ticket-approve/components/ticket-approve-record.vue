<template>
  <div class="outer">
    <div class="ticket-info">
      <div class="ticket-name">{{ $route.query.workOperationType }}</div>
      <!-- <div class="plan-name"></div> -->
    </div>
    <div class="record-chart">
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in flowList" :key="item.taskId">
          <ApproveRecordItem v-bind="item" />
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { getRecoredByProcInsId } from '../../../../api/work';
import ApproveRecordItem from './approve-record-item.vue';

const route = useRoute();

const flowList = ref([]);

getRecoredByProcInsId(route.query.procInsId).then(res => {
  flowList.value = res.data.data.flowList.filter(item => item.comment).reverse();
});
</script>

<style lang="less" scoped>
.outer {
  height: 100%;
  padding: 12px 24px 16px;
  display: flex;
  flex-flow: column;

  .ticket-info {
    height: 46px;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .ticket-name {
      /* 临时用电安全作业 */
      font-family: Source Han Sans;
      font-size: 16px;
      font-weight: bold;
      color: #34394f;
    }

    .plan-name {
      font-family: 思源黑体;
      font-size: 12px;
      color: #84abbb;
    }
  }

  .record-chart {
    flex: 1;
    overflow-y: scroll;

    :deep(.van-steps) {
      padding-left: 41px;
      background-color: unset;
      .van-step__line {
        top: 0;
        left: -36px;
        background-color: #80d7c2;
        height: calc(100% + 12px);
      }

      .van-step:last-child .van-step__line {
        width: 1px;
      }

      .van-steps__items {
        display: grid;
        row-gap: 12px;

        .van-step {
          padding: 0;

          .van-step__circle-container {
            position: absolute;
            top: 50%;
            left: -36px;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            background: #80d7c2;
            border-radius: 50%;

            .van-icon,
            .van-step__circle {
              display: none;
            }
          }
        }
      }
    }
  }
}
</style>
