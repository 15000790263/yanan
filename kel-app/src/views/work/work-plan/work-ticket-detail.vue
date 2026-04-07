<template>
  <div class="wrapper">
    <van-nav-bar>
      <template #left>
        <div class="nav-bar">
          <div class="icon">
            <img src="../../../assets/image/work/icon-work.png" alt="" />
          </div>
          <div class="name">
            <div class="ticket">{{ ticketInfo?.workOperationType }}</div>
            <div class="work">{{ ticketInfo?.projectName }}</div>
          </div>
        </div>
      </template>
      <template #right>
        <van-button
          round
          color="linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)"
          style="width: 68px; height: 32px; font-size: 14px"
          size="small"
          @click="addStep"
          >新增</van-button
        >
        <van-button
          round
          color="linear-gradient(rgb(46 179 193) 0%, rgb(37 134 226) 100%)"
          style="width: 68px; height: 32px; font-size: 14px; margin-left: 5px"
          size="small"
          @click="
            $router.push({
              path: '/work/work-ticket-record',
              query: {
                ...$route.query,
              },
            })
          "
          >查看</van-button
        >
      </template>
      <!-- 完成也可查看 -->
      <!-- <template v-else-if="isFinish" #right>
        <van-button
          round
          color="linear-gradient(rgb(46 179 193) 0%, rgb(37 134 226) 100%)"
          style="width: 68px; height: 32px; font-size: 14px; margin-left: 5px"
          size="small"
          @click="
            $router.push({
              path: '/work/work-ticket-record',
              query: {
                ...$route.query,
              },
            })
          "
          >查看</van-button
        >
      </template> -->
    </van-nav-bar>
    <div class="ticket-list">
      <template v-for="(item, index) in stepsList" :key="item.id">
        <TicketDetailItem
          v-model:workContent="item.workContent"
          v-model:workFilesUrl="item.workFilesUrl"
          v-model:stepId="item.stepId"
          v-model:isEditor="item.isEditor"
          :processId="processId"
          :oprationTime="item.oprationTime"
          :oprationPerson="item.oprationPerson"
          :index="stepsList.length - index"
          :id="item.id"
          :isFinish="isFinish"
          @addSuccess="handleAddSuccess"
          @deleteStep="handleDeleteStep"
          @update:isEditor="!item.stepId && stepsList.shift()"
        ></TicketDetailItem>
      </template>
    </div>
    <div v-if="isFinish" class="signature finish">
      <van-button class="sign-btn" round @click="checkSign">查看作业票手签</van-button>
    </div>
    <div v-else-if="showSignature" class="signature">
      <van-button class="sign-btn" round @click="openSign">作业票手签</van-button>
    </div>
    <van-action-sheet v-model:show="show" :closeable="false" :close-on-popstate="false">
      <div class="content">
        <div class="title">作业票手签</div>
        <div class="inner">
          <div>
            <van-uploader
              v-model="signFile"
              ref="uploader"
              :readonly="readonly"
              @click-upload="handleShowType"
              @click-preview="handleClickPreview"
              @close-preview="handleClosePreview"
            >
              <van-button
                v-if="!signFile.length"
                icon="plus"
                type="primary"
                color="rgba(153, 193, 209, 0.52)"
              />
            </van-uploader>
            <div v-if="!signFile.length" class="upload-text">上传作业票</div>
          </div>
        </div>

        <div class="signature">
          <van-button class="sign-btn" round :disabled="!signFile.length" @click="handleSign"
            >作业票手签</van-button
          >
        </div>
      </div>
    </van-action-sheet>
    <van-action-sheet
      v-model:show="showType"
      title="添加图片"
      :closeable="false"
      :close-on-popstate="false"
    >
      <div class="type-select-content">
        <div class="type-item" @click="selectType('camera')">
          <img alt="" src="../../../assets/image/emergency/warning/camera-c.png" />
          <div class="">拍照</div>
        </div>
        <div class="type-item" @click="selectType('')">
          <img alt="" src="../../../assets/image/emergency/warning/album.png" />
          <div class="">相册</div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import TicketDetailItem from './components/ticket-detail-item.vue';
