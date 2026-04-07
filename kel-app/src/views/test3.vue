<template>
  <div>
    <button @click="btn1Click">开始</button>
    <button @click="btn2Click">结束</button>
    <button @click="btn3Click">获取当前位置</button>
    <button @click="btn4Click">获取全部位置</button>

    <!-- <div>state.enabled: {{ enabled }}(为true时启动位置追踪)</div> -->
    <h2>获取到的当前位置：{{ currentPosition }}</h2>
    <h2>测试后台长度：{{ arr.length }}</h2>
    <h2>监听位置变化：{{ location }}</h2>
    <h2>全部位置：{{ allLocation }}</h2>
  </div>
</template>

<script setup>
const location = ref({
  latitude: 1234567,
  longitude: 9876543,
});

const currentPosition = ref({ a: 123 });

const enabled = ref(0);

const arr = ref([]);

const allLocation = ref([]);

function btn1Click() {
  BackgroundGeolocation.configure({
    locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: 2,
    distanceFilter: 2,
    notificationTitle: 'Background tracking',
    notificationText: 'enabled',
    debug: true,
    interval: 5000,
    fastestInterval: 2000,
    activitiesInterval: 5000,
    stopOnTerminate: false,
    startOnBoot: true,
    // startForeground: true,
    // activitiesInterval: 10000,
    // url: 'http://192.168.81.15:3000/location',
    // httpHeaders: {
    //   'X-FOO': 'bar',
    // },
    // // customize post properties
    // postTemplate: {
    //   lat: '@latitude',
    //   lon: '@longitude',
    //   foo: 'bar', // you can also add your own properties
    // },
  });

  // 监听位置更新
  // BackgroundGeolocation.onLocation(function (l) {
  //   // console.log('[location] -', location);
  //   // "coords": {
  //   //    "latitude":  [Double],
  //   //    "longitude": [Double],
  //   //    "accuracy":  [Double],
  //   //    "speed":     [Double],
  //   //    "heading":   [Double],
  //   //    "altitude":  [Double]
  //   //    "ellipsoidal_altitude":  [Double]
  //   // 你可以在这里处理位置数据，例如发送到服务器
  //   location.value = l.coords;
  // });

  BackgroundGeolocation.on('location', function (l) {
    // handle your locations here
    // to perform long running operation on iOS
    // you need to create background task

    location.value = l;
    arr.value.push(l);
    // BackgroundGeolocation.startTask(function (taskKey) {
    //   setTimeout(() => {
    //     // execute long running task
    //     // eg. ajax post location
    //     // IMPORTANT: task has to be ended by endTask
    //     BackgroundGeolocation.endTask(taskKey);
    //   }, 60000);
    // });
  });

  BackgroundGeolocation.checkStatus(status => {
    if (!status.isRunning) {
      BackgroundGeolocation.start();
    }
  });
}

function btn2Click() {
  BackgroundGeolocation.stop();
}

function btn3Click() {
  BackgroundGeolocation.getCurrentLocation(
    e => {
      console.log(e);

      const { latitude = 1000, longitude = 2000 } = e;
      currentPosition.value = { latitude, longitude };
    },
    err => {
      console.error(err);
    },
    {
      timeout: 5000,
      enableHighAccuracy: true,
      maximumAge: 0,
    }
  );
}

function btn4Click() {
  BackgroundGeolocation.getLocations(e => {
    // 获取到数组的最后一个值就是onLocation事件的最新值
    allLocation.value = e.map(({ longitude, latitude }) => ({ longitude, latitude }));
  });
}
</script>

<style lang="less" scoped></style>
