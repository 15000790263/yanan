<template>
  <div>
    <button @click="btnClick">按钮</button>
    <button @click="btnClick2">按钮</button>
    <hr />
    <input ref="inputRef" type="file" @input="handleInput" />
    <div v-html="text"></div>
    <hr />
    <ul style="padding: 10px">
      <li v-for="(item, index) in list" :key="index">{{ item }}</li>
    </ul>
    <div id="container" class="earth"></div>
    <!-- -->
    <!-- <div>{{ message }}</div> -->
    <!-- <video v-if="aaaa" :srcObject="aaaa" controls autoplay></video> -->
    <!-- 
    <home-map></home-map> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import { getVideo } from '../utils/video-capture';
import { scanQRCode, getPhoto, getAudio, navigateByLocation } from '../utils/cordova-tools';

import Earth from '../utils/earth';
import service from '@/utils/service';
import config from '../config';
import HomeMap from '@/views/emergency/fact/home-map.vue';
import { useBarrage } from '@/utils/barrage';
import { createLoading } from '@/utils/loading-fn';
import * as Cesium from 'cesium';
// import { downloadFile } from '../utils/check-update';

// import Test from '../../public/之前的导出/index.html';
console.log(pages);

const text = ref('');

function handleInput(e) {}

let startRecord, stopRecord;

(async () => {
  const res = await getAudio();
  console.log(res);
  if (res) {
    startRecord = res.startRecord;
    stopRecord = res.stopRecord;
  }
})();

const a = ref([{ id: 123, text: 1111 }]);

function btnClick() {
  // scanQRCode().then((res) => {
  //   console.log(res);
  //   text.value = res.text;
  // });
  // getVideo().then((res) => {
  //   console.log(res);
  //   console.log();
  //   text.value = res.size / 1024 / 1024;
  // });
  // window.open(new URL('./index.html', import.meta.url).href, '_self');
  // function openGaodeMap() {
  //   var destinationLat = 41.72662278012261; // 目标纬度
  //   var destinationLng = 86.18119634440903; // 目标经度
  //   // var destination = destinationLat + ',' + destinationLng;
  //   var url = `androidamap://route?sourceApplication=webapp&dlat=${destinationLat}&dlon=${destinationLng}&dname=目标地点&dev=0&t=0`;
  //   cordova.InAppBrowser.open(url, '_system');
  // }
  // openGaodeMap();
  // getPhoto().then(res => {
  //   console.log(res);
  // });
  // const url =
  //   'http://api.map.baidu.com/marker?location=39.90882,116.39750&title=天安门广场&content=北京的中心地标&output=html';
  // cordova.InAppBrowser.open(url, '_system');
  // function checkBaiduMap() {
  //   var scheme = 'baidumap://map/';
  //   var ref = cordova.InAppBrowser.open(scheme, '_system', 'location=no');
  //   ref.addEventListener('loadstart', function (event) {
  //     console.log(event.url);
  //     if (event.url.indexOf(scheme) !== -1) {
  //       ref.close();
  //       alert('Baidu Map is installed.');
  //     }
  //   });
  // setTimeout(function () {
  //   ref.close();
  //   alert('Baidu Map is not installed.');
  // }, 3000);
  // }
  // checkBaiduMap();
  // startRecord();
  // checkAppAvailable('com.baidu.BaiduMap').then(res => {
  //   if (res) {
  //     var destinationLat = 41.7266227; // 目标纬度
  //     var destinationLng = 86.1811963; // 目标经度
  //     var destination = destinationLat + ',' + destinationLng;
  //     const url = `baidumap://map/direction?destination=latlng:${destination}|name:目标地点&mode=driving&src=webapp`;
  //     cordova.InAppBrowser.open(url, '_system');
  //   } else {
  //     const url =
  //       'http://api.map.baidu.com/marker?location=41.72674373396284,86.17392128765906&title=库尔勒市&content=这里是库尔勒市&output=html';
  //     // cordova.InAppBrowser.open(url, '_self', 'location=no');
  //     cordova.InAppBrowser.open(url, '_system');
  //   }
  // });
  // navigateByLocation(34.40671391543303, 107.6427390154073, '我最牛逼');
  // navigator.geolocation.getCurrentPosition(
  //   data => {
  //     const { longitude, latitude, accuracy } = data.coords;
  //     // resolve({
  //     //   longitude,
  //     //   latitude,
  //     // });
  //     console.log(longitude, latitude);
  //     text.value = `经度${longitude}，纬度${latitude}，精度${accuracy}`;
  //   },
  //   () => {
  //     // resolve(false);
  //     // showDialog({
  //     //   title: '错误',
  //     //   message: err
  //     // });
  //   },
  //   {
  //     enableHighAccuracy: true,
  //     // timeout: 5000,
  //     maximumAge: 0,
  //   }
  // );
  // container是div元素id
  // earth.drawTracks([
  //   {
  //     x: 86.17707747198509,
  //     y: 41.77109637412489,
  //   },
  //   {
  //     x: 86.1784507630007,
  //     y: 41.77231262040027,
  //   },
  //   {
  //     x: 86.1802532074587,
  //     y: 41.77288872900803,
  //   },
  //   {
  //     x: 86.18289250112932,
  //     y: 41.77255266628232,
  //   },
  //   {
  //     x: 86.18420141912857,
  //     y: 41.77263268137671,
  //   },
  // ]);
  // setTimeout(() => {
  //   //   [86.167267, 41.716178, 1000],
  //   //   [86.192907, 41.779545, 1000],
  //   //   [86.192134, 41.778994, 1000],
  //   //   [86.192134, 41.778819, 1000],
  //   //   [86.192691, 41.778604, 1000],
  //   //   [86.193392, 41.778779, 1000],
  //   //   [86.193985, 41.778954, 1000],
  //   //   [86.19438, 41.779021, 1000],
  //   //   [86.19456, 41.778873, 1000],
  //   //   [86.194686, 41.778738, 1000],
  //   //   [86.194919, 41.778496, 1000],
  //   // const arr = [
  //   //   86.17707747198509, 41.77109637412489, 1000, 86.17776411749288, 41.771736506618126, 1000,
  //   //   86.1784507630007, 41.77231262040027, 1000, 86.17900866247577, 41.772744702341186, 1000,
  //   //   86.1802532074587, 41.77288872900803, 1000, 86.18111151434346, 41.77284072015502, 1000,
  //   //   86.18289250112932, 41.77255266628232, 1000, 86.18351477362077, 41.772504657177784, 1000,
  //   //   86.18420141912857, 41.77263268137671, 1000, 86.1846734879152, 41.77287272606102, 1000,
  //   //   86.18505972601334, 41.7732567956874, 1000, 86.18555325247208, 41.7737528822178, 1000,
  //   // ];
  //   earth.drawTracks([
  //     {
  //       x: 86.17707747198509,
  //       y: 41.77109637412489,
  //     },
  //     {
  //       x: 86.1784507630007,
  //       y: 41.77231262040027,
  //     },
  //     {
  //       x: 86.1802532074587,
  //       y: 41.77288872900803,
  //     },
  //     {
  //       x: 86.18289250112932,
  //       y: 41.77255266628232,
  //     },
  //     {
  //       x: 86.18420141912857,
  //       y: 41.77263268137671,
  //     },
  //   ]);
  // }, 2000);
  // useBarrage('徐跃最帅');
  // createLoading();
  // downloadFile();
}

