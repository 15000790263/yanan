<template>
  <div class="wrapper">
    <div v-if="eventList.length" v-slider="sliderOver" ref="tipsEl" class="tips-wrapper">
      <van-swipe @change="eventChange">
        <template v-for="item in eventList" :key="item.id">
          <van-swipe-item>
            <div style="padding: 0 4px">
              <!-- <div class="tips" @click="goDetail(item.id)"> -->
              <div class="tips">
                <div class="left">
                  <div class="title">
                    <van-text-ellipsis :content="item.name" />
                  </div>
                  <div class="time">{{ item.receiveTime }}接警</div>
                  <div class="contacts">{{ item.submitBy }}</div>
                  <div class="phone-number">{{ item.submitPhone }}</div>
                  <div class="position">
                    {{ item.description }}
                  </div>
                </div>
                <div class="right">
                  <div :class="`type ext${item.type}`">{{ getType(item.type) }}</div>
                  <div class="statistics">
                    <div class="count">{{ item.level ? intToRoman(item.level) : '无' }}</div>
                    <div class="name">等级</div>
                  </div>
                </div>
              </div>
            </div>
          </van-swipe-item>
        </template>
      </van-swipe>
    </div>

    <transition name="trade60">
      <div v-if="showTipInfo" class="tip-info" @click="showTips">
        <van-text-ellipsis :content="eventList[currentIndex].name" />
      </div>
    </transition>

    <div class="container" id="map" style="z-index: 0"></div>
    <div class="toggle" @click="toggleImage = !toggleImage">
      <van-icon color="#000a" size="40px" name="exchange" />
    </div>

    <van-image-preview
      v-if="show"
      v-model:show="show"
      :images="images"
      :close-on-click-image="false"
    >
      <template #image="{ src }">
        <video
          style="width: 100%"
          controls
          autoplay
          name="media"
          :src="src"
          @touchstart.stop
        ></video>
      </template>
    </van-image-preview>
  </div>
</template>

<script setup lang="jsx">
import { onMounted, ref, watchEffect, watch } from 'vue';
import config from '../../../config';
import { getEventList } from '../../../api/emergency';
import { intToRoman } from '../../../utils/tools';
import { getCameraList } from '../../../api/camera';
import { onBeforeRouteLeave } from 'vue-router';
import changZ from '@/assets/json/场站.json';
import isEqual from 'lodash-es/isEqual';
import L from 'leaflet';

const tipsEl = ref(null);
const showTipInfo = ref(false);

// 切换图层
const toggleImage = ref(true);

let map;

