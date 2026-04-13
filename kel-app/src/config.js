/* eslint-disabled */
export default {
  ...config,
  url: import.meta.env.DEV ? config.devUrl : config.proUrl,
  // url: config.proUrl,
  // 请求超时时间
  timeout: 60000,
};
