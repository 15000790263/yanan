<template>
  <div class="wrapper" :class="{ 'show-footer': showFooter || showFooter2 }">
    <div v-html="ifrSource" class="ifr-wrapper"></div>

    <div class="big" @click="zoom('+')">
      <van-icon size="2rem" name="plus" />
    </div>
    <div class="small" @click="zoom('-')">
      <van-icon size="2rem" name="minus" />
    </div>

    <div class="footer" v-if="showFooter || showFooter2">
      <van-button class="modify" v-if="!isEdit" type="primary" @click="isEdit = true"
        >修改</van-button
      >
      <template v-else>
        <div v-if="showFooter" class="confirm" @click="onConfirm">提交</div>
        <div v-if="showFooter2" class="confirm" @click="handleEdit">提交</div>
        <div class="cancel" @click="onCancel">取消</div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import {
  getProcessVariables,
  getPostByTaskId,
  returnList,
  getNextFlowNode,
  worktodoList,
  complete,
  updateForm,
  getRecoredByProcInsId,
} from '@/api/work';
import { getUserPermissionsInfo } from '@/api/system';
import { useRoute } from 'vue-router';
import config from '@/config';
import { showConfirmDialog, showToast } from 'vant';
import debounce from 'lodash.debounce';
import workQRode from '@/views/work/other/workQRode.img?raw';
import { createLoading } from '../../../../utils/loading-fn';

const route = useRoute();
const router = useRouter();

const ifrSource = ref('');
let ifr = null;
let scale = 0;

