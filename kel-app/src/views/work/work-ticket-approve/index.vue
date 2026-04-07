<template>
  <div class="wrapper">
    <div class="has-done-title" @click="goDone">已办</div>
    <template v-if="todoList.length">
      <div class="header">
        <van-icon name="records" />
        <span> 待办列表 </span>
      </div>
      <van-pull-refresh v-model="loading" @refresh="getWorktodoList" :disabled="disabled">
        <div class="list-wrapper" ref="listRef">
          <template v-for="item in todoList">
            <div class="item" @click="handleApprove(item)">
              <div class="left">
                <div class="name">{{ item.procDefName }}</div>
                <div class="user">
                  <span>
                    {{ item.startUserName }}
                  </span>
                  <span>
                    {{ item.createTime }}
                  </span>
                </div>
              </div>

              <div class="right">
                <span>待处理</span>
                <van-icon name="arrow" />
              </div>
            </div>
          </template>
        </div>
      </van-pull-refresh>
    </template>
    <div v-else>
      <div class="header">
        <van-icon name="records" />
        <span> 待办列表 </span>
      </div>
      <van-pull-refresh
        style="height: 80vh"
        v-model="loading"
        @refresh="getWorktodoList"
        :disabled="disabled"
      >
        <van-empty description="暂无数据" />
      </van-pull-refresh>
    </div>
  </div>
</template>

<script setup>
import { worktodoList } from '@/api/work';
import { createLoading } from '@/utils/loading-fn';

const router = useRouter();

const loading = ref(false);

const listRef = ref();

const disabled = ref(false);

onActivated(() => {
  getWorktodoList();
});

getWorktodoList();

const todoList = ref([]);

watch(todoList, value => {
  if (value.length && listRef.value) {
    listRef.value.onscroll = function () {
      disabled.value = this.scrollTop !== 0;
      // listElScrollTop = this.scrollTop;
    };
  }
});

async function getWorktodoList() {
  const destroy = createLoading();
  const res = await worktodoList({ pageNum: 1, pageSize: 10000 });
  destroy();
  loading.value = false;
  todoList.value = res.data.data.records;
}

function handleApprove(item) {
  const {
    procInsId,
    deployId,
    taskId,
    procDefName,
    executionId,
    taskName,
    startUserName,
    startDeptName,
  } = item;
  router.push(
    `/work/work-ticket-check?procInsId=${procInsId}&deployId=${deployId}&taskId=${taskId}&executionId=${executionId}&workOperationType=${procDefName}&taskName=${taskName}&startUser=${startUserName}-${startDeptName}`
  );
}

function goDone() {
  router.push('/work/work-ticket-done');
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: #f5f5f5;
  padding: 16px;

  .header {
    height: 58px;
    line-height: 58px;
    margin-bottom: 12px;
    font-weight: 600;
    font-size: 18px;

    span {
      color: #34394f;
    }
  }

  .van-pull-refresh {
    height: calc(100% - 70px);
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

  .has-done-title {
    position: fixed;
    right: 16px;
    top: 80px;
  }
}
</style>
