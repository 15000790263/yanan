<template>
  <div class="wrapper">
    <div :class="`tips ext${main?.type}`">
      <van-text-ellipsis :content="name" />
      <div class="detail" @click="goDetail">详情</div>
    </div>

    <!-- 新指令信息 -->
    <div class="new-message" v-if="newMessageInfo" @click="handleScroll">
      <van-text-ellipsis :content="newMessageInfo.content" />
    </div>

    <!-- 组长角色任务列表 -->
    <!-- <div class="task-list">
      <div class="task-item">
        <div class="left">
          <div class="title">任务-1</div>
          <div class="desc">负责抢险完毕后的善后工作</div>
        </div>
        <div class="right confirmed">已确认</div>
      </div>
      <div class="task-item">
        <div class="left">
          <div class="title">任务-1</div>
          <div class="desc">负责抢险完毕后的善后工作</div>
        </div>
        <div class="right">确认</div>
      </div>
      <div class="task-item">
        <div class="left">
          <div class="title">任务-1</div>
          <div class="desc">负责抢险完毕后的善后工作</div>
        </div>
        <div class="right">确认</div>
      </div>
    </div> -->

    <div class="nav-bar">
      <div class="left">应急过程</div>
      <div class="right">
        <span>我的任务</span>
        <van-switch v-model="checked" />
      </div>
    </div>

    <div class="content">
      <PullUpRefresh v-if="startObserve" @loadMore="handleLoadMore">
        <!-- 时间轴信息 -->
        <van-steps direction="vertical" :active="0" active-color="#34394F" inactive-color="#34394F">
          <template v-for="item in [...eventInfoList].reverse()" :key="item.id">
            <van-step>
              <div class="step-item" :id="item.id">
                <div class="summary">
                  <div class="top">
                    <div class="name">{{ item.sendBy || '管理员' }}</div>
                    <div class="date">{{ item.eventTime }}</div>
                  </div>
                  <div class="bottom">
                    <van-text-ellipsis :content="item?.address" />
                  </div>
                </div>

                <!-- 消息、信息 -->
                <div class="info">
                  <div class="message">
                    {{ item.content !== 'null' ? item.content : '' }}
                  </div>
                  <div
                    v-if="item.fileIds && item.messageType === '5'"
                    class="voice-message"
                    :class="{ 'is-playing': currentPlayId === item.id && isPlay }"
                    @click="play(item)"
                  ></div>
                </div>
                <div v-if="item.image" class="imgs">
                  <div
                    v-intersect="() => loadImage(item)"
                    v-if="item.image === '1'"
                    class="my-loading"
                  >
                    <van-loading type="spinner" color="#1989fa" />
                  </div>
                  <div v-else class="vbi" @click="handlePreview(item)">
                    <video
                      v-if="item.messageType === '6'"
                      poster="~@/assets/image/emergency/icon-video04.png"
                      :src="item.cover"
                    ></video>
                    <img
                      style="height: 60px; object-fit: contain"
                      v-else-if="!item.isImage"
                      :src="item.cover"
                      alt=""
                    />
                    <img v-else class="thumbnail" alt="" :src="item.image" />
                  </div>
                </div>
                <div
                  v-if="main?.eventStatus === '2'"
                  v-show="item.sendById === userInfo?.userId && !item.fileIds"
                  class="modify"
                  @click="handleModify(item)"
                >
                  修改
                </div>
              </div>
              <template #active-icon>
                <img
                  class="step-icon"
                  src="../../../assets/image/emergency/time-point.png"
                  alt=""
                />
              </template>
              <template #inactive-icon>
                <img
                  class="step-icon"
                  src="../../../assets/image/emergency/time-point.png"
                  alt=""
                />
              </template>
              <template #finish-icon>
                <img
                  class="step-icon"
                  src="../../../assets/image/emergency/time-point.png"
                  alt=""
                />
              </template>
            </van-step>
          </template>
        </van-steps>

        <template #loading>
          <div style="padding: 5px; color: #0008">数据加载中...</div>
        </template>
      </PullUpRefresh>
    </div>

    <!-- 输入框 -->
    <div v-if="main?.eventStatus === '2'" class="edit-area" ref="inputWrapperRef">
      <van-cell-group inset>
        <van-field
          v-model.trim="inputValue"
          rows="1"
          :autosize="{ maxHeight: 100 }"
          type="textarea"
          :placeholder="isAddress ? '请输入地址' : '请输入内容'"
          @keydown.enter="handleEnter"
        >
          <template #button>
            <div v-if="!isAddress" class="right">
              <!-- <div class="arrow" @click="send"></div> -->
              <div v-if="!useVoice" class="image" @click="addImg"></div>
              <div class="more" @click="handleAddress"></div>
            </div>
            <div v-else class="right">
              <div class="address-icon" @click="addressed"></div>
            </div>
          </template>
          <template v-if="!isAddress" #left-icon>
            <div v-if="useVoice" class="keyboard" @click="useKeyBoard"></div>
            <div v-else class="mic" @click="useVoice = true"></div>
          </template>
          <template v-if="useVoice" #input>
            <div class="send-voice" @touchstart="handleTouchstart" @touchend="handleTouchend">
              <div v-show="!isPressed" class="text">按住发送语音</div>
              <div v-show="isPressed" class="lines"></div>
              <!-- <div class="lines"></div> -->
            </div>
          </template>
        </van-field>
      </van-cell-group>
      <div class="address-info" v-if="address && !isAddress && !(isTextModify || isPTModify)">
        <van-text-ellipsis :content="`地址：${address}`" />
      </div>
    </div>

    <!-- 图文消息弹窗 -->
    <van-popup
      v-model:show="showRight"
      position="right"
      :overlay-style="{
        background: 'transparent',
      }"
    >
      <div class="pop-content">
        <div class="title">应急过程</div>
        <!-- <van-field v-if="!isTextModify" v-model.trim="time" placeholder="请选择时间" readonly>
          <template #right-icon>
            <van-icon
              name="arrow"
              style="height: 17px; line-height: initial"
              size="17"
              @click="getTime"
            />
          </template>
        </van-field> -->
        <br />
        <van-field
          v-model.trim="address"
          placeholder="请输入地址"
          @update:model-value="addressChange"
        >
        </van-field>
        <br />
        <van-field
          v-model.trim="message"
          rows="1"
          :autosize="{ minHeight: 200, maxHeight: 200 }"
          type="textarea"
          placeholder="请输入内容"
        >
        </van-field>
        <div v-if="!isTextModify" class="attach">附件</div>
        <van-uploader
          v-if="!isTextModify"
          v-model="fileList"
          ref="uploader"
          max-count="1"
          accept="image/*, video/*"
          :max-size="imageSize * 1024 ** 2"
          :readonly="readonly"
          :preview-full-image="false"
          :before-read="handleBeforeRead"
          @click-upload="handleShowType"
          @oversize="showToast(`文件大小不能超过 ${imageSize}Mb`)"
          @click-preview="handlePreview"
          @close-preview="imagePreview = false"
        >
          <template #default>
            <div
              style="
                width: 64px;
                height: 64px;
                background-color: #eee;
                display: grid;
                place-items: center;
              "
            >
              <img src="../../../assets/image/emergency/warning/camera-c.png" alt="" />
            </div>
          </template>
          <template #preview-cover="item">
            <div
              class="preview-cover-item"
              style="width: 100%; height: 100%; background-color: #fff; overflow: hidden"
            >
              <img
                v-if="item.isImage || item.file?.type?.startsWith('image')"
                :src="item.content"
                alt=""
              />
              <div
                v-else
                style="
                  display: grid;
                  place-items: center;
                  background-color: #f0f0f0;
                  border: 1px solid #ddd;
                  height: 100%;
                  width: 100%;
                "
              >
                <!-- 1111111111 -->
                <!-- <van-icon name="video" color="#2EACCA" size="36px" /> -->
                <!-- 加视频封面 -->
                <img style="height: 64px; object-fit: contain" :src="item.file.cover" alt="" />
              </div>
            </div>
          </template>
        </van-uploader>
        <div class="btns">
          <div class="confirm" @click="confirm">确定</div>
          <div class="cancel" @click="handleCancel">取消</div>
        </div>
      </div>
    </van-popup>

    <!-- 选择日期弹窗 -->
    <van-popup v-model:show="showBottom" position="bottom" :style="{ 'min-height': '30%' }">
      <van-picker-group
        title=""
        :tabs="['选择日期', '选择时间']"
        @confirm="onConfirm"
        @cancel="showBottom = false"
      >
        <van-date-picker v-model="currentDate" />
        <van-time-picker v-model="currentTime" :columns-type="['hour', 'minute']" />
      </van-picker-group>
    </van-popup>

    <van-action-sheet
      v-model:show="showType"
      title="添加附件"
      :closeable="false"
      :close-on-popstate="false"
    >
      <div class="type-select-content">
        <div class="type-item" @click="selectType('photo')">
          <img alt="" src="../../../assets/image/emergency/warning/camera-c.png" />
          <div class="">拍照</div>
        </div>
        <div class="type-item" @click="selectType('video')">
          <img alt="" src="../../../assets/image/emergency/icon-video2.png" />
          <div class="">录像</div>
        </div>
        <div class="type-item" @click="selectType('')">
          <img alt="" src="../../../assets/image/emergency/warning/album.png" />
          <div class="">相册</div>
        </div>
      </div>
    </van-action-sheet>
    <van-loading class="useful-loading" v-if="isLoaded" color="#1989fa" />

    <!-- 详情右侧弹出 -->
    <van-popup
      v-model:show="showDetail"
      position="right"
      :overlay-style="{
        background: 'transparent',
      }"
    >
      <div class="pop-content detail">
        <div :class="`tips ext${main?.type}`"><van-text-ellipsis :content="name" /></div>
        <ul class="list">
          <template v-for="item in list" :key="item.title">
            <li v-if="item.value" :class="`${item.className || ''}`">
              <div class="title1">{{ item.title }}</div>
              <div class="value">{{ item.value }}</div>
            </li>
          </template>
        </ul>
        <div v-if="imageList?.length" class="images">
          <div>附件</div>
          <template v-for="(item, index) in imageList" :key="index">
            <div>
              <van-icon name="description" />
              <a
                href="#"
                v-if="['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(item.type)"
                @click.prevent="
                  handlePreview({
                    ...item,
                    isImage: true,
                    image: `${config.fileUrl}${item.fileUrl}`,
                  })
                "
              >
                <span style="color: #551a8b">
                  {{ item.fileName }}
                </span>
              </a>
              <a v-else :href="`${config.fileUrl}${item.fileUrl}`">
                <span style="color: #551a8b">
                  {{ item.fileName }}
                </span>
              </a>
            </div>
          </template>
        </div>
      </div>
    </van-popup>

    <!-- 消息列表图片视频预览 -->
    <van-image-preview
      v-if="imagePreview"
      v-model:show="imagePreview"
      :images="[currentPreviewItem.image]"
      :close-on-click-image="false"
    >
      <template v-if="!currentPreviewItem.isImage" #image="{ src }">
        <video
          style="width: 100%"
          controls
          autoplay
          :src="src"
          @touchstart.stop="$event.target.controls = true"
        ></video>
      </template>
    </van-image-preview>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount, nextTick, computed, watch, h, onMounted } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import {
  getEventDetail,
  getEventInfoList,
  getEventNew,
  getScreenshotList,
  sendImageMark,
  sendMark,
  uploadFile,
  getFileById,
  getUserInfo,
  getMessage,
  modifyEventTime,
  modifyScreenshot,
} from '../../../api/emergency';
import { showDialog } from 'vant';
import dayjs from 'dayjs';
import { showToast, showFailToast } from 'vant';
import config from '@/config';
import PullUpRefresh from 'components/pull-up-refresh';
import { getVideo } from '../../../utils/video-capture';
import { getVideoCover } from '../../../utils/tools';

