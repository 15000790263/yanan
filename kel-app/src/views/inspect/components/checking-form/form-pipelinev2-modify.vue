<template>
  <div class="main-container-2" :class="{ 'is-modify': !!id }">
    <div class="card form">
      <!-- <check-item
        label="管线名称<i class='pipelineName-required' style='color: red;'>*</i>"
        :labelOneLine="true"
      >
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['pipelineName']"
            label=""
            label-align="top"
            placeholder="请输入管线名称"
            :error-message="formData['pipelineName'] ? '' : errorMessage"
          />
        </div>
      </check-item> -->
      <check-item label="作业区域" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['workAreaText']"
            label=""
            label-align="top"
            disabled
            placeholder="请输入作业区域"
          />
        </div>
      </check-item>

      <check-item label="巡检区域" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['inspectArea']"
            label=""
            placeholder="请输入巡检区域"
            label-align="top"
            maxlength="15"
            disabled
          />
        </div>
      </check-item>

      <!-- <check-item label="开始地点" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['startingAddress']"
            label=""
            placeholder="请输入开始地点"
            label-align="top"
            maxlength="15"
          />
        </div>
      </check-item> -->

      <!-- <check-item label="结束地点" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['destinationAddress']"
            label=""
            placeholder="请输入结束地点"
            label-align="top"
            maxlength="15"
          />
        </div>
      </check-item> -->
    </div>

    <div class="card">
      <ImgBtn type="editor" @onMultiBtnClick="handleMultiBtnClick" />
    </div>

    <div class="card form">
      <check-item
        labelOneLine
        label="有无漏气"
        :showPhoto="formData['blow'] !== '1'"
        @onPhotoClick="handleItemRecord('漏气')"
      >
        <div class="check-wrapper">
          <van-radio-group v-model="formData['blow']" shape="dot" direction="horizontal">
            <van-radio name="0" icon-size="16px" checked-color="#00B099">漏气</van-radio>
            <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          </van-radio-group>

          <van-stepper
            @change="val => handleStepChangeForItem('blow', val)"
            :before-change="beforeChange('漏气')"
            min="0"
            v-model="stepValueBlow"
            step="1"
            disable-input
          />
        </div>
      </check-item>

      <check-item
        label="有无施工"
        labelOneLine
        :showPhoto="formData['construction'] !== '1'"
        @onPhotoClick="handleItemRecord('施工')"
      >
        <div class="check-wrapper">
          <van-radio-group v-model="formData['construction']" shape="dot" direction="horizontal">
            <van-radio name="0" icon-size="16px" checked-color="#00B099">施工</van-radio>
            <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          </van-radio-group>

          <van-stepper
            @change="val => handleStepChangeForItem('construction', val)"
            :before-change="beforeChange('施工')"
            min="0"
            v-model="stepValueConstruction"
            step="1"
            disable-input
          />
        </div>
      </check-item>

      <check-item
        label="有无占压"
        labelOneLine
        :showPhoto="formData['occupy'] !== '1'"
        @onPhotoClick="handleItemRecord('占压')"
      >
        <div class="check-wrapper">
          <van-radio-group v-model="formData['occupy']" shape="dot" direction="horizontal">
            <van-radio name="0" icon-size="16px" checked-color="#00B099">占压</van-radio>
            <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          </van-radio-group>

          <van-stepper
            @change="val => handleStepChangeForItem('occupy', val)"
            :before-change="beforeChange('占压')"
            min="0"
            v-model="stepValueOccupy"
            step="1"
            disable-input
          />
        </div>
      </check-item>

      <check-item label="问题说明" :labelOneLine="true">
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

      <check-item label="处理结果" :labelOneLine="true">
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
      </check-item>
    </div>

    <div class="card btns">
      <van-row gutter="16" justify="space-around">
        <van-col span="8">
          <van-button @click="handleCancel" size="small" block round type="success"
            >取消</van-button
          >
        </van-col>
        <van-col span="8">
          <van-button @click="handleConfirm" size="small" block round type="success" color="#FF6A00"
            >确定</van-button
          >
        </van-col>
      </van-row>
    </div>
  </div>
</template>
<script setup>
import { ref, onBeforeUnmount, onMounted } from 'vue';
import { showSuccessToast, showFailToast, showConfirmDialog, showToast } from 'vant';
import { useRouter } from 'vue-router';

