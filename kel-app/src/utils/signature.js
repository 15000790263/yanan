import { showConfirmDialog } from 'vant';
import router from '../router/index';

export function addSignature() {
  showConfirmDialog({
    title: '提示',
    message: '您未添加电子签名，是否现在添加？',
    className: 'update-app-dialog',
  })
    .then(async () => {
      router.push('/signature');
    })
    .catch(() => {
      // on cancel
    });
}
