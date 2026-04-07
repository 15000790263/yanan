import useUserStore from '../stores/user';

const userStore = useUserStore();
// 四个区的主管可以编辑调压箱(柜)，有设备管理角色也可以
const supervisorArr = ['l', 'x', 'k', 'sp', 'c'];

const deviceManage = 'sbadmin';

// 是否是主管/设备管理角色
export const canEditDevice = () => {
  const { posts, roles } = userStore;

  return !!posts.find(item => supervisorArr.includes(item)) || roles.includes(deviceManage);
};

export function isCharge() {
  const { posts } = userStore;

  return !!posts.find(item => supervisorArr.includes(item));
}
