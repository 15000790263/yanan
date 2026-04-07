<template>
  <div class="wrapper">
    <div v-html="ifrSource" class="ifr-wrapper"></div>

    <div class="big" @click="zoom('+')">
      <van-icon size="2rem" name="plus" />
    </div>
    <div class="small" @click="zoom('-')">
      <van-icon size="2rem" name="minus" />
    </div>

    <div class="footer">
      <div class="confirm" @click="onConfirm">提交</div>
      <div class="cancel" @click="onCancel">取消</div>
    </div>
  </div>
</template>

<script setup>
import { showConfirmDialog, showToast } from 'vant';
import {
  getWorkById,
  flowFormData,
  getNextFlowNodeByStart,
  definitionStart,
  addPost,
  getUser,
  getUserByname,
  updateUser,
  sendShortMessage,
  organizationList,
  listPost2,
} from '@/api/work';
import { useRoute } from 'vue-router';
import config from '@/config';
import useUserStore from '@/stores/user';

const userStore = useUserStore();

let aa;

const ifrSource = ref('');
let ifr = null;
let scale = 0;

const route = useRoute();
const router = useRouter();

const props = defineProps(['innerWidth']);

const deployId = route.query.deployId;
const procDefId = route.query.procDefId;

const proxy = getCurrentInstance();

const formJson = ref();

// 初始化表单
getFlowFormData();

/** 流程表单数据 */
async function getFlowFormData() {
  const res = await flowFormData(deployId);
  // 流程过程中不存在初始化表单 直接读取的流程变量中存储的表单值
  const formContentObj = res.data.data;
  const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');

  ifrSource.value = atob(htmlobj.options.htmlContent).replace('/webroot/decision', config.frUrl);

  formJson.value = res.data.data;

  await nextTick();
  ifr = document.getElementById('iframeA');

  ifr.onload = () => {
    nextTick(() => {
      scale = window.innerWidth / ifr.width;
      ifr.style.transform = `scale(${scale})`;
    });

    setTimeout(() => {
      getFrData();
    }, 1000);
  };
}

onMounted(() => {
  window.addEventListener(
    'message',
    // 接收从报表发过来的数据
    (aa = e => {
      console.log('e=', e.data);
      if (e.data?.U5) {
        submitForm1(e.data);
      }
      // }
      // cb.call(win, e.data)
    }),
    false
  );
});

const companyArr = ref([]);

getCompanyArr();
function getCompanyArr() {
  organizationList().then(res => {
    companyArr.value = res.data.data;
  });
}

function getCompanyName(id) {
  return (
    companyArr.value.find(item => {
      return item.dept_id == id;
    })?.dept_name || ''
  );
}

onUnmounted(() => {
  window.removeEventListener('message', aa, false);
});

function onCancel() {
  showConfirmDialog({
    title: '提示',
    message: '数据未保存，确认取消吗？',
  })
    .then(() => {
      router.goBack();
    })
    .catch(() => {
      // on cancel
    });
}

/** 申请流程表单数据提交 */
const submitForm1 = params => {
  // 根据当前任务或者流程设计配置的下一步节点 todo 暂时未涉及到考虑网关、表达式和多节点情况
  getNextFlowNodeByStart({
    deploymentId: deployId,
    variables: {},
  }).then(res => {
    const data = res.data.data;
    // return;
    if (data) {
      if (data.dataType === 'dynamic') {
        if (data.type === 'assignee') {
          // 指定人员
          checkSendUser.value = true;
          checkType.value = 'single';
        } else if (data.type === 'candidateUsers') {
          // 候选人员(多个)
          checkSendUser.value = true;
          checkType.value = 'multiple';
        } else if (data.type === 'candidateGroups') {
          // 指定组(所属角色接收任务)
          checkSendRole.value = true;
        } else {
          // 会签
          // 流程设计指定的 elementVariable 作为会签人员列表
          multiInstanceVars.value = data.vars;
          checkSendUser.value = true;
          checkType.value = 'multiple';
        }
        taskOpen.value = true;
        taskTitle.value = '选择任务接收';
      } else {
        if (procDefId) {
          const formContentObj = JSON.parse(JSON.stringify(formJson.value));

          let param = {
            formJson: formContentObj,
          };

          // 复制对象的属性值给新的对象
          // 启动流程并将表单数据加入流程变量
          definitionStart(procDefId, param).then(async res => {
            // 保存操作票信息
            await addOperationTicket(params, res.data);
            showToast('操作成功');
            setTimeout(() => {
              router.goBack();
            }, 800);
          });
        }
      }
    }
  });
};