const route = useRoute();
const router = useRouter();

// 主键
const id = route.query.id;

// 消息条数，传过来方便使用
const times = route.query.times;

//
const main = ref(null);

const name = ref('');

const eventInfoList = ref([]);
let pageSize = 10; //times % 10 < 8 ? 10 + (times % 10) : times % 10; // 搞个算法（超过8个包含，就显示8个，少于8个，比如5个就请求15个）
// 还得搞个算法
let pageNum = Math.ceil(times / pageSize);

// 开始观察滚动的标识
const startObserve = ref(false);

function init() {
  if (pageNum <= 0) {
    return;
  }

  getEventInfoList({
    eventId: id,
    pageSize,
    pageNum,
  }).then(async res => {
    isLoaded.value = true;
    if (!checked.value) {
      // 未勾选我的任务
      eventInfoList.value.unshift(
        ...(await Promise.all(
          res.data.rows.map(async item => {
            let image, screenshotId;
            if (item.messageType === '4' || item.messageType === '6') {
              image = '1'; // 标识有image，但是图片内容异步获取
            }
            return {
              ...item,
              image,
              screenshotId,
            };
          })
        ))
      );
    } else {
      // 勾选我的任务
      tempEventInfoList.unshift(
        ...(await Promise.all(
          res.data.rows.map(async item => {
            let image, screenshotId;
            if (item.messageType === '4' || item.messageType === '6') {
              image = '1'; // 标识有image，但是图片内容异步获取
            }
            return {
              ...item,
              image,
              screenshotId,
            };
          })
        ))
      );

      eventInfoList.value.unshift(
        ...tempEventInfoList.filter(item => item.sendById === userInfo.value.userId)
      );
    }

    isLoaded.value = false;
    if (eventInfoList.value.length < 7 && times >= 7) {
      pageNum -= 1;
      clearInterval(timer);
      init();
      return;
    }

    startObserve.value = true;

    if (main.value.eventStatus === '2') {
      // 记录上一次信息时间（这个接口是根据上一次接口返回数据的最后一条的时间来获取最新数据）
      // 所以如果时间是未来时间，比如2026年某天，则后续的消息就刷新不出来了

      // 这里不能用res.data.rows，因为分页后res会变
      const lastMessageTime = eventInfoList.value[eventInfoList.value.length - 1].eventTime;
      watchLatestEvent(lastMessageTime);
    }
  });
}

