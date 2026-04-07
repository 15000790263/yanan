<template>
  <div class="login-view">
    <div class="login-view-content">
      <div class="login-view-content-title">
        <div class="login-view-content-title-text">智能上报系统</div>
      </div>
      <div class="login-view-content-form">
        <div class="login-view-content-form-text">账号登录</div>
        <div class="login-view-content-form-content">
          <van-form>
            <van-cell-group>
              <van-field
                v-model="loginData.username"
                left-icon="user"
                name="username"
                placeholder="用户名"
              />
              <van-field
                v-model="loginData.password"
                left-icon="lock"
                type="password"
                name="password"
                placeholder="密码"
              />
              <!-- <van-space class="verification-code-content" align="start" :wrap="false">
                <van-field v-model="loginData.code" placeholder="验证码" name="code" />
                <van-image :src="codeImg" @click="getCode">
                  <template v-slot:loading>
                    <van-loading type="spinner" size="20" />
                  </template>
                </van-image>
              </van-space> -->
            </van-cell-group>
            <van-space class="button-content" direction="vertical" fill>
              <div class="login-button" @click="handleLogin">登录</div>
            </van-space>
          </van-form>
        </div>
        <div class="remember-password">
          <van-checkbox-group v-model="rememberPassword" shape="square">
            <van-checkbox name="true">
              <span style="color: #1989fa">记住密码</span>
            </van-checkbox>
          </van-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import { getVerificationCode, login as loginApi } from '@/api/login';
import { themeStore } from '@/stores/theme';
import { useRouter } from 'vue-router';
import { setToken, setLoginInfo, clearLoginInfo, getLoginInfo } from '@/utils/session';
import { showFailToast } from 'vant';
import { handleUserRole } from './hooks/init-info';
import CryptoJS from 'crypto-js';

const themeStoreData = themeStore();
const router = useRouter();

const loginData = ref({
  username: 'admin',
  password: 'admin123',
  code: '',
  uuid: '',
});

const codeImg = ref('');

// 记住密码
const rememberPassword = ref(['true']);

onMounted(() => {
  // getCode();
  themeStoreData.changeTheme('dark');
  processLoginInfo();
});

/**
 * 回填已保存的登录信息（记住密码功能）
 */
async function processLoginInfo() {
  const loginInfo = getLoginInfo();
  if (loginInfo) {
    rememberPassword.value = ['true'];
    try {
      const encryptedData = loginInfo;
      const info = await decryptMessage(encryptedData);
      const { username, password } = JSON.parse(info);
      loginData.value.username = username;
      loginData.value.password = password;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('回填登录信息失败:', e);
    }
  }
}

/**
 * 获取验证码图片
 */
function getCode() {
  getVerificationCode().then(res => {
    codeImg.value = `data:image/gif;base64,${res.data.img}`;
    loginData.value.uuid = res.data.uuid;
  });
}

/**
 * 登录处理
 */
function handleLogin() {
  if (!loginData.value.username) {
    showFailToast('请输入用户名');
    return;
  }
  if (!loginData.value.password) {
    showFailToast('请输入密码');
    return;
  }

  loginApi(loginData.value).then(
    res => {
      saveLoginInfo();
      setToken(res.data.token);
      router.push('/index');
      handleUserRole();
    },
    err => {
      showFailToast(err.message || '登录失败');
      // getCode();
    }
  );
}

/**
 * 保存登录信息（记住密码功能）
 */
async function saveLoginInfo() {
  if (rememberPassword.value[0]) {
    const { username, password } = loginData.value;
    const loginInfo = JSON.stringify({ username, password });
    const encryptedData = await encryptMessage(loginInfo);
    setLoginInfo(encryptedData);
  } else {
    clearLoginInfo();
  }
}

function encryptMessage(msg) {
  const key = CryptoJS.MD5('geovis_secret_key_2024');
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(msg, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return iv.toString() + ':' + encrypted.toString();
}

function decryptMessage(data) {
  const [ivStr, encrypted] = data.split(':');
  const key = CryptoJS.MD5('geovis_secret_key_2024');
  const iv = CryptoJS.enc.Hex.parse(ivStr);

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
</script>

<style scoped lang="less">
.login-view {
  width: 100%;
  height: 100vh;
  background-image: url('../../assets/image/login/login-bg.png');
  background-size: 100% 100%;
  position: relative;
  display: grid;
  place-items: center;

  &-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 3vh;
    position: absolute;

    &-title {
      box-sizing: border-box;
      width: 95%;
      height: 85px;
      background: url('../../assets/image/login/login-title.png') no-repeat center/100%;
      transition: all 0.2s;

      &-text {
        box-sizing: border-box;
        font-family: SSYiFeiTi-Regular, serif;
        font-size: 55px;
        font-style: italic;
        background: linear-gradient(180deg, #daf3f6 0%, #53bedf 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
        text-shadow: 0 0 4px rgba(32, 255, 248, 0.3);
        height: 100%;
        width: 100%;
        display: grid;
        place-items: center;
        transition: all 0.2s;
      }
    }

    &-form {
      width: 100%;
      height: 370px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: url('../../assets/image/login/login-form.png') no-repeat center/80% 80vw;
      justify-content: space-between;

      &-text {
        background: linear-gradient(180deg, #daf3f6 0%, #53bedf 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-fill-color: transparent;
        text-shadow: 0 0 rgba(32, 255, 248, 0.3);
        font-size: 14px;
        padding-top: 52px;
      }

      &-content {
        width: 70%;
        margin-top: 10px;

        :deep(.van-field) {
          border: 1px solid rgba(5, 163, 187, 0.5);
          border-radius: 4px;
          margin-bottom: 2vw;
        }

        .verification-code-content {
          color: #fff;

          .send-code-button {
            width: 105px;
            height: 45px;
            border-radius: 4px;
            opacity: 1;
            box-sizing: border-box;
            border: 1px solid #409eff;
            font-family: SourceHanSansCN;
            font-size: 14px;
            text-align: center;
            letter-spacing: 0em;
            color: var(--van-button-primary-background);
            display: grid;
            place-items: center;
          }

          .replay {
            width: 45px;
            height: 45px;
            border-radius: 4px;
            box-sizing: border-box;
            border: 1px solid #409eff;

            .van-icon {
              width: 100%;
              height: 100%;
              color: var(--van-button-primary-background);
              display: grid;
              place-items: center;
            }
          }
        }

        .button-content {
          .login-button {
            width: 262px;
            height: 35px;
            border-radius: 4px;
            background: #409eff;
            font-family: SourceHanSansCN;
            font-size: 14px;
            color: #ffffff;
            display: grid;
            place-items: center;
            cursor: pointer;
          }
        }
      }

      .remember-password {
        color: #1989fa;
        padding-bottom: 75px;
        width: 70%;
        --van-checkbox-border-color: #1989fa;
      }
    }
  }

  &:focus-within {
    .login-view-content-title {
      height: 60px;
      background-size: 70%;

      &-text {
        font-size: 35px;
      }
    }

    .login-view-content-form-text {
    }
  }
}
</style>
