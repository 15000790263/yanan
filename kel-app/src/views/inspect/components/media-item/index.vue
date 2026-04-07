<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { showImagePreview } from 'vant';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  type: {
    type: String,
    default: 'edit',
  },
});

// const isPicture = computed(() => {
//   // return props.data.file.type === 'image'

//   console.log(props.data)
//   return props.data?.file?.type?.include('image') || props.data?.file?.type.include('image')
// })

const isImage = str => {
  return str.indexOf('image') != -1;
};

const isAudio = str => {
  return str.indexOf('audio') != -1;
};

const emit = defineEmits([]);

const time = computed(() => {
  const t = props.data.time;
  return dayjs(t).format('YYYY-MM-DD HH:mm:ss');
});

const blobToDataURI = (blob, callback) => {
  var reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onload = function (e) {
    callback(e.target.result);
  };
};

const showData = data => {
  return URL.createObjectURL(data);
};

// 判断URL是否为图片
const isUrlImage = url => {
  var link = new URL(url);
  var path = link.pathname;
  var extension = path.split('.').pop().toLowerCase();
  var imageExtensions = ['jpg', 'jpeg', 'gif', 'png'];
  if (imageExtensions.includes(extension)) {
    return true;
  }
  return null;
};

// 通过URL获取日期
const getURLTime = url => {
  const regex = /_(\d{8})(\d{6})/; // 匹配blob_后跟8位日期和6位时间
  const match = url.match(regex);

  if (match) {
    // 将日期部分格式化为 YYYY-MM-DD
    const datePart =
      match[1].substring(0, 4) + '-' + match[1].substring(4, 6) + '-' + match[1].substring(6, 8);

    // 将时间部分格式化为 HH:MM:SS
    const timePart =
      match[2].substring(0, 2) + ':' + match[2].substring(2, 4) + ':' + match[2].substring(4, 6);

    return datePart + ' ' + timePart;
  }
  return null;
};

// 三张图
const isThreePic = computed(() => {
  return !!props.data?.path;
});

function getTitle() {
  const o = props.data.list.find(item => item.name === props.data.type);
  return o.title;
}
</script>

<template>
  <div class="media-item-container">
    <div v-if="props.type == 'edit'">
      <!-- <span class="time">{{ time }}</span> -->
      <img
        class="image"
        :src="showData(props.data)"
        v-if="isImage(props.data?.type)"
        alt=""
        @click="showImagePreview([showData(props.data)])"
      />
      <audio
        controls
        controlslist="nodownload noplaybackrate"
        height="100"
        width="100"
        v-else-if="isAudio(props.data?.type)"
      >
        <source :src="showData(props.data)" />
      </audio>
    </div>
    <div v-else>
      <span v-if="isThreePic" class="title">{{ getTitle(props.data.path) }}</span>
      <span v-else>异常</span>
      <img
        class="image"
        :src="isThreePic ? props.data.path : props.data"
        v-if="isUrlImage(isThreePic ? props.data.path : props.data)"
        alt=""
        @click="showImagePreview([isThreePic ? props.data.path : props.data])"
      />
      <audio controls controlslist="nodownload noplaybackrate" height="100" width="100" v-else>
        <source :src="props.data" />
      </audio>
    </div>
  </div>
</template>

<style lang="less" scoped>
.media-item-container {
  width: 100%;
  padding: 16px 24px;
}
.image {
  max-height: 186px;
  max-width: 100%;
}

.time {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #bbcece;
}
</style>
