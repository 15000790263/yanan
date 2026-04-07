import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

import App from './App.vue';
import router from './router';
import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';
import './style/index.less';

import 'leaflet/dist/leaflet.css';

// Toast
import 'vant/es/toast/style';

// Dialog
import 'vant/es/dialog/style';

// Notify
import 'vant/es/notify/style';

// ImagePreview
import 'vant/es/image-preview/style';

import 'vant/lib/index.css';

import 'overlayscrollbars/overlayscrollbars.css';

import 'v-calendar/style.css';

import { registerDirectives } from './directives';

const app = createApp(App);
const pinia = createPinia();
pinia.use(
  createPersistedState({
    auto: true,
  })
);

app.use(pinia);
app.use(router);
app.use(registerDirectives);

// 兼容android 11
String.prototype.replaceAll = function (search, replacement) {
  return this.replace(new RegExp(search, 'g'), replacement);
};

dayjs.locale('zh-cn');
app.mount('#app');
