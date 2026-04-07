<script setup>
import { ref, onMounted, watch } from 'vue';
import { showConfirmDialog, showToast, showDialog } from 'vant';

import { useRouter } from 'vue-router';
import BasicInfo from '../device-detail/basic-info.vue';
import CheckItem from '../check-item-common/index.vue';
import { api_yinbao } from '@/api/inspect';
import ImgBtn from '../multimedia-btns/block-img.vue';
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
  electric: '', // 电表数值
  resiElectric: '', // 有无锈蚀
  oilCheck: '1', // 井盖/井圈是否破损
  temperature: '', // 井盖标识是否老化/丢失
  inVoltage: '', // 有无井内堆积杂物
  outVoltage: '', // 阀井是否被占压
  outElectric: '', // 阀井是否积水
  electrode: '', // 补偿器是否正常
  potentStatus: '1', // 补偿器是否正常
  runMode: '', // 补偿器是否正常
  practicalPerson: '', // 实际负责人

  remark: '',
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

const handleMultiBtnClick = () => {
  router.push(`/inspect/multimedia/${props.data.id}?type=show&insType=well`);
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
      await api_yinbao.deletePlanById(props.data.id);
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
    await api_yinbao.putCheckForm({
      id: props.data.id,
      state: '1',
      resultConfirm: userStore.nickName,
      resultConfirmId: userStore.userId,
      resultConfirmDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      resultConfirmDesp,
      isFollow: true,
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
    <!-- <van-dialog @confirm="handleClickTransConfirm" v-model:show="showTransDialog" :confirm-button-disabled="isNameEmpty" title="请输入转派人员姓名" show-cancel-button>
      <van-cell-group inset>
        <van-field v-model="delegatePersonName" label="姓名" placeholder="请输入姓名" />
      </van-cell-group>
    </van-dialog> -->
    <div class="card">
      <basic-info type="yinbao" :data="props.data" />
    </div>

    <!-- <div class="card">
      <ImgBtn type="show" @onMultiBtnClick="handleMultiBtnClick" />
    </div> -->

    <div class="card">
      <check-item label="电表数值" :showPhoto="formData['leakageStatus'] !== '1'">
        <!-- <van-cell-group inset> -->
        <van-field
          v-model.trim="formData.electric"
          label=""
          disabled
          placeholder="请输入电表数值"
        />
        <!-- </van-cell-group> -->
      </check-item>

      <check-item
        label="剩余电流"
        :showPhoto="formData['rust'] !== '1'"
        @onPhotoClick="handleItemRecord('锈蚀')"
      >
        <van-field
          v-model.trim="formData.resiElectric"
          disabled
          label=""
          placeholder="请输入剩余电流"
        />
      </check-item>

      <check-item
        label="油位"
        :showPhoto="formData['wellDamage'] !== '1'"
        @onPhotoClick="handleItemRecord('井盖/井圈破损')"
      >
        <van-radio-group v-model="formData['oilCheck']" disabled shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">异常</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="温度"
        :showPhoto="formData['circleDamage'] !== '1'"
        @onPhotoClick="handleItemRecord('标识老化/丢失')"
      >
        <van-field v-model.trim="formData.temperature" disabled label="" placeholder="请输入温度" />
      </check-item>

      <check-item
        label="输入电压(V)"
        :showPhoto="formData['wellItems'] !== '1'"
        @onPhotoClick="handleItemRecord('井内堆积杂物')"
      >
        <van-field
          v-model.trim="formData.inVoltage"
          disabled
          label=""
          placeholder="请输入输入电压"
        />
      </check-item>

      <check-item
        label="输出电压(V)"
        :showPhoto="formData['wellOccupy'] !== '1'"
        @onPhotoClick="handleItemRecord('阀井被占压')"
      >
        <van-field
          v-model.trim="formData.outVoltage"
          disabled
          label=""
          placeholder="请输入输出电压"
        />
      </check-item>

      <check-item
        label="输出电流(A)"
        :showPhoto="formData['wellWater'] !== '1'"
        @onPhotoClick="handleItemRecord('阀井积水')"
      >
        <van-field
          v-model.trim="formData.outElectric"
          disabled
          label=""
          placeholder="请输入输出电流"
        />
      </check-item>

      <check-item
        label="电极"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-field v-model.trim="formData.electrode" disabled label="" placeholder="请输入电极" />
      </check-item>

      <check-item
        label="阴保井状况"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-radio-group
          v-model="formData['potentStatus']"
          disabled
          shape="dot"
          direction="horizontal"
        >
          <van-radio name="0" icon-size="16px" checked-color="#00B099">损坏</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">无损坏</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="运行模式"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-field v-model.trim="formData.runMode" disabled label="" placeholder="请输入运行模式" />
      </check-item>

      <check-item
        label="检查人"
        :showPhoto="formData['compensator'] !== '1'"
        @onPhotoClick="handleItemRecord('补偿器异常')"
      >
        <van-field
          v-model.trim="formData.practicalPerson"
          disabled
          label=""
          placeholder="请输入检查人"
        />
      </check-item>

      <!-- <check-item v-if="hasError" label="问题说明" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['problemDescp']"
            label=""
            placeholder="请输入问题说明"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>

      <check-item v-if="hasError" label="处理结果" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model="formData['result']"
            label=""
            placeholder="请输入问题说明"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item> -->

      <check-item label="备注" :labelOneLine="true">
        <div class="input-container" :class="{ required: editHistory }">
          <van-field
            border
            v-model.trim="formData['remark']"
            label=""
            placeholder="请输入备注"
            label-align="top"
            type="textarea"
            disabled
          />
        </div>
      </check-item>
    </div>

    <!-- <div class="card">
      <van-row gutter="16">
        <van-col span="8">
          <van-button @click="handleTrans" size="small" plain block round type="success">转派</van-button>
        </van-col>
        <van-col span="8">
          <van-button @click="handleCancel" size="small" block  round type="success">取消</van-button>
        </van-col>
        <van-col span="8">
          <van-button @click="handleConfirm" size="small" block round type="success" color="#FF6A00">确定</van-button>
        </van-col>

      </van-row>

    </div> -->

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

  :deep(.van-field) {
    background-color: transparent;
    padding: 0;
  }
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
