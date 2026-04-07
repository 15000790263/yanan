<script setup>
import DetailPipeline from './detail-pipeline.vue';
import DetailRegulator from './detail-regulator.vue';
import DetailWell from './detail-well.vue';
import DetailYinbao from './detail-yinbao.vue';

const props = defineProps({
  type: {
    type: String,
    default: 'regulator',
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const emit = defineEmits([]);
</script>

<template>
  <div class="container">
    <DetailRegulator v-if="props.type === 'regulator'" :data="data" />
    <DetailWell v-if="props.type === 'well'" :data="data" />
    <DetailPipeline v-if="props.type === 'pipeline'" :data="data" />
    <DetailYinbao v-if="props.type === 'yinbao'" :data="data" />
  </div>
</template>

<style lang="less" scoped>
.container {
  margin: 12px 0px;
  padding: 24px;
  border-radius: 4px;
  background-color: #fff;
}
</style>
