export interface ListResult {
  list: Array<ListModel>;
}
export interface ListModel {
  adminName: string;
  amount: string;
  contractType: number;
  index: number;
  name: string;
  no: string;
  paymentType: number;
  status: number;
  updateTime: Date;
}

export interface CardListResult {
  list: Array<CardList>;
}
export interface CardList {
  banner: string;
  description: string;
  index: number;
  isSetup: boolean;
  name: string;
  type: number;
  tags: Array<string>;
  cata: Array<string>;
  attr: string;
  isShare: boolean;
  cataId: string;
}

export interface RUpListResult {
  list: Array<RUpList>;
}
export interface RUpList {
  productName: String;
  growUp: String;
  count: String;
}

export interface OrgListResult {
  list: Array<OrgList>;
}
export interface OrgList {
  label: string;
  value: string;
  org_num: string;
  org_long_num: string;
  disabled: boolean;
  children: [];
}

export interface UserListResult {
  list: Array<UserList>;
}
export interface UserList {
  number: string;
  name: string;
}

export interface CataListResult {
  list: Array<CataList>;
}
export interface CataList {
  label: string;
  value: string;
  status: string;
  children: [];
}

export interface UserInfoResult {
  code: string;
  message: string;
  data: {
    code: string;
    token: string;
    name: string;
  };
}

export interface ResResult {
  code: number;
  success: boolean;
  message: string;
}

export interface UpListResult {
  list: Array<CataList>;
}
export interface UpNumList {
  name: string;
  ope: string;
  total_upload_count: number;
  this_month_upload_count: number;
}

// 目录相关接口定义
export interface CataModel {
  id?: number;
  name: string;
  code: string;
  isdisabled: number;
  last_updater: string;
  last_time: Date;
}

export interface CataResult {
  list: Array<CataModel>;
}

export interface AddCataRequest {
  name: string;
  code: string;
  last_updater: string;
}

export interface ModCataRequest {
  id: number;
  name: string;
  code: string;
  last_updater: string;
}

export interface ChangeCataStateRequest {
  code: number;
  isdisabled: number;
}
