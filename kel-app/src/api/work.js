import service from '../utils/service';
import config from '../config';

import useUserStore from '../stores/user';

const userStore = useUserStore();

// 两种人员：1、工程部人员  2、监理人员，都可以查看

const isGCB = () => userStore.deptName === '工程部' || userStore.roles.includes('workexamine');

// 获取作业计划列表
export const getWorkList = query => {
  // 两种人员：1、工程部人员  2、监理人员，都可以查看

  if (isGCB()) {
    return service.get(`${config.url}/work/manage/manageList`, {
      params: query || { pageSize: 10000, pageNum: 1 },
    });
  }

  return service.get(`${config.url}/work/manage/list`, {
    params: query || { pageSize: 10000, pageNum: 1 },
  });
};

// 获取作业计划审核列表
export const getWorkApproveList = query =>
  service.get(`${config.url}/work/manage/reviewList`, {
    params: query || { pageSize: 10000, pageNum: 1 },
  });

// 获取作业计划地址列表
export const getSupplierWorkList = () => service.get(`${config.url}/work/supplier/list`);

// 通过id获取作业计划
export const getWorkById = id => service.get(`${config.url}/work/manage/${id}`);

// 根据作业计划获取作业票
export const getTicketById = id => {
  if (isGCB()) {
    return service.get(`${config.url}/work/management/manageList?planId=${id}`);
  }

  return service.get(`${config.url}/work/management/list?planId=${id}`);
};

// 获取作业票单位
export const getOperationCompany = () => service.get(`${config.url}/work/management/listdept`);

// 查询作业票环节
export const getTicketProcess = procInsId =>
  service.get(`${config.url}/work/process/list?procInsId=${procInsId}`);

// 通过环节id查询环节附件信息
export const getFileByProcessId = processId =>
  service.get(`${config.url}/work/step/list?processId=${processId}`);

