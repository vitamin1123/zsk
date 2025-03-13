<template>
  <t-space direction="vertical">
    <!-- 按钮操作区域 -->
    <!-- <t-radio-group v-model="reserveSelectedRowOnPaginate" variant="default-filled">
      <t-radio-button :value="true">跨分页选中</t-radio-button>
      <t-radio-button :value="false">当前页选中</t-radio-button>
    </t-radio-group> -->
    <dialog-form v-model:visible="formDialogVisible" :data="formData" @submit-success="ggM" />
    <t-table
      v-model:selected-row-keys="selectedRowKeys"
      row-key="index"
      :data="data"
      :columns="columns"
      :pagination="pagination"
      :reserve-selected-row-on-paginate="true"
      lazy-load
      @page-change="onPageChange"
      @change="onChange"
      @select-change="onSelectChange"
    >
      <template #operation="{ row }">
        <t-link hover="color" theme="primary" @click="rehandleClickOp(row)">
          {{ '编辑' }}
        </t-link>
      </template>
    </t-table>
  </t-space>
</template>
<script setup lang="tsx">
import { CheckCircleFilledIcon, CloseCircleFilledIcon, ErrorCircleFilledIcon } from 'tdesign-icons-vue-next';
import { TableProps, TableRowData } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { getMyUpList } from '@/api/list';

import DialogForm from './DialogForm.vue';

// const statusNameListMap = {
//   0: { label: '审批通过', theme: 'success', icon: <CheckCircleFilledIcon /> },
//   1: { label: '审批失败', theme: 'danger', icon: <CloseCircleFilledIcon /> },
//   2: { label: '审批过期', theme: 'warning', icon: <ErrorCircleFilledIcon /> },
// };
const props = defineProps({
  user: Object,
});
const data = ref([]);
const TOTAL = ref(0);
// for (let i = 0; i < TOTAL; i++) {
//   data.push({
//     index: i + 1,
//     applicant: ['夏一扬', '夏一扬', '朱建国'][i % 3],
//     status: i % 3,
//     channel: ['公开', '部门', '个人'][i % 3],
//     detail: {
//       email: ['w.cezkdudy@lhll.au', 'r.nmgw@peurezgn.sl', 'p.cumx@rampblpa.ru'][i % 3],
//     },
//     matters: ['宣传物料制作费用', 'algolia 服务报销', '相关周边制作费', '激励奖品快递费'][i % 4],
//     time: [2, 3, 1, 4][i % 4],
//     createTime: ['2022-01-01', '2022-02-01', '2022-03-01', '2022-04-01', '2022-05-01'][i % 4],
//   });
// }

const reserveSelectedRowOnPaginate = ref(true);
const selectedRowKeys = ref([]);
const formDialogVisible = ref(false);
const formData = ref(null);
const columns = [
  { colKey: 'index', width: 40, title: '序号' },
  { colKey: 'name', title: '我的文档', width: '150' },
  { colKey: 'description', title: '标签', width: '120' },

  { colKey: 'attr', title: '属性', width: '40' },
  { colKey: 'cata', title: '分类', ellipsis: true, width: '60' },
  { colKey: 'banner', title: '上传时间', width: '60' },
  { colKey: 'cataId', width: '0' },
  {
    colKey: 'operation',
    title: '操作',
    fixed: 'right',
    width: '50',
  },
];

/**
 * 1. 本地分页方式一（非受控用法）：使用 defaultCurrent 和 defaultPageSize 设置默认分页信息，仅第一次有效。
 *
 * 2. 本地分页方式二（受控用法）：使用 current 和 pageSize 设置分页信息，任何时候有效，
 *    此时，注意需要在 onPageChange 中对 pagination.current 和 pagination.pageSize 进行赋值
 * */
const pagination = reactive({
  current: 1,
  pageSize: 7,
  // defaultCurrent: 2,
  // defaultPageSize: 5,
  total: TOTAL,
  showJumper: true,
});
const ggM = async () => {
  const { list } = await getMyUpList(props.user.number);
  console.log('haha-ggM');
  TOTAL.value = list.length;
  data.value = list.map((item: any) => {
    return {
      index: item.index,
      name: item.name,
      description: item.description ? JSON.parse(item.description).join(',') : '',
      attr: item.attr === 1 ? '公开' : item.attr === 2 ? '部门' : '个人',
      cata: item.cata,
      cataId: item.cataId,
      banner: item.banner.slice(0, 10),
    };
  });
};

onMounted(() => {
  console.log('name: ', props.user.userInfo, props.user.number);
  ggM();
});

const onChange = (params: any, context: any) => {
  console.log('change', params, context);
};

const onPageChange = (pageInfo: { current: number; pageSize: number }, context: any) => {
  console.log('page-change', pageInfo, context);
  // 受控用法需要下面两行代码
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
};

const onSelectChange = (selectedRowKeys: any, context: any) => {
  console.log(selectedRowKeys, context);
};

const rehandleClickOp = (context: TableRowData) => {
  console.log(context);
  formData.value = { ...context };
  formDialogVisible.value = true;
};
</script>
