<script setup>
import { ref, computed } from 'vue';
import Item from './item.vue';

// v2版本不切换图片了
import active_pipeline from '../../../../assets/image/check/tab_item_pipeline_v2.png';
import inactive_pipeline from '../../../../assets/image/check/tab_item_pipeline_v2.png';
import active_regulator from '../../../../assets/image/check/tab_item_regulator_v2.png';
import inactive_regulator from '../../../../assets/image/check/tab_item_regulator_v2.png';
import active_well from '../../../../assets/image/check/tab_item_well_v2.png';
import inactive_well from '../../../../assets/image/check/tab_item_well_v2.png';

import inactive_station from '../../../../assets/image/check/icon-station.png';
import inactive_yinbao from '../../../../assets/image/check/icon-yinbao.png';

const props = defineProps({
  defaultActive: {
    type: String,
    default: 'regulator',
  },
  noItemImg: {
    // 不要图片
    type: Boolean,
    default: false,
  },
  bgTransparent: {
    type: Boolean,
    default: false,
  },
  height: {
    type: Number,
    default: 113,
  },
  withoutTrans: {
    type: Boolean,
    default: false,
  },

  showStation: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['onActiveChange']);

const active = ref(props.defaultActive);

const containerStyle = computed(() => {
  return {
    height: `${props.height}px`,
    background: props.bgTransparent ? 'transparent' : '#ffffff',
    // 阴影
    boxShadow: props.bgTransparent ? 'none' : '0px 0px 4px 0px rgba(38, 55, 73, 0.1)',
  };
});
const setActive = type => {
  active.value = type;
  emit('onActiveChange', type);
};

defineExpose({
  setActive,
});
</script>

<template>
  <div class="container" :style="containerStyle">
    <item
      v-if="!withoutTrans"
      :noItemImg="noItemImg"
      :activeImg="active_pipeline"
      :inactiveImg="inactive_pipeline"
      name="管线运行"
      :isActive="active === 'pipeline'"
      @click="setActive('pipeline')"
    />
    <div class="fake-gap" v-if="!withoutTrans" />

    <item
      :noItemImg="noItemImg"
      :activeImg="active_regulator"
      :inactiveImg="inactive_regulator"
      name="调压箱"
      :isActive="active === 'regulator'"
      @click="setActive('regulator')"
    />
    <div class="fake-gap" />

    <item
      :noItemImg="noItemImg"
      :activeImg="active_well"
      :inactiveImg="inactive_well"
      name="阀井"
      :isActive="active === 'well'"
      @click="setActive('well')"
    />
    <div class="fake-gap" v-if="!withoutTrans" />

    <item
      v-if="!withoutTrans && showStation"
      :noItemImg="noItemImg"
      :activeImg="inactive_station"
      :inactiveImg="inactive_station"
      name="调压站"
      :isActive="active === 'station'"
      @click="setActive('station')"
    />
    <div class="fake-gap" v-if="!withoutTrans" />

    <item
      :noItemImg="noItemImg"
      :activeImg="inactive_yinbao"
      :inactiveImg="inactive_yinbao"
      name="阴保"
      :isActive="active === 'yinbao'"
      @click="setActive('yinbao')"
    />
  </div>
</template>

<style lang="less" scoped>
.container {
  display: flex;
  justify-content: center;
  height: 113px;
  background: #ffffff;
  box-shadow: 0px 0px 4px 0px rgba(38, 55, 73, 0.1);
  padding: 0 12px;
  .fake-gap {
    width: 12px;
  }
}
</style>
