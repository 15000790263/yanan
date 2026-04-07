// import aliveTab from './alive-tab';

class AliveTab {
  constructor() {
    this.activeTabMap = {};
  }
  setActiveTab(routePath, tab) {
    this.activeTabMap[routePath] = tab;
  }

  getActiveTab(routePath) {
    return this.activeTabMap[routePath];
  }
}

const aliveTab = new AliveTab();

export function useAliveTab(active) {
  const route = useRoute();

  const key = `${route.path}${JSON.stringify(route.query)}`;

  watch(active, () => {
    aliveTab.setActiveTab(key, active.value);
  });

  onMounted(() => {
    const value = aliveTab.getActiveTab(key);
    if (value) {
      active.value = value;
    }
  });
}
