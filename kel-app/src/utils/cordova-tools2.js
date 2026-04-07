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

// 设置后台保活
export function setKeepAlive() {
  // let timer = -1;
  // cordova.plugins.backgroundMode.on('activate', function () {
  //   cordova.plugins.backgroundMode.disableWebViewOptimizations();
  //   cordova.plugins.backgroundMode.disableBatteryOptimizations();
  //   timer = setInterval(() => {
  //     console.log('后台运行中');
  //   }, 1000);
  // });
  // cordova.plugins.backgroundMode.on('deactivate', function () {
  //   clearInterval(timer);
  // });
  // cordova.plugins.backgroundMode.setDefaults({ title: '后台运行中', text: '', bigText: true });
  // cordova.plugins.backgroundMode.enable();
  // // or
  // cordova.plugins.backgroundMode.setEnabled(true);
  // cordova.plugins.backgroundMode.excludeFromTaskList();
}
