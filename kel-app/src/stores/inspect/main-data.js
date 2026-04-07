import { defineStore } from 'pinia';
import { api_plan } from '@/api/inspect';
import { createLoading } from '../../utils/loading-fn';
import { systemStore } from '@/stores/system';
import { cloneDeep } from 'lodash';
import useUserStore from '../../stores/user';
import { getDistance } from 'geolib';
import { getLoc } from '../../views/inspect/util/location';

const userStore = useUserStore();

// 判断是否区域主管，或者运行部人员
function isLeader() {
  const permissions = userStore.permissions;
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return permissions.includes('safe:plan:add') || userInfo?.dept?.deptName === '运行部';
}

export const useMainDataStore = defineStore(
  'mainData',
  () => {
    const initAllData = {
      fj: {
        plans: [],
        points: [],
      },
      tyx: {
        plans: [],
        points: [],
      },
      yb: {
        plans: [],
        points: [],
      },
      gx: {
        plans: [],
        points: [],
      },
      '5mx': {
        plans: [],
        points: [],
      },
      mdgx: {
        plans: [],
        points: [],
      },
      jgcl: {
        plans: [],
        points: [],
      },
      kxdr: {
        plans: [],
        points: [],
      },
      kx: {
        plans: [],
        points: [],
      },
    };
    const MAP = ['', 'tyz', 'fj', 'tyx', 'yb', 'gx', '5mx', 'mdgx', 'jgcl', 'kxdr'];
    // 和高老师确定的快巡类型101
    MAP['101'] = 'kx';

    const allData = ref(cloneDeep(initAllData));

    async function getAllData() {
      // 2:阀井，3:调压箱，4:阴保，5:管线，6:5米线，7:埋地管线，8:激光车量 9:快巡点(人)?
      allData.value = cloneDeep(initAllData);

      // 1.获取所有的计划
      const res = await api_plan.getAllPlan();
      const plans = res.data.rows;

      if (!isLeader()) {
        console.log('不是区域主管');

        for (const item of plans) {
          const key = MAP[item.patrolType];
          allData.value[key].plans.push(item);
          // 这里后面要根据planId获取设备
          if (['fj', 'tyx'].includes(key)) {
            // 根据计划的planId,(controlId)获取设备
            const res = await api_plan.getEquipment({
              planId: item.id,
              type: key === 'fj' ? '1' : '2',
              // controlId: item.controlId,
            });

            allData.value[key].points.push(
              ...res.data.rows.map(value => {
                return {
                  ...value,
                  ...item,
                  regulatorNumber: value.pointCode,
                  valveNumber: value.pointCode,
                  equipmentsyscode: value.pointSyscode,
                  patrolPlanId: item.id,
                  x: value.lon,
                  y: value.lat,
                };
              })
            );
          }

          // 快巡
          else if (key === 'kx') {
            const res2 = await api_plan.getKxPoint(item.id);
            allData.value[key].points.push(
              ...res2.data.rows.map(value => {
                return {
                  ...value,
                  ...item,
                  regulatorNumber: value.pointCode,
                  valveNumber: value.pointCode,
                  equipmentsyscode: value.pointSyscode,
                  patrolPlanId: item.id,
                  pointId: value.pointSyscode,
                  x: value.lon,
                  y: value.lat,
                };
              })
            );
          }
        }
      } else {
        console.log('是区域主管');
        for (const item of plans) {
          const key = MAP[item.patrolType];
          allData.value[key].plans.push(item);

          if (key === 'kx') {
            const res2 = await api_plan.getKxPoint(item.id);

            allData.value[key].points.push(
              ...res2.data.rows.map(value => {
                return {
                  ...value,
                  ...item,
                  regulatorNumber: value.pointCode,
                  valveNumber: value.pointCode,
                  equipmentsyscode: value.pointSyscode,
                  patrolPlanId: item.id,
                  pointId: value.pointSyscode,
                  x: value.lon,
                  y: value.lat,
                };
              })
            );
          }
        }

        const [fj, tyx] = await Promise.all([
          api_plan.getLeaderEquipment({
            patrolType: '110',
            type: '1',
          }),
          api_plan.getLeaderEquipment({
            patrolType: '120',
            type: '2',
          }),
        ]);

        const map = {
          fj,
          tyx,
        };

        for (const item of ['fj', 'tyx']) {
          const itemData = allData.value[item];
          itemData.points.push(
            ...map[item].data.rows.map(value => {
              const plan = itemData.plans.find(item => item.controlId === value.controlId);

              return {
                ...value,
                ...plan,
                regulatorNumber: value.pointCode,
                valveNumber: value.pointCode,
                equipmentsyscode: value.pointSyscode,
                patrolPlanId: plan.id,
                x: value.lon,
                y: value.lat,
              };
            })
          );
        }
      }
    }

    function getPlansByType(type) {
      return allData.value[type].plans;
    }

    function getPointsByType(type) {
      return allData.value[type].points;
    }

    function getItemData(type) {
      return allData.value[type];
    }

    // 只有调压箱和阀井需要更新
    async function updateLocalPoints(point, flag = false) {
      const { patrolPlanId: planId, patrolType, equipmentsyscode } = point;
      const key = MAP[patrolType]; // 这里的key是fj、tyx

      allData.value[key].points = allData.value[key].points.filter(item => {
        return item.pointSyscode !== equipmentsyscode;
      });

      if (flag) {
        const plan = allData.value[key].plans.find(item => item.id === planId);
        plan.completedCount += 1;
      }
    }

    const getFjTotalCount = computed(() => {
      return allData.value['fj'].plans.reduce((pre, cur) => {
        return pre + (cur.totalCount || 100);
      }, 0);
    });

    const getFjDoneCount = computed(() => {
      return allData.value['fj'].plans.reduce((pre, cur) => {
        return pre + (cur.completedCount || 0);
      }, 0);
    });

    const getFjNotDoneCount = computed(() => {
      return getFjTotalCount.value - getFjDoneCount.value;
    });

    const getTyxTotalCount = computed(() => {
      return allData.value['tyx'].plans.reduce((pre, cur) => {
        return pre + (cur.totalCount || 100);
      }, 0);
    });

    const getTyxDoneCount = computed(() => {
      return allData.value['tyx'].plans.reduce((pre, cur) => {
        return pre + (cur.completedCount || 0);
      }, 0);
    });

    const getTyxNotDoneCount = computed(() => {
      return getTyxTotalCount.value - getTyxDoneCount.value;
    });

    // 调压箱阀井按距离排序
    async function sortByDistance(type) {
      const destroy = createLoading();

      const { longitude, latitude } = await getLoc();

      const points = allData.value[type].points;

      const sortedPoints = points.sort((a, b) => {
        const distanceA = getDistance({ latitude, longitude }, { latitude: a.y, longitude: a.x });

        const distanceB = getDistance({ latitude, longitude }, { latitude: b.y, longitude: b.x });
        return distanceA - distanceB;
      });

      destroy();

      allData.value[type].points = sortedPoints;
    }

    return {
      allData,
      getAllData,
      getPlansByType,
      getPointsByType,
      updateLocalPoints,
      getItemData,
      getFjTotalCount,
      getFjNotDoneCount,
      getFjDoneCount,
      getTyxTotalCount,
      getTyxNotDoneCount,
      getTyxDoneCount,
      sortByDistance,
    };
  },
  {
    persist: false,
  }
);
