<script setup>
import { showSuccessToast, showFailToast, showToast, showConfirmDialog } from 'vant';
import { useRouter } from 'vue-router';
import BasicInfo from '../device-detail/basic-info.vue';
import CheckItem from '../check-item-common/index.vue';
import ImgBtn from '../multimedia-btns/block-img.vue';

import { api_yinbao, getStaffs } from '@/api/inspect';
import { mediaCacheInstance } from '../../util/mediaCache';

import { useInspectPicStore } from '@/stores/inspect/inspect-pic';

import { useRegulatorStore } from '@/stores/inspect/regulator';
import { getIsInspect } from '../../../../utils/session';
import { createLoading } from '../../../../utils/loading-fn';
import config from '../../../../config';
import { getUserByDeptId } from '@/api/work';
import { getUserInfo } from '../../../../utils/session';

const regulatorStore = useRegulatorStore();

// const inspectPic = useInspectPicStore();

const router = useRouter();
const route = useRoute();
const attrs = useAttrs();

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  staffs: {
    type: Array,
    default: () => {
      return [];
    },
  },
  canFormConfirm: {
    type: Boolean,
    default: true,
  },
});

const formData = ref({
  electric: '', // 电表数值
  resiElectric: '', // 有无锈蚀
  oilCheck: '1', // 井盖/井圈是否破损
  temperature: '', // 井盖标识是否老化/丢失
  inVoltage: '', // 有无井内堆积杂物
  outVoltage: '', // 阀井是否被占压
  outElectric: '', // 阀井是否积水
  electrode: '', // 补偿器是否正常
  potentStatus: '1', // 补偿器是否正常
  runMode: '', // 补偿器是否正常
  practicalPerson: JSON.parse(getUserInfo()).nickName, // 实际负责人

  remark: '',
});

// const staffs = ref([])

const showPicker = ref(false);

// const getStaffList = async () => {
//   const res = await getStaffs()
//   if (res.status === 200 && res.data.code === 200) {
//     staffs.value = res.data.rows.map(item => ({
//       text: item.name,
//       value: item.userId
//     }))
//   }
// }

const onStaffPickerConfirm = ({ selectedOptions }) => {
  showPicker.value = false;
  delegatePersonName.value = selectedOptions[0].text;
  delegatePersonId.value = selectedOptions[0].value;
};

onMounted(() => {
  // getStaffList()
});

const showTransDialog = ref(false);

const delegatePersonName = ref('');
const delegatePersonId = ref('');

const getFileBlobs = async () => {
  const files = mediaCacheInstance.getMediaListFromCache();

  const fileBlobs = [];
  if (files?.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // const blob = await file2Blob(file)
      fileBlobs.push(file);
    }
  }

  return fileBlobs;
};

function getPatrolStatus(data) {
  // console.log('------', data);
  let isOk = true;
  // const keys = Object.keys(data);
  // for (const key of keys) {
  //   if (key === 'result' || key === 'problemDescp' || data[key] === '') continue;
  //   const value = +data[key];
  //   if (value === 0) {
  //     isOk = false;
  //     break;
  //   }
  // }

  if (data.oilCheck === '0' || data.potentStatus === '0') {
    isOk = false;
  }

  return {
    patrolStatus: isOk ? 1 : 2,
  };
}

