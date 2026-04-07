<template>
  <div class="ticket-item-wrapper">
    <div class="title">环节-{{ index }}</div>
    <div v-if="!isEditor" class="editor" @click="$emit('update:isEditor', true)">编辑</div>
    <div v-if="!!isEditor" class="editor" @click="$emit('update:isEditor', false)">取消</div>
    <van-form @submit="onSubmit">
      <van-field
        v-model="info.content"
        class="description"
        type="textarea"
        placeholder="请输入工作录入文字"
        :readonly="!isEditor"
        :rules="[{ required: true, message: '请输入' }]"
      />
      <div class="image upload">
        <div class="left" :class="!isEditor ? 'editing' : ''">
          <van-uploader
            v-model="info.files"
            ref="uploader"
            :deletable="!!isEditor"
            :readonly="readonly"
            @click-upload="showType = true"
            @click-preview="handleClickPreview"
            @close-preview="handleClosePreview"
          >
            <van-button v-if="isEditor" icon="plus" type="primary" color="#B5D8E1" />
            <template #preview-cover="item">
              <div
                v-if="
                  !['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(
                    item.url.split('.').pop()
                  )
                "
              >
                <div class="occupied" @click.stop="showToast('非图片文件暂时不支持查看')"></div>
              </div>
            </template>
          </van-uploader>
          <div v-if="isEditor" class="total-count">共 {{ info.files.length || 0 }} 个</div>
        </div>
      </div>
      <div
        v-if="!!isEditor"
        style="margin: 16px 0; display: flex; justify-content: flex-end; gap: 9px"
      >
        <van-button class="del-btn" @click="handleDel"> 删除 </van-button>
        <van-button class="save-btn" native-type="submit"> 保存 </van-button>
      </div>
      <div v-else class="foot">
        <div class="name">{{ oprationPerson || currentUserNickName }}</div>
        <div class="date">{{ currentTime || oprationTime }}</div>
      </div>
    </van-form>
    <van-action-sheet v-model:show="showType" title="添加图片" :closeable="false">
      <div class="type-select-content">
        <div class="type-item" @click="selectType('camera')">
          <img alt="" src="../../../../assets/image/emergency/warning/camera-c.png" />
          <div class="">拍照</div>
        </div>
        <div class="type-item" @click="selectType('')">
          <img alt="" src="../../../../assets/image/emergency/warning/album.png" />
          <div class="">相册</div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { toRefs, reactive, ref, computed, toRaw } from 'vue';
import { showDialog, showToast } from 'vant';
import {
  addSteps,
  getUserInfo,
  updateSteps,
  getStepsById,
  getFileByProcessId,
  deleteSteps,
  changeProcessStatus,
} from '../../../../api/work';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { showNotify } from 'vant';
import { onBeforeRouteLeave, useRoute } from 'vue-router';
import config from '@/config';

const props = defineProps([
  'workContent',
  'index',
  'workFilesUrl',
  'stepId',
  'isEditor',
  'processId',
  'oprationTime',
  'oprationPerson',
  'id',
  'isFinish',
]);
const { workContent, workFilesUrl, stepId, processId } = toRefs(props);

const emit = defineEmits([
  'update:workContent',
  'update:workFilesUrl',
  'update:stepId',
  'update:isEditor',
  'addSuccess',
  'deleteStep',
]);

let fileArr = [];
// 环节
const info = reactive({
  content: computed({
    get: () => workContent.value,
    set: value => emit('update:workContent', value),
  }),
  files: computed({
    get: () =>
      workFilesUrl.value.map(item => {
        return {
          url: Object.hasOwnProperty.call(item, 'file') ? item.url : `${config.fileUrl}${item.url}`,
          file: item.file,
          isImage: true,
        };
      }),
    set: value => {
      fileArr = value.map(item => toRaw(item));
      emit(
        'update:workFilesUrl',
        value.map(item => ({ url: item.url || item.objectUrl, file: item.file }))
      );
    },
  }),
});

// 截取url端口号后面的部分
function getPathname(url) {
  const urlParser = new URL(url);
  return urlParser.pathname;
}

// 获取route
const route = useRoute();

