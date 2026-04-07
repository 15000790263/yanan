<script setup>
import { ref, onMounted, computed } from 'vue';

import attr from '../attr-desc/index.vue';
import { getLoc } from '../../util/location';
import navigation_btn2 from '../../../../assets/image/check/navigation_btn2.png';
import { navigateByLocation } from '../../../../utils/cordova-tools';
import { showNotify } from 'vant';
import { getDictType } from '../../../../api/device';
import { api_pipeline } from '../../../../api/inspect';

const currentLocation = ref(undefined);

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },

  type: {
    type: String,
    default: 'regulator',
  },

  location: {
    type: Object,
    default: () => ({}),
  },
});

watch(
  () => props.location,
  value => {
    currentLocation.value = value;
  },
  {
    immediate: true,
  }
);

const coverRate = ref(0);

const currentPlan = ref({});

const isKx = computed(() => {
  return currentPlan.value?.patrolType === '101';
});

watch(
  () => props.data,
  value => {
    if (value && value.planId) {
      api_pipeline.getPlanById(value.planId).then(res => {
        currentPlan.value = res.data.data;
        coverRate.value = res.data.data?.coverageRate || 0;
      });
    }
  },
  {
    immediate: true,
  }
);

const isShowDelegate = computed(() => {
  return +props.data.delegateStatus === 1;
});

const isTaskForNow = computed(() => {
  return +props.data.patrolStatus === 0;
});

const locationInfo = computed(() => {
  if (isTaskForNow.value) {
    return `经度:${currentLocation.value?.longitude?.toFixed(
      5
    )}, 纬度:${currentLocation.value?.latitude?.toFixed(5)}`;
  }
  // 数据存储的位置
  return `经度:${props.data.longitude ?? '--'}, 纬度:${props.data.latitude ?? '--'}`;
});

const locationLabel = computed(() => {
  return isTaskForNow.value ? '当前位置' : '巡检位置';
});

// 跳转导航
function onNavigation(data) {
  let longitude = ''; // 经度
  let latitude = ''; // 纬度
  let destName = `库尔勒市${data.roadName}${data.regulatorLocation}`;

  if (isTaskForNow.value) {
    longitude = currentLocation.value?.longitude;
    latitude = currentLocation.value?.latitude;
  } else {
    longitude = props.data.longitude ?? null;
    latitude = props.data.latitude ?? null;
  }

  if (longitude && latitude) {
    navigateByLocation(latitude, longitude, destName);
  } else {
    showNotify({ type: 'warning', message: '经纬度缺失，请核对' });
  }
}

const workArea = ref('');

function getWorkArea() {
  getDictType('work_area').then(res => {
    const r = res.data.rows.find(item => item.dictValue === props.data.workArea);
    if (r) {
      workArea.value = r.dictLabel;
    }
  });
}

getWorkArea();
</script>

<template>
  <van-row v-if="type === 'regulator'" :gutter="[12, 12]">
    <van-col span="24">
      <attr paddingBottom="0" label="设备编号" :value="data.regulatorNumber" />
    </van-col>

    <van-col span="24">
      <attr paddingBottom="0" label="所属路段" :value="data.roadName" />
    </van-col>

    <van-col span="24">
      <attr paddingBottom="0" label="设备位置" :value="data.regulatorLocation" />
    </van-col>

    <van-col span="24">
      <attr paddingBottom="0" :label="locationLabel" :value="locationInfo">
        <template #icon>
          <slot name="icon"> </slot>
        </template>
      </attr>
    </van-col>

    <!-- 
    <img
      class="navigation_btn"
      :src="navigation_btn2"
      height="24"
      alt=""
      @click="onNavigation(data)"
    />
