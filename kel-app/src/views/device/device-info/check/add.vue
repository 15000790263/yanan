<template>
  <div class="wrapper">
    <div class="content">
      <div class="content-list">
        <template v-for="(item, index) in dataList" :key="index">
          <ul>
            <div class="menu-title">{{ item.label }}</div>
            <template v-for="child in item.children" :key="child.label">
              <li>
                <div :class="{ required: child.required }">{{ child.label }}：</div>
                <div>
                  <Select
                    v-if="child.columns"
                    v-model="main5001[child.key]"
                    :columnList="child.columns"
                  />
                  <van-stepper
                    v-else-if="child.step"
                    v-model="main5001[child.key]"
                    :step="child.step"
                    input-width="50px"
                    min="0"
                  />

                  <template v-else-if="child.isDate">
                    <ChoiceDay v-model="main5001[child.key]" v-model:show="showChoiceDay" />
                    <van-field
                      v-if="!showChoiceDay"
                      v-model="main5001[child.key]"
                      is-link
                      placeholder="请选择"
                      readonly
                      @click="showChoiceDay = true"
                    />
                  </template>

                  <Tree
                    v-else-if="child.treeItems"
                    v-model="main5001[child.key]"
                    :items="child.treeItems"
                    :fieldValue="fieldValue"
                    @itemClick="handleItemClick"
                  ></Tree>

                  <van-field
                    v-else
                    v-model.trim="main5001[child.key]"
                    label=""
                    placeholder="请输入"
                    :error-message="child.required ? errorMessage : ''"
                  />
                </div>
              </li>
            </template>
          </ul>
        </template>
      </div>
    </div>
    <div class="footer">
      <div class="confirm" @click="onConfirm">确定</div>
      <div class="cancel" @click="onCancel">取消</div>
    </div>
  </div>
</template>

<script setup>
import { getValue, dictList } from '../../hooks/useDict';
import Select from './components/select';
import ChoiceDay from './components/choice-day';
import { getLocation } from '../../../../utils/cordova-tools';
import { baseBuildingNetOrganizationListAll } from '@/api/device';
import Tree from './components/tree';
import { addRegulator } from '../../../../api/device';
import { showToast, showConfirmDialog } from 'vant';
import { createLoading } from '../../../../utils/loading-fn';

const showChoiceDay = ref(false);

const route = useRoute();
const typeValue = route.query.typeValue;

const main = ref({});

const main5001 = reactive({
  equipmentcode: '',
  compressorboxlmodel: '',
  configurationtype: '',
  flowdesign: 0,
  desiginletfressure: '',
  desienlutletpressure: '',
  maxinletpressure: '',
  maxoutletpressure: '',
  inletdiameter: '',
  outletdiameter: '',
  manufactureddate: '',
  status: '1',
  regionid: '',
  x: '',
  y: '',
});

const netList = ref([]);
async function getNetList() {
  await baseBuildingNetOrganizationListAll().then(res => {
    console.log(res.data.data);
    netList.value = buildTree(res.data.data);
    console.log(netList.value);
  });
}
getNetList();
/** 构建树结构 */
function buildTree(source) {
  const childrenKeys = {};
  for (const s of source) {
    s.text = s.netlevel ? s.netname + ' ' + s.netlevel : s.netname;
    s.id = s.sid;
    s.parentId = s.pid;
    if (childrenKeys[s.parentId]) {
      childrenKeys[s.parentId].push(s);
    } else {
      childrenKeys[s.parentId] = [s];
    }
  }
  const data = childrenKeys[0];
  setTreeData(data, childrenKeys);
  return data;
}

function setTreeData(data, childrenKeys, pName = '') {
  data.forEach(item => {
    item.children = childrenKeys[item.id];
    if (pName) {
      item.pName = pName;
    }
    if (item.children && item.children.length > 0) {
      setTreeData(item.children, childrenKeys, item.netname);
    }
  });
}

// 获取经纬度
async function getXY() {
  const res = await getLocation();
  if (res) {
    const { longitude, latitude } = res;
    main5001.x = longitude;
    main5001.y = latitude;
  }
}

