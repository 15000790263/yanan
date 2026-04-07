<template>
  <div class="wrapper">
    <div class="title">
      {{
        $route.query.equipmentcode !== 'undefined'
          ? $route.query.equipmentcode
          : $route.query.equipmentsyscode
      }}
    </div>
    <div class="add-item">
      <van-button color="#2CBAA4" size="small" style="padding: 0 16px" @click="addItem">
        <van-icon name="plus" />
      </van-button>
    </div>

    <div
      class="user"
      style="margin-bottom: 16px; border-radius: 8px; overflow: hidden; border: 1px solid #2bb4b3"
    >
      <van-field
        v-model="operator"
        label="维修人"
        placeholder=""
        label-align="top"
        readonly
        is-link
        @click="showPup = true"
      />
    </div>

    <div class="content">
      <van-cell-group inset>
        <template v-for="(item, index) in formData" :key="index">
          <div class="input-wrapper" v-long-press="() => handleLongPress(index)">
            <van-field
              v-model.trim="item.equipmentname"
              type="textarea"
              rows="1"
              autosize
              label="设备名称"
              placeholder="请输入设备名称"
              label-align="top"
            />
            <van-field
              v-model.trim="item.content"
              type="textarea"
              rows="1"
              autosize
              label="维检内容"
              placeholder="请输入维检内容"
              label-align="top"
            />
            <van-field
              v-model="item.operationtime"
              label="维检时间"
              placeholder="请选择"
              label-align="top"
              readonly
              is-link
              @click="pickTime(item)"
            />
          </div>
        </template>
      </van-cell-group>
    </div>
    <div class="footer">
      <!-- 调压箱和阀井维修 -->
      <div
        v-if="equipmenttypeid === '5001' || equipmenttypeid === '5010'"
        class="upload-btn"
        @click="handleUpload"
      >
        上传文件
      </div>
      <div class="confirm" @click="onConfirm">确定</div>
      <div class="cancel" @click="onCancel">取消</div>
    </div>

    <van-popup v-model:show="showPup" position="bottom" :style="{ height: '30%' }">
      <div class="pop-content">
        <ul @click="personClick">
          <li
            :class="{ active: operator.includes(item.nickName) }"
            v-for="item in deptPersonList"
            :key="item.deptId"
          >
            {{ item.nickName }}
          </li>
        </ul>
      </div>
    </van-popup>
    <van-calendar v-model:show="showTimePicker" @confirm="handleClose" />
    <van-popup
      v-model:show="showRight"
      position="right"
      closeable
      :style="{ width: '100%', height: '100%' }"
      @closed="handleClosed"
    >
      <div class="outer">
        <div class="first">
          <div class="title">设备编号</div>
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
          <div class="title">维修前照片</div>
          <div class="pic">
            <van-uploader
              ref="uploaderTwoRef"
              v-model="fileTwoList"
              multiple
              accept="image/*"
              result-type="file"
              :before-read="handleUploaderBeforeRead"
              @click-upload="handleTwoUpload"
            />
          </div>
        </div>
        <div class="second">
          <div class="title">作业照片</div>
          <div class="pic">
            <van-uploader
              ref="uploaderFourRef"
              v-model="fileFourList"
              multiple
              accept="image/*"
              result-type="file"
              :before-read="handleUploaderBeforeRead"
              @click-upload="handleFourUpload"
            />
          </div>
        </div>
        <div class="second">
          <div class="title">维修后照片</div>
          <div class="pic">
            <van-uploader
              v-model="fileThreeList"
              multiple
              accept="image/*"
              result-type="file"
              :before-read="handleUploaderBeforeRead"
              @click-upload.prevent="handleThreeUpload"
            />
          </div>
        </div>
      </div>
    </van-popup>

    <van-action-sheet
      v-model:show="showPhotoSheet"
      title="添加图片"
      :closeable="false"
      :close-on-popstate="false"
    >
      <!-- @click-overlay="showPhotoSheet.value = false" -->
      <div class="type-select-content">
        <div class="type-item" @click="selectPicType('photo')">
          <img alt="" src="~@/assets/image/emergency/warning/camera-c.png" />
          <div class="">拍照</div>
        </div>
        <div class="type-item" @click="selectPicType('album')">
          <img alt="" src="~@/assets/image/emergency/warning/album.png" />
          <div class="">相册</div>
        </div>
      </div>
    </van-action-sheet>
  </div>
