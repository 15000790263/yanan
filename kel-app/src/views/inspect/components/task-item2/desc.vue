<script setup>
import navigation_btn from '../../../../assets/image/check/navigation_btn.png';
const props = defineProps({
  cardType: {
    type: String,
    default: 'uncheck',
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  needNavigation: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(['onNavClick']);

const handleClick = () => {
  emit('onNavClick');
};
</script>

<template>
  <div v-if="needNavigation" :class="['desc-wrapper', cardType]" @click.stop="handleClick">
    <span>
      {{ props.data.desc || '- -' }}
    </span>
    <!-- <van-icon color="white" name="guide-o" style="margin-left: 8px"/> -->
    <img class="navigation_btn" :src="navigation_btn" height="24" alt="" />
  </div>
  <div v-else :class="['desc-wrapper', cardType]" @click.stop="handleClick">
    <span>
      {{ props.data.desc }}
    </span>
  </div>
</template>

<style lang="less" scoped>
.desc-wrapper {
  margin-top: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 12px;
  color: #000000;
  position: relative;

  > span {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow-x: scroll;
    text-align: center;
  }
}
.navigation_btn {
  position: absolute;
  right: 0;
  filter: brightness(0.3);
}
.uncheck {
  color: #fff;
}

.good {
  color: #34394f;
}

.error {
  color: #34394f;
}
</style>
