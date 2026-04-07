/* eslint-disable no-undef */
import { showToast, showDialog } from 'vant';
import { createLoading } from './loading-fn';
import coordtransform from 'coordtransform';
import { getIsInspect } from './session';

let permissions = window.cordova?.plugins?.permissions;

// 常用权限： CAMERA(拍照、视频)、RECORD_AUDIO(录音)、READ_EXTERNAL_STORAGE(读取外部存储)、WRITE_EXTERNAL_STORAGE(写入外部存储)、ACCESS_FINE_LOCATION(定位)、ACCESS_COARSE_LOCATION(定位)

/**
 * @desc 获取权限
 * @param {string} param - 参数字符串，如"RECORD_AUDIO"、"CAMERA"、"READ_EXTERNAL_STORAGE"
 * @returns {Promise<boolean>}
 */
export async function getPermissions(...args) {
  if (!window.cordova) {
    return;
  }

  // 虽然我重写了扫描二维码模块，但是原因应该就是这里，没有拿到permission
  if (!permissions) {
    permissions = window.cordova.plugins.permissions;
    // return false;
  }
  const noPermissions = await checkPermission(...args);
  if (!noPermissions.length) {
    return true;
  }
  const hasPermission = await requestPermission(noPermissions);
  return hasPermission;
}

async function checkPermission(...args) {
  const promises = args.map(item => {
    return new Promise((resolve, reject) => {
      permissions.checkPermission(
        permissions[item],
        data => {
          if (data.hasPermission) {
            resolve(true);
          } else {
            reject(permissions[item]);
          }
        }
        // (err) => reject(err)
      );
    });
  });

  const res = await Promise.allSettled(promises);
  const noPermissions = res.filter(item => item.status === 'rejected').map(item => item.reason);

  return noPermissions;
}

function requestPermission(args) {
  return new Promise(resolve => {
    permissions.requestPermissions(args, data => {
      resolve(data.hasPermission);
    });
  });
}

/**
 * @description 二维码扫描
 * @returns {Promise<{text: string}> | boolean}
 */
export async function scanQRCode() {
  const res = await getPermissions('CAMERA');
  if (res) {
    return new Promise(resolve => {
      cordova.plugins.barcodeScanner.scan(
        result => {
          resolve(result);
        },
        error => {
          reject(error);
        },
        {
          preferFrontCamera: false, // iOS and Android
          showFlipCameraButton: false, // iOS and Android
          showTorchButton: true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          saveHistory: true, // Android, save scan history (default false)
          prompt: '将二维码放置在扫描区域内', // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats: 'QR_CODE,PDF_417', // default: all but PDF_417 and RSS_EXPANDED
          orientation: 'portrait', // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations: true, // iOS
          disableSuccessBeep: false, // iOS and Android
        }
      );
    });
  }
}

// 打开定位服务辅助函数和辅助变量
let rootResolve = null;
const onResume = () => {
  isLocationServiceEnable().then(res => {
    if (!res) {
      document.removeEventListener('resume', onResume);
    }
    rootResolve(res);
  });
};

// 定位服务是否打开
async function isLocationServiceEnable() {
  return new Promise(resolve => {
    if (window.cordova?.plugins?.diagnostic) {
      cordova.plugins.diagnostic.isLocationEnabled(resolve);
    }
  });
}

// 打开定位服务
export async function turnOnLocationService() {
  return new Promise(async resolve => {
    const res = await isLocationServiceEnable();
    if (res) {
      // 定位服务已打开，可以请求定位权限了
      // resolve(true);
      const res2 = await getPermissions('ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION');
      resolve(res2);
    } else {
      rootResolve = resolve;
      showDialog({
        title: '提示',
        message: '需要打开系统定位服务开关！',
      }).then(() => {
        // 监听应用切换回前台
        document.addEventListener('resume', onResume, false);
        cordova.plugins.diagnostic.switchToLocationSettings();
      });
    }
  });
}

let locationArr = [];

/**
 * @description 获取经纬度
 * @returns {Promise<{longitude: number,latitude: number} | boolean>}
 */
let clear,
  timer = -1;
