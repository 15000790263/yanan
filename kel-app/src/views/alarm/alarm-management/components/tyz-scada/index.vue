<template>
  <div class="outer">
    <div class="content">
      <div v-for="item in dataHub.scada_dis" class="item" :key="item.JKPT">
        <div class="name">{{ item.stationName }}</div>

        <div class="card-in-out">
          <div></div>
          <div>进口</div>
          <div>出口</div>
        </div>

        <div class="press">
          <div class="title"></div>
          <div>
            <span class="press-value">
              {{ item.JKPT }}
            </span>
            <span>Mpa</span>
          </div>
          <div>
            <span class="press-value">
              {{ item.CKPT }}
            </span>
            <span>Mpa</span>
          </div>
        </div>

        <div class="temp">
          <div class="title"></div>
          <div>
            <span class="temp-value">
              {{ item.JKTT }}
            </span>
            <span>℃</span>
          </div>
          <div>
            <span class="temp-value">
              {{ item.CKTT }}
            </span>
            <span>℃</span>
          </div>
        </div>

        <div class="bottom-info">
          <van-cell-group inset>
            <van-field
              v-model="item.FIZL"
              label="送气瞬时量(Nm3/h)"
              label-width="150"
              readonly
              input-align="right"
              colon
            />
            <van-field
              v-model="item.SQZL"
              label="流量总量(Nm3/h)"
              label-width="150"
              readonly
              input-align="right"
              colon
            />
            <van-field
              v-model="item.SQZLQ"
              label="昨日送气总量(Nm3/h)"
              label-width="150"
              readonly
              input-align="right"
              colon
            />
          </van-cell-group>
        </div>

        <!-- 监控视频 -->
        <div class="video-entry" @click="showCameraList(item)"></div>
      </div>
    </div>
    <van-popup
      v-model:show="showBottom"
      position="bottom"
      :style="{ height: '30%' }"
      @closed="onClosed"
    >
      <ul v-if="cameraList.length" class="list-wrapper">
        <li
          v-for="(item, index) in cameraList"
          :class="{ active: index === currentIndex }"
          :key="item.STREAM"
          @click="playCamera(item, index)"
        >
          {{ item.NAME }}
        </li>
      </ul>
      <van-empty v-else description="暂无数据" />
    </van-popup>
  </div>
</template>

<script setup>
import { mqtt } from './mqtt';
import { createLoading } from '../../../../../utils/loading-fn';
import { getCameraList } from '../../../../../api/camera';
import { videoPreview } from '../../../../../utils/preview/index';
import config from '@/config';

const router = useRouter();

let destroy;

let client;
let mqttUrl = 'ws://60.13.219.226:30453/mqtt';
let mqttOpt = {
  username: 'user',
  password: 'geovis8876543',
  keepalive: 60,
};

const dataHub = ref({
  curStationInfo: {
    SiteID: 'NT-RSU110',
  },
});
const scadaMap = {
  '1H': '110站',
  '2H': '123号站',
  '3H': '公交公司站',
  '4H': '81号站',
  '5H': '英下站',
  '6H': '79号站',
  '7H': '库西站',
  '8H': '上库站',
  '10H': '幸福路站',
  '12H': '田园路站',
};

const flectStation = {
  'NT-RSU79': '6H',
  'NT-RSU81': '4H',
  'NT-RSUYXZ': '5H',
  'NT-RSU123': '2H',
  'NT-RSUGJZ': '3H',
  'NT-RSU110': '1H',
  'NT-RSUSHLZ': '',
  'NT-RSUXFLZ': '10H',
  'NT-RSUKXZ': '7H',
  'NT-RSMSKZ': '8H',
};

let showScadaAttr = {};

function initMqtt() {
  client = mqtt.connect(mqttUrl, { clientId: `tyz-scada-${Date.now()}`, ...mqttOpt });

  subscribeTopic('/neuron/scadamq/bzscada/SCADADIS');
  subscribeTopic('/neuron/scadamq/bzscada/SCADAALL');
  bindMessage();
}

function subscribeTopic(topic) {
  client.subscribe(topic, { qos: 0 }, (error, granted) => {
    if (error) {
      destroy && destroy();
      // console.log('subscribe error:', error);
      return;
    }
    // console.log('subscribe successfully:', granted);
  });
}

function bindMessage() {
  client.on('message', (topic, message) => {
    if (topic == '/neuron/scadamq/bzscada/SCADADIS') {
      dealStationJson(JSON.parse(message));
    }
    if (topic == '/neuron/scadamq/bzscada/SCADAALL') {
      dealAllJson(JSON.parse(message));
    }
  });
}

