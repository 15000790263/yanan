<template>
  <div class="wrapper">
    <van-tabs
      v-model:active="active"
      animated
      title-active-color="#00B099"
      title-inactive-color="#84ABBB"
      :line-height="0"
      @click-tab="handleActive"
    >
      <van-tab v-for="(item, index) in tabList" :title="item.title" :key="index">
        <component ref="chart" :is="item.contentComp" />
      </van-tab>
    </van-tabs>
    <div class="footer">
      <van-button type="primary" color="#00B099" @click="onConfirm">同意</van-button>
      <van-button type="default" style="color: #8db5c5" @click="onReject">退回</van-button>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { ref } from 'vue';
import TicketApproveRecord from './components/ticket-approve-record.vue';
import TicketFlowChart from './components/ticket-flow-chart.vue';
import FormInfo from './components/form-info.vue';
import { showDialog, showToast, closeToast } from 'vant';
import {
  flowRecord,
  flowTaskForm,
  getNextFlowNode,
  returnList,
  getPostByTaskId,
  updateForm,
  complete,
  returnTask,
  getUser,
  getUserByname,
  updateUser,
  sendShortMessage,
} from '@/api/work';
import config from '@/config';
import dayjs from 'dayjs';

import useUserStore from '@/stores/user.js';
import { createLoading } from '../../../utils/loading-fn';

const active = ref(0);

const router = useRouter();
const route = useRoute();

const tabList = [
  {
    title: '详情',
    contentComp: FormInfo,
  },
  {
    title: '流转记录',
    contentComp: TicketApproveRecord,
  },
  {
    title: '流程图',
    contentComp: TicketFlowChart,
  },
];

const chart = ref();

function handleActive(value) {
  if (value.name === 2) {
    chart.value[2].position();
  }
}

let resultConfirmDesp = '';

function onConfirm() {
  resultConfirmDesp = '同意';
  showDialog({
    title: '请输入处理意见',
    message: () =>
      h('input', {
        style: {
          display: 'inline-block',
          height: '30px',
          border: '1px solid #ddd',
          width: '100%',
          padding: '0 10px',
          'border-radius': '6px',
        },
        value: resultConfirmDesp,
        oninput(e) {
          resultConfirmDesp = e.target.value;
        },
        onblur(e) {
          if (e.target.value === '') {
            resultConfirmDesp = e.target.value = '同意';
          }
        },
      }),
    closeOnClickOverlay: true,
  }).then(async () => {
    taskForm.value.comment = resultConfirmDesp;
    taskComplete();
  });
}

// 从操作票中取出的
const detailData = ref({});

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
  getUserByname(param).then(res => {
    if (res.data.rows.length) {
      let obj = {
        phone: res.data.rows[0].phonenumber,
        userId: res.data.rows[0].userId,
      };
      getUserQuanxian(res.data.rows[0].userId, roleId);
      sendShortMessage(res.data.rows[0].phonenumber);
      return obj;
    }
  });
}

/** 用户审批任务 */
function taskComplete() {
  if (!taskForm.value.variables && checkSendUser.value) {
    showToast('请选择流程接收人员!');
    return;
  }
  if (!taskForm.value.variables && checkSendRole.value) {
    showToast('请选择流程接收角色组!');
    return;
  }
  if (!taskForm.value.comment) {
    showToast('请输入审批意见!');
    return;
  }

  const formContentObj = taskForm.value.variables.formJson;
  if (isHave.value) {
    const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');
    if (htmlobj) {
      htmlobj.options.htmlContent = htmlobj.options.htmlContent.replace(
        config.frUrl,
        '/webroot/decision'
      );
      htmlobj.options.htmlContent = btoa(htmlobj.options.htmlContent);
    }
  }
  complete(taskForm.value).then(response => {
    //
    window.sendMessage({ type: 'submit' }, '*');
    //
    //
  });
}

let aa;

onMounted(() => {
  window.addEventListener(
    'message',
    // 接收从报表发过来的数据
    (aa = e => {
      console.log('e=', e.data);
      if (e.data?.U5) {
        addOperationTicket(e.data);
      }
      // }
      // cb.call(win, e.data)
    }),
    false
  );
});

