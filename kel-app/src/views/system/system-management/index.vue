<template>
  <div class="wrapper">
    <!-- 外层wrapper上的v-if会影响页面的前进后退动画 -->
    <div class="base-info">
      <div class="avatar">
        <img src="@/assets/image/system/profile.jpg" alt="" />
      </div>
      <div class="nickname">用户 {{ userInfo?.data.nickName }}</div>
    </div>
    <div class="content">
      <template v-for="item in list" :key="item.icon">
        <div class="item" v-if="item.show">
          <van-field v-model="item.value" autofocus readonly :label="item.label">
            <template v-if="item.value === 'card'" #input>
              <span class="card">
                <template v-for="item in cards">
                  <img :src="item" @click="showImagePreview(cards)" />
                </template>
              </span>
            </template>
            <template v-if="item.canEdit" #button>
              <van-icon name="edit" @click="handleEdit(item)" />
            </template>
            <template #left-icon>
              <van-icon :name="item.icon" size="16px" />
            </template>
          </van-field>
        </div>
      </template>
    </div>

    <div class="footer">
      <van-button type="primary" size="small" @click="changePassword">修改密码</van-button>
    </div>
  </div>
</template>

<script setup lang="jsx">
import { onMounted } from 'vue';
import { getUserInfo, getThirdUser, updateEmployee } from '../../../api/work';
import { resetPwd, updateUserInfo } from '../../../api/system';
import { showConfirmDialog, showImagePreview, Uploader } from 'vant';
import { createLoading } from '../../../utils/loading-fn';
import { useToast } from '@/hooks/use-my-toast';
import { addWatermarkToImage } from '../../inspect/util/image';
import { getPhoto } from '../../../utils/cordova-tools';
import { blobToBase64 } from '../../../utils/tools';
import useUserStore from '@/stores/user.js';

const { showToast, showSuccessToast } = useToast();
const userStore = useUserStore();

const userInfo = ref(null);

const list = computed(() => [
  {
    icon: 'manager',
    label: '用户账号',
    value: userInfo.value?.data.userName,
    show: true,
  },
  {
    icon: 'phone',
    label: '手机号码',
    value: userInfo.value?.data.phonenumber,
    canEdit: true,
    key: 'phonenumber',
    regexp: /^1[3-9]\d{9}$/,
    show: true,
  },
  {
    icon: 'invitation',
    label: '用户邮箱',
    value: userInfo.value?.data.email,
    canEdit: true,
    key: 'email',
    regexp: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    show: true,
  },
  {
    icon: 'cluster',
    label: '所属部门',
    value: userInfo.value?.postGroup || userStore.deptName,
    show: true,
  },
  {
    icon: 'friends',
    label: '所属角色',
    value: userInfo.value?.roleGroup,
    show: true,
  },
  {
    icon: 'setting',
    label: '创建日期',
    value: userInfo.value?.data.createTime,
    show: true,
  },
  {
    icon: 'card',
    label: '我的证件',
    value: 'card',
    canEdit: true,
    key: 'card',
    show: !!employeeId.value,
  },
]);

const cards = ref([]);

const employeeId = ref('');

function getInfo() {
  const destroy = createLoading();
  getUserInfo()
    .then(res => {
      userInfo.value = res.data;
      return res.data.data;
    })
    .finally(() => {
      destroy();
    })
    .then(res => {
      return getThirdUser(res.nickName);
    })
    .then(res => {
      employeeId.value = res.data.rows[0]?.id;
      cards.value = res.data.rows.map(i => i.photo);
    });
}

onMounted(getInfo);

const password = ref();

function changePassword() {
  showConfirmDialog({
    title: '修改密码',
    message: () => (
      <div style="margin-top: 20px">
        <span>新密码：</span>
        <input
          style="border: 2px solid #ccc; border-radius: 4px; padding: 0 4px"
          placeholder="请输入新密码"
          oninput={e => {
            password.value = e.target.value.trim();
          }}
        />
      </div>
    ),
  })
    .then(async () => {
      const data = {
        password: password.value,
        userId: userInfo.value.data.userId,
      };
      await resetPwd(data);
      showToast(`操作成功，新密码为：${password.value}`);
    })
    .catch(err => {});
}

const fileList = ref([]);

function handleEdit(item) {
  let newV = '';

  if (item.key === 'card') {
    fileList.value = [];
    showConfirmDialog({
      title: `修改${item.label}`,
      message: () => (
        <div style="margin-top: 20px">
          <Uploader
            readonly
            result-type="file"
            max-count={1}
            modelValue={fileList.value}
            onUpdate:modelValue={async () => {
              fileList.value = [];
            }}
            onClick={async () => {
              if (!fileList.value.length) {
                const blob1 = await getPhoto();
                const blob2 = await addWatermarkToImage(blob1);
                const ou = URL.createObjectURL(blob2);
                fileList.value = [{ file: blob2, objectUrl: ou }];
              }
            }}
          />
        </div>
      ),
    })
      .then(async () => {
        const dataUrl = await blobToBase64(fileList.value[0].file);
        const data = {
          id: employeeId.value,
          photo: dataUrl,
        };

        await updateEmployee(data);
        getInfo();
        showSuccessToast('操作成功');
      })
      .catch(err => {});
  } else {
    showConfirmDialog({
      title: `修改${item.label}`,
      message: () => (
        <div style="margin-top: 20px">
          <span>新{item.label}：</span>
          <input
            style="border: 2px solid #ccc; border-radius: 4px; padding: 0 4px"
            value={newV || item.value}
            oninput={e => {
              newV = e.target.value.trim();
            }}
          />
        </div>
      ),
      beforeClose(action) {
        if (action === 'confirm' && !item.regexp.test(newV)) {
          showToast('格式不正确');
          return false;
        }
        return true;
      },
    })
      .then(async () => {
        const data = {
          id: userInfo.value.data.userId,
          [item.key]: newV,
        };

        await updateUserInfo(data);
        getInfo();
        showSuccessToast('操作成功');
      })
      .catch(err => {});
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;

  font-size: 14px;
  color: #34394f;

  .base-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background-color: #deeefc;
    height: 160px;
    padding: 20px 0;
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 10vw;
      width: 80vw;
      height: 80vw;
      border-radius: 50%;
      background-color: #c4e0ff66;
    }

    &::after {
      content: '';
      position: absolute;
      top: -50vw;
      left: -30px;
      width: 80vw;
      height: 80vw;
      border-radius: 50%;
      background-color: #c4e0ff66;
    }

    .avatar {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      overflow: hidden;
      border: #fff 4px solid;
      box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 9;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .nickname {
      font-size: 16px;
      color: #808a98;
      position: relative;
      z-index: 9;
      font-weight: 600;
    }
  }

  .content {
    display: grid;
    grid-template-rows: repeat(auto-fill, 48px);
    row-gap: 10px;

    .item {
      height: 48px;
      background-color: #fff;
      padding: 0 16px;
      display: flex;
      align-items: center;
      // border-bottom: 1px solid #ddd;

      .card {
        display: flex;
        position: relative;
        height: 24px;
        width: 36px;

        img {
          object-fit: cover;
          position: absolute;
          height: 36px;
          width: 36px;
          top: -6px;
        }
      }
    }
  }

  .footer {
    position: fixed;
    bottom: 10vh;
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