getXY();

const fieldValue = ref('');

function handleItemClick(item) {
  fieldValue.value = `${netList.value[0].netname}/${item.pName}/${item.netname} ${item.netlevel}`;
  main5001.regionid = `1,${item.parentId},${item.id}`;
}

const errorMessage = ref('');
watch(
  () => main5001.equipmentcode,
  value => {
    errorMessage.value = value ? '' : '必填项不能为空';
  }
);

const router = useRouter();

async function onConfirm() {
  // 校验
  if (!main5001.equipmentcode) {
    errorMessage.value = '必填项不能为空';
    return;
  }

  const data = { ...main5001, equipmenttypeid: typeValue };
  const destroy = createLoading();
  await addRegulator(data);
  showToast('操作成功！');
  destroy();
  setTimeout(() => {
    router.goBack();
  }, 800);
}
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

const dataList = computed(() => {
  let value;
  switch (typeValue) {
    case '5005':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '站场编码',
              value: main.value?.equipmentcode,
            },
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

    case '6011':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '阴保站名称',
              value: main.value?.equipment,
            },
            {
              key: 'aaaaaaaa',
              label: '阴保站编号',
              value: main.value?.equipmentcode,
            },
            {
              key: 'aaaaaaaa',
              label: '材质',
              value: getValue(main.value?.material, 21),
            },
            {
              key: 'aaaaaaaa',
              label: '型号',
              value: main.value?.model,
            },
            {
              key: 'aaaaaaaa',
              label: '尺寸(m*m)',
              value: main.value?.size,
            },
            {
              key: 'aaaaaaaa',
              label: '重量',
              value: main.value?.height,
            },
            {
              key: 'aaaaaaaa',
              label: '运行状态',
              value: getValue(main.value?.status, 7),
            },
            {
              key: 'aaaaaaaa',
              label: '核心参数',
              value: main.value?.coreParam,
            },
            {
              key: 'aaaaaaaa',
              label: '用途',
              value: main.value?.purpose,
            },
          ],
        },
        {
          label: '附属信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '安装位置',
              value: main.value?.installationPosition,
            },
            {
              key: 'aaaaaaaa',
              label: '生产单位',
              value: main.value?.productionUnit,
            },
            {
              key: 'aaaaaaaa',
              label: '生产日期',
              value: main.value?.productionDate,
            },
            {
              key: 'aaaaaaaa',
              label: '出厂产品编号',
              value: main.value?.productionNum,
            },
            {
              key: 'aaaaaaaa',
              label: '厂家联系电话',
              value: main.value?.productionPhone,
            },
            {
              key: 'aaaaaaaa',
              label: '启用日期',
              value: main.value?.startDate,
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '用电方式',
              value: getValue(main.value?.electricityMethod, 22),
            },
            {
              key: 'aaaaaaaa',
              label: '电价(元)',
              value: main.value?.electricityPrice,
            },
            {
              key: 'aaaaaaaa',
              label: '供电单位',
              value: main.value?.electricityUnit,
            },
            {
              key: 'aaaaaaaa',
              label: '协议有效期(年)',
              value: main.value?.protocolValidity,
            },
            {
              key: 'aaaaaaaa',
              label: '管理单位',
              value: getValue(main.value?.managementUnit, 16),
            },
            {
              key: 'aaaaaaaa',
              label: '联系人电话',
              value: main.value?.telephone,
            },
            {
              key: 'aaaaaaaa',
              label: '备注',
              value: main.value?.remarks,
            },
          ],
        },
        {
          label: '关联信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '恒电位仪',
              value: main.value?.potentiostat,
            },
            {
              key: 'aaaaaaaa',
              label: '管线编号',
              value: main.value?.lineCode,
            },
          ],
        },
        {
          label: '空间信息',
          children: [
            {
              key: 'aaaaaaaa',
              label: '所属区域',
              value: getValue(main.value?.belongRegion, 11),
            },
            {
              key: 'aaaaaaaa',
              label: '所属路段',
              value: main.value?.belongRoad,
            },
            {
              key: 'aaaaaaaa',
              label: 'X坐标',
              value: main.value?.xcoordinate,
            },
            {
              key: 'aaaaaaaa',
              label: 'Y坐标',
              value: main.value?.ycoordinate,
            },
            {
              key: 'aaaaaaaa',
              label: '高程(m)',
              value: main.value?.elevation,
            },
          ],
        },
      ];
      break;

    case '5001':
      value = [
        {
          label: '本体信息',
          children: [
            {
              key: 'equipmentcode',
              label: '调压箱(柜)编号',
              value: main5001.equipmentcode,
              required: true,
            },
            {
              key: 'compressorboxlmodel',
              label: '调压箱(柜)型号',
              value: main5001.compressorboxlmodel,
            },
            {
              key: 'configurationtype',
              label: '调压箱(柜)结构',
              value: main5001.configurationtype,
              columns: dictList.value[25],
            },
            {
              key: 'flowdesign',
              label: '设计流量(m³/h)',
              value: main5001.flowdesign,
              step: 0.001,
            },
            {
              key: 'desiginletfressure',
              label: '设计进口压力(Mpa)',
              value: main5001.desiginletfressure,
              step: 0.01,
            },
            {
              key: 'desienlutletpressure',
              label: '设计出口压力(Mpa)',
              value: main5001.desienlutletpressure,
              step: 0.01,
            },
            {
              key: 'maxinletpressure',
              label: '最大进口压力(Mpa)',
              value: main5001.maxinletpressure,
              step: 0.01,
            },
            {
              key: 'maxoutletpressure',
              label: '最大出口压力(Mpa)',
              value: main5001?.maxoutletpressure,
              step: 0.01,
            },
            {
              key: 'inletdiameter',
              label: '进口管径(mm)',
              value: main5001?.inletdiameter,
              step: 1,
            },
            {
              key: 'outletdiameter',
              label: '出口管径(mm)',
              value: main5001?.outletdiameter,
              step: 1,
            },
            {
              key: 'manufactureddate',
              label: '生产日期',
              value: main5001?.manufactureddate,
              isDate: true,
            },
            {
              key: 'status',
              label: '调压箱(柜)状态',
              value: main5001?.status,
              columns: dictList.value[7],
            },
          ],
        },
        {
          label: '管理信息',
          children: [
            {
              key: 'regionid',
              label: '区域分组',
              value: main5001?.regionid,
              treeItems: netList.value,
            },

            {
              key: 'x',
              label: 'X坐标',
              value: main5001?.x,
            },
            {
              key: 'y',
              label: 'Y坐标',
              value: main5001?.y,
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
            {
              key: 'aaaaaaaa',
              label: '阀井编号',
              value: main.value?.equipmentcode,
            },
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
            {
              key: 'aaaaaaaa',
              label: '设备编号',
              value: main.value?.equipmentcode,
            },
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
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  padding: 16px;
  background-color: rgba(245, 245, 245, 1);

  .content {
    width: 100%;
    height: calc(100% - 70px);
    border-radius: 16px;
    background-color: #fff;
    padding: 16px;

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

          .required::after {
            content: '*';
            color: #f00;
          }
        }
      }
    }
  }

  .footer {
    height: 58px;
    margin-top: 12px;
    background: #ffffff;
    // display: flex;
    // justify-content: center;
    // align-items: center;
    display: grid;
    grid-template-columns: repeat(2, 100px);
    justify-content: center;
    align-items: center;
    gap: 15px;

    .confirm {
      width: 100px;
      height: 34px;
      border-radius: 30px;
      background: #ff6a00;
      display: grid;
      place-items: center;

      font-size: 16px;
      color: #ffffff;
    }

    .cancel {
      width: 100px;
      height: 34px;
      border-radius: 30px;
      border: 1px solid #8db5c5;
      display: grid;
      place-items: center;

      font-size: 16px;
      color: #8db5c5;
    }
  }
}

:deep(.van-loading) {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
}
</style>