function dealStationJson(msg) {
  let val = msg.values;
  const tempMap = {};
  const dealCurScada = {};
  const curSiteId = dataHub.value.curStationInfo.SiteID;
  const scadaTag = flectStation[curSiteId] || '';
  Object.keys(val).forEach(_ => {
    if (Object.keys(showScadaAttr).includes(_)) {
      let curBubble = showScadaAttr[_];
      curBubble.updatePropertiesValue(val[_]);
    }
    let valTags = _.split('_');
    let perfix = valTags[0];
    if (scadaTag == perfix) {
      dealCurScada[valTags[1]] = val[_];
    }
    if (!perfix.includes('H')) return;
    if (!tempMap[perfix]) {
      tempMap[perfix] = {
        stationName: scadaMap[perfix],
        stationKey: perfix,
      };
    }
    tempMap[perfix][_] = val[_];
  });
  dataHub.value.scada_cur = dealCurScada;
  let arr = Object.values(tempMap);
  let arr2 = [];
  arr.forEach(item => {
    let keysArr = Object.keys(item);
    let valuesArr = Object.values(item);
    let obj = {};
    for (let i = 0; i < keysArr.length; i++) {
      if (keysArr[i].indexOf('_') != -1) {
        keysArr[i] = keysArr[i].split('_')[1];
      }
      obj[keysArr[i]] = valuesArr[i];
    }
    arr2.push(obj);
  });
  // console.log(arr2);
  dataHub.value.scada_dis = arr2;
  destroy && destroy();
}

function dealAllJson(msg) {
  dataHub.value.scada_all = msg.values;
}

onMounted(() => {
  destroy = createLoading();
  initMqtt();
});

onUnmounted(() => {
  client.end(true);
});

const cameraList = ref([]);

const currentStation = ref('');

watchEffect(() => {
  currentStation.value;
  getCameras();
});

async function getCameras() {
  const res = await getCameraList();
  cameraList.value = res.data.responseModelList[0].dataTable.stringRowsMaps.filter(item =>
    item.NAME.includes(currentStation.value)
  );
}

const showBottom = ref(false);

let removeGuard;

async function showCameraList(item) {
  currentStation.value = item.stationName.slice(0, 2);
  setTimeout(() => {
    showBottom.value = true;
    removeGuard = router.beforeEach(() => {
      return false;
    });
  }, 100);
}

const currentIndex = ref(-1);

function playCamera(item, index) {
  currentIndex.value = index;
  const url = `${config.videoUrl}/${item.APP}/${item.STREAM}.live.mp4`;
  videoPreview(url);
}

function onClosed() {
  currentIndex.value = -1;
  removeGuard();
}
</script>

<style lang="less" scoped>
.outer {
  .content {
    width: 100%;
    display: grid;
    grid-auto-rows: minmax(100px, auto);
    row-gap: 12px;
    font-size: 14px;

    .item {
      background-color: #4e607d;
      color: #fff;
      display: grid;
      row-gap: 12px;
      padding: 12px;
      background:
        url('/src/assets/image/alarm/index-bg.png') no-repeat center/100% 100%,
        #0014ff5e;
      border-radius: 6px;
      position: relative;

      .name {
        height: 30px;
        width: 100%;
        display: grid;
        place-items: center;
        background: url('/src/assets/image/alarm/titlebg.png') no-repeat center/40% 100%;
        font-size: 20px;
        font-weight: 600;
      }

      .common {
        display: flex;
        justify-content: space-between;
        align-items: center;

        > div {
          display: grid;
          place-items: center;
          flex: 1;
        }
      }

      .card-in-out {
        .common();
      }

      .press {
        height: 45px;
        .common();
        .title {
          height: 100%;
          background: url('/src/assets/image/alarm/pressure.png') no-repeat center/contain;
        }

        span {
          color: #ffffff7d;
        }

        .press-value {
          color: #fff;
          font-size: 20px;
          font-weight: 600;
        }
      }

      .temp {
        height: 45px;
        .common();
        .title {
          height: 100%;
          background: url('/src/assets/image/alarm/templogo.png') no-repeat center/contain;
        }
        .temp-value {
          font-size: 20px;
          font-weight: 600;
          background: linear-gradient(180deg, #fa0, #f20);
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .bottom-info {
        .van-cell-group {
          background-color: #0000;
        }
        .van-cell {
          padding: 5px 8px;
          background-color: #0000;
          font-size: 12px;

          :deep(label) {
            color: #fff;
          }

          :deep(input) {
            color: #fff;
          }
        }
      }

      .video-entry {
        position: absolute;
        right: 12px;
        top: 12px;
        width: 30px;
        height: 30px;
        background: url(/src/assets/image/emergency/camera/camera.png) no-repeat center/80% 80%;
      }
    }
  }

  .list-wrapper {
    height: 100%;
    padding: 20px 0;
    overflow-y: scroll;

    > li {
      height: 40px;
      line-height: 40px;
      text-align: center;
      color: #323233;
      font-size: 14px;

      &.active {
        background-color: #ddd;
      }
    }
  }
}
</style>
