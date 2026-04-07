<template>
  <van-popup v-model:show="showRight" position="right" :overlay="false">
    <van-nav-bar
      class="index-view"
      title="新增作业计划"
      left-arrow
      @click-left="showRight = false"
    />
    <div class="pop-content">
      <ul
        v-for="(item, index) in supplierList"
        :key="item.id"
        :class="{ active: currentIndex === index }"
        @click="itemClick(index)"
      >
        <li class="name">{{ item.enterpriseName }}</li>
        <li class="icon"></li>
      </ul>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import { getSupplierWorkList } from '../../../../../api/work';
import { watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const props = defineProps(['show', 'supplierName']);
const emit = defineEmits(['update:show', 'update:supplierName']);

const { show, supplierName } = toRefs(props);

const showRight = computed({
  get() {
    return show.value;
  },
  set(val) {
    emit('update:show', val);
  },
});

const supplierList = ref([]);

getSupplierWorkList().then(res => {
  supplierList.value = res.data.rows;
});

const currentIndex = ref(-1);

function itemClick(index) {
  if (currentIndex.value !== index) {
    currentIndex.value = index;
    //  和设计确认，800毫秒自动关闭
    setTimeout(() => {
      // emit('update:supplierId', supplierList.value[index].id);
      emit('update:supplierName', supplierList.value[index].enterpriseName);
      showRight.value = false;
    }, 800);
  } else {
    currentIndex.value = -1;
    setTimeout(() => {
      // emit('update:supplierId', '');
      emit('update:supplierName', '');
      showRight.value = false;
    }, 800);
  }
}

let timer = null;

watch(supplierName, val => {
  clearInterval(timer);
  timer = setInterval(() => {
    const index = supplierList.value.findIndex(item => item.enterpriseName == val);
    currentIndex.value = index;
    if (supplierList.value.length) {
      clearInterval(timer);
    }
  }, 500);
});

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
.van-popup--right {
  width: 100%;
  height: 100vh;
  border-bottom: 1px solid #f1f5f6;
  top: 50%;
  display: flex;
  flex-direction: column;

  .index-view {
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    :deep(.van-nav-bar__content) {
      .van-haptics-feedback {
        .van-badge__wrapper {
          color: #fff;
        }
      }
      .van-nav-bar__title {
        color: #fff;
      }
    }
  }
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
