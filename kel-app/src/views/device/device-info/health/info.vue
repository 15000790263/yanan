<template>
  <div class="info">
    <div class="info-title">
      设备编号：{{ data.equipmentnum !== 'undefined' ? data.equipmentnum : data.equipmentsyscode }}
    </div>
    <div class="info-type">
      <van-field v-model="type" label="保养类型" readonly />
    </div>
    <div class="info-content">
      <div class="info-content-header">
        <div>项目</div>
        <div>维保内容</div>
      </div>
      <div class="info-content-body">
        <van-cell-group inset>
          <template v-for="(item, i) in JSON.parse(data.content)" :key="i">
            <div class="info-content-body-item">
              <div class="info-content-body-item-name">
                <template v-if="type === '临时保养'">
                  {{ item.equipmentname }}
                </template>
                <template v-else>
                  {{ item.label }}
                </template>
              </div>
              <div class="info-content-body-item-value">
                <template v-if="type === '临时保养'">
                  {{ item.content }}
                </template>
                <template v-else>
                  <template v-if="item.option">
                    <template v-for="(val, j) in item.option" :key="j">
                      <!--      一级保养            -->
                      <template v-if="val.type === 'checkbox1'">
                        <template v-if="val.value"> {{ val.label }}<br /> </template>
                      </template>
                      <template v-else-if="val.type === 'checkbox'">
                        <template v-if="val.value"> {{ val.label }}<br /> </template>
                      </template>
                      <template v-else-if="val.type === 'input'"
                        >{{ val.label }}：{{ val.value }}<br
                      /></template>
                      <!--      三级保养            -->
                      <template v-else-if="item.type === 'radio'">
                        <template v-if="val.value === item.value">{{ val.label }}<br /></template>
                      </template>
                      <template v-else>{{ val.value }} <br /></template>
                    </template>
                  </template>
                  <template v-else-if="item.type === 'datetime'">
                    {{ dayjs(item.value[0]).format('YYYY-MM-DD HH:mm:ss') }} --
                    {{ dayjs(item.value[1]).format('YYYY-MM-DD HH:mm:ss') }}
                  </template>
                  <template v-else>{{ item.value }}</template>
                </template>
              </div>
            </div>
          </template>
        </van-cell-group>
      </div>
    </div>

    <div v-if="['5005', '5010', '5001'].includes(data.equipmenttypeid)" class="look-pic">
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
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';
import { getFilePic } from '@/api/device.js';
import config from '@/config';
import { showImagePreview } from 'vant';

const route = useRoute();
const router = useRouter();
const data = JSON.parse(route.query.sourceData);
const type = ref('');

onMounted(() => {
  setType();
});

// 设置保养类型
function setType() {
  switch (data.upkeeptype) {
    case '1':
      type.value = '一级保养';
      break;
    case '3':
      type.value = '三级保养';
      break;
    case '0':
      type.value = '临时保养';
      break;
    default:
      break;
  }
}

const picList = ref([]);

const map = ['设备编号', '保养前照片', '保养后照片', '作业照片'];

let removeGuard;

const showRight = ref(false);

async function lookPic() {
  const { eukId } = data;
  const res = await getFilePic(eukId);
  picList.value = res.data.rows.sort((a, b) => Number(a.type) - Number(b.type));

  showRight.value = true;
  removeGuard = router.beforeEach(() => {
    return false;
  });
}

function handleClosed() {
  removeGuard && removeGuard();
}
</script>

<style scoped lang="less">
.info {
  height: 100%;
  width: 100%;
  padding: 16px;
  background-color: #f5f5f5;
  color: #34394f;
  &-title {
    height: 40px;
    color: #34394f;
    font-weight: 600;
  }
  &-type {
    margin-bottom: 12px;
  }
  &-content {
    height: calc(100% - 40px - 44px - 12px - 50px);
    &-header {
      display: flex;
      color: #00b099;
      font-weight: 600;
      height: 30px;

      > div {
        flex: 1;
      }
    }
    &-body {
      height: calc(100% - 30px);
      overflow-y: scroll;
      //background-color: #fff;
      .van-cell-group {
        margin: 0;
      }
      &-item {
        display: flex;
        font-size: 14px;
        &-name {
          width: 40%;
          padding: 10px 16px;
          border-left: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          &:first-child {
            border-left: none;
          }
        }
        &:last-child {
          > .info-content-body-item-name,
          .info-content-body-item-value {
            border-bottom: none;
          }
        }
        &-value {
          width: 60%;
          padding: 10px 16px;
          border-left: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          display: grid;
          row-gap: 12px;

          word-break: break-all;

          //.van-cell {
          //  padding: 0;
          //
          //  :deep(.van-cell__value) {
          //    border: 1px solid #ddd;
          //    border-radius: 4px;
          //    padding: 0 4px;
          //  }
          //}
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
</style>
