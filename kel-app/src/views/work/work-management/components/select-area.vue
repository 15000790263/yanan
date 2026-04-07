<template>
  <van-popup
    v-model:show="showRight"
    position="right"
    teleport="#app"
    :overlay-style="{
      background: 'transparent',
    }"
  >
    <div class="pop-content">
      <ul
        v-for="(item, index) in workAreaList"
        :key="item.id"
        :class="{ active: currentArea === item.dictLabel }"
        @click="itemClick(index)"
      >
        <li class="name">{{ item.dictLabel }}</li>
        <li class="icon"></li>
      </ul>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import { watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { getWorkArea } from '../../../../api/work';

const props = defineProps(['show', 'currentArea']);
const emit = defineEmits(['update:show', 'update:currentArea']);

const { show, currentArea } = toRefs(props);

const showRight = computed({
  get() {
    return show.value;
  },
  set(val) {
    emit('update:show', val);
  },
});

const workAreaList = ref([]);

getWorkArea().then(res => {
  workAreaList.value = res.data.rows;
  workAreaList.value.unshift({ dictLabel: '全部' });
  emit('update:currentArea', res.data.rows[0].dictLabel);
});

// const currentIndex = ref(-1);

function itemClick(index) {
  // currentIndex.value = index;
  //  和设计确认，800毫秒自动关闭
  emit('update:currentArea', workAreaList.value[index].dictLabel);
  setTimeout(() => {
    showRight.value = false;
  }, 800);
}

// let timer = null;

// watch(supplierId, (val) => {
//   timer = setInterval(() => {
//     const index = supplierList.value.findIndex((item) => item.id == val);
//     currentIndex.value = index;
//     if (supplierList.value.length) {
//       clearInterval(timer);
//     }
//   }, 500);
// });

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  showRight.value = false;
  return false;
}

onBeforeRouteLeave(() => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }
});

watch(showRight, value => {
  if (value) {
    document.addEventListener('backbutton', exec, false);
  } else {
    document.removeEventListener('backbutton', exec);
  }
});
</script>

<style lang="less" scoped>
@topHeight: calc(46px + 58px + 58px);
@bottomHeight: 50px;
@popupHeight: calc(100vh - @topHeight - @bottomHeight);

.van-popup--right {
  width: 100%;
  height: @popupHeight;
  border-bottom: 1px solid #f1f5f6;
  top: calc(@popupHeight / 2 + @topHeight);
  display: flex;
  flex-direction: column;
}

.pop-content {
  flex: 1;
  padding: 16px 24px;
  display: grid;
  row-gap: 8px;
  grid-template-rows: repeat(auto-fill, 48px);
  align-items: center;
  overflow-y: scroll;

  ul {
    height: 100%;
    border-bottom: 1px solid #e7eeee;
    display: grid;
    grid-template-columns: auto 30px;
    align-content: center;
    color: #84abbb;

    > li {
      height: 24px;
    }

    &.active {
      color: #34394f;
      .icon {
        width: 24px;
        height: 24px;
        background: url('/src/assets/image/work/icon-select.png') no-repeat center/contain;
      }
    }
  }
}
</style>
