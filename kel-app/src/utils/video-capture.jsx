import { createApp, ref, reactive, Transition, watch } from 'vue';
import { RecordRTCPromisesHandler } from 'recordrtc';
import { Icon, DropdownMenu, DropdownItem } from 'vant';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import 'vant/es/dropdown-menu/style';
import 'vant/es/dropdown-item/style';
import { getPermissions } from './cordova-tools.js';

/**
 * @function getVideo
 * @description
 *   调用此函数可以录制视频，返回一个 Promise，当录制完成时返回视频的 Blob 对象。
 *   该函数首先会请求摄像头和麦克风权限，然后在页面上创建一个录制视频的界面。
 *   用户可以通过界面开始/停止录制，最终确认或取消录制的视频。
 *
 * @param {Object} [options={ duration: 10 }]
 *   配置选项对象。
 * @param {number} options.duration
 *   录制视频的最大时长（单位：秒）。默认值为 10 秒。
 *
 * @returns {Promise<Blob|boolean>}
 *   返回一个 Promise 对象，当录制完成时，Promise 解析为视频的 Blob 对象；
 *   如果未获取到权限或用户取消录制，Promise 解析为 false。
 */
export function getVideo(options = { duration: 10 }) {
  return new Promise(resolve => {
    getPermissions(
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE'
    ).then(res => {
      if (res) {
        const el = document.createElement('div');
        el.id = 'root';
        document.body.appendChild(el);

        createApp({
          components: {
            VanIcon: Icon,
            VanDropdownMenu: DropdownMenu,
            VanDropdownItem: DropdownItem,
          },
          setup() {
            // 录制视频流
            const stream = ref(null);

            const videoSrc = ref('');

            // 录制时长
            const recordTime = ref('');

            // 视频blob
            const videoBlob = ref(null);

            let recorder;

            async function init() {
              await navigator.mediaDevices
                .getUserMedia({
                  video: {
                    // app上要这样写，相当于手机横向拍摄
                    width: { ideal: window.innerHeight - 95 },
                    height: { ideal: window.innerWidth },
                    // width: window.innerWidth,
                    // height: window.innerHeight - 95,
                    deviceId: { exact: model.value },
                  },
                  audio: true,
                })
                .then(res => {
                  stream.value = res;
                  console.log(res);
                });
            }

            // 是否正在录制
            const isRecord = ref(false);

            let timer;

            // 开始/结束录制
            async function handleRecord() {
              if (videoBlob.value) {
                return;
              }
              if (!isRecord.value) {
                startRecord();
              } else {
                await stopRecord();
              }
              isRecord.value = !isRecord.value;
            }

            // 开始录制
            function startRecord() {
              const now = dayjs().unix();
              // 合适
              recorder = new RecordRTCPromisesHandler(stream.value, {
                type: 'video',

                // 降低视频和音频的比特率
                // bitsPerSecond: 512000, // 视频/音频的比特率
                audioBitsPerSecond: 256000, // 降低音频比特率
                videoBitsPerSecond: 1024000, // 降低视频比特率

                // 设置帧间隔（控制帧率）
                frameInterval: 100, // 每 100 毫秒捕捉一帧，降低帧率

                // 设置帧率
                frameRate: 10, // 降低帧率为 15 FPS

                // 设置音频采样率
                sampleRate: 22050, // 降低音频采样率

                // 设置音频通道为单声道
                numberOfAudioChannels: 1, // 设置为 1（单声道）
              });
              recorder.startRecording();
              recordTime.value = '00:00';
              timer = setInterval(() => {
                recordTime.value = dayjs()
                  .startOf('day')
                  .second(dayjs().unix() - now)
                  .format('mm:ss');
              }, 1000);
            }

            // 结束录制
            async function stopRecord() {
              await recorder.stopRecording();
              clearInterval(timer);
              recordTime.value = '';
              closeCamera();
              const blob = await recorder.getBlob();
              videoBlob.value = blob;
              const url = URL.createObjectURL(blob);
              stream.value = null;
              videoSrc.value = url;
            }

            // 00:30这种格式字符串转成数字
            function timeStringToSeconds(timeString) {
              const [minutes, seconds] = timeString.split(':').map(Number);
              return minutes * 60 + seconds;
            }

            // 监听录制时长（不能超过duration）
            watch(recordTime, value => {
              console.log(value);
              if (value) {
                const recordedTime = timeStringToSeconds(value);
                if (recordedTime >= options.duration) {
                  handleRecord();
                }
              }
            });

            // 关闭摄像头和麦克风
            function closeCamera() {
              stream.value?.stop();
            }

            // 退出/返回
            function revoke() {
              closeCamera();
              document.body.removeChild(el);
            }

            // 确定
            function confirm() {
              resolve(videoBlob.value);
              revoke();
            }

            // 取消（重新进入待录制状态）
            function handleCancel() {
              // 加个提示：确认取消吗？
              videoBlob.value = null;
              videoSrc.value = '';
              init();
            }

            // videoRef
            const videoRef = ref(null);

            // 是否显示播放/暂停图标
            const showIcon = ref(false);

            // 隐藏icon的防抖函数
            const hiddenIcon = debounce(() => {
              showIcon.value = false;
            }, 2000);

            // 是否正在播放
            const isPlaying = ref(true);

            // 点击视频播放/暂停
            function clickVideo() {
              if (!videoBlob.value) {
                return;
              }
              if (isPlaying.value) {
                videoRef.value.pause();
              } else {
                videoRef.value.play();
              }
              isPlaying.value = !isPlaying.value;

              showIcon.value = true;
              hiddenIcon();
            }

            // 视频播放完毕
            function playEnded() {
              console.log('视频播放完毕');
              isPlaying.value = false;
            }

            // 摄像头列表
            const cameraIdList = ref([]);

            // 摄像头切换又出问题了，只能全部列出来了
            navigator.mediaDevices.enumerateDevices().then(res => {
              console.log(res);
              // console.log(res[4].getCapabilities().facingMode);  // user\·
              // 前置摄像头镜像可通过设置video样式 transform: scaleX(-1); 实现
              cameraIdList.value = res
                .filter(item => item.kind === 'videoinput')
                .map((item, index) => ({ value: item.deviceId, text: `摄像头${index + 1}` }));

              model.value = cameraIdList.value[0].value;
              init();
            });

            // 下拉列表取值
            const model = reactive({
              value: '',
              // 切换摄像头
              changeValue(newValue) {
                this.value = newValue;
                closeCamera();
                init();
              },
            });

            return () => (
              <div class="video-capture-wrapper">
                <div class="video-wrapper" onClick={clickVideo}>
                  <video
                    ref={videoRef}
                    src={videoSrc.value}
                    srcObject={stream.value}
                    width={window.innerWidth}
                    height={window.innerHeight - 95}
                    onEnded={playEnded}
                    muted={!videoBlob.value} // 防止录制前、录制时发出声音
                    style={
                      cameraIdList.value.length &&
                      cameraIdList.value[0].value === model.value &&
                      'transform: scaleX(-1);'
                    }
                    autoplay
                  ></video>
                  {/* 播放暂停图标 */}
                  <Transition name="tradeOpacity">
                    {videoBlob.value && showIcon.value && (
                      <div class="play-pause">
                        {isPlaying.value ? (
                          <van-icon size="40vw" color="#000a" name="pause-circle-o" />
                        ) : (
                          <van-icon size="40vw" color="#000a" name="play-circle-o" />
                        )}
                      </div>
                    )}
                  </Transition>
                </div>
                <div
                  class={`record ${isRecord.value ? 'is-recording' : ''}`}
                  onClick={handleRecord}
                ></div>
                {!isRecord.value && (
                  <>
                    {!videoBlob.value && (
                      <div class="cancel">
                        {/* 关闭该窗口 */}
                        <VanIcon
                          style="padding: 5px; margin-top: -2px"
                          size="40"
                          name="revoke"
                          color="#fff"
                          onClick={revoke}
                        />
                      </div>
                    )}
                    {videoBlob.value && (
                      <>
                        <div class="cancel">
                          <VanIcon size="50" name="cross" color="#fff" onClick={handleCancel} />
                        </div>

                        <div class="confirm" onClick={confirm}>
                          <VanIcon size="50" color="#fff" name="success" />
                        </div>
                      </>
                    )}
                  </>
                )}
                {/* 计时 */}
                {recordTime.value && <div class="record-time">● {recordTime.value}</div>}
                {/* 切换摄像头 */}
                {!isRecord.value && !videoBlob.value && (
                  <div class="toggle-camera">
                    <van-dropdown-menu overlay={false}>
                      <van-dropdown-item
                        modelValue={model.value}
                        onChange={value => model.changeValue(value)}
                        options={cameraIdList.value}
                      />
                    </van-dropdown-menu>
                  </div>
                )}
                <style jsx>
                  {`
                    .video-capture-wrapper {
                      position: fixed;
                      top: 0;
                      left: 0;
                      right: 0;
                      bottom: 0;
                      background: #000;
                      z-index: 9999;
                    }

                    .video-wrapper {
                      position: relative;
                      display: grid;
                      place-items: center;
                    }

                    .play-pause {
                      position: absolute;
                    }

                    .record {
                      background-color: #0000;
                      width: 70px;
                      height: 70px;
                      border-radius: 50%;
                      position: absolute;
                      bottom: 12px;
                      left: 50%;
                      transform: translateX(-50%);
                      border: 4px solid #fff;
                      display: grid;
                      place-items: center;
                    }

                    .record::before {
                      content: '';
                      width: 55px;
                      height: 55px;
                      border-radius: 50%;
                      background-color: #f00;
                      transition: all 0.2s ease-out;
                    }

                    .record.is-recording::before {
                      content: '';
                      width: 30px;
                      height: 30px;
                      border-radius: 6px;
                      background-color: #f00;
                    }

                    .cancel {
                      width: 50px;
                      height: 50px;
                      border-radius: 50%;
                      position: absolute;
                      bottom: 24px;
                      left: 30px;
                    }

                    .confirm {
                      width: 50px;
                      height: 50px;
                      border-radius: 50%;
                      position: absolute;
                      bottom: 24px;
                      right: 30px;
                    }

                    .record-time {
                      color: #f00;
                      position: absolute;
                      top: 20px;
                      left: 50%;
                      transform: translateX(-50%);
                      font-weight: 700;
                    }

                    .toggle-camera {
                      position: absolute;
                      top: 20px;
                      right: 20px;
                      width: 100px;
                      background-color: #bfa;
                    }

                    .van-dropdown-item {
                      position: absolute;
                      height: calc(${cameraIdList.value.length} * 32px);
                    }

                    .van-popup {
                      height: 100%;
                      max-height: unset;
                    }

                    .van-cell {
                      height: 32px;
                      padding: 4px 8px;
                    }

                    .van-cell__title {
                      line-height: 24px;
                      flex: 2;
                    }

                    .van-dropdown-menu__item {
                      justify-content: flex-start;
                    }

                    .van-dropdown-menu__title {
                      width: 84%;
                      padding: 4px 8px;
                    }

                    .van-dropdown-menu__bar {
                      height: unset;
                    }
                  `}
                </style>
              </div>
            );
          },
        }).mount('#root');
      } else {
        // 没有获取到权限，返回false
        resolve(false);
      }
    });
  });
}