// 提交事件
const onSubmit = async () => {
  if (stepId.value) {
    // 编辑
    // fileArr里面是否有file为undefined的数据，有就是原来的图片未删除完，没有就是原来的图片全部删除了
    // if ('全部删除了') {
    // 全部删除后fileArr.length = 0

    if (!fileArr.length && !info.files.length) {
      // 两个数组都没有文件
      return showNotify({ type: 'warning', message: '请上传文件！' });

      // const res = await getStepsById(id.value);
      // const data = {
      //   ...res.data.data,
      //   workContent: info.content
      // };
      // await updateSteps(data);
      // emit('update:isEditor', false);
      // return;
    }

    if (!fileArr.length && info.files.length) {
      // 点击了编辑，但是没有修改文件，可能修改内容
      fileArr = info.files;
    }

    // 未被删除的文件数据
    const oldFileUrl = fileArr.filter(item => !item.file).map(item => getPathname(item.url));
    const newFile = fileArr.filter(item => item.file);

    // 查询所有文件列表
    const { data: d } = await getFileByProcessId(processId.value);
    const { rows } = d;

    // ids 被删除的文件数据的id数组
    const ids = rows
      .filter(row => row.stepId === stepId.value)
      .filter(file => !oldFileUrl.includes(encodeURI(file.workFile)) || !file.workFile)
      .map(item => item.id);

    // 未被删除的文件数据的id数组
    const id2s = rows
      .filter(row => row.stepId === stepId.value)
      .filter(file => oldFileUrl.includes(encodeURI(file.workFile)))
      .map(item => item.id);

    // 全部被删除时留下一个作为定位
    if (!oldFileUrl.length) {
      // 这里用后面的数据id定位
      const id = ids.pop();
      const res = await getStepsById(id);
      const data = {
        ...res.data.data,
        workContent: info.content,
        workFile: '',
      };
      await updateSteps(data); // 1
    } else {
      // 这里用后面的数据id定位
      const id = id2s.pop();
      const res = await getStepsById(id);
      const data = {
        ...res.data.data,
        workContent: info.content,
      };
      await updateSteps(data); // 2
    }

    // 删除被删除的数据
    if (ids.length) {
      await deleteSteps(ids); // 3
    }
    // 添加新的数据
    if (newFile.length) {
      await addSteps(
        {
          processId: processId.value,
          workContent: info.content,
          stepId: stepId.value,
        },
        newFile
      ); // 4
    }
    emit('update:isEditor', false);
    getLocation().then(res => {
      const { longitude, latitude } = res;
      // 给作业票数据添加经纬度
      changeProcessStatus({
        id: Number(route.query.id),
        longitude,
        latitude,
      });
    });
  } else {
    // 新增

    // 文件必填
    if (!fileArr.length) {
      return showNotify({ type: 'warning', message: '请上传文件！' });
    }

    const stepId = uuidv4().replace(/-/g, '');
    emit('update:stepId', stepId);
    const data = {
      processId: processId.value,
      workContent: info.content,
      stepId,
    };

    await addSteps(data, fileArr); // 5
    currentTime.value = dayjs().format('YYYY-MM-DD HH:mm');
    emit('update:isEditor', false);
    getLocation().then(res => {
      const { longitude, latitude } = res;
      // 给作业票数据添加经纬度
      changeProcessStatus({
        id: Number(route.query.id),
        longitude,
        latitude,
      });
    });
  }
};

