export function useMyRouter(key, refValue) {
  const router = useRouter();

  let originalPush = router.push;

  // 猴补丁
  function enhanceRouter() {
    // 检查是否已经重写过 push 方法
    if (!router.__isPushOverwritten) {
      router.push = (...args) => {
        sessionStorage.setItem(key, refValue.value); // 执行一个函数
        return originalPush.apply(router, args); // 确保上下文是 router
      };

      // 标志位，防止多次重写
      router.__isPushOverwritten = true;
    }
  }

  enhanceRouter();

  onMounted(() => {
    const ac = sessionStorage.getItem(key);
    if (ac) {
      if (typeof refValue.value === 'number') {
        refValue.value = Number(ac);
      } else {
        refValue.value = ac;
      }
      sessionStorage.removeItem(key);
    }
  });

  onBeforeUnmount(() => {
    router.push = originalPush;
    router.__isPushOverwritten = void 0;
  });
}
