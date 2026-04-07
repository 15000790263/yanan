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
        <!-- <div
          class="edit-btn"
          v-if="canEditCondition && typeValue == '5001'"
          @click="
            $router.push({
              path: '/device/edit',
              query: {
                dataId,
                typeValue,
              },
            })
          "
        >
          修改
        </div> -->
        <!-- 紧急代码，后期修改 -->
        <!-- <div v-else-if="typeValue == '5005'" style="height: 44px"></div> -->
        <!-- <div :class="canEditCondition ? 'content can-edit' : 'content'"> -->
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
      <!-- 巡检记录(只有调压箱、调压站、阀井) -->
      <van-tab v-if="['5005', '5001', '5010'].includes(typeValue)" title="巡检记录">
        <div class="edit-btn" v-if="canInspectCondition" @click="addInspect">新增</div>
        <div :class="canInspectCondition ? 'content can-edit' : 'content'">
          <div class="content-list">
            <template v-if="inspectList?.length" v-for="item in inspectList">
              <div
                class="repair-item"
                @click="
                  $router.push(
                    `/inspect/checking/${item.id}?type=${typeMap[typeValue]}&formType=show`
                  )
                "
              >
                <span v-if="item.patrolDate"
                  ><div class="title">巡检时间：</div>

                  <div class="cont">{{ item.patrolDate }}</div>
                </span>
                <span v-if="item.patrolPerson"
                  ><div class="title">巡检人：</div>

                  <div class="cont">{{ item.patrolPerson }}</div>
                </span>
                <span v-if="item.patrolStatus">
                  <div class="title">巡检状态：</div>

                  <div
                    class="cont"
                    v-html="
                      item.patrolStatus == '1'
                        ? '正常'
                        : item.patrolStatus == '2'
                          ? '<span style=color:#f00>异常</span>'
                          : '未巡检'
                    "
                  ></div>
                </span>
              </div>
            </template>
            <van-empty v-else description="暂无数据" />
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
      <!-- 气密性试验（只有调压箱） -->
      <van-tab v-if="typeValue === '5001'" title="气密性试验">
        <div class="edit-btn" v-if="canEditCondition" @click="addPicture">添加照片</div>

        <div :class="canEditCondition ? 'content can-edit' : 'content'">
          <div class="content-list pic-list">
            <template v-if="airPicture.length" v-for="item in airPicture">
              <div class="pic-wrapper">
                <div class="name">
                  {{ item.type === 0 ? '调压箱编号' : '气密试验手持压力表' }}
                </div>
                <img
                  v-long-press="() => deletePic(item.id)"
                  :src="`${config.fileUrl}${item.fileUrl}`"
                  alt=""
                />
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
import {
  getTYZDetailByDataId,
  getYBZDetailByDataId,
  getTYQDetailByDataId,
  getFMJDetailByDataId,
  getJCSBDetailByDataId,
  getTYXInspectInfoByCode,
  getFMJInspectInfoByCode,
  getTYZInspectInfoByCode,
  getFilePic,
  delFilePic,
  getCLDetailByDataId,
  getJCSB2DetailByDataId,
  getJXWZDetailByDataId,
  getBPBJDetailByDataId,
  getDQSBDetailByDataId,
  getTXSBDetailByDataId,
  getQTSBDetailByDataId,
} from '../../../../api/device';
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
    case '5005':
      value = [
        {
          label: '场站介绍',
          children: [
            {
              key: 'remarks',
              label: '',
              value: main.value?.remarks,
            },
          ],
        },
        {
          label: '本体信息',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '站场编码',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '站场名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '站场尺寸(m*m)',
              value: main.value?.widths,
            },
            {
              key: 'aaaaaaaa',
              label: '所在位置',
              value: main.value?.address,
            },
            {
              key: 'aaaaaaaa',
              label: '站场状态',
              value: getValue(main.value?.status, 7),
            },
            {
              key: 'aaaaaaaa',
              label: '供气区域',
              value: main.value?.stationhead,
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '输配量(万m³/h)',
              value: main.value?.distributionquantity,
            },
            {
              key: 'aaaaaaaa',
              label: '建站日期',
              value: main.value?.buliddate,
            },
            {
              key: 'aaaaaaaa',
              label: '竣工日期',
              value: main.value?.completiondate,
            },
            {
              key: 'aaaaaaaa',
              label: '投产日期',
              value: main.value?.inusedate,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '权属单位',
              value: getValue(main.value?.ownership, 16),
            },
            {
              key: 'aaaaaaaa',
              label: '管理负责人',
              value: main.value?.manageuser,
            },
            {
              key: 'aaaaaaaa',
              label: '负责人电话',
              value: main.value?.phone,
            },
            {
              key: 'aaaaaaaa',
              label: '场站值守',
              value: getValue(main.value?.stationwatch, 17),
            },
            {
              key: 'aaaaaaaa',
              label: '管理班组',
              value: main.value?.managementteam,
            },
            {
              key: 'aaaaaaaa',
              label: '所在线路',
              value: main.value?.localline,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有阴保',
              value: getValue(main.value?.protection, 18),
            },
            {
              key: 'aaaaaaaa',
              label: '所属路段',
              value: main.value?.roadsection,
            },
          ],
        },
        {
          label: '工艺参数',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '是否放空',
            //   value: getValue(main.value?.evacuation, 19),
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '是否切断',
            //   value: getValue(main.value?.breaks, 20),
            // },
            {
              key: 'aaaaaaaa',
              label: '设计压力(Mpa)',
              value: main.value?.designpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '征地面积(㎡)',
              value: main.value?.floorspace,
            },
          ],
        },
      ];
      break;

    case '6012':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '车牌号',
              value: main.value?.equipmentcode,
            },
            {
              key: 'aaaaaaaa',
              label: '车辆品牌',
              value: main.value?.specmodel,
            },
            {
              key: 'aaaaaaaa',
              label: '购置日期',
              value: main.value?.acquisitiondatetime,
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
              label: '使用性质',
              value: sysStore.getDictValue('natrue_use', main.value?.natrueuse),
            },
            {
              key: 'aaaaaaaa',
              label: '权属单位',
              value: sysStore.getDictValue('air_breathingunit', main.value?.stationid),
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.useto,
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

    case '5021':
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
              label: '设备编号',
              value: main.value?.equipmentcode,
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
              label: '出厂编号',
              value: main.value?.outfactorynumber,
            },
            {
              key: 'aaaaaaaa',
              label: '设备状态',
              value: sysStore.getDictValue('equipment_state_static', main.value?.status),
            },
            {
              key: 'aaaaaaaa',
              label: '国别',
              value: sysStore.getDictValue('notional_type', main.value?.nation),
            },
            {
              key: 'aaaaaaaa',
              label: '设备分类',
              value: sysStore.getDictValue('test_equipment_type', main.value?.classification),
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
              label: '数量',
              value: main.value?.nums,
            },
            {
              key: 'aaaaaaaa',
              label: '计数单位',
              value: main.value?.unit,
            },
            {
              key: 'aaaaaaaa',
              label: '权属单位',
              value: sysStore.getDictValue('air_breathingunit', main.value?.stationid),
            },
            {
              key: 'aaaaaaaa',
              label: '车辆关联',
              value: main.value?.installplace,
            },
            {
              key: 'aaaaaaaa',
              label: '存储位置',
              value: main.value?.installpoint,
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.useto,
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
    case '5023':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '物资名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '品牌型号',
              value: main.value?.specmodel,
            },
            {
              key: 'aaaaaaaa',
              label: '产品编号',
              value: main.value?.outfactorynumber,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '数量',
              value: main.value?.purchasequantity,
            },
            {
              key: 'aaaaaaaa',
              label: '单位',
              value: main.value?.unit,
            },
            {
              key: 'aaaaaaaa',
              label: '购置日期',
              value: main.value?.purchasedate,
            },
            {
              key: 'aaaaaaaa',
              label: '失效日期',
              value: main.value?.expiringdate,
            },
            {
              key: 'aaaaaaaa',
              label: '检验周期(天)',
              value: main.value?.cycle,
            },
            {
              key: 'aaaaaaaa',
              label: '状态',
              value: sysStore.getDictValue('equipment_state_static', main.value?.status),
            },
            {
              key: 'aaaaaaaa',
              label: '存放地点',
              value: sysStore.getDictValue('equipment_place', main.value?.position),
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
              label: '用途',
              value: main.value?.useto,
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
    case '7011':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '物资名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '规格型号',
              value: main.value?.specification,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '购置日期',
              value: main.value?.purchasedate,
            },
            {
              key: 'aaaaaaaa',
              label: '数量',
              value: main.value?.partsnum,
            },
            {
              key: 'aaaaaaaa',
              label: '单位',
              value: main.value?.unitname,
            },
            {
              key: 'aaaaaaaa',
              label: '存放地点',
              value: main.value?.position,
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
              label: '用途',
              value: main.value?.useto,
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
    case '4699':
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
              label: '设备编号',
              value: main.value?.equipmentcode,
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
              label: '出厂编号',
              value: main.value?.outfactorynumber,
            },
            {
              key: 'aaaaaaaa',
              label: '设备状态',
              value: sysStore.getDictValue('equipment_state_static', main.value?.status),
            },
            {
              key: 'aaaaaaaa',
              label: '国别',
              value: sysStore.getDictValue('notional_type', main.value?.nation),
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
              label: '数量',
              value: main.value?.nums,
            },
            {
              key: 'aaaaaaaa',
              label: '计数单位',
              value: main.value?.unit,
            },

            {
              key: 'aaaaaaaa',
              label: '权属单位',
              value: sysStore.getDictValue('air_breathingunit', main.value?.stationid),
            },

            {
              key: 'aaaaaaaa',
              label: '存放地点',
              value: main.value?.position,
            },
            {
              key: 'aaaaaaaa',
              label: '车辆关联',
              value: main.value?.installplace,
            },
            {
              key: 'aaaaaaaa',
              label: '存储位置',
              value: main.value?.installpoint,
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.useto,
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
    case '5029':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '手机号码',
              value: main.value?.simno,
            },
            {
              key: 'aaaaaaaa',
              label: 'ICCID号码/卡码',
              value: main.value?.equipmentcode,
            },
            {
              key: 'aaaaaaaa',
              label: '执法仪设备SN码后七位',
              value: main.value?.outfactorynumber,
            },
            {
              key: 'aaaaaaaa',
              label: '员工编码/登录账号',
              value: main.value?.registrant,
            },
            {
              key: 'aaaaaaaa',
              label: '采购日期',
              value: main.value?.registrationdatetime,
            },
            {
              key: 'aaaaaaaa',
              label: '设备型号',
              value: main.value?.specmodel,
            },
            {
              key: 'aaaaaaaa',
              label: '设备名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '设备状态',
              value: sysStore.getDictValue('equipment_state_static', main.value?.status),
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '国别',
              value: sysStore.getDictValue('notional_type', main.value?.nation),
            },
            {
              key: 'aaaaaaaa',
              label: '负责人电话',
              value: main.value?.phone,
            },
            {
              key: 'aaaaaaaa',
              label: '质保期',
              value: main.value?.termvalidity,
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.useto,
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
    case '5037':
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
              label: '设备编号',
              value: main.value?.equipmentcode,
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
              label: '出厂编号',
              value: main.value?.outfactorynumber,
            },
            {
              key: 'aaaaaaaa',
              label: '设备状态',
              value: sysStore.getDictValue('equipment_state_static', main.value?.status),
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
              label: '检验周期(年)',
              value: main.value?.cycle,
            },
            {
              key: 'aaaaaaaa',
              label: '数量',
              value: main.value?.nums,
            },
            {
              key: 'aaaaaaaa',
              label: '计数单位',
              value: main.value?.unit,
            },
            {
              key: 'aaaaaaaa',
              label: '权属单位',
              value: sysStore.getDictValue('air_breathingunit', main.value?.stationid),
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.useto,
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

    case '5010':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '阀井类型',
              value: getValue(main.value?.valvewelltype, 40),
            },
            {
              key: 'aaaaaaaa',
              label: '阀井形状',
              value: getValue(main.value?.valvewellshape, 41),
            },
            {
              key: 'aaaaaaaa',
              label: '井体结构',
              value: getValue(main.value?.valvewellstructure, 42),
            },
            {
              key: 'aaaaaaaa',
              label: '井室尺寸',
              value: main.value?.wellchambersize,
            },
            {
              key: 'aaaaaaaa',
              label: '井深度(m)',
              value: main.value?.welldepth,
            },
            {
              key: 'aaaaaaaa',
              label: '井脖深(m)',
              value: main.value?.wellheaddepth,
            },
            {
              key: 'aaaaaaaa',
              label: '井室深(m)',
              value: main.value?.wellchamberdepth,
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖标识',
            //   value: main.value?.manholelidmark,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖承载等级',
            //   value: main.value?.bearinglevel,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖序列号',
            //   value: main.value?.serialnumber,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖类型',
            //   value: getValue(main.value?.welltype, 43),
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖形状',
            //   value: getValue(main.value?.wellshape, 41),
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖尺寸',
            //   value: main.value?.wellsize,
            // },
            // {
            //   key: 'aaaaaaaa',
            //   label: '井盖材质',
            //   value: getValue(main.value?.wellmaterial, 21),
            // },
            {
              key: 'aaaaaaaa',
              label: '有效起始期',
              value: main.value?.effectivestartdate,
            },
            {
              key: 'aaaaaaaa',
              label: '失效日期',
              value: main.value?.effectiveenddate,
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '设计单位',
              value: getValue(main.value?.designunit, 9),
            },
            {
              key: 'aaaaaaaa',
              label: '施工单位',
              value: getValue(main.value?.constructionunit, 5),
            },
            {
              key: 'aaaaaaaa',
              label: '监理单位',
              value: getValue(main.value?.controlunit, 36),
            },
            {
              key: 'aaaaaaaa',
              label: '位置描述',
              value: main.value?.localtion,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '阀井位置',
              value: main.value?.equipment,
            },
            // {
            //   key: 'aaaaaaaa',
            //   label: '阀井编号',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '所属区域',
              value: getValue(main.value?.belongunit, 16),
            },
            {
              key: 'aaaaaaaa',
              label: '所属管线',
              value: main.value?.pipeline,
            },
            {
              key: 'aaaaaaaa',
              label: '区域分组',
              value: main.value?.regionid,
            },
            {
              key: 'aaaaaaaa',
              label: '道路所有者姓名',
              value: main.value?.ownername,
            },
          ],
        },
        {
          label: '工艺参数',
          children: [
            {
              key: 'aaaaaaaa',
              label: '泄漏报警系统',
              value: getValue(main.value?.leakalarm, 38),
            },
            {
              key: 'aaaaaaaa',
              label: '阀门状态',
              value: getValue(main.value?.valvestatus, 39),
            },
            {
              key: 'aaaaaaaa',
              label: '补偿器厂家',
              value: main.value?.compensator,
            },
            {
              key: 'aaaaaaaa',
              label: '补偿器长度',
              value: main.value?.accessoriesstatus,
            },
            {
              key: 'aaaaaaaa',
              label: '是否有阴极保护',
              value: getValue(main.value?.cathodicprotectionstatus, 18),
            },
            {
              key: 'aaaaaaaa',
              label: '符号旋转方向',
              value: main.value?.symboldirection,
            },
            {
              key: 'aaaaaaaa',
              label: 'X坐标',
              value: main.value?.x,
            },
            {
              key: 'aaaaaaaa',
              label: 'Y坐标',
              value: main.value?.y,
            },
            {
              key: 'aaaaaaaa',
              label: '高程',
              value: main.value?.elevation,
            },
          ],
        },
      ];
      break;

    case '6014':
      value = [
        {
          label: '本体信息',
          children: [
            // {
            //   key: 'aaaaaaaa',
            //   label: '设备编号',
            //   value: main.value?.equipmentcode,
            // },
            {
              key: 'aaaaaaaa',
              label: '设备型号',
              value: getValue(main.value?.pumpmode, 45),
            },
            {
              key: 'aaaaaaaa',
              label: '控制器型号',
              value: getValue(main.value?.controllertype, 46),
            },
            {
              key: 'aaaaaaaa',
              label: '防爆等级',
              value: getValue(main.value?.harardousrating, 47),
            },
            {
              key: 'aaaaaaaa',
              label: '设备状态',
              value: getValue(main.value?.status, 7),
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '点位数据',
              value: main.value?.dvsn,
            },
            {
              key: 'aaaaaaaa',
              label: '管线类型',
              value: getValue(main.value?.pipelinetype, 0),
            },
            {
              key: 'aaaaaaaa',
              label: '所属管线',
              value: main.value?.linecode,
            },
            {
              key: 'aaaaaaaa',
              label: '生产厂家',
              value: main.value?.manufacturer,
            },
            {
              key: 'aaaaaaaa',
              label: '生产日期',
              value: main.value?.manufactureddate,
            },
            {
              key: 'aaaaaaaa',
              label: '投运日期',
              value: main.value?.inuseworkdate,
            },
            {
              key: 'aaaaaaaa',
              label: '失效日期',
              value: main.value?.efectivetodate,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '安装位置',
              value: main.value?.address,
            },
            {
              key: 'aaaaaaaa',
              label: '管理区域',
              value: getValue(main.value?.subsystemname, 11),
            },
            {
              key: 'aaaaaaaa',
              label: '管理班组',
              value: getValue(main.value?.workteam, 12),
            },
            {
              key: 'aaaaaaaa',
              label: '维保人员',
              value: main.value?.workers,
            },
            {
              key: 'aaaaaaaa',
              label: 'X坐标',
              value: main.value?.x,
            },
            {
              key: 'aaaaaaaa',
              label: 'Y坐标',
              value: main.value?.y,
            },
            {
              key: 'aaaaaaaa',
              label: '高程(m)',
              value: main.value?.z,
            },
            {
              key: 'aaaaaaaa',
              label: '设计单位',
              value: main.value?.designunit,
            },
            {
              key: 'aaaaaaaa',
              label: '施工单位',
              value: main.value?.assemblycompany,
            },
            {
              key: 'aaaaaaaa',
              label: '监理单位',
              value: main.value?.inspectingcompany,
            },
          ],
        },
        {
          label: '工艺参数',
          children: [
            {
              key: 'aaaaaaaa',
              label: '泵功率(W)',
              value: main.value?.pumpingpower,
            },
            {
              key: 'aaaaaaaa',
              label: '电压',
              value: getValue(main.value?.voltage, 44),
            },
            {
              key: 'aaaaaaaa',
              label: '天然气流量(m³/h)',
              value: main.value?.gasflow,
            },
            {
              key: 'aaaaaaaa',
              label: '药量(mg)',
              value: main.value?.dosage,
            },
            {
              key: 'aaaaaaaa',
              label: '加臭频率(次/天)',
              value: main.value?.frequency,
            },
            {
              key: 'aaaaaaaa',
              label: '监测周期(天)',
              value: main.value?.monitoringcycle,
            },
            {
              key: 'aaaaaaaa',
              label: '工作压力(Mpa)',
              value: main.value?.workpressure,
            },
            {
              key: 'aaaaaaaa',
              label: '储罐容积(L)',
              value: main.value?.tankvolume,
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
    case '6012':
      // 车辆
      res = await getCLDetailByDataId(dataId);
      console.log(res);
      break;

    case '5021':
      // 检测设备
      res = await getJCSB2DetailByDataId(dataId);
      break;

    case '5023':
      // 救援物资
      res = await getJXWZDetailByDataId(dataId);
      break;

    case '7011':
      // 备品备件
      res = await getBPBJDetailByDataId(espId);
      break;

    case '4699':
      // 电气设备
      res = await getDQSBDetailByDataId(dataId);
      break;

    case '5029':
      // 电气设备
      res = await getTXSBDetailByDataId(dataId);
      break;

    case '5037':
      // 其他设备
      res = await getQTSBDetailByDataId(dataId);
      break;

    case '5001':
      // 调压箱
      res = await getTYQDetailByDataId(dataId);
      // 添加调压箱气密性图片
      const r = await getFilePic(equipmentsyscode);
      airPicture.value = [];
      setTimeout(() => {
        airPicture.value = r.data.rows.sort((a, b) => a.type - b.type);
        console.log(airPicture.value);
      });

      insp = await getTYXInspectInfoByCode(equipmentcode);
      break;

    case '5010':
      // 阀门井
      res = await getFMJDetailByDataId(dataId);
      insp = await getFMJInspectInfoByCode(equipmentcode);
      break;

    case '6014':
      // 加臭设备
      res = await getJCSBDetailByDataId(dataId);
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
    6012: 'T',
    5021: 'DJ',
    5023: 'GD',
    7011: 'BPB',
    4966: 'KQYSJ',
    5029: 'WT',
    5037: 'OTHER',
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
