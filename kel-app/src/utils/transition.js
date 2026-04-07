import { closeToast } from 'vant';

const transitionName = ref('');
export function useTransition() {
  const router = useRouter();

  // 添加返回方法，实现跳转动画
  router.goBack = function (step = -1) {
    this.isBack = true;
    this.go(step);
    setTimeout(() => {
      this.isBack = false;
    }, 300);
  };
  router.isBack = false;

  onBeforeRouteUpdate((to, from) => {
    if (
      // tabbar互相切换没动画
      from.meta.source === 'tabbar' &&
      to.meta.source === 'tabbar'
    ) {
      transitionName.value = '';
      return;
    }
    // 如果isBack为true时，证明是用户点击了回退，执行slide-right动画
    let isBack = router.isBack;
    if (isBack) {
      transitionName.value = 'slide-right';
    } else {
      transitionName.value = 'slide-left';
    }
  });

  return transitionName;
}
