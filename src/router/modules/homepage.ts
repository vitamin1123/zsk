import { DashboardIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/numberone',
    name: 'dashboard',
    meta: {
      title: {
        zh_CN: '主页',
        en_US: 'Dashboard',
      },
      icon: shallowRef(DashboardIcon),
      orderNo: 0,
    },
    children: [
      // {
      //   path: 'detail',
      //   name: 'DashboardDetail',
      //   component: () => import('@/pages/dashboard/detail/index.vue'),
      //   meta: {
      //     title: {
      //       zh_CN: '虚假的首页',
      //       en_US: 'Dashboard Detail',
      //     },
      //   },
      // },
      {
        path: 'numberone',
        name: 'DashboardNumberOne',
        component: () => import('@/pages/dashboard/numberone/index.vue'),
        meta: {
          title: {
            zh_CN: '首页',
            en_US: 'Dashboard Page 1',
          },
        },
      },
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/dashboard/base/index.vue'),
        meta: {
          title: {
            zh_CN: '动态',
            en_US: 'Overview',
          },
        },
      },
    ],
  },
];
