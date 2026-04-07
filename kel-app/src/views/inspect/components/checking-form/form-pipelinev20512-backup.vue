<script setup>
import { ref, onBeforeUnmount, onMounted, h } from 'vue';
import { showSuccessToast, showFailToast, showConfirmDialog, showToast, showDialog } from 'vant';
import { useRouter } from 'vue-router';

import CheckItem from '../check-item-common/index.vue';
import { api_pipeline, api_regulator, api_well } from '@/api/inspect';
import { getUserInfo } from '../../../../utils/session';
import { getDictType } from '../../../../api/device';
import { getBackgroundLocation, getAllLocation, getPhoto, stopWatch } from '@/utils/cordova-tools';
import { useBarrage, removeBarrage } from '@/utils/barrage';
import { setIsInspect, clearIsInspect, getIsInspect } from '../../../../utils/session';
import { useLocationStore } from '../../../../stores/inspect/location';
import { addWatermarkToImage } from '../../util/image';
import dayjs from 'dayjs';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { useInspectPicStore } from '@/stores/inspect/inspect-pic';
import { getLoc } from '../../util/location';
import { useRegulatorStore } from '@/stores/inspect/regulator';
import { createLoading } from '../../../../utils/loading-fn';
import { qrScanner2 } from '@/utils/qrscanner2';
import { blobToBase64, base64ToBlob } from '@/utils/tools';
import Earth from '../../../../utils/earth';
import { parseWKTPolygon } from '@/utils/tools';
import L from 'leaflet';
import buffer from '@turf/buffer';
import { lineString } from '@turf/helpers';
import useUserStore from '@/stores/user';
import DropMenu from './vue/drop-menu.vue';
import { useMainDataStore } from '@/stores/inspect/main-data';

const inspectPic = useInspectPicStore();
const regulatorStore = useRegulatorStore();
const userStore = useUserStore();
const useMainData = useMainDataStore();

const router = useRouter();

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const bfSc = ref(20);

function getUsefulData() {
  api_pipeline.getPipelineBuffer().then(res => {
    bfSc.value = res.data.rows[0].configValue;
  });
}

getUsefulData();

const proxy = getCurrentInstance();

const locationStore = useLocationStore();

const isStarting = ref(false);

let earth = null;

let coverTimer = -1;

onMounted(() => {
  const recoveryFlag = localStorage.getItem('recoveryFlag');
  if (recoveryFlag) {
    restart();
    setTimeout(() => {
      localStorage.removeItem('recoveryFlag');
    }, 100);
  }
  recoverSavedData();

  const isfrompipeline = sessionStorage.getItem('isfrompipeline');
  if (isfrompipeline === 'true') {
    setTimeout(() => {
      sessionStorage.removeItem('isfrompipeline');
    }, 100);
    setTimeout(() => {
      showEarth();
    }, 600);
  }
});

onUnmounted(() => {
  clearTimeout(coverTimer);
});

const initForm = {
  blow: '1',
  construction: '1',
  occupy: '1',
  inspectArea: '',
  startingAddress: '',
  destinationAddress: '',

  pipelineName: '',
  problemDescp: '',
  result: '',
  workArea: '',
  workAreaText: JSON.parse(getUserInfo()).dept.deptName,
};

getDictType('work_area').then(res => {
  const r = res.data.rows.find(item => item.dictLabel === JSON.parse(getUserInfo()).dept.deptName);
  if (r) {
    formData.value.workArea = r.dictValue;
  }
});

const fileBlobs = ref([]);

const formData = ref({ ...initForm });

function getPatrolStatus(data) {
  let isOk = true;
  const keys = Object.keys(data);

  const keyA = ['blow', 'construction', 'occupy'];

  const index = keys.findIndex(item => {
    if (keyA.includes(item)) {
      return +data[item] === 0;
    }
    return false;
  });

  isOk = index === -1;

  return {
    patrolStatus: isOk ? 1 : 2,
  };
}

