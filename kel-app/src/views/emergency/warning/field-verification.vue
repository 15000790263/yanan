<template>
  <div class="field-verification">
    <div class="field-verification-content">
      <div class="field-verification-content-form">
        <van-field
          v-model="formData.message"
          type="textarea"
          placeholder="现场情况"
          rows="10"
          autosize
        />
        <div class="form-upload">
          <van-uploader
            v-model="imgList"
            ref="uploader"
            :readonly="readonly"
            @click-upload="showType = true"
            @click-preview="() => {}"
          />
        </div>
        <div class="warning-type">
          <div class="warning-type-title">预警类型</div>
          <div class="warning-type-content">
            <div
              class="warning-type-content-button"
              :class="item.value === formData.level ? 'active' : ''"
              v-for="(item, i) in level"
              :key="i"
              @click="formData.level = item.value"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
      <van-button color="#2EC192" block @click="upload">提交</van-button>
    </div>
    <van-action-sheet v-model:show="showType" title="添加图片" :closeable="false">
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
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { showDialog } from 'vant';
import axios from 'axios';

const route = useRoute();
const uploader = ref(null);

const formData = ref({});

const level = ref([
  {
    name: '解除预警',
    value: '0',
    active: false,
  },
  {
    name: '班组级(C)',
    value: '1',
    active: false,
  },
  {
    name: '分公司级(B)',
    value: '2',
    active: false,
  },
]);

const imgList = ref([]);
const readonly = ref(true);
const showType = ref(false);

onMounted(() => {
  formData.value.id = route.query.id;
});

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
      imgList.value.push({
        url: url,
      });
      showType.value = false;
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
    }
  );
}

function upload() {
  const img = [];
  const imgP = [];
  imgList.value.forEach(item => {
    if (item.url) {
      const temp = axios.get(item.url);
      imgP.push(temp);
    } else {
      img.push(item.file);
    }
  });
  Promise.all(imgP).then(res => {
    res.forEach((item, i) => {
      const fileURL = imgList.value[i].url;
      const blob = new Blob([item.data], { type: 'image/jpg' });
      const file = new File([blob], fileURL.substr(fileURL.lastIndexOf('/') + 1), {
        type: 'image/jpg',
      });
      img.push(file);
    });
  });
}
</script>

<style scoped lang="less">
.field-verification {
  width: calc(100% - 16px * 2) !important;
  height: calc(100% - 16px * 2);
  overflow: auto;
  padding: 16px;
  &-content {
    width: calc(100% - 16px * 2) !important;
    height: calc(100% - 16px * 2);
    padding: 16px;
    border-radius: 4px;
    background-color: #fff;
    box-shadow: 0 3px 7px 0 rgba(14, 68, 118, 0.1);
    :deep(.van-field) {
      background-color: #ecf3f3;
    }
    &-form {
      height: calc(100% - 44px - 16px);
      overflow: auto;
      //display: flex;
      //flex-direction: column;
      //gap: 24px;
      margin-bottom: 16px;
      .form-upload {
        margin: 24px 0;
      }
      .warning-type {
        &-title {
          color: #1e1e1e;
          font-weight: bold;
        }
        &-content {
          padding-top: 16px;
          display: flex;
          gap: 10px;
          align-items: center;
          &-button {
            padding: 6px 10px;
            border-radius: 21px;
            color: #2ec192;
            border: 1px solid #2ec192;
          }
          .active {
            background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
            color: #ffffff;
          }
        }
      }
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
}
</style>
