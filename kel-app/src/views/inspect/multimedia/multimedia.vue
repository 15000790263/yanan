<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { showToast } from 'vant';
import dayjs from 'dayjs';

import MediaItem from '../components/media-item/index.vue';
import ActionImgBtn from '../components/multimedia-btns/action-img-btn.vue';
import ActionVoiceBtn from '../components/multimedia-btns/action-voice-btn.vue';
import { mediaCacheInstance } from '../util/mediaCache';
import { getPhoto, getAudio } from '../../../utils/cordova-tools';
import { addWatermarkToImage } from '../util/image';
import { api_regulator, api_well, api_pipeline, api_station } from '@/api/inspect';

const props = defineProps({});
const emit = defineEmits([]);

// 图片尺寸限制
const imageSize = 8; // 8M

const route = useRoute();

const type = ref('edit');
const insType = ref('regulator');
const id = ref('');

const hasVoice = ref(true);

const showPhotoSheet = ref(false);

const readonly = ref(true);

const uploader = ref(null);
const AudioObj = ref(null);

const tempAlbumFileList = ref([]);

const files = ref([]);

const from = ref('');

onMounted(() => {
  const voiceType = route.query.voice;
  if (voiceType && voiceType === 'no') {
    hasVoice.value = false;
  }
  from.value = route.query.from;
  type.value = route.query.type;

  insType.value = route.query.insType;
  id.value = route.params.id;

  if (type.value == 'edit') {
    setAudio();

    // console.log('>>1', mediaCacheInstance.useCheckingItem())

    const list = mediaCacheInstance.getMediaListFromCache() ?? [];

    files.value = [...list];

    console.log('-----', mediaCacheInstance.getMediaListFromCache());
  } else {
    getDetail();
  }
});

// 三张照片
const threePictures = ['one', 'two', 'three'];
const showList = {
  regulatorList: [
    {
      name: 'one',
      title: '设备编号',
    },
    {
      name: 'two',
      title: '检测仪器浓度数值',
    },
    {
      name: 'three',
      title: '出口压力',
    },
  ],

  wellList: [
    {
      name: 'one',
      title: '设备编号',
    },
    {
      name: 'two',
      title: '检测仪器浓度数值',
    },
    {
      name: 'three',
      title: '阀井全貌',
    },
  ],

  pipelineList: [
    {
      name: 'one',
      title: '检测仪器浓度数值',
    },
    {
      name: 'two',
      title: '管线外观',
    },
    {
      name: 'three',
      title: '相邻窨井',
    },
  ],
};

const getDetail = async () => {
  let detailFn = api_regulator.getDetail;
  if (insType.value === 'well') {
    detailFn = api_well.getDetail;
  } else if (insType.value === 'pipeline') {
    detailFn = api_pipeline.getDetail;
  } else if (insType.value === 'station') {
    detailFn = api_station.getDetail;
  }

  const res = await detailFn(id.value);

  if (res.status === 200 && res.data.code === 200) {
    let data_str = res.data.data.imagePath;
    if (data_str) {
      files.value = [];
      let data_arr = data_str.split(';');
      for (let i = 0; i < data_arr.length; i++) {
        let item = data_arr[i];
        if (item) {
          const tt = threePictures.find(item => data_arr[i].includes(item));
          if (tt) {
            // 处理三张照片
            files.value.unshift({
              path: `${config.audioUrl}${item}`,
              list: showList[`${insType.value}List`],
              type: tt,
            });
          } else {
            files.value.push(`${config.audioUrl}${item}`);
          }
        }
      }
      // files.value = ;
    }
  }
};

const setAudio = async () => {
  AudioObj.value = await getAudio();
};

const handleRecordStart = () => {
  console.log('voice start...');
  console.log('开始录音obj：', AudioObj);
  AudioObj.value.startRecord();
};

const handleVoiceEnd = () => {
  console.log('voice end...');
  console.log('结束录音obj：', AudioObj);
  AudioObj.value
    .stopRecord()
    .then(result => {
      addFiles(result);
    })
    .catch(error => {
      showNotify({ type: 'warning', message: '录音失败，请重试' });
    });
};

const handlePhotoClick = () => {
  console.log('take or choose TODO');
  showPhotoSheet.value = true;
};