export async function getLocation() {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const isInspect = getIsInspect();
    if (!isInspect) {
      clear && clear();
    }
  }, 30000); // 30秒不重试，则关闭定位

  if (locationArr.length) {
    return locationArr[locationArr.length - 1];
  }

  return new Promise(async resolve => {
    clear = await getBackgroundLocation(value => {
      resolve(value);
    });
  });

  // const r = await turnOnLocationService();
  // if (!r) return;
  // console.log('定位服务已开启');

  // const destroy = createLoading('获取定位信息中');

  // const res = await getPermissions('ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION');
  // console.log('获取权限成功：', res);
  // if (res) {
  // return new Promise(resolve => {
  // navigator.geolocation.getCurrentPosition(
  //   data => {
  //     const { longitude, latitude } = data.coords;
  //     resolve({
  //       longitude,
  //       latitude,
  //     });
  //     destroy();
  //   },
  //   () => {
  //     resolve(false);
  //     destroy();
  //   },
  //   {
  //     enableHighAccuracy: true,
  //     timeout: 30000,
  //     maximumAge: 1000,
  //   }
  // );
  // baidu_location.getCurrentPosition(
  //   res => {
  //     const a = coordtransform.gcj02towgs84(res.longitude, res.latitude);
  //     resolve({
  //       longitude: a[0],
  //       latitude: a[1],
  //     });
  //     destroy();
  //   },
  //   () => {
  //     resolve(false);
  //     destroy();
  //   }
  // );
  // });

  // } else {
  //   destroy();
  // }
}

/**
 * 启动位置服务并监视设备位置的变化。
 *
 * @async
 * @function watchLocation
 * @returns {Promise<Object|boolean>} 如果成功，则返回包含位置数据数组和清除监视函数的对象；如果失败，则返回 false。
 *
 * @example
 * async function startWatching() {
 *   const locationData = await watchLocation();
 *   if (locationData) {
 *     console.log('位置数据:', locationData.data);
 *     // 清除监视
 *     locationData.clearWatch();
 *   } else {
 *     console.log('无法获取位置数据');
 *   }
 * }
 */
// export async function watchLocation() {
//   const r = await turnOnLocationService();
//   if (!r) {
//     showToast('定位服务未打开！');
//     return;
//   }
//   console.log('定位服务已开启');
//
//   const res = await getPermissions('ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION');
//   console.log('获取权限成功：', res);
//   if (!res) {
//     showToast('获取权限失败！');
//     return;
//   }
//
//   return new Promise(resolve => {
//     const destroyLoading = createLoading('获取定位中');
//     let watchId;
//     const arr = [];
//     const clearWatch = () => navigator.geolocation.clearWatch(watchId);
//     watchId = navigator.geolocation.watchPosition(
//       data => {
//         const { longitude, latitude } = data.coords;
//         arr.push({ longitude, latitude });
//         destroyLoading && destroyLoading();
//         resolve({
//           data: arr,
//           clearWatch,
//         });
//       },
//       () => {
//         destroyLoading && destroyLoading();
//         resolve(false);
//
//         // showDialog({
//         //   title: '错误',
//         //   message: err
//         // });
//       },
//       {
//         enableHighAccuracy: true,
//         // timeout: 5000
//         maximumAge: 0,
//       }
//     );
//   });
// }

/**
 * 异步获取照片的函数
 *
 * 该函数首先检查相机权限，然后调用Cordova相机插件获取照片。如果获取的照片文件
 * 大小超过指定的最大值，则返回false并显示提示信息；否则，将文件转换为Blob对象
 * 并返回。
 *
 * @param {Object} [option={ maxSize: 8 }] - 选项参数对象
 * @param {number} option.maxSize - 最大文件大小（以MB为单位），默认值为8MB
 * @returns {Promise<Blob|boolean>} - 返回包含照片Blob对象的Promise，如果文件太大或获取失败，则返回false
 */
export async function getPhoto(option = { maxSize: 8 }) {
  const res = await getPermissions('CAMERA');
  if (res) {
    return new Promise(resolve => {
      navigator.camera.getPicture(
        url => {
          window.resolveLocalFileSystemURL(url, function (fileEntry) {
            fileEntry.file(file => {
              if (file.size > option.maxSize * 1024 ** 2) {
                resolve(false);
                return showToast(`文件大小不能超过 ${option.maxSize}Mb`);
              }

              //cordova插件会将file对象偷偷修改，需要转化为Blob格式才能正确上传
              const reader = new FileReader();
              reader.readAsArrayBuffer(file);
              reader.onload = e => {
                const buffer = e.target.result;
                const blob = new Blob([buffer], { type: file.type });
                resolve(blob);
              };
            });
          });
        },
        () => {
          resolve(false);
        },
        {
          quality: 20,
          destinationType: Camera.DestinationType.FILE_URI,
        }
      );
    });
  }
}