let aa;
onMounted(async () => {
  const res = await getProcessVariables(route.query.taskId);
  const formContentObj = res.data.data.formJson;
  const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');

  ifrSource.value = atob(htmlobj.options.htmlContent).replace('/webroot/decision', config.frUrl);

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
  // scale = window.innerWidth / ifr.width;
  // ifr.style.transform = `scale(${scale})`;

  setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA').contentWindow;
      // getFrData();
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
      // getFrData();
      var sendMessage = function () {
        return function (data) {
          // 我猜的，，在表单内部，会自动执行message事件监听，在外部window，需要手动监听
          ifr.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 3000);

  setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA').contentWindow;
      // getFrData();
      var sendMessage = function () {
        win.addEventListener(
          'message',
          // 接收从报表发过来的数据
          (aa = e => {
            console.log('e=', e);
            if (e.data?.U5) {
              addOperationTicket(e.data);
            }
            // cb.call(win, e.data)
          }),
          false
        );
        return function (data) {
          ifr.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 1500);
});

// 从操作票中取出的
const detailData = ref({});

let destroy;

// 获取报表数据
function getFrData() {
  destroy = createLoading('', { duration: 1500 });
  getPostByTaskId(route.query.procInsId)
    .then(async res => {
      detailData.value = res.data.data;
      let data = JSON.parse(res.data.data.operationAllContent);
      let workOperationType = route.query.workOperationType;
      if (
        workOperationType == '高处安全作业' ||
        workOperationType == '盲板抽堵安全作业' ||
        workOperationType == '吊装安全作业' ||
        workOperationType == '有限空间安全作业'
      ) {
        delete data['R44'];
        delete data['R45'];
        delete data['R46'];

        let person1 = await getUserDetail(data['AA44']);
        let person2 = await getUserDetail(data['AA45']);
        let person3 = await getUserDetail(data['AA46']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A47'] = img1;
        } else {
          data['A47'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B47'] = img2;
        } else {
          data['B47'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C47'] = img3;
        } else {
          data['C47'] = person3;
        }
        data['E47'] = workQRode;
      } else if (workOperationType == '断路安全作业') {
        delete data['R33'];
        delete data['R34'];
        delete data['R35'];
        delete data['R36'];
        let person1 = await getUserDetail(data['AA33']);
        let person2 = await getUserDetail(data['AA34']);
        let person3 = await getUserDetail(data['AA35']);
        let person4 = await getUserDetail(data['AA36']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A37'] = img1;
        } else {
          data['A37'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B37'] = img2;
        } else {
          data['B37'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C37'] = img3;
        } else {
          data['C37'] = person3;
        }
        if (person4.length > 10) {
          let img4 = '<img width="60" src="' + person4 + '"/>';
          data['D37'] = img4;
        } else {
          data['D37'] = person4;
        }
        data['E47'] = workQRode;
      } else if (workOperationType == '临时用电安全作业') {
        delete data['R46'];
        delete data['R47'];
        delete data['R48'];
        delete data['R49'];
        let person1 = await getUserDetail(data['AA46']);
        let person2 = await getUserDetail(data['AA47']);
        let person3 = await getUserDetail(data['AA48']);
        let person4 = await getUserDetail(data['AA49']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A50'] = img1;
        } else {
          data['A50'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B50'] = img2;
        } else {
          data['B50'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C50'] = img3;
        } else {
          data['C50'] = person3;
        }
        if (person4.length > 10) {
          let img4 = '<img width="60" src="' + person4 + '"/>';
          data['D50'] = img4;
        } else {
          data['D50'] = person4;
        }
      } else if (workOperationType == '挖掘动土安全作业') {
        delete data['R44'];
        delete data['R45'];
        delete data['R46'];
        delete data['R47'];
        let person1 = await getUserDetail(data['AA44']);
        let person2 = await getUserDetail(data['AA45']);
        let person3 = await getUserDetail(data['AA46']);
        let person4 = await getUserDetail(data['AA47']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A48'] = img1;
        } else {
          data['A48'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B48'] = img2;
        } else {
          data['B48'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C48'] = img3;
        } else {
          data['C48'] = person3;
        }
        if (person4.length > 10) {
          let img4 = '<img width="60" src="' + person4 + '"/>';
          data['D48'] = img4;
        } else {
          data['D48'] = person4;
        }
      } else if (workOperationType == '动火安全作业') {
        delete data['R43'];
        delete data['R44'];
        delete data['R45'];
        delete data['R46'];
        let person1 = await getUserDetail(data['AA43']);
        let person2 = await getUserDetail(data['AA44']);
        let person3 = await getUserDetail(data['AA45']);
        let person4 = await getUserDetail(data['AA46']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A47'] = img1;
        } else {
          data['A47'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B47'] = img2;
        } else {
          data['B47'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C47'] = img3;
        } else {
          data['C47'] = person3;
        }
        if (person4.length > 10) {
          let img4 = '<img width="60" src="' + person4 + '"/>';
          data['D47'] = img4;
        } else {
          data['D47'] = person4;
        }
      }
      window.sendMessage({
        type: 'read',
        data: JSON.stringify(data),
      });
    })
    .catch(error => {});
}

async function getUserDetail(userId) {
  if (!userId) {
    return '';
  }
  return await getUserPermissionsInfo(userId).then(res => {
    if (res.data.data.signature) {
      return res.data.data.signature;
    } else {
      return res.data.data.nickName;
    }
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

const isEdit = ref(false);

watch(
  isEdit,
  value => {
    if (ifr) {
      ifr.style.position = value ? 'static' : 'relative';
      ifr.style.zIndex = value ? 0 : -1;
    }
  },
  {
    immediate: true,
  }
);

function onCancel() {
  showConfirmDialog({
    title: '提示',
    message: '数据未保存，确认取消吗？',
  })
    .then(() => {
      // router.goBack();
      isEdit.value = false;
    })
    .catch(() => {
      // on cancel
    });
}

// 判断是否有下一个审批人
const isHave = ref(true);

// 回退列表数据
const returnTaskList = ref([]);
function onConfirm() {
  returnList(taskForm.value).then(res => {
    returnTaskList.value = res.data;
  });
  window.sendMessage({ type: 'submit' });
}

/** 申请流程表单数据提交 */
const submitForm2 = debounce(params => {
  // 根据当前任务或者流程设计配置的下一步节点 todo 暂时未涉及到考虑网关、表达式和多节点情况
  getNextFlowNode({ taskId: taskForm.value.taskId }).then(res => {
    const data = res.data;
    if (data) {
      let workOperationType = route.query.workOperationType;
      if (
        workOperationType == '高处安全作业' ||
        workOperationType == '盲板抽堵安全作业' ||
        workOperationType == '吊装安全作业' ||
        workOperationType == '有限空间安全作业'
      ) {
        params['R44'] = '';
        params['R45'] = '';
      } else if (workOperationType == '断路安全作业') {
        params['R33'] = '';
        params['R34'] = '';
        params['R35'] = '';
      } else if (workOperationType == '临时用电安全作业') {
        params['R46'] = '';
        params['R47'] = '';
        params['R48'] = '';
      } else if (workOperationType == '挖掘动土安全作业') {
        params['R44'] = '';
        params['R45'] = '';
        params['R46'] = '';
      } else if (workOperationType == '动火安全作业') {
        params['R43'] = '';
        params['R44'] = '';
        params['R45'] = '';
      }
      detailData.value.operationAllContent = params;
      Object.assign(taskForm.value.variables, {});
      taskForm.value.variables.formJson = formJson.value;
      taskComplete();
      // proxy.$modal.msgError(error);
    } else {
      isHave.value = false;
    }
  });
});

const taskForm = ref({
  multiple: false,
  comment: '', // 意见内容
  procInsId: '', // 流程实例编号
  instanceId: '', // 流程实例编号
  deployId: '', // 流程定义编号
  taskId: '', // 流程任务编号
  procDefId: '', // 流程编号
  variables: {},
  executionId: '',
});

const showFooter = ref(false);
const showFooter2 = ref(false);

async function canEditFn() {
  // 获取代办列表数据
  await getWorktodoList();

  if (showFooter.value) {
    return;
  }

  // 获取流转记录数据
  getWorkRecordList();
}

canEditFn();

async function getWorktodoList() {
  const res = await worktodoList({
    pageNum: 1,
    pageSize: 100,
  });

  const { records } = res.data.data;
  if (records.length) {
    const o = records.find(item => item.procInsId == route.query.procInsId);
    if (o) {
      showFooter.value = true;
      taskForm.value.procInsId = o.procInsId;
      taskForm.value.taskId = o.taskId;
      taskForm.value.procDefId = o.procDefId;
      taskForm.value.instanceId = o.procInsId;
      taskForm.value.deployId = o.deployId;
      taskForm.value.executionId = o.executionId;

      // 流程任务重获取变量表单
      processVariables(o.taskId);
    } else {
      //
      showFooter.value = false;
    }
  } else {
    //
    showFooter.value = false;
  }
}

async function getWorkRecordList() {
  const res = await getRecoredByProcInsId(route.query.procInsId);
  const { flowList } = res.data.data;
  showFooter2.value = flowList.length === 2;
}

// 表单json
const formJson = ref({});

/** 获取流程变量内容 */
function processVariables(taskId) {
  // 提交流程申请时填写的表单存入了流程变量中后续任务处理时需要展示
  getProcessVariables(taskId).then(res => {
    nextTick(() => {
      const formContentObj = res.data.data.formJson;
      const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');
      if (htmlobj) {
        htmlobj.options.htmlContent = atob(htmlobj.options.htmlContent);
        // 在开发模式下加载完整url
        htmlobj.options.htmlContent = htmlobj.options.htmlContent.replace(
          '/webroot/decision',
          config.frUrl
        );
      }
      formJson.value = res.data.data.formJson;
    });
  });
}

/** 用户审批任务 */
async function taskComplete() {
  if (taskForm.value) {
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
    await complete(taskForm.value);

    let operationAllContent = detailData.value.operationAllContent;

    detailData.value.operationAllContent = JSON.stringify(operationAllContent);

    await updateForm(detailData.value);
    showToast('操作成功');
    setTimeout(() => {
      router.goBack();
    }, 800);
  }
}

function handleEdit() {
  const ifrW = ifr.contentWindow;
  ifrW.postMessage({ type: 'submit' }, '*');
}

// 保存操作票信息
const addOperationTicket = debounce(params => {
  const operationAllContent = JSON.stringify(params);
  let data = {};
  if (route.query.workOperationType == '动火安全作业') {
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
      // 大字段
      operationAllContent,
      // 作业等级
      operrationGrade: params['E8'],
      remark: '',
    };
  } else if (route.query.workOperationType == '吊装安全作业') {
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
    };
  } else if (route.query.workOperationType == '挖掘动土安全作业') {
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
    };
  } else if (route.query.workOperationType == '盲板抽堵安全作业') {
    data = {
      // 作业单位
      operationCompany: params['L6'],
      // 操作人
      operationPerson: params['L18'] ? params['L18'].toString() : '',
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
    };
  } else if (route.query.workOperationType == '临时用电安全作业') {
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
    };
  } else if (route.query.workOperationType == '有限空间安全作业') {
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
    };
  } else if (route.query.workOperationType == '断路安全作业') {
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
    };
  } else if (route.query.workOperationType == '高处安全作业') {
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
    };
  }

  updateForm({ ...data, id: detailData.value.id }).then(() => {
    showToast('操作成功');
    window.removeEventListener('message', aa, false);
    setTimeout(() => {
      router.goBack();
    }, 800);
  });
});

onUnmounted(() => {
  destroy && destroy();
});
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow: hidden;

  .ifr-wrapper {
    width: 100%;
    height: 100%;
    margin-bottom: 120px;
    overflow: scroll;

    :deep(#iframeA) {
      transform-origin: top left;
      position: relative;
      z-index: -1;
    }
  }

  .footer {
    position: absolute;
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

    .modify {
      height: 34px;
      border-radius: 30px;
      font-size: 16px;
      color: #fff;
      min-width: 25vw;
    }
  }

  .big {
    position: fixed;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    bottom: 20px;
    right: 70px;
    color: #34394f;
    border-radius: 4px;
    backdrop-filter: blur(10px);
    z-index: 9999;
  }

  .small {
    .big();
    right: 15px;
  }

  &.show-footer {
    .ifr-wrapper {
      height: calc(100% - 120px);
    }
    .big {
      bottom: 70px;
    }

    .small {
      .big();
      right: 15px;
    }
  }
}
</style>
