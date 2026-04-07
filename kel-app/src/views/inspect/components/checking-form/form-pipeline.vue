<script setup>
import { ref, computed, onMounted } from 'vue';
import { showSuccessToast, showFailToast } from 'vant';
import { useRouter } from 'vue-router';
import BasicInfo from '../device-detail/basic-info.vue';
import CheckItem from '../check-item-common/index.vue';

import { api_pipeline, getStaffs } from '@/api/inspect';
import { getPatrolStatus } from '../../util/check';

const router = useRouter();

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const staffs = ref([]);

const showPicker = ref(false);

const getStaffList = async () => {
  const res = await getStaffs();
  if (res.status === 200 && res.data.code === 200) {
    staffs.value = res.data.rows.map(item => ({
      text: item.name,
      value: item.userId,
    }));
  }
};

const onStaffPickerConfirm = ({ selectedOptions }) => {
  showPicker.value = false;
  delegatePersonName.value = selectedOptions[0].text;
  delegatePersonId.value = selectedOptions[0].value;
};

onMounted(() => {
  getStaffList();
});

const formData = ref({
  // baseUnstable: "0",
  // bushingBlock: "0",
  // circleDamage: "0",
  // deform: "0",
  // failureBar: "0",
  // ladder: "0",
  // leakageStatus: "0",
  // looseBar: "0",
  // looseBolts: "0",
  // openTrouble: "0",
  // rust:"0",
  // shimAge: "0",
  // wellCollapse: "0",
  // wellDamage: "0",
  // wellWater: "0",
  problemDescp: '',
  result: '',
});

const showTransDialog = ref(false);

const delegatePersonName = ref('');
const delegatePersonId = ref('');

const handleConfirm = async () => {
  console.log('confirm::', formData.value);

  const res = await api_pipeline.putCheckForm({
    ...props.data,
    ...formData.value,
    ...getPatrolStatus(formData.value),
  });

  if (res.status === 200 && res.data.code === 200) {
    showSuccessToast(res.data.msg);
    setTimeout(() => {
      router.goBack();
    }, 800);
    return;
  }
  showFailToast('提交失败');
};

const handleTrans = () => {
  showTransDialog.value = true;
};

const handleClickTransConfirm = async () => {
  const res = await api_pipeline.transTaskAnother(
    props.data.id,
    delegatePersonName.value,
    delegatePersonId.value
  );
  if (res.status === 200 && res.data.code === 200) {
    showSuccessToast(res.data.msg);
    setTimeout(() => {
      router.goBack();
    }, 800);
    return;
  }
};

const handleCancel = () => {
  router.goBack();
};

const isNameEmpty = computed(() => {
  return delegatePersonName.value === '';
});
</script>

<template>
  <div class="main-container">
    <van-dialog
      @confirm="handleClickTransConfirm"
      v-model:show="showTransDialog"
      :confirm-button-disabled="isNameEmpty"
      title="请输入转派人员姓名"
      show-cancel-button
    >
      <van-cell-group inset>
        <van-field
          is-link
          v-model="delegatePersonName"
          label="姓名"
          placeholder="请选择姓名"
          @click="showPicker = true"
        />
      </van-cell-group>
    </van-dialog>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :columns="staffs" @cancel="showPicker = false" @confirm="onStaffPickerConfirm" />
    </van-popup>
    <div class="card">
      <basic-info type="pipeline" :data="props.data" v-bind="$attrs" />
    </div>

    <div class="card">
      <!-- 
      <check-item label="有无基座不稳">
        <van-radio-group v-model="formData['baseUnstable']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">不稳</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>


      <check-item label="套管有无封堵">
        <van-radio-group v-model="formData['bushingBlock']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">封堵</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>


      <check-item label="有无井圈损坏">
        <van-radio-group v-model="formData['circleDamage']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">损坏</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无变形鼓包">
        <van-radio-group v-model="formData['deform']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">变形</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>


      <check-item label="有无拉杆失效">
        <van-radio-group v-model="formData['failureBar']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">失效</van-radio> 
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>


      <check-item label="有无爬梯维修">
        <van-radio-group v-model="formData['ladder']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">维修</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无泄露">
        <van-radio-group v-model="formData['leakageStatus']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">泄漏</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无拉杆松动">
        <van-radio-group v-model="formData['looseBar']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">松动</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无螺栓松动">
        <van-radio-group v-model="formData['looseBolts']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">松动</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无启闭困难">
        <van-radio-group v-model="formData['openTrouble']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">困难</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      
      <check-item label="有无防腐/锈蚀">
        <van-radio-group v-model="formData['rust']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">锈蚀</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>


      <check-item label="有无积水片老化">
        <van-radio-group v-model="formData['shimAge']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">老化</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>


      <check-item label="有无井座塌陷">
        <van-radio-group v-model="formData['wellCollapse']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">塌陷</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无井盖损坏">
        <van-radio-group v-model="formData['wellDamage']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">损坏</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item>

      <check-item label="有无井内积水">
        <van-radio-group v-model="formData['wellWater']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">积水</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">正常</van-radio>
        </van-radio-group>
      </check-item> -->

      <check-item label="问题说明" :labelOneLine="true">
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

      <check-item label="处理结果" :labelOneLine="true">
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
      </check-item>
    </div>

    <div class="card">
      <van-row gutter="16">
        <!-- <van-col span="8">
          <van-button @click="handleTrans" size="small" plain block round type="success">转派</van-button>
        </van-col> -->
        <van-col span="12">
          <van-button @click="handleCancel" size="small" block round type="success"
            >取消</van-button
          >
        </van-col>
        <van-col span="12">
          <van-button @click="handleConfirm" size="small" block round type="success" color="#FF6A00"
            >确定</van-button
          >
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

  :deep(.van-field) {
    background-color: transparent;
  }
}
.empty {
  height: 32px;
}
</style>
