import axios from 'axios';
import config from '../config.js';
import { clearToken, getToken } from './session';
import { showFailToast } from 'vant';
import router from '../router';
import { createLoading } from './loading-fn.js';

const service = axios.create({
  timeout: config.timeout,
});

// 添加请求拦截器
service.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    const url = config.url.split('/').pop();
    if (url !== 'code' && url !== 'login' && url !== 'smsLogin') {
      config.headers.Authorization = getToken() ? `Bearer ${getToken()}` : '';
    }

    // agent: new https.Agent({ rejectUnauthorized: false })
    // config.headers.common["username"] = getUserName();
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    const errorCode = {
      401: '认证失败，无法访问系统资源',
      403: '当前操作没有权限',
      404: '网络请求错误，未找到该资源!',
      default: '系统未知错误，请反馈给管理员',
    };
    // 未设置状态码则默认成功状态
    const code = response.data.code || 200;
    // 获取错误信息
    const msg = errorCode[code] || response.data.msg || errorCode['default'];
    if (code === 401) {
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。').then(null, () => {
        clearToken();
        router.replace('/');
      });
    } else if (code === 500) {
      // showFailToast(msg);
      // dialog.error({
      //   title: "错误",
      //   content: msg,
      //   positiveText: "确定",
      //   negativeText: "取消",
      // });
      return Promise.reject(new Error(msg));
    } else if (code === 601) {
      // showFailToast(msg);
      // dialog.warning({
      //   title: "警告",
      //   content: msg,
      //   positiveText: "确定",
      //   negativeText: "取消",
      // });
      return Promise.reject(new Error(msg));
    } else if (code === 403) {
      const d = createLoading('', { color: 'transparent' });
      showFailToast(msg);

      setTimeout(() => {
        router.replace('/index');
        d();
      }, 500);
    } else if (code !== 200) {
      showFailToast(msg);
      // dialog.warning({
      //   title: "错误",
      //   content: msg,
      //   positiveText: "确定",
      //   negativeText: "取消",
      // });
      return Promise.reject('error');
    } else {
      return Promise.resolve(response);
    }
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    let message = error.message;
    if (message === 'Network Error') {
      // message = '后端接口连接异常，请刷新页面重试!';
      message = '请检查网络连接';
    } else if (message.includes('timeout')) {
      // message = '系统接口请求超时，请刷新页面重试!';
      message = '请检查网络连接';
    } else if (message.includes('Request failed with status code')) {
      // message = '系统接口' + message.substr(message.length - 3) + '异常，请刷新页面重试!';
      message = '请检查网络连接';
    }
    showFailToast(message);
    // dialog.error({
    //   title: "错误",
    //   content: message,
    //   positiveText: "确定",
    //   negativeText: "取消",
    // });
    return Promise.reject(error);
  }
);

export default service;