function initEarth() {
  map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    zoom: 13, // 初始缩放级别
    maxZoom: 18, // 最大缩放级别
    minZoom: 10, // 最小缩放级别
    zoomAnimation: false,
    fadeAnimation: false,
  }).setView([41.69695014900003, 86.16914527800003], 10);
  // 定义 URL 模板
  const urlTemplate = `${config.mapUrl}/kelimagetiles/{z}/{x}/{y}.png`;

  // 创建 TileLayer 实例
  const urlTemplateLayer = L.tileLayer(urlTemplate, {});
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
  const tyx = L.tileLayer.wms(config.mapUrl + '/geoserver/kelgis/wms', {
    layers: 'kelgis:compressorbox', // 指定要显示的图层
    format: 'image/png', // 图层格式
    transparent: true, // 是否透明
    attribution: 'WMS Layer', // 属性信息
    maxZoom: 18, // 最大缩放级别
    minZoom: 10, // 最小缩放级别
    zIndex: 3,
  });

  // 站场
  const cz = L.tileLayer.wms(config.mapUrl + '/geoserver/kelgis/wms', {
    layers: 'kelgis:station', // 指定要显示的图层
    format: 'image/png', // 图层格式
    transparent: true, // 是否透明
    attribution: 'WMS Layer', // 属性信息
    maxZoom: 18, // 最大缩放级别
    minZoom: 10, // 最小缩放级别
    zIndex: 4,
  });

  // 中、低压管线
  const lgx = L.tileLayer.wms(config.mapUrl + '/geoserver/kelgis/wms', {
    layers: 'kelgis:centlinemp', // 指定要显示的图层
    format: 'image/png', // 图层格式
    transparent: true, // 是否透明
    attribution: 'WMS Layer', // 属性信息
    maxZoom: 18, // 最大缩放级别
    minZoom: 10, // 最小缩放级别
    zIndex: 5,
  });

  // 高压、次高压管线
  const hgx = L.tileLayer.wms(config.mapUrl + '/geoserver/kelgis/wms', {
    layers: 'kelgis:centlinehp', // 指定要显示的图层
    format: 'image/png', // 图层格式
    transparent: true, // 是否透明
    attribution: 'WMS Layer', // 属性信息
    maxZoom: 18, // 最大缩放级别
    minZoom: 10, // 最小缩放级别
    zIndex: 6,
  });

  // 阀井
  const fj = L.tileLayer.wms(config.mapUrl + '/geoserver/kelgis/wms', {
    layers: 'kelgis:valvewell', // 指定要显示的图层
    format: 'image/png', // 图层格式
    transparent: true, // 是否透明
    attribution: 'WMS Layer', // 属性信息
    maxZoom: 18, // 最大缩放级别
    minZoom: 10, // 最小缩放级别
    zIndex: 7,
  });
  const list = [tyx, cz, lgx, hgx, fj];

  let timer;
  function processExtraLayer(show = true) {
    clearInterval(timer);
    let i = 0;
    if (show) {
      timer = setInterval(() => {
        if (i < list.length) {
          list[i].addTo(map);
        } else {
          clearInterval(timer);
        }
        i++;
      }, 100);
    } else {
      list.forEach(item => {
        item.removeFrom(map);
      });
    }
  }

  let t1;
  watchEffect(() => {
    clearTimeout(t1);

    processExtraLayer.call(this, false);

    // 性能优化：如果需要频繁切换，则不销毁图层
    if (toggleImage.value) {
      // 添加URL模板图层，移除WMTS图层
      urlTemplateLayer.addTo(map);
      wmtsLayer.removeFrom(map);
    } else {
      // 添加WMTS图层，移除URL模板图层
      wmtsLayer.addTo(map);
      urlTemplateLayer.removeFrom(map);
    }

    t1 = setTimeout(() => {
      processExtraLayer.call(this, true);
    }, 500);
  });

  map.on('move', () => {
    processExtraLayer.call(this, false);
  });

  let t2;
  map.on('moveend', () => {
    clearTimeout(t2);
    t2 = setTimeout(() => {
      processExtraLayer.call(this, true);
    }, 500);
  });
}

