<script setup>
import { ref } from 'vue';
// import icon_action_photo from '../../../../assets/image/check/icon_action_photo.png'
import icon_action_voice from '../../../../assets/image/check/icon_action_voice.png';
import icon_voice_waving from '../../../../assets/image/check/icon_voice_waving.png';

const isVoiceRecording = ref(false);

const emit = defineEmits(['onVoiceRecordStart', 'onVoiceRecordEnd']);

const handleTouchStart = e => {
  e.preventDefault();
  emit('onVoiceRecordStart');
  isVoiceRecording.value = true;
};

const handleTouchEnd = e => {
  e.preventDefault();
  emit('onVoiceRecordEnd');
  isVoiceRecording.value = false;
};
</script>

<template>
  <div class="action-btn-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
    <img v-show="!isVoiceRecording" :src="icon_action_voice" width="24" height="24" />
    <div v-show="!isVoiceRecording" class="text">长按说话</div>
    <img v-show="isVoiceRecording" :src="icon_voice_waving" width="74" height="16" />
  </div>
</template>

<style lang="less" scoped>
.action-btn-container {
  width: 140px;
  height: 70px;
  border-radius: 4px;
  background: #f7fdfd;
  border: 1px solid #bbcece;
  color: #84abbb;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .text {
    font-size: 14px;
  }
}
</style>
