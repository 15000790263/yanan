<script setup>
import { ref, watch, onMounted } from 'vue';

import BasicInfo from '../device-detail/basic-info.vue';
import CheckItem from '../check-item-common/index.vue';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { showConfirmDialog, showToast, showDialog } from 'vant';
import { api_pipeline } from '@/api/inspect';
import dayjs from 'dayjs';

import useUserStore from '../../../../stores/user';

const userStore = useUserStore();
const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const formData = ref({
  blow: '1',
  construction: '1',
  occupy: '1',
  pipelineNo: '',
  pipelineName: '',
  problemDescp: '',
  result: '',
});

onMounted(() => {
  formData.value = props.data;
});

watch(
  () => props.data,
  v => {
    formData.value = v;
  }
);

function getCount(type) {
  let ap = formData.value.annormalPoint;
  // console.log(ap);
  if (ap) {
    if (!ap.endsWith(']')) {
      ap += '}]';
    }
    const annormalPoint = JSON.parse(ap);
    // console.log(annormalPoint);
    return annormalPoint.filter(item => item.label === type).length;
  } else {
    return 0;
  }
}

const blowCount = computed(() => getCount('漏气'));
const constructionCount = computed(() => getCount('施工'));
const occupyCount = computed(() => getCount('占压'));

const router = useRouter();

// 历史数据未确认，可编辑
async function handleEdit() {
  router.push(`/inspect/inspect-home?pipelineId=${props.data.id}`);
}

// 历史数据未确认，可删除
async function handleDel() {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除当前数据吗？',
  })
    .then(async () => {
      await api_pipeline.deleteCheck(props.data.id);
      showToast('操作成功');
      setTimeout(() => {
        router.goBack();
      }, 800);
    })
    .catch(() => {
      // on cancel
    });
}

const handleMultiBtnClick = () => {
  router.push(`/inspect/multimedia/${props.data.id}?type=show&insType=pipeline`);
};

let resultConfirmDesp = '同意';

// 巡检确认
function handleConfirm() {
  showDialog({
    title: '请输入意见',
    message: h('input', {
      style: {
        display: 'inline-block',
        height: '30px',
        border: '1px solid #ddd',
        width: '100%',
        padding: '0 10px',
      },
      value: resultConfirmDesp,
      oninput(e) {
        resultConfirmDesp = e.target.value;
      },
      onblur(e) {
        if (e.target.value === '') {
          resultConfirmDesp = e.target.value = '同意';
        }
      },
    }),
    closeOnClickOverlay: true,
  }).then(async () => {
    await api_pipeline.putCheckForm({
      id: props.data.id,
      state: '1',
      resultConfirm: userStore.nickName,
      resultConfirmId: userStore.userId,
      resultConfirmDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      resultConfirmDesp,
    });

    showToast('操作成功');
    setTimeout(() => {
      router.goBack();
    }, 800);
  });
}
</script>

<template>
  <div class="main-container">
    <div class="card">
      <basic-info type="pipeline" :data="props.data" />
    </div>

    <div class="card">
      <ImgBtn type="show" @onMultiBtnClick="handleMultiBtnClick" />
    </div>

    <div class="card">
      <check-item label="有无漏气">
        <van-radio-group disabled v-model="formData['blow']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">漏气</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099"> 正常 </van-radio>
        </van-radio-group>
        <span v-if="blowCount > 0" style="margin-top: -1px; color: #323233">
          <span
            style="
              color: #fff;
              border-radius: 50%;
              background-color: #f00;
              width: 18px;
              height: 18px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
            "
            >{{ blowCount }}</span
          >
          处异常</span
        >
      </check-item>

      <check-item label="有无施工">
        <van-radio-group
          disabled
          v-model="formData['construction']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">施工</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常 </van-radio>
        </van-radio-group>
        <span v-if="constructionCount > 0">
          <span
            style="
              color: #fff;
              border-radius: 50%;
              background-color: #f00;
              width: 18px;
              height: 18px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
            "
            >{{ constructionCount }}</span
          >
          处异常</span
        >
      </check-item>

      <check-item label="有无占压">
        <van-radio-group disabled v-model="formData['occupy']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">占压</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
        <span v-if="occupyCount > 0">
          <span
            style="
              color: #fff;
              border-radius: 50%;
              background-color: #f00;
              width: 18px;
              height: 18px;
              display: inline-flex;
              justify-content: center;
              align-items: center;
            "
            >{{ occupyCount }}</span
          >
          处异常</span
        >
      </check-item>

      <check-item label="问题说明" :labelOneLine="true">
        <div class="input-container">
          <van-field
            disabled
            border
            v-model="formData['problemDescp']"
            label=""
            placeholder=""
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>

      <check-item label="处理结果" :labelOneLine="true">
        <div class="input-container">
          <van-field
            disabled
            border
            v-model="formData['result']"
            label=""
            placeholder=""
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>
    </div>

    <div class="card" v-if="data.state === '0'">
      <van-row gutter="16" justify="space-around">
        <van-col span="8">
          <van-button @click="handleEdit" size="small" block round type="primary">
            修改
          </van-button>
        </van-col>
        <!-- <van-col span="8">
          <van-button @click="handleDel" size="small" block round type="danger"> 删除 </van-button>
        </van-col> -->
        <van-col span="8" v-if="userStore.permissions.includes('safe:plan:add')">
          <van-button @click="handleConfirm" size="small" block round type="success">
            确认
          </van-button>
        </van-col>
      </van-row>
    </div>
    <div class="empty"></div>
  </div>
</template>

<style lang="less" scoped>
.main-container {
  // 有问题
  height: calc(100vh - 48px - 58px - 52px);
  overflow-y: auto;
}

.card {
  margin-top: 12px;
  padding: 12px 24px;
  background-color: white;
}

.input-container {
  border-radius: 4px;
  opacity: 1;
  background: rgba(68, 116, 121, 0.1);
  border: 1px solid #e7eeee;
  width: 100%;

  // :deep(.van-field) {
  //   background-color: transparent;
  // }
}
.empty {
  height: 32px;
}
</style>
