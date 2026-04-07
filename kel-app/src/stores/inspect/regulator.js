import { defineStore } from 'pinia';

export const useRegulatorStore = defineStore('regulatorInspect', () => {
  // 管线巡检时巡检的调压箱列表id
  const regulatorIdList = ref([]);
  // 管线巡检时巡检的阀井列表id
  const wellIdList = ref([]);
  // 管线巡检时巡检的调压站列表id
  const stationIdList = ref([]);
  const setRegulatorIdList = id => {
    regulatorIdList.value.push(id);
  };
  const setWellIdList = id => {
    wellIdList.value.push(id);
  };
  const setStationIdList = id => {
    stationIdList.value.push(id);
  };

  const clearRegulatorIdList = () => {
    regulatorIdList.value = [];
  };

  const clearIdList = () => {
    regulatorIdList.value = [];
    wellIdList.value = [];
    stationIdList.value = [];
  };

  return {
    regulatorIdList,
    setRegulatorIdList,
    clearRegulatorIdList,
    wellIdList,
    setWellIdList,
    stationIdList,
    setStationIdList,
    clearIdList,
  };
});
