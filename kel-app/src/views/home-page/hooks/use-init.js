import { useWorkStore } from '../../../stores/work/index';
import { systemStore } from '../../../stores/system.js';
import { useStationStore } from '../../../stores/inspect/station';

// 初始化一些参数
const workStore = useWorkStore();
const sysStore = systemStore();
const stationStore = useStationStore();

export default function useInit() {
  // 作业计划超时时间
  workStore.changeWorkPlanTimeoutLimit();

  // 获取全部的部门信息
  sysStore.getDeptList();

  // 字典
  sysStore.getDickValue('work_area');

  const dictArr = [
    'object_type',
    'natrue_use',
    'equipment_state_static',
    'air_breathingunit',
    'notional_type',
    'test_equipment_type',
    'well_material',
    'asset_attributes',
    'yinhuan',
    'KELRQGZ-LB-26',
    'KELRQGZ-LB-03',
    'KELRQET0036',
    'KELRQET0035',
    'KELRQET0034',
    'KELRQET0033',
    'sys_duty_type',
    'equipment_place',
    'patrol_type',
  ];
  sysStore.getDictInfo(dictArr);
}
