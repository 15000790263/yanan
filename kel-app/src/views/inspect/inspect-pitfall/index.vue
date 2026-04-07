<template>
  <div class="wrapper">
    <van-notice-bar scrollable text="请注意，此页面数据，为5分钟前的数据" />
    <div class="search-wrapper">
      <van-search
        v-model="params.equipmenttypename"
        placeholder="请输入"
        input-align="center"
        right-icon="search"
        left-icon=""
        show-action
      >
        <template #action>
          <div class="filter">
            <van-dropdown-menu>
              <van-dropdown-item v-model="params.state" :options="option" />
            </van-dropdown-menu>
          </div>
        </template>
      </van-search>
    </div>
    <div class="list">
      <template v-if="pitFallList.length" v-for="(item, index) in pitFallList">
        <div
          v-if="counter > index"
          class="item"
          :class="'a' + item.STATE"
          @click="pageToDetail(item)"
        >
          <div class="import-type">{{ item.FAULTGRADE }}</div>
          <div class="title">
            <span>
              {{ item.deptName }}
            </span>
            <span>
              {{ item.EQUIPMENTTYPENAME }}
            </span>
          </div>
          <div class="content">
            <div class="left">
              <div class="person">{{ item.REPORTER }}</div>
              <div class="time">{{ item.FINDDATE }}</div>
            </div>
            <div class="right">
              <div class="person">{{ item.MODIFIER }}</div>
              <div class="time">{{ item.MODIFYDATE }}</div>
            </div>
          </div>
          <div class="address">{{ item.ADDRESS || '无' }}</div>
        </div>
      </template>
      <van-empty style="margin-top: 120px" v-else description="暂无数据" />
    </div>
    <div class="footer">
      <van-button round type="success" color="#FF6A00" @click="addPitfall">新增隐患</van-button>
    </div>
  </div>
</template>

<script setup>
import { getPitfallList, addPitfallApi } from '@/api/pitfall';
import { createLoading } from '@/utils/loading-fn';
import { useRouter } from 'vue-router';

import useUserStore from '@/stores/user';

const userStore = useUserStore();

defineOptions({
  name: 'inspect-pitfall', // 手动声明组件名称
});

const counter = ref(1);

const pitFallList = ref([]);

function deferFn() {
  function update() {
    if (counter.value > pitFallList.value.length) {
      return;
    }
    counter.value += 1;
    requestAnimationFrame(update);
  }

  update();
}

// onActivated(() => {
//   console.log(3333333333);
// });

const params = ref({
  state: '1',
  equipmenttypename: '',
});

const option = [
  { text: '待处理', value: '1' },
  { text: '处理中', value: '2' },
  { text: '作废', value: '3' },
  { text: '处理完成', value: '4' },
  { text: '审核完成', value: '7' },
];

const router = useRouter();
function pageToDetail(item) {
  if (item.STATE === '1') {
    router.push({
      path: '/inspect/inspect-pitfall-edit',
      query: {
        data: JSON.stringify(item),
      },
    });
  } else {
    router.push({
      path: '/inspect/inspect-pitfall-detail',
      query: {
        data: JSON.stringify(item),
      },
    });
  }
}

watchEffect(async function getList() {
  const destroy = createLoading();
  const res = await getPitfallList(params.value);
  // const res = await getPitfallList();
  destroy();

  pitFallList.value = res.data.responseModelList[0].dataTable.stringRowsMaps
    .map(item => {
      let deptName = item.FINDDEPT;
      if (item.FINDDEPT === '场站') {
        deptName = '输配区';
      }
      return {
        deptName,
        ...item,
      };
    })
    .filter(item =>
      ['高压组', '次高压组'].includes(userStore.deptName)
        ? item.deptName === '输配区'
        : item.deptName === userStore.deptName
    );
  deferFn();

  console.log(res.data.responseModelList[0].dataTable.stringRowsMaps);
});

