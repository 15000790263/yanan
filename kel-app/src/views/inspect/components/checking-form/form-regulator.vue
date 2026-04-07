<script setup>
import { showSuccessToast, showFailToast, showToast, showConfirmDialog } from 'vant';
import { useRouter } from 'vue-router';
import BasicInfo from '../device-detail/basic-info.vue';
import CheckItem from '../check-item-common/index.vue';
import ImgBtn from '../multimedia-btns/block-img.vue';
import { api_regulator, getStaffs, api_plan } from '@/api/inspect';
import { mediaCacheInstance } from '../../util/mediaCache';
import config from '../../../../config';
import { useInspectPicStore } from '@/stores/inspect/inspect-pic';
import { useRegulatorStore } from '@/stores/inspect/regulator';
import { createLoading } from '../../../../utils/loading-fn';
import { getIsInspect } from '../../../../utils/session';
import { getBuildingRelation } from '../../../../api/device';
import { useMainDataStore } from '@/stores/inspect/main-data';

const inspectPic = useInspectPicStore();
const regulatorStore = useRegulatorStore();
const useMainData = useMainDataStore();

const router = useRouter();
const route = useRoute();

const attrs = useAttrs();

const editHistory = computed(() => route.query.fromHistory);

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
  staffs: {
    type: Array,
    default: () => {
      return [];
    },
  },
  canFormConfirm: {
    type: Boolean,
    default: true,
  },
});

const buildings = ref([]);

watch(
  () => props.data,
  async () => {
    const equipmentsyscode = props.data?.equipmentsyscode;
    if (equipmentsyscode) {
      const res = await getBuildingRelation(equipmentsyscode);
      buildings.value = res.data.rows;
    }
  }
);

defineEmits(['refresh']);

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
  exportPressure: '', // 出口压力

  // groundWire: "1",
  // lockStatus: "1",
  // runStatus: "1",
  problemDescp: '',
  result: '',
  remark: '',
  pipelineTermination: '',
});

// const staffs = ref([])

const showPicker = ref(false);

// const getStaffList = async () => {
//   const res = await getStaffs()
//   if (res.status === 200 && res.data.code === 200) {
//     staffs.value = res.data.rows.map(item => ({
//       text: item.name,
//       value: item.userId
//     }))
//   }
// }

const onStaffPickerConfirm = ({ selectedOptions }) => {
  showPicker.value = false;
  delegatePersonName.value = selectedOptions[0].text;
  delegatePersonId.value = selectedOptions[0].value;
};

// 三张照片
const threePictures = ['one', 'two', 'three'];

// 编辑时初始化三张照片
async function initPics() {
  if (editHistory.value) {
    if (!inspectPic.pictureCache.length) {
      //   // 修改，处理三张图片
      const promises = props.data.imagePath
        .split(';')
        .filter(item => {
          const index = threePictures.findIndex(value => item?.includes(value));
          return index !== -1;
        })
        .map(async item => {
          return (await fetch(`${config.fileUrl}${item}`)).blob();
        });

      const blobs = await Promise.all(promises);

      const regulatorList = [
        {
          name: 'one',
          title: '设备编号',
          fileList: [],
        },
        {
          name: 'two',
          title: '检测仪器浓度数值',
          fileList: [],
        },
        {
          name: 'three',
          title: '出口压力',
          fileList: [],
        },
      ];

      regulatorList.forEach((item, index) => {
        const objectUrl = URL.createObjectURL(blobs[index]);
        item.fileList = [
          {
            file: blobs[index],
            objectUrl,
          },
        ];
      });

      inspectPic.setPictureCache(regulatorList);
    }
  }
}

watch(
  () => props.data,
  v => {
    // formData.value = v;
    const o = formData.value;
    Object.keys(o).forEach(key => {
      if (v[key]) {
        o[key] = v[key];
      }
    });
    if (v.imagePath) {
      initPics();
    }
  },
  {
    immediate: true,
  }
);

const showTransDialog = ref(false);

const delegatePersonName = ref('');
const delegatePersonId = ref('');

const getFileBlobs = async () => {
  const files = mediaCacheInstance.getMediaListFromCache();

  const fileBlobs = [];
  if (files?.length > 0) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // const blob = await file2Blob(file)
      fileBlobs.push(file);
    }
  }

  return fileBlobs;
};

function getPatrolStatus(data) {
  // console.log('------', data);
  let isOk = true;
  const keys = Object.keys(data);
  for (const key of keys) {
    if (
      key === 'result' ||
      key === 'problemDescp' ||
      key === 'exportPressure' ||
      key === 'pipelineTermination' ||
      data[key] === ''
    )
      continue;
    const value = +data[key];
    if (value === 0) {
      isOk = false;
      break;
    }
  }

  return {
    patrolStatus: isOk ? 1 : 2,
  };
}

