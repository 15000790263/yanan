<template>
  <div>
    <button @click="btnClick">扫描</button>

    <!-- <canvas ref="can" id="qr-canvas" style="display: none"></canvas>
    <video ref="vid" id="qr-video" width="300" height="300"></video> -->
    <div>有数据吗？{{ scanData }}</div>
  </div>
</template>

<script setup>
import { qrScanner2 } from '../utils/qrscanner2';
async function btnClick() {
  console.log('扫描按下了');
  const res = await qrScanner2();
  console.log(res);
  scanData.value = res;
}

// import jsQR from 'jsqr';

// const can = ref(null);
// const vid = ref(null);

const scanData = ref('');

// onMounted(() => {
//   const video = vid.value;
//   const canvas = can.value.getContext('2d');

//   // 请求用户的摄像头权限
//   navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
//     video.srcObject = stream;
//     video.setAttribute('playsinline', true); // 需要加上这一行，防止在 iOS 上全屏
//     video.play();
//     requestAnimationFrame(tick);
//   });

//   function tick() {
//     if (video.readyState === video.HAVE_ENOUGH_DATA) {
//       can.value.width = video.videoWidth;
//       can.value.height = video.videoHeight;
//       canvas.drawImage(video, 0, 0, can.value.width, can.value.height);

//       const imageData = canvas.getImageData(0, 0, can.value.width, can.value.height);
//       const code = jsQR(imageData.data, imageData.width, imageData.height);

//       if (code) {
//         console.log('QR code found:', code.data);
//         scanData.value = code.data;
//         // 在此处处理 QR 码数据
//       } else {
//         console.log('No QR code found.');
//       }
//     }
//     requestAnimationFrame(tick);
//   }
// });

const aaa = {
  type: 'FeatureCollection',
  layer: { id: 'm-765d4c95-4fa0-42e3-9ecd-7fa9d49d3e77' },
  features: [
    {
      type: 'Feature',
      properties: {
        name: '',
        remark: '水柱粒子效果',
        id: 'm-85cd8182-e6af-4a4b-a9c4-8ca0127f8938',
        type: 'particleSystem',
        style: {
          startColor: 'rgba(255,255,255,0.6)',
          endColor: 'rgba(204,220,255,0.4)',
          startScale: 1,
          endScale: 4,
          minimumParticleLife: 6,
          maximumParticleLife: 7,
          minimumSpeed: 9,
          maximumSpeed: 9.5,
          emissionRate: 100,
          image: './img/particle/penquan.png',
          particleSize: 8,
          heading: 290,
          pitch: 40,
          gravity: -3.5,
          transZ: 5,
          maxHeight: 5000,
        },
      },
      geometry: { type: 'Point', coordinates: [117.224855, 31.815135, 28] },
    },
    {
      type: 'Feature',
      properties: {
        name: '',
        remark: '火焰粒子效果',
        id: 'm-02edacdb-6679-4731-94a0-a3d3043429fa',
        type: 'particleSystem',
        style: {
          startColor: 'rgb(255,255,255)',
          endColor: 'rgba(128,0,0,0)',
          startScale: 3,
          endScale: 1.5,
          minimumParticleLife: 3,
          maximumParticleLife: 6,
          minimumSpeed: 7,
          maximumSpeed: 9,
          emissionRate: 100,
          image: './img/particle/fire2.png',
          particleSize: 5,
          maxHeight: 5000,
        },
      },
      geometry: { type: 'Point', coordinates: [117.225518, 31.815549, 28.3] },
    },
    {
      type: 'Feature',
      properties: {
        name: '未命名1',
        id: 'm-b2a7361b-a1e1-40bf-8b46-908d75561f3d',
        type: 'fixedRoute',
        style: {
          speed: 120,
          positions: [
            [117.226585, 31.818437, 32.41],
            [117.226838, 31.811681, 28.23],
          ],
          clockLoop: true,
          frameRate: 1,
          showStop: true,
          updateClock: true,
          model_url: '//data.mars3d.cn/gltf/mars/qiche.gltf',
          model_scale: 0.2,
        },
      },
      geometry: { type: 'Point', coordinates: [] },
    },
    {
      type: 'Feature',
      properties: {
        name: '',
        remark: '车辆尾气',
        id: 'm-3115aec1-248f-44bc-b063-f1daa4bf676b',
        type: 'particleSystem',
        style: {
          startColor: 'rgba(128,128,128,0.7)',
          endColor: 'rgba(255,255,255,0)',
          startScale: 1,
          endScale: 5,
          minimumParticleLife: 3,
          maximumParticleLife: 6,
          minimumSpeed: 1,
          maximumSpeed: 4,
          emissionRate: 20,
          image: './img/particle/smoke.png',
          particleSize: 12,
          pitch: 40,
          maxHeight: 1000,
        },
      },
      geometry: { type: 'Point', coordinates: [] },
    },
  ],
};
</script>

<style lang="less" scoped></style>