onMounted(async () => {
  const res = await getEventDetail(id);
  main.value = res.data.data;
  name.value = main.value.name;

  init();
});

let timer;

const isLoaded = ref(false);

// 新指令
const newMessageInfo = ref(null);

function watchLatestEvent(lastMessageTime) {
  timer = setInterval(() => {
    getEventNew(id, lastMessageTime).then(async res => {
      if (res.data.data) {
        lastMessageTime = res.data.data.eventTime;
        let latestItem = res.data.data;
        if (res.data.data.messageType === '4' || res.data.data.messageType === '6') {
          latestItem.image = '1';
        }
        if (res.data.data.messageType === '2') {
          newMessageInfo.value = res.data.data;
        }

        // 此处有bug
        eventInfoList.value.push(latestItem);
        tempEventInfoList.push(latestItem);
        if (res.data.data.nodeName === '应急关闭') {
          showDialog({
            title: h('div', { style: { color: '#FF3700' } }, '抢险结束'),
            message: `本次任务【${name.value}】已被管理员结束`,
            confirmButtonText: '返回首页',
            confirmButtonColor: '#34394F',
          }).then(() => {
            // 返回首页后，首页应该刷新一下吧
            router.goBack();
          });
        }
      }
    });
  }, 1000);
}

onBeforeUnmount(() => {
  clearInterval(timer);
  // 防止页面返回后还会开启轮询
  main.value.eventStatus = '';
  audio?.pause();
});

const checked = ref(false);

let tempEventInfoList = [];

// 切换我的任务
watch(checked, value => {
  if (value) {
    tempEventInfoList = eventInfoList.value;
    eventInfoList.value = eventInfoList.value.filter(
      item => item.sendById === userInfo.value.userId
    );
  } else {
    eventInfoList.value = tempEventInfoList;
  }
});

const message = ref('');

// 添加附件
function addImg() {
  fileList.value = [];
  time.value = '';
  showRight.value = true;
  currentDate.value = dayjs().format('YYYY.MM.DD').split('.');
  currentTime.value = dayjs().format('HH.mm').split('.');
}

// 图片尺寸限制
const imageSize = 8; // 8M

const showRight = ref(false);

const fileList = ref([]);

function handleCancel() {
  showRight.value = false;
}

const userInfo = ref(null);

getUserInfo().then(res => {
  userInfo.value = res.data.data;
});

// 发送纯消息
async function send() {
  if (!message.value) {
    return;
  }
  await sendMark({
    eventId: id,
    remark: message.value,
    address: address.value,
    sendBy: userInfo.value.nickName,
    sendById: userInfo.value.userId,
  });
  message.value = '';
}

//
const showType = ref(false);
const readonly = ref(true);
const uploader = ref(null);

