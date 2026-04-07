<template>
  <div class="inspect-pitfall-edit wrapper">
    <div class="list-wrapper">
      <van-form ref="form" required @submit="processPitfall">
        <van-button class="button" type="success" size="mini" @click="searchInfo">
          查看隐患详情
        </van-button>
        <van-cell-group inset>
          <!--     隐患状态       -->
          <van-field
            v-model="data.StateName"
            is-link
            readonly
            colon
            label="隐患状态"
            @click="showStatus = true"
            :rules="[{ required: true, message: '请选择隐患状态' }]"
          />
          <van-popup v-model:show="showStatus" round position="bottom">
            <van-picker
              :columns="option"
              @confirm="pickerStatusConfirm"
              @cancel="showStatus = false"
            />
          </van-popup>
          <!--     处理人     -->
          <van-field
            v-model="data.ProcessPerson"
            is-link
            readonly
            colon
            label="处理人"
            @click="showUser = true"
            :rules="[{ required: true, message: '请选择处理人' }]"
          />
          <van-popup v-model:show="showUser" round position="bottom">
            <van-picker
              :columns="userList"
              :columns-field-names="userNames"
              @confirm="pickerUserConfirm"
              @cancel="showUser = false"
            />
          </van-popup>
          <!--     处理人电话       -->
          <van-field
            v-model="data.FindTel"
            readonly
            colon
            label="处理人电话"
            :rules="[{ required: true, message: '请选择处理人' }]"
          />
          <!--     处理结果       -->
          <van-field
            v-model="data.ProcessRemark"
            type="textarea"
            colon
            rows="2"
            label="处理结果"
            :rules="[{ required: true, message: '请填写处理结果' }]"
          />

          <van-uploader
            class="upload-body"
            v-model="imgList"
            ref="uploader"
            :readonly="readonly"
            @click-upload="showType = true"
            @click-preview="() => {}"
          />
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
        </van-cell-group>
      </van-form>
    </div>
    <div class="footer">
      <van-button round type="success" color="#FF6A00" @click="form.submit()">处理</van-button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router';
import { ref } from 'vue';
import { addPitfallApi, addPitfallPicApi, getYhUser, processPitfallPicApi } from '@/api/pitfall';
import { showConfirmDialog, showDialog, showToast } from 'vant';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import useUserStore from '../../../../stores/user';

const userStore = useUserStore(); // nickName: userStore.nickName,

const route = useRoute();
const router = useRouter();
const form = ref(null);

const source = ref(JSON.parse(route.query.data));
const data = ref({});

const option = [
  { text: '作废', value: '3' },
  { text: '处理完成', value: '4' },
];

const userNames = { text: 'EMPLOYEENAME', value: 'EMPLOYEETEL', children: 'children' };
const showUser = ref(false);
const userList = ref([]);

const showStatus = ref(false);

const uploader = ref(null);
const imgList = ref([]);
const readonly = ref(true);
const showType = ref(false);

onMounted(() => {
  getYhUser().then(res => {
    userList.value = res.data.responseModelList[0].dataTable.stringRowsMaps;
  });

  // 人员默认当前登录
  data.value.ProcessPerson = userStore.nickName;
  data.value.FindTel = userStore.name;
});

function searchInfo() {
  router.push({
    path: '/inspect/inspect-pitfall-detail',
    query: {
      data: JSON.stringify(source.value),
    },
  });
}

function pickerStatusConfirm({ selectedOptions }) {
  data.value.StateName = selectedOptions[0].text;
  data.value.State = selectedOptions[0].value;
  showStatus.value = false;
}

function pickerUserConfirm({ selectedOptions }) {
  data.value.ProcessPerson = selectedOptions[0].EMPLOYEENAME;
  data.value.FindTel = selectedOptions[0].EMPLOYEETEL;
  showUser.value = false;
}

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
        url: 'data:image/jpeg;base64,' + url,
        isImage: true,
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
      destinationType: Camera.DestinationType.DATA_URL,
    }
  );
}

function processPitfall() {
  showConfirmDialog({
    title: '确认',
    message: '确认处理当前隐患？',
  })
    .then(() => {
      const d = {
        ...data.value,
        ID: source.value.ID,
        ProcessID: uuidv4(),
        ProcessDate: dayjs().format('YYYY-MM-DD HH:mm'),
      };
      processPitfallPicApi(d).then(res => {
        if (res.data.errcode === 0) {
          showToast('操作成功');
          setTimeout(() => {
            router.goBack();
          }, 500);
          imgList.value.forEach(item => {
            let str = '';
            let name = '';
            if (item.url) {
              str = item.url.split('base64,')[1];
              name =
                dayjs().format('YYYYMMDD') +
                Math.random().toString(16).substr(2).padEnd(6, '0') +
                '.jpg';
            } else if (item.file) {
              str = item.content.split('base64,')[1];
              name = item.file.name;
            }

            addPitfallPicApi({
              ID: d.ID,
              ProcessID: uuidv4(),
              picName: name,
              fileString: str,
              receiveType: '2',
            });
          });
        } else {
          showDialog({
            title: '错误',
            // message: res.data.data.errmsg,
            message: '提交失败，请重试！',
          });
        }
      });
    })
    .catch(() => {
      // on cancel
    });
}
</script>

<style lang="less" scoped>
.inspect-pitfall-edit {
  height: 100%;
  width: 100%;
  padding: 14px;
  .list-wrapper {
    height: calc(100% - 40px);
    overflow: auto;
    .button {
      margin-left: 20px;
    }
    .upload-body {
      margin: 10px 0 0 10px;
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
  .footer {
    height: 56px;
    display: grid;
    place-items: center;
    padding: 0 24px;
    width: 100vw;
    margin-left: -14px;

    .van-button {
      height: 32px;
      font-size: 12px;
      width: 100%;
    }
  }
}
</style>