let timer;
function addToEarth(x, y) {
  map.setView([y, x], 13);

  timer && clearInterval(timer);
  // 清除原有的实体
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  const customIcon1 = L.icon({
    iconUrl: new URL('../../../assets/image/emergency/color-1.png', import.meta.url).href,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  L.marker([y, x], {
    icon: customIcon1,
    zIndexOffset: 10000,
  }).addTo(map);

  // 做动画的常量
  let r = 40;
  let marker;

  const bgPath = new URL('../../../assets/image/emergency/color-1.png', import.meta.url).href;

  function grow() {
    r++;
    marker && map.removeLayer(marker);
    marker = L.marker([y, x], {
      icon: L.divIcon({
        className: 'my-animate-icon',
        html: `<div class="my-marker" style="width: 100%; height: 100%; background: #f00a; border-radius: 50%; opacity: 0.6" ></div>`,
        iconSize: [r * 2, r * 2],
        iconAnchor: [r, r + 16],
      }),
      zIndexOffset: 10000,
    }).addTo(map);
  }

  grow();
  // timer = setInterval(() => {
  //   grow();
  //   if (r > 50) {
  //     r = 16;
  //   }
  // }, 30);

  // 查重数组
  let posiArr = [];

  const DISTANCE = 1;
  const cameras = cameraList.value
    .filter(item => {
      // 会有多个摄像头同一个位置重叠问题，暂时做成圆形
      const x1 = item.longitude;
      const y1 = item.latitude;
      return Math.sqrt(((x1 - x) * 100) ** 2 + ((y1 - y) * 100) ** 2) < DISTANCE;
    })
    .map(item => {
      // 将对应的flag置为0
      item.flag = 0;

      const arr = [item.longitude, item.latitude];
      // 查重数组里面找有没有相同经纬度的摄像头
      const res = posiArr.find(value => {
        if (isEqual(value.arr, arr)) {
          // 说明经纬度重复，将value.index加1
          value.index++;
          return true;
        }
      });
      // 如果没有，同时将经纬度数组放入posiArr
      if (!res) {
        posiArr.push({
          arr,
          index: 0, // 记录重复次数
        });
      } else {
        // 如果有，
        item.flag = res.index;
      }
      return item;
    });

  const customIcon2 = L.icon({
    iconUrl: new URL('../../../assets/image/emergency/icon-video.png', import.meta.url).href,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  cameras.forEach(item => {
    const x1 = item.longitude;
    const y1 = item.latitude;
    const r = Math.sqrt((x1 - x) ** 2 + (y1 - y) ** 2);
    // 重合摄像头在圆周上显示，角度差15°
    const deltaAngel = (Math.PI / 12) * item.flag;
    const x2 = r * (((x1 - x) / r) * Math.cos(deltaAngel) - ((y1 - y) / r) * Math.sin(deltaAngel));
    const y2 = r * (((y1 - y) / r) * Math.cos(deltaAngel) + ((x1 - x) / r) * Math.sin(deltaAngel));

    const marker = L.marker([y2 + y, x2 + x], {
      icon: customIcon2,
      zIndexOffset: 10000,
    }).addTo(map);

    marker.on('click', e => {
      const curCamera = `${config.videoUrl}/${item.APP}/${item.STREAM}.live.mp4`;
      images.value = [curCamera];
      show.value = true;
    });

    const customIcon = L.divIcon({
      html: `<div style="background-color: white; border: 2px solid #aef; padding: 5px; width: 100px; border-radius: 5px; text-align: center;transform: translate(-40px, 6px);">
           ${item.NAME}
         </div>`,
      className: 'my-custom-icon',
    });

    L.marker([y2 + y, x2 + x], {
      icon: customIcon,
      zIndexOffset: 10000,
    }).addTo(map);
  });
}

onMounted(() => {
  initEarth();
});

onDeactivated(() => {
  clearInterval(timer);
});

function showTips() {
  showTipInfo.value = false;
  tipsEl.value.style.cssText = 'transition: transform 0.3s; transform: translateY(0)';
}

// 摄像头列表
const cameraList = ref([]);
const eventList = ref([]);

async function initData() {
  const res = await getCameraList();
  cameraList.value = res.data.responseModelList[0].dataTable.stringRowsMaps.map(item => {
    changZ.features.find(value => {
      if (value.properties.SiteID === item['CODE']) {
        item.longitude = value.geometry.coordinates[0];
        item.latitude = value.geometry.coordinates[1];
        return true;
      }
    });
    return item;
  });

  const { data } = await getEventList();
  // 应急抢险
  eventList.value = data.rows.filter(item => {
    return item.eventStatus === '2';
  });
}

watchEffect(() => {
  if (eventList.value.length) {
    const { x, y } = eventList.value[currentIndex.value];
    addToEarth(x, y);
  }
});

// 获取时间类型
function getType(type) {
  const typeMap = {
    1: '停气',
    2: '泄漏',
    3: '火灾',
    4: '爆炸',
  };
  return typeMap[type];
}

// 滑动结束
function sliderOver() {
  setTimeout(() => {
    showTipInfo.value = true;
  }, 400);
}

const currentIndex = ref(0);

// event change
function eventChange(index) {
  currentIndex.value = index;
}

initData();

const show = ref(false);
const images = ref([]);

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  show.value = false;
  return false;
}

onBeforeRouteLeave(() => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }
});

watch(show, value => {
  if (value) {
    document.addEventListener('backbutton', exec, false);
  } else {
    document.removeEventListener('backbutton', exec);
  }
});
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;

  .tips-wrapper {
    width: 100%;
    height: 217px;
    padding: 16px 12px;
    position: fixed;
    background-color: #fff;
    z-index: 2;
    top: 46px;

    .tips {
      height: 100%;
      width: 100%;
      border-radius: 16px;
      background: linear-gradient(180deg, #ff4a44 0%, #ff9553 100%);
      padding: 16px;
      display: grid;
      gap: 18px;
      grid-template-columns: auto 72px;

      .left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .title {
          height: 23px;
          font-family: Source Han Sans;
          font-size: 16px;
          font-weight: bold;
          font-variation-settings: 'opsz' auto;
          color: #fff;
          margin-bottom: 8px;
        }

        .time,
        .contacts,
        .phone-number,
        .position {
          height: 17px;
          font-family: 思源黑体;
          font-size: 12px;
          font-variation-settings: 'opsz' auto;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 4px;
          padding-left: 20px;
        }
        .time {
          background: url('/src/assets/image/emergency/time-fill.png') no-repeat left/16px;
        }
        .contacts {
          background: url('/src/assets/image/emergency/contacts-fill.png') no-repeat left/16px;
        }
        .phone-number {
          background: url('/src/assets/image/emergency/cellphone-fill.png') no-repeat left/16px;
        }
        .position {
          background: url('/src/assets/image/emergency/map-pin-2-fill.png') no-repeat left top/16px;
          height: auto;
          min-height: 17px;
        }
      }

      .right {
        display: grid;
        gap: 12px;
        grid-auto-rows: repeat(2, auto);

        .type {
          width: 72px;
          height: 92px;
          border-radius: 4px;
          padding: 8px;
          padding-top: calc(100% - 4px);
          text-align: center;

          font-family: 思源黑体;
          font-size: 12px;
          font-variation-settings: 'opsz' auto;
          color: #fff;

          &.ext1 {
            background: url('/src/assets/image/emergency/icon-1-64px-停气.png') no-repeat center 4px/64px
              rgba(0, 0, 0, 0.11);
          }
          &.ext2 {
            background: url('/src/assets/image/emergency/icon-1-64px-泄漏.png') no-repeat center 4px/64px
              rgba(0, 0, 0, 0.11);
          }
          &.ext3 {
            background: url('/src/assets/image/emergency/icon-1-64px-火灾.png') no-repeat center 4px/64px
              rgba(0, 0, 0, 0.11);
          }
          &.ext4 {
            background: url('/src/assets/image/emergency/icon-1-64px-爆炸.png') no-repeat center 4px/64px
              rgba(0, 0, 0, 0.11);
          }
        }

        .statistics {
          width: 72px;
          height: 49px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.11);
          padding: 5px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;

          font-family: Source Han Sans;
          font-size: 12px;
          font-weight: bold;
          color: #fff;
        }
      }
    }

    .van-swipe {
      // height: 185px;

      // :deep(.van-swipe-item) {
      //   padding: 16px 12px;
      //   padding-right: 0;
      // }

      :deep(.van-swipe__indicators) {
        bottom: 8px;

        .van-swipe__indicator--active {
          background-color: #fff;
        }
      }
    }
  }

  .tip-info {
    height: 58px;
    width: 100vw;
    flex-shrink: 0;
    position: fixed;
    z-index: 1;
    background:
      url('/src/assets/image/emergency/容器_6096.png') no-repeat 24px center / 34px,
      linear-gradient(180deg, #ff4a44 0%, #ff9553 100%);
    padding: 0 24px;
    padding-left: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    font-family: 思源黑体;
    font-size: 14px;
    color: #fff;
    box-shadow: 0px 3px 7px 0px rgba(14, 68, 118, 0.1);

    .van-text-ellipsis {
      flex: 1;
    }
  }

  .container {
    height: 100%;
    transform: 'translate3d(0, 0, 0)';
    will-change: 'transform';
  }

  .toggle {
    position: fixed;
    bottom: 80px;
    right: 30px;
    z-index: 99;
    border-radius: 4px;
    background-color: #0002;
  }
}

:global(.van-nav-bar) {
  z-index: 3 !important;
}
</style>