function btnClick2() {
  // var destinationLat = 41.7266227; // 目标纬度
  // var destinationLng = 86.1811963; // 目标经度
  // var destination = destinationLat + ',' + destinationLng;
  // var url = `baidumap://map/direction?destination=latlng:${destination}|name:目标地点&mode=driving&src=webapp`;
  // cordova.InAppBrowser.open(url, '_blank');
  // var url =
  //   'http://api.map.baidu.com/marker?location=41.72674373396284,86.17392128765906&title=库尔勒市&content=这里是库尔勒市&output=html';
  // cordova.InAppBrowser.open(url);
  // stopRecord().then(res => {
  //   console.log(res);
  // });
  // navigateByLocation(31.05656103271538, 121.2134893404988, '我更牛逼');
  // earth.addBillboards(
  //   [
  //     {
  //       x: 86.17707747198509,
  //       y: 41.77109637412489,
  //     },
  //     {
  //       x: 86.1784507630007,
  //       y: 41.77231262040027,
  //     },
  //     {
  //       x: 86.1802532074587,
  //       y: 41.77288872900803,
  //     },
  //     {
  //       x: 86.18289250112932,
  //       y: 41.77255266628232,
  //     },
  //     {
  //       x: 86.18420141912857,
  //       y: 41.77263268137671,
  //     },
  //   ],
  //   new URL('/src/assets/image/work/icon-1.png', import.meta.url).href
  // );
  // earth.addBillboards(
  //   [
  //     {
  //       x: 86.17707747198509,
  //       y: 41.77109637412489,
  //     },
  //     {
  //       x: 86.1802532074587,
  //       y: 41.77288872900803,
  //     },
  //     {
  //       x: 86.18420141912857,
  //       y: 41.77263268137671,
  //     },
  //   ],
  //   '/src/assets/image/work/icon-map-pin-user-fill2-click.png'
  // );
}

