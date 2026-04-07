<template>
  <van-popup v-model:show="showRight" position="right" :overlay="false">
    <van-nav-bar
      class="index-view"
      title="新增作业计划"
      left-arrow
      @click-left="showRight = false"
    />
    <div class="pop-content">
      <van-tabs
        v-model:active="active"
        title-active-color="#34394F"
        title-inactive-color="#84ABBB"
        color="linear-gradient(180deg, #FFFFFF 0%, #DCECF3 100%)"
        background="#E7EEEE"
        line-height="0"
        animated
      >
        <van-tab title-style="fontSize: 14px" title="高危">
          <ul
            v-for="(item, index) in jobTypesList"
            :key="item.formId"
            :class="{ active: currentIndexes.has(index) }"
            @click="itemClick(index)"
          >
            <li>{{ item.name }}</li>
            <li class="icon"></li>
          </ul>
        </van-tab>
        <van-tab title-style="fontSize: 14px" title="一般"> </van-tab>
      </van-tabs>
    </div>

    <div class="footer">
      <van-button type="primary" @click="confirm">确定</van-button>
      <van-button type="primary" @click="cancel">取消</van-button>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import { getWorkType } from '../../../../../api/work';
import { watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const props = defineProps(['show', 'type', 'jobs']);
const emit = defineEmits(['update:show', 'update:type', 'update:jobs']);

const { show, jobs } = toRefs(props);
// 数据回显
watch(
  jobs,
  value => {
    value.forEach(item => {
      const index = jobTypesList.value.findIndex(i => i.formId === item.formId);
      index !== -1 && currentIndexes.value.add(index);
    });
  },
  { deep: true }
);

watch(show, val => {
  if (val) {
    if (props.type) {
      active.value = props.type === '高危作业计划' ? 0 : 1;
    }
  }
});

const currentIndexes = ref(new Set());

const showRight = computed({
  get() {
    return show.value;
  },
  set(val) {
    emit('update:show', val);
  },
});

const active = ref(0);

const planTypes = ['高危作业计划', '一般作业计划'];

const jobTypesList = ref([]);

// 获取高危作业数据
getWorkType().then(res => {
  const { records } = res.data.data;
  const arr = [
    '临时用电安全作业',
    '有限空间安全作业',
    '断路安全作业',
    '高处安全作业',
    '挖掘动土安全作业',
    '盲板抽堵安全作业',
    '吊装安全作业',
    '动火安全作业',
  ];
  jobTypesList.value = records.filter(item => arr.includes(item.name));
});

function itemClick(index) {
  if (currentIndexes.value.has(index)) {
    currentIndexes.value.delete(index);
  } else {
    currentIndexes.value.add(index);
  }
}

// 确定操作
function confirm() {
  emit('update:type', planTypes[active.value]);
  const arr = jobTypesList.value.filter((item, index) => currentIndexes.value.has(index));
  emit('update:jobs', active.value ? [] : arr);
  showRight.value = false;
}
// 取消操作
function cancel() {
  // currentIndexes.value = new Set();
  // active.value = 0;
  showRight.value = false;
}
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
  padding: 16px 24px 0;

  :deep(.van-tabs) {
    height: 100%;

    .van-tabs__wrap {
      height: 50px;
      width: 152px;
      margin: 0 auto;

      .van-tabs__nav {
        padding: 8px;

        .van-tab--active {
          border-radius: 2px;
          background: linear-gradient(180deg, #ffffff 0%, #dcecf3 100%);
          box-shadow: 0px 2px 0px 0px rgba(0, 0, 0, 0.3);
        }
      }
    }

    .van-tabs__content {
      margin-top: 14px;
      .van-tab__panel {
        height: calc(100vh - 240px);
        overflow-y: scroll;
        display: grid;
        row-gap: 8px;
        grid-template-rows: repeat(auto-fill, 48px);
        align-items: center;

        > ul {
          height: 100%;
          border-bottom: 1px solid #e7eeee;
          display: grid;
          grid-template-columns: auto 30px;
          align-content: center;

          > li {
            font-family: Source Han Sans;
            font-size: 14px;
            color: #84abbb;
            height: 24px;
          }

          &.active {
            > li {
              color: #34394f;
            }
            .icon {
              width: 24px;
              height: 24px;
              background: url('/src/assets/image/work/icon-select.png') no-repeat center/contain;
            }
          }
        }
      }
    }
  }
}

.footer {
  height: 58px;
  padding: 12px 80px;
  display: grid;
  column-gap: 15px;
  grid-template-columns: 1fr 1fr;

  .van-button {
    width: 100px;
    height: 34px;
    border-radius: 30px;
    background: #ff6a00;
    font-family: 思源黑体;
    font-size: 16px;
    color: #ffffff;
    border: none;

    &:last-child {
      border: 1px solid #8db5c5;
      background: unset;
      color: #8db5c5;
    }
  }
}
</style>
