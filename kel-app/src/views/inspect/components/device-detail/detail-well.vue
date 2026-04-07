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
import { getWallByScan } from '../../../../api/device';
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
    const list = await getWallByScan(equipmentsyscode);
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
          label: '井盖规格(mm)',
          value: main.value?.welltype,
        },
        {
          key: 'aaaaaaaa',
          label: '井盖材质',
          value: getValue(main.value?.wellmaterial, 57),
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
        // {
        //   key: 'aaaaaaaa',
        //   label: '井室深(m)',
        //   value: main.value?.wellchamberdepth,
        // },
        {
          key: 'aaaaaaaa',
          label: '阀门类型',
          value: main.value?.fmlx,
        },
        // {
        //   key: 'aaaaaaaa',
        //   label: '压力等级(MPa)',
        //   value: main.value?.yldj,
        // },
        {
          key: 'aaaaaaaa',
          label: '阀门生产厂家',
          value: main.value?.constructionunit,
        },
        {
          key: 'aaaaaaaa',
          label: '阀门安装日期',
          value: main.value?.fmazri,
        },
        {
          key: 'aaaaaaaa',
          label: '阀门规格',
          value: main.value?.fmgg,
        },
        {
          key: 'aaaaaaaa',
          label: '阀门长度(mm)',
          value: main.value?.fmcd,
        },
        {
          key: 'aaaaaaaa',
          label: '阀井深度(m)',
          value: main.value?.welldepth,
        },
        // {
        //   key: 'aaaaaaaa',
        //   label: '有效起始期',
        //   value: main.value?.effectivestartdate,
        // },
        // {
        //   key: 'aaaaaaaa',
        //   label: '失效日期',
        //   value: main.value?.effectiveenddate,
        // },
      ],
    },
    {
      label: '附属信息',
      children: [
        // {
        //   key: 'aaaaaaaa',
        //   label: '设计单位',
        //   value: main.value?.designunit,
        // },
        // {
        //   key: 'aaaaaaaa',
        //   label: '施工单位',
        //   value: main.value?.constructionunit,
        // },
        // {
        //   key: 'aaaaaaaa',
        //   label: '监理单位',
        //   value: main.value?.controlunit,
        // },
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
          label: '所在路段',
          value: main.value?.roadname,
        },
        {
          key: 'aaaaaaaa',
          label: '阀井位置',
          value: main.value?.localtion,
        },
        {
          key: 'aaaaaaaa',
          label: '阀井编号',
          value: main.value?.equipmentcode,
        },
        {
          key: 'aaaaaaaa',
          label: '阀井状态',
          value: getValue(main.value?.belongunit, 7),
        },
        {
          key: 'aaaaaaaa',
          label: '所属单位',
          value: getValue(main.value?.belongunit, 16),
        },
        {
          key: 'aaaaaaaa',
          label: '所属管线',
          value: main.value?.pipeline,
        },
        // {
        //   key: 'aaaaaaaa',
        //   label: '区域分组',
        //   value: main.value?.regionid,
        // },
      ],
    },
    {
      label: '关联信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '阀门状态',
          value: getValue(main.value?.valvestatus, 39),
        },
        {
          key: 'aaaaaaaa',
          label: '阀门启用日期',
          value: main.value?.valvestartdate,
        },
        {
          key: 'aaaaaaaa',
          label: '补偿器厂家',
          value: main.value?.compensator,
        },
        {
          key: 'aaaaaaaa',
          label: '补偿器数量(个)',
          value: main.value?.compensatorripplenum,
        },
        {
          key: 'aaaaaaaa',
          label: '补偿器长度(mm)',
          value: main.value?.accessoriesstatus,
        },
        {
          key: 'aaaaaaaa',
          label: '是否有阴极保护',
          value: getValue(main.value?.cathodicprotectionstatus, 18),
        },
        {
          key: 'aaaaaaaa',
          label: '螺栓规格',
          value: main.value?.lsgg,
        },
        {
          key: 'aaaaaaaa',
          label: '螺栓数量(个)',
          value: main.value?.boltnum,
        },
        {
          key: 'aaaaaaaa',
          label: '放散生产厂家',
          value: main.value?.fssccj,
        },
        {
          key: 'aaaaaaaa',
          label: '放散阀门数量',
          value: getValue(main.value?.cathodicprotectionstatus, 58),
        },
        {
          key: 'aaaaaaaa',
          label: '放散规格',
          value: main.value?.releasevalvespecifications,
        },
        {
          key: 'aaaaaaaa',
          label: '是否有外部设备',
          value: getValue(main.value?.externalequipmentind, 18),
        },
        // {
        //   key: 'aaaaaaaa',
        //   label: '符号旋转方向',
        //   value: main.value?.symboldirection,
        // },
        // {
        //   key: 'aaaaaaaa',
        //   label: 'X坐标',
        //   value: main.value?.x,
        // },
        // {
        //   key: 'aaaaaaaa',
        //   label: 'Y坐标',
        //   value: main.value?.y,
        // },
        // {
        //   key: 'aaaaaaaa',
        //   label: '高程',
        //   value: main.value?.elevation,
        // },
      ],
    },
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
