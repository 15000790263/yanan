<template>
  <div class="wrapper">
    <van-pull-refresh v-model="loading" @refresh="getWorkHisList" :disabled="disabled">
      <div class="list-wrapper" ref="listRef">
        <template v-for="item in todoList">
          <div class="item" @click="handleApprove(item)">
            <div class="left">
              <div class="name">{{ item.workOperationType }}</div>
              <div class="user">
                <span>
                  {{ item.createBy }}
                </span>
                <span>
                  {{ item.operationTime }}
                </span>
              </div>
            </div>

            <div class="right">
              <span>已审批</span>
              <van-icon name="arrow" />
            </div>
          </div>
        </template>
      </div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { grtHisList } from '@/api/work';
import { createLoading } from '@/utils/loading-fn';

const router = useRouter();

const loading = ref(false);

const listRef = ref();

const disabled = ref(false);

onActivated(() => {
  getWorkHisList();
});

getWorkHisList();

const todoList = ref([]);

watch(todoList, value => {
  if (value.length && listRef.value) {
    listRef.value.onscroll = function () {
      disabled.value = this.scrollTop !== 0;
      // listElScrollTop = this.scrollTop;
    };
  }
});

async function getWorkHisList() {
  const destroy = createLoading();
  const res = await grtHisList({ pageNum: 1, pageSize: 10000 });
  destroy();
  loading.value = false;
  todoList.value = res.data.rows;
}

function handleApprove(item) {
  const {
    procInsId,
    deployId,
    taskId,
    workOperationType,
    executionId,
    taskName,
    startUserName,
    startDeptName,
  } = item;
  router.push(
    `/work/work-ticket-check-his?procInsId=${procInsId}&deployId=${deployId}&taskId=${taskId}&executionId=${executionId}&workOperationType=${workOperationType}&taskName=${taskName}&startUser=${startUserName}-${startDeptName}`
  );
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  padding: 16px;

  .van-pull-refresh {
    height: 100%;
  }

  .list-wrapper {
    display: grid;
    grid-template-rows: repeat(auto-fill, 48px);
    row-gap: 12px;
    height: 100%;
    overflow-y: scroll;

    .item {
      height: 48px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f7fafa;
      padding: 0 10px;

      .left {
        display: flex;
        justify-content: space-around;
        flex-direction: column;

        .name {
          font-family: 思源黑体;
          font-size: 14px;
          color: #34394f;
        }

        .user {
          font-family: 思源黑体;
          font-size: 12px;
          color: #84abbb;

          span:first-child {
            margin-right: 5px;
          }
        }
      }

      .right > span {
        font-size: 14px;
        color: #ff3700;
        margin-right: 8px;
      }
    }
  }
}
</style>
