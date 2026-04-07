<template>
  <div class="wrapper">
    <div class="content">
      <ul v-for="(item, index) in addList" :key="index">
        <template v-for="v in item" :key="v.title">
          <li :class="{ 'have-job': index === 1 && jobTypes?.length }">
            <div class="title" :class="{ require: v.require }">{{ v.title }}</div>
            <!-- 可输入+可选择 -->
            <div v-if="v.both" class="placeholder">
              <van-field
                v-model="v.value"
                ref="inputRef"
                input-align="right"
                :data-placeholder="v.value ? '' : v.placeholder"
                @click.stop="v.placeholder = ''"
                @blur="v.placeholder = v.value ? '' : '请填写/选择'"
              />
              <!-- {{ v.value || v.placeholder }} -->
            </div>
            <!-- 只有选择 -->
            <div v-else-if="v.showIcon" class="placeholder">
              {{ v.value || v.placeholder }}
            </div>
            <!-- 文本域输入 -->
            <van-field
              class="textarea-wrapper"
              v-else-if="v.isTextarea"
              v-model="v.value"
              input-align="right"
              type="textarea"
              maxlength="50"
              show-word-limit
              :autosize="{ maxHeight: 36, minHeight: 24 }"
              rows="1"
              :data-placeholder="v.value ? '' : v.placeholder"
              @click="v.placeholder = ''"
              @blur="v.placeholder = v.value ? '' : '请填写'"
            />
            <!-- 只有普通输入 -->
            <van-field
              :class="{ 'have-pop': v.key === 'work-address' }"
              v-else
              v-click-outside="clickOutside"
              v-model="v.value"
              input-align="right"
              :data-placeholder="v.value ? '' : v.placeholder"
              @click="v.placeholder = ''"
              @blur="v.placeholder = v.value ? '' : '请填写'"
              @click-input="handleFocus(v)"
            >
              <template v-if="showPopCard && filterLocationList.length" #extra>
                <div class="pop-card">
                  <template v-for="i in filterLocationList" :key="i">
                    <van-tag size="large" @click="chooseTag(v, i)">
                      {{ i }}
                    </van-tag>
                  </template>
                </div>
              </template>
            </van-field>
            <!-- 选择时的图标 -->
            <div v-if="v.showIcon" class="icon" @click="handle(v)">
              <img src="~@/assets/image/work/icon-arrows.png" alt="" />
            </div>
            <!-- 高危作业列表 -->
            <div class="job-type" v-if="index === 1 && jobTypes?.length">
              <div v-for="(value, i) in jobTypes" :key="value.formId">
                <div class="index">{{ i + 1 }}</div>
                <div class="job-icon"></div>
                <div class="name">{{ value.name }}</div>
              </div>
            </div>
          </li>
        </template>
      </ul>
    </div>
    <div class="footer">
      <div class="confirm" @click="savePlan">确定</div>
      <div class="cancel" @click="onCancel">取消</div>
    </div>
    <!-- 选择部门窗口 -->
    <SelectDept
      v-model:show="showDept"
      v-model:deptName="currentItem.value"
      v-model:deptId="deptId"
    />
    <!-- 选择日期时间 -->
    <van-popup v-model:show="showBottom" position="bottom" :style="{ 'min-height': '30%' }">
      <van-picker-group
        title=""
        :tabs="['选择日期', '选择时间']"
        @confirm="onConfirm"
        @cancel="showBottom = false"
      >
        <van-date-picker v-model="currentDate" />
        <van-time-picker v-model="currentTime" :columns-type="['hour', 'minute']" />
      </van-picker-group>
    </van-popup>
    <!-- 选择计划类型 -->
    <SelectPlanType
      v-model:show="showPlanType"
      v-model:type="currentItem.value"
      v-model:jobs="jobTypes"
    ></SelectPlanType>
    <!-- 选择施工单位 -->
    <SelectSupplier
      v-model:show="showSupplier"
      v-model:supplierName="currentItem.value"
      @update:supplierName="handleUpdate"
    ></SelectSupplier>
    <!-- v-model:supplierId="supplierId" -->

    <!-- 选择甲方 -->
    <SelectPartA
      v-model:show="showPartA"
      v-model:nickName="currentItem.value"
      v-model:number="partANumber"
      v-model:userId="userId"
      :deptId="deptId"
    ></SelectPartA>
    <!-- 选择乙方 -->
    <SelectPartB
      v-model:show="showPartB"
      v-model:nickName="currentItem.value"
      v-model:number="partBNumber"
      :supplierName="addList[2][0].value"
    ></SelectPartB>
    <!-- v-model:secondUserId="secondUserId" -->
    <SelectArea v-model:show="showArea" v-model:currentArea="currentItem.value"></SelectArea>

    <SelectWorkObjectType
      v-model:show="showObject"
      v-model:currentObjectType="currentItem.value"
    ></SelectWorkObjectType>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import SelectDept from './components/add-work-components/select-dept.vue';