// 最后提交结果
const handleConfirm = async () => {
  // if (!formData.value['pipelineName']) {
  //   errorMessage.value = '必填项不能为空';
  //   document.querySelector('.pipelineName-required').scrollIntoView();
  //   return;
  // }

  // 必填的三张图片
  const pictureCache = inspectPic.pipelinePictureCache;

  if (!pictureCache.length) {
    showToast('请添加图片必填项');
    return;
  } else {
    const index = pictureCache
      .filter(item => item.name !== 'three')
      .findIndex(item => !item.fileList.length);
    if (index !== -1) {
      showToast('请添加图片必填项');
      return;
    }
  }

  showConfirmDialog({
    title: '提示',
    message: '确定结束本次巡检吗？',
  })
    .then(async () => {
      const destroy = createLoading('数据上传中，请稍等', { duration: 30000 });

      // const allLocation = await getAllLocation();

      // const reverseLocation = [...allLocation].reverse();

      // // 结束时记录起点位置
      // const item1 = allLocation.find(item => item.address);
      // if (item1) {
      //   formData.value.startingAddress = item1.address;
      // }

      // // 结束时记录终点位置
      // const item2 = reverseLocation.find(item => item.address);
      // if (item2) {
      //   formData.value.destinationAddress = item2.address;
      // }

      // 获取所有坐标，拿到后取开始和结束位置
      const result = await api_pipeline.getCoordinate(locationStore.checkId);

      const coordinates = result.data.rows;

      const reverseCoordinates = [...coordinates].reverse();

      const item3 = coordinates.find(item => item.address);
      if (item3) {
        formData.value.startingAddress = item3.address;
      }

      const item4 = reverseCoordinates.find(item => item.address);
      if (item4) {
        formData.value.destinationAddress = item4.address;
      }

      if (!formData.value.startingAddress) {
        formData.value.startingAddress = formData.value.destinationAddress;
      }
      if (!formData.value.destinationAddress) {
        formData.value.destinationAddress = formData.value.startingAddress;
      }

      // 拼写就是错的
      let annormalPoint = {
        annormalPoint: checkErrorArr.value.length > 0 ? JSON.stringify(checkErrorArr.value) : '[]',
      };

      const regulatorIds = regulatorStore.regulatorIdList;
      const wellIds = regulatorStore.wellIdList;
      const stationIds = regulatorStore.stationIdList;

      // 这里又要把图片改成blob
      const files = await Promise.all(
        fileBlobs.value.map(async item => {
          const picBlob = await base64ToBlob(item.picDataUrl, 'image/png');
          return {
            picBlob,
            name: item.name,
          };
        })
      );

      const pics = await Promise.all(
        pictureCache.map(async item => {
          if (item.fileList[0]) {
            const blob = await base64ToBlob(item.fileList[0].content, 'image/png');
            item.fileList[0].file = blob;
          }
          return item;
        })
      );

      const res = await api_pipeline
        .putCheckForm(
          {
            ...props.data,
            ...formData.value,
            ...getPatrolStatus(formData.value),
            ...annormalPoint,
            id: locationStore.checkId,
            patrolRegulatorTaskid: regulatorIds.join(','),
            patrolStationTaskid: stationIds.join(','),
            patrolValveTaskid: wellIds.join(','),
          },
          // 这里又要改回blob
          files,
          pics
        )
        .catch(err => {
          console.log('err', err);
          destroy();
        });

      // 处理巡检计划
      await api_pipeline
        .updatePlanCoverage(currentPlan.value.id, coverRate.value)
        .finally(() => destroy());

      destroy();

      if (res.status === 200 && res.data.code === 200) {
        // 关联调压箱
        if (regulatorIds.length) {
          const promises = regulatorIds.map(id =>
            api_regulator.putCheckForm({
              isFollow: true, // 有这个参数，是为了区分第一次巡检和后续巡检
              id,
              // blow: formData.value.blow,
              // construction: formData.value.construction,
              // occupy: formData.value.occupy,
              pipelineLength: coverLength.value,
              // pipelineTermination: formData.value.destinationAddress,
            })
          );

          const destroy = createLoading();
          await Promise.all(promises);
          destroy();
        }

        // 异常加入隐患系统
        if (getPatrolStatus(formData.value).patrolStatus === 2) {
          showConfirmDialog({
            title: '提示',
            message: '本次巡检结果存在异常，是否加入隐患系统？',
          })
            .then(() => {
              router.push('/inspect/inspect-pitfall-add?source=pipeline');
            })
            .catch(() => {});
        } else {
          showSuccessToast(res.data.msg);
        }

        initData();
      } else {
        showFailToast('提交失败');
      }
    })
    .catch(() => {
      // on cancel
    });
};

function initData() {
  stepValueBlow.value = 0;
  stepValueConstruction.value = 0;
  stepValueOccupy.value = 0;
  formData.value = { ...initForm };
  nextTick(() => {
    // 取消时不提示必填项
    errorMessage.value = '';
  });
  isStarting.value = false;
  checkErrorArr.value = [];

  locationStore.clear();

  // 隐藏弹幕
  removeBarrage();
  clearIsInspect();
  stopWatch();

  currentPlan.value = {};

  closeGetCover();
  coverGis.value = [];
  coverRate.value = 0;
  coverLength.value = 0;
}

