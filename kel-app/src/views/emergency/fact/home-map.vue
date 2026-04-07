<template>
  <div class="home-map">
    <div class="home-map-content" id="home"></div>
    <div class="change-buttons">
      <div class="button button-active">地图</div>
      <div class="button" @click="changePage">监控</div>
    </div>
    <div class="map-buttons">
      <div class="button" v-for="(btn, i) in buttons" :key="i" @click="buttonClick(btn)">
        <img :src="btn.active ? btn.activeImg : btn.img" alt="" />
      </div>
    </div>
    <van-popup
      class="map-layer-change"
      v-model:show="showLayerSelect"
      position="bottom"
      :style="{ height: '30%' }"
    >
      <div class="map-title">图层选择</div>
      <van-checkbox-group
        v-model="layerChecked"
        :style="{ height: 'calc(100% - 51px)', overflow: 'auto' }"
      >
        <van-cell-group inset>
          <van-cell
            v-for="(item, index) in layerNames"
            clickable
            :key="item"
            :title="item"
            @click.stop="layerChange(index)"
          >
            <template #right-icon>
              <van-checkbox :name="item" :ref="el => (checkboxRefs[index] = el)" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-checkbox-group>
    </van-popup>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import * as Cesium from 'cesium';
import { showDialog } from 'vant';
import { useRouter } from 'vue-router';
import config from '../../../config';

let viewer = null;
const router = useRouter();

const buttons = ref([
  {
    name: '定位',
    img: new URL('../../../assets/image/emergency/map/focus-3-fill-2.png', import.meta.url).href,
    activeImg: new URL('../../../assets/image/emergency/map/focus-3-fill.png', import.meta.url)
      .href,
    active: false,
  },
  {
    name: '图层',
    img: new URL('../../../assets/image/emergency/map/spam-2-fill-2.png', import.meta.url).href,
    activeImg: new URL('../../../assets/image/emergency/map/spam-2-fill.png', import.meta.url).href,
    active: false,
  },
  {
    name: '人员',
    img: new URL('../../../assets/image/emergency/map/map-pin-user-fill-2.png', import.meta.url)
      .href,
    activeImg: new URL('../../../assets/image/emergency/map/map-pin-user-fill.png', import.meta.url)
      .href,
    active: false,
  },
  {
    name: '车辆',
    img: new URL('../../../assets/image/emergency/map/roadster-fill-2.png', import.meta.url).href,
    activeImg: new URL('../../../assets/image/emergency/map/roadster-fill.png', import.meta.url)
      .href,
    active: false,
  },
]);
const showLayerSelect = ref(false);
const layer = [
  // {
  //   name: '地形',
  //   url:
  //     config.mapUrl +
  //     '/geoserver/gwc/service/wmts?layer=kelgeobase&style=&tilematrixset=EPSG%3A3857_kelgeobase&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fpng&TileMatrix=EPSG%3A3857_kelgeobase%3A{TileMatrix}&TileCol={TileCol}&TileRow={TileRow}',
  //   type: 'wmts',
  //   loadType: 'WebMapTileServiceImageryProvider',
  //   coordinateSystem: 'WGS84',
  //   tileMatrixSetID: 'EPSG:3857',
  //   style: 'default',
  //   format: 'tiles',
  //   minimumLevel: 0,
  //   maximumLevel: 19
  // },
  {
    name: '高压、次高压管线',
    url: config.mapUrl + '/geoserver/kelgis/wms',
    type: 'wms',
    layer: 'kelgis:centlinehp',
    checked: true,
    EPSG: 4326,
    parameters: {
      transparent: true,
      service: 'WMS',
      format: 'image/png',
    },
  },
  {
    name: '中、低压管线',
    url: config.mapUrl + '/geoserver/kelgis/wms',
    type: 'wms',
    layer: 'kelgis:centlinemp',
    checked: true,
    EPSG: 4326,
    parameters: {
      transparent: true,
      service: 'WMS',
      format: 'image/png',
    },
  },

  {
    name: '站场',
    url: config.mapUrl + '/geoserver/kelgis/wms',
    type: 'wms',
    layer: 'kelgis:station',
    checked: false,
    EPSG: 4326,
    parameters: {
      transparent: true,
      service: 'WMS',
      format: 'image/png',
    },
  },
  {
    name: '调压箱(柜)',
    url: config.mapUrl + '/geoserver/kelgis/wms',
    type: 'wms',
    layer: 'kelgis:compressorbox',
    checked: false,
    EPSG: 4326,
    parameters: {
      transparent: true,
      service: 'WMS',
      format: 'image/png',
    },
  },
  {
    name: '阀井',
    url: config.mapUrl + '/geoserver/kelgis/wms',
    type: 'wms',
    layer: 'kelgis:valvewell',
    checked: false,
    EPSG: 4326,
    parameters: {
      transparent: true,
      service: 'WMS',
      format: 'image/png',
    },
  },
];
const layerNames = computed(() => {
  const names = [];
  layer.forEach(item => {
    names.push(item.name);
  });
  return names;
});
const layerChecked = ref([]);
const checkboxRefs = ref([]);
const layerAddList = [];

onMounted(() => {
  initEarth();
});

