import { titleStore } from '@/stores/title';
import { watch, onMounted } from 'vue';
import { themeStore } from '@/stores/theme';

export function useTitle() {
  const router = useRouter();
  const titleStoreData = titleStore();
  const themeStoreData = themeStore();

  watch(
    () => router.currentRoute,
    () => {
      titleStoreData.changeTitle(router.currentRoute.value.meta.title);
    },
    {
      deep: true,
    }
  );

  onMounted(() => {
    themeStoreData.changeTheme('light');
    titleStoreData.changeTitle(router.currentRoute.value.meta.title);
  });

  return {
    titleStoreData,
  };
}
