<script setup>
import { ref, computed } from 'vue';

import { getLoc } from '../../util/location';

import icon_location from '../../../../assets/image/check/icon_location.png';
import { getIsInspect } from '../../../../utils/session';

// const props = defineProps()

const emit = defineEmits(['onLocationSearch']);

const pickerRef = ref(undefined);

const activeName = ref('distance');

const showPicker = ref(false);

const chooseValueShow = ref('全域');

const roadNameRef = ref('');

const colomns = {
  distance: [
    { text: '全域', value: '全域' },
    { text: '100米', value: '100' },
    { text: '300米', value: '300' },
    { text: '500米', value: '500' },
    { text: '1000米', value: '1000' },
  ],
  roadName: [
    { text: '香梨大道', value: '香梨大道' },
    { text: '石化大道', value: '石化大道' },
  ],
  area: [{ text: '千城梨乡水韵', value: '千城梨乡水韵' }],
};

const data2Choose = computed(() => {
  return colomns[activeName.value];
});

const handleLocationSearch = async () => {
  showPicker.value = false;

  if (activeName.value === 'distance') {
    // 距离
    const selectedValue = pickerRef.value?.getSelectedOptions();
    // 获取经纬度
    const { longitude: x, latitude: y } = await getLoc();

    if (selectedValue[0]) {
      const val = selectedValue[0].value;
      emit('onLocationSearch', val, activeName.value, { x, y });
      chooseValueShow.value = '';
      await nextTick();
      chooseValueShow.value = val;
    }
  } else {
    emit('onLocationSearch', roadNameRef.value, activeName.value);
  }
};

/* 下面代码放开就是巡检时查询500米范围设备 */
// onMounted(async () => {
//   const isInspect = getIsInspect();
//   if (isInspect) {
//     // 获取经纬度
//     const { longitude: x, latitude: y } = await getLoc();
//     emit('onLocationSearch', 500, 'distance', { x, y });
//     chooseValueShow.value = 500;
//   } else {
//     chooseValueShow.value = '全域';
//   }
// });
</script>

<template>
  <div class="location-search" @click="showPicker = true">
    <img :src="icon_location" width="16" height="16" />
    <div id="location-range" class="text">{{ chooseValueShow }}</div>
  </div>

  <van-popup :style="{ height: '70%' }" v-model:show="showPicker" closeable round position="bottom">
    <!-- <div class="actions">
      <div class="btn" @click="showPicker = false">取消</div>

      <div class="btn confirm" @click="handleLocationSearch">确定</div>
    </div> -->
    <div class="title">选择搜索区域</div>

    <div class="tabs">
      <van-tabs v-model:active="activeName" color="#00B099" title-active-color="#00B099">
        <van-tab title="按范围" name="distance"></van-tab>
        <van-tab title="按道路" name="roadName"></van-tab>
        <!-- <van-tab title="按小区" name="area"></van-tab> -->
      </van-tabs>
    </div>
    <!-- 修改需求了 -->
    <!-- 不全是选择器了 -->
    <van-picker
      v-if="activeName === 'distance'"
      ref="pickerRef"
      :show-toolbar="false"
      :columns="data2Choose"
    />

    <div v-else style="margin-top: 24px">
      <van-search v-model="roadNameRef" placeholder="请输入道路" />
    </div>

    <div class="bottom-action">
      <van-button round block type="primary" color="#00B099" @click="handleLocationSearch">
        确定
      </van-button>
    </div>
  </van-popup>
</template>

<style lang="less" scoped>
.location-search {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  .text {
    margin-left: 2px;
    flex: 1;
    // 文字超出省略
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #34394f;
  }
}

.title {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  height: 52px;
  font-weight: 600;
  color: rgb(50, 50, 51);
}
// .tabs {
//   margin-top: 42px;
// }

.confirm {
  color: #00b099;
  font-weight: bold;
}

.bottom-action {
  position: absolute;
  bottom: 0px;
  width: 100%;
  padding: 12px;
}
:deep(.van-button) {
  height: 36px;
}
</style>
