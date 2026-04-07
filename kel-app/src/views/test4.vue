<template>
  <div class="wrapper">
    <div v-html="ifrSource" class="ifr-wrapper"></div>
    <div class="big" @click="zoom('+')">
      <van-icon size="2rem" name="plus" />
    </div>
    <div class="small" @click="zoom('-')">
      <van-icon size="2rem" name="minus" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { getProcessVariables, getPostByTaskId } from '@/api/work';
import { useRoute } from 'vue-router';
import config from '@/config';

const route = useRoute();
const props = defineProps(['innerWidth']);

const bbbb = [
  {
    lontitude: 113.917967,
    latitude: 22.562276
  },
  {
    lontitude: 113.827967,
    latitude: 22.565676 
  },
  {
    lontitude: 113.827957,
    latitude: 22.563676 
  }
]

const ifrSource = ref('');
let ifr = null;
let scale = 0;

onMounted(async () => {
  const res = await getProcessVariables(185276);
  const formContentObj = res.data.data.formJson;
  const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');

  ifrSource.value = atob(htmlobj.options.htmlContent).replace('/webroot/decision', config.frUrl);

  await nextTick();
  ifr = document.getElementById('iframeA');
  scale = innerWidth / ifr.width;
  ifr.style.transform = `scale(${scale})`;

  setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA').contentWindow;
      getFrData();
      var sendMessage = function () {
        return function (data) {
          ifr.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 1500);
  setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA').contentWindow;
      getFrData();
      var sendMessage = function () {
        return function (data) {
          ifr.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 4000);
});

// 获取报表数据
function getFrData() {
  getPostByTaskId(185266)
    .then(res => {
      window.sendMessage({
        type: 'read',
        data: res.data.data.operationAllContent,
      });
    })
    .catch(error => {
      console.log(error);
    });
}

// 放大缩小
function zoom(type) {
  if (type === '+') {
    scale += 0.1;
  } else {
    scale -= 0.1;
  }
  ifr.style.transform = `scale(${scale})`;
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow: scroll;

  .ifr-wrapper {
    width: fit-content;
    height: fit-content;
    position: relative;
    z-index: -1;

    :deep(#iframeA) {
      transform-origin: top left;
    }
  }

  .big {
    position: absolute;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    bottom: 20px;
    right: 60px;
    color: #34394f;
    border-radius: 4px;
    backdrop-filter: blur(10px);
  }

  .small {
    .big();
    right: 15px;
  }
}
</style>