onUnmounted(() => {
  window.removeEventListener('message', aa, false);
  window.sendMessage = null;
});

// 保存操作票信息
async function addOperationTicket(params) {
  console.log(params);
  let data = {};
  if (route.query.workOperationType == '动火安全作业') {
    getUserObjDetail(params['E43'], 117);
    data = {
      // 作业单位
      operationCompany: params['E9'],
      // 操作人
      operationPerson: params['E10'] ? params['E10'].toString() : '',
      // 操作内容
      operationContent: params['E7'],
      // 操作时间
      operationTime: params['G23'],
      operationEndTime: params['Q23'],
      // 作业关联编号
      refSerial: '动火作业安全作业票-' + params['U5'],
      // 作业等级
      operrationGrade: params['E8'],
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
      // 作业等级
      operrationGrade: params['V9'],
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
    };
  }

  const oldOperationAllContent = JSON.parse(detailData.value.operationAllContent); //
  let operationAllContent = { ...oldOperationAllContent, ...params };
  let createTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  let workOperationType = detailData.value.workOperationType;
  if (flowRecordList.value[0].taskName !== '申请人') {
    if (workOperationType == '动火安全作业') {
      operationAllContent['R43'] = '';
      operationAllContent['R44'] = '';
      operationAllContent['R45'] = '';

      if (operationAllContent['U43'] == '') {
        operationAllContent['E43'] = taskForm.value.comment;
        // operationAllContent['R43'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA43'] = useUserStore().userId;
        operationAllContent['U43'] = createTime;
        getUserObjDetail(operationAllContent['E44'], 118);
      } else if (operationAllContent['U44'] == '') {
        operationAllContent['E44'] = taskForm.value.comment;
        // operationAllContent['R44'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA44'] = useUserStore().userId;
        operationAllContent['U44'] = createTime;
        getUserObjDetail(operationAllContent['E45'], 120);
      } else if (operationAllContent['U45'] == '') {
        operationAllContent['E45'] = taskForm.value.comment;
        // operationAllContent['R45'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA45'] = useUserStore().userId;
        operationAllContent['U45'] = createTime;
        detailData.value.status = 1;
      } else if (operationAllContent['U46'] == '') {
        operationAllContent['E46'] = taskForm.value.comment;
        // operationAllContent['R46'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA46'] = useUserStore().userId;
        operationAllContent['U46'] = createTime;
      }
    } else if (workOperationType == '断路安全作业') {
      operationAllContent['R33'] = '';
      operationAllContent['R34'] = '';
      operationAllContent['R35'] = '';
      if (operationAllContent['U33'] == '') {
        operationAllContent['E33'] = taskForm.value.comment;
        // operationAllContent['R33'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA33'] = useUserStore().userId;
        operationAllContent['U33'] = createTime;
        getUserObjDetail(operationAllContent['E34'], 119);
      } else if (operationAllContent['U34'] == '') {
        operationAllContent['E34'] = taskForm.value.comment;
        // operationAllContent['R34'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA34'] = useUserStore().userId;
        operationAllContent['U34'] = createTime;
        getUserObjDetail(operationAllContent['E35'], 120);
      } else if (operationAllContent['U35'] == '') {
        operationAllContent['E35'] = taskForm.value.comment;
        // operationAllContent['R35'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA35'] = useUserStore().userId;
        operationAllContent['U35'] = createTime;
        detailData.value.status = 1;
      } else if (operationAllContent['U36'] == '') {
        operationAllContent['E36'] = taskForm.value.comment;
        // operationAllContent['R36'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA36'] = useUserStore().userId;
        operationAllContent['U36'] = createTime;
      }
    } else if (workOperationType == '挖掘动土安全作业') {
      operationAllContent['R44'] = '';
      operationAllContent['R45'] = '';
      operationAllContent['R46'] = '';
      if (operationAllContent['U44'] == '') {
        operationAllContent['E44'] = taskForm.value.comment;
        // operationAllContent['R44'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA44'] = useUserStore().userId;
        operationAllContent['U44'] = createTime;
        getUserObjDetail(operationAllContent['E45'], 119);
      } else if (operationAllContent['U45'] == '') {
        operationAllContent['E45'] = taskForm.value.comment;
        // operationAllContent['R45'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA45'] = useUserStore().userId;
        operationAllContent['U45'] = createTime;
        getUserObjDetail(operationAllContent['E46'], 120);
      } else if (operationAllContent['U46'] == '') {
        operationAllContent['E46'] = taskForm.value.comment;
        // operationAllContent['R46'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA46'] = useUserStore().userId;
        operationAllContent['U46'] = createTime;
        detailData.value.status = 1;
      } else if (operationAllContent['U47'] == '') {
        operationAllContent['E47'] = taskForm.value.comment;
        // operationAllContent['R47'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA47'] = useUserStore().userId;
        operationAllContent['U47'] = createTime;
      }
    } else if (workOperationType == '临时用电安全作业') {
      operationAllContent['R46'] = '';
      operationAllContent['R47'] = '';
      operationAllContent['R48'] = '';

      if (operationAllContent['U46'] == '') {
        operationAllContent['E46'] = taskForm.value.comment;
        // operationAllContent['R46'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA46'] = useUserStore().userId;
        operationAllContent['U46'] = createTime;
        getUserObjDetail(operationAllContent['E47'], 119);
      } else if (operationAllContent['U47'] == '') {
        operationAllContent['E47'] = taskForm.value.comment;
        // operationAllContent['R47'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA47'] = useUserStore().userId;
        operationAllContent['U47'] = createTime;
        getUserObjDetail(operationAllContent['E48'], 120);
      } else if (operationAllContent['U48'] == '') {
        operationAllContent['E48'] = taskForm.value.comment;
        // operationAllContent['R48'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA48'] = useUserStore().userId;
        operationAllContent['U48'] = createTime;
        detailData.value.status = 1;
      } else if (operationAllContent['U49'] == '') {
        operationAllContent['E49'] = taskForm.value.comment;
        // operationAllContent['R49'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA49'] = useUserStore().userId;
        operationAllContent['U49'] = createTime;
      }
    } else if (
      workOperationType == '高处安全作业' ||
      workOperationType == '盲板抽堵安全作业' ||
      workOperationType == '吊装安全作业' ||
      workOperationType == '有限空间安全作业'
    ) {
      operationAllContent['R44'] = '';
      operationAllContent['R45'] = '';

      if (operationAllContent['U44'] == '') {
        operationAllContent['E44'] = taskForm.value.comment;
        // operationAllContent['R44'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA44'] = useUserStore().userId;
        operationAllContent['U44'] = createTime;
        getUserObjDetail(operationAllContent['E45'], 120);
      } else if (operationAllContent['U45'] == '') {
        operationAllContent['E45'] = taskForm.value.comment;
        // operationAllContent['R45'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA45'] = useUserStore().userId;
        operationAllContent['U45'] = createTime;
        detailData.value.status = 1;
      } else if (operationAllContent['U46'] == '') {
        operationAllContent['E46'] = taskForm.value.comment;
        // operationAllContent['R46'] = useUserStore().signature?img:useUserStore().nickName
        operationAllContent['AA46'] = useUserStore().userId;
        operationAllContent['U46'] = createTime;
      }
    }
  }
  detailData.value.operationAllContent = JSON.stringify(operationAllContent);
  updateForm({ ...detailData.value, ...data }).then(() => {
    showToast('操作成功');
    setTimeout(() => {
      router.goBack();
    }, 800);
  });
}

