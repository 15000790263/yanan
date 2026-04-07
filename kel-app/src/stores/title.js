import { defineStore } from 'pinia';
import { ref } from 'vue';

export const titleStore = defineStore('title', () => {
  const title = ref('');
  function changeTitle(data) {
    title.value = data;
  }
  return {
    title,
    changeTitle,
  };
});