</template>

<script setup>
import { showToast, showConfirmDialog } from 'vant';
import { getUserInfo } from '../../../../utils/session';
import { getUserByDeptId } from '@/api/work';
import dayjs from 'dayjs';
import { repairTYZ, fileManage } from '@/api/device';
import { getPhoto } from '../../../../utils/cordova-tools';

import { commonUpload } from '@/api/system.js';
import { createLoading } from '../../../../utils/loading-fn';

const route = useRoute();
const equipmentcode = route.query.equipmentcode;
const equipmenttype = route.query.equipmenttype;
const equipmenttypeid = route.query.equipmenttypeid;
const equipmentsyscode = route.query.equipmentsyscode;

const showPhotoSheet = ref(false);

const operator = ref(JSON.parse(getUserInfo()).nickName);

const showPup = ref(false);
const deptPersonList = ref([]);

function getDeptPersonList() {
  getUserByDeptId(JSON.parse(getUserInfo()).deptId).then(res => {
    deptPersonList.value = res.data.rows;
  });
}

getDeptPersonList();

const formData = ref([
  {
    equipmentname: '',
    content: '',
    operationtime: dayjs().format('YYYY-MM-DD'),
    operator: computed(() => operator.value),
  },
]);

function addItem() {
  formData.value.push({
    equipmentname: '',
    content: '',
    operationtime: dayjs().format('YYYY-MM-DD'),
    operator: computed(() => operator.value),
  });
}

const router = useRouter();

