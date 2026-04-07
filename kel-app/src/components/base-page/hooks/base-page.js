import BasePage from '../vue/base-page';

export default function useBasePage(aliveRoutes) {
  return {
    setup() {
      return () => {
        return h(BasePage, { aliveRoutes });
      };
    },
  };
}
