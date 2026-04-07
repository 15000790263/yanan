<template>
  <div class="wrapper">
    <div class="earth-wrapper" id="container"></div>
  </div>
</template>

<script setup lang="jsx">
import { api_pipeline, api_plan, api_regulator, api_station, api_well } from '../../../api/inspect';
import Earth from '@/utils/earth';
import { showImagePreview, showDialog } from 'vant';
import config from '../../../config';
import L from 'leaflet';
import { getLoc } from '../util/location';
import { titleStore } from '@/stores/title';
import { showMyDialog } from '../../../utils/my-dialog';
import buffer from '@turf/buffer';
import { lineString } from '@turf/helpers';
import { parseWKTPolygon } from '@/utils/tools';
import dayjs from 'dayjs';
import 'leaflet-polylinedecorator';

const route = useRoute();

const id = route.query.id;

const planId = route.query.planId;

const isKx = route.query.isKx === 'true';

async function getUsefulData() {
  const res = await Promise.all([api_pipeline.getPipelineBuffer(), api_plan.getKxBuffer()]);

  const arr = res.map(item => {
    return item.data.rows[0].configValue;
  });

  bfSc.value = arr[Number(isKx)];
}

let earth = null;

const bfSc = ref('');

async function getData() {
  const res = await Promise.all([
    api_pipeline.getDetail(id),
    api_pipeline.getCoordinate(id),
    api_plan.getKxCoordinate({ planId, batchCode: id }),
  ]);
  const a1 = JSON.parse(res[0].data.data.annormalPoint);
  const picPath = res[0].data.data.imagePath?.split(';') || [];

  const annormalPoint = a1.map(item => {
    let havePic = false;
    const index = picPath.findIndex(value => value.includes(item.picName));
    if (index !== -1) {
      // 有图
      havePic = true;
    }
    return {
      ...item,
      image: havePic
        ? new URL('/src/assets/image/check/icon-abnormal-havepic.png', import.meta.url).href
        : new URL('/src/assets/image/check/icon-abnormal.png', import.meta.url).href,
      clickCallback() {
        if (havePic) {
          showImagePreview([`${config.fileUrl}${picPath[index]}`]);
        }
      },
    };
  });

  await getUsefulData();

  if (!isKx) {
    const trailPoints = res[1].data.rows.map(item => [item.latitude, item.longitude]);

    const timeSpeedList = res[1].data.rows.map(item => [
      dayjs(item.uploadTime).format('YYYY-MM-DD HH:mm:ss'),
      item.speed.toFixed(1) + 'Km/h',
    ]);

    const polyline = earth.drawTracks(trailPoints, { needFollow: true, timeSpeedList, weight: 10 });

    L.polylineDecorator(polyline, {
      patterns: [
        {
          offset: 0,
          repeat: 30,
          symbol: L.Symbol.arrowHead({
            pixelSize: 5, // 箭头大小
            headAngle: 90, // 箭头角度
            polygon: false, // 是否为多边形
            pathOptions: { color: '#fff', weight: 4 }, // 箭头样式
          }),
        },
      ],
    }).addTo(earth.viewer);

    // 绘制缓冲
    const coordinates = res[1].data.rows.map(item => [item.longitude, item.latitude]);
    const line = lineString(coordinates);
    const buffered = buffer(line, bfSc.value, { units: 'meters' });
    L.geoJSON(buffered, {
      style: {
        color: '#f00a',
        fillColor: '#ffcccc',
        fillOpacity: 0.3,
      },
    }).addTo(earth.viewer);
  }
  // 快巡
  else {
    // const res1 = await api_pipeline.getPlanById(planId);
    // const res1 = await api_pipeline.getPlanById(4386);

    const res2 = await api_plan.getKxPoint(planId);

    const res3 = await api_plan.getKxRecordPointList({ patrolPlanId: planId });

    // 更新快巡红色标记为绿色
    const isFinishPointIds = res3.data.rows.map(item => item.patrolpointNumber);

    // 快巡点的点（几个）
    const kxPoints2 = res2.data.rows.map(item => ({
      image: isFinishPointIds.includes(item.pointSyscode)
        ? new URL('/src/assets/image/check/icon-kx-finish.gif', import.meta.url).href
        : new URL('/src/assets/image/check/icon-kx.gif', import.meta.url).href,
      y: item.lat,
      x: item.lon,
      ...item,
    }));
    earth.addBillboards(kxPoints2);

    // 轨迹点（一坨）
    const kxPoints = res[2].data.rows.map(item => [item.latitude, item.longitude]);
    const kxTimeSpeedList = res[2].data.rows.map(item => [
      dayjs(item.uploadTime).format('YYYY-MM-DD HH:mm:ss'),
      item.speed.toFixed(1) + 'Km/h',
    ]);

    const kxPolyline = earth.drawTracks(kxPoints, {
      needFollow: true,
      timeSpeedList: kxTimeSpeedList,
      weight: 10,
    });

    L.polylineDecorator(kxPolyline, {
      patterns: [
        {
          offset: 0,
          repeat: 30,
          symbol: L.Symbol.arrowHead({
            pixelSize: 5, // 箭头大小
            headAngle: 90, // 箭头角度
            polygon: false, // 是否为多边形
            pathOptions: { color: '#fff', weight: 4 }, // 箭头样式
          }),
        },
      ],
    }).addTo(earth.viewer);

    // 绘制缓冲
    const coordinates = res[2].data.rows.map(item => [item.longitude, item.latitude]);
    const line = lineString(coordinates);
    const buffered = buffer(line, bfSc.value, { units: 'meters' });
    L.geoJSON(buffered, {
      style: {
        color: '#f00a',
        fillColor: '#ffcccc',
        fillOpacity: 0.3,
      },
    }).addTo(earth.viewer);
  }

  earth.addBillboards(annormalPoint);

  // 关联的其他设备巡检
  const { patrolRegulatorTaskid, patrolStationTaskid, patrolValveTaskid } = res[0].data.data;

  // 调压箱
  if (patrolRegulatorTaskid) {
    const rPromises = patrolRegulatorTaskid.split(',').map(item => api_regulator.getDetail(item));
    const rRes = await Promise.all(rPromises);
    const rPoints = rRes
      .filter(item => item.data.data.longitude)
      .map(item => {
        return {
          image: new URL('/src/assets/image/check/icon-relate-r.png', import.meta.url).href,
          x: item.data.data.longitude,
          y: item.data.data.latitude,
          clickCallback() {
            const data = item.data.data;
            showMyDialog({
              message: (
                <div style="text-align: left;">
                  <div style="line-height: 26px;">调压箱编号：{data.regulatorNumber}</div>
                  <div style="line-height: 26px;">巡检人员：{data.practicalPerson}</div>
                  <div style="line-height: 26px;">巡检时间：{data.practicalDate}</div>
                  <div style="line-height: 26px;">
                    状态：
                    {data.patrolStatus === 1 ? (
                      <span style="color: #fff; background-color: #07c160;padding: 2px;border-radius: 4px">
                        正常
                      </span>
                    ) : (
                      <span style="color: #fff; background-color: #f00;padding: 2px;border-radius: 4px">
                        异常
                      </span>
                    )}
                  </div>
                </div>
              ),
            });
          },
        };
      });
    earth.addBillboards(rPoints);
  }

  // 阀井
  if (patrolValveTaskid) {
    const wPromises = patrolValveTaskid.split(',').map(item => api_well.getDetail(item));
    const wRes = await Promise.all(wPromises);
    const wPoints = wRes
      .filter(item => item.data.data.longitude)
      .map(item => {
        return {
          image: new URL('/src/assets/image/check/icon-relate-w.png', import.meta.url).href,
          x: item.data.data.longitude,
          y: item.data.data.latitude,
          clickCallback() {
            const data = item.data.data;
            showMyDialog({
              message: (
                <div style="text-align: left;">
                  <div style="line-height: 26px;">阀井编号：{data.valveNumber}</div>
                  <div style="line-height: 26px;">巡检人员：{data.practicalPerson}</div>
                  <div style="line-height: 26px;">巡检时间：{data.practicalDate}</div>
                  <div style="line-height: 26px;">
                    状态：
                    {data.patrolStatus === 1 ? (
                      <span style="color: #fff; background-color: #07c160;padding: 2px;border-radius: 4px">
                        正常
                      </span>
                    ) : (
                      <span style="color: #fff; background-color: #f00;padding: 2px;border-radius: 4px">
                        异常
                      </span>
                    )}
                  </div>
                </div>
              ),
            });
          },
        };
      });
    earth.addBillboards(wPoints);
  }

  // 调压站
  if (patrolStationTaskid) {
    const sPromises = patrolStationTaskid.split(',').map(item => api_station.getDetail(item));
    const sRes = await Promise.all(sPromises);
    const sList = sRes.map(item => item.data.data);
    earth.addRectLayer(sList);
  }
}