async function onConfirm() {
  // 目前只做了调压箱和阀井维修上传照片
  if (equipmenttypeid === '5001' || equipmenttypeid === '5010') {
    if (
      !fileOneList.value.length ||
      !fileTwoList.value.length ||
      !fileThreeList.value.length ||
      !fileFourList.value.length
    ) {
      return showToast('请上传文件！');
    }
  }

  const destroy = createLoading();

  const data = {
    equipmentcode,
    equipmenttype,
    equipmenttypeid,
    equipmentsyscode,
    list: formData.value,
  };

  console.log(data);

  const res = await repairTYZ(data);

  if (equipmenttypeid === '5001' || equipmenttypeid === '5010') {
    const id = res.data.msg;

    const promises0 = fileOneList.value.map(item => {
      return commonUpload(item.file);
    });

    const promises1 = fileTwoList.value.map(item => {
      return commonUpload(item.file);
    });

    const promises2 = fileThreeList.value.map(item => {
      return commonUpload(item.file);
    });

    const promises3 = fileFourList.value.map(item => {
      return commonUpload(item.file);
    });

    const res0 = await Promise.all(promises0);
    const res1 = await Promise.all(promises1);
    const res2 = await Promise.all(promises2);
    const res3 = await Promise.all(promises3);

    const list0 = res0.map(item => {
      return {
        pid: id,
        type: 0,
        fileUrl: item.data.data.url,
        fileName: item.data.data.name,
      };
    });
    const list1 = res1.map(item => {
      return {
        pid: id,
        type: 1,
        fileUrl: item.data.data.url,
        fileName: item.data.data.name,
      };
    });

    const list2 = res2.map(item => {
      return {
        pid: id,
        type: 2,
        fileUrl: item.data.data.url,
        fileName: item.data.data.name,
      };
    });

    const list3 = res3.map(item => {
      return {
        pid: id,
        type: 3,
        fileUrl: item.data.data.url,
        fileName: item.data.data.name,
      };
    });

    await fileManage([...list0, ...list1, ...list2, ...list3]);
  }
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

function personClick(e) {
  showPup.value = false;
  if (JSON.parse(getUserInfo()).nickName !== e.target.innerHTML) {
    if (operator.value.includes(e.target.innerHTML)) {
      const nameArr = operator.value.split('，');
      const index = nameArr.findIndex(item => item === e.target.innerHTML);
      nameArr.splice(index, 1);
      operator.value = nameArr.join('，');
      return;
    }
    operator.value = operator.value + '，' + e.target.innerHTML;
  }
}

const showTimePicker = ref(false);

const currentItem = ref(null);

function pickTime(item) {
  currentItem.value = item;
  showTimePicker.value = true;
}

function handleClose(time) {
  currentItem.value.operationtime = dayjs(time).format('YYYY-MM-DD');
  showTimePicker.value = false;
  currentItem.value = null;
}

const showRight = ref(false);

let removeGuard;

// 文件上床
function handleUpload() {
  showRight.value = true;
  removeGuard = router.beforeEach(() => {
    return false;
  });
}

function handleClosed() {
  removeGuard && removeGuard();
}

const fileOneList = ref([]);

const fileTwoList = ref([]);

const fileThreeList = ref([]);

// 中
const fileFourList = ref([]);

async function handleOneUpload() {
  if (window.cordova) {
    const blob = await getPhoto();
    fileOneList.value.push({
      file: blob,
      objectUrl: URL.createObjectURL(blob),
    });
  }
}

const currentIndex = ref(-1);

const uploaderTwoRef = ref(null);

function handleTwoUpload(e) {
  currentIndex.value = 2;
  if (!showPhotoSheet.value) {
    e.preventDefault();
  }

  showPhotoSheet.value = true;
}

async function selectPicType(data) {
  if (currentIndex.value === 2) {
    if (data === 'photo') {
      // 拍照
      if (window.cordova) {
        const blob = await getPhoto();
        fileTwoList.value.push({
          file: blob,
          objectUrl: URL.createObjectURL(blob),
        });
      }
    } else {
      // 调用照片
      uploaderTwoRef.value.chooseFile();
    }
  } else if (currentIndex.value === 4) {
    if (data === 'photo') {
      // 拍照
      if (window.cordova) {
        const blob = await getPhoto();
        fileFourList.value.push({
          file: blob,
          objectUrl: URL.createObjectURL(blob),
        });
      }
    } else {
      // 调用照片
      uploaderFourRef.value.chooseFile();
    }
  }

  showPhotoSheet.value = false;
}

async function handleThreeUpload() {
  if (window.cordova) {
    const blob = await getPhoto();
    fileThreeList.value.push({
      file: blob,
      objectUrl: URL.createObjectURL(blob),
    });
  }
}

const uploaderFourRef = ref(null);
function handleFourUpload(e) {
  currentIndex.value = 4;
  if (!showPhotoSheet.value) {
    e.preventDefault();
  }

  showPhotoSheet.value = true;
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

function handleLongPress(index) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该项吗？',
  })
    .then(() => {
      formData.value.splice(index, 1);
    })
    .catch(() => {
      // on cancel
    });
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;

  .title {
    height: 40px;
    color: #34394f;
    font-weight: 600;
  }

  .add-item {
    position: fixed;
    top: 60px;
    right: 15px;
  }

  .content {
    height: calc(100% - 200px);
    overflow-y: scroll;

    .van-cell-group {
      margin: 0;

      display: grid;
      row-gap: 16px;
      background-color: #f5f5f5;

      .input-wrapper {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #2bb4b3;

        .van-cell {
          border-bottom: 1px solid #2bb4b355;

          &:last-child {
            border-bottom: none;
          }
        }

        // .van-cell {
        //   border-left: 1px solid #ddd;
        //   border-bottom: 1px solid #ddd;

        //   &:first-child {
        //     border-left: none;
        //   }
        // }

        // &:last-child > .van-cell {
        //   border-bottom: none;
        // }
      }
    }
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
      width: 100px;
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
      width: 100px;
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

  .pop-content {
    width: 100%;
    height: 100%;
    padding: 20px 0;

    ul {
      height: 100%;
      overflow-y: scroll;

      > li {
        line-height: 40px;
        width: 100%;
        text-align: center;
        color: #666;
        font-size: 14px;

        &.active {
          background-color: #8cb1ea;
          color: #fff;
        }
      }
    }
  }

  .outer {
    padding: 24px;
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
