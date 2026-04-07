import { defineStore } from 'pinia';
import { ref } from 'vue';

export const warningStore = defineStore('warning', () => {
  const warning = ref('');
  function changeWarning(data) {
    warning.value = data;
  }
  return {
    warning,
    changeWarning,
  };
});
