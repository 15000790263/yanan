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
        animated
      >
        <van-tab
          v-for="item in tabList[0]?.children"
          title-style="fontSize: 16px"
          :title="item.deptName"
          :key="item.deptId"
        >
          <template v-for="(value, index) in item.children" :key="value.deptId">
            <ul
              class="level-2"
              :class="{ active: level2Index === index || id2 == value.deptId }"
              @click="level2Click(index, value)"
            >
              <li>{{ value.deptName }}</li>
              <li class="icon"></li>
            </ul>
            <ul class="level-3" v-if="value.children.length">
              <li
                v-for="(i, d) in value.children"
                :class="{ active: level3Index === d || id3 == i.deptId }"
                :key="i.deptId"
                @click="level3Click(index, d, i, value)"
              >
                {{ i.deptName }}
              </li>
            </ul>
          </template>
        </van-tab>
      </van-tabs>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import { getAllDeptList } from '../../../../../api/work';
import { watch } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

const props = defineProps(['show', 'deptName', 'deptId']);
const emit = defineEmits(['update:show', 'update:deptName', 'update:deptId']);

const { show } = toRefs(props);

const showRight = computed({
  get() {
    return show.value;
  },
  set(val) {
    emit('update:show', val);
    initData();
  },
});

const active = ref(0);
const tabList = ref([]);

getAllDeptList().then(({ data }) => {
  tabList.value = mapArrToTree(data.data);
  tabList.value[0].children[0].children.find(item => item.deptId === 209).children = [];
});

function mapArrToTree(arr) {
  const treeData = [];
  function recurrence(arr, value) {
    arr.forEach(item => {
      if (!value) {
        if (item.parentId === 0) {
          treeData.push({ ...item, children: [] });
        } else {
          recurrence(treeData, item);
        }
      } else {
        if (item.deptId === value.parentId) {
          item.children.push({ ...value, children: [] });
        } else {
          recurrence(item.children, value);
        }
      }
    });
  }
  recurrence(arr);
  return treeData;
}

const level2Index = ref(-1);

// 二级数据点击
function level2Click(index, value) {
  // 如果有孩子，则无法直接点击选中，必须点击孩子才能选中
  if (value?.children.length) {
    return;
  }
  level2Index.value = index;
  level3Index.value = -1;
  update(value);
}

const level3Index = ref(-1);

// 三级数据点击
function level3Click(index, d, i, value) {
  level2Index.value = index;
  level3Index.value = d;
  update(i, value);
}

// 赋值
function update(i, value) {
  emit('update:deptName', value ? `${value.deptName}-${i.deptName}` : i.deptName);
  emit('update:deptId', i.ancestors.split(',').concat(i.deptId).slice(1).toString());
  //  和设计确认，800毫秒自动关闭
  setTimeout(() => {
    showRight.value = false;
  }, 800);
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

// 数据初始
function initData() {
  level2Index.value = -1;
  level3Index.value = -1;
}

const id2 = ref('');
const id3 = ref('');

// 数据回显
const { deptId } = toRefs(props);
let timer = null;
watch(deptId, val => {
  const arr = val.split(',');
  id2.value = val.split(',')[2];
  if (arr.length === 4) {
    id3.value = val.split(',')[3];
  } else {
    id3.value = '';
  }
  const fId = val.split(',')[1];
  timer = setInterval(() => {
    if (tabList.value.length) {
      const index = tabList.value[0].children.findIndex(item => item.deptId == fId);
      active.value = index;
      clearInterval(timer);
    }
  }, 500);
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

  :deep(.van-tabs) {
    height: 100%;

    .van-tabs__wrap {
      height: 44px;
    }
    .van-tabs__nav--line > .van-tabs__line {
      background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%) !important;
    }

    .van-tabs__content {
      .van-tab__panel {
        height: calc(100vh - 148px);
        overflow-y: scroll;
        margin-top: 25px;

        display: grid;
        row-gap: 9px;
        grid-template-rows: max-content;
      }
    }
  }

  .level-2 {
    height: 48px;
    border-bottom: 1px solid #e7eeee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: Source Han Sans;
    font-size: 14px;
    color: #84abbb;

    &.active {
      color: #34394f;
      .icon {
        width: 24px;
        height: 24px;
        background: url('/src/assets/image/work/icon-select.png') no-repeat center/contain;
      }
    }
  }

  .level-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, 4rem);
    gap: 12px;

    > li {
      padding: 4px 8px;
      width: fit-content;
      border-radius: 14px;
      background: #e7eeee;

      font-family: Source Han Sans;
      font-size: 14px;
      color: #84abbb;

      &.active {
        background: #80d7c2;
        color: #17617e;
      }
    }
  }
}
</style>