function getUserQuanxian(userId, roleId) {
  if (!userId) {
    return '';
  }
  getUser(userId).then(res => {
    if (res.data.roleIds.indexOf(roleId) == -1) {
      res.data.roleIds.push(roleId);
    }
    let obj = {
      ...res.data.data,
      roleIds: res.data.roleIds,
      postIds: res.data.postIds,
      posts: res.data.posts,
      roles: res.data.roles,
    };
    updateUser(obj);
  });
}

function getUserObjDetail(name, roleId) {
  if (!name) {
    return '';
  }
  let param = {
    nickName: name,
  };
  return getUserByname(param).then(res => {
    if (res.data.rows.length) {
      getUserQuanxian(res.data.rows[0].userId, roleId);
      sendShortMessage(res.data.rows[0].phonenumber);
    }
  });
}

// 保存操作票信息
async function addOperationTicket(params, res) {
  const operationAllContent = JSON.stringify(params);
  let data = {};
  if (route.query.workOperationType == '动火安全作业') {
    getUserObjDetail(params['E43'], 117);
    let operationPersonValue = '';
    if (params['E10'] && Array.isArray(params['E10'])) {
      operationPersonValue = params['E10'].toString();
    } else if (params['E10']) {
      operationPersonValue = params['E10'];
    }
    console.log(params['E9']);
    let operationCompanyValue = '';
    if (params['E9'] && typeof params['E9'] == 'string') {
      operationCompanyValue = params['E9'];
    } else {
      await companyArr.value.forEach(item => {
        console.log(item, params['E9']);
        if (item.dept_id == params['E9']) {
          operationCompanyValue = item.dept_name;
        }
      });
    }

    data = {
      // 作业单位
      operationCompany: operationCompanyValue,
      // 操作人
      operationPerson: operationPersonValue,
      // 操作内容
      operationContent: params['E7'],
      // 操作时间
      operationTime: params['G23'],
      operationEndTime: params['Q23'],
      // 作业关联编号
      refSerial: '动火作业安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: params['E8'],
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '吊装安全作业') {
    getUserObjDetail(params['E44'], 128);
    data = {
      // 作业单位
      operationCompany: params['L6'],
      // 操作人
      operationPerson: params['D8'] ? params['D8'].toString() : '',
      // 操作内容
      operationContent: params['V7'],
      // 操作时间
      operationTime: params['G18'],
      operationEndTime: params['Q18'],
      // 作业关联编号
      refSerial: '吊装安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: params['V9'],
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '挖掘动土安全作业') {
    getUserObjDetail(params['E44'], 118);
    data = {
      // 作业单位
      operationCompany: params['E8'],
      // 操作人
      operationPerson: '',
      // 操作内容
      operationContent: params['R19'],
      // 操作时间
      operationTime: params['G27'],
      operationEndTime: params['Q27'],
      // 作业关联编号
      refSerial: '动土安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: '3',
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '盲板抽堵安全作业') {
    getUserObjDetail(params['E44'], 118);
    data = {
      // 作业单位
      operationCompany: params['L6'],
      // 操作人
      operationPerson: params['L18'],
      // 操作内容
      operationContent: '',
      // 操作时间
      operationTime: params['S8'],
      operationEndTime: '',
      // 作业关联编号
      refSerial: '盲板抽堵安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: '3',
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '临时用电安全作业') {
    getUserObjDetail(params['E46'], 118);
    data = {
      // 作业单位
      operationCompany: params['E6'],
      // 操作人
      operationPerson: params['E11'] ? params['E11'].toString() : '',
      // 操作内容
      operationContent: params['R7'],
      // 操作时间
      operationTime: params['G28'],
      operationEndTime: params['Q28'],
      // 作业关联编号
      refSerial: '临时用电安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: '3',
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '有限空间安全作业') {
    getUserObjDetail(params['E44'], 118);
    data = {
      // 作业单位
      operationCompany: params['E10'],
      // 操作人
      operationPerson: params['E11'] ? params['E11'].toString() : '',
      // 操作内容
      operationContent: params['E8'],
      // 操作时间
      operationTime: params['G24'],
      operationEndTime: params['Q24'],
      // 作业关联编号
      refSerial: '有限空间作业安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: '3',
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '断路安全作业') {
    getUserObjDetail(params['E33'], 118);
    data = {
      // 作业单位
      operationCompany: params['L6'],
      // 操作人
      operationPerson: '',
      // 操作内容
      operationContent: '断路作业',
      // 操作时间
      operationTime: params['G22'],
      operationEndTime: params['Q22'],
      // 作业关联编号
      refSerial: '断路安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: '3',
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  } else if (route.query.workOperationType == '高处安全作业') {
    getUserObjDetail(params['E44'], 118);
    data = {
      // 作业单位
      operationCompany: params['E10'],
      // 操作人
      operationPerson: params['E11'] ? params['E11'].toString() : '',
      // 操作内容
      operationContent: params['R7'],
      // 操作时间
      operationTime: params['G25'],
      operationEndTime: params['Q25'],
      // 作业关联编号
      refSerial: '高处安全作业票-' + params['U5'],
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: params['R8'],
      remark: '',
      taskId: res ? res.data.taskId : '',
      procInsId: res ? res.data.procInsId : '',
      deployId: res ? res.data.deployId : '',
      executionId: res ? res.data.executionId : '',
      userId: userStore.userId,
      //操作票类型
      workOperationType: route.query.workOperationType,
      planId: route.query.planId,
      projectName: route.query.projectName,
      workArea: route.query.workArea,
    };
  }

  data.status = null;

  await addPost(data);
  window.sendMessage = null;
}

function onConfirm() {
  showConfirmDialog({
    title: '提示',
    message: '确定提交吗？',
  })
    .then(() => {
      // on confirm
      const ifrW = ifr.contentWindow;
      ifrW.postMessage({ type: 'submit' }, '*');
    })
    .catch(() => {
      // on cancel
    });
}

// 放大缩小
function zoom(type) {
  if (type === '+') {
    scale += 0.4;
  } else {
    scale -= 0.4;
  }
  ifr.style.transform = `scale(${scale})`;
}

// 获取报表数据
function getFrData() {
  let workOperationType = route.query.workOperationType;
  let data = {};
  getWorkById(route.query.planId).then(async res => {
    let data2 = res.data.data;
    if (workOperationType == '动火安全作业') {
      data['E6'] = data2.deptId;
      data['E7'] = data2.content;
      data['R7'] = data2.projectLocation;
      data['R9'] = data2.firstName;
      data['E9'] = data2.company;
      data['E10'] = data2.secondName;
      data['N10'] = await listPost2({ name: data2.secondName }).then(res => {
        return res.data.rows[0].operationNum;
      });

      data['X25'] = data2.firstName;
      data['X26'] = data2.firstName;
      data['X27'] = data2.firstName;
      data['X28'] = data2.firstName;
      data['X29'] = data2.firstName;
      data['X30'] = data2.firstName;
      data['X31'] = data2.firstName;
      data['X32'] = data2.firstName;
      data['X33'] = data2.firstName;
      data['X34'] = data2.firstName;
      data['X35'] = data2.firstName;
      data['X36'] = data2.firstName;
      data['X37'] = data2.firstName;
      data['X38'] = data2.firstName;
    } else if (workOperationType == '吊装安全作业') {
      data['D6'] = data2.deptId;
      data['L6'] = data2.company;
      data['D7'] = data2.projectLocation;
      data['V7'] = data2.content;
    } else if (workOperationType == '挖掘动土安全作业') {
      data['E6'] = data2.deptId;
      data['E8'] = data2.company;
      data['E19'] = data2.projectLocation;
      data['R19'] = data2.content;
      data['U8'] = data2.firstName;
      data['X29'] = data2.firstName;
      data['X30'] = data2.firstName;
      data['X31'] = data2.firstName;
      data['X32'] = data2.firstName;
      data['X33'] = data2.firstName;
      data['X34'] = data2.firstName;
      data['X35'] = data2.firstName;
      data['X36'] = data2.firstName;
      data['X37'] = data2.firstName;
      data['X38'] = data2.firstName;
      data['X39'] = data2.firstName;
    } else if (workOperationType == '盲板抽堵安全作业') {
      data['D6'] = data2.deptId;
      data['L6'] = data2.company;
      data['U18'] = data2.firstName;
      data['D18'] = data2.firstName;
      data['L18'] = data2.secondName;
    } else if (workOperationType == '临时用电安全作业') {
      data['E6'] = data2.company;
      data['E7'] = data2.projectLocation;
      data['R7'] = data2.content;
      data['N10'] = data2.firstName;
      data['X30'] = data2.firstName;
      data['X31'] = data2.firstName;
      data['X32'] = data2.firstName;
      data['X33'] = data2.firstName;
      data['X34'] = data2.firstName;
      data['X35'] = data2.firstName;
      data['X36'] = data2.firstName;
      data['X37'] = data2.firstName;
      data['X38'] = data2.firstName;
      data['X39'] = data2.firstName;
      data['X40'] = data2.firstName;
      data['X41'] = data2.firstName;
    } else if (workOperationType == '有限空间安全作业') {
      data['E6'] = data2.deptId;
      data['E8'] = data2.content;
      data['E10'] = data2.company;
      data['R10'] = data2.firstName;
    } else if (workOperationType == '断路安全作业') {
      data['D6'] = data2.deptId;
      data['V6'] = data2.firstName;
      data['L6'] = data2.company;
    } else if (workOperationType == '高处安全作业') {
      data['E6'] = data2.deptId;
      data['E7'] = data2.projectLocation;
      data['R7'] = data2.content;
      data['E10'] = data2.company;
      data['R10'] = data2.firstName;
    }
    ifr.contentWindow.postMessage({ type: 'read', data: JSON.stringify(data) }, '*');
  });
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow: hidden;

  .ifr-wrapper {
    // width: fit-content;
    // height: fit-content;
    // position: relative;
    width: 100%;
    height: calc(100% - 120px);
    margin-bottom: 120px;
    // transform-origin: top left;
    overflow: scroll;

    // z-index: -1;

    :deep(#iframeA) {
      transform-origin: top left;
    }
  }

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 999999;
    margin-top: 12px;
    height: 58px;
    width: 100%;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .confirm {
      height: 34px;
      border-radius: 30px;
      background: #ff6a00;
      display: grid;
      place-items: center;

      font-size: 16px;
      color: #ffffff;
      min-width: 25vw;
    }

    .cancel {
      height: 34px;
      border-radius: 30px;
      border: 1px solid #8db5c5;
      display: grid;
      place-items: center;

      font-size: 16px;
      color: #8db5c5;
      min-width: 25vw;
    }
  }

  .big {
    position: absolute;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    bottom: 70px;
    right: 70px;
    color: #34394f;
    border-radius: 4px;
    backdrop-filter: blur(10px);
    z-index: 999999;
  }

  .small {
    .big();
    right: 15px;
  }
}
</style>