// 打开选择相机还是照片窗口
function handleShowType() {
  showType.value = true;
}

function selectType(data) {
  if (data === 'photo') {
    hasCamera();
  } else if (data === 'video') {
    // 获取视频
    setTimeout(() => {
      showType.value = false;
      processVideo();
    }, 500);
  } else {
    readonly.value = false;
    setTimeout(() => {
      uploader.value.chooseFile();
      readonly.value = true;
      showType.value = false;
    }, 500);
  }
}

// 处理拍的视频
async function processVideo() {
  const videoBlob = await getVideo({ duration: 30 });
  console.log(videoBlob);
  const blob = new Blob([videoBlob], { type: 'video/mp4' });
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  reader.onloadend = async e => {
    const res = await loadVideoCover(e.target.result);

    fileList.value = [
      {
        content: e.target.result,
        isImage: false,
        file: {
          cover: res,
          blob,
          name: 'video.mp4',
        },
      },
    ];
  };
}

function hasCamera() {
  // eslint-disable-next-line no-undef
  const permissions = cordova.plugins.permissions;
  permissions.checkPermission(
    [permissions.CAMERA],
    data => {
      if (data.hasPermission) {
        getPhoto();
      } else {
        permissions.requestPermissions(
          [permissions.CAMERA],
          res => {
            if (res.hasPermission) {
              // showSuccessToast('相机权限申请成功')
              getPhoto();
            } else {
              showDialog({
                title: '错误',
                message: '请给予相机权限！',
              });
            }
          },
          err => {
            showDialog({
              title: '错误',
              message: err,
            });
          }
        );
      }
    },
    err => {
      showDialog({
        title: '错误',
        message: err,
      });
    }
  );
}

function getPhoto() {
  navigator.camera.getPicture(
    url => {
      window.resolveLocalFileSystemURL(url, function success(fileEntry) {
        fileEntry.file(file => {
          if (file.size > imageSize * 1024 ** 2) {
            return showToast(`文件大小不能超过 ${imageSize}Mb`);
          }
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = e => {
            //cordova插件会将file对象偷偷修改，需要转化为Blob格式才能正确上传
            // const the_file = new Blob([e.target.result], { type: file.type }); //存入即可
            // signFile.value = [{ url, file: the_file }];
            fileList.value = [{ content: e.target.result, isImage: true }];
            showType.value = false;

            // https://60.13.219.226:30453/prod-api//emergency/emergency/emergency/screenshot
            // 这个接口可以修改图片
          };
        });
      });
    },
    err => {
      showDialog({
        title: '错误',
        message: err,
      });
    },
    {
      quality: 50,
      // eslint-disable-next-line no-undef
      destinationType: Camera.DestinationType.FILE_URI,
      // eslint-disable-next-line no-undef
      // mediaType: Camera.MediaType.ALLMEDIA
    }
  );
}

// 弹窗页面点击确定操作
async function confirm() {
  if (!message.value) {
    return showToast('请输入内容！');
  }

  if (!isTextModify.value && !isPTModify.value) {
    // 新增
    if (!fileList.value.length) {
      await send();
      showRight.value = false;
      return;
    }

    const eventTime = time.value || dayjs().format('YYYY-MM-DD HH:mm:ss');

    let data;

    isLoaded.value = true;
    // 这个取消计时器得放这里，如果放后面可能会导致下面的网络请求和计时任务同时执行，导致意外结果
    clearInterval(timer);

    if (!fileList.value[0].file?.blob) {
      data = {
        content: message.value,
        eventId: id,
        eventTime,
        image: fileList.value[0].content,
        address: address.value,
        sendBy: userInfo.value.nickName,
        sendById: userInfo.value.userId,
      };

      await sendImageMark(data).catch(() => {
        isLoaded.value = false;
      });
    } else {
      // 发送视频信息
      const res = await uploadFile(fileList.value[0].file.blob, fileList.value[0].file.name);
      const fileId = res.data.data.fileId;
      sendMark({
        eventId: id,
        fileIds: fileId,
        address: address.value,
        sendBy: userInfo.value.nickName,
        sendById: userInfo.value.userId,
        messageType: 6,
      });
    }

    isLoaded.value = false;
    showRight.value = false;
    message.value = '';
    init();
  } else {
    /* 视频修改功能暂时不做，有点麻烦 */
    let data;
    if (isTextModify.value) {
      // 文本消息修改
      data = {
        ...modifyItem,
        address: address.value,
        content: message.value,
      };
    } else if (isPTModify.value) {
      // 图文消息修改
      if (!fileList.value.length) {
        return showToast('请上传附件！');
      }
      data = {
        ...modifyItem,
        address: address.value,
        content: message.value,
        eventTime: time.value,
      };

      isLoaded.value = true;
      await modifyScreenshot({
        id: modifyItem.screenshotId,
        image: fileList.value[0].content,
      });
    }
    await modifyEventTime(data).catch(() => {
      isLoaded.value = false;
    });

    modifyItem.address = address.value;
    modifyItem.content = message.value;
    modifyItem.eventTime = time.value || modifyItem.eventTime;
    if (modifyItem.image) {
      modifyItem.image = fileList.value[0].content;
      modifyItem.isImage = !fileList.value[0].content.startsWith('data:video');
      modifyItem.cover = fileList.value[0].file?.cover;
    }

    isLoaded.value = false;
    // clearInterval(timer);
    // init();
    showRight.value = false;
  }
}

// 滚动页面到指令位置
function handleScroll() {
  const el = document.getElementById(newMessageInfo.value.id);
  el.scrollIntoView();
  el.classList.add('active');
  setTimeout(() => {
    el.classList.remove('active');
  }, 3000);

  nextTick(() => {
    newMessageInfo.value = null;
  });
}

