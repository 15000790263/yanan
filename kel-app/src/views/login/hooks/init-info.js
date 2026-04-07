import { getUserInfo } from '../../../api/work';
// import { getUserPermissionsInfo, updateUser } from '../../../api/system';
import { setUserRole, clearUserRole, setUserInfo } from '@/utils/session';
import useUserStore from '../../../stores/user';
// import { addSignature } from '../../../utils/signature';
// import useInit from '../../home-page/hooks/use-init';
// import { useWorkStore } from '../../../stores/work/index';

const userStore = useUserStore();

// const workStore = useWorkStore();

export async function handleUserRole() {
  // 处理权限permissions信息
  processPer();

  // 处理一些字典数据
  // processDict();

  // 处理菜单信息
  await processMenu();

  const res = await getUserInfo();
  const info = res.data.data;
  setUserInfo(info);

  // 处理签名信息
  // processSignature(info);

  // 处理作业角色信息
  processWorkRole(info);
}

// 处理permissions信息
function processPer() {
  userStore.getInfo();
}
// 处理菜单信息
async function processMenu() {
  await userStore.getMenu();
}

// 添加电子签名
// function processSignature(info) {
//   if (info.signature) {
//     return;
//   }

//   addSignature();
// }

//
// function processDict() {
//   useInit();
// }

// 作业管理角色配置
function processWorkRole(info) {
  // workStore.initWorkUserRole();
  // // 一般用户信息
  // // 安全部 + 作业计划审核= 安全人员
  // // 作业计划审核 = 审核
  // // // 普通角色 +作业管理角色 = 领导
  // // 作业管理角色 = 领导
  // // 普通 = 一线
  // /* 新的角色划分 */
  // // 作业票审核 = permissions包含 flowable:task:todo:index 作业票审核权限字符
  // // 作业计划审核 = permissions包含 	electronic-operation-ticket:job-plan:plan-check:index 作业计划审核权限字符
  // // 安全人员 = permissions包含 	electronic-operation-ticket:job-plan:plan-check:index + deptId === 205
  // // 领导 = 作业管理角色
  // // 一线员工 = permissions包含 	electronic-operation-ticket:job-plan:year-plan:list
  // // 作业管理角色配置
  // // 暂时去掉安全人员
  // // if (
  // //   userStore.permissions.includes('electronic-operation-ticket:job-plan:plan-check:index') &&
  // //   info.deptId === 205
  // // ) {
  // //   // 安全人员
  // //   // setUserRole('2');
  // //   workStore.changeWorkUserRole('2');
  // // }
  // if (userStore.permissions.includes('electronic-operation-ticket:job-plan:plan-check:index')) {
  //   // 作业计划审核
  //   // setUserRole('1');
  //   workStore.changeWorkUserRole('1');
  // }
  // if (userStore.permissions.includes('flowable:task:todo:index')) {
  //   // 作业票审核
  //   // setUserRole('4');
  //   workStore.changeWorkUserRole('4');
  // }
  // if (
  //   info.roles.find(item => item.roleKey === 'workcommon')
  //   // &&
  //   // info.roles.find(item => item.roleKey === 'common')
  // ) {
  //   // 领导
  //   // setUserRole('3');
  //   workStore.changeWorkUserRole('3');
  // }
  // if (userStore.deptName === '工程部' || userStore.roles.includes('workexamine')) {
  //   // 工程部和监理部门
  //   // clearUserRole();
  //   workStore.changeWorkUserRole('5');
  // }
  // if (userStore.permissions.includes('electronic-operation-ticket:job-plan:year-plan:list')) {
  //   // 一线员工
  //   // clearUserRole();
  //   workStore.changeWorkUserRole('0');
  // }
}
