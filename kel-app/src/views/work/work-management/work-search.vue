<template>
  <div class="wrapper">
    <div class="tab-container">
      <van-tabs v-model:active="active" type="card" @click-tab="tabChang">
        <template v-for="item in workAreaList" :key="item.dickCode">
          <van-tab :title="item.dictLabel" :name="item.dictValue"></van-tab>
        </template>
      </van-tabs>
    </div>
    <Transition name="bottom">
      <div v-if="showBottom" class="tooltip">
        <div class="left">
          <div class="name">作业计划 {{ currentItem?.projectName }}</div>
          <!-- <div class="position">香梨大道与幸福路向南100米</div> -->
        </div>
        <div class="right">
          <div class="type">{{ currentItem?.workOperationType }}</div>
        </div>
      </div>
    </Transition>
    <div class="toggle" @click="toggleImage = !toggleImage">
      <van-icon color="#000a" size="40px" name="exchange" />
    </div>

    <div class="earth" id="map"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, watchEffect } from 'vue';
import config from '../../../config';
import { getAllApprovedTicket, getWorkArea } from '../../../api/work';
import { onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import L from 'leaflet';

onMounted(() => {
  initEarth();
  getData();
});

// 切换图层
const toggleImage = ref(true);

const active = ref(0);

let map;

function initEarth() {
  map = L.map('map', { zoomControl: false, attributionControl: false }).setView(
    [41.69695014900003, 86.16914527800003],
    10
  );
  // 定义 URL 模板
  const urlTemplate = `${config.mapUrl}/kelimagetiles/{z}/{x}/{y}.png`;

  // 创建 TileLayer 实例
  const urlTemplateLayer = L.tileLayer(urlTemplate, {
    // attribution:
    // '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });
  urlTemplateLayer.addTo(map);

  // wmts图层
  const wmtsUrl =
    config.mapUrl +
    '/geoserver/gwc/service/wmts?' +
    'layer=kelgeobase&' +
    'style=&' +
    'tilematrixset=EPSG:3857_kelgeobase&' +
    'Service=WMTS&' +
    'request=GetTile&' +
    'Version=1.0.0&' +
    'format=image/png&' +
    'TileCol={x}&' +
    'TileRow={y}&' +
    'TileMatrix=EPSG:3857_kelgeobase:{z}';

  // WMTS 图层
  const wmtsLayer = L.tileLayer(wmtsUrl, {});
  wmtsLayer.addTo(map);

  // 红点图层
  L.tileLayer(config.mapUrl + '/keldmtiles/{z}/{x}/{y}.png', {}).addTo(map);

  // 调压箱(柜)
  L.tileLayer
    .wms(config.mapUrl + '/geoserver/kelgis/wms', {
      layers: 'kelgis:compressorbox', // 指定要显示的图层
      format: 'image/png', // 图层格式
      transparent: true, // 是否透明
      attribution: 'WMS Layer', // 属性信息
    })
    .addTo(map);

  // 站场
  L.tileLayer
    .wms(config.mapUrl + '/geoserver/kelgis/wms', {
      layers: 'kelgis:station', // 指定要显示的图层
      format: 'image/png', // 图层格式
      transparent: true, // 是否透明
      attribution: 'WMS Layer', // 属性信息
    })
    .addTo(map);

  // 中、低压管线
  L.tileLayer
    .wms(config.mapUrl + '/geoserver/kelgis/wms', {
      layers: 'kelgis:centlinemp', // 指定要显示的图层
      format: 'image/png', // 图层格式
      transparent: true, // 是否透明
      attribution: 'WMS Layer', // 属性信息
    })
    .addTo(map);

  // 高压、次高压管线
  L.tileLayer
    .wms(config.mapUrl + '/geoserver/kelgis/wms', {
      layers: 'kelgis:centlinehp', // 指定要显示的图层
      format: 'image/png', // 图层格式
      transparent: true, // 是否透明
      attribution: 'WMS Layer', // 属性信息
    })
    .addTo(map);

  // 阀井
  L.tileLayer
    .wms(config.mapUrl + '/geoserver/kelgis/wms', {
      layers: 'kelgis:valvewell', // 指定要显示的图层
      format: 'image/png', // 图层格式
      transparent: true, // 是否透明
      attribution: 'WMS Layer', // 属性信息
    })
    .addTo(map);

  watchEffect(() => {
    const yourLayer = toggleImage.value ? wmtsLayer : urlTemplateLayer;
    yourLayer.bringToBack();
  });
}

const showBottom = ref(false);

const workingTickets = ref([]);

// 初始化状态
function initData() {
  showBottom.value = false;
}

let a = 1;

// 获取作业票数据
function getData() {
  initData();
  getAllApprovedTicket().then(res => {
    workingTickets.value = res.data.rows.filter(item => item.longitude || item.latitude);
    // workingTickets.value = [
    //   {
    //     longitude: 86.162566,
    //     latitude: 41.736613,
    //     workOperationType: '安静的号计划',
    //   },
    //   {
    //     longitude: 86.162866,
    //     latitude: 41.728613,
    //     workOperationType: '水电费SV',
    //   },
    //   {
    //     longitude: 86.183566,
    //     latitude: 41.726613,
    //     workOperationType: 'V型从V型',
    //   },
    // ];

    // 清除原有的实体
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    map.on('click', function () {
      showBottom.value = false;
    });

    const customIcon1 = L.icon({
      iconUrl: new URL(
        '../../../assets/image/work/icon-map-pin-user-fill2-click.png',
        import.meta.url
      ).href,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    workingTickets.value.forEach(item => {
      const marker = L.marker([item.latitude, item.longitude], {
        icon: customIcon1,
      }).addTo(map);

      marker.on('click', e => {
        currentItem.value = item;
        showBottom.value = true;
      });

      const customIcon = L.divIcon({
        html: `<div style="background-color: white; border: 2px solid #aef; padding: 5px; width: 100px; border-radius: 5px; text-align: center;transform: translate(-40px, 6px);">
           ${item.workOperationType}
         </div>`,
        className: 'my-custom-icon',
      });

      L.marker([item.latitude, item.longitude], {
        icon: customIcon,
      }).addTo(map);
    });
  });
}

// 轮询间隔（20s）
const POLL_INTERVAL = 20 * 1000;
const timer = setInterval(getData, POLL_INTERVAL);

// 当前选中的作业票项
const currentItem = ref();

// 清除监听
onUnmounted(() => {
  clearInterval(timer);
  initData();
});

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  getData();
  return false;
}

onBeforeRouteLeave(() => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }
});

watch(showBottom, value => {
  if (value) {
    document.addEventListener('backbutton', exec, false);
  } else {
    document.removeEventListener('backbutton', exec);
  }
});

const workAreaList = ref([]);
// 获取区域
getWorkArea().then(res => {
  // 去除次高压区
  res.data.rows.pop();

  workAreaList.value = res.data.rows;
});

function tabChang({ name: value }) {
  const o = {
    L: [41.77165775490509, 86.13921971858356],
    X: [41.71391335585145, 86.19453113763484],
    K: [41.7098939122565, 86.24074026806268],
    S: [41.74151744680011, 86.17005792257673],
  };

  map.setView(o[value], 12);
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.wrapper {
  height: 100%;
  width: 100%;
  position: relative;

  .earth {
    height: 100%;
    width: 100%;
  }

  button {
    position: absolute;
    top: 0;
    left: 0;
  }

  .tooltip {
    width: 100%;
    height: 78px;
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: #fff;
    border-bottom: 1px solid #ddd;

    padding: 16px 24px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 9999;

    .left {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .name {
        font-family: 思源黑体;
        font-size: 14px;
        color: #34394f;
      }

      .position {
        font-family: 思源黑体;
        font-size: 12px;
        color: #84abbb;
      }
    }

    .right {
      height: 28px;
      border-radius: 16px;
      opacity: 1;
      display: flex;
      flex-direction: column;
      padding: 4px 8px;
      background: linear-gradient(180deg, #d4f3ec 0%, #d3f0ff 100%);

      font-family: 思源黑体;
      font-size: 14px;
      color: #34394f;
    }
  }

  .tab-container {
    position: fixed;
    width: 100vw;
    top: 60px;
    margin: 0 auto;
    z-index: 9999;

    :deep(.van-tabs) {
      .van-tabs__wrap {
        height: unset;
      }
      .van-tabs__nav {
        height: 34px;
        border-radius: 34px;
        background: rgba(0, 0, 0, 0.5);
        padding: 2px;
        border: none;

        .van-tab {
          border: none;
          height: 100%;

          font-family: 思源黑体;
          font-size: 14px;
          line-height: 16px;
          text-align: center;
          color: #fff;

          &--active {
            // width: 74px;
            // height: 28px;
            border-radius: 34px;
            opacity: 1;

            background: linear-gradient(
              180deg,
              #ffffff 0%,
              rgba(172, 180, 212, 0.8788) 70%,
              #f2f3f7 100%
            );

            // border: 1px solid;
            // border-image: linear-gradient(180deg, #ffffff 0%, rgba(171, 198, 226, 0) 100%) 1;

            font-family: 思源黑体;
            font-size: 14px;
            line-height: 16px;
            text-align: center;
            color: #1e1e1e;
          }
        }
      }
    }
  }

  .toggle {
    position: fixed;
    bottom: 80px;
    right: 30px;
    z-index: 9999;
    border-radius: 4px;
    background-color: #0002;
  }
}

.bottom-enter-active,
.bottom-leave-active {
  transition: all 0.3s;
}

.bottom-enter-from,
.bottom-leave-to {
  transform: translateY(78px);
}

:global(.van-tabbar) {
  z-index: 100;
}
</style>
