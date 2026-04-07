<template>
  <div class="home-index">
    <div class="menu-wrapper">
      <template v-for="item in menuList">
        <div
          :key="item.id"
          v-if="menus.includes(item.key)"
          class="menu-item"
          @click="pageToSystem(item.id)"
          v-html="item.text"
        ></div>
      </template>
    </div>

    <div v-if="menus.includes('device')" class="scan-qr" @click="handleScan">扫描设备二维码</div>

    <div class="footer">
      <div
        v-if="userStore.signature && menus.includes('system')"
        class="signature"
        @click="changeSignature"
      >
        <van-icon name="manager-o" size="24" />
        <div>修改签名</div>
      </div>
      <div class="logout" @click="logout">
        <van-icon name="revoke" size="24" />
        <div>退出登录</div>
      </div>
    </div>

    <div class="update-app" v-long-press="{ action: updateApp, option: { time: 2000 } }">
      <div>APP版本：v{{ appVersion }}</div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { systemStore } from '@/stores/system';
import { getUserRole } from '@/utils/session';
import { clearToken, getIsInspect } from '../../utils/session';
import { showConfirmDialog, showDialog } from 'vant';
import { checkUpdate, downloadFile } from '../../utils/check-update';
import useInit from './hooks/use-init';
import useUserStore from '../../stores/user';
import { useMethod } from './hooks/use-method';
import { setKeepAlive } from '../../utils/cordova-tools2';
import { useWorkStore } from '../../stores/work/index';
import { getAlarmCount } from '../../api/alarm';
import { useMainDataStore } from '../../stores/inspect/main-data';

const useMainData = useMainDataStore();

const workStore = useWorkStore();

const { handleScan } = useMethod();

const router = useRouter();

const useSystem = systemStore();

// 跨模块跳转需要注意该配置
function pageToSystem(type) {
  useSystem.changeSystem(type);
  switch (type) {
    case 'emergency':
      router.push('/emergency/fact');
      break;
    case 'work':
      handleWorkRouter();
      break;
    case 'device':
      processUserData();
      router.push('/device/device-info');
      break;
    case 'inspect':
      processUserData();
      router.push('/inspect/inspect-home');
      break;
    case 'duty':
      router.push('/duty/duty-management');
      break;
    case 'production':
      router.push('/production/production-management');
      break;
    case 'cockpit':
      router.push('/cockpit/cockpit-management');
      break;
    case 'myloc':
      router.push('/inspect/inspect-trail?loc=true');
      break;
    case 'system':
      router.push('/system/system-management');
      break;
    case 'tips':
      router.push('/alarm/alarm-management');
      break;
    default:
      break;
  }
}

function processUserData() {
  useMainData.getAllData();
}

function handleWorkRouter() {
  if (!workStore.workUserRole.length) {
    return;
  }

  if (workStore.workUserRole.length === 1) {
    switch (workStore.workUserRole[0]) {
      case '1':
        router.push('/work/work-plan-approve');
        break;
      case '2':
        router.push('/work/work-plan-secure');
        break;
      case '3':
        router.push('/work/work-statistics');
        break;
      case '4':
        router.push('/work/work-ticket-approve');
        break;
      case '5':
        router.push('/work/work-ticket-manage');
        break;
      default:
        router.push('/work/work-plan');
        break;
    }
  } else {
    router.push('/work/work-menu');
  }
}

function logout() {
  if (!!getIsInspect()) {
    showDialog({
      title: '提示',
      message: '有正在进行的管线巡检任务，退出会导致数据丢失，请提交后再试！',
    }).then(() => {
      // on close
    });

    return;
  }

  showConfirmDialog({
    title: '温馨提示',
    message: '您确定要退出登录吗？',
    className: 'update-app-dialog',
  }).then(() => {
    clearToken();
    router.replace('/');
  });
}

function test() {
  window.open(new URL('/test.html', import.meta.url).href, '_blank');
}

onMounted(() => {
  checkUpdate();
  // 这个暂时不要，统一在登陆后初始化
  // useInit();

  // 检查

  document.addEventListener('deviceready', onDeviceReady, false);

  // 报警提示添加徽标
  getAlarmCount().then(res => {
    const count = res.data.data.reduce((pre, cur) => pre + cur.count, 0);
    alarmTitle.value = `报警提示<div style='position: absolute; top: calc(70% - 14px); right: 10px; width: 18px; height: 18px; background: #f00;border-radius: 50%; display:grid;place-items: center;border: 1px solid #fff;font-size: 12px'>${count}</div>`;
  });
});