// 开始巡检
const handleStartCheck = async () => {
  if (!formData.value.inspectArea) {
    showToast('请选择巡检区域');
    return;
  }

  showDialog({
    title: '提示',
    message: '巡检过程中可切换至调压箱、阀井、调压站、阴保进行巡检',
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: '知道了',
  });

  // 初始化次数
  locationStore.initTimes();
  // 清除绑定的其它设备巡检id
  regulatorStore.clearIdList();
  // 开始先清除三张照片缓存
  inspectPic.clearPipelinePictureCache();

  await locationStore.addPipelineData(currentPlan.value.id);

  let res;
  if (window.cordova) {
    res = await getBackgroundLocation(locationStore.autoExecForLocationChange, {
      title: '巡检管理',
      text: '管线巡检中',
    });
  } else {
    // res = true;
    res = () => {
      console.log('pc端测试');
    };
  }
  console.log(res);
  if (res) {
    showBarrage();
    setIsInspect(locationStore.checkId);

    isStarting.value = true;
    // 开启覆盖范围轮询
    startGetCover();
  } else {
    // 无法获取定位信息，请重试
    showDialog({
      title: '提示',
      message: '无法获取定位信息，请重试！',
    }).then(() => {
      // on close
    });

    initData();
  }
};

// 杀后台后进入重新巡检
const restart = async () => {
  // 初始化次数
  locationStore.initTimes();

  let res;
  if (window.cordova) {
    res = await getBackgroundLocation(locationStore.autoExecForLocationChange, {
      title: '巡检管理',
      text: '管线巡检中',
    });
  } else {
    // res = true;
    res = () => {
      console.log('pc端测试');
    };
  }
  console.log(res);
  if (res) {
    showBarrage();
    // 开启覆盖范围轮询
    startGetCover();
  } else {
    // 无法获取定位信息，请重试
    showDialog({
      title: '提示',
      message: '无法获取定位信息，请重试！',
    }).then(() => {
      // on close
    });

    initData();
  }
};

function showBarrage() {
  useBarrage('管线巡检中。。');
}

const handleCancel = () => {
  showConfirmDialog({
    title: '提示',
    message: '确定取消本次巡检吗？',
  })
    .then(() => {
      initData();
      // 取消时需要删除开始时新增的那条数据
      api_pipeline.deleteCheck(locationStore.checkId);
    })
    .catch(() => {
      // on cancel
    });
};

watchEffect(() => {
  saveEndState();
});

function saveEndState() {
  if (isStarting.value) {
    // 重新开始计时器
    // startLongTimerForTip();

    // 此时需要缓存
    locationStore.savaData({
      formData: { ...formData.value },
      checkErrorArr: [...checkErrorArr.value], // 数组，别改错了
      stepValue: {
        stepValueBlow: stepValueBlow.value,
        stepValueConstruction: stepValueConstruction.value,
        stepValueOccupy: stepValueOccupy.value,
      },
      fileBlobs: fileBlobs.value,
      currentPlan: currentPlan.value,
      coverRate: coverRate.value,
      coverLength: coverLength.value,
    });
  }
}

const recoverSavedData = () => {
  const isInspect = getIsInspect();
  if (isInspect) {
    const cache = locationStore.cacheData;

    // 巡检状态恢复
    isStarting.value = true;

    // 表单恢复
    formData.value = cache.formData;

    // 检测点恢复
    checkErrorArr.value = cache.checkErrorArr;

    // step值恢复
    stepValueBlow.value = +cache.stepValue.stepValueBlow;
    stepValueConstruction.value = +cache.stepValue.stepValueConstruction;
    stepValueOccupy.value = +cache.stepValue.stepValueOccupy;

    fileBlobs.value = cache.fileBlobs;

    // 0313功能改造后加的计划恢复
    currentPlan.value = cache.currentPlan;
    coverRate.value = cache.coverRate;
    coverLength.value = cache.coverLength;

    // 不知道行不行
    getPipData();

    startGetCover();
  }
};

const handleMultiBtnClick = async () => {
  // 开始巡检后才可以点击，后面要加判断
  if (!isStarting.value) {
    return;
  }
  localStorage.setItem('detailType', 'pipeline');
  router.push(`/inspect/add-picture?type=pipeline`);
};

function getPicture() {
  return new Promise(resolve => {
    showConfirmDialog({
      title: '提示',
      message: '是否需要添加照片？',
    })
      .then(async () => {
        const blob = await getPhoto();
        if (blob) {
          const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          const blob2 = await addWatermarkToImage(blob, currentTime);
          const d = await blobToBase64(blob2);
          resolve(d);
        }
      })
      .catch(() => {
        resolve('');
      });
  });
  // return 'pic的base64';
}