const handleConfirm = async () => {
  if (editHistory.value) {
    if (!formData.value.remark) {
      return showToast('必填项不能为空');
    }
  }

  // 必填的三张图片
  // const pictureCache = inspectPic.pictureCache;

  // if (!pictureCache.length) {
  //   showToast('请添加图片必填项');
  //   return;
  // } else {
  //   const index = pictureCache.findIndex(item => !item.fileList.length);
  //   if (index !== -1) {
  //     showToast('请添加图片必填项');
  //     return;
  //   }
  // }

  const { longitude: lon, latitude: lat } = attrs.location ?? {};

  const params = {
    ...props.data,
    ...formData.value,
    ...getPatrolStatus(formData.value),
    lon,
    lat,
  };

  // let fileBlobs = await getFileBlobs();

  if (editHistory.value) {
    // 这里只处理下图片吧，语音暂不处理（经测试，语音也被处理了）
    // if (props.data.imagePath) {
    //   const promises = props.data.imagePath
    //     .split(';')
    //     .filter(Boolean)
    //     .filter(item => {
    //       // 过滤掉三张照片
    //       const index = threePictures.findIndex(value => item.includes(value));
    //       return index === -1;
    //     })
    //     .map(async item => {
    //       return (await fetch(`${config.fileUrl}${item}`)).blob();
    //     });
    //   const blobs = await Promise.all(promises);
    //   fileBlobs.unshift(...blobs);
    // }
  }
  const destroy = createLoading('数据上传中，请稍等', { duration: 30000 });
  const res = await api_yinbao.putCheckForm(params).finally(() => {
    destroy();
  });

  const id = props.data.id;

  if (res.status === 200 && res.data.code === 200) {
    // const isInspect = getIsInspect();
    // if (isInspect) {
    //   if (!regulatorStore.wellIdList.includes(id)) {
    //     regulatorStore.setWellIdList(id);
    //   }
    // }

    // 异常加入隐患系统
    // if (getPatrolStatus(formData.value).patrolStatus === 2) {
    //   showConfirmDialog({
    //     title: '提示',
    //     message: '本次巡检结果存在异常，是否加入隐患系统？',
    //   })
    //     .then(() => {
    //       router.push('/inspect/inspect-pitfall-add?source=yinbao');
    //     })
    //     .catch(() => {
    //       router.goBack();
    //     });
    // } else {
    showSuccessToast(res.data.msg);
    setTimeout(() => {
      router.goBack();
    }, 800);
    // }

    // mediaCacheInstance.clear();
  } else {
    showFailToast('提交失败');
  }
};

const handleTrans = () => {
  showTransDialog.value = true;
};

const handleClickTransConfirm = async () => {
  const res = await api_yinbao.transTaskAnother(
    props.data.id,
    delegatePersonName.value,
    delegatePersonId.value
  );
  if (res.status === 200 && res.data.code === 200) {
    showSuccessToast(res.data.msg);
    setTimeout(() => {
      router.goBack();
    }, 800);
    return;
  }
};

const handleCancel = () => {
  router.goBack();
};

const isNameEmpty = computed(() => {
  return delegatePersonName.value === '';
});

const hasError = computed(() => {
  const { patrolStatus } = getPatrolStatus(formData.value);
  return patrolStatus !== 1;
});

const handleMultiBtnClick = () => {
  router.push(`/inspect/add-picture?type=well`);
};

const handleItemRecord = checkingStr => {
  window.localStorage.setItem('watermark_checkingItem', checkingStr);
  mediaCacheInstance.cacheCheckingItem(checkingStr);
  router.push(`/inspect/multimedia/${props.data.id}?type=edit`);
};

const editHistory = computed(() => route.query.fromHistory);

// 三张照片
const threePictures = ['one', 'two', 'three'];

// 编辑时初始化三张照片
// async function initPics() {
//   if (editHistory.value) {
//     if (!inspectPic.pictureCache.length) {
//       //   // 修改，处理三张图片
//       const promises = props.data.imagePath
//         .split(';')
//         .filter(item => {
//           const index = threePictures.findIndex(value => item?.includes(value));
//           return index !== -1;
//         })
//         .map(async item => {
//           return (await fetch(`${config.fileUrl}${item}`)).blob();
//         });

//       const blobs = await Promise.all(promises);

//       const wellList = [
//         {
//           name: 'one',
//           title: '设备编号',
//           fileList: [],
//         },
//         {
//           name: 'two',
//           title: '检测仪器浓度数值',
//           fileList: [],
//         },
//         {
//           name: 'three',
//           title: '阀井全貌',
//           fileList: [],
//         },
//       ];

