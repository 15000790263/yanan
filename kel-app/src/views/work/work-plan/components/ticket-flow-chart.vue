<template>
  <div class="wrapper">
    <div id="container" style=""></div>
    <div class="big" @click="graphRef.zoom(0.2)">
      <van-icon size="2rem" name="plus" />
    </div>
    <div class="small" @click="graphRef.zoom(-0.2)">
      <van-icon size="2rem" name="minus" />
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { getFlowXML, getUserByRoleId, getRecoredByProcInsId } from '../../../../api/work';
import { reactive, onMounted, onUnmounted, ref } from 'vue';
import { XMLParser } from 'fast-xml-parser';
import { Graph } from '@antv/x6';
import { Scroller } from '@antv/x6-plugin-scroller';
import { nextTick } from 'vue';

const route = useRoute();

const emit = defineEmits(['loaded']);

// 节点距离全局变量
const NODE_DISTANCE = 130;

const { procInsId, deployId } = route.query;

const info = reactive({
  nodeData: [],
  xmlData: '',
});

// const { nodeData, xmlData } = toRefs(info);

const chartData = reactive({
  // 节点
  nodes: [],
  // 边
  edges: [],
});

const graphRef = ref(null);

onMounted(async () => {
  await nextTick();
  const graph = new Graph({
    container: document.getElementById('container'),
    mousewheel: {
      enabled: true,
      modifiers: ['ctrl', 'meta'],
    },
    background: {
      color: '#F7FAFA',
    },
    grid: {
      size: 10, // 网格大小 10px
      visible: true, // 渲染网格背景
    },
    resizing: {
      enabled: true,
    },
    height: screen.availHeight + 50,
  });

  graphRef.value = graph;

  // 这块先不弄，页面拖动页面丢失问题，后面可能要在这里添加配置
  graph.use(
    new Scroller({
      enabled: true,
      pannable: true,
      padding: 0,
    })
  );

  const { data } = await getFlowXML(procInsId, deployId);

  info.nodeData = data.data.nodeData;
  const xmlParse = new XMLParser({
    ignoreAttributes: false,
  });
  const { userTask: xmlJson } = xmlParse.parse(data.data.xmlData).definitions.process;

  info.xmlData = xmlJson;
  const applyPerson = await getRecoredByProcInsId(route.query.procInsId);
  const { flowList } = applyPerson.data.data;
  // indey: 记录流程当前所在节点
  const indey = xmlJson.findIndex(value => value['@_name'] === flowList[0].taskName);
  chartData.nodes = await Promise.all(
    info.xmlData.map(async (item, index, arr) => {
      const isApproved = info.nodeData.find(value => value.key === item['@_id'])?.completed;

      if (index > 0 && index < arr.length) {
        chartData.edges.push({
          source: arr[index - 1]['@_id'],
          target: item['@_id'],
          router: 'orth',
          attrs: {
            line: {
              stroke:
                // 样式设置需要根据节点位置判断，和web端实现略有差异
                isApproved === true && index <= indey
                  ? '#80D7C2'
                  : isApproved === false && index <= indey
                    ? 'rgba(255, 55, 0, 0.3)'
                    : 'rgba(68, 116, 121, 0.1)',
            },
          },
        });
      }
      let user = [];
      // 第一个节点，人员是确定的
      if (index === 0) {
        user = [flowList[flowList.length - 1].assigneeName];
      } else if (index > 0 && index < indey) {
        // 当前indey节点之前的人员也是确定的
        const info = flowList.find(i => i.taskName === item['@_name'] && i.assigneeName);
        user = info?.assigneeName;
      } else if (index >= indey) {
        // indey之后的节点人员通过接口获取
        const res = await getUserByRoleId(item['@_flowable:candidateGroups']);
        user = res.data.map(item => item.nickName);
      }

      return {
        id: item['@_id'],
        x: screen.width / 2 - 50,
        y: NODE_DISTANCE * (index + 1),
        width: 100,
        height: 76,
        attrs: {
          label: {
            html: `<tspan fill='#84ABBB' y='-10' x='0'>${
              item['@_name']
            }</tspan><tspan fill='#34394F' y='20' x='0'>${user.toString() || ''}</tspan>`,
            fontSize: '14px',
          },
          body: {
            fill:
              isApproved === true && index <= indey
                ? 'rgba(128, 215, 194, 0.3)'
                : isApproved === false && index <= indey
                  ? 'rgba(255, 55, 0, 0.1)'
                  : 'rgba(68, 116, 121, 0.1)',
            stroke:
              isApproved === true && index <= indey
                ? '#80D7C2'
                : isApproved === false && index <= indey
                  ? 'rgba(255, 55, 0, 0.3)'
                  : 'rgba(68, 116, 121, 0.1)',
            rx: 4,
            ry: 4,
          },
        },
      };
    })
  );

  // 画图
  graph.addNode({
    id: 'start',
    x: screen.width / 2 - 16,
    y: 20,
    width: 32,
    height: 32,
    shape: 'html',
    attrs: {
      div: {
        class: 'aa',
        style: {
          color: '#f00',
          'border-radius': '50%',
          background: `url(${
            new URL('../../../../assets/image/work/icon-angle-3.png', import.meta.url).href
          }) no-repeat center/10px`,
          'background-color': '#80D7C2',
        },
      },
      body: {
        // fill: '#80D7C2'
      },
    },
  });
  graph.addNode({
    id: 'end',
    x: screen.width / 2 - 16,
    y: NODE_DISTANCE * (chartData.nodes.length + 1),
    width: 32,
    height: 32,
    shape: 'html',
    attrs: {
      label: {
        html: `<tspan y='55' x='2'>完成</tspan>`,
        fill: '#34394F',
        fontSize: 14,
      },
      div: {
        class: 'aa',
        style: {
          color: '#f00',
          'border-radius': '50%',
          background: `url(${
            new URL('../../../../assets/image/work/icon-rect-1197.png', import.meta.url).href
          }) no-repeat center/10px`,
          'background-color': '#80D7C2',
        },
      },
      body: {
        // fill: '#80D7C2'
      },
    },
  });

  graph.addNodes(chartData.nodes);

  const startIsApproved = info.nodeData.find(
    value => value.key === chartData.nodes[0].id
  )?.completed;

  graph.addEdge({
    source: 'start',
    target: chartData.nodes[0].id,
    router: 'orth',
    attrs: {
      line: {
        stroke: startIsApproved ? '#80D7C2' : 'rgba(255, 55, 0, 0.1)',
      },
    },
    labels: [
      {
        attrs: {
          text: {
            text: '开始',
          },
          rect: {
            ref: 'label',
            fill: '#F7FAFA',
          },
        },
        position: 0.3,
      },
    ],
  });
  graph.addEdge({
    source: chartData.nodes[chartData.nodes.length - 1].id,
    target: 'end',
    router: 'orth',
    attrs: {
      line: {
        stroke: indey === xmlJson.length - 1 ? '#80D7C2' : 'rgba(68, 116, 121, 0.1)',
      },
    },
  });
  graph.addEdges(chartData.edges);

  setTimeout(() => {
    emit('loaded');
  }, 500);
});

onUnmounted(() => {
  graphRef.value.dispose();
});

function position() {
  nextTick(() => {
    graphRef.value.zoomToFit({
      padding: 40,
    });
  });
}

defineExpose({ position });
</script>

<style lang="less" scoped>
.wrapper {
  height: 100%;
  display: flex;
  flex-flow: column;
  position: relative;

  > :deep(div) {
    flex: 1;
  }

  .big {
    position: absolute;
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    bottom: 20px;
    right: 60px;
    color: #34394f;
  }

  .small {
    .big();
    right: 20px;
  }
}
</style>