-->
  </van-row>

  <van-row v-if="type === 'pipeline'" :gutter="[12, 12]">
    <van-col paddingBottom="0" span="24">
      <attr label="作业区域" :value="workArea" />
    </van-col>

    <van-col paddingBottom="0" v-if="data.pipelineName" span="24">
      <attr label="管线名称" :value="data.pipelineName" />
    </van-col>

    <van-col v-if="data.inspectArea" paddingBottom="0" span="24">
      <attr label="巡检区域" :value="data.inspectArea" />
    </van-col>

    <van-col paddingBottom="0" span="24">
      <attr :label="locationLabel" :value="locationInfo">
        <template #icon>
          <slot name="icon"> </slot>
        </template>
      </attr>
    </van-col>

    <van-col paddingBottom="0" span="24">
      <attr label="覆盖率" value="" style="position: relative">
        <template #icon>
          <div
            :style="`
              position: absolute;
              left: 66px;
              font-size: 12px;
              color: #fff;
              background-color: ${coverRate == 100 ? '#0aee11' : '#f00'};
              padding: 1px 4px;
              border-radius: 2px;`"
          >
            {{ coverRate + '%' }}
          </div>
        </template>
      </attr>
    </van-col>

    <van-col span="24">
      <attr paddingBottom="0" label="轨迹" style="position: relative">
        <template #icon>
          <div
            style="
              position: absolute;
              left: 66px;
              font-size: 12px;
              color: #969799;
              border: 1px solid #ddd;
              padding: 1px 4px;
              border-radius: 2px;
            "
            @click="
              $router.push(
                `/inspect/inspect-trail?id=${$route.params.id}&planId=${data.planId}&isKx=${isKx}`
              )
            "
          >
            预览
          </div>
        </template>
      </attr>
    </van-col>
  </van-row>

  <van-row v-if="type === 'well'" :gutter="[12, 12]">
    <van-col paddingBottom="0" span="24">
      <attr label="设备编号" :value="data.valveNumber" />
    </van-col>

    <van-col paddingBottom="0" span="24">
      <attr label="所属路段" :value="data.roadName" />
    </van-col>

    <van-col span="24">
      <attr paddingBottom="0" label="设备位置" :value="data.valveLocation" />
    </van-col>

    <van-col span="24">
      <attr paddingBottom="0" :label="locationLabel" :value="locationInfo">
        <template #icon>
          <slot name="icon"> </slot>
        </template>
      </attr>
    </van-col>
  </van-row>

  <van-row v-if="type === 'yinbao'" :gutter="[12, 12]">
    <van-col paddingBottom="0" span="24">
      <attr label="设备编号" :value="data.potentNumber" />
    </van-col>

    <van-col paddingBottom="0" span="24">
      <attr label="安装位置" :value="data.stubLocation" />
    </van-col>

    <!-- <van-col span="24">
      <attr paddingBottom="0" label="设备位置" :value="data.valveLocation" />
    </van-col> -->

    <van-col span="24">
      <attr paddingBottom="0" :label="locationLabel" :value="locationInfo">
        <template #icon>
          <slot name="icon"> </slot>
        </template>
      </attr>
    </van-col>
  </van-row>

  <van-row v-if="type === 'station'" :gutter="[12, 12]">
    <van-col paddingBottom="0" v-if="data.stationName" span="24">
      <attr label="调压站名称" :value="data.stationName" />
    </van-col>
    <van-col paddingBottom="0" v-if="data.stationNum" span="24">
      <attr label="调压站编号" :value="data.stationNum" />
    </van-col>

    <van-col paddingBottom="0" span="24">
      <attr label="作业区域" :value="workArea" />
    </van-col>
    <!-- <van-col span="24">
      <attr paddingBottom="0" :label="locationLabel" :value="locationInfo">
        <template #icon>
          <slot name="icon"> </slot>
        </template>
      </attr>
    </van-col> -->
  </van-row>

  <div v-if="isShowDelegate">
    <van-divider />
    <attr paddingBottom="0" label="派转信息" :value="data.delegateDescription" />
  </div>
</template>

<style lang="less" scoped>
.trans {
  color: #84abbb;
  font-size: 12px;
}

.navigation_btn {
  position: absolute;
  right: 20px;
}
</style>