function initEarth() {
  viewer = new Cesium.Viewer('home', {
    animation: false, //“动画”小部件
    baseLayerPicker: false, //图层选择小部件
    fullscreenButton: false, //全屏小部件
    vrButton: false, //VR按钮小部件
    geocoder: false, //地理编码器小部件
    homeButton: false, // 回到原点小部件
    infoBox: false, // 信息框小部件(点击具体的entity时显示)
    sceneModePicker: false, //二三维切换
    selectionIndicator: false, //entity选择时的框
    timeline: false, //时间轴小部件
    navigationHelpButton: false, //导航帮助按钮
    baseLayer: false,
    orderIndependentTranslucency: false,
    creditContainer: document.createElement('div'),
    contextOptions: {
      requestWebgl1: true,
    },
  });
  viewer.scene.debugShowFramesPerSecond = import.meta.env.DEV;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(86.163566, 41.736613, 23000),
    duration: 0,
  });
  // 在线影像
  viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: config.mapUrl + '/kelimagetiles/{z}/{x}/{y}.png',
      // url: `https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}`
    })
  );
  // 影像注记.
  viewer.imageryLayers.addImageryProvider(
    new Cesium.UrlTemplateImageryProvider({
      url: config.mapUrl + '/keldmtiles/{z}/{x}/{y}.png',
    })
  );
  layer.forEach((item, i) => {
    if (item.checked) {
      setTimeout(() => {
        layerChange(i);
      }, 2000);
    }
  });
}

function changePage() {
  router.push('/emergency/home/camera');
}

function buttonClick(data) {
  switch (data.name) {
    case '定位':
      getLocation();
      break;
    case '图层':
      showLayerSelect.value = true;
      break;
    case '人员':
      data.active = !data.active;
      break;
    case '车辆':
      data.active = !data.active;
      break;
    default:
      break;
  }
}

function getLocation() {
  // eslint-disable-next-line no-undef
  const permissions = cordova.plugins.permissions;
  permissions.requestPermissions(
    [permissions.ACCESS_COARSE_LOCATION, permissions.ACCESS_FINE_LOCATION],
    data => {
      if (data.hasPermission) {
        navigator.geolocation.getCurrentPosition(
          data => {
            //       alert(`
            //   accuracy 精度(米)-${data.coords.accuracy}
            //   altitude 海拔高度-${data.coords.altitude}
            //   altitudeAccuracy 海拔坐标的准确度(米)-${data.coords.altitudeAccuracy}
            //   heading 行进方向(度)-${data.coords.heading}
            //   latitude 纬度-${data.coords.latitude}
            //   longitude 经度-${data.coords.longitude}
            //   speed 速度(m/s)-${data.coords.speed}
            // `)
            viewer.camera.flyTo({
              duration: 3,
              destination: Cesium.Cartesian3.fromDegrees(
                data.coords.longitude,
                data.coords.latitude,
                3500.0
              ),
            });
          },
          err => {
            showDialog({
              title: '错误',
              message: err,
            });
          },
          {
            enableHighAccuracy: true,
          }
        );
      } else {
        showDialog({
          title: '警告',
          message: '请给予定位权限！',
        });
      }
    },
    err => {
      showDialog({
        title: '错误',
        message: err,
      });
    }
  );
}

function layerChange(index) {
  const layerData = layer[index];
  checkboxRefs.value[index]?.toggle();
  const checked = !checkboxRefs.value[index]?.checked.value;
  const existing = layerAddList[index];
  if (checked) {
    if (existing) {
      const layer = viewer.imageryLayers.get(viewer.imageryLayers.indexOf(existing));
      layer.show = true;
    } else {
      let layer = null;
      switch (layerData.type) {
        case 'wmts':
          layer = new Cesium.WebMapTileServiceImageryProvider({
            url: layerData.url,
            layer: layerData.loadType,
            style: layerData.style,
            tileMatrixSetID: layerData.tileMatrixSetID,
            minimumLevel: layerData.minimumLevel || 0,
            maximumLevel: layerData.maximumLevel || 18,
          });
          break;
        case 'wms':
          layer = new Cesium.WebMapServiceImageryProvider({
            url: layerData.url,
            layers: layerData.layer,
            parameters: layerData.parameters,
          });
          break;
        default:
          break;
      }
      layerAddList[index] = viewer.imageryLayers.addImageryProvider(layer);
    }
  } else {
    if (existing) {
      const layer = viewer.imageryLayers.get(viewer.imageryLayers.indexOf(existing));
      layer.show = false;
    }
  }
}
</script>

<style scoped lang="less">
.home-map {
  width: 100%;
  height: 100vh;
  position: relative;
  &-content {
    width: 100%;
    height: 100%;
  }
  .change-buttons {
    position: absolute;
    top: 12px;
    left: calc(50vw - 134px / 2);
    width: 134px;
    height: 34px;
    padding: 1%;
    border-radius: 50px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .button {
      flex: 1;
      height: 34px;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .button-active {
      color: #000;
      border-radius: 50px;
      background: linear-gradient(
        180deg,
        #ffffff 0%,
        rgba(172, 180, 212, 0.8788) 70%,
        #f2f3f7 100%
      );
    }
  }
  .map-buttons {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    .button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background-color: #fff;
      border-radius: 50%;
      img {
        width: 24px;
      }
    }
  }

  .map-layer-change {
    font-size: 14px;
    color: #1e1e1e;
    .map-title {
      text-align: center;
      padding: 16px;
    }
  }
}
</style>
