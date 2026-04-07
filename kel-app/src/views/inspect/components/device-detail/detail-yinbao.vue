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
import { getHDWYByScan } from '../../../../api/device';
import { getValue } from './hooks/useDict';
import { systemStore } from '@/stores/system.js';

const sysStore = systemStore();

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
    const list = await getHDWYByScan(equipmentsyscode);
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
          label: '物资名称',
          value: main.value?.equipment,
        },
        {
          key: 'aaaaaaaa',
          label: '物资编号',
          value: main.value?.equipmentcode,
        },
        {
          key: 'aaaaaaaa',
          label: '规格型号',
          value: main.value?.specification,
        },
        {
          key: 'aaaaaaaa',
          label: '状态',
          value: sysStore.getDictValue('equipment_state_static', main.value?.status),
        },
      ],
    },
    {
      label: '附属信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '生产厂家',
          value: main.value?.manufacturer,
        },
        {
          key: 'aaaaaaaa',
          label: '出厂编号',
          value: main.value?.manufacturernum,
        },
        {
          key: 'aaaaaaaa',
          label: '生产日期',
          value: main.value?.productiondate,
        },
      ],
    },
    {
      label: '工艺信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '恒电位范围',
          value: main.value?.radius,
        },
        {
          key: 'aaaaaaaa',
          label: '供电电源',
          value: main.value?.powersource,
        },
        {
          key: 'aaaaaaaa',
          label: '输出定额',
          value: main.value?.outputquota,
        },
        {
          key: 'aaaaaaaa',
          label: '路数',
          value: main.value?.powerway,
        },
      ],
    },
    {
      label: '管理信息',
      children: [
        {
          key: 'aaaaaaaa',
          label: '安装位置',
          value: main.value?.installationposition,
        },
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