function addPitfall() {
  router.push('/inspect/inspect-pitfall-add');
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 14px;
  padding-bottom: 0;
  background-color: #f7fafa;

  .van-notice-bar {
    margin-bottom: 15px;
  }

  .search-wrapper {
    width: 100vw;
    margin-left: -14px;
    margin-top: -14px;
    height: 54px;

    :deep(.van-search__action) {
      padding-right: 0;

      &:active {
        background-color: unset;
      }
    }

    .van-search {
      height: 100%;
    }

    .van-search--show-action {
      padding: 10px 14px;
    }

    .filter {
      width: 100px;
    }
  }

  .list {
    height: calc(100% - 70px - 26px - 40px - 15px);
    width: 100%;
    overflow-x: hidden;
    overflow-y: scroll;
    display: grid;
    grid-template-rows: repeat(auto-fill, 124px);
    row-gap: 12px;

    .item {
      height: 124px;
      width: 100%;
      background:
        url(/src/assets/image/check/divider_error.png) no-repeat center 90px/100% 1px,
        linear-gradient(#f3d4d4 0%, #fee5d3 100%);
      padding: 12px;
      border-radius: 6px;
      position: relative;
      z-index: 0;

      &.a2 {
        background:
          url(/src/assets/image/check/divider_error.png) no-repeat center 90px/100% 1px,
          linear-gradient(#a4e6fd 0%, #a4e6fd 100%);
      }

      &.a3 {
        background:
          url(/src/assets/image/check/divider_error.png) no-repeat center 90px/100% 1px,
          linear-gradient(#f5c379 0%, #f5c379 100%);
      }
      &.a4 {
        background:
          url(/src/assets/image/check/divider_error.png) no-repeat center 90px/100% 1px,
          linear-gradient(#33ff0044 0%, #33ff0044 100%);
      }

      &.a7 {
        background:
          url(/src/assets/image/check/divider_error.png) no-repeat center 90px/100% 1px,
          linear-gradient(#3f683544 0%, #29861244 100%);
      }

      .import-type {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 60px;
        height: 60px;
        display: grid;
        place-items: center;
        color: #fff;
        transform: rotateZ(-33deg);
        font-size: 13px;
      }

      .title {
        background-color: #ffffff45;
        height: 30px;
        line-height: 30px;
        border-radius: 4px;
        color: #ff3636;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        position: relative;

        > span:first-child {
          position: absolute;
          top: 0;
          left: 5px;
          font-weight: normal;
          font-size: 12px;
        }
      }

      .content {
        font-size: 12px;
        color: #34394f;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: 12px;
        padding: 5px 12px;

        .left,
        .right {
          padding-left: 24px;
          background: url(/src/assets/image/check/icon_time_error.png) no-repeat left center/20px;
        }
      }

      .address {
        line-height: 16px;
        width: 80vw;
        font-size: 12px;
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        text-align: center;
      }

      &::after {
        content: '';
        display: inline-block;
        width: 60px;
        height: 60px;
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: -1;
        opacity: 0.8;
      }
    }

    .a1::after {
      background:
        url(/src/assets/image/check/icon-pass-no-text.png) no-repeat center/contain,
        linear-gradient(#f3d4d4 0%, #fee5d3 100%);
    }

    .a2::after {
      background: url(/src/assets/image/check/icon-pass-no-text.png) no-repeat center/contain;
    }

    .a3::after {
      background: url(/src/assets/image/check/icon-pass-no-text.png) no-repeat center/contain;
    }

    .a4::after {
      background: url(/src/assets/image/check/icon-pass-no-text.png) no-repeat center/contain;
    }

    .a7::after {
      background: url(/src/assets/image/check/icon-pass-no-text.png) no-repeat center/contain;
    }
  }

  .footer {
    height: 56px;
    display: grid;
    place-items: center;
    padding: 0 24px;
    width: 100vw;
    margin-left: -14px;

    .van-button {
      height: 32px;
      font-size: 12px;
      width: 100%;
    }
  }

  ::v-deep {
    .van-dropdown-menu__bar {
      background: unset;
      box-shadow: none;
      height: 34px;
      background-color: #f7f8fa;
    }

    .van-dropdown-menu__title {
      color: rgb(132, 171, 187);
    }
  }
}
</style>