// 录音还是输入
const useVoice = ref(false);

// 是否按下发送语音
const isPressed = ref(false);

// 按下发送语音事件
function handleTouchstart() {
  hasAudio();
}

// 松开发送语音事件
function handleTouchend() {
  isPressed.value = false;
  if (media) {
    media.stopRecord();
    // 播放之后才能拿到长度
    media.play();
    media.setVolume('0.0');
    setTimeout(() => {
      const dur = media.getDuration();
      media.stop();
      if (dur < 1) {
        return showFailToast('说话时间太短');
      }
      window.resolveLocalFileSystemURL(
        `file:///storage/emulated/0/Android/data/com.kel.app/files/${src}`,
        f =>
          f.file(async t => {
            // 代码如山
            const reader = new FileReader();
            reader.readAsArrayBuffer(t);
            reader.onload = async e => {
              const arrayBuffer = e.target.result;
              const blob = new Blob([arrayBuffer], { type: t.type });
              const res = await uploadFile(blob, t.name);
              sendVoice(res.data.data.fileId);
            };
          })
      );
    }, 500);
  }
}

// 发送语音信息
function sendVoice(fileId) {
  sendMark({
    eventId: id,
    fileIds: fileId,
    address: address.value,
    sendBy: userInfo.value.nickName,
    sendById: userInfo.value.userId,
    messageType: 5,
  });
}

const isAddress = ref(false);

// 保存useVoice状态，在语音输入时，如果点击输入地址后，在点击回来还是语音输入状态
let tempUseVoice = void 0;

// 请输入地址
function handleAddress() {
  tempUseVoice = useVoice.value;
  useVoice.value = false;
  nextTick(() => {
    isAddress.value = true;
    inputWrapperRef.value.classList.remove('have-address');
  });
}

// 地址
const address = ref('');

// 输入地址结束
function addressed() {
  isAddress.value = false;
  if (address.value) {
    inputWrapperRef.value.classList.add('have-address');
  } else {
    inputWrapperRef.value.classList.remove('have-address');
  }

  useVoice.value = tempUseVoice;
}

const inputValue = computed({
  get: () => {
    if (!isAddress.value) {
      return message.value;
    }
    return address.value;
  },
  set: val => {
    if (!isAddress.value) {
      message.value = val;
    } else {
      address.value = val;
    }
  },
});

const inputWrapperRef = ref(null);

// 使用键盘输入
function useKeyBoard() {
  useVoice.value = false;
  const value = inputValue.value;
  inputValue.value = '';
  nextTick(() => {
    inputValue.value = value;
  });
}

// 语音权限
function hasAudio() {
  // eslint-disable-next-line no-undef
  const permissions = cordova.plugins.permissions;
  permissions.checkPermission(
    [permissions.RECORD_AUDIO],
    data => {
      if (data.hasPermission) {
        // getAudio();
      } else {
        permissions.requestPermissions(
          [permissions.RECORD_AUDIO],
          res => {
            // 经测试有没有录音权限都要走这里
            // 无权限时，允许后走这里，有权限直接走这里
            // isPressed.value = false;
            if (res.hasPermission) {
              // console.log('相机权限申请成功')

              isPressed.value = true;
              getAudio();
            } else {
              console.log('获取失败');
            }
          },
          err => {
            console.log(err);
          }
        );
      }
    },
    err => {
      console.log(err);
    }
  );
}

let media;
let src;

// 录音
function getAudio() {
  src = `aaa.mp3`;
  // eslint-disable-next-line no-undef
  media = new Media(src);
  media.startRecord();
}

const currentPlayId = ref('');
let audio = null;
const isPlay = ref(false);

let playTimer = -1;
watch(isPlay, value => {
  clearInterval(playTimer);
  if (value) {
    // 播放完成后结束处理
    playTimer = setInterval(() => {
      if (audio?.ended) {
        isPlay.value = false;
      }
    }, 500);
  }
});

// 播放声音
async function play(data) {
  // 点击当前播放语音
  if (currentPlayId.value === data.id) {
    // 是否正在播放
    if (audio?.paused) {
      audio.play();
      isPlay.value = true;
    } else {
      audio.pause();
      isPlay.value = false;
    }
  } else {
    // 点击其他语音（1、播放状态为true；2、暂停（就是停止，因为audio对象会重置）当前语音）
    isPlay.value = true;
    currentPlayId.value = data.id;
    audio?.pause();
    await nextTick();
    audio = new Audio();
    getFileById(data.fileIds).then(res => {
      audio.src = `${config.audioUrl}${res.data.data[0].fileUrl}`;
      audio.crossOrigin = 'anonymous';
      audio.play();
    });
  }
}

// 输入框的回车事件
function handleEnter() {
  if (!isAddress.value) {
    send();
  }
}

// 弹窗内部时间
const time = ref('');

// 弹窗内部输入地址
function addressChange() {
  // 相当于输入地址结束，调一下对应方法
  addressed();
}

// 选择时间
const showBottom = ref(false);
const currentDate = ref(dayjs().format('YYYY.MM.DD').split('.'));
const currentTime = ref(dayjs().format('HH.mm').split('.'));

function getTime() {
  showBottom.value = true;
}

// 时间选择
function onConfirm() {
  const t = `${currentDate.value.join('-')} ${currentTime.value.join(':')}:00`;
  if (dayjs(t).unix() > dayjs().unix()) {
    return showToast('选择时间不能晚于当前时间！');
  }
  time.value = t;
  showBottom.value = false;
}
// 详情图片预览标识
const imagePreview = ref(false);

// 详情
const showDetail = ref(false);
function goDetail() {
  showDetail.value = true;
}