import { onMounted, ref, watchEffect, watch, toRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  getTicketProcess,
  getFileByProcessId,
  deleteSteps,
  startProcess,
  changeProcessStatus,
  addSteps,
  getTicketDetailById,
  fileProcess,
  updateProcess,
  getPostByTaskId,
  updateForm,
} from '../../../api/work';
import { showConfirmDialog, showDialog } from 'vant';
import { onBeforeRouteLeave } from 'vue-router';
import { showImagePreview } from 'vant';
import config from '@/config';
import useUserStore from '@/stores/user.js';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const stepsList = ref([]);

const processId = ref('');

// 作业票是否手签完成
const isFinish = ref(false);

// 作业票手签文件对象
const signObj = ref();

// 作业票数据
const ticketInfo = ref(null);

async function init() {
  processId.value = '';
  const procInsId = route.query.procInsId;
  const id = route.query.id;
  // 获取作业票详情
  const res = await getTicketDetailById(id);
  ticketInfo.value = res.data.data;

  if (procInsId) {
    // getTicketProcess这个接口有概率请求不到值
    const { data } = await getTicketProcess(procInsId);
    if (data.rows.length) {
      processId.value = data.rows[data.rows.length - 1].id;
      await getFileByProcessId(data.rows[data.rows.length - 1].id).then(({ data }) => {
        const { rows } = data;
        const arr = [];
        const filterByuuidArr = [];

        // 去除作业票手签上传的文件（id===stepId）
        const newRows = rows.filter(item => id != item.stepId);
        const index = rows.findIndex(item => id == item.stepId);
        isFinish.value = index !== -1;
        if (isFinish.value) {
          signObj.value = rows[index];
        }

        /* 因为更新做成了新增，所以删除之前所有的图片后在新增会导致顺序错乱
          所以要reverse数组后使用unshift方法添加
        */
        newRows.reverse().forEach(item => {
          const stepId = item.stepId;
          if (arr.includes(stepId)) {
            filterByuuidArr
              .find(value => value.stepId === stepId)
              .workFilesUrl.push({ url: item.workFile });
          } else {
            arr.push(stepId);
            filterByuuidArr.unshift(item);
            item.workFilesUrl = [{ url: item.workFile }];
          }
        });

        // 问题：调换workFile=''和有值的顺序

        filterByuuidArr.forEach(item => {
          item.workFilesUrl = item.workFilesUrl.filter(item => item.url !== '');
        });

        if (stepsList.value.length) {
          const stepsId = stepsList.value.map(item => item.stepId);
          const arr = filterByuuidArr.filter(item => !stepsId.includes(item.stepId));
          stepsList.value.unshift(...arr);
        } else {
          stepsList.value = filterByuuidArr;
        }
      });
    } else {
      // 手动执行‘启动’功能
      await startProcess({
        procInsId,
        processStatus: '0',
        leader: ticketInfo.value.leader,
        operationName: ticketInfo.value.projectName,
        operationTime: ticketInfo.value.operationTime,
        operationEndTime: ticketInfo.value.operationEndTime,
        operationType: ticketInfo.value.workOperationType,
        params: {},
        remark: ticketInfo.value.remark,
        status: ticketInfo.value.status,
      });
      await changeProcessStatus({
        id,
        processStatus: '0',
      });

      init();
    }
  }
}

onMounted(init);

function addStep() {
  stepsList.value.unshift({
    workContent: '',
    workFilesUrl: [],
    stepId: '',
    isEditor: true,
  });
}

function handleAddSuccess() {
  // init();
}

// 删除环节
async function handleDeleteStep(stepId, cb) {
  await showConfirmDialog({
    message: '确认删除吗？',
  });
  if (!stepId) {
    stepsList.value.shift();
  } else {
    const { data } = await getFileByProcessId(processId.value);
    const { rows } = data;
    const ids = rows.filter(row => row.stepId === stepId).map(item => item.id);
    await deleteSteps(ids);
    cb();
    stepsList.value = stepsList.value.filter(item => item.stepId !== stepId);
  }
}

// 侦听是否显示作业票手签按钮
const showSignature = ref(false);
watchEffect(() => {
  const index = stepsList.value.findIndex(item => item.isEditor);
  showSignature.value = index === -1;
});

const show = ref(false);

watch(show, () => {
  if (show.value === false) {
    signFile.value = [];
  }
});

