<template>
  <div class="wrapper">
    <div class="title">
      {{ data[0].equipmentnum }}
    </div>

    <div
      class="user"
      style="margin-bottom: 16px; border-radius: 8px; overflow: hidden; border: 1px solid #2bb4b3"
    >
      <van-field
        v-model="data[0].operator"
        label="维修人"
        placeholder=""
        label-align="top"
        readonly
      />
    </div>

    <div class="content">
      <van-cell-group inset>
        <template v-for="item in data">
          <div class="input-wrapper">
            <van-field
              v-model.trim="item.equipmentname"
              type="textarea"
              rows="1"
              autosize
              label="设备名称"
              placeholder="请输入设备名称"
              label-align="top"
              readonly
            />
            <van-field
              v-model.trim="item.content"
              type="textarea"
              rows="1"
              autosize
              label="维检内容"
              placeholder="请输入维检内容"
              label-align="top"
              readonly
            />
            <van-field
              :modelValue="item.operationtime.split(' ').shift()"
              label="维检时间"
              placeholder="请选择"
              label-align="top"
              readonly
            />
          </div>
        </template>
      </van-cell-group>
    </div>

    <div v-if="picList.length" class="look-pic">
      <van-button type="primary" color="#25a0e2" @click="lookPic">查看照片</van-button>
    </div>

    <van-popup
      v-model:show="showRight"
      position="right"
      closeable
      :style="{ width: '100%', height: '100%' }"
      @closed="handleClosed"
    >
      <div class="outer">
        <div class="inner" style="overflow-y: scroll; height: 100%">
          <template v-for="item in picList" :key="item.id">
            <div>
              <div class="title" style="display: flex; align-items: flex-end">
                {{ map[item.type] }}
              </div>
              <img
                style="display: inline-block; width: 80%; object-fit: contain"
                :src="`${config.fileUrl}${item.fileUrl}`"
                alt=""
                @click="showImagePreview([`${config.fileUrl}${item.fileUrl}`])"
              />
            </div>
          </template>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { getFilePic } from '@/api/device.js';
import config from '@/config';
import { showImagePreview } from 'vant';

const route = useRoute();
const router = useRouter();

const data = JSON.parse(route.query.sourceData);

const picList = ref([]);

const map = ['设备编号', '维修前照片', '维修后照片', '作业照片'];

let removeGuard;

const showRight = ref(false);

onMounted(async () => {
  const { oddnumbers } = data[0];
  const res = await getFilePic(oddnumbers);
  picList.value = res.data.rows.sort((a, b) => Number(a.type) - Number(b.type));
});

function lookPic() {
  showRight.value = true;
  removeGuard = router.beforeEach(() => {
    return false;
  });
}

function handleClosed() {
  removeGuard && removeGuard();
}
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;

  .title {
    height: 40px;
    color: #34394f;
    font-weight: 600;
  }

  .add-item {
    position: fixed;
    top: 60px;
    right: 15px;
  }

  .content {
    height: calc(100% - 180px);
    overflow-y: scroll;

    .van-cell-group {
      margin: 0;

      display: grid;
      row-gap: 16px;
      background-color: #f5f5f5;

      .input-wrapper {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #2bb4b3;

        .van-cell {
          border-bottom: 1px solid #2bb4b355;

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }
  }

  .look-pic {
    height: 50px;
    display: grid;
    align-items: flex-end;
  }

  .outer {
    padding: 24px;
    height: 100vh;
  }
}
</style>