const list = ref([
  {
    title: '预案等级',
    value: computed(() => (main.value?.level ? `${main.value?.level}级` : '')),
  },
  {
    title: '接警时间',
    value: computed(() => main.value?.receiveTime),
  },
  {
    title: '接警人',
    value: computed(() => main.value?.receiveBy),
  },
  {
    title: '报警人',
    value: computed(() => main.value?.submitBy),
  },
  {
    title: '接警电话',
    value: computed(() => main.value?.submitPhone),
  },
  {
    title: '结束时间',
    value: computed(() => main.value?.finishTime),
  },
  {
    title: '总时长',
    value: computed(() => main.value?.totalSeconds),
  },
  {
    title: '事件状态',
    value: computed(() => (main.value?.eventStatus === '2' ? '应急抢险' : '结束')),
  },
  {
    // className: ' remark',
    title: '描述',
    value: computed(() => main.value?.description),
  },
]);

// 详情图片
const imageList = computed(
  () =>
    main.value?.fileInfoList?.map(item => ({
      ...item,
      type: item.fileName.split('.').pop().toLowerCase(),
    })) || []
);

// 判断是否图文消息修改
const isPTModify = ref(false);

// 判断是否文字消息修改
const isTextModify = ref(false);

let modifyItem = null;

// 修改消息
function handleModify(item) {
  console.log(item);
  modifyItem = item;
  const { messageType, content, address: add, eventTime, image } = item;
  switch (messageType) {
    case '1':
      // 文字消息
      isTextModify.value = true;
      showRight.value = true;
      setTimeout(() => {
        message.value = content;
        address.value = add;
      }, 200);
      break;
    case '4':
      // 图文消息
      isPTModify.value = true;
      showRight.value = true;
      currentDate.value = dayjs().format('YYYY.MM.DD').split('.');
      currentTime.value = dayjs().format('HH.mm').split('.');
      setTimeout(() => {
        message.value = content.replace('】:', '&&&&').split('&&&&').pop();
        address.value = add;
        time.value = eventTime;
        fileList.value = [
          {
            url: image,
            content: image,
            isImage: !image.startsWith('data:video'),
            file: {
              cover: item.cover,
            },
          },
        ];
      }, 200);
      break;
    default:
      break;
  }
}

watch(showRight, value => {
  if ((isTextModify.value || isPTModify.value) && !value) {
    console.log(22222222);
    setTimeout(() => {
      address.value = '';
      addressChange();
      message.value = '';
      fileList.value = [];
      time.value = '';
      isTextModify.value = false;
      isPTModify.value = false;
    }, 100);
  }

  // 返回按键操作
  if (value) {
    document.addEventListener('backbutton', exec, false);
  } else {
    document.removeEventListener('backbutton', exec);
  }
});

// 无限滚动
function handleLoadMore(cb) {
  if (pageNum > 1) {
    pageNum -= 1;
    clearInterval(timer);
    init();
  } else {
    cb();
  }
}

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;

  if (
    !showType.value &&
    !showBottom.value &&
    !imagePreview.value /* 图文消息编辑弹窗打开，但是日期、选择照片弹窗、图片预览均关闭 */
  ) {
    showRight.value = false;
    showDetail.value = false;
    // eslint-disable-next-line no-empty
  } else if (imagePreview.value) {
  } else {
    showType.value = false;
    showBottom.value = false;
    showDetail.value = false;
  }
  return false;
}

onBeforeRouteLeave(() => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }
});

watch(showDetail, value => {
  if (value) {
    document.addEventListener('backbutton', exec, false);
  } else {
    document.removeEventListener('backbutton', exec);
  }
});

watch(imagePreview, value => {
  if (!showRight.value && !showDetail.value) {
    if (value) {
      document.addEventListener('backbutton', exec, false);
    } else {
      document.removeEventListener('backbutton', exec);
    }
  }
});

// 详情图片懒加载
async function loadImage(item) {
  if (item.messageType !== '6') {
    // 加载截图
    const screenshot = (await getScreenshotList(item.id)).data.rows[0];
    item.image = screenshot.image;
    item.isImage = !screenshot.image?.startsWith('data:video');
    item.screenshotId = screenshot.id;
    // 加载封面图
    const res = await loadVideoCover(item.image);
    item.cover = res;
  } else {
    getFileById(item.fileIds).then(res => {
      item.image = item.cover = `${config.audioUrl}${res.data.data[0].fileUrl}`;
    });
  }
}

// 加载封面图
async function loadVideoCover(dataUrl) {
  const res = await getVideoCover(dataUrl);
  return res;
}

// 当前要预览的消息
const currentPreviewItem = ref(null); // {isImage, image}

// 消息列表图片预览
function handlePreview(item) {
  if (item.isImage === undefined) {
    item.isImage = item.file?.type.startsWith('image');
  }
  if (item.image === undefined) {
    item.image = item.content;
  }

  currentPreviewItem.value = item;
  imagePreview.value = true;
}

// 图文消息弹窗图片预览
function handleBeforeRead(file) {
  console.log(file);

  if (file.type.startsWith('video')) {
    return new Promise(resolve => {
      const reader1 = new FileReader();
      reader1.readAsDataURL(file);
      reader1.onload = async e => {
        const res = await loadVideoCover(e.target.result);
        file.cover = res;

        const reader2 = new FileReader();
        reader2.readAsArrayBuffer(file);
        reader2.onload = e => {
          const arrayBuffer = e.target.result;
          const blob = new Blob([arrayBuffer], { type: 'video/mp4' });
          file.blob = blob;
          resolve(file);
        };
      };
    });
  } else {
    return true;
  }
}

