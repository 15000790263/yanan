<script setup>
import ShowFormPipeline from './show-form-pipeline.vue';
import ShowFormRegulator from './show-form-regulator.vue';
import ShowFormWell from './show-form-well.vue';
import ShowFormStation from './show-form-station.vue';
import ShowFormYinbao from './show-form-yinbao.vue';

defineProps({
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

// const emit = defineEmits([])
</script>

<template>
  <div>
    <show-form-regulator v-if="type === 'regulator'" :data="data" />
    <show-form-well v-if="type === 'well'" :data="data" />
    <show-form-pipeline v-if="type === 'pipeline'" :data="data" />
    <show-form-station v-if="type === 'station'" :data="data" />
    <show-form-yinbao v-if="type === 'yinbao'" :data="data" />
  </div>
</template>

<style lang="less" scoped></style>
