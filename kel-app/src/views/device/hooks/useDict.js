import { getDictType } from '../../../api/device';

// 数组顺序不要变
const dictTypeValue = [
  'pipe_line_level', // 0
  'pipe_line_type',
  'outsideanticorrosion_ways',
  'outsideanticorrosionways_level',
  'insideanticorrosionmaterial_type', // 4
  'construction_unit',
  'lay_ways',
  'equipment_state',
  'operation_unit', // 8
  'design_unit',
  'high_presure_type',
  'region_type',
  'manage_team', // 12
  'intermediate_presure_type',
  'medium_presure_type',
  'low_presure_type',
  'air_breathingunit', // 16
  'station_watch',
  'test_line_ind',
  'equipment_evacuation',
  'equipment_breaks', // 20
  'well_material',
  'electricity_method',
  'compressor_box_type',
  'compressor_box_material', // 24
  'configuration_type',
  'use_type',
  'compressor_box_grade',
  'product_type', // 28
  'vite_pipe_type',
  'firstin_spection_ind',
  'electrostatic_bridging_ind',
  'guard_rail_ind', // 32
  'warning_sign_ind',
  'datatransmission_mode',
  'method_buried',
  'inspecting_unit', // 36
  'box_model_type',
  'leakalarm_type',
  'valve_status',
  'valvewell_type', // 40
  'valvewell_shape',
  'valvewell_structure',
  'well_type',
  'voltage_type', // 44
  'pump_mode',
  'controller_type_oet',
  'harardousrating_type',
  'working_medium', // 48
  'asset_attributes',
  'head_material',
  'cylinder_material',
  'pressure_vessel_type', // 52
  'equipment_maintain_level',
  'equipment_approve_state',
  'valvewell_structure',
  'work_area', // 56
  'well_type',
  'release_type',
];

const dictTypeList = ref([]);

async function getDict() {
  if (!dictTypeValue.length) {
    return;
  }
  const promises = dictTypeValue.map(item => getDictType(item));

  const res = await Promise.all(promises);

  dictTypeList.value = res.map(item => item.data.rows);
}

getDict();

export function getValue(value, index) {
  return dictTypeList.value[index]?.find(item => item.dictValue === value)?.dictLabel;
}

export function getDictList(index) {
  return dictTypeList.value[index];
}

export const dictList = computed(() => dictTypeList.value);