const taskForm = ref({
  returnTaskShow: false, // 是否展示回退表单
  delegateTaskShow: false, // 是否展示回退表单
  defaultTaskShow: true, // 默认处理
  comment: '', // 意见内容
  procInsId: '', // 流程实例编号
  instanceId: '', // 流程实例编号
  deployId: '', // 流程定义编号
  taskId: '', // 流程任务编号
  procDefId: '', // 流程编号
  targetKey: '',
  variables: {},
});

// 任务节点
const taskName = ref('');
// 发起人信息
const startUser = ref('');
// 流程流转数据
const flowRecordList = ref([]);

initData();

function initData() {
  if (route.query) {
    taskName.value = route.query.taskName;
    startUser.value = route.query.startUser;
    taskForm.value.deployId = route.query.deployId;
    taskForm.value.taskId = route.query.taskId;
    taskForm.value.procInsId = route.query.procInsId;
    taskForm.value.executionId = route.query.executionId;
    taskForm.value.instanceId = route.query.procInsId;
    // 流程任务获取变量信息
    if (taskForm.value.taskId) {
      getFlowTaskForm(taskForm.value.taskId);
    }
    getFlowRecordList(taskForm.value.procInsId, taskForm.value.deployId);
  }
}

// 表单json
const formJson = ref({});

