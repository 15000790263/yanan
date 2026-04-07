<template>
  <div class="wrapper">
    <div class="title">{{ main?.equipmentcode || main?.equipment }}</div>
    <van-tabs
      v-model:active="active"
      title-active-color="#00B099"
      title-inactive-color="#84ABBB"
      :line-height="0"
    >
      <!-- 基本信息 -->
      <van-tab title="基本信息">
        <div class="content">
          <div class="content-list">
            <template v-for="(item, index) in dataList" :key="index">
              <ul>
                <div class="menu-title">{{ item.label }}</div>
                <template v-for="value in item.children" :key="value.label">
                  <li v-if="value.value" :class="value.key">
                    <div>{{ value.label }}：</div>
                    <div>{{ value.value }}</div>
                  </li>
                </template>
              </ul>
            </template>
          </div>
        </div>
      </van-tab>
      <!-- 维修记录 -->
      <van-tab title="维修记录">
        <div class="edit-btn" v-if="canEditCondition" @click="addRepair">新增</div>
        <div :class="canEditCondition ? 'content can-edit' : 'content'">
          <div class="content-list">
            <template
              v-if="main?.equipmentMaintains"
              v-for="item in Object.keys(main?.equipmentMaintains)"
            >
              <div class="repair-item" @click="viewRepairInfo(main?.equipmentMaintains[item])">
                <span v-if="item">
                  <div class="title">维修单号：</div>
                  <div class="cont">{{ item }}</div>
                </span>
                <!-- <span v-if="item.equipmentnum"
                  ><div class="title">设备编号：</div>

                  <div class="cont">{{ item.equipmentnum }}</div>
                </span> -->
                <span v-if="item">
                  <div class="title">设备名称：</div>
                  <div class="cont">
                    {{
                      main?.equipmentMaintains[item]
                        .map(v => v.equipmentname)
                        .toString()
                        .replaceAll(',', '、')
                    }}
                  </div>
                </span>
                <!-- <span v-if="item.content">
                  <div class="title">维修内容：</div>
                  <div class="cont">{{ item.content }}</div>
                </span> -->
                <span v-if="item">
                  <div class="title">维修人：</div>
                  <div class="cont">{{ main?.equipmentMaintains[item][0].operator }}</div>
                </span>
                <span v-if="item">
                  <div class="title">维修日期：</div>
                  <div class="cont">
                    {{ main?.equipmentMaintains[item][0].operationtime.split(' ')[0] }}
                  </div>
                </span>
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>
      <!-- 保养记录 -->
      <van-tab title="保养记录">
        <div class="edit-btn" v-if="canEditCondition" @click="addHealth">新增</div>
        <!-- 只有调压箱和调压站有临时和定期保养，阀井有确定表单保养，其他都是一般保养 -->
        <div :class="canEditCondition ? 'content can-edit' : 'content'">
          <div class="content-list">
            <template
              v-if="main?.equipmentUpKeeps?.filter(i => i.upkeeptype === '0').length"
              v-for="item in main?.equipmentUpKeeps.filter(i => i.upkeeptype === '0')"
            >
              <div class="repair-item" @click="viewInfo(item)">
                <span v-if="item.oddnumbers">
                  <div class="title">保养单号：</div>
                  <div class="cont">{{ item.oddnumbers }}</div>
                </span>
                <span v-if="item.equipmentnum">
                  <div class="title">设备编号：</div>
                  <div class="cont">{{ item.equipmentnum }}</div>
                </span>
                <span v-if="item.content">
                  <div class="title">保养项：</div>
                  <div class="cont cont-desc">
                    <template v-for="(item, i) in JSON.parse(item.content)" :key="i"
                      >{{ item.equipmentname }}、</template
                    >
                  </div>
                </span>
                <span v-if="item.upkeeplefttime">
                  <div class="title">剩余时间：</div>
                  <div class="cont">{{ item.upkeeplefttime }}</div>
                </span>
                <span v-if="item.operator">
                  <div class="title">保养人：</div>
                  <div class="cont">{{ item.operator }}</div>
                </span>
                <span v-if="item.nextupkeeptime">
                  <div class="title">保养日期：</div>
                  <div class="cont">{{ item.nextupkeeptime }}</div>
                </span>
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import { delFilePic, getFeDetailByDataId } from '../../../../api/device';
import { api_regulator, api_well } from '../../../../api/inspect.js';
import { getValue } from '../../hooks/useDict';
import { canEditDevice } from '@/utils/user-permission';
import dayjs from 'dayjs';
import { showToast, showConfirmDialog } from 'vant';
import useUserStore from '../../../../stores/user';
// import { useMyRouter } from '@/hooks/use-my-router';
import config from '@/config';
import { systemStore } from '@/stores/system.js';
import { useAliveTab } from '@/hooks/use-alive.js';

