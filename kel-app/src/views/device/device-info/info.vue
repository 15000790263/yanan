<template>
  <div class="wrapper">
    <div class="top-p"></div>
    <div class="menu-wrapper">
      <template v-for="(item, index) in menuList" :key="index">
        <div :class="'menu-item a' + (index + 1)" @click="$router.push(item.path)">
          {{ item.text }}
        </div>
      </template>
    </div>
    <!-- <div class="scan-qr" @click="scanQr">
      <img src="../../../assets/image/check/icon_qr.png" width="24" height="24" />
      <span class="text">扫描设备二维码</span>
    </div> -->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getRegulatorByScan, getRegulatorStationByScan } from '@/api/device.js';
import { qrScanner2 } from '@/utils/qrscanner2';

const menuList = ref([
  {
    text: '燃气管道',
    path: '/device/pipeline',
  },
  {
    text: '成套设备台账',
    path: '/device/whole-set',
  },
  {
    text: '特种设备台账',
    path: '/device/special',
  },
  {
    text: '物资设备',
    path: '/device/material',
  },
  {
    text: '阴保设备',
    path: '/device/protection',
  },
  {
    text: '消防设备',
    path: '/device/fire-fighting',
  },
  {
    text: '绝缘接头',
    path: '/device/isolation',
  },
  {
    text: '承包商设备',
    path: '/device/supplier',
  },
]);

const router = useRouter();

//  map = {
//   5001: '调压箱',
//   5005: '调压站',
// };
async function scanQr() {
  const res = await qrScanner2();
  if (res) {
    const [typeValue, equipmentcode] = res.split(':');

    // 调压箱
    if (typeValue === '5001') {
      const list = await getRegulatorByScan(equipmentcode);
      const data = list.data.rows[0];
      if (data) {
        router.push(`/device/whole-set-detail?dataId=${data.dataid}&typeValue=5001`);
      }
    }

    // 调压站
    if (typeValue === '5005') {
      const list = await getRegulatorStationByScan(equipmentcode);
      const data = list.data.rows[0];
      if (data) {
        router.push(`/device/whole-set-detail?dataId=${data.dataid}&typeValue=5005`);
      }
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  background-color: rgba(245, 245, 245, 1);
  position: relative;

  .top-p {
    height: 133px;
    width: 100%;
    background: url('/src/assets/image/device/top-img@2x.png') no-repeat center/contain;
  }

  .menu-wrapper {
    display: grid;
    width: 100%;
    gap: 16px 16px;
    padding: 24px;
    grid-template-columns: repeat(2, 1fr);
    overflow-y: scroll;
    height: calc(100% - 150px);
    margin-bottom: 17px;

    .menu-item {
      width: 100%;
      height: 160px;
      border-radius: 8px;
      color: #34394f;
      background: no-repeat center/contain;
      text-align: center;
      padding-top: 70%;

      font-family: Source Han Sans;
      font-size: 16px;

      font-variation-settings: 'opsz' auto;
      /* app-text-text-3 */
      color: #17617e;
      background-repeat: no-repeat;
      background-size: 100% 100%;

      &.a1 {
        background-image: url('/src/assets/image/device/component-1-bg@2x.png');
      }
      &.a2 {
        background-image: url('/src/assets/image/device/component-2-bg@2x.png');
      }
      &.a3 {
        background-image: url('/src/assets/image/device/component-3-bg@2x.png');
      }
      &.a4 {
        background-image: url('/src/assets/image/device/component-4-bg@2x.png');
      }
      &.a5 {
        background-image: url('/src/assets/image/device/component-1-bg@2x.png');
      }
      &.a6 {
        background-image: url('/src/assets/image/device/component-2-bg@2x.png');
      }
      &.a7 {
        background-image: url('/src/assets/image/device/component-3-bg@2x.png');
      }
      &.a8 {
        background-image: url('/src/assets/image/device/component-4-bg@2x.png');
      }
    }
  }

  .scan-qr {
    left: 50%;
    bottom: 10px;
    position: absolute;
    width: 216px;
    height: 34px;
    border-radius: 30px;
    opacity: 1;
    background: #ff6a00;
    display: flex;
    justify-content: center;
    align-items: center;

    transform: translateX(-50%);

    .text {
      margin-left: 8px;
      color: white;
      font-size: 16px;
    }
  }
}
</style>
