<template>
  <div class="wrapper">
    <div class="inner">
      <template v-for="(item, index) in dataList">
        <div :class="item.name">
          <div class="title">{{ item.title }}</div>
          <div class="content">
            <van-uploader
              ref="uploader"
              v-model="item.fileList"
              accept="image/*"
              :result-type="type === 'pipeline' ? 'dataUrl' : 'file'"
              :max-count="1"
              :before-read="handleUploaderBeforeRead"
              :preview-full-image="type !== 'pipeline'"
              @click-upload="handleClickUpload($event, index)"
              @click-preview="type === 'pipeline' && showImagePreview([$event.content])"
            >
              <template v-if="type === 'pipeline'" #preview-cover="{ content }">
                <div style="width: 100%; height: 100%">
                  <img style="height: 100%; width: 100%; object-fit: cover" :src="content" alt="" />
                </div>
              </template>
            </van-uploader>
          </div>
        </div>
      </template>
    </div>

    <van-action-sheet
      v-model:show="showPhotoSheet"
      title="添加图片"
      :closeable="false"
      :close-on-popstate="false"
      @click-overlay="currentIndex = -1"
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
</template>

<script setup>
import { showImagePreview } from 'vant';
import { useInspectPicStore } from '@/stores/inspect/inspect-pic';
import { getPhoto } from '../../../utils/cordova-tools';
import { addWatermarkToImage } from '@/views/inspect/util/image.js';
import { blobToBase64 } from '@/utils/tools';

const inspectPic = useInspectPicStore();

const route = useRoute();
const type = ref(route.query.type);

const dList = {
  regulatorList: [
    {
      name: 'one',
      title: '设备编号',
      fileList: [],
    },
    {
      name: 'two',
      title: '检测仪器浓度数值',
      fileList: [],
    },
    {
      name: 'three',
      title: '出口压力',
      fileList: [],
    },
  ],

  wellList: [
    {
      name: 'one',
      title: '设备编号',
      fileList: [],
    },
    {
      name: 'two',
      title: '检测仪器浓度数值',
      fileList: [],
    },
    {
      name: 'three',
      title: '阀井全貌',
      fileList: [],
    },
  ],

  pipelineList: [
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
  ],
};

const showList = ref(dList);

const dataList = computed(() => {
  return showList.value[`${type.value}List`];
});

onMounted(() => {
  showCache();
});

function showCache() {
  const cache =
    type.value !== 'pipeline' ? inspectPic.pictureCache : inspectPic.pipelinePictureCache;
  const key = `${type.value}List`;
  showList.value = { [key]: cache.length ? cache : dList[key] };
}

onBeforeUnmount(() => {
  saveCache();
});

function saveCache() {
  if (type.value !== 'pipeline') {
    inspectPic.setPictureCache(showList.value[`${type.value}List`]);
  } else {
    inspectPic.setPipelinePictureCache(showList.value['pipelineList']);
  }
}

const currentIndex = ref(-1);

function handleClickUpload(e, index) {
  if (currentIndex.value === -1) {
    e.preventDefault();
  }
  showPhotoSheet.value = true;
  currentIndex.value = index;
}

const showPhotoSheet = ref(false);

const uploader = ref(null);

function selectPicType(data) {
  if (data === 'photo') {
    // 拍照
    takePhotoByCamera();
  } else {
    // 调用照片
    uploader.value[currentIndex.value].chooseFile();
    currentIndex.value = -1;
  }
  showPhotoSheet.value = false;
}

async function addToFileList(blob) {
  const objectUrl = URL.createObjectURL(blob);
  const d = await blobToBase64(blob);
  showList.value[`${type.value}List`][currentIndex.value].fileList = [
    {
      file: blob,
      objectUrl,
      content: d,
    },
  ];

  currentIndex.value = -1;
}

const takePhotoByCamera = async () => {
  const blob = await getPhoto();
  const b = await addWatermarkToImage(blob);
  addToFileList(b);
};

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
  const b = await addWatermarkToImage(blob);
  if (type === 'pipeline') {
    const d = await blobToBase64(b);
    return d;
  }
  return b;
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  padding: 16px;

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