// document.addEventListener('visibilitychange', function (e) {
//   console.log(e);
//   if (document.visibilityState === 'hidden') {
//     // 用户按下了Home键
//     console.log('User pressed Home button');
//   }
// });

// onMounted(() => {
//   inputRef.value.oninput = (e) => {
//     console.log(e.target.files[0]);
//     const blob = new Blob([e.target.files[0]], { type: e.target.files[0].type });
//     // const file = new File([blob], e.target.files[0].name, {
//     //   type: e.target.files[0].type
//     // });

//     // blob.name = e.target.files[0].name;
//     // blob.lastModified = e.target.files[0].lastModified;
//     // 创建一个 Blob 对象

//     // 创建一个 FormData 对象
//     var formData = new FormData();

//     // 将 Blob 对象添加到 FormData 中，使用指定的文件名
//     formData.append('file', blob, 'hello.txt');

//     // 从 FormData 对象中获取 File 对象
//     var file = formData.get('file');

//     console.log(file);
//     uploadFile(file);
//   };
// });

let earth = null;
const list = ref([]);
onMounted(async () => {
  // navigator.mediaDevices.enumerateDevices().then((res) => {
  //   console.log(res);
  //   list.value = res
  //     .filter((item) => item.kind === 'videoinput')
  //     .map((item) => item.getCapabilities());
  //   console.log(list.value);
  // });
  // earth = new Earth('container');

  Cesium.Ion.defaultAccessToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NmY3MzIxOS02ZmE5LTRhZjktYmU0My1iMWM4MzlmMjZkOTUiLCJpZCI6MTkzODA4LCJpYXQiOjE3MDcwMjcxNzV9.Yn9jYeHvShzvKVG59Gg2k1idsRUZNeayf5SHwvFn4pw';

  // Keep your Cesium.Ion.defaultAccessToken = 'your_token_here' line above.
  // STEP 2 CODE
  // Initialize the viewer with Cesium World Terrain.

  // 2添加Cesium OSM建筑物和Cesium世界地形
  const viewer = new Cesium.Viewer('container', {
    // terrain: Cesium.Terrain.fromWorldTerrain(),
    selectionIndicator: false,
  });

  // Fly the camera to Denver, Colorado at the given longitude, latitude, and height.
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-104.9965, 39.74248, 4000),
    duration: 0,
  });

  // Add Cesium OSM Buildings.
  // const buildingsTileset = await Cesium.createOsmBuildingsAsync();
  // viewer.scene.primitives.add(buildingsTileset);

  // STEP 3 CODE

  // 3确定新建筑面积
  // async function addBuildingGeoJSON() {
  //   // Load the GeoJSON file from Cesium ion.
  //   const geoJSONURL = await Cesium.IonResource.fromAssetId(2446991);
  //   // Create the geometry from the GeoJSON, and clamp it to the ground.
  //   const geoJSON = await Cesium.GeoJsonDataSource.load(geoJSONURL, {
  //     clampToGround: true,
  //   });
  //   // Add it to the scene.
  //   const dataSource = await viewer.dataSources.add(geoJSON);
  //   // By default, polygons in CesiumJS will be draped over all 3D content in the scene.
  //   // Modify the polygons so that this draping only applies to the terrain, not 3D buildings.
  //   for (const entity of dataSource.entities.values) {
  //     entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
  //   }
  //   // Move the camera so that the polygon is in view.
  //   viewer.flyTo(dataSource);
  // }
  // addBuildingGeoJSON();

  // STEP 4 CODE
  // Hide individual buildings in this area using 3D Tiles Styling language.

  // 5隐藏现场现有的3D建筑物
  // buildingsTileset.style = new Cesium.Cesium3DTileStyle({
  //   // Create a style rule to control each building's "show" property.
  //   show: {
  //     conditions: [
  //       // Any building that has this elementId will have `show = false`.
  //       ['${elementId} === 332469316', false],
  //       ['${elementId} === 332469317', false],
  //       ['${elementId} === 235368665', false],
  //       ['${elementId} === 530288180', false],
  //       ['${elementId} === 530288179', false],
  //       // If a building does not have one of these elementIds, set `show = true`.
  //       [true, true],
  //     ],
  //   },
  //   // Set the default color style for this particular 3D Tileset.
  //   // For any building that has a `cesium#color` property, use that color, otherwise make it white.
  //   color:
  //     "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ff0')",
  // });

  // STEP 6 CODE
  // Add the 3D Tileset you created from your Cesium ion account.

  // 7将新建筑添加到场景中
  // const newBuildingTileset = await Cesium.Cesium3DTileset.fromIonAssetId(2446996);
  // viewer.scene.primitives.add(newBuildingTileset);

  // Move the camera to the new building.
  // viewer.flyTo(newBuildingTileset);

  // STEP 7 CODE
  // Toggle the tileset's show property when the button is clicked.
  // document.querySelector('#toggle-building').onclick = function () {
  //   newBuildingTileset.show = !newBuildingTileset.show;
  // };
});

