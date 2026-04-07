<script setup>
// import { computed, watch, ref, onMounted } from 'vue';
// import { showToast, showDialog } from 'vant';
// import { useRouter } from 'vue-router';

import FormPipeline from './form-pipeline.vue';
import FormRegulator from './form-regulator.vue';
import FormWell from './form-well.vue';
import FormYinbao from './form-yinbao.vue';
// import { getLoc } from '../../util/location'
// import {
//   api_regulator,
//   api_well,
//   api_pipeline
//   // getStaffs
// } from '@/api/inspect';

// const canFormConfirm = ref(true);
defineEmits(['refresh']);

defineProps({
  canFormConfirm: {
    type: Boolean,
    default: true,
  },
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
  staffs: {
    type: Array,
    default: () => {
      return [];
    },
  },
});
</script>

<template>
  <div>
    <form-regulator
      v-if="type === 'regulator'"
      :data="data"
      :staffs="staffs"
      :canFormConfirm="canFormConfirm"
      v-bind="$attrs"
      @refresh="$emit('refresh')"
    />
    <form-well
      v-if="type === 'well'"
      :data="data"
      :staffs="staffs"
      :canFormConfirm="canFormConfirm"
      v-bind="$attrs"
      @refresh="$emit('refresh')"
    />
    <form-yinbao
      v-if="type === 'yinbao'"
      :data="data"
      :staffs="staffs"
      :canFormConfirm="canFormConfirm"
      v-bind="$attrs"
      @refresh="$emit('refresh')"
    />
    <form-pipeline v-if="type === 'pipeline'" :data="data" v-bind="$attrs" />
  </div>
</template>

<style lang="less" scoped></style>
