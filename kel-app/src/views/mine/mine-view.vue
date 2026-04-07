<template>
  <div class="mine">
    <!-- 顶部背景区域 -->
    <div class="mine-header">
      <div class="user-info">
        <img class="avatar" :src="avatarSrc" alt="avatar" />
        <div class="info-text">
          <div class="username">{{ username }}</div>
          <div class="dept">{{ deptNameText }}</div>
        </div>
      </div>
    </div>

    <!-- 菜单区域 -->
    <div class="mine-content">
      <van-cell-group inset>
        <van-cell title="个人资料" is-link @click="handleGoProfile" />
        <van-cell title="账号安全" is-link @click="handleGoSecurity" />
      </van-cell-group>
    </div>

    <!-- 退出登录按钮 -->
    <div class="logout-section">
      <van-button type="danger" round block @click="handleLogout"> 退出登录 </van-button>
    </div>

    <!-- 版本信息 -->
    <div class="mine-version">
      <span>APP版本：v{{ appVersion }}</span>
    </div>

    <!-- 个人资料弹窗 -->
    <van-popup
      v-model:show="showProfile"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <div class="profile-popup">
        <van-nav-bar title="个人资料" left-arrow @click-left="showProfile = false" />
        <div class="profile-content">
          <div class="profile-avatar">
            <img class="avatar-img" :src="avatarSrc" alt="avatar" />
            <!-- <div class="avatar-tip">点击更换头像</div> -->
          </div>
          <van-cell-group inset>
            <van-cell title="用户名" :value="username" />
            <van-cell title="部门" :value="deptNameText" />
            <van-cell title="手机号" :value="mobile || '未设置'" />
            <van-cell title="邮箱" :value="email || '未设置'" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- 账号安全弹窗 -->
    <van-popup
      v-model:show="showSecurity"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <div class="security-popup">
        <van-nav-bar title="账号安全" left-arrow @click-left="showSecurity = false" />
        <div class="security-content">
          <van-cell-group inset>
            <van-cell title="修改密码" is-link @click="handleChangePassword">
              <template #icon>
                <van-icon name="lock" class="cell-icon" />
              </template>
            </van-cell>
            <van-cell
              title="绑定手机"
              is-link
              :value="mobile ? '已绑定' : '未绑定'"
              @click="handleChangeMobile"
            >
              <template #icon>
                <van-icon name="phone-o" class="cell-icon" />
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showConfirmDialog, showToast } from 'vant';
import { clearToken } from '@/utils/session';
import { storeToRefs } from 'pinia';
import useUserStore from '@/stores/user';

defineOptions({
  name: 'MineView',
});

const router = useRouter();
const userStore = useUserStore();
const { name, deptName, avatar } = storeToRefs(userStore);

// 计算属性：优先使用store数据，兜底默认头像
const avatarSrc = computed(
  () => avatar.value || new URL('../../assets/image/system/profile.jpg', import.meta.url).href
);
const username = computed(() => name.value || '未登录');
const deptNameText = computed(() => deptName.value || '暂无部门');

const appVersion = ref('1.0.0');
const mobile = computed(() => userStore.phonenumber || '');
const email = computed(() => userStore.email || '');

// 弹窗状态
const showProfile = ref(false);
const showSecurity = ref(false);

/** 跳转到个人资料 */
function handleGoProfile() {
  showProfile.value = true;
}

/** 跳转到账号安全 */
function handleGoSecurity() {
  showSecurity.value = true;
}

/** 修改密码 */
function handleChangePassword() {
  showToast('修改密码功能开发中');
}

/** 修改手机号 */
function handleChangeMobile() {
  showToast('修改手机功能开发中');
}

/** 退出登录 */
function handleLogout() {
  showConfirmDialog({
    title: '温馨提示',
    message: '您确定要退出登录吗？',
  }).then(() => {
    clearToken();
    router.replace('/');
  });
}
</script>

<style scoped lang="less">
.mine {
  min-height: calc(100vh - 46px - 50px);
  background-color: #f5f5f5;
  padding-bottom: 20px;

  &-header {
    height: 180px;
    background: linear-gradient(180deg, #2c5282 0%, #1a365d 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 16px;

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: center;

      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #fff;
        margin-bottom: 12px;
        border: 3px solid rgba(255, 255, 255, 0.3);
      }

      .info-text {
        text-align: center;

        .username {
          font-size: 18px;
          color: #fff;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .dept {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  &-content {
    margin-top: 12px;
    padding: 0 16px;

    :deep(.van-cell-group--inset) {
      margin: 0;
      border-radius: 12px;
    }
  }

  &-version {
    text-align: center;
    font-size: 12px;
    color: #999;
  }
}

// 退出登录按钮
.logout-section {
  padding: 24px 16px;
  margin-top: 12px;
}

// 个人资料弹窗
.profile-popup {
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .profile-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    .profile-avatar {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: #fff;
      border-radius: 12px;
      margin-bottom: 16px;

      .avatar-img {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: 3px solid #f5f5f5;
        margin-bottom: 8px;
      }

      .avatar-tip {
        font-size: 12px;
        color: #999;
      }
    }

    :deep(.van-cell-group--inset) {
      margin: 0;
      border-radius: 12px;
    }
  }
}

// 账号安全弹窗
.security-popup {
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .security-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    :deep(.van-cell-group--inset) {
      margin: 0;
      border-radius: 12px;
    }

    :deep(.cell-icon) {
      margin-right: 8px;
      font-size: 18px;
      color: #2c5282;
    }
  }
}
</style>
