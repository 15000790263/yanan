<script setup>
import { computed, ref } from 'vue';

// import icon_right from '../../../../assets/image/check/icon_right.png'
import bg_card_error from '../../../../assets/image/check/bg_card_error.png';
import bg_card_good from '../../../../assets/image/check/bg_card_good.png';

import icon_trans_to from '../../../../assets/image/check/icon_trans_from.png';
import icon_trans_from from '../../../../assets/image/check/icon_trans_to.png';
import icon_arrows_white from '../../../../assets/image/check/icon_arrows_white.png';

import ItemTitle from './title.vue';
import ItemTime from './time.vue';
import ItemDivider from './divider.vue';
import ItemDesc from './desc.vue';

const props = defineProps({
  title: {
    type: String,
    default: 'title',
  },
  desc: {
    type: String,
    default: 'desc',
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
    default: false,
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

const emit = defineEmits(['onItemClick', 'onNavigation']);

const handleClick = () => {
  emit('onItemClick', props.data);
};

const handleNav = () => {
  emit('onNavigation');
};

const from = computed(() => {
  const str = props.data.delegateDescription ?? '';
  return str.split(',')[0] ?? '';
});

const to = computed(() => {
  const str = props.data.delegateDescription ?? '';
  return str.split(',')[1] ?? '';
});

const time = computed(() => {
  return (props.data.updateTime ?? '').split(' ')?.[0];
});
</script>

<template>
  <div class="task-item-container" :style="cardBgStyle" @click="handleClick">
    <item-title :card-type="cardType" :title="props.title" />

    <div class="trans-info">
      <div class="from-to">
        <div class="item">
          <img :src="icon_trans_from" width="34" height="34" />
          <span class="text">{{ from }}</span>
        </div>

        <div class="time">
          <img class="arrow" :src="icon_arrows_white" width="54" height="12" />
          <span class="time-text">{{ time }}转</span>
        </div>

        <div class="item">
          <img :src="icon_trans_to" width="34" height="34" />
          <span class="text">{{ to }}</span>
        </div>
      </div>

      <div class="status">
        <van-icon name="passed" />

        <div class="tag">转派成功</div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.task-item-container {
  margin: 8px 12px;
  padding: 8px 14px;
  box-shadow: 0px 3px 4px 0px rgba(11, 23, 31, 0.1);
  border-radius: 4px;
  position: relative;

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

  .trans-info {
    margin: 12px 0px;
    display: flex;
    align-items: center;

    .time {
      position: relative;
      margin: 0px 28px;
      display: flex;
      align-items: center;
      flex-direction: column;

      .time-text {
        position: absolute;
        width: 90px;
        bottom: -24px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
      }
    }

    .from-to {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 70%;

      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .text {
        margin-top: 8px;
        font-size: 14px;
        color: white;
      }
    }

    .status {
      width: 30%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 32px;

      .tag {
        margin-top: 10px;
        width: 80px;
        height: 28px;
        border-radius: 30px;
        opacity: 1;
        border: 1px solid #d7fafd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
    }
  }
}
</style>
