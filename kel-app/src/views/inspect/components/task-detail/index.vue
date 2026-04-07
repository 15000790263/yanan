<script setup>
import TaskPipeline from './task-pipeline.vue';
import TaskRegulator from './task-regulator.vue';
import TaskWell from './task-well.vue';
import TaskStation from './task-station.vue';
import TaskYinbao from './task-yinbao.vue';

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
    <TaskRegulator v-if="props.type === 'regulator'" :data="data" />

    <TaskWell v-if="props.type === 'well'" :data="data" />

    <TaskPipeline v-if="props.type === 'pipeline'" :data="data" />
    
    <TaskYinbao v-if="props.type === 'yinbao'" :data="data" />

    <TaskStation v-if="props.type === 'station'" :data="data" />
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