import SelectPlanType from './components/add-work-components/select-plan-type.vue';
import SelectSupplier from './components/add-work-components/select-supplier.vue';
import SelectPartA from './components/add-work-components/select-part-a.vue';
import SelectPartB from './components/add-work-components/select-part-b.vue';
import SelectArea from './components/add-work-components/select-area.vue';
import SelectWorkObjectType from './components/add-work-components/select-work-object-type.vue';
import { nextTick } from 'vue';
import dayjs from 'dayjs';
import { showNotify, showConfirmDialog } from 'vant';
import {
  addPlan,
  getUserInfo,
  getWorkById,
  getWorkType,
  getWorkList,
  updatePlan,
} from '@/api/work';
import { useRoute, useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { showLoadingToast, closeToast } from 'vant';
import { getDeptById, getLocation } from '../../../api/work';
import { systemStore } from '@/stores/system.js';

const sysStore = systemStore();

// 是否内部单位
const isInnerDept = ref(false);
const addList = ref([
  [
    {
      title: '作业计划名称',
      value: '',
      placeholder: '请填写',
      showIcon: false,
      require: true,
    },
    {
      title: '部门名称',
      value: '',
      placeholder: '请选择',
      showIcon: true,
      click() {
        showDept.value = true;
      },
      require: true,
    },
    {
      title: '作业片区',
      value: '',
      placeholder: '请选择',
      showIcon: true,
      require: true,
      click() {
        showArea.value = true;
      },
    },
    {
      title: '开始时间',
      value: dayjs().set('hour', 10).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:mm'),
      placeholder: '请选择',
      showIcon: true,
      click() {
        currentDate.value = this.value.split(' ')[0].split('-');
        currentTime.value = this.value.split(' ')[1].split(':');
        showBottom.value = true;
      },
      require: true,
    },
    {
      title: '结束时间',
      value: dayjs().set('hour', 20).set('minute', 0).set('second', 0).format('YYYY-MM-DD HH:mm'),
      placeholder: '请选择',
      showIcon: true,
      click() {
        currentDate.value = this.value.split(' ')[0].split('-');
        currentTime.value = this.value.split(' ')[1].split(':');
        showBottom.value = true;
      },
      require: true,
    },
    {
      title: '作业地点',
      value: '',
      placeholder: '请填写',
      showIcon: false,
      require: true,
      key: 'work-address',
    },
    {
      title: '作业对象类型',
      value: '',
      placeholder: '请选择',
      showIcon: true,
      click() {
        showObject.value = true;
      },
    },
  ],
  [
    {
      title: '计划类型',
      value: '',
      placeholder: '请选择',
      showIcon: true,
      click() {
        showPlanType.value = true;
      },
      require: true,
    },
  ],
  [
    {
      title: '作业/施工单位',
      value: '',
      placeholder: '请填写/选择',
      showIcon: true,
      both: true,
      click() {
        showSupplier.value = true;
      },
    },
    {
      title: '甲方姓名',
      value: '',
      placeholder: '请选择',
      showIcon: true,
      click() {
        showPartA.value = true;
      },
      require: true,
    },
    {
      title: '甲方电话',
      value: '',
      placeholder: '请填写',
      showIcon: false,
      require: true,
    },
    {
      title: '承包方姓名',
      value: '',
      placeholder: '请填写/选择',
      both: true,
      showIcon: true,
      click() {
        showPartB.value = true;
      },
    },
    {
      title: '承包方电话',
      value: '',
      placeholder: '请填写',
      showIcon: false,
    },
    {
      title: '作业内容',
      value: '',
      placeholder: '请填写',
      showIcon: false,
      isTextarea: true,
      require: true,
    },
  ],
]);

const currentItem = ref({});

function handle(value) {
  currentItem.value = value;
  if (planInfo.value) {
    if (currentItem.value.value === planInfo.value.beginTime) {
      currentDate.value = planInfo.value.beginTime.split(' ')[0].split('-');
      currentTime.value = planInfo.value.beginTime.split(' ')[1].split(':');
    } else {
      currentDate.value = planInfo.value.endTime.split(' ')[0].split('-');
      currentTime.value = planInfo.value.endTime.split(' ')[1].split(':');
    }
  }
  nextTick(() => {
    value.click();
  });
}

// 抽屉展示
const showDept = ref(false);
const deptId = ref('');

// 日期时间
const showBottom = ref(false);
const currentDate = ref(dayjs().format('YYYY.MM.DD').split('.'));
const currentTime = ref(dayjs().startOf('day').add(8, 'hour').format('HH.mm').split('.'));
// const currentDate = ref();
// const currentTime = ref();

// 时间选择
function onConfirm() {
  // const beginT = addList.value[0][2].value;
  // const endT = addList.value[0][3].value;
  const t = `${currentDate.value.join('-')} ${currentTime.value.join(':')}`;

  currentItem.value.value = t;
  showBottom.value = false;
}

// 选择计划类型
const showPlanType = ref(false);
const jobTypes = ref([]);

// 选择施工单位
const showSupplier = ref(false);
// const supplierId = ref('');

// 选择甲方
const showPartA = ref(false);
const partANumber = ref('');
const userId = ref('');
watch(deptId, () => {
  addList.value[2][1].value = '';
  addList.value[2][2].value = '';
  partANumber.value = '';
  userId.value = '';

  const deptArr = deptId.value.split(',');
  isInnerDept.value = deptArr[1] === '101';
  // if (isInnerDept.value) {
  //   addList.value[2][0].value = `南天城建${addList.value[0][1].value}`;
  // } else {
  //   addList.value[2][0].value = '';
  // }
});
watch(partANumber, val => {
  addList.value[2][2].value = val;
});

// 选择承包方
const showPartB = ref(false);
const partBNumber = ref('');
// const secondUserId = ref('');

// watch(supplierId, () => {
//   // addList.value[2][3].value = '';
//   // addList.value[2][4].value = '';
//   // partBNumber.value = '';
//   // secondUserId.value = '';
// });
watch(partBNumber, val => {
  addList.value[2][4].value = val;
});

// 选择作业片区
const showArea = ref(false);

// 非空校验
function validate() {
  const arr = addList.value.flat();
  const index = arr.findIndex(item => {
    if (item.require) {
      return !item.value;
    }
  });
  return index === -1;
}

const router = useRouter();
const route = useRoute();

// 保存
async function savePlan() {
  const val = validate();
  if (!val) {
    return showNotify({ type: 'warning', message: '必填项不能为空！' });
  }
  const beginT = addList.value[0][3].value;
  const endT = addList.value[0][4].value;
  if (dayjs(endT).isBefore(dayjs(beginT)) || dayjs(endT).isSame(dayjs(beginT))) {
    return showNotify({ type: 'warning', message: '开始时间必须早于结束时间！' });
  }
  showLoadingToast({
    duration: 0,
    forbidClick: true,
  });
  const arr = addList.value.flat();
  const planTypes = { 高危作业计划: '1', 一般作业计划: '2' };

  const res = await getUserInfo();
  const sysuserId = res.data.data.userId;

  const data = {
    sysuserId,
    deptId: deptId.value,
    projectName: arr[0].value,
    deptName: arr[1].value,
    workArea: arr[2].value,
    beginTime: arr[3].value,
    endTime: arr[4].value,
    projectLocation: arr[5].value,
    planType: planTypes[arr[7].value],
    type: jobTypes.value.map(i => i.formId).toString(),
    // company: supplierId.value,
    company: arr[8].value,
    userId: userId.value,
    // secondUserId: secondUserId.value,
    firstName: arr[9].value,
    firstPhone: arr[10].value,
    secondName: arr[11].value,
    secondPhone: arr[12].value,
    status: '0',
    enable: '1',
    dutyTime: [arr[2].value, arr[3].value],
    content: arr[13].value,
    objectType:
      sysStore.dictMap.object_type.find(item => item.dictLabel === arr[6].value)?.dictValue || '', // 作业对象类型
  };
  if (!planInfo.value) {
    // 新增
    await addPlan(data);
    const workList = await getWorkList();
    router[Symbol(0)] = workList.data.rows.shift();
  } else {
    // 更新
    const d = {
      ...data,
      id: route.query.id,
      // 更新操作先这样写
      reviewComments: '',
      reviewDate: '',
      reviewStatus: '0',
    };
    await updatePlan(d);
    router[Symbol(0)] = d;
  }

  setTimeout(() => {
    router.goBack();
  }, 800);
  closeToast();
  localStorage.removeItem('workPlanCache');
}

const planInfo = ref(null);

const locationList = ref([]);

onMounted(async () => {
  getLocation().then(res => {
    locationList.value = res.data.data;
  });
  const { data } = await getUserInfo();
  const { ancestors, deptId: dd } = data.data.dept;
  const deptArr = ancestors.split(',');
  deptArr.shift();
  if (deptArr.length === 3) {
    deptId.value = deptArr.join(',');
  } else {
    deptId.value = [...deptArr, dd].join(',');
  }

  const result = await getDeptById(deptId.value.split(',')[deptId.value.split(',').length - 1]);

  await nextTick();
  // addList.value[0][1].value = result.data.data.deptName;
  addList.value[0][1].value = '运行部';

  // if (isInnerDept.value) {
  //   addList.value[2][0].value = `南天城建${addList.value[0][1].value}`;
  // } else {
  //   addList.value[2][0].value = '';
  // }

  const planId = route.query.id;
  if (!planId) {
    const cache = localStorage.getItem('workPlanCache');
    if (cache) {
      const info = JSON.parse(cache);
      if (info.validTime > Date.now()) {
        recoverData(info);
      } else {
        localStorage.removeItem('workPlanCache');
      }
    }
    return;
  }

  const res = await getWorkById(planId);
  const info = res.data.data;
  planInfo.value = info;
  recoverData(info);
});

// 恢复数据
async function recoverData(info) {
  deptId.value = info.deptId;
  // supplierId.value = info.company;

  if (info.planType === '1') {
    // 获取高危作业数据
    getWorkType().then(res => {
      const { records } = res.data.data;

      jobTypes.value = records.filter(item => info.type.split(',').includes(String(item.formId)));
    });
  }

  // getSupplierWorkList().then((res) => {
  //   arr[2][0].value = res.data.rows.find((item) => item.id == info.company)?.enterpriseName;
  // });

  await nextTick();

  addList.value[0][0].value = info.projectName;
  addList.value[0][1].value = info.deptName;
  addList.value[0][2].value = info.workArea;
  addList.value[0][3].value = info.beginTime;
  addList.value[0][4].value = info.endTime;
  addList.value[0][5].value = info.projectLocation;
  addList.value[0][6].value =
    sysStore.dictMap.object_type.find(item => item.dictValue === info.objectType)?.dictLabel || '';

  addList.value[1][0].value =
    info.planType === '1' ? '高危作业计划' : info.planType === '2' ? '一般作业计划' : '';
  // addList.value[1][0].jobTypes = info.type.split(','); //

  addList.value[2][0].value = info.company; //
  addList.value[2][1].value = info.firstName;
  addList.value[2][2].value = info.firstPhone;
  addList.value[2][3].value = info.secondName;
  addList.value[2][4].value = info.secondPhone;
  addList.value[2][5].value = info.content;

  userId.value = info.userId;
  // secondUserId.value = info.secondUserId;
}

// 阻止返回按键操作
const shouldBack = ref(true);

function exec() {
  shouldBack.value = false;
  showBottom.value = false;
  return false;
}

onBeforeRouteLeave(to => {
  if (!shouldBack.value) {
    shouldBack.value = true;
    return false;
  }

  // 数据缓存
  if (to.path !== '/work/work-plan-detail') {
    const arr = addList.value.flat();
    const planTypes = { 高危作业计划: '1', 一般作业计划: '2' };

    getUserInfo().then(res => {
      const sysuserId = res.data.data.userId;

      const data = {
        sysuserId,
        deptId: deptId.value,
        projectName: arr[0].value,
        deptName: arr[1].value,
        workArea: arr[2].value,
        beginTime: arr[3].value,
        endTime: arr[4].value,
        projectLocation: arr[5].value,
        planType: planTypes[arr[6].value],
        type: jobTypes.value.map(i => i.formId).toString(),
        // company: supplierId.value,
        company: arr[7].value,
        userId: userId.value,
        // secondUserId: secondUserId.value,
        firstName: arr[8].value,
        firstPhone: arr[9].value,
        secondName: arr[10].value,
        secondPhone: arr[11].value,
        status: '0',
        enable: '1',
        dutyTime: [arr[2].value, arr[3].value],
        content: arr[12].value,
        // validTime: Date.now() + 10 * 60 * 1000, // 10分钟有效期
        validTime: 0,
      };
      const cache = JSON.stringify(data);
      localStorage.setItem('workPlanCache', cache);
    });
  }
});

watch(showBottom, value => {
  if (value) {
    document.addEventListener('backbutton', exec, false);
  } else {
    document.removeEventListener('backbutton', exec);
  }
});

//  .isBefore(dayjs('')));

const inputRef = ref(null);
function handleUpdate(e) {
  if (!e) {
    inputRef.value[0].focus();
    inputRef.value[0].blur();
  }

  addList.value[2][3].value = '';
  addList.value[2][4].value = '';
}

const showPopCard = ref(false);

function handleFocus(value) {
  if (value.key === 'work-address') {
    showPopCard.value = true;
  }
}

function chooseTag(v, value) {
  v.value = value;
}

function clickOutside(el) {
  if (el.classList.contains('have-pop')) {
    showPopCard.value = false;
  }
}

const filterLocationList = computed(() => {
  return locationList.value.filter(item => item.includes(addList.value[0][5].value));
});

function onCancel() {
  showConfirmDialog({
    title: '提示',
    message: '数据未保存，确认取消吗？',
  })
    .then(() => {
      router.goBack();
    })
    .catch(() => {
      // on cancel
    });
}

// 选择作业对象类型
const showObject = ref(false);
</script>

<style lang="less" scoped>
* {
  box-sizing: border-box;
}
.wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    overflow-y: scroll;
    margin-top: 16px;
    margin-bottom: 12px;
    display: grid;
    grid-template-rows: repeat(3, auto);
    row-gap: 12px;

    > ul {
      padding: 10px 24px;
      background-color: #fff;
      display: grid;
      // grid-template-rows: repeat(auto, auto-fill);
      row-gap: 4px;

      > li {
        border-bottom: 1px solid #e7eeee;
        height: 48px;
        display: grid;
        align-items: center;
        grid-template-columns: 4fr 7fr 2fr;

        .title {
          font-family: Source Han Sans;
          font-size: 14px;
          color: #34394f;

          &.require::after {
            content: '*';
            color: #f56c6c;
            font-family: cursive;
            margin-left: 4px;
          }
        }

        .placeholder {
          color: #84abbb;
          text-align: right;
          font-size: 14px;
        }

        .icon {
          display: grid;
          place-items: center;
          height: 100%;

          > img {
            height: 40%;
            vertical-align: middle;
            opacity: 0.6;
          }
        }

        :deep(.van-cell.van-field) {
          padding-right: 0;
          &::after {
            content: attr(data-placeholder);
            display: inline-block;
            color: #000;
            position: absolute;
            right: 0;
            top: 50%;

            font-size: 14px;
            text-align: right;
            color: #84abbb;
            transform: translateY(-50%);
            border: none !important;
          }
        }

        &.have-job {
          height: fit-content !important;
          padding-top: 14px;
          // > .title {
          //   height: 48px;
          //   line-height: 48px;
          // }

          grid-template-areas:
            'a b c'
            'd d d';

          .title {
            grid-area: a;
          }

          .placeholder {
            grid-area: b;
          }

          .icon {
            grid-area: c;
          }

          .job-type {
            grid-area: d;
            padding: 28px 20px 0;
            display: grid;
            row-gap: 12px;

            > div {
              height: 48px;
              padding: 12px;
              display: grid;
              grid-template-columns: 40px 40px auto;
              justify-items: start;
              align-items: center;
              background: url('/src/assets/image/work/icon-component-img.png') no-repeat
                center/contain;

              .index {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                background: #b5d8e1;
                font-family: Source Han Sans;
                font-size: 14px;
                color: #17617e;
                display: grid;
                place-items: center;
              }

              .job-icon {
                width: 24px;
                height: 24px;
                background: url('/src/assets/image/work/icon-1.png') no-repeat center/contain;
              }

              .name {
                font-family: Source Han Sans;
                font-size: 14px;
                color: #17617e;
              }
            }
          }

          border: none;
          position: relative;
          &::before {
            content: '';
            display: inline-block;
            border-bottom: 1px solid #e7eeee;
            width: 100%;
            position: absolute;
            top: 46px;
            left: 0;
          }
        }

        :deep(.van-field__control) {
          color: #84abbb !important;
        }
      }
    }
  }
  .footer {
    width: 100%;
    height: 58px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 0 75px;

    .confirm {
      width: 100px;
      height: 34px;
      border-radius: 30px;
      background: #ff6a00;
      display: grid;
      place-items: center;

      font-family: 思源黑体;
      font-size: 16px;
      color: #fff;
    }

    .cancel {
      width: 100px;
      height: 34px;
      border-radius: 30px;
      border: 1px solid #8db5c5;
      display: grid;
      place-items: center;

      font-family: 思源黑体;
      font-size: 16px;
      color: #8db5c5;
    }
  }

  .textarea-wrapper {
    padding: 0 !important;
    padding-left: 36px !important;

    :deep(.van-field__word-limit) {
      position: absolute;
      top: 50%;
      left: -32px;
      transform: translateY(-50%);
      margin: 0;
    }
  }

  .pop-card {
    display: none;
  }

  .have-pop {
    overflow: visible;

    .pop-card {
      max-height: 128px;
      overflow-y: scroll;
      display: block;
      position: absolute;
      top: 48px;
      left: 18px;
      width: 200px;
      box-shadow: 4px 4px 6px rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      background-color: #fff;
      z-index: 99;
      display: flex;
      flex-flow: wrap;
      padding: 0 0 6px 6px;
      border: 1px solid #ccc;

      .van-tag {
        margin-top: 6px;
        margin-right: 6px;
      }
    }
  }
}
</style>
