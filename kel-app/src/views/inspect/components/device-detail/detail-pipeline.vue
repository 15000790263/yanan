<script setup>
import { getDictType } from '../../../../api/device';
import attr from '../attr-desc/index.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const workArea = ref('');

function getWorkArea() {
  getDictType('work_area').then(res => {
    const r = res.data.rows.find(item => item.dictValue === props.data.workArea);
    workArea.value = r.dictLabel;
  });
}

getWorkArea();
</script>

<template>
  <van-row :gutter="[12, 12]">
    <!-- <van-col span="24">
      <attr label="管线编号" :value="data.pipelineNo" />
    </van-col>

    <van-col span="24">
      <attr label="管线名称" :value="data.pipelineName" />
    </van-col>

    <van-col span="24">
      <attr label="压力类型" :value="data.pressureType" />
    </van-col>

    <van-col span="24">
      <attr label="所属路段" :value="data.roadName" />
    </van-col>

    <van-col span="24">
      <attr label="起点地址" :value="data.startingAddress" />
    </van-col>

    <van-col span="24">
      <attr label="终点地址" :value="data.destinationAddress" />
    </van-col> -->

    <van-col span="24">
      <attr label="作业区域" :value="workArea" />
    </van-col>

    <van-col span="24">
      <attr label="创建时间" :value="data.createTime" />
    </van-col>
    <van-col span="24">
      <attr label="创建人员" :value="data.createBy" />
    </van-col>

    <van-col span="24">
      <attr label="备注" :value="data.remark" />
    </van-col>
  </van-row>
</template>

<style lang="less" scoped></style>