// 作业票手签
async function handleSign() {
  const data = {
    processId: processId.value,
    workContent: '作业票手签',
    stepId: route.query.id,
  };
  await addSteps(data, toRaw(signFile.value));
  const { procInsId, id } = route.query;
  // 处理processStatus ，让其为"1"
  await changeProcessStatus({
    id,
    processStatus: '1',
  });
  // 处理过程的processStatus ，让其为"1"
  await updateProcess({
    id: processId.value,
    processStatus: '1',
  });

  // web过程归档
  await fileProcess({
    fileStatus: '1',
    id: processId.value,
  });
  // 作业票手签完成
  // 删除作业票的经纬度信息
  changeProcessStatus({
    id,
    longitude: 0,
    latitude: 0,
  });
  // 处理作业票表单回填问题
  await processFRData();

  //
  router.replace({
    path: '/work/work-ticket-finish',
    query: {
      procInsId,
      id,
    },
  });
}

async function processFRData() {
  const res = await getPostByTaskId(route.query.procInsId);

  const detailData = res.data.data;
  const createTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const comment = '完成';
  const userId = useUserStore().userId;

  const workOperationType = detailData.workOperationType;
  const operationAllContent = JSON.parse(detailData.operationAllContent);
  if (workOperationType == '动火安全作业') {
    operationAllContent['E46'] = comment;
    operationAllContent['AA46'] = userId;
    operationAllContent['U46'] = createTime;
  } else if (workOperationType == '断路安全作业') {
    operationAllContent['E36'] = comment;
    operationAllContent['AA36'] = userId;
    operationAllContent['U36'] = createTime;
  } else if (workOperationType == '挖掘动土安全作业') {
    operationAllContent['E47'] = comment;
    operationAllContent['AA47'] = userId;
    operationAllContent['U47'] = createTime;
  } else if (workOperationType == '临时用电安全作业') {
    operationAllContent['E49'] = comment;
    operationAllContent['AA49'] = userId;
    operationAllContent['U49'] = createTime;
  } else if (
    workOperationType == '高处安全作业' ||
    workOperationType == '盲板抽堵安全作业' ||
    workOperationType == '吊装安全作业' ||
    workOperationType == '有限空间安全作业'
  ) {
    operationAllContent['E46'] = comment;
    operationAllContent['AA46'] = userId;
    operationAllContent['U46'] = createTime;
  }

  detailData.operationAllContent = JSON.stringify(operationAllContent);

  await updateForm(detailData);
}

// 上传手签图片

// 图片上传选择弹窗
const showType = ref(false);
const readonly = ref(true);
const uploader = ref(null);

function selectType(data) {
  if (data === 'camera') {
    hasCamera();
  } else {
    readonly.value = false;
    setTimeout(() => {
      uploader.value.chooseFile();
      readonly.value = true;
      showType.value = false;
    }, 500);
  }
}

function hasCamera() {
  // eslint-disable-next-line no-undef
  const permissions = cordova.plugins.permissions;
  permissions.checkPermission(
    [permissions.CAMERA],
    data => {
      if (data.hasPermission) {
        getPhoto();
      } else {
        permissions.requestPermissions(
          [permissions.CAMERA],
          res => {
            if (res.hasPermission) {
              // showSuccessToast('相机权限申请成功')
              getPhoto();
            } else {
              showDialog({
                title: '错误',
                message: '请给予相机权限！',
              });
            }
          },
          err => {
            showDialog({
              title: '错误',
              message: err,
            });
          }
        );
      }
    },
    err => {
      showDialog({
        title: '错误',
        message: err,
      });
    }
  );
}

function getPhoto() {
  navigator.camera.getPicture(
    url => {
      window.resolveLocalFileSystemURL(url, function success(fileEntry) {
        fileEntry.file(file => {
          const reader = new FileReader();
          reader.onloadend = e => {
            //cordova插件会将file对象偷偷修改，需要转化为Blob格式才能正确上传
            const the_file = new Blob([e.target.result], { type: file.type }); //存入即可
            signFile.value = [{ url, file: the_file }];
            showType.value = false;
          };
          reader.readAsArrayBuffer(file);
        });
      });
    },
    err => {
      showDialog({
        title: '错误',
        message: err,
      });
    },
    {
      quality: 50,
      // eslint-disable-next-line no-undef
      destinationType: Camera.DestinationType.FILE_URI,
      // eslint-disable-next-line no-undef
      // mediaType: Camera.MediaType.ALLMEDIA
    }
  );
}

