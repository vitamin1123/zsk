import { defineStore } from 'pinia';

import type { NotificationItem } from '@/types/interface';

const msgData = [
  {
    id: '123',
    content: '致信补丁已经打上！',
    type: 'OA',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'high',
  },
  {
    id: '124',
    content: 'HR工资自动发放！',
    type: 'HR',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'low',
  },
  {
    id: '125',
    content: '来自朱建国的分享！',
    type: '教程',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'middle',
  },
  {
    id: '126',
    content: '工资代发操作流程！',
    type: '财务',
    status: true,
    collected: false,
    date: '2021-01-01 08:00',
    quality: 'low',
  },
];

type MsgDataType = typeof msgData;

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    msgData,
  }),
  getters: {
    unreadMsg: (state) => state.msgData.filter((item: NotificationItem) => item.status),
    readMsg: (state) => state.msgData.filter((item: NotificationItem) => !item.status),
  },
  actions: {
    setMsgData(data: MsgDataType) {
      this.msgData = data;
    },
  },
  persist: true,
});