const inputRef = ref(null);

// 下面是另外的测试
// async function btnClick1() {
//   console.log(123);
//   let stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//   // aaaa.value = stream;
//   let recorder = new RecordRTCPromisesHandler(stream, {
//     type: 'video',
//     timeSlice: 1000,

//     // requires timeSlice above
//     // returns blob via callback function
//     ondataavailable: function (blob) {
//       console.log(blob);
//       // const url = URL.createObjectURL(blob);
//       // aaaa.value = url;
//     },
//     previewStream: function (stream) {
//       console.log(stream);
//     }
//   });
//   recorder.startRecording();

//   const sleep = (m) => new Promise((r) => setTimeout(r, m));
//   await sleep(9000);

//   await recorder.stopRecording();
//   let blob = await recorder.getBlob();
//   console.log(blob);
//   // const bb = await recorder.getDataURL();
//   console.log(bb);
//   // const url = URL.createObjectURL(blob);
//   aaaa.value = blob; // srcObject使用blob不行
//   console.log(url);
//   // invokeSaveAsDialog(blob);
// }

// const message = ref('hello');

// function hasCamera() {
//   // eslint-disable-next-line no-undef
//   const permissions = cordova.plugins.permissions;
//   permissions.checkPermission(
//     [permissions.RECORD_AUDIO],
//     (data) => {
//       if (data.hasPermission) {
//         getAudio();
//       } else {
//         permissions.requestPermissions(
//           [permissions.RECORD_AUDIO],
//           (res) => {
//             if (res.hasPermission) {
//               console.log('相机权限申请成功');
//               getAudio();
//             } else {
//               console.log('获取失败');
//             }
//           },
//           (err) => {
//             console.log(err);
//           }
//         );
//       }
//     },
//     (err) => {
//       console.log(err);
//     }
//   );
// }

// function getAudio() {
//   // const src = 'abc.mp3';
//   // var media = new Media(src, (e) => {
//   //   console.log(e);
//   // });

//   // cordova.file.externalDataDirectory

//   window.resolveLocalFileSystemURL(
//     'file:///storage/emulated/0/Android/data/com.kel.app/files/abc.mp3',
//     (f) => f.file((t) => console.log(t))
//   );

//   // 创建语音识别对象
//   var recognition1 = new webkitSpeechRecognition();

//   // 开始语音识别
//   recognition1.start();

//   // 当语音被识别时触发的事件
//   recognition1.onresult = (event) => {
//     var transcript = event.results[0][0].transcript;
//     console.log(transcript); // 将转录的文本输出到控制台
//     message.value = 333333;
//     setTimeout(() => {
//       message.value = transcript;
//     }, 4000);
//   };
// }

// const aaaa = ref('');

function openBaiduMap(originLat, originLng, destLat, destLng) {
  var schemeURL = `baidumap://map/direction?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&src=yourAppName`;
  var webURL = `https://api.map.baidu.com/direction?origin=${originLat},${originLng}&destination=${destLat},${destLng}&mode=driving&region=&output=html&src=webapp.baidu.openAPIdemo`;

  // Try to open the Baidu Map app
  var iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = schemeURL;
  document.body.appendChild(iframe);

  setTimeout(function () {
    document.body.removeChild(iframe);
    // If the app is not opened within 2 seconds, open the web URL
    window.location.href = webURL;
  }, 2000);
}

function getLocationAndNavigate() {
  // var destinationLat = 41.7266227; // 目标纬度
  // var destinationLng = 86.1811963;
  var originLat = 41.7266227;
  var originLng = 86.1811963;
  // Set your destination coordinates here
  var destLat = 39.915; // Example destination latitude
  var destLng = 116.404; // Example destination longitude
  openBaiduMap(originLat, originLng, destLat, destLng);
}
</script>

<style lang="less" scoped>
.earth {
  width: 100%;
  height: 500px;
}

:global(#app) {
  height: 100px !important;
}
</style>