import CheckItem from '../check-item-common/index.vue';
import { api_pipeline, getStaffs } from '@/api/inspect';
import { mediaCacheInstance } from '../../util/mediaCache';
import { getUserInfo } from '../../../../utils/session';
import { getDictType } from '../../../../api/device';
import { getBackgroundLocation, getAllLocation, getPhoto } from '@/utils/cordova-tools';
import { useBarrage } from '@/utils/barrage';
import { setIsInspect, clearIsInspect } from '../../../../utils/session';
import { useLocationStore } from '../../../../stores/inspect/location';
import { addWatermarkToImage } from '../../util/image';
import dayjs from 'dayjs';
import { systemStore } from '@/stores/system.js';
import { getLoc } from '../../util/location';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { useInspectPicStore } from '@/stores/inspect/inspect-pic';
import { createLoading } from '../../../../utils/loading-fn';
import { blobToBase64, base64ToBlob } from '@/utils/tools';
import config from '../../../../config';

const inspectPic = useInspectPicStore();

const router = useRouter();
const route = useRoute();

const sysStore = systemStore();

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const id = route.query.pipelineId;

onMounted(async () => {
  // 修改
  if (id) {
    const res = await api_pipeline.getDetail(id);
    formData.value = res.data.data;
    formData.value.workAreaText =
      sysStore.workArea.find(item => item.dictValue === formData.value.workArea)?.dictLabel || '';

    checkErrorArr.value = JSON.parse(formData.value.annormalPoint);

    checkErrorArr.value.forEach(item => {
      const type = item.label;
      let current =
        type === '漏气' ? stepValueBlow : type === '施工' ? stepValueConstruction : stepValueOccupy;
      current.value++;
    });

    initPics();
  }
});

// 三张照片
const threePictures = ['one', 'two', 'three'];

// 编辑时初始化三张照片
async function initPics() {
  if (!inspectPic.pipelinePictureCache.length) {
    //   // 修改，处理三张图片
    const promises = formData.value.imagePath
      .split(';')
      .filter(item => {
        const index = threePictures.findIndex(value => item?.includes(value));
        return index !== -1;
      })
      .map(async item => {
        return (await fetch(`${config.fileUrl}${item}`)).blob();
      });

    const blobs = await Promise.all(promises);

    const pipelineList = [
      {
        name: 'one',
        title: '检测仪器浓度数值',
        fileList: [],
      },
      {
        name: 'two',
        title: '管线外观',
        fileList: [],
      },
      {
        name: 'three',
        title: '相邻窨井',
        fileList: [],
      },
    ];

    for (const index in pipelineList) {
      if (blobs[index]) {
        const d = await blobToBase64(blobs[index]);
        const objectUrl = URL.createObjectURL(blobs[index]);
        pipelineList[index].fileList = [
          {
            content: d,
            file: blobs[index],
            objectUrl,
          },
        ];
      }
    }

    inspectPic.setPipelinePictureCache(pipelineList);
  }
}

const initForm = {
  blow: '1',
  construction: '1',
  occupy: '1',
  inspectArea: '',
  startingAddress: '',
  destinationAddress: '',

  pipelineName: '',
  problemDescp: '',
  result: '',
  workArea: '',
  workAreaText: JSON.parse(getUserInfo()).dept.deptName,
};

getDictType('work_area').then(res => {
  const r = res.data.rows.find(item => item.dictLabel === JSON.parse(getUserInfo()).dept.deptName);
  if (r) {
    formData.value.workArea = r.dictValue;
  }
});

const fileBlobs = [];

const formData = ref({ ...initForm });

function getPatrolStatus(data) {
  let isOk = true;
  const keys = Object.keys(data);

  const keyA = ['blow', 'construction', 'occupy'];

  const index = keys.findIndex(item => {
    if (keyA.includes(item)) {
      return +data[item] === 0;
    }
    return false;
  });

  isOk = index === -1;

  return {
    patrolStatus: isOk ? 1 : 2,
  };
}

// 最后提交结果
const handleConfirm = async () => {
  // if (!formData.value['pipelineName']) {
  //   errorMessage.value = '必填项不能为空';
  //   document.querySelector('.pipelineName-required').scrollIntoView();
  //   return;
  // }

  // 必填的三张图片
  const pictureCache = inspectPic.pipelinePictureCache;

  if (!pictureCache.length) {
    showToast('请添加图片必填项');
    return;
  } else {
    const index = pictureCache
      .filter(item => item.name !== 'three')
      .findIndex(item => !item.fileList.length);
    if (index !== -1) {
      showToast('请添加图片必填项');
      return;
    }
  }

  showConfirmDialog({
    title: '提示',
    message: '确定完成修改吗？',
  })
    .then(async () => {
      const destroy = createLoading('数据上传中，请稍等', { duration: 30000 });

      // 拼写就是错的
      let annormalPoint = {
        annormalPoint: checkErrorArr.value.length > 0 ? JSON.stringify(checkErrorArr.value) : '[]',
      };

      const pathArr =
        formData.value.imagePath
          ?.split(';')
          .filter(Boolean)
          .filter(item => {
            // 过滤掉三张照片
            const index = threePictures.findIndex(value => item.includes(value));
            return index === -1;
          }) || [];

      if (pathArr.length) {
        const promises = pathArr.map(async item => {
          return (await fetch(`${config.fileUrl}${item}`)).blob();
        });

        const blobs = await Promise.all(promises);
        const oldFiles = blobs.map((item, index) => {
          return {
            picBlob: item,
            name: pathArr[index].split('_')[0],
          };
        });

        fileBlobs.unshift(...oldFiles);
      }

      const pics = await Promise.all(
        pictureCache.map(async item => {
          if (item.fileList[0]) {
            const blob = await base64ToBlob(item.fileList[0].content, 'image/png');
            item.fileList[0].file = blob;
          }
          return item;
        })
      );

      const res = await api_pipeline.putCheckForm(
        {
          ...props.data,
          ...formData.value,
          ...getPatrolStatus(formData.value),
          ...annormalPoint,
          id,
        },
        fileBlobs,
        pics
      );

      destroy();
      if (res.status === 200 && res.data.code === 200) {
        showSuccessToast(res.data.msg);
        setTimeout(() => {
          router.goBack();
        }, 800);
        return;
      }
      showFailToast('提交失败');
    })
    .catch(() => {
      // on cancel
    });
};

