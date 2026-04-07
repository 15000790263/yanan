<template>
  <div class="wrapper finished">
    <WorkPlanItem v-bind="info" :enterpriseInfo="enterpriseInfo">
      <template #footer>
        <div class="check">作业计划已归档</div>
      </template>
    </WorkPlanItem>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import WorkPlanItem from '@/views/work/work-plan/components/work-plan-item.vue';
import { getSupplierWorkList } from '../../../api/work';
import { watch } from 'vue';

const router = useRouter();
const symbol = Object.getOwnPropertySymbols(router).pop();

const info = ref(router[symbol]);

const enterpriseInfo = ref(null);
watch(
  info,
  async () => {
    if (!enterpriseInfo.value) {
      const { data: value } = await getSupplierWorkList();
      enterpriseInfo.value = value.rows.find(item => item.id == info.value.company);
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}

.wrapper {
  height: 100%;
  display: grid;
  place-items: center;
  padding: 12px;

  // 已完工样式
  &.finished {
    :deep(.item-wrapper) {
      margin-bottom: 0;
      height: calc(100vh - 120px);
      background: #bee4f1;

      .icon {
        background: #93c0d0;
      }

      .content *,
      .user-info * {
        color: #17617e;
        -webkit-text-fill-color: unset;
      }

      .content .date {
        border-top-color: #84abbb;
      }

      .user-info .role {
        background-color: #bee4f191;
        background-blend-mode: difference;
      }

      > .work-ticket {
        display: block;
        height: calc(100% - 180px);

        .ticket-item-wrapper {
          background: #d7fafd;
        }
      }

      .finish-btn {
        display: grid;
      }

      .check {
        padding-left: 20px;
        background: url('/src/assets/image/work/icon-red-check.png') no-repeat left 4px/13px;
        margin-top: 10px;
        color: #17617e;
      }
    }

    .content {
      display: none;
    }

    // review role样式
    &.review-role {
      .all-btn {
        display: none;
      }

      .work-info {
        height: 100%;
      }
    }

    &.secure-role {
      .all-btn {
        display: none;
      }

      .work-info {
        height: 100%;
      }
    }
  }
}
</style>
