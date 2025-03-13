import { fromByteArray } from 'base64-js';
import { defineStore } from 'pinia';

import { getUserToken } from '@/api/permission';
import { usePermissionStore } from '@/store';
import type { UserInfo } from '@/types/interface';

const InitUserInfo: UserInfo = {
  name: '', // 用户名，用于展示在页面右上角头像处
  roles: [], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
};

export const useUserStore = defineStore('user', {
  state: () => ({
    token: 'main_token', // 默认token不走权限
    userInfo: { ...InitUserInfo },
    number: '',
  }),
  getters: {
    roles: (state) => {
      return state.userInfo?.roles;
    },
  },
  actions: {
    async login(userInfo: Record<string, unknown>) {
      const xyyLogin = async (userInfo: Record<string, unknown>) => {
        const { account, password } = userInfo;
        console.log(`用户信息:`, account, password);
        this.number = account as string;
        // const encodedPassword = Buffer.from(password).toString('base64url');
        // console.log(`用户信息1 :`, user, encodedPassword);
        const res = await getUserToken(account as string, fromByteArray(new TextEncoder().encode(password as string)));
        console.log('看看结果： ', res.code);
        const resAny: any = res;
        const resTp = {
          code: parseInt(res.code, 10) === 0 ? 200 : 401,
          message:
            // eslint-disable-next-line no-nested-ternary
            parseInt(res.code, 10) === 0 ? '登录成功' : parseInt(res.code, 10) === 401 ? '密码不对' : '登录失败',
          data: resAny.token,
          name: resAny.name,
        };
        // console.log('res', res, res.token);
        return resTp;
      };

      // const mockLogin = async (userInfo: Record<string, unknown>) => {
      //   console.log(`用户信息:`, userInfo);
      //   const { account, password } = userInfo;
      //   if (account !== 'td') {
      //     return {
      //       code: 401,
      //       message: '账号不存在',
      //     };
      //   }
      //   if (['main_', 'dev_'].indexOf(password as string) === -1) {
      //     return {
      //       code: 401,
      //       message: '密码错误',
      //     };
      //   }
      //   const token = {
      //     main_: 'main_token',
      //     dev_: 'dev_token',
      //   }[password];
      //   return {
      //     code: 200,
      //     message: '登录成功',
      //     data: 'main_token',
      //   };
      // };

      const res = await xyyLogin(userInfo);
      if (res.code === 200) {
        this.token = res.data;
        this.userInfo = { name: res.name, roles: ['all'] };
      } else {
        throw res;
      }
    },
    async getUserInfo() {
      // const mockRemoteUserInfo = async (token: string) => {
      //   if (token === 'main_token') {
      //     return {
      //       name: '快乐的员工',
      //       roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
      //     };
      //   }
      //   return {
      //     name: 'td_dev',
      //     roles: ['all'], // 前端权限模型使用 如果使用请配置modules/permission-fe.ts使用
      //   };
      // };
      // const res = await mockRemoteUserInfo(this.token);
      // eslint-disable-next-line no-self-assign
      console.log('getUserInfo: ', this.number);
      // this.userInfo = { ...this.userInfo };
    },
    async logout() {
      this.token = '';
      this.userInfo = { ...InitUserInfo };
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    key: 'user',
    paths: ['token', 'userInfo', 'number'],
  },
});