const handleConfirm = async () => {
  if (editHistory.value) {
    if (!formData.value.remark) {
      return showToast('备注不能为空');
    }
  }

  if (!formData.value.exportPressure) {
    document.querySelector('.exportPressure-required').scrollIntoView();
    return showToast('出口压力不能为空');
  }

  if (!formData.value.pipelineTermination) {
    document.querySelector('.pipelineTermination-required').scrollIntoView();
    return showToast('楼栋不能为空');
  }

  // 必填的三张图片
  const pictureCache = inspectPic.pictureCache;

  if (!pictureCache.length) {
    showToast('请添加图片必填项');
    return;
  } else {
    const index = pictureCache.findIndex(item => !item.fileList.length);
    if (index !== -1) {
      showToast('请添加图片必填项');
      return;
    }
  }

  const { longitude: lon, latitude: lat } = attrs.location;

  const params = {
    ...props.data,
    ...formData.value,
    ...getPatrolStatus(formData.value),
    lon,
    lat,
  };

  // 获取当前拍摄的图片和语音
  let fileBlobs = await getFileBlobs();

  if (editHistory.value) {
    // 这里只处理下图片吧，语音暂不处理（经测试，语音也被处理了）
    if (props.data.imagePath) {
      const promises = props.data.imagePath
        .split(';')
        .filter(Boolean)
        .filter(item => {
          // 过滤掉三张照片
          const index = threePictures.findIndex(value => item.includes(value));
          return index === -1;
        })
        .map(async item => {
          return (await fetch(`${config.fileUrl}${item}`)).blob();
        });

      const blobs = await Promise.all(promises);

      // 将之前的图片语音文件拼接到最前面，然后保存
      fileBlobs.unshift(...blobs);
    }
  }

  const destroy = createLoading('数据上传中，请稍等', { duration: 30000 });

  const res = await api_regulator.putCheckForm(params, fileBlobs, pictureCache).finally(destroy);

  const id = res.data.data;

  if (res.status === 200 && res.data.code === 200) {
    const isInspect = getIsInspect();
    if (isInspect) {
      if (!regulatorStore.regulatorIdList.includes(id)) {
        regulatorStore.setRegulatorIdList(id);
      }
    }

    // 异常加入隐患系统
    if (!editHistory.value && getPatrolStatus(formData.value).patrolStatus === 2) {
      showConfirmDialog({
        title: '提示',
        message: '本次巡检结果存在异常，是否加入隐患系统？',
      })
        .then(() => {
          router.push('/inspect/inspect-pitfall-add?source=regulator');
        })
        .catch(() => {
          isFromPipe();
          router.goBack();
        });
    } else {
      showSuccessToast(res.data.msg);
      setTimeout(() => {
        isFromPipe();
        router.goBack();
      }, 800);
    }

    mediaCacheInstance.clear();

    useMainData.updateLocalPoints(props.data, true);

    const res2 = await api_regulator.getList({
      planStatus: '1',
      patrolPlanId: props.data.patrolPlanId,
    });

    const cnt = res2.data.total;

    await api_plan.updatePlanCnt({
      planId: props.data.patrolPlanId,
      completedCnt: cnt,
    });
  } else {
    showFailToast('提交失败');
  }
};

const handleTrans = () => {
  showTransDialog.value = true;
};

const handleClickTransConfirm = async () => {
  const res = await api_regulator.transTaskAnother(
    props.data.id,
    delegatePersonName.value,
    delegatePersonId.value
  );
  if (res.status === 200 && res.data.code === 200) {
    showSuccessToast(res.data.msg);
    setTimeout(() => {
      isFromPipe();
      router.goBack();
    }, 800);

    // 新需求：修改父plan的patrolPerson
    const data = {
      id: props.data.patrolPlanId,
      patrolPerson: props.data.patrolPerson.includes(delegatePersonName.value)
        ? props.data.patrolPerson
        : props.data.patrolPerson + ',' + delegatePersonName.value,
    };
    await api_plan.updatePlan(data);

    useMainData.updateLocalPoints(props.data);
    return;
  }
};

const handleCancel = () => {
  isFromPipe();
  router.goBack();

  if (!editHistory.value && route.query.isDelegate !== 'true') {
    if (route.query.type === 'regulator') {
      api_regulator.deletePost(props.data.id);
    }
  }
};