// 作业票手签图片
const signFile = ref([]);

// 路由守卫
onBeforeRouteLeave(to => {
  if (to.path === '/work/work-ticket-finish' && isFinish.value) {
    return '/work/work-plan';
  }
});

// 查看作业票手签
function checkSign() {
  const { workFile } = signObj.value;
  showImagePreview([`${config.fileUrl}${workFile}`]);
}

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  if (showType.value === true) {
    showType.value = false;
  } else if (previewStatus.value === true) {
    previewStatus.value = false;
  } else {
    // 只打开了手签窗口
    show.value = false;
    document.removeEventListener('backbutton', exec);
  }
  return false;
}

onBeforeRouteLeave(() => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }
});

const previewStatus = ref(false);

function handleClickPreview() {
  previewStatus.value = true;
}
function handleClosePreview() {
  previewStatus.value = false;
}

// 打开作业票手签窗口
function openSign() {
  show.value = true;
  document.addEventListener('backbutton', exec, false);
}

// 打开选择相机还是照片窗口
function handleShowType() {
  showType.value = true;
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box !important;
}

:deep(.van-nav-bar__content) {
  height: 58px;
}

.nav-bar {
  display: flex;
  padding: 10px 8px;
  justify-content: flex-start;
  align-items: center;

  .icon > img {
    width: 24px;
    height: 24px;
  }

  .name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-left: 5px;

    > .ticket {
      height: 34.48%;
      font-family: 思源黑体;
      font-size: 14px;
      font-weight: normal;
      line-height: normal;
      color: #34394f;
    }

    > .work {
      height: 29.31%;
      font-family: 思源黑体;
      font-size: 12px;
      font-weight: normal;
      line-height: normal;
      letter-spacing: 0em;
      color: #17617e;
    }
  }
}

.wrapper {
  height: 100%;
  flex-direction: column;

  .ticket-list {
    height: calc(100% - 116px);
    overflow-y: scroll;
    padding: 8px 17px 0 19px;
    // display: grid;
    // grid-template-rows: repeat(auto-fill, 278px);

    :deep(.ticket-item-wrapper) {
      height: 278px !important;
      margin-bottom: 9px;
    }
  }

  .signature {
    height: 58px;
    background: #fff;
    padding: 12px 98px;

    .sign-btn {
      width: 100%;
      height: 100%;
      font-size: 16px;
      color: #fff;
      padding-left: 30px;
      background: url('/src/assets/image/work/icon-article-fill.png') no-repeat calc(50% - 50px)
        center/16px #ff6a00;
    }

    &.finish {
      .sign-btn {
        background: url('/src/assets/image/work/icon-article-fill.png') no-repeat calc(50% - 65px)
          center/16px #ff6a00;
      }
    }
  }
}

.content {
  height: 368px;
  padding: 24px 38px;
  position: relative;

  .title {
    height: 26px;
    font-family: YouSheBiaoTiHei;
    font-size: 20px;
    font-weight: normal;
    line-height: normal;
    letter-spacing: 0em;
    padding-left: 18px;
    position: relative;
    margin-bottom: 24px;

    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      display: inline-block;
      width: 10px;
      height: 20px;
      background: linear-gradient(180deg, #ff6a00 0%, #ffc70e 100%);
    }
  }

  .inner {
    height: 140px;
    width: 100%;
    border-radius: 4px;
    background: rgba(153, 193, 209, 0.52);
    display: grid;
    place-items: center;

    > div {
      text-align: center;
    }

    .upload-text {
      opacity: 0.3;
      font-family: 思源黑体;
      font-size: 12px;
      color: #34394f;
      margin-top: 8px;
    }

    .van-button {
      color: #00b099 !important;
    }

    :deep(.van-uploader__preview) {
      margin: 0;
    }
  }

  .signature {
    position: absolute;
    width: 100%;
    bottom: 85px;
    left: 0;
  }
}

.type-select-content {
  .type-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 17px;
    gap: 10px;
    &:active {
      background-color: #ddd;
    }
  }
}
</style>
