<template>
  <div class="wrapper">
    <div class="outer">
      <div class="first">
        <div class="title">调压箱编号</div>
        <div class="pic">
          <van-uploader
            v-model="fileOneList"
            multiple
            accept="image/*"
            result-type="file"
            :before-read="handleUploaderBeforeRead"
            @click-upload.prevent="handleOneUpload"
          />
        </div>
      </div>
      <div class="second">
        <div class="title">气密性手持压力表照片</div>
        <div class="pic">
          <van-uploader
            v-model="fileTwoList"
            multiple
            accept="image/*"
            result-type="file"
            :before-read="handleUploaderBeforeRead"
            @click-upload.prevent="handleTwoUpload"
          />
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="confirm" @click="onConfirm">确定</div>
      <div class="cancel" @click="onCancel">取消</div>
    </div>
  </div>
</template>

<script setup>
import { showConfirmDialog, showToast } from 'vant';
import { getPhoto } from '../../../../utils/cordova-tools';
import { createLoading } from '../../../../utils/loading-fn';
import { fileManage } from '@/api/device';
import { commonUpload } from '@/api/system.js';
import config from '@/config';

const route = useRoute();
const router = useRouter();

const equipmentsyscode = route.query.equipmentsyscode;

async function onConfirm() {
  if (!fileOneList.value.length || !fileTwoList.value.length) {
    return showToast('请上传文件！');
  }

  const destroy = createLoading();

  const promises1 = fileOneList.value.map(item => {
    return commonUpload(item.file);
  });
  const promises2 = fileTwoList.value.map(item => {
    return commonUpload(item.file);
  });

  const res1 = await Promise.all(promises1);
  const res2 = await Promise.all(promises2);

  const list1 = res1.map(item => {
    return {
      pid: equipmentsyscode,
      type: 0,
      fileUrl: item.data.data.url,
      fileName: item.data.data.name,
    };
  });

  const list2 = res2.map(item => {
    return {
      pid: equipmentsyscode,
      type: 3,
      fileUrl: item.data.data.url,
      fileName: item.data.data.name,
    };
  });

  await fileManage([...list1, ...list2]);

  destroy();

  showToast('操作成功！');
  setTimeout(() => {
    router.goBack();
  }, 800);
}

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

const fileOneList = ref([]);

const fileTwoList = ref([]);

async function handleOneUpload() {
  if (window.cordova) {
    const blob = await getPhoto();
    fileOneList.value.push({
      file: blob,
      objectUrl: URL.createObjectURL(blob),
    });
  }
}

async function handleTwoUpload() {
  if (window.cordova) {
    const blob = await getPhoto();
    fileTwoList.value.push({
      file: blob,
      objectUrl: URL.createObjectURL(blob),
    });
  }
}

function fileToBlob(file, callback) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = e => {
      const buffer = e.target.result;
      const blob = new Blob([buffer], { type: file.type });
      resolve(blob);
    };
  });
}

async function handleUploaderBeforeRead(file) {
  const blob = await fileToBlob(file);
  return blob;
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;

  .outer {
    height: calc(100% - 70px);
  }

  .footer {
    margin-top: 12px;
    height: 58px;
    background-color: #fff;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .upload-btn {
      height: 34px;
      border-radius: 30px;
      background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
      display: grid;
      place-items: center;
      font-size: 16px;
      color: #ffffff;
      min-width: 25vw;
    }

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
}
</style>
