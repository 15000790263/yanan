<template>
  <div class="wrapper">
    <div class="title">设备编号：{{ $route.query.equipmentcode }}</div>
    <div v-if="healthType === 'temp'" class="add-item">
      <van-button color="#2CBAA4" size="small" style="padding: 0 16px" @click="addItem">
        <van-icon name="plus" />
      </van-button>
    </div>
    <div class="choose-type">
      <van-field
        v-model="healthMap[healthType]"
        label="保养类型"
        is-link
        readonly
        label-width="150"
        @click="showPup = true"
      />
    </div>

    <div v-if="healthType !== 'temp'" class="choose-date">
      <van-field v-model="upkeepcircle" label="保养周期（天）" label-width="150" />
    </div>

    <div class="header">
      <div>{{ healthType === 'temp' ? '设备名称' : '维保项目' }}</div>
      <div>维保内容</div>
    </div>

    <div class="content" :class="{ 'is-temp': healthType === 'temp' }">
      <!-- 一级保养 -->
      <van-cell-group v-if="healthType === 'dingqi'" inset>
        <template v-for="item in healthItemList">
          <div class="input-wrapper">
            <div class="inner-title">{{ item.upkeepproject }}</div>
            <div class="inner-content">
              <template v-for="v in item.contentitem">
                <van-checkbox
                  :shape="v.type === 'checkbox' ? 'square' : 'round'"
                  v-model="v.value"
                  v-if="v.type.includes('checkbox')"
                  @change="handleCheckChange($event, v, item.contentitem)"
                >
                  {{ v.label }}
                </van-checkbox>

                <van-field
                  v-model="v.value"
                  v-else-if="v.type === 'input'"
                  type="textarea"
                  label-align="top"
                  placeholder="请输入"
                  rows="1"
                  autosize
                  :label="v.label"
                ></van-field>

                <van-field
                  v-model="v.value"
                  v-else-if="v.type === 'date'"
                  label-align="top"
                  placeholder="请选择"
                  is-link
                  readonly
                  :label="v.label"
                  @click="pickTime(v)"
                ></van-field>
              </template>
            </div>
          </div>
        </template>
      </van-cell-group>
      <!-- 临时保养 -->
      <div class="temp" v-else-if="healthType === 'temp'">
        <template v-for="item in healthItemList">
          <div class="input-wrapper">
            <van-field
              v-model.trim="item.equipmentname"
              type="textarea"
              rows="1"
              autosize
              label=""
              placeholder="请输入设备名称"
              label-align="top"
            />
            <van-field
              v-model.trim="item.content"
              type="textarea"
              rows="1"
              autosize
              label=""
              placeholder="请输入保养内容"
              label-align="top"
            />
          </div>
        </template>
      </div>
    </div>
    <div class="footer">
      <div class="upload-btn" @click="handleUpload">上传文件</div>
      <div class="confirm" @click="onConfirm">确定</div>
      <div class="cancel" @click="onCancel">取消</div>
    </div>
    <van-popup v-model:show="showPup" position="bottom" :style="{ height: '20%' }">
      <div class="pop-content">
        <ul @click="typeClick">
          <li
            v-for="key in Object.keys(healthMap)"
            :class="{ active: healthType === key }"
            :key="key"
            :data-type="key"
          >
            {{ healthMap[key] }}
          </li>
        </ul>
      </div>
    </van-popup>
    <van-popup
      v-model:show="showTimePicker"
      position="bottom"
      :style="{ height: '40%' }"
      @click-overlay="isStart = false"
    >
      <van-picker-group
        title="预约日期"
        :tabs="['选择日期', '选择时间']"
        @confirm="handleClose"
        @cancel="handleCancel"
      >
        <van-date-picker v-model="currentDate" />
        <van-time-picker v-model="currentTime" />
      </van-picker-group>
    </van-popup>

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
          <div class="title">保养后照片</div>
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
    </van-popup>
  </div>
</template>

<script setup>
import { showToast, showConfirmDialog } from 'vant';
import { getHealthItem, addOneHealth, fileManage } from '@/api/device';
import dayjs from 'dayjs';
import { getUserInfo } from '../../../../utils/session';
import { getPhoto } from '../../../../utils/cordova-tools';

import { createLoading } from '../../../../utils/loading-fn';
import { commonUpload } from '@/api/system.js';

const route = useRoute();
const equipmentcode = route.query.equipmentcode;
const healthRecord = route.query.healthRecord;
const equipmentsyscode = route.query.equipmentsyscode;
const typeValue = route.query.typeValue;

const gradeMap = {
  temp: '0',
  dingqi: '2',
};

const upkeepcircle = computed(() => {
  switch (healthType.value) {
    case 'dingqi':
      return 365;
    default:
      return 30;
  }
});

const healthType = ref(healthRecord === 'temp' ? 'temp' : 'dingqi');

const healthMap = { temp: '临时保养', dingqi: '定期保养' };

const healthItemList = ref([]);

const router = useRouter();