/**
 * 异步获取音频录制权限并提供录音功能。
 *
 * @returns {Promise<Object>} 包含开始录音和停止录音的函数对象。
 *
 * @example
 * const { startRecord, stopRecord } = await getAudio();
 * startRecord();
 * const audioBlob = await stopRecord();
 * if (audioBlob) {
 *   console.log('录音文件已获取:', audioBlob);
 * } else {
 *   console.log('录音失败或时间太短');
 * }
 *
 * @function
 * @name getAudio
 *
 * @async
 * @throws {Error} 如果获取录音权限失败。
 *
 * @description
 * 该函数请求用户的录音权限并提供 `startRecord` 和 `stopRecord` 两个函数用于控制录音。
 * - `startRecord`: 开始录音。
 * - `stopRecord`: 停止录音并返回录音文件的 Blob 对象。如果录音时间小于 1 秒，则返回 false 并提示用户录音时间太短。
 *
 * @returns {Object} 返回一个包含两个方法的对象：
 * - `startRecord`: 开始录音的方法。
 * - `stopRecord`: 停止录音并返回录音文件 Blob 对象的 Promise。
 */
export async function getAudio() {
  const res = await getPermissions('RECORD_AUDIO');
  if (res) {
    const src = `aaa.mp3`;
    let media;
    const startRecord = () => {
      media = new Media(src);
      media.startRecord();
    };

    const stopRecord = () => {
      return new Promise(resolve => {
        if (media) {
          media.stopRecord();
          // 播放之后才能拿到长度
          media.play();
          media.setVolume('0.0');
          setTimeout(() => {
            const dur = media.getDuration();
            media.stop();
            if (dur < 1) {
              resolve(false);
              return showFailToast('说话时间太短');
            }
            window.resolveLocalFileSystemURL(
              `file:///storage/emulated/0/Android/data/com.kel.app/files/${src}`,
              fileEntry =>
                fileEntry.file(async file => {
                  // 代码如山
                  const reader = new FileReader();
                  reader.readAsArrayBuffer(file);
                  reader.onload = async e => {
                    const buffer = e.target.result;
                    const blob = new Blob([buffer], { type: file.type });
                    resolve(blob);
                    media = void 0;
                  };
                })
            );
          }, 500);
        } else {
          resolve(false);
        }
      });
    };

    return { startRecord, stopRecord };
  }
}

/**
 * @description 检查设备是否安装某个app
 * @param {string} appId - app的id，比如百度地图为com.baidu.BaiduMap
 */
export function checkAppAvailable(appId) {
  return new Promise(resolve => {
    window.appAvailability.check(
      appId, // Package Name
      resolve
    );
  });
}

/**
 * 使用百度地图导航到指定位置的函数。
 *
 * @param {number} latitude - 目标位置的纬度。
 * @param {number} longitude - 目标位置的经度。
 * @param {string} destName - 目标位置的名称。
 * @param {string} [description=destName] - 目标位置的描述（默认为目标位置的名称）。
 *
 * @returns {void}
 *
 * @description
 * 该函数根据提供的经纬度和位置名称，检查百度地图应用是否可用。
 * 如果百度地图应用可用，则使用百度地图进行导航；否则，使用百度地图网页版显示目标位置。
 *
 * 使用 Cordova 的 InAppBrowser 插件在系统浏览器中打开导航链接。
 *
 * 示例：
 * navigateByLocation(39.915, 116.404, '天安门', '北京的标志性建筑');
 */
export function navigateByLocation(latitude, longitude, destName, description = destName) {
  const a = coordtransform.wgs84togcj02(longitude, latitude);
  const [destinationLng, destinationLat] = coordtransform.gcj02tobd09(a[0], a[1]);

  // const destinationLat = latitude; // 目标纬度
  // const destinationLng = longitude; // 目标经度
  const destination = destinationLat + ',' + destinationLng;

  checkAppAvailable('com.baidu.BaiduMap').then(res => {
    let url;
    if (res) {
      url = `baidumap://map/direction?destination=latlng:${destination}|name:${destName}&mode=driving&src=webapp`;
    } else {
      url = `http://api.map.baidu.com/marker?location=${destinationLat},${destinationLng}&title=${destName}&content=${description}&output=html`;
    }

    cordova.InAppBrowser.open(url.replaceAll('#', '号'), '_system');
  });
}

// 修改状态栏bar
export function useStatusbar() {
  return window.StatusBar;
}