const appVersion = ref('你猜猜');

function getAppVersion() {
  if (window.cordova) {
    window.cordova.getAppVersion().then(res => {
      appVersion.value = res;
    });
  }
}

function onDeviceReady() {
  getAppVersion();

  // if (window.cordova) {
  // const isEnable = cordova.plugins.backgroundMode.isEnabled();
  // if (!isEnable) {
  //   setKeepAlive();
  // }
  // }

  // 设置屏幕方向
  screen.orientation.lock('portrait');
}

onBeforeUnmount(() => {
  document.removeEventListener('deviceready', onDeviceReady);
});

function updateApp() {
  showConfirmDialog({
    title: '更新提示',
    message:
      '当前版本App发现新的内容变更，是否立即下载？\n注意：更新前请先完成正在执行的任务，并保存数据，更新后需要重新登录',
  }).then(() => {
    // on close
    downloadFile();
  });
}

const alarmTitle = ref('报警提示');

const menuList = computed(() => [
  {
    id: 'duty',
    key: 'scheduling',
    text: '值班管理',
  },
  {
    id: 'inspect',
    key: 'safe',
    text: '巡检管理',
  },
  {
    id: 'work',
    key: 'work',
    text: '作业管理',
  },
  {
    id: 'device',
    key: 'device',
    text: '设备管理',
  },
  {
    id: 'emergency',
    key: 'emergency',
    text: '应急管理',
  },
  {
    id: 'production',
    key: 'production',
    text: '生产管理',
  },
  {
    id: 'cockpit',
    key: 'cockpit',
    text: '管理驾驶舱',
  },
  {
    id: 'myloc',
    key: 'kelpipegis',
    text: '智慧管网',
  },
  {
    id: 'tips',
    key: 'emergency',
    text: alarmTitle.value,
  },
  {
    id: 'system',
    key: 'system',
    text: '个人中心',
  },
]);

const menus = ref([]);

const userStore = useUserStore();

watch(
  () => userStore.menu,
  value => {
    menus.value = value;
  },
  {
    immediate: true,
  }
);

function changeSignature() {
  useSystem.changeSystem('signature');
  router.push('/signature');
}
</script>

<style scoped lang="less">
.home-index {
  height: 100%;
  width: 100%;
  background: url('/src/assets/image/login/bg.png') no-repeat center/100vw 100vh;
  display: grid;
  grid-template-rows: auto repeat(3, max-content);
  justify-content: center;
  // padding: 6vh 12vw 40vh;
  gap: 1vh;
  padding: 4vh 1vh;
  place-items: center;
  font-size: 13px;

  .menu-wrapper {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2vh;
    grid-auto-rows: min-content;

    .menu-item {
      text-align: center;
      color: #fff;
      height: 26vw;
      width: 26vw;
      background:
        url('/src/assets/image/login/button-component-bg.png') no-repeat center/100% 100%,
        url('/src/assets/image/login/icon-1.png') no-repeat center 15px/50%;
      padding-top: 70%;
      border-radius: 8px;
      overflow: hidden;

      position: relative;
    }
  }

  .scan-qr {
    color: #fff;
    height: 6vh;
    width: 50vw;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    background:
      url('/src/assets/image/login/button-component-bg.png') no-repeat center/100% 100%,
      url('/src/assets/image/check/icon_qr.png') no-repeat 5vw/ 22px;

    padding-left: 15px;
    justify-self: center;
    border-radius: 8px;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    width: 50vw;

    .logout,
    .signature {
      border-radius: 8px;
      color: #fff;
      width: 90px;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      align-items: center;
      background: url('/src/assets/image/login/button-component-bg.png') no-repeat center/100% 100%;
      padding: 10px;
      margin: 0 auto;
    }
  }

  .update-app {
    color: #fffd;
    font-weight: 600;
    text-decoration: underline;
    user-select: none;
    line-height: 30px;
    height: 30px;
  }
}
</style>
