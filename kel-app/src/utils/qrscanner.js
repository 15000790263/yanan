import { Html5QrcodeScanner } from 'html5-qrcode';
import { getPermissions } from './cordova-tools';
import router from '../router';

export async function qrScanner() {
  // const res = await getPermissions('CAMERA');
  const res = true;
  if (res) {
    const removeGuard = router.beforeEach((to, from) => {
      return false;
    });
    return new Promise(resolve => {
      const divEl = document.createElement('div');
      const container = document.createElement('div');
      const revokeEl = document.createElement('div');

      const clear = () => {
        removeGuard();
        html5QrcodeScanner.clear();
        nextTick(() => {
          document.body.removeChild(divEl);
        });
      };

      revokeEl.innerText = '返回';
      revokeEl.style.position = 'absolute';
      revokeEl.style.bottom = '10%';
      revokeEl.style.left = '50%';
      revokeEl.style.transform = 'translateX(-50%)';
      revokeEl.style.color = '#ddd';
      revokeEl.style.padding = '10px';
      revokeEl.style.borderRadius = '50%';
      revokeEl.style.border = '1px solid #ddd';
      revokeEl.onclick = clear;

      container.id = 'reader';

      divEl.style.position = 'fixed';
      divEl.style.top = '0';
      divEl.style.right = '0';
      divEl.style.bottom = '0';
      divEl.style.left = '0';
      divEl.style.paddingTop = '30%';
      divEl.style.backgroundColor = '#0006';

      document.body.appendChild(divEl);
      divEl.appendChild(container);
      divEl.appendChild(revokeEl);

      const html5QrcodeScanner = new Html5QrcodeScanner(
        'reader',
        { fps: 15, qrbox: { width: 250, height: 250 } },
        true
      );

      nextTick(() => {
        document.getElementById('reader__dashboard').style.display = 'none';
      });

      html5QrcodeScanner.render(
        decodedText => {
          resolve(decodedText);
          clear();
        },
        err => {
          console.log(err);
        }
      );
    });
  }
}