//       wellList.forEach((item, index) => {
//         const objectUrl = URL.createObjectURL(blobs[index]);
//         item.fileList = [
//           {
//             file: blobs[index],
//             objectUrl,
//           },
//         ];
//       });

//       inspectPic.setPictureCache(wellList);
//     }
//   }
// }

watch(
  () => props.data,
  v => {
    // formData.value = v;
    const o = formData.value;
    Object.keys(o).forEach(key => {
      if (v[key]) {
        o[key] = v[key];
      }
    });
    // if (v.imagePath) {
    // initPics();
    // }
  },
  {
    immediate: true,
  }
);

const showPup2 = ref(false);
const deptPersonList = ref([]);

function getDeptPersonList() {
  getUserByDeptId(JSON.parse(getUserInfo()).deptId).then(res => {
    deptPersonList.value = res.data.rows;
  });
}

getDeptPersonList();

function personClick(e) {
  showPup2.value = false;
  if (JSON.parse(getUserInfo()).nickName !== e.target.innerHTML) {
    if (formData.value['practicalPerson'].includes(e.target.innerHTML)) {
      formData.value['practicalPerson'] = formData.value['practicalPerson'].split('，').shift();
      return;
    }
    formData.value['practicalPerson'] =
      JSON.parse(getUserInfo()).nickName + '，' + e.target.innerHTML;
  }
}
</script>

