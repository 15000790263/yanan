<template>
  <div class="wrapper">
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
  </div>
</template>

<script setup>
import { getRegulatorByScan } from '../../../../api/device';
import { getValue } from './hooks/useDict';

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const main = ref({});

watchEffect(async () => {
  main.value = props.data;

  const equipmentsyscode = props.data.equipmentsyscode;
  if (equipmentsyscode) {
    const list = await getRegulatorByScan(equipmentsyscode);
    const data = list.data.rows.find(item => item.equipmentsyscode === equipmentsyscode);

    main.value = data;
  }
});

const dataList = computed(() => {
  return [
    {
      label: '本体信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)类型',
          value: getValue(main.value?.compressorboxtype, 23),
        },
        // {
        //   key: 'aaaaaaaa',
        //   label: '调压箱(柜)编号',
        //   value: main.value?.equipmentcode,
        // },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)型号',
          value: main.value?.compressorboxlmodel,
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)材质',
          value: getValue(main.value?.compressorboxmaterial, 24),
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)结构',
          value: getValue(main.value?.configurationtype, 25),
        },
        {
          key: 'aaaaaaaa',
          label: '用气性质',
          value: getValue(main.value?.propertyofuse, 26),
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)分级',
          value: getValue(main.value?.compressorboxgrade, 27),
        },
        {
          key: 'aaaaaaaa',
          label: '设计流量(m³/h)',
          value: main.value?.flowdesign,
        },
        {
          key: 'aaaaaaaa',
          label: '设计进口压力(Mpa)',
          value: main.value?.desiginletfressure,
        },
        {
          key: 'aaaaaaaa',
          label: '设计出口压力(Mpa)',
          value: main.value?.desienlutletpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '最大进口压力(Mpa)',
          value: main.value?.maxinletpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '最大出口压力(Mpa)',
          value: main.value?.maxoutletpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '进口管径(mm)',
          value: main.value?.inletdiameter,
        },
        {
          key: 'aaaaaaaa',
          label: '出口管径(mm)',
          value: main.value?.outletdiameter,
        },
        {
          key: 'aaaaaaaa',
          label: '放散设计压力(Mpa)',
          value: main.value?.releasepressure,
        },
        {
          key: 'aaaaaaaa',
          label: '切断设计压力(Mpa)',
          value: main.value?.cutoffpressuredesign,
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)头类型',
          value: main.value?.regulatorheadid,
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)头产地',
          value: getValue(main.value?.froducertype, 28),
        },
        {
          key: 'aaaaaaaa',
          label: '过滤器类型',
          value: main.value?.filtermodel,
        },
        {
          key: 'aaaaaaaa',
          label: '过滤器产地',
          value: getValue(main.value?.filterorigin, 28),
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)重量(Kg)',
          value: main.value?.weight,
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
          label: '调压箱(柜)状态',
          value: getValue(main.value?.status, 7),
        },
        {
          key: 'aaaaaaaa',
          label: '最后修改人',
          value: main.value?.updateby || main.value?.createby,
        },
        {
          key: 'aaaaaaaa',
          label: '最后修改时间',
          value: main.value?.updatetime || main.value?.createtime,
        },
      ],
    },
    {
      label: '附属信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '有无放散管',
          value: getValue(main.value?.releasepipeindid, 29),
        },
        {
          key: 'aaaaaaaa',
          label: '切断阀型号',
          value: main.value?.cutoffid,
        },
        {
          key: 'aaaaaaaa',
          label: '中压压力表',
          value: main.value?.mediumfressuregauge,
        },
        {
          key: 'aaaaaaaa',
          label: '低压压力表',
          value: main.value?.lowpressuregauge,
        },
        {
          key: 'aaaaaaaa',
          label: '压力表是否首检',
          value: getValue(main.value?.firstinspectionind, 30),
        },
        {
          key: 'aaaaaaaa',
          label: '是否有静电跨接',
          value: getValue(main.value?.electrostaticbridgingind, 31),
        },
        {
          key: 'aaaaaaaa',
          label: '静电跨接数量',
          value: main.value?.elecbridginghum,
        },
        {
          key: 'aaaaaaaa',
          label: '是否有护栏',
          value: getValue(main.value?.guardrailind, 32),
        },
        {
          key: 'aaaaaaaa',
          label: '护栏尺寸(m*m)',
          value: main.value?.compressorboxsize,
        },
        {
          key: 'aaaaaaaa',
          label: '是否有警示牌',
          value: getValue(main.value?.warningsignind, 33),
        },
        {
          key: 'aaaaaaaa',
          label: '小区架空管(m)',
          value: main.value?.overheadpipeshum,
        },
        {
          key: 'aaaaaaaa',
          label: '小区引入管(m)',
          value: main.value?.inletpipesnum,
        },
        {
          key: 'aaaaaaaa',
          label: '是否有测试线',
          value: getValue(main.value?.testlineind, 18),
        },
        {
          key: 'aaaaaaaa',
          label: '绝缘接头位置',
          value: main.value?.insulatedjointlocation,
        },
        {
          key: 'aaaaaaaa',
          label: '离地高度',
          value: main.value?.rideheight,
        },
        {
          key: 'aaaaaaaa',
          label: '数据传输模式',
          value: getValue(main.value?.datatransmissionmode, 34),
        },
        {
          key: 'aaaaaaaa',
          label: '点位标签',
          value: main.value?.dvsn,
        },
      ],
    },
    {
      label: '管理信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '安装位置',
          value: main.value?.compressorboxlocation,
        },
        {
          key: 'aaaaaaaa',
          label: '安装方式',
          value: getValue(main.value?.methodburied, 35),
        },
        // {
        //   key: 'aaaaaaaa',
        //   label: '区域分组',
        //   value: main.value?.regionid
        // },
        {
          key: 'aaaaaaaa',
          label: '所在路段',
          value: main.value?.compressorboxroad,
        },
        {
          key: 'aaaaaaaa',
          label: '街道',
          value: main.value?.street,
        },
        {
          key: 'aaaaaaaa',
          label: '社区',
          value: main.value?.community,
        },
        {
          key: 'aaaaaaaa',
          label: '小区联系人',
          value: main.value?.contacts,
        },
        {
          key: 'aaaaaaaa',
          label: '联系人电话',
          value: main.value?.contactpersontel,
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
          label: '投运日期',
          value: main.value?.efectivefromdate,
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
          value: main.value?.elevation,
        },
        {
          key: 'aaaaaaaa',
          label: '设计单位',
          value: getValue(main.value?.designcompany, 9),
        },
        {
          key: 'aaaaaaaa',
          label: '施工单位',
          value: getValue(main.value?.assemblycompany, 5),
        },
        {
          key: 'aaaaaaaa',
          label: '监理单位',
          value: getValue(main.value?.inspectingcompany, 36),
        },
        {
          key: 'aaaaaaaa',
          label: '所属管线',
          value: main.value?.linecode,
        },
        {
          key: 'aaaaaaaa',
          label: '三维模型类型',
          value: getValue(main.value?.boxmodeltype, 37),
        },
      ],
    },
    {
      label: '工艺参数',
      children: [
        {
          key: 'aaaaaaaa',
          label: '放散实际压力(Mpa)',
          value: main.value?.releaseactualpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '切断实际压力(Mpa)',
          value: main.value?.cutactualpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '调压箱(柜)放散压力(Mpa)',
          value: main.value?.tybreleaseactualpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '实际入口压力(Mpa)',
          value: main.value?.actualinletpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '实际出口压力(Mpa)',
          value: main.value?.actualouterpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '最低入口报警压力(Mpa)',
          value: main.value?.mininletalarmpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '最低出口报警压力(Mpa)',
          value: main.value?.minouteralarmpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '最高出口报警压力(Mpa)',
          value: main.value?.maxouteralarmpressure,
        },
        {
          key: 'aaaaaaaa',
          label: '传感器电压最低(%)',
          value: main.value?.lowestsensorvoltage,
        },
        {
          key: 'aaaaaaaa',
          label: '传感器电压报警(%)',
          value: main.value?.sensorvoltagealarm,
        },
      ],
    },
    // {
    //   label: '管控关系',
    //   children: [
    //     {
    //       key: 'aaaaaaaa',
    //       label: '所属路段',
    //       value: main.value?.belongRoad
    //     },
    // }
  ];
});
</script>

<style lang="less" scoped>
.wrapper {
  width: 100%;
  height: calc(100vh - 200px);
  background-color: rgba(245, 245, 245, 1);

  .content {
    width: 100%;
    height: 100%;
    overflow-y: scroll;
    background-color: #fff;

    .content-list {
      width: 100%;
      height: 100%;

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
          height: 30px;
          font-size: 14px;
          color: #34394f;

          > div {
            flex: 1;
          }

          & > div:last-child {
            color: #969799;
          }
        }
      }
    }
  }
}
</style>
