import { createRouter, createWebHashHistory } from 'vue-router';
import { getToken } from '../utils/session';
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/login/login-view.vue'),
      // component: () => import('../views/test4.vue'),

      meta: { isBack: true },
      beforeEnter: () => {
        if (getToken()) {
          return {
            path: '/index',
            replace: true,
          };
        }
      },
    },
    {
      path: '/index',
      name: 'index',
      component: () => import('../views/index-view.vue'),
      meta: { title: '' },
      redirect: '/index/home',
      children: [
        {
          path: 'home',
          name: 'index-home',
          meta: { title: '首页', isBack: true },
          component: () => import('../views/home-page/index.vue'),
        },
        {
          path: 'mine',
          name: 'index-mine',
          meta: { title: '个人中心', isBack: true },
          component: () => import('../views/mine/mine-view.vue'),
        },
        // {
        //   /** 应急部分 **/
        //   path: '/emergency',
        //   name: 'emergency',
        //   component: () => import('../views/emergency/emergency-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'fact',
        //       name: 'emergency-fact',
        //       meta: { title: '应急管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/emergency/fact/fact-view.vue'),
        //     },
        //     {
        //       path: 'arrange',
        //       name: 'emergency-arrange',
        //       meta: { title: '应急管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/emergency/arrange/arrange-view.vue'),
        //     },
        //     {
        //       path: 'org',
        //       name: 'emergency-org',
        //       meta: { title: '应急管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/emergency/org/org-view.vue'),
        //     },
        //     {
        //       path: 'fact-detail',
        //       name: 'fact-detail',
        //       meta: { title: '应急管理', isBack: false },
        //       component: () => import('../views/emergency/fact/fact-detail.vue'),
        //     },
        //   ],
        // },
        // {
        //   /** 作业管理 **/
        //   path: '/work',
        //   name: 'work',
        //   component: () => import('../views/work/work-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'work-plan',
        //       name: 'work-plan',
        //       meta: { title: '工作计划', isBack: false },
        //       component: () => import('../views/work/work-plan/work-plan.vue'),
        //     },
        //     {
        //       path: 'work-ticket-detail',
        //       name: 'work-ticket-detail',
        //       meta: { title: '作业过程', isBack: false },
        //       component: () => import('../views/work/work-plan/work-ticket-detail.vue'),
        //     },
        //     {
        //       path: 'work-ticket-finish',
        //       name: 'work-ticket-finish',
        //       meta: { title: '工作计划', isBack: false },
        //       component: () => import('../views/work/work-plan/work-ticket-finish.vue'),
        //     },
        //     {
        //       path: 'work-ticket-record',
        //       name: 'work-ticket-record',
        //       meta: { title: '作业票详细', isBack: false },
        //       component: () => import('../views/work/work-plan/work-ticket-record.vue'),
        //     },
        //     {
        //       path: 'work-plan-detail',
        //       name: 'work-plan-detail',
        //       meta: { title: '工作计划详情', isBack: false },
        //       component: () => import('../views/work/work-plan/work-plan-detail.vue'),
        //     },
        //     {
        //       path: 'work-plan-all',
        //       name: 'work-plan-all',
        //       meta: { title: '全部', isBack: false },
        //       component: () => import('../views/work/work-plan/work-plan-all.vue'),
        //     },
        //     {
        //       path: 'plan-all-detail',
        //       name: 'plan-all-detail',
        //       meta: { title: '全部', isBack: false },
        //       component: () => import('../views/work/work-plan/plan-all-detail.vue'),
        //     },
        //     {
        //       path: 'add-work-plan',
        //       name: 'add-work-plan',
        //       meta: { title: '新增作业计划', isBack: false },
        //       component: () => import('../views/work/work-plan/add-work-plan.vue'),
        //       beforeEnter: (to, from) => {
        //         if (from.path === '/work/work-plan-detail') {
        //           to.meta.title = '修改作业计划';
        //         }
        //       },
        //     },
        //     {
        //       path: 'work-plan-approve',
        //       name: 'work-plan-approve',
        //       meta: { title: '计划审批', isBack: false },
        //       component: () => import('../views/work/work-approve/work-plan-approve.vue'),
        //     },
        //     {
        //       path: 'reject-page',
        //       name: 'reject-page',
        //       meta: { title: '工作计划详情', isBack: false },
        //       component: () => import('../views/work/work-approve/reject-page.vue'),
        //     },
        //     {
        //       path: 'work-plan-secure',
        //       name: 'work-plan-secure',
        //       meta: { title: '作业计划', isBack: false },
        //       component: () => import('../views/work/work-secure/work-plan-secure.vue'),
        //     },
        //     {
        //       path: 'finished-plan-detail',
        //       name: 'finished-plan-detail',
        //       meta: { title: '归档作业计划', isBack: false },
        //       component: () => import('../views/work/work-secure/finished-plan-detail.vue'),
        //     },
        //     // 管理层
        //     {
        //       path: 'work-statistics',
        //       name: 'work-statistics',
        //       meta: { title: '作业计划', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/work/work-management/work-statistics.vue'),
        //     },
        //     {
        //       path: 'work-search',
        //       name: 'work-search',
        //       meta: { title: '作业计划', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/work/work-management/work-search.vue'),
        //     },
        //     // App创建作业票
        //     {
        //       path: 'apply-work-ticket',
        //       name: 'apply-work-ticket',
        //       meta: { title: '作业计划', isBack: false },
        //       component: () => import('../views/work/work-plan/apply-work-ticket.vue'),
        //     },
        //     // App作业票审核
        //     {
        //       path: 'work-ticket-approve',
        //       name: 'work-ticket-approve',
        //       meta: { title: '作业票', isBack: false },
        //       component: () => import('../views/work/work-ticket-approve/index.vue'),
        //     },
        //     {
        //       path: 'work-ticket-done',
        //       name: 'work-ticket-done',
        //       meta: { title: '作业票', isBack: false },
        //       component: () => import('../views/work/work-ticket-approve/work-ticket-done.vue'),
        //     },
        //     {
        //       path: 'work-ticket-check',
        //       name: 'work-ticket-check',
        //       meta: { title: '作业票', isBack: false },
        //       component: () => import('../views/work/work-ticket-approve/work-ticket-record.vue'),
        //     },
        //     {
        //       path: 'work-ticket-check-his',
        //       name: 'work-ticket-check-his',
        //       meta: { title: '作业票', isBack: false },
        //       component: () =>
        //         import('../views/work/work-ticket-approve/work-ticket-record-his.vue'),
        //     },
        //     {
        //       path: 'work-menu',
        //       name: 'work-menu',
        //       meta: { title: '作业管理', isBack: false },
        //       component: () => import('../views/work/work-menu/index.vue'),
        //     },
        //     // App作业票管理
        //     {
        //       path: 'work-ticket-manage',
        //       name: 'work-ticket-manage',
        //       meta: { title: '作业票', isBack: false },
        //       component: () => import('../views/work/work-ticket-manage/index.vue'),
        //     },
        //   ],
        // },
        // {
        //   /** 设备管理 **/
        //   path: '/device',
        //   name: 'device',
        //   component: () => import('../views/device/device-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'device-info',
        //       name: 'device-info',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/info.vue'),
        //     },
        //     {
        //       path: 'pipeline',
        //       name: 'pipeline',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/pipeline.vue'),
        //     },
        //     {
        //       path: 'whole-set',
        //       name: 'whole-set',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/whole-set.vue'),
        //     },
        //     {
        //       path: 'base',
        //       name: 'base',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/base.vue'),
        //     },
        //     {
        //       path: 'special',
        //       name: 'special',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/special.vue'),
        //     },
        //     {
        //       path: 'special',
        //       name: 'special',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/special.vue'),
        //     },
        //     {
        //       path: 'pipeline-detail',
        //       name: 'pipeline-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/pipeline-detail.vue'),
        //     },
        //     {
        //       path: 'whole-set-detail',
        //       name: 'whole-set-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/whole-set-detail.vue'),
        //     },
        //     {
        //       path: 'special-detail',
        //       name: 'special-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/special-detail.vue'),
        //     },
        //     {
        //       path: 'add',
        //       name: 'add',
        //       meta: { title: '新增设备', isBack: false },
        //       component: () => import('../views/device/device-info/check/add.vue'),
        //     },
        //     {
        //       path: 'edit',
        //       name: 'edit',
        //       meta: { title: '修改设备', isBack: false },
        //       component: () => import('../views/device/device-info/check/edit.vue'),
        //     },
        //     {
        //       path: 'repair',
        //       name: 'repair',
        //       meta: { title: '设备维修', isBack: false },
        //       component: () => import('../views/device/device-info/repair/index.vue'),
        //     },
        //     {
        //       path: 'health',
        //       name: 'health',
        //       meta: { title: '设备保养', isBack: false },
        //       component: () => import('../views/device/device-info/health/index.vue'),
        //     },
        //     // for阀井保养
        //     {
        //       path: 'health-well',
        //       name: 'health-well',
        //       meta: { title: '设备保养', isBack: false },
        //       component: () => import('../views/device/device-info/health/well.vue'),
        //     },
        //     {
        //       path: 'info',
        //       name: 'info',
        //       meta: { title: '设备保养', isBack: false },
        //       component: () => import('../views/device/device-info/health/info.vue'),
        //     },
        //     {
        //       path: 'repair-info',
        //       name: 'repair-info',
        //       meta: { title: '设备维修', isBack: false },
        //       component: () => import('../views/device/device-info/repair/info.vue'),
        //     },
        //     // 调压箱气密性试验照片页面
        //     {
        //       path: 'add-pic',
        //       name: 'add-pic',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/add-picture/index.vue'),
        //     },
        //     //
        //     {
        //       path: 'material',
        //       name: 'material',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/material.vue'),
        //     },
        //     {
        //       path: 'material-detail',
        //       name: 'material-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/material-detail.vue'),
        //     },
        //     // 阴保
        //     {
        //       path: 'protection',
        //       name: 'protection',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/protection.vue'),
        //     },
        //     {
        //       path: 'protection-detail',
        //       name: 'protection-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/protection-detail.vue'),
        //     },
        //     // 消防
        //     {
        //       path: 'fire-fighting',
        //       name: 'fire-fighting',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/fire-fighting.vue'),
        //     },
        //     {
        //       path: 'fire-fighting-detail',
        //       name: 'fire-fighting-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () =>
        //         import('../views/device/device-info/detail/fire-fighting-detail.vue'),
        //     },
        //     // 绝缘
        //     {
        //       path: 'isolation',
        //       name: 'isolation',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/isolation.vue'),
        //     },
        //     {
        //       path: 'isolation-detail',
        //       name: 'isolation-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/isolation-detail.vue'),
        //     },
        //     // 供应商
        //     {
        //       path: 'supplier',
        //       name: 'supplier',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/supplier.vue'),
        //     },
        //     {
        //       path: 'supplier-detail',
        //       name: 'supplier-detail',
        //       meta: { title: '设备管理', isBack: false },
        //       component: () => import('../views/device/device-info/detail/supplier-detail.vue'),
        //     },

        //     /* ************* 维保检 **************** */

        //     {
        //       path: 'device-others',
        //       name: 'device-others',
        //       meta: { title: '设备维保险', isBack: false },
        //       component: () => import('../views/device/device-others/others.vue'),
        //     },
        //     {
        //       path: 'device-repair',
        //       name: 'device-repair',
        //       meta: { title: '设备维修', isBack: false },
        //       component: () => import('../views/device/device-others/device-repair.vue'),
        //     },
        //     {
        //       path: 'device-repair-detail',
        //       name: 'device-repair-detail',
        //       meta: { title: '设备维修详情', isBack: false },
        //       component: () => import('../views/device/device-others/device-repair-detail.vue'),
        //     },
        //     {
        //       path: 'device-health',
        //       name: 'device-health',
        //       meta: { title: '基本设备', isBack: false },
        //       component: () => import('../views/device/device-others/device-health.vue'),
        //     },
        //     {
        //       path: 'device-health-review',
        //       name: 'device-health-review',
        //       meta: { title: '查看审核', isBack: false },
        //       component: () => import('../views/device/device-others/device-health-review.vue'),
        //     },
        //     {
        //       path: 'device-verification',
        //       name: 'device-verification',
        //       meta: { title: '设备检定', isBack: false },
        //       component: () => import('../views/device/device-others/device-verification.vue'),
        //     },
        //     {
        //       path: 'building-detail',
        //       name: 'building-detail',
        //       meta: { title: '楼栋关系', isBack: false },
        //       component: () => import('../views/device/device-info/detail/building-detail.vue'),
        //     },
        //     {
        //       path: 'add-building',
        //       name: 'add-building',
        //       meta: { title: '楼栋关系', isBack: false },
        //       component: () => import('../views/device/device-info/building/add-building.vue'),
        //     },
        //   ],
        // },
        // {
        //   /** 巡检管理 **/
        //   path: '/inspect',
        //   name: 'inspect',
        //   component: () => import('../views/inspect/inspect-index.vue'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'inspect-home',
        //       name: 'inspect-home',
        //       meta: { title: '巡检管理', isBack: false },
        //       component: () => import('../views/inspect/inspect-home/home.vue')
        //     },
        //     {
        //       path: 'inspect-history',
        //       name: 'inspect-history',
        //       meta: { title: '巡检管理', isBack: false },
        //       component: () => import('../views/inspect/inspect-history/history.vue')
        //     },
        //     {
        //       path: 'inspect-trans',
        //       name: 'inspect-trans',
        //       meta: { title: '巡检管理', isBack: false },
        //       component: () => import('../views/inspect/inspect-trans/trans.vue')
        //     }
        //   ]
        // }
        // {
        //   /** 巡检管理 **/
        //   path: '/inspect',
        //   name: 'inspect',
        //   component: () => import('../views/inspect/inspect-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'multimedia/:id',
        //       name: '',
        //       meta: { title: '巡检详情', isBack: false },
        //       component: () => import('../views/inspect/multimedia/multimedia.vue'),
        //     },
        //     {
        //       path: 'checking/:id',
        //       name: 'checking',
        //       meta: { title: '巡检详情', isBack: false },
        //       component: () => import('../views/inspect/checking/checking.vue'),
        //     },
        //     {
        //       path: 'inspect-home',
        //       name: 'inspect-home',
        //       meta: { title: '巡检管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/inspect/inspect-home/home.vue'),
        //     },
        //     {
        //       path: 'inspect-history',
        //       name: 'inspect-history',
        //       meta: { title: '巡检管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/inspect/inspect-history/history.vue'),
        //     },
        //     {
        //       path: 'inspect-trans',
        //       name: 'inspect-trans',
        //       meta: { title: '巡检管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/inspect/inspect-trans/trans.vue'),
        //     },
        //     {
        //       path: 'inspect-statistic',
        //       name: 'inspect-statistic',
        //       meta: { title: '巡检管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/inspect/inspect-statistic/statistic.vue'),
        //     },
        //     {
        //       path: 'inspect-trail',
        //       name: 'inspect-trail',
        //       meta: { title: '巡检轨迹', isBack: false },
        //       component: () => import('../views/inspect/trail/index.vue'),
        //     },
        //     {
        //       path: 'edit-history',
        //       name: 'edit-history',
        //       meta: { title: '巡检详情', isBack: false },
        //       component: () => import('../views/inspect/edit-history/index.js'),
        //     },
        //     {
        //       path: 'add-picture',
        //       name: 'add-picture',
        //       meta: { title: '添加照片', isBack: false },
        //       component: () => import('../views/inspect/add-picture/index.vue'),
        //     },
        //     {
        //       path: 'inspect-pitfall',
        //       name: 'inspect-pitfall',
        //       meta: { title: '隐患管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/inspect/inspect-pitfall/index.vue'),
        //     },
        //     {
        //       path: 'inspect-pitfall-detail',
        //       name: 'inspect-pitfall-detail',
        //       meta: { title: '隐患详情', isBack: false },
        //       component: () => import('../views/inspect/inspect-pitfall/detail/index.vue'),
        //     },
        //     {
        //       path: 'inspect-pitfall-detail',
        //       name: 'inspect-pitfall-detail',
        //       meta: { title: '隐患详情', isBack: false },
        //       component: () => import('../views/inspect/inspect-pitfall/detail/index.vue'),
        //     },
        //     {
        //       path: 'inspect-pitfall-add',
        //       name: 'inspect-pitfall-add',
        //       meta: { title: '隐患管理', isBack: false },
        //       component: () => import('../views/inspect/inspect-pitfall/add/index.vue'),
        //     },
        //     {
        //       path: 'inspect-pitfall-edit',
        //       name: 'inspect-pitfall-edit',
        //       meta: { title: '隐患管理', isBack: false },
        //       component: () => import('../views/inspect/inspect-pitfall/edit/index.vue'),
        //     },
        //   ],
        // },
        // {
        //   /** 排班管理 **/
        //   path: '/duty',
        //   name: 'duty',
        //   component: () => import('../views/duty/duty-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'duty-management',
        //       name: 'duty-management',
        //       meta: { title: '值班管理', isBack: false },
        //       component: () => import('../views/duty/duty-management.vue'),
        //     },
        //   ],
        // },
        // {
        //   /** 生产管理 **/
        //   path: '/production',
        //   name: 'production',
        //   component: () => import('../views/production/production-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'production-management',
        //       name: 'production-management',
        //       meta: { title: '生产管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/production/production-management/index.vue'),
        //     },
        //     {
        //       path: 'production-scada',
        //       name: 'production-scada',
        //       meta: { title: '生产管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/production/production-scada/index.vue'),
        //     },
        //     {
        //       path: 'production-statistic',
        //       name: 'production-statistic',
        //       meta: { title: '生产管理', isBack: false, source: 'tabbar' },
        //       component: () => import('../views/production/production-statistic/index.vue'),
        //     },
        //   ],
        // },
        // {
        //   /** 管理驾驶舱 **/
        //   path: '/cockpit',
        //   name: 'cockpit',
        //   component: () => import('../views/cockpit/cockpit-index.js'),
        //   meta: { title: '', isBack: true },
        //   children: [
        //     {
        //       path: 'cockpit-management',
        //       name: 'cockpit-management',
        //       meta: { title: '管理驾驶舱', isBack: false },
        //       component: () => import('../views/cockpit/cockpit-management/index.vue'),
        //     },
        //   ],
        // },
        {
          /** 个人中心 **/
          // path: '/system',
          // name: 'system',
          // component: () => import('../views/system/system-index.js'),
          // meta: { title: '', isBack: true },
          // children: [
          //   {
          path: '/system',
          name: 'system',
          meta: { title: '', isBack: true },
          component: () => import('../views/system/system-index.js'),
          children: [
            {
              path: 'system-management',
              name: 'system-management',
              meta: { title: '个人中心', isBack: false },
              component: () => import('../views/system/system-management/index.vue'),
            },
          ],
        },
        {
          /** 报警提示 **/
          path: '/alarm',
          name: 'alarm',
          component: () => import('../views/alarm/alarm-index.js'),
          meta: { title: '', isBack: true },
          children: [
            {
              path: 'alarm-management',
              name: 'alarm-management',
              meta: { title: '报警提示', isBack: false },
              component: () => import('../views/alarm/alarm-management/index.vue'),
            },
            {
              path: 'list',
              name: 'list',
              meta: { title: '报警提示', isBack: false },
              component: () => import('../views/alarm/alarm-management/list/index.vue'),
            },
            {
              path: 'detail',
              name: 'detail',
              meta: { title: '告警详情', isBack: false },
              component: () => import('../views/alarm/alarm-management/detail/index.vue'),
            },
          ],
        },

        // 签名
        {
          path: '/signature',
          name: 'signature',
          meta: { title: '个性签名', isBack: true },
          component: () => import('../views/signature/index.vue'),
        },

        //
      ],
    },
    {
      path: '/test',
      name: 'test',
      // component: () => import('../views/test.vue'),
    },
    {
      /** 进度管理 **/
      path: '/progress',
      name: 'progress',
      component: () => import('../views/progress/progress-index.vue'),
      meta: { title: '', isBack: false },
      children: [
        {
          path: 'plan',
          name: 'progress-plan',
          meta: { title: '进度计划', isBack: false },
          component: () => import('../views/progress/progress-plan.vue'),
        },
        {
          path: 'query',
          name: 'progress-query',
          meta: { title: '进度查询', isBack: false },
          component: () => import('../views/progress/progress-query.vue'),
        },
      ],
    },
    {
      /** 施工日志 **/
      path: '/log',
      name: 'log',
      meta: { title: '施工日志', isBack: false },
      component: () => import('../views/log/log-index.vue'),
      children: [
        {
          path: 'index',
          name: 'log-index',
          meta: { title: '施工日志', isBack: false },
          component: () => import('../views/log/index.vue'),
        },
        {
          path: 'entry',
          name: 'log-entry',
          meta: { title: '施工日志', isBack: false },
          component: () => import('../views/log/components/log-entry.vue'),
        },
        {
          path: 'construction-log',
          name: 'construction-log',
          meta: { title: '施工日志填报', isBack: false },
          component: () => import('../views/log/construction-log.vue'),
        },
        {
          path: 'log-history',
          name: 'log-history',
          meta: { title: '历史记录', isBack: false },
          component: () => import('../views/log/log-history.vue'),
        },
        {
          path: 'history',
          name: 'history',
          meta: { title: '历史记录', isBack: false },
          component: () => import('../views/log/history.vue'),
        },
      ],
    },
    {
      /** 施工日志 **/
      path: '/notice',
      name: 'notice',
      meta: { title: '施工日志', isBack: false },
      component: () => import('../views/log/log-index.vue'),
      children: [
        {
          path: 'index',
          name: 'notice-index',
          meta: { title: '施工日志', isBack: false },
          component: () => import('../views/notice/index.vue'),
        },
      ],
    },
  ],
});

export default router;