function getLocation() {
  return new Promise(resolve => {
    // eslint-disable-next-line no-undef
    const permissions = cordova.plugins.permissions;
    permissions.requestPermissions(
      [permissions.ACCESS_COARSE_LOCATION, permissions.ACCESS_FINE_LOCATION],
      data => {
        if (data.hasPermission) {
          navigator.geolocation.getCurrentPosition(
            data => {
              const { longitude, latitude } = data.coords;
              resolve({
                longitude,
                latitude,
              });
              //       alert(`
              //   accuracy 精度(米)-${data.coords.accuracy}
              //   altitude 海拔高度-${data.coords.altitude}
              //   altitudeAccuracy 海拔坐标的准确度(米)-${data.coords.altitudeAccuracy}
              //   heading 行进方向(度)-${data.coords.heading}
              //   latitude 纬度-${data.coords.latitude}
              //   longitude 经度-${data.coords.longitude}
              //   speed 速度(m/s)-${data.coords.speed}
              // `)
            },
            err => {
              showDialog({
                title: '错误',
                message: err,
              });
            },
            {
              enableHighAccuracy: true,
            }
          );
        } else {
          showDialog({
            title: '警告',
            message: '请给予定位权限！',
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
  });
}

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
          // fileArr = [file];
          const reader = new FileReader();
          reader.onloadend = e => {
            //cordova插件会将file对象偷偷修改，需要转化为Blob格式才能正确上传
            const the_file = new Blob([e.target.result], { type: file.type }); //存入即可
            info.files = [...info.files, { url, file: the_file }];
            showType.value = false;
          }; //触发onloadend事件
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

// 删除步骤
function handleDel() {
  emit('deleteStep', stepId.value, () => {});
}

// 获取当前用户
const currentUserNickName = ref('');
getUserInfo().then(res => {
  currentUserNickName.value = res.data.data.nickName;
});

// 当前时间
const currentTime = ref('');

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  return false;
}

onBeforeRouteLeave(() => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }
});

function handleClickPreview() {
  document.addEventListener('backbutton', exec, false);
}
function handleClosePreview() {
  document.removeEventListener('backbutton', exec);
}
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.ticket-item-wrapper {
  width: 100%;
  height: 278px;
  border-radius: 8px;
  background: linear-gradient(180deg, #d4f3ec 0%, #d3f0ff 100%);
  padding: 12px 16px 16px;
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
    margin-bottom: 12px;

    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 2px;
      display: inline-block;
      width: 10px;
      height: 20px;
      background: linear-gradient(180deg, #ff6a00 0%, #ffc70e 100%);
    }
  }

  .description {
    height: 86px;
    border-radius: 4px;
    padding: 8px;
    background: #b5d8e1;

    :deep(textarea) {
      &::placeholder {
        height: 81.4%;
        font-family: 思源黑体;
        font-size: 14px;
        font-weight: normal;
        line-height: normal;
        letter-spacing: 0em;
        color: #34394f;
      }
    }

    :deep(.van-field__error-message) {
      margin-top: -5px;
    }
  }
}

.image {
  margin-top: 12px;
  display: flex;
  height: 72px;
  gap: 12px;
  width: 100%;
  .left {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;

    :deep(.van-button__icon) {
      color: #00b099;
      font-weight: 600;
    }
    .total-count {
      font-family: 思源黑体;
      font-size: 12px;
      font-weight: normal;
      line-height: normal;
      letter-spacing: 0em;
      color: #17617e;
      position: absolute;
      bottom: 0;
      left: 5px;
    }

    :deep(.van-uploader) {
      --van-uploader-size: 48px;
      width: calc(100% - 57px);
      padding: 12px;
      background: url('../../../../assets/image/work/img-default.png') no-repeat 12px;
      background-color: rgba(153, 193, 209, 0.52);
      position: absolute;
      left: 57px;
      border-radius: 4px;
      height: 100%;

      .van-uploader__wrapper {
        overflow-y: scroll;
        flex-wrap: nowrap;
        width: 100%;
        .van-uploader__input-wrapper {
          position: absolute;
          left: -57px;
          top: 0;
          .van-button {
            height: 48px;
          }
        }

        .van-uploader__preview {
          margin: 0;
          margin-right: 4px;

          .van-uploader__preview-cover {
            z-index: -1;
          }
        }
      }
    }

    &.editing {
      :deep(.van-uploader) {
        width: 100%;
        left: 0;
      }
    }
  }
}

.del-btn {
  height: 30px;
  border-radius: 4px;
  background: #ff6a0e;
  font-family: 思源黑体;
  font-size: 14px;
  color: #ffffff;
}

.save-btn {
  .del-btn();
  background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
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

.editor {
  position: absolute;
  right: 0;
  top: 0px;
  width: 72px;
  height: 48px;
  display: flex;
  flex-direction: column;
  padding: 14px 22px;

  font-size: 14px;
  color: #17617e;
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 17px;
  margin-top: 21px;
  font-size: 12px;
  color: #34394f;

  .name {
    padding-left: 20px;
    background: url('/src/assets/image/work/contacts-fill.png') no-repeat left/16px;
  }
  .date {
    padding-left: 20px;
    background: url('/src/assets/image/work/time-fill.png') no-repeat left/16px;
  }
}

.occupied {
  height: 48px;
  width: 48px;
  background: url('/src/assets/image/login/icon-1.png') no-repeat center/contain;
}
</style>
