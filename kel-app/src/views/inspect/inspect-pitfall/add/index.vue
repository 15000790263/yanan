<template>
  <div class="wrapper">
    <div class="list-wrapper">
      <van-form ref="form" required @submit="addPitfall">
        <van-cell-group inset>
          <!--        <div class="item">-->
          <!--              &lt;!&ndash;     隐患状态       &ndash;&gt;-->
          <!--              <van-field-->
          <!--                v-model="data.State"-->
          <!--                is-link-->
          <!--                readonly-->
          <!--                colon-->
          <!--                label="隐患状态"-->
          <!--                @click="showStatus = true"-->
          <!--                />-->
          <!--                <van-popup v-model:show="showStatus" round position="bottom">-->
          <!--                  <van-picker-->
          <!--                    :columns="dict.dictMap['yinhuan']"-->
          <!--                    :columns-field-names="columnNames"-->
          <!--                    @confirm="pickerStatusConfirm"-->
          <!--                    @cancel="showStatus = false"-->
          <!--                  />-->
          <!--                </van-popup>-->
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--      隐患等级      -->
          <van-field
            v-model="data.FaultGrade"
            is-link
            readonly
            colon
            label="隐患等级"
            @click="showGrade = true"
            :rules="[{ required: true, message: '请选择隐患等级' }]"
          />
          <van-popup v-model:show="showGrade" round position="bottom">
            <van-picker
              :columns="grade"
              @confirm="pickerGradeConfirm"
              @cancel="showGrade = false"
            />
          </van-popup>
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--      设备类型      -->
          <van-field
            v-model="data.EquipmentTypeID"
            is-link
            readonly
            colon
            label="设备类型"
            @click="showEquipmentType = true"
            :rules="[{ required: true, message: '请选择设备类型' }]"
          />
          <van-popup v-model:show="showEquipmentType" round position="bottom">
            <van-picker
              :columns="dict.dictMap['yinhuan']"
              :columns-field-names="columnNames"
              @confirm="pickerEquipmentTypeConfirm"
              @cancel="showEquipmentType = false"
            />
          </van-popup>
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     隐患类型       -->
          <van-field
            v-model="data.FaultTypeID"
            is-link
            readonly
            colon
            label="隐患类型"
            @click="showFaultType = true"
            :rules="[{ required: true, message: '请选择隐患类型' }]"
          />
          <van-popup v-model:show="showFaultType" round position="bottom">
            <van-picker
              :columns="faultType"
              :columns-field-names="columnNames"
              @confirm="pickerFaultTypeConfirm"
              @cancel="showFaultType = false"
            />
          </van-popup>
          <!--        </div>-->
          <!--        <div class="item button">-->
          <van-button class="button" type="success" size="mini" @click="getLocal">
            获取当前位置
          </van-button>
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     经度       -->
          <van-field
            v-model="data.Longitude"
            readonly
            colon
            label="经度"
            :rules="[{ required: true, message: '请获取当前位置' }]"
          />
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     维度       -->
          <van-field
            v-model="data.Latitude"
            readonly
            colon
            label="维度"
            :rules="[{ required: true, message: '请获取当前位置' }]"
          />
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     地址       -->
          <van-field
            v-model="data.Address"
            readonly
            colon
            label="地址"
            :rules="[{ required: true, message: '请获取当前位置' }]"
          />
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     发现人     -->
          <van-field
            v-model="data.Reporter"
            is-link
            readonly
            colon
            label="发现人"
            @click="showUser = true"
            :rules="[{ required: true, message: '请选择发现人' }]"
          />
          <van-popup v-model:show="showUser" round position="bottom">
            <van-picker
              :columns="userList"
              :columns-field-names="userNames"
              @confirm="pickerUserConfirm"
              @cancel="showUser = false"
            />
          </van-popup>
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     发现人电话       -->
          <van-field
            v-model="data.FindTel"
            readonly
            colon
            label="发现人电话"
            :rules="[{ required: true, message: '请选择发现人' }]"
          />
          <!--        </div>-->
          <!--        <div class="item">-->
          <!--     隐患描述       -->
          <van-field
            v-model="data.FaultDesc"
            type="textarea"
            colon
            rows="2"
            label="隐患描述"
            :rules="[{ required: true, message: '请填写隐患描述' }]"
          />
          <!--        </div>-->
          <!--        <div class="item">-->
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
          <!--        </div>-->
        </van-cell-group>
      </van-form>
    </div>
    <div class="footer">
      <van-button round type="success" color="#FF6A00" @click="form.submit()">新增</van-button>
    </div>
  </div>