let timer;

const titleStoreData = titleStore();

function initEarth(showBoxAndValve) {
  earth = new Earth('container', {
    showBoxAndValve,
  });
}

onMounted(() => {
  if (id) {
    initEarth(false);
    getData();
    if (planId !== 'null') {
      getPipData();
    }
  } else if (route.query.loc) {
    initEarth(true);
    setCurrentLoc();
  }
});

function setCurrentLoc() {
  nextTick(() => {
    titleStoreData.changeTitle('我的位置');
  });

  setLocPoint();
  timer = setInterval(() => {
    setLocPoint();
  }, 2000);
}

onBeforeUnmount(() => {
  timer && clearInterval(timer);
});

let marker = null;
const isFirst = ref(true);

async function setLocPoint() {
  const value = await getLoc();
  const customIcon1 = L.icon({
    iconUrl: new URL('../../../../src/assets/image/check/icon-person-trail.png', import.meta.url)
      .href,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  if (marker) {
    marker.setLatLng([value.latitude, value.longitude]);
  } else {
    marker = L.marker([value.latitude, value.longitude], {
      icon: customIcon1,
    }).addTo(earth.viewer);
  }
  if (isFirst.value) {
    earth.viewer.setView(L.latLng(value.latitude, value.longitude), 18);
    isFirst.value = false;
  }
}

async function getPipData() {
  const res = await api_pipeline.getPlanById(planId);

  const data = res.data.data;

  let scList = [];

  if (!data.patrolZone) {
    return;
  }
  const sc = parseWKTPolygon(data.patrolZone);

  scList = sc.map(item => ({
    lon: item[0],
    lat: item[1],
  }));

  const [m, h] = await api_pipeline.getPipelineData(scList);

  const pipList = [...m.data.line, ...h.data.line];

  let coverType = 0;

  if (m.data.line.length && !h.data.line.length) {
    coverType = 1;
  } else if (!m.data.line.length && h.data.line.length) {
    coverType = 2;
  }

  const points = pipList.map(item => {
    return item.geometry.coordinates.map(item => [...item].reverse());
  });

  earth.drawTracks(points, { color: '#f00' });

  const arr2 = scList.map(item => [item.lat, item.lon]);
  earth.drawTracks(arr2, { color: '#FBFB3888' });

  const res2 = await api_pipeline.getCoverage({
    // type: 1, // 测试测试测试
    // pipelinePlanId: 4044, // 测试测试测试
    type: coverType,
    pipelinePlanId: planId,
  });

  const coverGis = res2.data.data.coverageArea.map(item => {
    const gis = JSON.parse(item.gis);
    if (gis.type === 'MultiLineString') {
      return gis.coordinates.map(item => {
        return item.map(item => [...item].reverse());
      });
    } else if (gis.type === 'LineString') {
      return gis.coordinates.map(item => [...item].reverse());
    }
  });
  setTimeout(() => {
    L.polyline(coverGis, { color: '#0f0' }).addTo(earth.viewer);
  }, 500);
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;

  .earth-wrapper {
    width: 100%;
    height: 100%;
  }
}
</style>
