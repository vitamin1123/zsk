import { number } from 'echarts';

import type { AddCataRequest, CardListResult, CataListResult, CataModel, CataResult, ChangeCataStateRequest, ListResult, ModCataRequest, OrgListResult, ResResult, RUpListResult, UserListResult } from '@/api/model/listModel';
import { request } from '@/utils/request';

const Api = {
  CataList: `/get-list-tree?t_${new Date().getTime()}`,
  OrgList: `/get-org-list?t_${new Date().getTime()}`,
  BaseList: `/get-list?t_${new Date().getTime()}`,
  CardList: `/get-card-list?t_${new Date().getTime()}`,
  DelDoc: `/del-doc-by-id?t_${new Date().getTime()}`,
  RUpList: `/get-recent-up?t_${new Date().getTime()}`,
  SearchUserList: `/search-user-list?t_${new Date().getTime()}`,
  ShareList: `/get-share-list?t_${new Date().getTime()}`,
  MyUp: `/get-my-up?t_${new Date().getTime()}`,
  AddCata: '/add_cata',
  ModCata: '/mod_cata',
  ChangeCataState: '/change_cata_state',
};

export function getList() {
  return request.get<ListResult>({
    url: Api.BaseList,
  });
}

export function getMyUpList(id: string) {
  return request.post<CardListResult>(
    {
      url: Api.MyUp,
      params: { id },
    },
    {
      joinParamsToUrl: false,
    },
  );
}

export function getRecentUpList(id: number) {
  return request.post<RUpListResult>(
    {
      url: Api.RUpList,
      params: { id },
    },
    {
      joinParamsToUrl: false,
    },
  );
}

export function getShareList(id: string, type: string) {
  return request.post<RUpListResult>(
    {
      url: Api.ShareList,
      params: { id, type },
    },
    {
      joinParamsToUrl: false,
    },
  );
}

// export function getCardList() {
//   return request.get<CardListResult>({
//     url: Api.CardList,
//   });
// }
export function getCardList(sw: string, st: number, dept: string, user: string, tags: Array<string>, cata: string) {
  return request.post<CardListResult>(
    {
      url: Api.CardList,
      params: { sw, st, dept, user, tags, cata },
    },
    // post json body data here (optional)

    {
      joinParamsToUrl: true,
    },
  );
}

export function delDocById(sw: string) {
  return request.post<ResResult>(
    {
      url: Api.DelDoc,
      params: { sw },
    },
    // post json body data here (optional)
    {
      joinParamsToUrl: false,
    },
  );
}

export function getOrgList() {
  return request.get<OrgListResult>({
    url: Api.OrgList,
  });
}

export function searchUserList(sw: string) {
  return request.post<UserListResult>(
    {
      url: Api.SearchUserList,
      params: { sw },
    },
    {
      joinParamsToUrl: false,
    },
  );
}

export function getCataList() {
  return request.get<CataListResult>({
    url: Api.CataList,
  });
}

// 获取目录列表（用于目录管理页面）
export function getCataManageList() {
  return request.get<CataResult>({
    url: Api.BaseList,
  });
}

// 新增目录
export function addCata(data: AddCataRequest) {
  return request.post<ResResult>({
    url: Api.AddCata,
    data,
  });
}

// 修改目录
export function modCata(data: ModCataRequest) {
  return request.post<ResResult>({
    url: Api.ModCata,
    data,
  });
}

// 变更目录状态
export function changeCataState(data: ChangeCataStateRequest) {
  return request.post<ResResult>({
    url: Api.ChangeCataState,
    data,
  });
}