</template>

<script setup>
import config from '../../../../config';
import { showConfirmDialog, showDialog, showToast } from 'vant';
import { v4 as uuidv4 } from 'uuid';
import { addPitfallApi, addPitfallPicApi, getYhUser } from '@/api/pitfall';
import { systemStore } from '@/stores/system';
import { getLocation } from '@/utils/cordova-tools.js';
import SceneReporting from '@/views/emergency/emergency/scene-reporting.vue';
import dayjs from 'dayjs';
import useUserStore from '../../../../stores/user';

const userStore = useUserStore(); // nickName: userStore.nickName,

const router = useRouter();
const route = useRoute();

const source = route.query.source;

const dict = systemStore();

// 传值参数
const formData = ref({
  ID: uuidv4(),
  // State: '',
  // Address: '',
  // Longitude: '',
  // Latitude: '',
  // FindTel: '',
  // FindDate: '',
  // FaultGrade: '',
  // EquipmentTypeID: '',
  // FaultTypeName: '',
  // FaultDesc: '',
  // ProcessTel: '',
  // ProcessDate: '',
  // ProcessRemark: '',
});

// 显示参数
const data = ref({
  ID: uuidv4(),
});

const list = [
  {
    title: '隐患状态',
    field: 'State',
  },
  {
    title: '隐患等级',
    field: 'FaultGrade',
  },
  {
    title: '设备类型',
    field: 'EquipmentTypeID',
  },
  {
    title: '隐患类型',
    field: 'FaultTypeID',
  },
  {
    title: '隐患描述',
    field: 'FaultDesc',
  },
  {
    title: '隐患处理内容',
    field: 'ProcessRemark',
  },
];

const columnNames = { text: 'dictLabel', value: 'dictValue', children: 'children' };
const userNames = { text: 'EMPLOYEENAME', value: 'EMPLOYEETEL', children: 'children' };

const showStatus = ref(false);
const showGrade = ref(false);
const showEquipmentType = ref(false);
const showFaultType = ref(false);
const showUser = ref(false);

const grade = [
  {
    text: '一般隐患',
    value: '一般隐患',
  },
  {
    text: '重大隐患',
    value: '重大隐患',
  },
];

const faultType = ref([]);
const userList = ref([]);

const uploader = ref(null);
const imgList = ref([]);
const readonly = ref(true);
const showType = ref(false);

const form = ref(null);

onMounted(() => {
  faultType.value = dict.dictMap[dict.dictMap['yinhuan'][0].dictValue];
  formData.value.EquipmentTypeID = dict.dictMap['yinhuan'][0].dictValue;
  data.value.EquipmentTypeID = dict.dictMap['yinhuan'][0].dictLabel;
  getYhUser().then(res => {
    userList.value = res.data.responseModelList[0].dataTable.stringRowsMaps;
  });

  // 人员默认当前登录
  data.value.Reporter = userStore.nickName;
  formData.value.FindTel = userStore.name;
  data.value.FindTel = userStore.name;

  // 从巡检跳过来
  switch (source) {
    case 'pipeline':
      const item1 = dict.dictMap['yinhuan'].find(i => i.dictLabel === '埋地管线');
      formData.value.EquipmentTypeID = item1.dictValue;
      data.value.EquipmentTypeID = item1.dictLabel;
      faultType.value = dict.dictMap[item1.dictValue];
      formData.value.FaultTypeID = '';
      data.value.FaultTypeID = '';
      break;
    case 'regulator':
      const item2 = dict.dictMap['yinhuan'].find(i => i.dictLabel === '调压柜、箱');
      formData.value.EquipmentTypeID = item2.dictValue;
      data.value.EquipmentTypeID = item2.dictLabel;
      faultType.value = dict.dictMap[item2.dictValue];
      formData.value.FaultTypeID = '';
      data.value.FaultTypeID = '';
      break;
    case 'well':
      const item3 = dict.dictMap['yinhuan'].find(i => i.dictLabel === '阀井');
      formData.value.EquipmentTypeID = item3.dictValue;
      data.value.EquipmentTypeID = item3.dictLabel;
      faultType.value = dict.dictMap[item3.dictValue];
      formData.value.FaultTypeID = '';
      data.value.FaultTypeID = '';
      break;
    case 'station':
      const item4 = dict.dictMap['yinhuan'].find(i => i.dictLabel === '调压柜、箱');
      formData.value.EquipmentTypeID = item4.dictValue;
      data.value.EquipmentTypeID = item4.dictLabel;
      faultType.value = dict.dictMap[item4.dictValue];
      formData.value.FaultTypeID = '';
      data.value.FaultTypeID = '';
      break;
    default:
      break;
  }
});

