/**
 * 首页菜单配置
 * 根据用户类型显示不同的菜单
 */

/** 通用菜单 - 进度上报系统 */
const commonMenus = [
  {
    type: '进度管理',
    items: [
      {
        title: '进度计划',
        icon: new URL('../../assets/image/home/personal-report.svg', import.meta.url).href,
        url: '/progress/plan',
      },
      // {
      //   title: '进度查询',
      //   icon: new URL('../../assets/image/home/data-audit.svg', import.meta.url).href,
      //   url: '/progress/query',
      // },
    ],
  },
  {
    type: '施工日志',
    items: [
      {
        title: '施工日志',
        icon: new URL('../../assets/image/home/daily-patrol.svg', import.meta.url).href,
        url: '/log/entry',
      },
    ],
  },
];

/**
 * 获取菜单配置
 * @param userType 用户类型
 * @returns 菜单分组列表
 */
export function getMenuConfig() {
  // 目前统一使用通用菜单，后续可根据用户类型扩展
  return commonMenus;
}
