<script setup>
import { ref, onMounted, watch } from 'vue';
import { showConfirmDialog, showToast, showDialog } from 'vant';
import { useRouter } from 'vue-router';
import BasicInfo from '../device-detail/basic-info.vue';
import CheckItem from '../check-item-common/index.vue';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { api_regulator } from '@/api/inspect';
import dayjs from 'dayjs';

import useUserStore from '../../../../stores/user';

const userStore = useUserStore();

const router = useRouter();

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const formData = ref({
  blow: '1', // 漏气
  construction: '1', // 施工
  occupy: '1', // 是否占压/圈占/包埋
  rust: '1', // 是否锈蚀
  sinkStatus: '1', // 是否下沉
  warnBoard: '1', // 警示是否缺失老化
  guardrailRepair: '1', // 护栏是否损坏/缺失
  insulatedWire: '1', // 跨接线/绝缘测试线是否缺失
  support: '1', // 支架是否脱落/缺失
  fenderPile: '1', // 防撞桩是否缺失
  exitPipe: '1', // 出地管是否缺少套管/封堵/防腐层
  lap: '1', // 有无搭接

  problemDescp: '',
  result: '',
});

// const showTransDialog = ref(false)

// const delegatePersonName = ref("")

onMounted(() => {
  formData.value = props.data;
});

watch(
  () => props.data,
  v => {
    formData.value = v;
  }
);

const handleMultiBtnClick = () => {
  router.push(`/inspect/multimedia/${props.data.id}?type=show&insType=regulator`);
};

// 历史数据未确认，可编辑
async function handleEdit() {
  router.push(`/inspect/edit-history?id=${props.data.id}`);
}

// 历史数据未确认，可删除
async function handleDel() {
  showConfirmDialog({
    title: '提示',
    message: '确定要删除当前数据吗？',
  })
    .then(async () => {
      await api_regulator.deletePlanById(props.data.id);
      showToast('操作成功');
      setTimeout(() => {
        router.goBack();
      }, 800);
    })
    .catch(() => {
      // on cancel
    });
}

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
    await api_regulator.putCheckForm({
      id: props.data.id,
      state: '1',
      resultConfirm: userStore.nickName,
      resultConfirmId: userStore.userId,
      resultConfirmDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      resultConfirmDesp,
      isFollow: true
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
      <basic-info type="regulator" :data="props.data" />
    </div>

    <div class="card">
      <ImgBtn type="show" @onMultiBtnClick="handleMultiBtnClick" />
    </div>

    <div class="card">
      <check-item label="是否漏气">
        <van-radio-group disabled v-model="formData['blow']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">漏气</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无施工">
        <van-radio-group
          disabled
          v-model="formData['construction']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="是否占压/圈占/包埋">
        <van-radio-group disabled v-model="formData['occupy']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">占压</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          <!-- <van-radio name="2" icon-size="16px" checked-color="#00B099">缺失</van-radio> -->
        </van-radio-group>
      </check-item>

      <check-item label="是否锈蚀">
        <van-radio-group disabled v-model="formData['rust']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">防腐</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
          <!-- <van-radio name="2" icon-size="16px" checked-color="#00B099">锈蚀</van-radio> -->
        </van-radio-group>
      </check-item>

      <check-item label="是否下沉">
        <van-radio-group
          disabled
          v-model="formData['sinkStatus']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">下沉</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="警示是否缺失老化">
        <van-radio-group
          disabled
          v-model="formData['warnBoard']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">缺失</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="护栏是否损坏/缺失">
        <van-radio-group
          disabled
          v-model="formData['guardrailRepair']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="跨接线是否缺失">
        <van-radio-group
          disabled
          v-model="formData['insulatedWire']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="支架是否脱落/缺失">
        <van-radio-group disabled v-model="formData['support']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="防撞桩是否缺失">
        <van-radio-group
          disabled
          v-model="formData['fenderPile']"
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="出地管是否缺少套管/封堵/防腐层">
        <van-radio-group disabled v-model="formData['exitPipe']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无搭接">
        <van-radio-group disabled v-model="formData['lap']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="出口压力">
        <van-field style="padding: 0 5px" v-model="formData['exportPressure']" disabled></van-field>
      </check-item>

      <check-item label="楼栋">
        <van-field
          style="padding: 0 5px"
          v-model="formData['pipelineTermination']"
          disabled
        ></van-field>
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

      <check-item label="备注" :labelOneLine="true">
        <div class="input-container">
          <van-field
            disabled
            border
            v-model="formData['remark']"
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
