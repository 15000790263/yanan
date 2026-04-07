<script setup>
import { computed } from 'vue';

// import icon_right from '../../../../assets/image/check/icon_right.png'
import bg_card_error from '../../../../assets/image/check/bg_card_error.png';
import bg_card_good from '../../../../assets/image/check/bg_card_good.png';

import ItemTitle from './title.vue';
import ItemTime from './time.vue';
import ItemDivider from './divider.vue';
import ItemDesc from './desc.vue';

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  desc: {
    type: String,
    default: '',
  },
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
  isTransItem: {
    type: Boolean,
    default: false,
  },
  needNavigation: {
    type: Boolean,
    default: true,
  },
  transIdList: {
    type: Array,
    default: () => [],
  },
});

// uncheck good error
const cardType = computed(() => {
  switch (+props.data.patrolStatus) {
    case 0:
      return 'uncheck';
    case 1:
      return 'good';
    case 2:
      return 'error';
    default:
      return 'uncheck';
  }
});

const cardBgStyle = computed(() => {
  switch (cardType.value) {
    case 'uncheck':
      return {
        background: `linear-gradient(180deg, #2EC192 0%, #25A0E2 100%)`,
      };
    case 'good':
      return {
        backgroundImage: `url(${bg_card_good})`,
      };
    case 'error':
      return {
        backgroundImage: `url(${bg_card_error})`,
      };
    default:
      return bg_card_error;
  }
});

const emit = defineEmits(['onItemClick', 'onNavigation', 'onLongPress']);

const handleClick = () => {
  emit('onItemClick', props.data);
};

const handleNav = () => {
  emit('onNavigation');
};

function longPress() {
  emit('onLongPress');
}
</script>

<template>
  <div
    class="task-item-container"
    :style="cardBgStyle"
    @click="handleClick"
    :class="{ 'is-pass': props.data.state === '1' }"
    v-long-press="() => longPress()"
  >
    <item-title :card-type="cardType" :title="props.title" />
    <item-time :card-type="cardType" :data="data" v-bind="$attrs" />
    <item-divider :card-type="cardType" />
    <item-desc
      @onNavClick="handleNav"
      :needNavigation="needNavigation"
      :data="props.data"
      :card-type="cardType"
    />

    <template v-if="props.transIdList.length">
      <van-icon
        v-if="props.transIdList.includes(props.data.id)"
        class="check-trans"
        name="checked"
        size="40px"
        color="#FF3700"
      />
      <van-icon v-else class="check-trans" name="passed" size="40px" color="#666" />
    </template>
  </div>
</template>

<style lang="less" scoped>
.task-item-container {
  margin: 8px 12px;
  padding: 8px 14px;
  box-shadow: 0px 3px 4px 0px rgba(11, 23, 31, 0.1);
  border-radius: 4px;
  position: relative;
  overflow: hidden;

  background-position: center center;
  /* 背景图不平铺 */
  background-repeat: no-repeat;
  /* 当内容高度大于图片高度时，背景图像的位置相对于viewport固定 */
  // background-attachment: fixed;
  /* 让背景图基于容器大小伸缩 */
  background-size: 100% 100%;

  .content-container {
    background-color: transparent;
    z-index: 1;
  }

  &.is-pass::before {
    position: absolute;
    left: -45px;
    top: -20px;
    content: '已确认';
    background-color: #ff6200;
    color: #fff;
    width: 100px;
    text-align: center;
    transform: rotateZ(-45deg);
    transform-origin: center;
    padding-top: 30px;
    padding-bottom: 5px;
    font-size: 12px;
  }

  .check-trans {
    position: absolute;
    left: 30px;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 50%;
    backdrop-filter: blur(2px);
  }
}
</style>