const checkErrorArr = ref([]);
const stepValueBlow = ref(0);
const stepValueConstruction = ref(0);
const stepValueOccupy = ref(0);

function beforeChange(type) {
  const currentValue =
    type === '漏气'
      ? stepValueBlow.value
      : type === '施工'
        ? stepValueConstruction.value
        : stepValueOccupy.value;

  return async value => {
    if (value > currentValue) {
      // 新增异常点
      // 添加照片
      // 因为要缓存，所以都把blob改成了base64
      const picDataUrl = await getPicture();
      const name = `${Date.parse(new Date())}${Math.floor(Math.random() * 1000)}`;
      if (picDataUrl) {
        // fileBlobs.value.push({ picBlob, name });
        fileBlobs.value.push({ picDataUrl, name });
      }
      const allLocation = await getAllLocation();
      const { longitude: x, latitude: y } = allLocation[allLocation.length - 1];
      checkErrorArr.value.push({
        label: type,
        x,
        y,
        picName: name,
      });
      console.log(checkErrorArr.value.length);
      return true;
    }
    return new Promise(resolve => {
      // 删除
      showConfirmDialog({
        title: '提示',
        message: '确定要删除最近一个异常巡检点吗？',
      })
        .then(() => {
          if (checkErrorArr.value.length > 0) {
            // 移除最后一个checkErrorArr
            checkErrorArr.value.pop();
          }
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  };
}

const handleStepChangeForItem = (type, val) => {
  if (formData.value[type]) {
    formData.value[type] = val > 0 ? '0' : '1';
  }
};

const errorMessage = ref('');

function handleQRBtnClick() {
  qrScanner2().then(res => {
    if (res) {
      getNoFromQR(res.split(':').pop());
    }
  });
}

const getNoFromQR = async deviceNO => {
  const basicParams = {
    // delegateStatus: "0", // 不是转派任务
    patrolStatus: '0', // 未查询
  };

  const params = {
    ...basicParams,
    ...{ pageNum: 1, pageSize: 10000 },
    ...{ regulatorNumber: deviceNO },
  };
  const res = await api_regulator.getList(params);
  if (res.status === 200 && res.data.code === 200) {
    // 时间点最近的
    const sorted = (res.data.rows ?? []).sort((a, b) => {
      const dateA = new Date(a.createTime);
      const dateB = new Date(b.createTime);
      return dateB.getTime() - dateA.getTime();
    });

    if (sorted.length > 0) {
      const data = sorted[0];
      router.push(`/inspect/checking/${data.id}?type=regulator&formType=edit`);
    } else {
      showToast('没有此设备的巡检任务');
    }
  } else {
    showToast('没有此设备的巡检任务');
  }
};

const showBottom = ref(false);

// 哪些数据要缓存，比如currentPlan

const planList = computed(() => {
  if (currentInspectWay.value === '0') {
    return useMainData.getPlansByType('gx');
  } else {
    return useMainData.getPlansByType('kx');
  }
});

// 范围内管线数据
const pipList = ref([]);

// 范围内调压箱数据
const boxList = computed(() => {
  if (currentInspectWay.value === '0') {
    return useMainData.getPointsByType('tyx');
  } else {
    return [];
  }
});

// 范围内阀井数据
const valveList = computed(() => {
  if (currentInspectWay.value === '0') {
    return useMainData.getPointsByType('fj');
  } else {
    return [];
  }
});

// 覆盖率查询type参数：0（两张表）/1(低压管线)/2高压管线)
const coverType = ref(0);

// 顶点坐标
const scList = ref([]);

async function getPipData() {
  if (!currentPlan.value.patrolZone) {
    return;
  }
  const sc = parseWKTPolygon(currentPlan.value.patrolZone);

  scList.value = sc.map(item => ({
    lon: item[0],
    lat: item[1],
  }));

  const [m, h, ty, fj] = await api_pipeline.getPipelineData(scList.value);

  pipList.value = [...m.data.line, ...h.data.line];

  // boxList.value = ty.data;

  // valveList.value = fj.data;

  if (m.data.line.length && !h.data.line.length) {
    coverType.value = 1;
  } else if (!m.data.line.length && h.data.line.length) {
    coverType.value = 2;
  }
}

// 用户选择的当前区域
const currentPlan = ref({});

const showEarthDialog = ref(false);

function handleChooseArea(item, index) {
  currentPlan.value = item;
  formData.value['inspectArea'] = item.community || `区域${index + 1}`;
  showBottom.value = false;

  showEarth();
}

let stopWatchCover = () => {};

let timer = -1;

// 要巡的调压箱、阀井列表
const regulatorAndValveList = computed(() => {
  const list = [];

  if (boxList.value.length) {
    list.push({
      title: '调压箱',
      list: boxList.value.map(item => {
        return {
          text: item.pointCode || '测试',
          value: item.pointSyscode,
          callback: async () => {
            if (!isStarting.value) {
              showToast('请先开始管线巡检后再进行调压箱巡检');
              return;
            }
            // 改造后逻辑
            const res1 = await api_regulator.getList({
              patrolPlanId: item.patrolPlanId,
              equipmentsyscode: item.pointSyscode,
              delegateStatus: '1',
            });

            const delegateData = res1.data.rows[0];

            if (delegateData) {
              // 转派
              router.push(
                `/inspect/checking/${delegateData.id}?type=regulator&formType=edit&isfrompipeline=1&isDelegate=true`
              );
              return;
            }

            const res = await api_regulator.addPost(item);
            const id = res.data.data;
            router.push(`/inspect/checking/${id}?type=regulator&formType=edit&isfrompipeline=1`);
          },
        };
      }),
    });
  }
  if (valveList.value.length) {
    list.push({
      title: '阀井',
      list: valveList.value.map(item => {
        return {
          text: item.pointCode || '测试',
          value: item.pointSyscode,
          callback: async () => {
            if (!isStarting.value) {
              showToast('请先开始管线巡检后再进行阀井巡检');
              return;
            }
            // 改造后逻辑
            const res1 = await api_well.getList({
              patrolPlanId: item.patrolPlanId,
              equipmentsyscode: item.pointSyscode,
              delegateStatus: '1',
            });

            const delegateData = res1.data.rows[0];

            if (delegateData) {
              // 转派
              router.push(
                `/inspect/checking/${delegateData.id}?type=well&formType=edit&isfrompipeline=1&isDelegate=true`
              );
              return;
            }

            const res = await api_well.addPost(item);
            const id = res.data.data;

            router.push(`/inspect/checking/${id}?type=well&formType=edit&isfrompipeline=1`);
          },
        };
      }),
    });
  }

  return list;
});

async function showEarth() {
  showEarthDialog.value = true;

  const destroy = createLoading('地图加载中，请稍等');

  await getPipData().finally(() => {
    destroy();
  });

  await nextTick();
  earth = new Earth('container', {
    showBoxAndValve: false,
  });

  await nextTick();

  earth.viewer.createPane('topLinePane');
  earth.viewer.getPane('topLinePane').style.zIndex = 9999;

  const points = pipList.value.map(item => {
    return item.geometry.coordinates.map(item => [...item].reverse());
  });

  earth.drawTracks(points, { color: '#f00' });

  // 显示调压箱
  const boxPoints = boxList.value.map(item => {
    const {
      lon: x,
      lat: y,
      pointCode: label,
      image = new URL('/src/assets/image/check/icon-tyx.png', import.meta.url).href,
      clickCallback = async () => {
        if (!isStarting.value) {
          showToast('请先开始管线巡检后再进行调压箱巡检');
          return;
        }

        // 改造后逻辑
        const res1 = await api_regulator.getList({
          patrolPlanId: item.patrolPlanId,
          equipmentsyscode: item.pointSyscode,
          delegateStatus: '1',
        });

        const delegateData = res1.data.rows[0];

        if (delegateData) {
          // 转派
          router.push(
            `/inspect/checking/${delegateData.id}?type=regulator&formType=edit&isfrompipeline=1&isDelegate=true`
          );
          return;
        }

        const res = await api_regulator.addPost(item);
        const id = res.data.data;
        router.push(`/inspect/checking/${id}?type=regulator&formType=edit&isfrompipeline=1`);
      },
    } = item;
    return {
      x: x || 0,
      y: y || 0,
      label,
      image,
      clickCallback,
    };
  });

  earth.addBillboards(boxPoints);

  // 显示阀井
  const valvePoints = valveList.value.map(item => {
    const {
      lon: x,
      lat: y,
      pointCode: label,
      image = new URL('/src/assets/image/check/icon-fj.png', import.meta.url).href,
      clickCallback = async () => {
        if (!isStarting.value) {
          showToast('请先开始管线巡检后再进行阀井巡检');
          return;
        }
        // 改造后逻辑

        const res1 = await api_well.getList({
          patrolPlanId: item.patrolPlanId,
          equipmentsyscode: item.pointSyscode,
          delegateStatus: '1',
        });

        const delegateData = res1.data.rows[0];

        if (delegateData) {
          // 转派
          router.push(
            `/inspect/checking/${delegateData.id}?type=well&formType=edit&isfrompipeline=1&isDelegate=true`
          );
          return;
        }

        const res = await api_well.addPost(item);
        const id = res.data.data;

        router.push(`/inspect/checking/${id}?type=well&formType=edit&isfrompipeline=1`);
      },
    } = item;
    return {
      x: x || 0,
      y: y || 0,
      label,
      image,
      clickCallback,
    };
  });

  const container = earth.container;

  const listContainer = document.createElement('div');
  listContainer.style.position = 'absolute';
  listContainer.style.top = '0';
  listContainer.style.left = '0';
  listContainer.style.width = '100%';
  listContainer.style.zIndex = 9999;
  listContainer.classList.add('list-container123');
  container.appendChild(listContainer);

  // 列表显示
  if (regulatorAndValveList.value.length) {
    createApp({
      render() {
        return h(DropMenu, { list: regulatorAndValveList.value });
      },
    }).mount(listContainer);
  }

  earth.addBillboards(valvePoints);

  const arr2 = scList.value.map(item => [item.lat, item.lon]);
  earth.drawTracks(arr2, { color: '#FBFB38' });

  // 显示自己位置
  showMyLocation();

  // 画覆盖线
  drawCoverLine();
}

async function showMyLocation() {
  const allLocation = await getAllLocation();
  if (allLocation.length < 5) {
    return;
  }

  const arr = allLocation.map(item => [item.latitude, item.longitude]);
  arr.shift();
  arr.shift();
  arr.shift();
  arr.shift();
  earth.drawCircleMarker(arr, { radius: 5 });

  let lastBuffer;

  timer = setInterval(async () => {
    const current = allLocation[allLocation.length - 1];
    earth.drawCircleMarker([[current.latitude, current.longitude]], {
      radius: 5,
    });

    // 缓冲区
    lastBuffer?.remove();
    await nextTick();
    const coordinates = allLocation.map(item => [item.longitude, item.latitude]);
    const line = lineString(coordinates);
    const buffered = buffer(line, bfSc.value, { units: 'meters' });
    lastBuffer = L.geoJSON(buffered, {
      style: {
        color: '#f00a',
        fillColor: '#ffcccc',
        fillOpacity: 0.3,
      },
    }).addTo(earth.viewer);
  }, 2000);
}

function closeEarthDialog() {
  clearTimeout(timer);

  stopWatchCover();
}

function bubbleClick() {
  showEarth();
}

// 覆盖率
const coverRate = ref(0);

// 轮询查覆盖率
// getCoverRate(); // 测试测试测试
// 覆盖率接口返回的gis
const coverGis = ref([]);

const coverLength = ref(0);

async function getCoverRate() {
  try {
    const res = await api_pipeline.getCoverage({
      // type: 1, // 测试测试测试
      // pipelinePlanId: 4065, // 测试测试测试
      type: coverType.value,
      pipelinePlanId: currentPlan.value.id,
    });

    coverRate.value = res.data.data.coverageRate;
    coverGis.value = res.data.data.coverageArea.map(item => {
      const gis = JSON.parse(item.gis);
      if (gis.type === 'MultiLineString') {
        return gis.coordinates.map(item => {
          return item.map(item => [...item].reverse());
        });
      } else if (gis.type === 'LineString') {
        return gis.coordinates.map(item => [...item].reverse());
      }
    });
    const l = res.data.data.coverageArea.reduce((prev, curr) => {
      return prev + curr.length_m;
    }, 0);

    coverLength.value = l.toFixed(2);
  } catch (error) {
    coverRate.value = 0;
    console.error(error);
  }
}

const COVER_TIME = 5 * 1000;
function startGetCover() {
  coverTimer = setInterval(() => {
    getCoverRate();
  }, COVER_TIME);
}

function closeGetCover() {
  // 关闭巡检范围轮询
  clearInterval(coverTimer);
  coverTimer = -1;
}

// 画覆盖线
function drawCoverLine() {
  let lastLine;
  // 零食需求，显示覆盖范围
  stopWatchCover = proxy.proxy.$watch(
    () => coverGis.value,
    () => {
      if (lastLine) {
        lastLine.remove();
      }
      lastLine = L.polyline(coverGis.value, { color: '#0f0', pane: 'topLinePane' }).addTo(
        earth.viewer
      );
    },
    {
      immediate: true,
    }
  );
}

const showBottom2 = ref(false);

const inspectWayList = ref([
  {
    label: '普通巡检',
    value: '0',
  },
  {
    label: '快速巡检',
    value: '1',
  },
]);

const inspectWay = ref('普通巡检');

const currentInspectWay = ref('0');

function handleInspectWay(item) {
  inspectWay.value = item.label;
  currentInspectWay.value = item.value;
  showBottom2.value = false;

  formData.value['inspectArea'] = '';
}

/* 考虑：开始时让计划覆盖率为'-1'，结束时改为实际数值，或者开始时不赋值*/
</script>

<template>
  <div class="main-container-2">
    <div class="card form">
      <!-- <check-item
        label="管线名称<i class='pipelineName-required' style='color: red;'>*</i>"
        :labelOneLine="true"
      >
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['pipelineName']"
            label=""
            label-align="top"
            placeholder="请输入管线名称"
            :error-message="formData['pipelineName'] ? '' : errorMessage"
          />
        </div>
      </check-item> -->
      <check-item label="作业区域" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['workAreaText']"
            label=""
            label-align="top"
            disabled
            placeholder="请输入作业区域"
          />
        </div>
      </check-item>

      <check-item label="巡检人" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            :modelValue="userStore.nickName"
            label=""
            label-align="top"
            maxlength="15"
            readonly
            disabled
          />
        </div>
      </check-item>

      <check-item label="巡检方式" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="inspectWay"
            label=""
            placeholder="请选择巡检方式"
            label-align="top"
            maxlength="15"
            readonly
            :disabled="isStarting"
            is-link
            @click-input="showBottom2 = true"
          />
        </div>
      </check-item>

      <check-item label="巡检区域" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['inspectArea']"
            label=""
            placeholder="请选择巡检区域"
            label-align="top"
            maxlength="15"
            readonly
            :disabled="isStarting"
            is-link
            @click-input="showBottom = true"
          />
        </div>
      </check-item>

      <check-item v-if="currentPlan.length" label="应巡长度(m)" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            :modelValue="currentPlan.length"
            label=""
            label-align="top"
            maxlength="15"
            readonly
            disabled
          />
        </div>
      </check-item>

      <check-item v-if="isStarting" label="已巡长度(m)" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            :modelValue="coverLength"
            label=""
            label-align="top"
            maxlength="15"
            readonly
            disabled
          />
        </div>
      </check-item>

      <check-item
        v-if="isStarting"
        label="覆盖率<span style='color: #0008'>（点击预览）</span>"
        :labelOneLine="true"
      >
        <div class="input-container">
          <van-field
            border
            :modelValue="coverRate + '%'"
            label=""
            label-align="top"
            maxlength="15"
            readonly
            @click="bubbleClick"
          />
        </div>
      </check-item>
    </div>

    <div class="card form">
      <check-item labelOneLine label="有无漏气">
        <div class="check-wrapper">
          <van-radio-group
            :disabled="!isStarting"
            v-model="formData['blow']"
            shape="dot"
            direction="horizontal"
          >
            <van-radio name="0" icon-size="16px" checked-color="#00B099">漏气</van-radio>
            <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          </van-radio-group>

          <van-stepper
            @change="val => handleStepChangeForItem('blow', val)"
            :disabled="!isStarting"
            :before-change="beforeChange('漏气')"
            min="0"
            v-model="stepValueBlow"
            step="1"
            disable-input
          />
        </div>
      </check-item>

      <check-item label="有无施工" labelOneLine>
        <div class="check-wrapper">
          <van-radio-group
            :disabled="!isStarting"
            v-model="formData['construction']"
            shape="dot"
            direction="horizontal"
          >
            <van-radio name="0" icon-size="16px" checked-color="#00B099">施工</van-radio>
            <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          </van-radio-group>

          <van-stepper
            @change="val => handleStepChangeForItem('construction', val)"
            :disabled="!isStarting"
            :before-change="beforeChange('施工')"
            min="0"
            v-model="stepValueConstruction"
            step="1"
            disable-input
          />
        </div>
      </check-item>

      <check-item label="有无占压" labelOneLine>
        <div class="check-wrapper">
          <van-radio-group
            :disabled="!isStarting"
            v-model="formData['occupy']"
            shape="dot"
            direction="horizontal"
          >
            <van-radio name="0" icon-size="16px" checked-color="#00B099">占压</van-radio>
            <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          </van-radio-group>

          <van-stepper
            @change="val => handleStepChangeForItem('occupy', val)"
            :disabled="!isStarting"
            :before-change="beforeChange('占压')"
            min="0"
            v-model="stepValueOccupy"
            step="1"
            disable-input
          />
        </div>
      </check-item>

      <ImgBtn type="editor" @onMultiBtnClick="handleMultiBtnClick" />

      <check-item label="问题说明" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['problemDescp']"
            label=""
            placeholder="请输入问题说明"
            label-align="top"
            type="textarea"
            :disabled="!isStarting"
          />
        </div>
      </check-item>

      <check-item label="处理结果" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['result']"
            label=""
            placeholder="请输入问题说明"
            label-align="top"
            type="textarea"
            :disabled="!isStarting"
          />
        </div>
      </check-item>
    </div>

    <div class="card btns">
      <van-row gutter="12">
        <!-- <van-col span="8">
          <van-button @click="handleTrans" size="small" plain block round type="success">转派</van-button>
        </van-col> -->
        <van-col span="7" v-if="isStarting">
          <van-button @click="handleCancel" size="small" block round type="success">
            取消
          </van-button>
        </van-col>
        <van-col span="10" v-if="isStarting">
          <van-button size="small" block round type="primary" @click="handleQRBtnClick">
            <van-icon name="scan" />
            扫码巡检调压箱
          </van-button>
        </van-col>
        <van-col span="7" v-if="isStarting">
          <van-button
            @click="handleConfirm"
            size="small"
            block
            round
            type="success"
            color="#FF6A00"
          >
            结束巡检
          </van-button>
        </van-col>

        <van-button
          v-else
          @click="handleStartCheck"
          size="small"
          block
          round
          type="success"
          color="#FF6A00"
          >开始巡检</van-button
        >
      </van-row>
    </div>

    <van-popup
      v-model:show="showBottom"
      position="bottom"
      :style="{ height: '30%', padding: '20px 0' }"
    >
      <div v-if="planList.length" class="outer">
        <template v-for="(item, index) in planList" :key="item.id">
          <div
            class="item"
            :class="{ active: item.id === currentPlan.id }"
            @click="handleChooseArea(item, index)"
          >
            {{ item.community || `区域${index + 1}` }}
          </div>
        </template>
      </div>
      <van-empty v-else image-size="70" description="暂无巡检任务" />
    </van-popup>

    <van-popup
      v-model:show="showBottom2"
      position="bottom"
      :style="{ height: '30%', padding: '20px 0' }"
    >
      <div class="outer">
        <template v-for="(item, index) in inspectWayList" :key="item.value">
          <div
            class="item"
            :class="{ active: item.value === currentInspectWay }"
            @click="handleInspectWay(item, index)"
          >
            {{ item.label }}
          </div>
        </template>
      </div>
    </van-popup>

    <transition name="fade">
      <van-dialog
        class="earth-dialog-wrapper"
        v-if="showEarthDialog"
        v-model:show="showEarthDialog"
        title="巡检区域"
        @confirm="closeEarthDialog"
      >
        <div id="container" style="height: 70vh"></div>
      </van-dialog>
    </transition>
  </div>
</template>

<style lang="less" scoped>
.main-container-2 {
  position: relative;
  padding-bottom: 60px;
  height: calc(100% - 113px);
  overflow-y: scroll;
}

.card {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: white;
  overflow-y: auto;
  overflow-x: hidden;
}

.btns {
  position: fixed;
  bottom: 50px;
  width: 100%;
}

.input-container {
  border-radius: 4px;
  opacity: 1;
  background: rgba(68, 116, 121, 0.1);
  border: 1px solid #e7eeee;
  width: 100%;

  :deep(.van-field) {
    // background-color: transparent;
  }
}
.empty {
  height: 32px;
}

.check-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;

  .van-radio-group {
    pointer-events: none;
  }
}

:deep(.van-loading) {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}

.earth-wrapper {
  height: calc(100vw - 48px);
  // height: 100vh;
}

.toolbar {
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.outer {
  height: 100%;
  overflow-y: scroll;

  .item {
    height: 40px;
    display: grid;
    place-items: center;
    font-size: 14px;
    color: #323233;

    &.active {
      background-color: #9ab0e8;
    }
  }
}

:deep(.earth-dialog-wrapper) {
  .van-dialog__header {
    padding: 0;
    height: 48px;
    line-height: 48px;
  }

  .van-dialog__content {
    padding: 0 2px;
  }
}

.box1 {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  background-color: #fff;
  border: 2px solid #5687f7;
  border-radius: 50%;

  span {
    color: #323233;
    font-size: 20px;
    font-weight: 600;
    position: relative;
    z-index: 2;
  }

  .box2 {
    position: absolute;
    height: 200%;
    width: 200%;
    top: 50%;
    background-color: #5687f7;
    border-radius: 50px;
    animation: rotate 4s linear infinite;
  }

  @keyframes rotate {
    to {
      transform: rotate(360deg);
    }
  }
}

:global(*) {
  --van-floating-bubble-size: 60px;
}
</style>
