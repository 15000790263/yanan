<template>
  <div class="wrapper">
    <div class="content">
      <div class="content-list">
        <template v-for="(item, index) in dataList" :key="index">
          <ul>
            <div class="menu-title">{{ item.label }}</div>
            <template v-for="value in item.children" :key="value.label">
              <li v-if="value.value">
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
import { getDetailByDataId } from '../../../../api/device';
import { getValue } from '../../hooks/useDict';

const route = useRoute();

const dataId = route.query.dataId;

const main = ref(null);

const dataList = computed(() => [
  {
    label: '本体信息',
    children: [
      {
        key: 'aaaaaaaa',
        label: '管线名称',
        value: main.value?.pipelinename,
      },
      {
        key: 'aaaaaaaa',
        label: '管线编号',
        value: main.value?.pipelineno,
      },
      {
        key: 'aaaaaaaa',
        label: '管线原编号',
        value: main.value?.originalno,
      },
      {
        key: 'aaaaaaaa',
        label: '管道类型',
        value: getValue('596', 0),
      },
      {
        key: 'aaaaaaaa',
        label: '管材',
        value: getValue(main.value?.material, 1),
      },
      {
        key: 'aaaaaaaa',
        label: '管线长度(m)',
        value: main.value?.lengths,
      },
      {
        key: 'aaaaaaaa',
        label: '管径(mm)',
        value: main.value?.outterdiameter,
      },
      {
        key: 'aaaaaaaa',
        label: '壁厚(mm)',
        value: main.value?.wallthickness,
      },
      {
        key: 'aaaaaaaa',
        label: '管容(m³)',
        value: main.value?.pipelinecapacity,
      },
      {
        key: 'aaaaaaaa',
        label: '设计压力(Mpa)',
        value: main.value?.designerpressure,
      },
      {
        key: 'aaaaaaaa',
        label: '设计温度(℃)',
        value: main.value?.designtemperature,
      },
      {
        key: 'aaaaaaaa',
        label: '设计年输送能力(万m³)',
        value: main.value?.designercatpacity,
      },
      {
        key: 'aaaaaaaa',
        label: '设计寿命(年)',
        value: main.value?.designlife,
      },
      {
        key: 'aaaaaaaa',
        label: '外防腐层类型',
        value: getValue(main.value?.outsideanticorrosionways, 2),
      },
      {
        key: 'aaaaaaaa',
        label: '外防腐等级',
        value: getValue(main.value?.outsideanticorrosiongrade, 3),
      },
      {
        key: 'aaaaaaaa',
        label: '外防腐厚度(mm)',
        value: main.value?.outsideanticorrosionthickness,
      },
      {
        key: 'aaaaaaaa',
        label: '内防腐材料',
        value: getValue(main.value?.insideanticorrosionmaterial, 4),
      },
    ],
  },
  {
    label: '工程信息',
    children: [
      {
        key: 'aaaaaaaa',
        label: '工程名称',
        value: main.value?.projectname,
      },
      {
        key: 'aaaaaaaa',
        label: '开工时间',
        value: main.value?.startworkdate,
      },
      {
        key: 'aaaaaaaa',
        label: '竣工时间',
        value: main.value?.endworkdate,
      },
      {
        key: 'aaaaaaaa',
        label: '施工单位',
        value: getValue(main.value?.constructionunit, 5),
      },
      {
        key: 'aaaaaaaa',
        label: '起点地址',
        value: main.value?.startingaddress,
      },
      {
        key: 'aaaaaaaa',
        label: '途径地点',
        value: main.value?.routelocation,
      },
      {
        key: 'aaaaaaaa',
        label: '终点地址',
        value: main.value?.destinationaddress,
      },
      {
        key: 'aaaaaaaa',
        label: '埋设方式',
        value: getValue(main.value?.layways, 6),
      },
      {
        key: 'aaaaaaaa',
        label: '管道架空高度(m)',
        value: main.value?.pipelineheight,
      },
      {
        key: 'aaaaaaaa',
        label: '管道平均深度(m)',
        value: main.value?.depths,
      },
    ],
  },
  {
    label: '运行信息',
    children: [
      {
        key: 'aaaaaaaa',
        label: '投运日期',
        value: main.value?.inuseworkdate,
      },
      {
        key: 'aaaaaaaa',
        label: '运行压力(Mpa)',
        value: main.value?.operatingpressure,
      },
      {
        key: 'aaaaaaaa',
        label: '运行状态',
        value: getValue(main.value?.status, 7),
      },
      {
        key: 'aaaaaaaa',
        label: '当前输量',
        value: main.value?.currentthroughput,
      },
      {
        key: 'aaaaaaaa',
        label: '是否环网',
        value: main.value?.loopednetwork == '1' ? '是' : '否',
      },
      {
        key: 'aaaaaaaa',
        label: '运营单位',
        value: getValue(main.value?.operationunit, 8),
      },
    ],
  },
  {
    label: '管理信息',
    children: [
      {
        key: 'aaaaaaaa',
        label: '归属部门',
        value: getValue(main.value?.stationid, 8),
      },
      {
        key: 'aaaaaaaa',
        label: '设计单位',
        value: getValue(main.value?.designunit, 9),
      },
      {
        key: 'aaaaaaaa',
        label: '压力类型',
        value:
          main.value?.pipelinetypeid === '1010'
            ? getValue(main.value?.presuretype, 10)
            : main.value?.pipelinetypeid === '1020'
              ? getValue(main.value?.presuretype, 13)
              : main.value?.pipelinetypeid === '1030'
                ? getValue(main.value?.presuretype, 14)
                : getValue(main.value?.presuretype, 15),
      },
      {
        key: 'aaaaaaaa',
        label: '管理长度(m)',
        value: main.value?.managelength,
      },
      {
        key: 'aaaaaaaa',
        label: '所属区域',
        value: getValue(main.value?.region, 11),
      },
      {
        key: 'aaaaaaaa',
        label: '管理班组',
        value: getValue(main.value?.manageteam, 12),
      },
      {
        key: 'aaaaaaaa',
        label: '管理负责人',
        value: main.value?.manageuser,
      },
      {
        key: 'aaaaaaaa',
        label: '有效起始日期',
        value: main.value?.effectivestartdate,
      },
      {
        key: 'aaaaaaaa',
        label: '失效日期',
        value: main.value?.effectiveenddate,
      },
    ],
  },
]);

getDetailByDataId(dataId).then(res => {
  console.log(res.data.data);
  main.value = res.data.data;
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
    height: 100%;
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
        }
      }
    }
  }
}
</style>