/** 流程节点表单 */
function getFlowTaskForm(taskId) {
  // 提交流程申请时填写的表单存入了流程变量中后续任务处理时需要展示
  flowTaskForm({ taskId: taskId }).then(res => {
    // 回显表单
    const formContentObj = res.data.data.formJson;
    const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');
    if (htmlobj) {
      htmlobj.options.htmlContent = atob(htmlobj.options.htmlContent);

      htmlobj.options.htmlContent = htmlobj.options.htmlContent.replace(
        '/webroot/decision',
        config.frUrl
      );
    }
    formJson.value = res.data.data.formJson;

    submitForm();
  });
}

/** 流程流转记录 */
function getFlowRecordList(procInsId, deployId) {
  const params = { procInsId: procInsId, deployId: deployId };
  flowRecord(params)
    .then(res => {
      flowRecordList.value = res.data.data.flowList;
      // if (
      //   res.data.data.flowList[0].taskName == '申请人' &&
      //   res.data.data.flowList[res.data.data.flowList.length - 1].assigneeName !=
      //     useUserStore().nickName
      // ) {
      //   // approveOpen.value = false;
      // }
    })
    .catch(res => {
      goBack();
    });
}

handleComplete();

// 回退列表数据
const returnTaskList = ref([]);

/** 加载审批任务弹框 */
function handleComplete() {
  returnList(taskForm.value).then(res => {
    returnTaskList.value = res.data.data;
  });

  // submitForm();
}

// 判断是否有下一个审批人
const isHave = ref(true);
// 是否展示人员选择模块
const checkSendUser = ref(false);
// 选择类型
const checkType = ref('single');
// 是否展示角色选择模块
const checkSendRole = ref(false);
// 会签节点
const multiInstanceVars = ref('');

/** 申请流程表单数据提交 */
function submitForm() {
  // 根据当前任务或者流程设计配置的下一步节点 todo 暂时未涉及到考虑网关、表达式和多节点情况
  getNextFlowNode({ taskId: taskForm.value.taskId }).then(res => {
    const data = res.data.data;
    if (data) {
      Object.assign(taskForm.value.variables, {});
      taskForm.value.variables.formJson = formJson.value;
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
      }
    } else {
      isHave.value = false;
    }
  });
}

