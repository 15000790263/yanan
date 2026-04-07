<template>
  <div class="wrapper">
    <div class="list">
      <div class="item fj" @click="goList(1)">
        <van-badge :content="fjCount">
          <div class="child">阀井</div>
        </van-badge>
      </div>
      <div class="item tyx" @click="goList(2)">
        <van-badge :content="tyxCount">
          <div class="child">调压箱</div>
        </van-badge>
      </div>
      <div class="item sca">
        <van-badge :content="0">
          <div class="child">SCADA</div>
        </van-badge>
      </div>
      <div class="item jg" @click="goList(4)">
        <van-badge :content="jgCount">
          <div class="child">激光云台</div>
        </van-badge>
      </div>
    </div>
    <div class="tyz-list">
      <TYZScada />
    </div>
  </div>
</template>

<script setup>
import { getAlarmData, getAlarmCount } from '@/api/alarm';
import { onMounted } from 'vue';
import TYZScada from './components/tyz-scada';

defineOptions({
  name: 'AlarmManagement',
});

const router = useRouter();

const fjCount = ref(0);
const tyxCount = ref(0);
const scaCount = ref(0);
const jgCount = ref(0);

const keyArr = [
  'dev_name',
  'devsn',
  'alarm',
  'channelno',
  'channelname',
  'channeldata',
  'channelunit',
  'recdate',
  'voltage',
  'minData',
  'midData',
  'min_min_data',
  'maxData',
  'str_info',
  'collinterval',
  'alarmvoltage',
  'addtime',
];

async function getData() {
  const res2 = await getAlarmCount();
  fjCount.value = res2.data.data[0].count;
  tyxCount.value = res2.data.data[1].count;
  jgCount.value = res2.data.data[3].count;

  // const promises = Array(4)
  //   .fill(1)
  //   .map((i, index) => i + index)
  //   .map(i => getAlarmData(i));

  // const res = await Promise.all(promises).catch(() => {
  //   const els = document.getElementsByClassName('van-toast');

  //   function removeToast() {
  //     requestAnimationFrame(() => {
  //       els[0]?.remove();

  //       if (!els.length) {
  //         removeToast();
  //       }
  //     });
  //   }

  //   removeToast();
  //   throw new Error('获取数据失败');
  // });
}

onMounted(getData);

function goList(key) {
  const obj = {
    1: fjCount.value,
    2: tyxCount.value,
    4: jgCount.value,
  };

  if (obj[key] === 0) {
    return;
  }

  let data;

  getAlarmData(key).then(res => {
    switch (key) {
      case 1:
        data = res.data.data.map(item => {
          const data = keyArr.reduce((pre, cur) => {
            pre[cur] =
              typeof item[cur] === 'string' ? item[cur].replace(/\[|\]|%|#/g, '') : item[cur];
            return pre;
          }, {});

          return {
            name: data.dev_name,
            time: data.recdate,
            level: data.channeldata,
            status: data.alarm,
            type: 1,
            data,
          };
        });
        break;
      case 2:
        data = res.data.data.map(item => {
          const data = keyArr.reduce((pre, cur) => {
            pre[cur] =
              typeof item[cur] === 'string' ? item[cur].replace(/\[|\]|%|#/g, '') : item[cur];
            return pre;
          }, {});

          return {
            name: item.dev_name,
            time: item.recdate,
            level: item.channeldata,
            status: item.alarm,
            type: 1,
            data,
          };
        });
        break;
      case 4:
        data = res.data.rows.map(item => {
          return {
            name: item.station_name,
            time: item.alarm_time.split('T').join(' '),
            level: item.density,
            status:
              item.state_type === '1'
                ? '正常'
                : item.state_type === '2'
                  ? '故障'
                  : item.state_type === '3'
                    ? '报警'
                    : item.state_type === '4'
                      ? '离线'
                      : '其他',
            type: 4,
            data: { ...item, flag: 4 },
          };
        });
        break;
      default:
        break;
    }

    const paramsStr = JSON.stringify(data);
    router.push(`/alarm/list?data=${paramsStr}`);
  });
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 12px;
  overflow-y: scroll;

  .list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  .item {
    width: 100%;
    height: 120px;
    display: flex;
    border-radius: 5px;
    justify-content: center;
    align-items: flex-end;
    padding: 14px;

    &.fj {
      background:
        url('/src/assets/image/alarm/icon-3-d424eca3.png') no-repeat center top/50%,
        #005dff9c;
    }
    &.tyx {
      background:
        url('/src/assets/image/alarm/icon-2-d33e286e.png') no-repeat center top/50%,
        #005dff9c;
    }
    &.sca {
      background:
        url('/src/assets/image/alarm/icon-1-3b13e493.png') no-repeat center top/50%,
        #005dff9c;
    }
    &.jg {
      background:
        url('/src/assets/image/alarm/icon-4-6ad7510d.png') no-repeat center top/50%,
        #005dff9c;
    }
  }

  .tyz-list {
    margin-top: 12px;
  }
}
</style>
