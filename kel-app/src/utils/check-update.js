import { showConfirmDialog, showDialog, closeDialog } from 'vant';
import 'vant/es/slider/style';
import '../style/update-app-bar.css';

import config from '../config';
import { h } from 'vue';
import { saveFile } from './cordova-tools2';
import axios from 'axios';
import { clearToken } from './session';

export async function checkUpdate() {
  const url = `${config.updateFileUrl}/app/appInfo.json`;
  const res = await fetch(url, {
    cache: 'no-store',
  });
  const info = await res.json();
  const vNum = Number(info.version.split('.').join(''));

  // eslint-disable-next-line no-undef
  cordova.getAppVersion(v => {
    const current = Number(v.split('.').join(''));
    if (current < vNum) {
      showConfirmDialog({
        title: '提示',
        message: info.content
          ? h('div', {}, [
              h('div', {}, '新版本App已发布，是否现在升级？'),
              h('hr'),
              h('div', { style: { fontSize: '14px' } }, `说明：${info.content}`),
            ])
          : '新版本App已发布，是否现在升级？',
        className: 'update-app-dialog',
        showCancelButton: true,
        closeOnPopstate: false,
      })
        .then(() => {
          // window.open(`${config.fileUrl}/statics/库尔勒智慧燃气.apk`, '_system');
          // 下载文件
          downloadFile();
        })
        .catch(() => {
          // on cancel
        });
    }
  });
}

export async function downloadFile() {
  const fileUrl = `${config.updateFileUrl}/app/延长石油.apk`; // 替换为你的文件URL
  // const fileUrl = 'http://localhost:5173//statics/库尔勒智慧燃气.apk'; // 替换为你的文件URL

  showDialog({
    title: '下载中..',
    message: h(
      'div',
      { style: { margin: '10px 20px', border: '1px solid #A7E591', '--s-a': '0' } },
      [
        h(
          'div',
          {
            class: 'inner-bar',
            style: {
              backgroundColor: '#06B025',
              height: '12px',
              width: 'var(--s-a)',
            },
          },
          h('div', {
            class: 'inner-bar-child-move',
          })
        ),
      ]
    ),
    className: 'update-app-dialog',
    showConfirmButton: false,
  });

  await nextTick();

  const innerBar = document.querySelector('.inner-bar');

  const res = await axios({
    method: 'get',
    url: fileUrl,
    responseType: 'blob',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    onDownloadProgress(progressEvent) {
      // console.log(progressEvent);
      const total = progressEvent.total;
      const loaded = progressEvent.loaded;
      const percent = Math.floor((loaded / total) * 100);
      innerBar.style.setProperty('--s-a', percent + '%');
    },
  });

  const res2 = await saveFile(res.data, '延长石油.apk');
  closeDialog();

  if (res2) {
    open(res2);
    // 更新时退出登录
    //  navigator.app?.exitApp();
    clearToken();
  }
}

function open(path) {
  cordova.plugins.fileOpener2.open(path, 'application/vnd.android.package-archive', {
    error: function (e) {
      console.error('Error opening file: ' + e.message);
    },
    success: function () {
      console.log('File opened successfully');
    },
  });
}
