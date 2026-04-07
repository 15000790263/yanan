import { defineStore } from 'pinia';
import { ref } from 'vue';

export const themeStore = defineStore('theme', () => {
  const theme = ref('dark');
  function changeTheme(data) {
    if (data) {
      theme.value = data;
    } else {
      theme.value = theme.value === 'dark' ? 'light' : 'dark';
    }
  }
  return {
    theme,
    changeTheme,
  };
});