const sysStore = systemStore();

const route = useRoute();
const router = useRouter();

const active = ref(0);
useAliveTab(active);

const typeMap = {
  5005: 'station',
  5001: 'regulator',
  5010: 'well',
};

const dataId = route.query.dataId;
const espId = route.query.espId;
const typeValue = route.query.typeValue;
const equipmentcode = route.query.equipmentcode;
const equipment = route.query.equipment;
const equipmentsyscode = route.query.equipmentsyscode;

// const canEditCondition = typeValue == 5001 && canEditDevice();
const canEditCondition = canEditDevice();

// 基础数据
const main = ref(null);

// 巡检历史记录
const inspectList = ref(null);

const dataList = computed(() => {
  let value;
  switch (typeValue) {
    case '5034':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '设备名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '规格型号',
              value: main.value?.specmodel,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '负责人',
              value: main.value?.manageuser,
            },
            {
              key: 'aaaaaaaa',
              label: '电话',
              value: main.value?.phone,
            },
            {
              key: 'aaaaaaaa',
              label: '状态',
              value: sysStore.getDictValue('equipment_state_static', main.value?.status),
            },
            {
              key: 'aaaaaaaa',
              label: '数量',
              value: main.value?.number,
            },
            {
              key: 'aaaaaaaa',
              label: '计数单位',
              value: main.value?.unit,
            },
            {
              key: 'aaaaaaaa',
              label: '购置日期',
              value: main.value?.acquisitiondatetime,
            },
            {
              key: 'aaaaaaaa',
              label: '出厂编号',
              value: main.value?.outfactorynumber,
            },
            {
              key: 'aaaaaaaa',
              label: '安装地点',
              value: main.value?.installplace,
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.useTo,
            },
            {
              key: 'aaaaaaaa',
              label: '备注',
              value: main.value?.remarks,
            },
          ],
        },
      ];
      break;

    default:
      break;
  }

  return value;
});

// 存放调压箱气密性照片
const airPicture = ref([]);

async function getDetail() {
  let res;
  let insp;

  switch (typeValue) {
    case '5034':
      // 备品备件
      res = await getFeDetailByDataId(dataId);
      break;
    default:
      break;
  }
  main.value = res.data.data;
  if (main.value?.equipmentMaintains?.length) {
    const old = main.value.equipmentMaintains;
    let newO = {};
    old.forEach(item => {
      if (newO[item.oddnumbers]) {
        newO[item.oddnumbers].push(item);
      } else {
        newO[item.oddnumbers] = [];
        newO[item.oddnumbers].push(item);
      }
    });

    main.value.equipmentMaintains = newO;
  } else {
    main.value.equipmentMaintains = void 0;
  }

  inspectList.value = insp?.data.rows.filter(item => item.patrolStatus != '0') || [];
}

getDetail(typeValue);

// 可以新增巡检：1 有对应巡检管理权限；2 有巡检任务
const canInspectCondition = ref(true);

const userStore = useUserStore();

let inspectPlanList = [];
async function processInspect() {
  console.log(typeValue);
  // 判断有没有巡检权限
  if (!userStore.menu.includes('safe')) {
    canInspectCondition.value = false;
    return;
  }

  // 判断有没有巡检任务(调压箱)（只是当月）
  if (typeValue === '5001') {
    const res = await api_regulator.getList({
      patrolStatus: 0,
      planStatus: 1,
      patrolDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      regulatorNumber: equipmentcode,
    });

    inspectPlanList = res.data.rows;
    if (!inspectPlanList.length) {
      canInspectCondition.value = false;
      return;
    }
  }

  // 判断有没有巡检任务(阀井)（只是当月）
  if (typeValue === '5010') {
    const res2 = await api_well.getList({
      patrolStatus: 0,
      planStatus: 1,
      patrolDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      valveNumber: equipmentcode,
    });

    inspectPlanList = res2.data.rows;
    if (!inspectPlanList.length) {
      canInspectCondition.value = false;
      return;
    }
  }
}

processInspect();

async function addInspect() {
  if (typeValue === '5005') {
    // 调压站巡检跳转
    localStorage.setItem('detailType', 'station');
    router.push(`/inspect/inspect-home?equipmentcode=${equipmentcode}`);
    setTimeout(() => {
      localStorage.removeItem('detailType');
    }, 100);
  } else if (inspectPlanList.length) {
    // 调压箱和阀井巡检跳转
    router.push(
      `/inspect/checking/${inspectPlanList[0].id}?type=${typeMap[typeValue]}&formType=edit`
    );
  }
}

// 维修
function addRepair() {
  // 传三个参数{equipmentcode, equipmenttype, equipmenttypeid}
  const eqcodeMap = {
    5034: 'FE',
  };
  router.push(
    `/device/repair?equipmentcode=${equipmentcode}&equipmenttype=${eqcodeMap[typeValue]}&equipmenttypeid=${typeValue}&equipment=${equipment}&equipmentsyscode=${equipmentsyscode}`
  );
}

