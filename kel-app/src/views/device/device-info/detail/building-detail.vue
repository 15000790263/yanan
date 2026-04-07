<template>
  <div class="wrapper">
    <div class="list">
      <template v-if="list.length" v-for="item in list">
        <div class="item">
          <template v-for="value in tableOptions">
            <van-field v-model="item[value.key]" readonly :label="value.title" />
          </template>
        </div>
      </template>
      <van-empty v-else description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
import { getBuildingRelationDetail } from '@/api/device';
import { createLoading } from '../../../../utils/loading-fn';

const route = useRoute();

const buildingid = route.query.buildingid;

const list = ref([]);

onMounted(async () => {
  const destroy = createLoading('数据请求中...');
  const res = await getBuildingRelationDetail(buildingid).finally(destroy);
  list.value = res.data;
});

const tableOptions = [
  {
    title: '用户编号',
    key: 'userno',
  },
  {
    title: '表具类型',
    key: 'metertype',
  },
  {
    title: '用户类型',
    key: 'proname',
  },
  {
    title: '调压箱',
    key: 'compressorboxcode',
  },
  {
    title: '具体地址',
    key: 'addrdesc',
  },
  {
    title: '开户时间',
    key: 'opendate',
  },
];
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 16px;

  .list {
    height: 100%;
    overflow-y: scroll;

    display: grid;
    row-gap: 16px;
    grid-auto-rows: min-content;

    .item {
      border-radius: 8px;
      border: 5px solid #c0e9e7;

      :deep(.van-field) {
        padding: 5px 10px;
      }
    }
  }
}
</style>