function pickerStatusConfirm({ selectedOptions }) {
  formData.value.State = selectedOptions[0].dictValue;
  data.value.State = selectedOptions[0].dictLabel;
  showStatus.value = false;
}
function pickerGradeConfirm({ selectedOptions }) {
  formData.value.FaultGrade = selectedOptions[0].value;
  data.value.FaultGrade = selectedOptions[0].text;
  showGrade.value = false;
}
function pickerEquipmentTypeConfirm({ selectedOptions }) {
  formData.value.EquipmentTypeID = selectedOptions[0].dictValue;
  data.value.EquipmentTypeID = selectedOptions[0].dictLabel;
  faultType.value = dict.dictMap[selectedOptions[0].dictValue];
  formData.value.FaultTypeID = '';
  data.value.FaultTypeID = '';
  showEquipmentType.value = false;
}
function pickerFaultTypeConfirm({ selectedOptions }) {
  formData.value.FaultTypeID = selectedOptions[0].dictValue;
  data.value.FaultTypeID = selectedOptions[0].dictLabel;
  showFaultType.value = false;
}

function pickerUserConfirm({ selectedOptions }) {
  data.value.Reporter = selectedOptions[0].EMPLOYEENAME;

  formData.value.FindTel = selectedOptions[0].EMPLOYEETEL;
  data.value.FindTel = selectedOptions[0].EMPLOYEETEL;
  showUser.value = false;
}

function getLocal() {
  getLocation().then(res => {
    const { longitude, latitude, address } = res;
    formData.value.Longitude = longitude;
    data.value.Longitude = longitude;
    formData.value.Latitude = latitude;
    data.value.Latitude = latitude;
    formData.value.Address = address + '';
    data.value.Address = address + '';
  });
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

function addPitfall() {
  showConfirmDialog({
    title: '确认',
    message: '确认提交当前隐患？',
  })
    .then(() => {
      const d = Object.assign(
        JSON.parse(JSON.stringify(data.value)),
        JSON.parse(JSON.stringify(formData.value))
      );
      addPitfallApi({
        ...d,
        FindDate: dayjs().format('YYYY-MM-DD HH:mm'),
      }).then(res => {
        if (res.data.errcode === 0) {
          showToast('操作成功');
          setTimeout(() => {
            if (source === 'regulator' || source === 'well') {
              router.goBack(-2);
            } else {
              router.goBack();
            }
          }, 800);
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
              ProcessID: '',
              picName: name,
              FindTel: d.FindTel,
              fileString: str,
              receiveType: '1',
            });
          });
        } else {
          showDialog({
            title: '错误',
            message: res.data.errmsg || '提交失败，请重试！',
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
.wrapper {
  height: 100%;
  width: 100%;
  padding: 14px;

  .list-wrapper {
    height: calc(100% - 40px);
    overflow: auto;

    .van-cell-group {
      height: 100%;
      overflow-y: scroll;
      margin: 0;
    }
    .item {
      border: 1px solid red;
    }
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