// 文件保存手机中
export async function saveFile(blob, name) {
  return new Promise(resolve => {
    window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dirEntry) {
      // 创建或获取文件
      dirEntry.getFile(name, { create: true, exclusive: false }, function (fileEntry) {
        // 创建 FileWriter 对象
        fileEntry.createWriter(function (fileWriter) {
          fileWriter.onwriteend = function () {
            console.log('File write completed');
            resolve(cordova.file.externalDataDirectory + name);
          };

          fileWriter.onerror = function (e) {
            console.log('File write failed: ' + e.toString());
            resolve(false);
          };

          // 将 blob 写入文件
          fileWriter.write(blob);
        });
      });
    });
  });
  // 获取文件系统
}

// 巡检后台定位
export async function getBackgroundLocation11(cb, options) {
  // if (!window.BackgroundGeolocation) return;
  const r = await turnOnLocationService();
  if (!r) {
    showToast('定位服务未打开！');
    return;
  }

  const destroyLoading = createLoading('获取定位中');

  BackgroundGeolocation.configure({
    // locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
    locationProvider: BackgroundGeolocation.RAW_PROVIDER,
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: 5,
    distanceFilter: 5,
    notificationTitle: options.title || 'Background tracking',
    notificationText: options.text || 'enabled',
    debug: import.meta.env.DEV,
    interval: 5000,
    fastestInterval: 2000,
    activitiesInterval: 5000,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  BackgroundGeolocation.on('location', l => {
    const { longitude, latitude } = l;
    cb({ longitude, latitude });
  });

  BackgroundGeolocation.checkStatus(status => {
    if (!status.isRunning) {
      BackgroundGeolocation.start();
    }
    destroyLoading();
  });

  return () => {
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners('location');
  };
}

export async function getBackgroundLocation(cb, options) {
  const r = await turnOnLocationService();
  if (!r) {
    showToast('定位服务未打开！');
    return;
  }

  const destroyLoading = createLoading('获取定位中', { duration: 100000 });

  // let i = 0;

  baidu_location.watchPositionFront(
    res => {
      const a = coordtransform.gcj02towgs84(res.longitude, res.latitude);

      const locRes = {
        longitude: a[0],
        latitude: a[1],
        speed: Number(res.speed),
        direction: String(res.direction),
        // address: res.district + res.town + res.street + res.locationDescribe,
        address: res.town + res.street + res.locationDescribe,
      };

      locationArr.push(locRes);
      cb(locRes);

      destroyLoading();
    },
    err => {
      destroyLoading();
      alert(err);
    },
    {
      // 定位间隔时间(不小于1000，单位ms，默认1000)
      scanInterval: 2000,
      //0 (默认) Hight_Accuracy：高精度；
      //1 Battery_Saving：低功耗；
      //2 Device_Sensors：仅使用设备；
      //3 Fuzzy_Locating, 模糊定位模式；v9.2.8版本开始支持，可以降低API的调用频率，但同时也会降低定位精度；
      locationMode: 0,

      // 设置返回经纬度坐标类型，默认gcj02
      //gcj02：国测局坐标；
      //bd09ll：百度经纬度坐标；
      //bd09：百度墨卡托坐标；
      //海外地区定位，无需设置坐标类型，统一返回wgs84类型坐标
      coorType: 'gcj02',

      // 消息标题
      notificationTitle: '巡检管理',
      // 消息内容
      notificationContent: '巡检定位中',
    }
  );

  return () => {
    baidu_location.clearWatchFront();
    locationArr = [];
  };
}

// 添加一个关闭持续定位方法
export function stopWatch() {
  baidu_location.clearWatchFront();
  locationArr = [];
}

// 获取当前位置，目前就在管线巡检中使用，，因为没有进行权限获取
// 测试好像有问题，每次都只能获取到最初的那个位置，而不是当前位置
// export async function getCurrentLocation() {
//   return new Promise(resolve => {
//     BackgroundGeolocation.getCurrentLocation(
//       e => {
//         if (e.longitude) {
//           const { latitude, longitude } = e;
//           resolve({ latitude, longitude });
//         }
//       },
//       err => {
//         console.error(err);
//       },
//       {
//         timeout: 5000,
//         enableHighAccuracy: true,
//         maximumAge: 0,
//       }
//     );
//   });
// }

// 旧方法
export async function getAllLocation1() {
  return new Promise(resolve => {
    BackgroundGeolocation.getLocations(e => {
      // 获取到数组的最后一个值就是onLocation事件的最新值
      resolve(e.map(({ longitude, latitude }) => ({ longitude, latitude })));
    });
  });
}

// 这个在管线巡检中可以使用
export async function getAllLocation() {
  return locationArr;
}
