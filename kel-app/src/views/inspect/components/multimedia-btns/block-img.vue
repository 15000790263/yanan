<script setup>
import MultimediaBigImg from '../../../../assets/image/check/multimedia-big-img.png';
import MultimediaBigImgShow from '../../../../assets/image/check/multimedia-big-img-show.png';

// const props = defineProps({

// });

const props = defineProps({
  type: {
    type: String,
    default: 'editor',
  },
});

const emit = defineEmits(['onMultiBtnClick']);
</script>

<template>
  <div class="big-img-container" @click="emit('onMultiBtnClick')">
    <slot>
      <img
        :src="props.type == 'editor' ? MultimediaBigImg : MultimediaBigImgShow"
        width="327"
        height="64"
      />
    </slot>
  </div>
</template>

<style lang="less" scoped>
.big-img-container {
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