// 新增环节
export const addSteps = (data, files) => {
  const contentParam = encodeURI(JSON.stringify(data));
  const formData = new FormData();
  files.forEach(item => formData.append('files', item.file));

  return service.post(`${config.url}/work/step?contentParam=${contentParam}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 删除环节
export const deleteSteps = ids => service.delete(`${config.url}/work/step/${ids.toString()}`);

// 编辑环节
export const updateSteps = data => service.put(`${config.url}/work/step`, data);

// 根据id获取环节
export const getStepsById = id => service.get(`${config.url}/work/step/${id}`);

// 查询用户信息
export const getUserInfo = () => service.get(`${config.url}/system/user/profile`);

// 审批通过作业票启动过程1
export const startProcess = data => service.post(`${config.url}/work/process`, data);

// 审批通过作业票启动过程2：更改作业票过程状态
export const changeProcessStatus = data => service.put(`${config.url}/work/management`, data);

// 获取作业票详情
export const getTicketDetailById = id => service.get(`${config.url}/work/management/${id}`);

// 审批通过作业票过程归档
export const fileProcess = data =>
  service.post(`${config.url}/work/process/updateFileStatus`, data);

// 审批通过作业票过程归档
export const updateProcess = data => service.put(`${config.url}/work/process`, data);

// 查询流转记录
export const getRecoredByProcInsId = id =>
  service.get(`${config.url}/flowableplus/task/flowRecord?procInsId=${id}`);

// 查询流转图
export const getFlowXML = (procInsId, deployId) =>
  service.get(
    `${config.url}/flowableplus/task/flowXmlAndNode?procInsId=${procInsId}&deployId=${deployId}`
  );

// 根据用户id查询用户
export const getUserById = id => service.get(`${config.url}/system/user/list?userId=${id}`);

// 查询高危作业类型
export const getWorkType = () =>
  service.get(`${config.url}/flowableplus/definition/list?pageSize=1000&pageNum=1`);

export const workPlanFinishRequest = data => service.post(`${config.url}/work/manage/status`, data);

// 获取全部部门信息
export const getAllDeptList = () => service.get(`${config.url}/work/management/listAllDept`);

// 根据部门id查询用户
export const getUserByDeptId = id =>
  service.get(`${config.url}/system/user/list?pageSize=1000&deptId=${id}`);

// 根据承包方id查询用户
export const getUserByEnterId = () => service.get(`${config.url}/work/employees/list`);

// 新增作业计划
export const addPlan = data => service.post(`${config.url}/work/manage`, data);

// 更新作业计划
export const updatePlan = data => service.put(`${config.url}/work/manage`, data);

// 删除作业计划
export const deletePlan = ids => service.delete(`${config.url}/work/manage/${ids}`);

// 强大的根据id查用户
export const getUserinfoById = id =>
  service.get(`${config.url}/system/user/selectUserById?userId=${id}`);

// 查询用户职务
export const getPostById = id => service.get(`${config.url}/system/post/${id}`);

// 流程图（根据角色查询用户）
export const getUserByRoleId = id =>
  service.get(`${config.url}/system/user/selectUserListOfRoleId?roleId=${id}`);

// 查询作业片区
export const getWorkArea = () =>
  service.get(`${config.url}/system/dict/data/list?pageNum=1&pageSize=10&dictType=work_area`);

// 查询作业对象类型
export const getWorkObjectType = () =>
  service.get(`${config.url}/system/dict/data/list?pageNum=1&pageSize=10&dictType=object_type`);

// 查询作业区下的作业票数量
export const getWorkCount = params =>
  service.get(`${config.url}/work/static/bigScreen`, {
    params,
  });

// 查询全部审批通过的作业票
export const getAllApprovedTicket = () =>
  service.get(`${config.url}/work/management/list?status=1&pageNum=1&pageSize=9999`);

// 通过id获取部门
export const getDeptById = id => service.get(`${config.url}/system/dept/${id}`);

// 通过id获取部门
export const getLocation = () => service.get(`${config.url}/work/manage/plan/location`);

// 获取流程变量
export const getProcessVariables = taskId =>
  service.get(`${config.url}/flowableplus/task/processVariables/${taskId}`);

// 通过流程实例id获取报表数据
export const getPostByTaskId = taskId =>
  service.get(`${config.url}/work/management/task/${taskId}`);

// 作业票添加表单
export const flowFormData = deployId =>
  service.get(`${config.url}/flowableplus/task/flowFormData?deployId=${deployId}`);

// 下一节点
export const getNextFlowNodeByStart = data => {
  return service.post(`${config.url}/flowableplus/task/nextFlowNodeByStart`, data);
};

// 部署流程实例
export const definitionStart = (procDefId, data) => {
  return service.post(`${config.url}/flowableplus/definition/start/${procDefId}`, data);
};

// 新增操作票
export function addPost(data) {
  return service.post(`${config.url}/work/management`, data);
}

// 可退回任务列表
export function returnList(data) {
  return service.post(`${config.url}/flowableplus/task/returnList`, data);
}

// 下一节点
export function getNextFlowNode(data) {
  return service.post(`${config.url}/flowableplus/task/nextFlowNode`, data);
}

// 查询作业代办
export function worktodoList(query) {
  return service.get(`${config.url}/flowableplus/task/work/todoList`, { params: query });
}

// 完成任务
export function complete(data) {
  return service.post(`${config.url}/flowableplus/task/complete`, data);
}

// 修改操作票
export function updateForm(data) {
  return service.put(`${config.url}/work/management`, data);
}

// 任务流转记录
export function flowRecord(query) {
  return service.get(`${config.url}/flowableplus/task/flowRecord`, { params: query });
}

// 流程节点表单
export function flowTaskForm(query) {
  return service.get(`${config.url}/flowableplus/task/flowTaskForm`, { params: query });
}

// 退回任务
export function returnTask(data) {
  return service.post(`${config.url}/flowableplus/task/return`, data);
}

// 查询用户详细
export function getUser(userId) {
  return service.get(`${config.url}/system/user/${userId}`);
}

// 根据姓名查询用户详细
export function getUserByname(query) {
  return service.get(`${config.url}/system/user/list`, { params: query });
}

// 修改用户
export function updateUser(data) {
  return service.put(`${config.url}/system/user`, data);
}

//作业票审核发送短信
export function sendShortMessage(phone) {
  console.log(phone);
  let obj = {
    mobiles: phone,
    params: [],
    serviceCode: '93db446aa46b4615a38072475f26cd9f',
    templateId: '3649e50d9875409bb69b4d4f21108b27',
  };
  return service.post(`${config.url}/sms/sms/send`, obj);
}

export function passWorkPlanAll(data) {
  return service.post(`${config.url}/work/manage/batchReview`, data);
}

// 作业票历史审批
export function grtHisList() {
  return service.get(`${config.url}work/management/hisList`);
}

// 查询施工人员信息
export const getThirdUser = name => service.get(`${config.url}/work/employees/list?name=${name}`);

// 查询管理人员作业票
export function getTicketsManage(query) {
  return service.get(`${config.url}work/management/manageList`, {
    params: query,
  });
}

// 查询管理人员作业票统计
export function getTicketsManageStatistic() {
  return service.get(`${config.url}work/management/listStat`);
}

export function organizationList(query) {
  return service.get(`${config.url}work/management/listdept`, {
    params: query,
  });
}

export function listPost2(query) {
  return service.get(`${config.url}work/employees/list`, {
    params: query,
  });
}

export function updateEmployee(data) {
  return service.put(`${config.url}work/employees`, data);
}
