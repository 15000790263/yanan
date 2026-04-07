<template>
  <div class="wrapper">
    <div class="content">
      <div class="title">设备维修详情</div>
      <div class="content-item">
        <div>单号：</div>
        <div>{{ main?.oddnumbers }}</div>
      </div>
      <div class="content-item">
        <div>设备编号：</div>
        <div>{{ main?.equipmentnum }}</div>
      </div>
      <div class="content-item">
        <div>维修级别：</div>
        <div>{{ getValue(main?.maintainlevel, 53) }}</div>
      </div>
      <div class="content-item">
        <div>计划开始时间：</div>
        <div>{{ main?.planstartdate }}</div>
      </div>
      <div class="content-item">
        <div>计划结束时间：</div>
        <div>{{ main?.planenddate }}</div>
      </div>
      <div class="content-item">
        <div>维修费用（元）：</div>
        <div>{{ main?.maintaincost }}</div>
      </div>
      <div class="content-item">
        <div>项目内容：</div>
        <div>{{ main?.projectcontext }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getDeviceRepairDetail } from '../../../api/device';
import { getValue } from '../hooks/useDict';

const route = useRoute();
const id = route.query.id;
const main = ref(null);

getDeviceRepairDetail(id).then(res => {
  console.log(res.data.data);
  main.value = res.data.data;
});
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  background-color: rgba(245, 245, 245, 1);
  padding: 16px;

  .title {
    position: relative;
    font-weight: 600;
    padding: 10px 0 10px 10px;

    &::before {
      content: ' ';
      display: inline-block;
      position: absolute;
      width: 5px;
      height: 15px;
      background-color: #1677ff;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  .content-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 50px;
    font-size: 14px;
    color: #34394f;
    align-content: center;
  }
}
</style>
