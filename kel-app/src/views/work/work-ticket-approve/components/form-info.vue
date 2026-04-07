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
import { getUserPermissionsInfo } from '@/api/system';
import { useRoute } from 'vue-router';
import config from '@/config';
import { createLoading } from '../../../../utils/loading-fn';
import workQRode from '@/views/work/other/workQRode.img?raw';

const route = useRoute();

const ifrSource = ref('');
let ifr = null;
let scale = 0;

let timer1, timer2;

onMounted(async () => {
  const res = await getProcessVariables(route.query.taskId);
  const formContentObj = res.data.data.formJson;
  const htmlobj = formContentObj.widgetList.find(item => item.type === 'html-text');

  ifrSource.value = atob(htmlobj.options.htmlContent).replace('/webroot/decision', config.frUrl);

  await nextTick();
  ifr = document.getElementById('iframeA');

  ifr.onload = () => {
    nextTick(() => {
      scale = window.innerWidth / ifr.width;
      ifr.style.transform = `scale(${scale})`;
    });
    setTimeout(() => {
      getFrData();
    }, 1000);
  };

  timer1 = setTimeout(() => {
    (function (win, doc) {
      var ifr = doc.getElementById('iframeA')?.contentWindow;
      // getFrData();
      var sendMessage = function () {
        return function (data) {
          ifr?.postMessage(data, '*');
        };
      };
      win.sendMessage = sendMessage();
    })(window, document);
  }, 1000);
  timer2 = -1;
  // timer2 = setTimeout(() => {
  //   (function (win, doc) {
  //     var ifr = doc.getElementById('iframeA')?.contentWindow;
  //     getFrData();
  //     var sendMessage = function () {
  //       return function (data) {
  //         // 我猜的，，在表单内部，会自动执行message事件监听，在外部window，需要手动监听
  //         ifr?.postMessage(data, '*');
  //       };
  //     };
  //     win.sendMessage = sendMessage();
  //   })(window, document);
  // }, 3000);
});

// 从操作票中取出的
const detailData = ref({});

let destroy;

// 获取报表数据
function getFrData() {
  destroy = createLoading('', { duration: 1500 });
  // console.log(11111111111);
  getPostByTaskId(route.query.procInsId)
    .then(async res => {
      detailData.value = res.data.data;
      let data = JSON.parse(res.data.data.operationAllContent);
      let workOperationType = route.query.workOperationType;
      if (
        workOperationType == '高处安全作业' ||
        workOperationType == '盲板抽堵安全作业' ||
        workOperationType == '吊装安全作业' ||
        workOperationType == '有限空间安全作业'
      ) {
        delete data['R44'];
        delete data['R45'];
        let person1 = await getUserDetail(data['AA44']);
        let person2 = await getUserDetail(data['AA45']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A47'] = img1;
        } else {
          data['A47'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B47'] = img2;
        } else {
          data['B47'] = person2;
        }
        data['E47'] = workQRode;
      } else if (workOperationType == '断路安全作业') {
        delete data['R33'];
        delete data['R34'];
        delete data['R35'];
        let person1 = await getUserDetail(data['AA33']);
        let person2 = await getUserDetail(data['AA34']);
        let person3 = await getUserDetail(data['AA35']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A37'] = img1;
        } else {
          data['A37'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B37'] = img2;
        } else {
          data['B37'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C37'] = img3;
        } else {
          data['C37'] = person3;
        }
        data['E47'] = workQRode;
      } else if (workOperationType == '临时用电安全作业') {
        delete data['R46'];
        delete data['R47'];
        delete data['R48'];
        let person1 = await getUserDetail(data['AA46']);
        let person2 = await getUserDetail(data['AA47']);
        let person3 = await getUserDetail(data['AA48']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A50'] = img1;
        } else {
          data['A50'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B50'] = img2;
        } else {
          data['B50'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C50'] = img3;
        } else {
          data['C50'] = person3;
        }
      } else if (workOperationType == '挖掘动土安全作业') {
        delete data['R44'];
        delete data['R45'];
        delete data['R46'];
        let person1 = await getUserDetail(data['AA44']);
        let person2 = await getUserDetail(data['AA45']);
        let person3 = await getUserDetail(data['AA46']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A48'] = img1;
        } else {
          data['A48'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B48'] = img2;
        } else {
          data['B48'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C48'] = img3;
        } else {
          data['C48'] = person3;
        }
      } else if (workOperationType == '动火安全作业') {
        delete data['R43'];
        delete data['R44'];
        delete data['R45'];
        let person1 = await getUserDetail(data['AA43']);
        let person2 = await getUserDetail(data['AA44']);
        let person3 = await getUserDetail(data['AA45']);
        if (person1.length > 10) {
          let img1 = '<img width="60" src="' + person1 + '"/>';
          data['A47'] = img1;
        } else {
          data['A47'] = person1;
        }
        if (person2.length > 10) {
          let img2 = '<img width="60" src="' + person2 + '"/>';
          data['B47'] = img2;
        } else {
          data['B47'] = person2;
        }
        if (person3.length > 10) {
          let img3 = '<img width="60" src="' + person3 + '"/>';
          data['C47'] = img3;
        } else {
          data['C47'] = person3;
        }
      }
      window.sendMessage({
        type: 'read',
        data: JSON.stringify(data),
      });

      console.log(222222222);

      // destroy && destroy();
    })
    .catch(error => {
      console.log(333333333333);
      console.log(error);
    });
}

async function getUserDetail(userId) {
  if (!userId) {
    return '';
  }
  return await getUserPermissionsInfo(userId).then(res => {
    if (res.data.data.signature) {
      return res.data.data.signature;
    } else {
      return res.data.data.nickName;
    }
  });
}

// 放大缩小
function zoom(type) {
  if (type === '+') {
    scale += 0.4;
  } else {
    scale -= 0.4;
  }
  ifr.style.transform = `scale(${scale})`;
}

onUnmounted(() => {
  clearTimeout(timer1);
  clearTimeout(timer2);
  destroy && destroy();
});
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 5px;
  overflow: hidden;

  .ifr-wrapper {
    width: 100%;
    height: 100%;
    margin-bottom: 120px;
    overflow: scroll;

    :deep(#iframeA) {
      transform-origin: top left;
      position: relative;
      z-index: -1;
    }
  }

  .big {
    position: fixed;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    bottom: 20px;
    left: 75vw;
    color: #34394f;
    border-radius: 4px;
    backdrop-filter: blur(10px);
    z-index: 9999;
  }

  .small {
    .big();
    left: 85vw;
  }
}
</style>