// 保养
const healthRecord = ref();
const dingQiGrade = ref();

watch(healthRecord, value => {
  // console.log(value);
  dingQiGrade.value = 'one';
});
watch(dingQiGrade, value => {
  // console.log(value);
});

function healthTabChange(name) {
  console.log(name);
}

function addHealth() {
  router.push(
    `/device/health?equipmentcode=${equipmentcode}&healthRecord=temp&dingQiGrade=${dingQiGrade.value}&typeValue=${typeValue}&normal=1&equipmentsyscode=${equipmentsyscode}`
  );
}

// 保留状态
// useMyRouter('whole-set-detail-active', active);

function viewInfo(data) {
  router.push(`/device/info?sourceData=${JSON.stringify(data)}`);
}

function viewRepairInfo(data) {
  router.push(`/device/repair-info?sourceData=${JSON.stringify(data)}`);
}

// 调压箱添加气密性试验照片
function addPicture() {
  router.push(`/device/add-pic?equipmentsyscode=${equipmentsyscode}`);
}

function deletePic(id) {
  showConfirmDialog({
    title: '提示',
    message: '确定删除该张照片吗？',
  })
    .then(async () => {
      await delFilePic(id);
      showToast('操作成功');
      getDetail(typeValue);
    })
    .catch(() => {
      // on cancel
    });
}
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: rgba(245, 245, 245, 1);

  .title {
    height: 40px;
    font-size: 14px;
    color: #34394f;
    font-weight: 600;
  }

  .edit-btn {
    width: fit-content;
    height: 32px;
    border-radius: 30px;
    padding: 6px 20px;
    background: linear-gradient(180deg, #2ec192 0%, #25a0e2 100%);
    margin-bottom: 12px;
    margin-left: auto;

    font-size: 14px;
    color: #ffffff;
  }

  .content {
    width: 100%;
    height: 100%;
    border-radius: 16px;
    background-color: #fff;
    padding: 16px;

    &.can-edit {
      height: calc(100% - 44px);
    }

    .content-list {
      width: 100%;
      height: 100%;
      overflow-y: scroll;

      ul {
        .menu-title {
          position: relative;
          font-weight: 600;
          padding: 10px 0 10px 10px;

          &::before {
            content: ' ';
            display: inline-block;
            position: absolute;
            width: 5px;
            height: 15px;
            background-color: #1677ff;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
          }
        }

        > li {
          display: flex;
          align-items: center;
          height: 50px;
          font-size: 14px;
          color: #34394f;

          > div {
            flex: 1;
          }

          &.remarks {
            display: block !important;
            height: unset;
            line-height: 24px;

            > div:first-child {
              display: none;
            }
          }
        }
      }

      // 维修、保养记录
      .repair-item {
        padding: 12px;
        background: #c0e9e7;
        border-radius: 4px;
        box-shadow: inset 0px 4px 8vw 0px rgba(255, 255, 255, 0.3);
        font-family: 思源黑体;
        font-size: 12px;
        line-height: 16px;
        color: #17617e;
        // display: grid;
        // grid-template-columns: repeat(2, auto);
        // column-gap: 12px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  > .van-tabs {
    height: calc(100% - 40px);

    > :deep(.van-tabs__content) {
      height: calc(100% - 44px);
      padding-top: 16px;

      > .van-tab__panel {
        height: 100%;
      }
    }

    :deep(.van-tabs__nav--line) {
      box-sizing: content-box !important;

      .van-tab {
        flex: auto;
      }
    }
  }
}

.health {
  height: 100%;

  &.can-edit {
    height: calc(100% - 44px);
  }

  :deep(.van-tabs__wrap) {
    margin-bottom: 16px;
  }

  :deep(.van-tabs__content) {
    height: calc(100% - 60px);

    .van-tab__panel {
      height: 100%;

      .van-tabs {
        height: 100%;
      }
    }

    :deep(.van-tabs__content) {
      height: calc(100% - 60px);
    }
  }
}

.content-list > div > span {
  display: flex;
  margin-bottom: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  .title {
    height: unset;
    font-size: unset;
    color: unset;
    font-weight: unset;
    width: 100px;
  }

  .cont {
    flex: 1;
  }

  .cont-desc {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    -o-text-overflow: ellipsis;
  }
}

.pic-list {
  display: grid;
  row-gap: 12px;

  .pic-wrapper {
    // background-color: #c0e9e7;
    color: #34394f;

    .name {
      font-weight: 600;
      font-size: 14px;
    }

    img {
      display: inline-block;
      width: 100%;
      object-fit: contain;
    }
  }
}
</style>
