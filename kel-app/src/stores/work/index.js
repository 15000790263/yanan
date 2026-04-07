import { getParamsById } from '../../api/system';

export const useWorkStore = defineStore(
  'work',
  () => {
    const workPlanTimeoutLimit = ref(0);

    // 作业管理人员角色
    const workUserRole = ref([]);

    function changeWorkPlanTimeoutLimit() {
      getParamsById(109).then(res => {
        workPlanTimeoutLimit.value = Number(res.data.data.configValue);
      });
    }

    function changeWorkUserRole(data) {
      workUserRole.value.push(data);
    }

    function initWorkUserRole() {
      workUserRole.value = [];
    }

    return {
      workPlanTimeoutLimit,
      changeWorkPlanTimeoutLimit,
      workUserRole,
      changeWorkUserRole,
      initWorkUserRole,
    };
  },
  {
    persist: true,
  }
);
