import { Loading } from 'vant';
import 'vant/es/loading/style';
import router from '../router';

export function createLoading(text = '', options = {}) {
  // 页面如果已经有loading，则不再创建新的loading
  const loading = document.querySelector('.van-loading');
  if (loading) {
    return () => {};
  }

  // 添加一块逻辑，页面loading时，不能点击系统返回按钮，路由返回
  // 但是如果是跳转到登录页面，则应该是登录信息过期，那么允许返回，并且立即清除当前loading
  const removeGuard = router.beforeEach((to, from) => {
    if (to.path === '/') {
      destroy();
      return true;
    }
    return false;
  });

  const { className = 'custom-loading-wrapper', color = '#1989fa', duration = 8000 } = options;

  const divEl = document.createElement('div');
  document.body.appendChild(divEl);

  divEl.classList.add(className);

  createApp({
    components: {
      Loading,
    },
    setup() {
      return () => {
        return h(
          Loading,
          {
            class: 'mid-loading',
            vertical: true,
            color,
            style: {
              background: '#fff4',
            },
          },
          text
        );
      };
    },
  }).mount(divEl);

  function destroy() {
    removeGuard();
    if (document.body.contains(divEl)) {
      document.body.removeChild(divEl);
    }
    clearTimeout(timer);
  }

  const timer = setTimeout(() => {
    destroy();
  }, duration);

  return destroy;
}