const selectPicType = data => {
  if (data === 'photo') {
    // 拍照
    takePhotoByCamera();
  } else {
    // 调用照片
    readonly.value = false;
    setTimeout(() => {
      uploader.value.chooseFile();
      readonly.value = true;
      showPhotoSheet.value = false;
    }, 100);
  }
};

const takePhotoByCamera = async () => {
  const blob = await getPhoto();

  if (blob) {
    // const type = 'image/jpeg';
    // const name = `photo_${dayjs().valueOf()}.jpg`;
    // const file = new File([blob], name, { type });
    // 从blob生成base64
    // const base64 = await getBase64(blob);

    // console.log('拍照：', base64);
    // const fileObj = {
    //   content: base64
    // };
    const blob2 = await addWatermark(blob);
    addFiles(blob2);
    console.log('拍照文件：', files);
  }
};
const getBase64 = blob => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = error => {
      reject(error);
    };
  });
};

// 地址
let address = window.localStorage.getItem('watermark_address') ?? '';

const addWatermark = async blob => {
  // 是不是有检查项
  let checkingItem = window.localStorage.getItem('watermark_checkingItem');
  if (checkingItem && checkingItem !== '') {
    address += `(${checkingItem})`;
  }
  // 时间
  let currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

  // 管线巡检水印只有时间
  if (from.value === 'pipeline') {
    address = void 0;
  }

  // 增加水印
  const blob2 = await addWatermarkToImage(blob, currentTime, address);
  return blob2;
};

const handleUploaderAfterRead = f => {
  console.log('after Read::', f);

  tempAlbumFileList.value = [];

  fileToBlob(f.file, async blob => {
    const blob2 = await addWatermark(blob);
    addFiles(blob2);
  });
};

const fileToBlob = (file, callback) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = e => {
    const buffer = e.target.result;
    const blob = new Blob([buffer], { type: file.type });
    callback(blob);
  };
};

const addFiles = f => {
  // 添加时间戳
  f.time = new Date();
  files.value = [...files.value, f];

  console.log('>>>', files.value);
  mediaCacheInstance.cacheMedia(files.value);
};

onBeforeUnmount(() => {
  window.localStorage.setItem('watermark_checkingItem', '');
});
</script>

<template>
  <div class="multimedia-container">
    <div v-if="type == 'edit'" class="media-list">
      <div class="media-list">
        <!-- <div style="height: 40px" v-for="i of [1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,33,]">3343</div> -->

        <media-item :data="f" :key="f?.objectUrl" v-for="f of files" type="edit" />
      </div>

      <div class="actions">
        <action-voice-btn
          v-if="hasVoice"
          @onVoiceRecordStart="handleRecordStart"
          @onVoiceRecordEnd="handleVoiceEnd"
        />
        <action-img-btn style="margin-left: 16px" @onActionClick="handlePhotoClick" />
      </div>

      <van-uploader
        v-show="false"
        v-model="tempAlbumFileList"
        ref="uploader"
        max-count="1"
        accept="image/*,audio/*"
        :max-size="imageSize * 1024 ** 2"
        :readonly="readonly"
        :preview-full-image="false"
        :after-read="handleUploaderAfterRead"
        @oversize="showToast(`文件大小不能超过 ${imageSize}Mb`)"
      >
      </van-uploader>

      <van-action-sheet
        v-model:show="showPhotoSheet"
        title="添加图片"
        :closeable="false"
        :close-on-popstate="false"
      >
        <div class="type-select-content">
          <div class="type-item" @click="selectPicType('photo')">
            <img alt="" src="../../../assets/image/emergency/warning/camera-c.png" />
            <div class="">拍照</div>
          </div>
          <div class="type-item" @click="selectPicType('album')">
            <img alt="" src="../../../assets/image/emergency/warning/album.png" />
            <div class="">相册</div>
          </div>
        </div>
      </van-action-sheet>
    </div>
    <div v-else class="media-list">
      <media-item :data="f" :key="index" v-for="(f, index) of files" type="show" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.multimedia-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  .media-list {
    flex: 1;
    overflow-y: auto;
    height: calc(100% - 98px);
  }

  .actions {
    height: 98px;
    padding: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
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