onMounted(() => {
  setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA').contentWindow;
      getFrData();
      var sendMessage = function () {
        return function (data) {
          ifr.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 1500);

  setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA').contentWindow;
      getFrData();
      var sendMessage = function () {
        return function (data) {
          ifr.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 2000);
});

// 获取报表数据
function getFrData() {
  getPostByTaskId(taskForm.value.procInsId)
    .then(async res => {
      detailData.value = res.data.data;
    })
    .catch(error => {
      // proxy.$modal.msgError(error)
    });
}

function onReject() {
  resultConfirmDesp = '退回';
  taskForm.value.targetKey = returnTaskList.value[0].id;
  showDialog({
    title: '请输入处理意见',
    message: () => (
      <div>
        <input
          value={resultConfirmDesp}
          style={{
            display: 'inline-block',
            height: '30px',
            border: '1px solid #ddd',
            width: '100%',
            padding: '0 10px',
            borderRadius: '6px',
          }}
          onInput={e => {
            resultConfirmDesp = e.target.value;
          }}
          onBlur={e => {
            if (e.target.value === '') {
              resultConfirmDesp = e.target.value = '退回';
            }
          }}
        />

        <div>
          <div
            style={{
              height: '30px',
              lineHeight: '30px',
              color: '#323233',
              fontWeight: 600,
              fontSize: '16px',
              marginTop: '12px',
            }}
          >
            退回节点
          </div>
          <div style={{ display: 'flex' }}>
            {returnTaskList.value.map(item => {
              return (
                <div
                  key={item.id}
                  style={{
                    height: '30px',
                    padding: '0 5px',
                    lineHeight: '30px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background:
                      item.id === taskForm.value.targetKey
                        ? 'linear-gradient(180deg, #2ec192 0%, #25a0e2 100%)'
                        : '',
                    color: item.id === taskForm.value.targetKey ? '#fff' : '#646566',
                  }}
                  onClick={() => {
                    taskForm.value.targetKey = item.id;
                  }}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    closeOnClickOverlay: true,
  }).then(async () => {
    taskForm.value.comment = resultConfirmDesp;
    taskReturn();
  });
}

/** 提交退回任务 */
function taskReturn() {
  returnTask(taskForm.value).then(res => {
    let name = '';
    returnTaskList.value.forEach((item, index2) => {
      if (taskForm.value.targetKey == item.id) {
        name = item.name;
      }
    });
    let operationAllContent = JSON.parse(detailData.value.operationAllContent);
    let workOperationType = detailData.value.workOperationType;
    if (workOperationType == '动火安全作业') {
      if (name == '作业审核人') {
        operationAllContent['E44'] = '';
        operationAllContent['R44'] = '';
        operationAllContent['U44'] = '';
      } else {
        operationAllContent['E43'] = '';
        operationAllContent['R43'] = '';
        operationAllContent['U43'] = '';
        operationAllContent['E44'] = '';
        operationAllContent['R44'] = '';
        operationAllContent['U44'] = '';
      }
    } else if (workOperationType == '断路安全作业') {
      if (name == '作业审核人') {
        operationAllContent['E34'] = '';
        operationAllContent['R34'] = '';
        operationAllContent['U34'] = '';
      } else {
        operationAllContent['E33'] = '';
        operationAllContent['R33'] = '';
        operationAllContent['U33'] = '';
        operationAllContent['E34'] = '';
        operationAllContent['R34'] = '';
        operationAllContent['U34'] = '';
      }
    } else if (workOperationType == '挖掘动土安全作业') {
      if (name == '作业审核人') {
        operationAllContent['E45'] = '';
        operationAllContent['R45'] = '';
        operationAllContent['U45'] = '';
      } else {
        operationAllContent['E44'] = '';
        operationAllContent['R44'] = '';
        operationAllContent['U44'] = '';
        operationAllContent['E45'] = '';
        operationAllContent['R45'] = '';
        operationAllContent['U45'] = '';
      }
    } else if (workOperationType == '临时用电安全作业') {
      if (name == '作业审核人') {
        operationAllContent['E47'] = '';
        operationAllContent['R47'] = '';
        operationAllContent['U47'] = '';
      } else {
        operationAllContent['E46'] = '';
        operationAllContent['R46'] = '';
        operationAllContent['U46'] = '';
        operationAllContent['E47'] = '';
        operationAllContent['R47'] = '';
        operationAllContent['U47'] = '';
      }
    } else if (
      workOperationType == '高处安全作业' ||
      workOperationType == '盲板抽堵安全作业' ||
      workOperationType == '吊装安全作业' ||
      workOperationType == '有限空间安全作业'
    ) {
      operationAllContent['E44'] = '';
      operationAllContent['R44'] = '';
      operationAllContent['U44'] = '';
    }
    detailData.value.operationAllContent = JSON.stringify(operationAllContent);
    updateForm(detailData.value).then(() => {
      showToast('操作成功');
      setTimeout(() => {
        router.goBack();
      }, 800);
    });
  });
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box !important;
}

.wrapper {
  height: 100%;

  :deep(.van-tabs) {
    height: calc(100% - 70px);
    .van-tabs__wrap {
      height: 56px;
    }

    .van-tabs__content {
      height: calc(100% - 56px);
    }

    .van-tab__panel {
      height: 100%;
    }

    .van-tabs__nav--line {
      padding: 0;
    }
  }

  :deep(.van-loading) {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
  }

  .footer {
    height: 56px;
    margin-top: 14px;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .van-button {
      border-radius: 22px;
      height: 34px;
      padding: 0 27px;
    }
  }

  :deep(#iframeA) {
    transform-origin: top left;
    position: static !important;
    z-index: 0 !important;
  }
}
</style>
