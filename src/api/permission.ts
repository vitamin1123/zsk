import type { UserInfoResult } from '@/api/model/listModel';
import type { MenuListResult } from '@/api/model/permissionModel';
import { request } from '@/utils/request';

const Api = {
  MenuList: '/get-menu-list-i18n',
  UserInfo: '/user/login',
};

export function getMenuList(name: string) {
  return request.get<MenuListResult>({
    url: Api.MenuList,
    params: { name }, // 将 name 作为查询参数传递
  });
}

export function getUserToken(name: string, password: string) {
  return request.post<UserInfoResult>(
    {
      url: Api.UserInfo,
      params: { name, password },
    },
    // post json body data here (optional)

    {
      joinParamsToUrl: true,
    },
  );
}