async function getHealthItemData() {
  // 只有一级保养有配置，需要从接口获取，临时和三级直接写
  switch (healthType.value) {
    case 'dingqi':
      const res = await getHealthItem({
        equipmentClassid: typeValue,
        upkeeptype: gradeMap[healthType.value],
      });

      healthItemList.value = res.data.rows.map(item => {
        const contentitem = JSON.parse(item.contentitem);

        if (contentitem[0].type === 'checkbox1') {
          contentitem[0].value = true;
        }

        return {
          ...item,
          contentitem,
        };
      });
      break;
    case 'temp':
      healthItemList.value = [
        {
          equipmentname: '',
          content: '',
        },
      ];
      break;
    default:
      break;
  }
}

watchEffect(getHealthItemData);

async function onConfirm() {
  let contentlist;

  // 阀井保养上传照片
  if (!fileOneList.value.length || !fileTwoList.value.length) {
    return showToast('请上传文件！');
  }

  if (healthType.value === 'dingqi') {
    contentlist = healthItemList.value.map(item => {
      return {
        label: item.upkeepproject,
        option: item.contentitem,
      };
    });
  } else {
    contentlist = healthItemList.value;
  }

  // 一级保养
  let data = {
    contentlist,
    equipmentnum: equipmentcode,
    equipmenttypeid: typeValue,
    nextupkeeptime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    operator: JSON.parse(getUserInfo()).nickName,
    upkeeptype: gradeMap[healthType.value],
    upkeepcircle: upkeepcircle.value,
  };

  if (healthType.value === 'temp') {
    data.upkeepcircle = void 0;
  }

  const destroy = createLoading();

  const res = await addOneHealth({ ...data, equipmentsyscode });

  const eukId = res.data.msg;

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
      pid: eukId,
      type: 0,
      fileUrl: item.data.data.url,
      fileName: item.data.data.name,
    };
  });

  const list2 = res2.map(item => {
    return {
      pid: eukId,
      type: 2,
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

function handleCheckChange(check, v, contentitem) {
  if (!check) {
    return;
  }

  if (v.type === 'checkbox') {
    return;
  }

  contentitem.forEach(item => {
    if (item.type === 'checkbox1') {
      item.value = false;
    }
  });

  v.value = true;
}

const showPup = ref(false);

function typeClick(e) {
  showPup.value = false;
  healthType.value = e.target.dataset.type;
}

const showTimePicker = ref(false);

const currentItem = ref(null);

const isStart = ref(false);

function pickTime(item) {
  currentItem.value = item;
  showTimePicker.value = true;
}

function handleClose(rangeTime) {
  const [date, time] = rangeTime;

  if (isStart.value) {
    currentItem.value.start = date.selectedValues.join('-') + ' ' + time.selectedValues.join(':');
  } else {
    currentItem.value.end = date.selectedValues.join('-') + ' ' + time.selectedValues.join(':');
  }

  currentItem.value.value = [currentItem.value.start, currentItem.value.end];

  showTimePicker.value = false;
  currentItem.value = null;
  isStart.value = false;
}

function handleCancel() {
  showTimePicker.value = false;
  currentItem.value = null;
  isStart.value = false;
}

const currentDate = ref(dayjs().format('YYYY-MM-DD').split('-'));
const currentTime = ref(dayjs().format('HH-mm').split('-'));

function addItem() {
  healthItemList.value.push({
    equipmentname: '',
    content: '',
  });
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
  color: #34394f;

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

  .choose-type,
  .choose-date {
    height: 50px;
    margin-bottom: 12px;
    border-radius: 4px;
    overflow: hidden;
  }

  .header {
    display: flex;
    color: #00b099;
    font-weight: 600;
    height: 30px;

    > div {
      flex: 1;
    }
  }

  .content {
    height: calc(100% - 264px);
    overflow-y: scroll;

    &.is-temp {
      height: calc(100% - 202px);
    }

    .van-cell-group {
      margin: 0;
    }

    .three-health {
      background-color: #fff;
      border-radius: 4px;
      overflow: hidden;

      .van-radio-group {
        display: grid;
        row-gap: 12px;
      }
    }

    .temp {
      border-radius: 4px;
      overflow: hidden;
      background-color: #f5f5f5;
      display: grid;
      row-gap: 12px;

      .input-wrapper {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #2bb4b3;

        .van-cell {
          border-bottom: 1px solid #2bb4b355;
          border-left: 1px solid #2bb4b355;

          // &:last-child {
          //   border-bottom: none;
          // }
        }
      }
    }

    .input-wrapper {
      display: flex;
      font-size: 14px;

      .inner-title {
        width: 40%;
        padding: 10px 16px;
        border-left: 1px solid #ddd;
        border-bottom: 1px solid #ddd;

        &:first-child {
          border-left: none;
        }
      }

      &:last-child {
        > .inner-title,
        .inner-content {
          border-bottom: none;
        }
      }

      .inner-content {
        width: 60%;
        padding: 10px 16px;
        border-left: 1px solid #ddd;
        border-bottom: 1px solid #ddd;
        display: grid;
        row-gap: 12px;

        .van-cell {
          padding: 0;

          :deep(.van-cell__value) {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0 4px;
          }
        }
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

  .outer {
    padding: 24px;
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
</style>
