import jsQR from 'jsqr';
import { getPermissions } from './cordova-tools';
import router from '../router';

export async function qrScanner2() {
  let res;
  if (window.cordova) {
    res = await getPermissions('CAMERA');
  } else {
    res = true;
  }
  if (res) {
    const removeGuard = router.beforeEach((to, from) => {
      return false;
    });

    return new Promise(resolve => {
      const divEl = document.createElement('div');
      const video = document.createElement('video');
      const revokeEl = document.createElement('div');
      const videoShade = document.createElement('div');

      const clear = () => {
        removeGuard();
        tick = () => {};

        // 释放摄像头
        video.srcObject.getTracks().forEach(track => track.stop());

        document.body.removeChild(divEl);
      };

      video.style.margin = '0 auto';
      video.style.display = 'none';
      video.style.width = '250px';
      video.style.height = '250px';
      // video.poster = new URL('../../src/assets/image/check/icon-bg01.png', import.meta.url).href;

      revokeEl.innerText = '返回';
      revokeEl.style.position = 'absolute';
      revokeEl.style.bottom = '10%';
      revokeEl.style.left = '50%';
      revokeEl.style.transform = 'translateX(-50%)';
      revokeEl.style.color = '#24ADF3';
      revokeEl.style.padding = '10px';
      revokeEl.style.borderRadius = '50%';
      revokeEl.style.border = '1px solid #24ADF3';
      revokeEl.onclick = clear;

      divEl.style.position = 'fixed';
      divEl.style.top = '0';
      divEl.style.right = '0';
      divEl.style.bottom = '0';
      divEl.style.left = '0';
      divEl.style.paddingTop = '30%';
      divEl.style.backgroundColor = '#000d';

      videoShade.style.height = '250px';
      videoShade.style.width = '250px';
      videoShade.style.position = 'absolute';
      videoShade.style.top = '30vw';
      videoShade.style.left = '50%';
      videoShade.style.transform = 'translateX(-50%)';
      videoShade.style.background = `url(${
        new URL('../../src/assets/image/device/icon-scanner2.png', import.meta.url).href
      }) no-repeat center/104%`;

      document.body.appendChild(divEl);
      divEl.appendChild(video);
      divEl.appendChild(videoShade);
      divEl.appendChild(revokeEl);

      const canvasElement = document.createElement('canvas');
      const canvas = canvasElement.getContext('2d', { willReadFrequently: true });

      let tick = function () {
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvasElement.width = video.videoWidth;
          canvasElement.height = video.videoHeight;
          canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);

          const imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            resolve(code.data);
            clear();
            // 在此处处理 QR 码数据
            return;
          }
        }
        requestAnimationFrame(tick);
      };

      // 请求用户的摄像头权限
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: 'environment',
            width: 250,
            height: 250,
          },
        })
        .then(stream => {
          video.srcObject = stream;
          video.setAttribute('playsinline', true);
          video.play().then(() => {
            video.style.display = 'block';
          });
          requestAnimationFrame(tick);
        });
    });
  }
}