const videoPoster = new URL('../../src/assets/image/emergency/icon-video01.png', import.meta.url)
  .href;
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;

  .tips {
    height: 70px;
    flex-shrink: 0;
    background: url('/src/assets/image/emergency/容器_6096.png') no-repeat 24px center / 34px;
    padding: 0 24px;
    padding-left: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    font-family: 思源黑体;
    font-size: 14px;
    color: #ff3700;
    border-bottom: 12px solid #f7fafa;

    &.ext1 {
      background: url('/src/assets/image/emergency/icon-1-64px-停气.png') no-repeat 24px center /
        34px;
    }
    &.ext2 {
      background: url('/src/assets/image/emergency/icon-1-64px-泄漏.png') no-repeat 24px center /
        34px;
    }
    &.ext3 {
      background: url('/src/assets/image/emergency/icon-1-64px-火灾.png') no-repeat 24px center /
        34px;
    }
    &.ext4 {
      background: url('/src/assets/image/emergency/icon-1-64px-爆炸.png') no-repeat 24px center /
        34px;
    }

    .van-text-ellipsis {
      flex: 1;
    }

    .detail {
      padding: 0 6px;
      font-family: 思源黑体;
      font-size: 14px;
      color: #84abbb;
    }
  }

  .new-message {
    height: 58px;
    flex-shrink: 0;
    background: url('/src/assets/image/emergency/icon-volume-vibrate-fill.png') no-repeat 29px
      center / 24px;
    padding: 0 24px;
    padding-left: 64px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    font-family: 思源黑体;
    font-size: 14px;
    color: #ff3700;
    border-bottom: 12px solid #f7fafa;

    .van-text-ellipsis {
      flex: 1;
    }
  }

  .task-list {
    // height: 200px;
    display: grid;
    grid-auto-rows: 48px;
    gap: 12px;

    background-color: #f7fafa;

    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 30px;

      .left {
        display: flex;
        flex-direction: column;
        text-align: left;

        font-family: 思源黑体;
        font-size: 14px;
        line-height: 20px;

        .title {
          color: #34394f;
        }

        .desc {
          color: #84abbb;
        }
      }

      .right {
        font-family: 思源黑体;
        font-size: 14px;
        color: #ff3700;

        &.confirmed {
          color: #00b099;
        }
      }
    }
  }

  .nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 58px;
    flex-shrink: 0;
    width: calc(100% - 60px);
    align-self: center;
    font-family: 思源黑体;
    color: #34394f;
    border-bottom: 1px solid #e7eeee;

    .left {
      font-size: 16px;
    }

    .right {
      font-size: 14px;
      width: 104px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      :deep(.van-switch) {
        width: 29px;
        height: 12px;
        background: #e7eeee;

        .van-switch__node {
          width: 20px;
          height: 20px;
          background: #bbcece;
          top: -4px;
          left: -6px;
        }

        &.van-switch--on {
          .van-switch__node {
            background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
            left: -6px;
          }
        }
      }
    }
  }

  .content {
    padding: 10px 12px 0 34px;
    overflow-y: scroll;

    :deep(.van-steps) {
      .van-step__circle-container,
      .van-step__line {
        margin-top: 10px;
      }

      .van-step__line {
        background: #d9d9d9 !important;
      }
    }

    .step-item {
      padding-left: 5px;

      .summary {
        height: 48px;
        display: flex;
        flex-direction: column;
        margin-bottom: 8px;

        .top {
          flex: 1;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed #d8d8d8;
          align-items: center;
          padding-right: 6px;
          padding-left: 25px;

          &,
          .pc {
            background: url('/src/assets/image/emergency/icon-computer-fill.png') no-repeat
              left/20px;
          }

          &.mobile {
            background: url('/src/assets/image/emergency/icon-smartphone-fill.png') no-repeat
              left/20px;
          }
        }

        .bottom {
          flex: 1;
          display: flex;
          align-items: center;
          font-family: 思源黑体;
          font-size: 14px;
          color: #84abbb;
          background: url('/src/assets/image/emergency/icon-user-location-fill.png') no-repeat
            left/20px;

          padding-left: 25px;

          .van-text-ellipsis {
            flex: 1;
          }
        }

        .right {
          border-radius: 30px;
          display: flex;
          flex-direction: column;
          padding: 6px 20px;
          background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);

          font-family: 思源黑体;
          font-size: 14px;
          color: #fff;
        }
      }

      .info {
        font-family: 思源黑体;
        font-size: 14px;
        text-align: justify; /* 浏览器可能不支持 */
        color: #34394f;

        .voice-message {
          height: 34px;
          height: 34px;
          border-radius: 4px;
          background: url('/src/assets/image/emergency/icon-play-default.png') no-repeat 10px
            center/24px #e7eeee;
          width: 80%;
          display: flex;
          align-items: center;

          &.is-playing {
            animation: changeBackground 1s infinite;
          }

          @keyframes changeBackground {
            0% {
              background-image: url('/src/assets/image/emergency/icon-play2.png');
            }
            25% {
              background-image: url('/src/assets/image/emergency/icon-play3.png');
            }
            50% {
              background-image: url('/src/assets/image/emergency/icon-play0.png');
            }
            75% {
              background-image: url('/src/assets/image/emergency/icon-play1.png');
            }
            100% {
              background-image: url('/src/assets/image/emergency/icon-play2.png');
            }
          }
        }

        .message {
          margin-bottom: 10px;
        }
      }

      &.active .info {
        color: #ff3700;
      }

      .imgs {
        margin-top: 8px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        // grid-template-rows: ;
        gap: 8px;
        height: 60px;

        .thumbnail {
          height: 60px;
          width: 100%;
        }

        > .my-loading {
          width: 30px;
          height: 30px;
          margin: auto;
        }
      }

      .modify {
        width: fit-content;
        height: 32px;
        padding: 6px 20px;
        border: 1px solid;
        border-color: #2ec192;
        border-radius: 30px;
        margin-top: 6px;
      }
    }

    .step-icon {
      width: 16px;
      height: 16px;
    }
  }

  .edit-area {
    width: 100%;
    flex-shrink: 0;
    background: #e7eeee;
    padding: 15px 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: auto;

    .van-cell-group--inset {
      flex: 1;
      margin: 0;
      border-radius: 4px;

      :deep(.van-cell) {
        padding: 5px;
        border-radius: 4px;
        background: #f7fdfd;
        border: 1px solid #bbcece;
      }
    }

    .right {
      display: flex;
      justify-content: space-between;

      .arrow,
      .image,
      .more,
      .address-icon {
        width: 24px;
        height: 24px;
      }

      .arrow {
        background: url('/src/assets/image/emergency/icon-navigation-fill.png') no-repeat
          center/100%;
      }
      .image {
        background: url('/src/assets/image/emergency/icon-image-2-fill.png') no-repeat center/100%;
      }

      .more {
        background: url('/src/assets/image/emergency/icon-user-location-fill.png') no-repeat
          center/100%;
      }
      .address-icon {
        background: url('/src/assets/image/emergency/icon-chat-voice-fill.png') no-repeat
          center/100%;
      }
    }

    .mic {
      width: 24px;
      height: 100%;
      background: url('/src/assets/image/emergency/icon-audio.png') no-repeat center/100%;
    }

    .keyboard {
      width: 24px;
      height: 100%;
      background: url('/src/assets/image/emergency/icon-keyboard.png') no-repeat center/100%;
    }

    .send-voice {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      font-family: 思源黑体;
      font-size: 14px;
      color: #84abbb;

      .lines {
        width: 80%;
        height: 24px;
        background: url('/src/assets/image/emergency/容器_6445.png') repeat-x center/ 80px 22px;
        animation: move 1.5s steps(12) infinite both;

        @keyframes move {
          from {
            background-position: 0 0px;
          }
          to {
            background-position: -800px 0;
          }
        }
      }
    }

    &.have-address {
      position: relative;

      :deep(.van-field__control) {
        margin-bottom: 40px;
      }
    }

    .address-info {
      position: absolute;
      left: 58px;
      bottom: 15px;
      height: 40px;
      font-family: 思源黑体;
      font-size: 14px;
      color: #34394f;
      font-weight: 400;
      width: calc(100% - 150px);
      line-height: 40px;
      border-top: 1px dashed #34394f;

      .van-text-ellipsis {
        line-height: unset;
      }
    }
  }

  @topHeight: 46px;
  // @bottomHeight: 50px;
  @popupHeight: calc(100vh - @topHeight);

  .van-popup--right {
    width: 100%;
    height: @popupHeight;
    border-bottom: 1px solid #f1f5f6;
    top: calc(@popupHeight / 2 + @topHeight);
  }

  .pop-content {
    height: 100%;
    width: 100%;
    background-color: #f7fafa;
    padding: 35px 32px;

    .title {
      height: 23px;
      font-family: 思源黑体;
      font-size: 16px;
      color: #34394f;
      margin-bottom: 16px;
    }

    .van-cell {
      border-radius: 4px;
      background: #fff;
      border: 1px solid #bbcece;

      :deep(.van-field__control) {
        font-family: 思源黑体;
        font-size: 14px;
        line-height: 17px;
        text-align: justify;
        color: #84abbb;
      }
    }

    .attach {
      height: 14px;
      font-family: 思源黑体;
      font-size: 14px;
      line-height: 14px;
      color: #34394f;
      margin: 24px 0 16px;
    }

    :deep(.van-uploader) {
      .van-uploader__preview {
        width: 64px;
        height: 64px;

        img {
          width: 64px;
          height: 64px;
        }
      }

      .van-uploader__preview-image {
        width: unset;
        height: unset;
      }
    }

    .btns {
      margin-top: 5vh;
      display: grid;
      grid-template-columns: 68px 68px;
      justify-content: center;
      gap: 16px;
      width: 100%;

      > div {
        display: grid;
        place-items: center;

        font-family: 思源黑体;
        font-size: 14px;
      }

      .confirm {
        width: 68px;
        height: 32px;
        border-radius: 30px;
        background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
        color: #fff;
      }

      .cancel {
        width: 68px;
        height: 32px;
        border: 1px solid #25a0e2;
        border-radius: 30px;
        color: #00b099;
      }
    }

    &.detail {
      padding: 0;
      background-color: #fff;

      .tips {
        border-color: #f7fafa;
      }

      ul.list {
        padding: 12px 24px;
        display: grid;
        grid-auto-rows: minmax(48px, max-content);
        gap: 4px;

        font-size: 14px;
        color: #34394f;

        li {
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e7eeee;
          justify-content: space-between;

          .title1 {
            width: 100px;
          }

          .value {
          }

          &.remark {
            display: block;
            padding: 12px 0;

            .title1 {
              padding-bottom: 4px;
            }

            .value {
              text-align: initial;
            }
          }
        }
      }

      .images {
        padding: 24px;
        display: grid;
        gap: 12px;

        font-size: 14px;

        > div {
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .type-select-content {
    .type-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 17px;
      gap: 10px;
      &:active {
        background-color: #ddd;
      }
    }
  }
}

.useful-loading {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 9999;
}

:deep(.van-uploader__file-name.van-ellipsis) {
  display: none;
}

.vbi {
  display: grid;
  place-items: center;
  background: url(/src/assets/image/emergency/icon-bg001.png) no-repeat center / 100% 100%;
  border: 1px solid #ddd;
  height: 62px;
  width: 100%;

  > video {
    display: inline-block;
    width: 70%;
    height: 70%;
  }
}
</style>
