<script setup>
import { computed } from 'vue';
import icon_little_photo from '../../../../assets/image/check/icon_little_photo.png';

const props = defineProps({
  label: {
    type: String,
    default: 'title',
  },
  labelOneLine: {
    type: Boolean,
    default: false,
  },
  allowPhoto: {
    type: Boolean,
    default: false,
  },
  showPhoto: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['onPhotoClick']);

const labelSpan = computed(() => {
  return props.labelOneLine ? 24 : 8;
});

const contentSpan = computed(() => {
  return props.labelOneLine ? 24 : 16;
});

// const borderStyle = computed(() => {
//   return props.labelOneLine ? 'none' : '1px solid #E7EEEE'
// })

const isShowTakePhoto = computed(() => {
  return props.allowPhoto && props.showPhoto;
});
</script>

<template>
  <div class="line">
    <van-row :gutter="[12, 12]">
      <van-col :span="labelSpan">
        <div class="label" v-html="props.label"></div>
      </van-col>
      <van-col :span="contentSpan">
        <div class="col">
          <slot></slot>

          <div v-if="isShowTakePhoto" class="photo-inline-btn" @click="emit('onPhotoClick')">
            <img :src="icon_little_photo" width="16" height="16" />
            记录
          </div>
        </div>
      </van-col>
    </van-row>
  </div>
</template>

<style lang="less" scoped>
.line {
  margin-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e7eeee;
}

.label {
  font-size: 14px;
  color: rgb(50, 50, 51);
}

.col {
  display: flex;
  justify-content: left;
  align-items: center;
  height: 100%;

  position: relative;
  .photo-inline-btn {
    width: 60px;
    height: 28px;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);

    display: flex;
    justify-content: center;
    align-items: center;
    color: #00b099;
    font-size: 12px;
    border-radius: 30px;
    border: 1px solid #00b099;
  }
}
</style>
