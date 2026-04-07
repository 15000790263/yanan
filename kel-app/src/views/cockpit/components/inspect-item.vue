<template>
  <div class="inspect-item-wrapper">
    <div class="title">{{ props.item.name }}</div>
    <div class="content">
      <div class="echarts-chart" ref="chartDom"></div>
      <div class="inner">
        <div class="inner-content" style="color: #fff">
          <div class="name">巡检路程：</div>
          <div class="value">
            {{ props.item.pipeline.distance > 0 ? props.item.pipeline.distance.toFixed(2) : 0 }}公里
          </div>
        </div>
        <div class="inner-content" style="color: rgb(255, 176, 39)">
          <div class="name">总巡检：</div>
          <div class="value">
            {{ props.item.pipeline.total }}
          </div>
        </div>
        <div class="inner-content" style="color: rgb(93, 255, 39)">
          <div class="name">正常：</div>
          <div class="value">
            {{ props.item.pipeline.normal }}
          </div>
        </div>
        <div class="inner-content" style="color: rgb(255, 58, 58)">
          <div class="name">异常：</div>
          <div class="value">
            {{ props.item.pipeline.error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts';
import { onMounted } from 'vue';

const props = defineProps({
  item: { type: Object, default: () => ({}) },
});

const chartDom = ref(null);

const chart = ref();

onMounted(() => {
  if (chartDom.value) {
    chart.value = echarts.init(chartDom.value, 'dark');
    let options;
    options = {
      backgroundColor: 'transparent',
      ...props.item.option,
      tooltip: { show: false },
    };
    setTimeout(() => chart.value.setOption(options));
  }
});
</script>

<style lang="less" scoped>
.inspect-item-wrapper {
  width: 100%;
  height: 160px;
  padding: 12px;
  // background: linear-gradient(to top, #45579b 0%, #33438b 100%);
  background-color: #324189;
  border-radius: 8px;

  .title {
    height: 40px;
    font-size: 16px;
    color: #fff;
    padding-left: 16px;
    position: relative;

    &::before {
      content: '';
      display: inline-block;
      width: 5px;
      height: 14px;
      position: absolute;
      left: 0;
      top: 4px;
      background: linear-gradient(to top, #304792 0%, #3dd3f5 100%);
      border: 1px solid #2d51ad;
    }
  }

  .content {
    height: calc(100% - 40px);
    display: flex;
    justify-content: space-between;

    .echarts-chart {
      width: 40vw;
      height: 100%;
    }

    .inner {
      flex: 1;
      display: grid;
      align-items: center;
      font-size: 14px;

      .inner-content {
        display: flex;
      }
    }
  }
}
</style>