function isFromPipe() {
  if (route.query?.isfrompipeline) {
    sessionStorage.setItem('isfrompipeline', 'true');
  }
}

const isNameEmpty = computed(() => {
  return delegatePersonName.value === '';
});

const hasError = computed(() => {
  const { patrolStatus } = getPatrolStatus(formData.value);
  return patrolStatus !== 1;
});

const handleMultiBtnClick = async () => {
  router.push(`/inspect/add-picture?type=regulator`);
};

const handleItemRecord = checkingStr => {
  window.localStorage.setItem('watermark_checkingItem', checkingStr);
  mediaCacheInstance.cacheCheckingItem(checkingStr);
  // handleMultiBtnClick();
  router.push(`/inspect/multimedia/${props.data.id}?type=edit`);
};

const showPup = ref(false);

function chooseBuilding() {
  if (!buildings.value.length) {
    return;
  }
  showPup.value = true;
}

function handleBuilding(e) {
  formData.value.pipelineTermination = e.target.textContent;
  showPup.value = false;
}
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
          readonly
          placeholder="请选择姓名"
          @click="showPicker = true"
        />
      </van-cell-group>
    </van-dialog>

    <van-popup v-model:show="showPicker" round position="bottom">
      <van-picker :columns="staffs" @cancel="showPicker = false" @confirm="onStaffPickerConfirm" />
    </van-popup>
    <div class="card">
      <basic-info type="regulator" :data="props.data" v-bind="$attrs">
        <template #icon>
          <div>
            <div
              style="
                background-color: #2ab1b8;
                padding: 2px 10px;
                color: #fff;
                border-radius: 4px;
                margin-left: -10px;
                margin-bottom: 10px;
              "
              @click="$emit('refresh')"
            >
              重新定位
            </div>
            <div
              style="
                background-color: #2ab1b8;
                padding: 2px 10px;
                color: #fff;
                border-radius: 4px;
                margin-left: -10px;
              "
              @click="$router.push(`/inspect/inspect-trail?loc=true`)"
            >
              查看位置
            </div>
          </div>
        </template>
      </basic-info>
    </div>

    <div class="card">
      <ImgBtn type="editor" @onMultiBtnClick="handleMultiBtnClick" />
    </div>

    <div class="card">
      <check-item
        label="有无漏气"
        allowPhoto
        :showPhoto="formData['blow'] !== '1'"
        @onPhotoClick="handleItemRecord('漏气')"
      >
        <van-radio-group v-model="formData['blow']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">有</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">无</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="有无施工"
        allowPhoto
        :showPhoto="formData['construction'] !== '1'"
        @onPhotoClick="handleItemRecord('施工')"
      >
        <van-radio-group v-model="formData['construction']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">有</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">无</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="是否占压/圈占/包埋"
        allowPhoto
        :showPhoto="formData['occupy'] !== '1'"
        @onPhotoClick="handleItemRecord('占压/圈占/包埋')"
      >
        <van-radio-group v-model="formData['occupy']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
          <!-- <van-radio name="2" icon-size="16px" checked-color="#00B099">缺失</van-radio> -->
        </van-radio-group>
      </check-item>

      <check-item
        label="有无锈蚀"
        allowPhoto
        :showPhoto="formData['rust'] !== '1'"
        @onPhotoClick="handleItemRecord('锈蚀')"
      >
        <van-radio-group v-model="formData['rust']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">有</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">无</van-radio>
          <!-- <van-radio name="2" icon-size="16px" checked-color="#00B099">锈蚀</van-radio> -->
        </van-radio-group>
      </check-item>

      <check-item
        label="是否下沉"
        allowPhoto
        :showPhoto="formData['sinkStatus'] !== '1'"
        @onPhotoClick="handleItemRecord('下沉')"
      >
        <van-radio-group v-model="formData['sinkStatus']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="警示是否缺失老化"
        allowPhoto
        :showPhoto="formData['warnBoard'] !== '1'"
        @onPhotoClick="handleItemRecord('警示缺失老化')"
      >
        <van-radio-group v-model="formData['warnBoard']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="护栏是否损坏/缺失"
        allowPhoto
        :showPhoto="formData['guardrailRepair'] !== '1'"
        @onPhotoClick="handleItemRecord('护栏损坏/缺失')"
      >
        <van-radio-group v-model="formData['guardrailRepair']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="跨接线是否缺失"
        allowPhoto
        :showPhoto="formData['insulatedWire'] !== '1'"
        @onPhotoClick="handleItemRecord('跨接线缺失')"
      >
        <van-radio-group v-model="formData['insulatedWire']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="支架是否脱落/缺失"
        allowPhoto
        :showPhoto="formData['support'] !== '1'"
        @onPhotoClick="handleItemRecord('支架脱落/缺失')"
      >
        <van-radio-group v-model="formData['support']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="防撞桩是否缺失"
        allowPhoto
        :showPhoto="formData['fenderPile'] !== '1'"
        @onPhotoClick="handleItemRecord('防撞桩缺失')"
      >
        <van-radio-group v-model="formData['fenderPile']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="出地管是否缺少套管/封堵/防腐层"
        allowPhoto
        :showPhoto="formData['exitPipe'] !== '1'"
        @onPhotoClick="handleItemRecord('出地管缺少套管/封堵/防腐层')"
      >
        <van-radio-group v-model="formData['exitPipe']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">是</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">否</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="有无搭接"
        allowPhoto
        :showPhoto="formData['lap'] !== '1'"
        @onPhotoClick="handleItemRecord('搭接')"
      >
        <van-radio-group v-model="formData['lap']" shape="dot" direction="horizontal">
          <van-radio name="0" icon-size="16px" checked-color="#00B099">有</van-radio>
          <van-radio name="1" icon-size="16px" checked-color="#00B099">无</van-radio>
        </van-radio-group>
      </check-item>

      <check-item
        label="出口压力(KPa)<i class='exportPressure-required' style='color: red; padding-left: 5px'>*<i>"
      >
        <van-field
          style="padding: 0 5px"
          v-model.trim="formData['exportPressure']"
          placeholder="请输入"
          type="number"
        ></van-field>
      </check-item>

      <check-item
        label="楼栋<i class='pipelineTermination-required' style='color: red; padding-left: 5px'>*<i>"
      >
        <van-field
          style="padding: 0 5px"
          v-model.trim="formData['pipelineTermination']"
          :placeholder="buildings.length ? '请选择' : '请输入'"
          :readonly="!!buildings.length"
          @click-input="chooseBuilding"
        ></van-field>
      </check-item>

      <check-item v-if="hasError" label="问题说明" :labelOneLine="true">
        <div class="input-container">
          <van-field
            border
            v-model.trim="formData['problemDescp']"
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
            v-model.trim="formData['result']"
            label=""
            placeholder="请输入处理结果"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>

      <check-item v-if="editHistory || hasError" label="备注" :labelOneLine="true">
        <div class="input-container" :class="{ required: editHistory }">
          <van-field
            border
            v-model.trim="formData['remark']"
            label=""
            placeholder="请输入备注"
            label-align="top"
            type="textarea"
          />
        </div>
      </check-item>
    </div>

    <div class="card">
      <van-row gutter="16" justify="space-around">
        <van-col v-if="!editHistory" span="8">
          <van-button @click="handleTrans" size="small" plain block round type="success"
            >转派</van-button
          >
        </van-col>
        <van-col span="8">
          <van-button @click="handleCancel" size="small" block round type="success"
            >取消</van-button
          >
        </van-col>
        <van-col span="8">
          <!-- <van-button @click="handleConfirm" size="small" block round type="success" color="#FF6A00"
            >确定</van-button
          > -->

          <van-button
            :disabled="!canFormConfirm"
            @click="handleConfirm"
            size="small"
            block
            round
            type="success"
            color="#FF6A00"
            >确定</van-button
          >
        </van-col>
      </van-row>
    </div>
    <div class="empty"></div>

    <van-popup v-model:show="showPup" position="bottom" :style="{ height: '30%' }">
      <div class="pop-content">
        <ul @click="handleBuilding">
          <li
            :class="{
              active: formData['pipelineTermination'].includes(item.community + item.name),
            }"
            v-for="item in buildings"
            :key="item.buildingid"
          >
            {{ item.community + item.name }}
          </li>
        </ul>
      </div>
    </van-popup>
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
  position: relative;

  :deep(.van-field) {
    background-color: transparent;
  }

  &.required::before {
    content: '*';
    position: absolute;
    color: #f00;
    top: -18px;
    left: 35px;
    font-family: math;
  }
}
.empty {
  height: 32px;
}

.pop-content {
  width: 100%;
  // height: 100%;
  padding: 20px 0;

  ul {
    height: 100%;
    overflow-y: scroll;

    > li {
      line-height: 40px;
      width: 100%;
      text-align: center;
      color: #666;
      font-size: 14px;

      &.active {
        background-color: #8cb1ea;
        color: #fff;
      }
      &.disabled {
        color: #ddd;
      }
    }
  }
}
</style>