<template>
  <div class="main-container">
    <van-dialog
      @confirm="handleClickTransConfirm"
      v-model:show="showTransDialog"
      :confirm-button-disabled="isNameEmpty"
      title="请输入转派人员姓名"
      show-cancel-button
    >
      <van-cell-group inset>
        <van-field
          is-link
          v-model="delegatePersonName"
          label="姓名"
          placeholder="请选择姓名"
          @click="showPicker = true"
        />
      </van-cell-group>
    </van-dialog>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :columns="staffs" @cancel="showPicker = false" @confirm="onStaffPickerConfirm" />
    </van-popup>
    <div class="card">
      <basic-info type="yinbao" :data="props.data" v-bind="$attrs">
        <template #icon>
          <div>
            <div
              style="
                background-color: #2ab1b8;
                padding: 2px 10px;
                color: #fff;
                border-radius: 4px;
                margin-left: -10px;
                margin-bottom: 10px;
              "
              @click="$emit('refresh')"
            >
              重新定位
            </div>
            <div
              style="
                background-color: #2ab1b8;
                padding: 2px 10px;
                color: #fff;
                border-radius: 4px;
                margin-left: -10px;
              "
              @click="$router.push(`/inspect/inspect-trail?loc=true`)"
            >
              查看位置
            </div>
          </div>
        </template>
      </basic-info>
    </div>

    <!-- <div class="card">
      <ImgBtn type="editor" @onMultiBtnClick="handleMultiBtnClick" />
    </div> -->

    <div class="card">
      <check-item label="电表数值" :showPhoto="formData['leakageStatus'] !== '1'">
        <!-- <van-cell-group inset> -->
        <van-field v-model.trim="formData.electric" label="" placeholder="请输入电表数值" />
        <!-- </van-cell-group> -->
      </check-item>

      <check-item
        label="剩余电流"
        :showPhoto="formData['rust'] !== '1'"
        @onPhotoClick="handleItemRecord('锈蚀')"
      >
        <van-field v-model.trim="formData.resiElectric" label="" placeholder="请输入剩余电流" />
      </check-item>

      <check-item
        label="油位"
        :showPhoto="formData['wellDamage'] !== '1'"
        @onPhotoClick="handleItemRecord('井盖/井圈破损')"
      >
        <van-radio-group v-model="formData['oilCheck']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">异常</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="温度"
        :showPhoto="formData['circleDamage'] !== '1'"
        @onPhotoClick="handleItemRecord('标识老化/丢失')"
      >
        <van-field v-model.trim="formData.temperature" label="" placeholder="请输入温度" />
      </check-item>

      <check-item
        label="输入电压(V)"
        :showPhoto="formData['wellItems'] !== '1'"
        @onPhotoClick="handleItemRecord('井内堆积杂物')"
      >
        <van-field v-model.trim="formData.inVoltage" label="" placeholder="请输入输入电压" />
      </check-item>

      <check-item
        label="输出电压(V)"
        :showPhoto="formData['wellOccupy'] !== '1'"
        @onPhotoClick="handleItemRecord('阀井被占压')"
      >
        <van-field v-model.trim="formData.outVoltage" label="" placeholder="请输入输出电压" />
      </check-item>

      <check-item
        label="输出电流(A)"
        :showPhoto="formData['wellWater'] !== '1'"
        @onPhotoClick="handleItemRecord('阀井积水')"
      >
        <van-field v-model.trim="formData.outElectric" label="" placeholder="请输入输出电流" />
      </check-item>

      <check-item
        label="电极"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-field v-model.trim="formData.electrode" label="" placeholder="请输入电极" />
      </check-item>

      <check-item
        label="阴保井状况"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-radio-group v-model="formData['potentStatus']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">损坏</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">无损坏</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="运行模式"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-field v-model.trim="formData.runMode" label="" placeholder="请输入运行模式" />
      </check-item>

      <check-item
        label="检查人"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <!-- <van-field v-model.trim="formData.practicalPerson" label="" placeholder="请输入检查人" /> -->

        <van-field
          border
          v-model.trim="formData['practicalPerson']"
          label=""
          readonly
          label-align="top"
          placeholder="请输入"
          @click="showPup2 = true"
        />
      </check-item>

      <!-- <check-item v-if="hasError" label="问题说明" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['problemDescp']"
            label=""
            placeholder="请输入问题说明"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>

      <check-item v-if="hasError" label="处理结果" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['result']"
            label=""
            placeholder="请输入问题说明"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item> -->

      <check-item label="备注" :labelOneLine="true">
        <div class="input-container" :class="{ required: editHistory }">
          <van-field
            border
            v-model.trim="formData['remark']"
            label=""
            placeholder="请输入备注"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>
    </div>

    <div class="card">
      <van-row gutter="16" justify="space-around">
        <van-col v-if="!editHistory" span="8">
          <van-button @click="handleTrans" size="small" plain block round type="success"
            >转派</van-button
          >
        </van-col>
        <van-col span="8">
          <van-button @click="handleCancel" size="small" block round type="success"
            >取消</van-button
          >
        </van-col>
        <van-col span="8">
          <van-button
            :disabled="!canFormConfirm"
            @click="handleConfirm"
            size="small"
            block
            round
            type="success"
            color="#FF6A00"
            >确定</van-button
          >
        </van-col>
      </van-row>
    </div>
    <div class="empty"></div>

    <van-popup v-model:show="showPup2" position="bottom" :style="{ height: '30%' }">
      <div class="pop-content">
        <ul>
          <li
            :class="{ active: formData['practicalPerson'].includes(item.nickName) }"
            v-for="item in deptPersonList"
            :key="item.deptId"
            @click="personClick"
          >
            {{ item.nickName }}
          </li>
        </ul>
      </div>
    </van-popup>
  </div>
</template>

<style lang="less" scoped>
.main-container {
  // 有问题
  height: calc(100vh - 48px - 58px - 52px);
  overflow-y: auto;
}

.card {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: white;

  :deep(.van-field) {
    background-color: transparent;
    padding: 0;
  }
}

.input-container {
  border-radius: 4px;
  opacity: 1;
  background: rgba(68, 116, 121, 0.1);
  border: 1px solid #e7eeee;
  width: 100%;
  padding: 5px 12px;

  :deep(.van-field) {
    background-color: transparent;
  }

  &.required::before {
    content: '*';
    position: absolute;
    color: #f00;
    top: -18px;
    left: 35px;
    font-family: math;
  }
}
.empty {
  height: 32px;
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
      &.disabled {
        color: #ddd;
      }
    }
  }
}
</style>