const handleCancel = () => {
  showConfirmDialog({
    title: '提示',
    message: '数据未保存，确定取消吗？',
  })
    .then(() => {
      router.goBack();
    })
    .catch(() => {
      // on cancel
    });
};

onBeforeUnmount(() => {});

onBeforeRouteLeave(to => {
  // 进入拍照页面不清除
  if (!(to.path === '/inspect/add-picture')) {
    inspectPic.clearPipelinePictureCache();
  }
});

const handleItemRecord = checkingStr => {
  window.localStorage.setItem('watermark_checkingItem', checkingStr);
  mediaCacheInstance.cacheCheckingItem(checkingStr);
};

function getPicture() {
  return new Promise(resolve => {
    showConfirmDialog({
      title: '提示',
      message: '是否需要添加照片？',
    })
      .then(async () => {
        const blob = await getPhoto();
        if (blob) {
          const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          const blob2 = await addWatermarkToImage(blob, currentTime);
          resolve(blob2);
        }
      })
      .catch(() => {
        resolve('');
      });
  });
  // return 'pic的base64';
}

const checkErrorArr = ref([]);
const stepValueBlow = ref(0);
const stepValueConstruction = ref(0);
const stepValueOccupy = ref(0);

function beforeChange(type) {
  const currentValue =
    type === '漏气'
      ? stepValueBlow.value
      : type === '施工'
        ? stepValueConstruction.value
        : stepValueOccupy.value;

  return async value => {
    if (value > currentValue) {
      // 新增异常点
      // 添加照片
      const picBlob = await getPicture();
      const name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;
      if (picBlob) {
        fileBlobs.push({ picBlob, name });
      }

      const { longitude: x, latitude: y } = await getLoc();
      checkErrorArr.value.push({
        label: type,
        x,
        y,
        picName: name,
      });
      return true;
    }
    return new Promise(resolve => {
      // 删除
      showConfirmDialog({
        title: '提示',
        message: '确定要删除最近一个异常巡检点吗？',
      })
        .then(() => {
          // 这里减的时候需要删除之前的照片，是个bug，暂时未暴露，先不处理
          if (checkErrorArr.value.length > 0) {
            // 移除最后一个checkErrorArr
            checkErrorArr.value.pop();
          }
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };
}

const handleStepChangeForItem = (type, val) => {
  if (formData.value[type]) {
    formData.value[type] = val > 0 ? '0' : '1';
  }
};

const errorMessage = ref('');

const handleMultiBtnClick = async () => {
  localStorage.setItem('detailType', 'pipeline');
  router.push(`/inspect/add-picture?type=pipeline`);
};
</script>

<style lang="less" scoped>
.main-container-2 {
  position: relative;
  padding-bottom: 60px;
  height: calc(100% - 113px);
  overflow-y: scroll;
}

.card {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: white;
  overflow-y: auto;
  overflow-x: hidden;
}

.btns {
  position: fixed;
  bottom: 50px;
  width: 100%;
}

.input-container {
  border-radius: 4px;
  opacity: 1;
  background: rgba(68, 116, 121, 0.1);
  border: 1px solid #e7eeee;
  width: 100%;

  :deep(.van-field) {
    // background-color: transparent;
  }
}
.empty {
  height: 32px;
}

.check-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .van-radio-group {
    pointer-events: none;
  }
}

:deep(.van-loading) {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}

.is-modify {
  position: fixed;
  top: 46px;
  left: 0;
  right: 0;
  height: calc(100vh - 40px);
  z-index: 9;
  background-color: #f7fafa;

  .btns {
    bottom: 0;
  }
}
</style>
