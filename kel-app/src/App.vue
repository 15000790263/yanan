<template>
  <van-config-provider
    class="config-provider"
    :theme="themeStoreData.theme"
    :theme-vars="themeVars"
    :theme-vars-dark="themeVarsDark"
  >
    <RouterView />
  </van-config-provider>
</template>

<script setup lang="jsx">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import cssVars from '@/style/vant-css-vars';
import cssVarsDark from '@/style/vant-css-vars-dark';
import { themeStore } from '@/stores/theme';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog, showConfirmDialog, showNotify } from 'vant';
import { clearIsInspect, clearToken, getIsInspect } from './utils/session';
import service from './utils/service';
import config from './config';
import { systemStore } from '@/stores/system';
import { shouldRedirectToLogin } from './utils/shouldRedirectToLogin';
import { throttle } from 'lodash';

const useSystem = systemStore();

const themeStoreData = themeStore();

const themeVars = ref(cssVars);
const themeVarsDark = ref(cssVarsDark);

const route = useRoute();
const router = useRouter();

function onResume() {
  const is = shouldRedirectToLogin();
  if (is) {
    clearToken();
    router.replace('/');
  }
}

onMounted(() => {
  document.addEventListener('backbutton', backButton, false);

  // onDeviceReady();

  onResume();

  document.addEventListener('resume', onResume, false);

  // 添加网络监控
  addNetworkMonitor();
});

onBeforeUnmount(() => {
  document.removeEventListener('backbutton', backButton, false);

  document.removeEventListener('resume', onResume);
});

// 添加导航守卫
function backButton() {
  return false;
}

function addNetworkMonitor() {
  // 判断网速并显示提示
  function getNetworkSpeedHint() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const effectiveType = connection.effectiveType; // '2g', '3g', '4g'
      const { downlink, downlinkMax = 10 } = connection; // 下行带宽 (单位: Mbps)

      let speedHint = '';

      // 根据有效连接类型和带宽进行映射
      if (effectiveType === '2g') {
        speedHint = '当前网络速度非常慢，请检查网络连接。';
      } else if (effectiveType === '3g') {
        speedHint = '网络速度较慢，内容可能加载较慢。';
      } else if (effectiveType === '4g') {
        // speedHint = '';
        if (downlinkMax === 0 || downlink === 0) {
          speedHint = '网络已断开，请检查网络连接。';
        }
      } else {
        // 针对未知连接类型，结合下行带宽判断
        if (downlink < 1) {
          speedHint = '当前网络速度非常慢，请检查网络连接。';
        } else if (downlink >= 1 && downlink < 5) {
          speedHint = '网络速度较慢，内容可能加载较慢。';
        } else if (downlink >= 5) {
          // speedHint = '网络速度很好，体验流畅。';
        }
      }

      return speedHint;
    } else {
      return '';
    }
  }

  // 获取网速提示并显示
  const onIdle = throttle(idleCallbackDeadline => {
    // 在空闲时执行的操作
    if (idleCallbackDeadline.timeRemaining() > 0) {
      const speedHint = getNetworkSpeedHint(); // 假设你有一个获取网络速度提示的函数
      if (speedHint) {
        showNotify({ message: speedHint, zIndex: 9999999 }); // 假设你有一个显示通知的函数
      }
    }

    // 每次空闲时再次调用 requestIdleCallback
    requestIdleCallback(onIdle);
  }, 5000);

  // 启动第一次请求空闲回调
  requestIdleCallback(onIdle);
}

// function onDeviceReady() {
// processPipelineInspect();
// }

const delayTime = ref(4);

// function processPipelineInspect() {
//   const isInspect = getIsInspect();

//   if (isInspect) {
//     const timer = setInterval(() => {
//       delayTime.value--;

//       const el = document.getElementById('cancel-button-text-01');
//       el.textContent = `取消(${delayTime.value})`;

//       if (delayTime.value === 0) {
//         el.textContent = `取消`;
//         clearInterval(timer);
//       }
//     }, 1000);

//     showConfirmDialog({
//       title: '提示',
//       message: () => (
//         <div>
//           <div>检测到有未结束的管线巡检任务，是否继续执行上次巡检？</div>
//           <hr style="margin: 10px 0" />
//           <div>注意：点击取消，则会删除上次巡检记录！</div>
//         </div>
//       ),
//       cancelButtonText: h('div', { id: 'cancel-button-text-01' }, `取消(${delayTime.value})`),
//       beforeClose(action) {
//         if (action === 'confirm') {
//           return true;
//         }
//         return delayTime.value === 0;
//       },
//     }).then(
//       () => {
//         // on close
//         useSystem.changeSystem('inspect');
//         localStorage.setItem('recoveryFlag', '1');
//         router.push('/inspect/inspect-home');
//       },
//       () => {
//         // 先这样写
//         const id = isInspect;
//         if (id) {
//           const url = `${config.url}/safe/pipelinepatrol/${id}`;
//           service.delete(url);
//         }
//         clearIsInspect();
//       }
//     );
//   }
// }

// function backButton() {
//   if (!route.meta.isBack) {
//     // router.goBack();
//     // } else if (!!getIsInspect()) {
//     //   showDialog({
//     //     title: '提示',
//     //     message: '有正在进行的管线巡检任务，退出会导致数据丢失，请提交后再试！',
//     //   }).then(() => {
//     //     // on close
//     //   });
//   } else {
//     showToast('再划一次退出程序!');
//     document.removeEventListener('backbutton', backButton, false);
//     document.addEventListener('backbutton', exitApp, false);
//     setTimeout(() => {
//       document.removeEventListener('backbutton', exitApp, false);
//       document.addEventListener('backbutton', backButton, false);
//     }, 3000);
//   }
// }

// function exitApp() {
//   if (window.cordova) {
//     cordova.plugins.backgroundMode.disable();
//   }
//   navigator.app?.exitApp();
// }
</script>

<style scoped></style>
