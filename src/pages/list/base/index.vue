<template>
  <div>
    <t-card class="list-card-container" :bordered="false">
      <t-row justify="space-between">
        <div class="left-operation-container">
          <t-button @click="handleAddCata">新建目录</t-button>
          <p v-if="!!selectedRowKeys.length" class="selected-count">
            已选 {{ selectedRowKeys.length }} 项
          </p>
        </div>
        <div class="search-input">
          <t-input v-model="searchValue" placeholder="搜索目录名称、编号或操作人" clearable @input="watchSearchValue">
            <template #suffix-icon>
              <search-icon size="16px" />
            </template>
          </t-input>
        </div>
      </t-row>
      <t-table
        :data="filteredData"
        :columns="COLUMNS"
        :row-key="rowKey"
        vertical-align="top"
        :hover="true"
        :pagination="pagination"
        :selected-row-keys="selectedRowKeys"
        :loading="dataLoading"
        :header-affixed-top="headerAffixedTop"
        @page-change="rehandlePageChange"
        @change="rehandleChange"
        @select-change="(value: number[]) => rehandleSelectChange(value)"
      >
        <template #isdisabled="{ row }">
          <t-tag v-if="row.isdisabled === 4" theme="success" variant="light">
            启用
          </t-tag>
          <t-tag v-else theme="danger" variant="light">
            禁用
          </t-tag>
        </template>
        <template #last_time="{ row }">
          {{ new Date(row.last_time).toLocaleString() }}
        </template>

        <template #op="slotProps">
          <t-space>
            <!-- <t-link theme="primary" @click="handleEditCata(slotProps)">编辑</t-link> -->
            <t-link :theme="slotProps.row.isdisabled === 4 ? 'warning' : 'success'"  @click="handleChangeState(slotProps)">
              {{ slotProps.row.isdisabled === 4 ? '禁用' : '启用' }}
            </t-link>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <t-dialog
      v-model:visible="confirmVisible"
      header="确认变更状态"
      :body="confirmBody"
      :on-cancel="onCancel"
      @confirm="onConfirmDelete"
    />

    <!-- 新建/编辑目录弹窗 -->
    <t-dialog
      v-model:visible="cataDialogVisible"
      :header="isEditMode ? '编辑目录' : '新建目录'"
      width="500px"
      @confirm="handleSaveCata"
    >
      <t-form :data="currentCataData" label-width="100px">
        <t-form-item label="目录名称" name="name">
          <t-input v-model="currentCataData.name" placeholder="请输入目录名称" />
        </t-form-item>
        <t-form-item label="目录编号" name="code">
          <t-input v-model="currentCataData.code" placeholder="请输入目录编号" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ListBase',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin, PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { addCata, changeCataState, getCataManageList, modCata } from '@/api/list';
import type { AddCataRequest, CataModel, ModCataRequest } from '@/api/model/listModel';
import Trend from '@/components/trend/index.vue';
import { prefix } from '@/config/global';
import { CONTRACT_PAYMENT_TYPES, CONTRACT_STATUS, CONTRACT_TYPES } from '@/constants';
import { t } from '@/locales';
import { useSettingStore } from '@/store';

const store = useSettingStore();

const COLUMNS: PrimaryTableCol<TableRowData>[] = [
  { colKey: 'row-select', type: 'multiple', width: 64, fixed: 'left' },
  {
    title: '目录名称',
    align: 'left',
    width: 200,
    colKey: 'name',
    fixed: 'left',
  },
  {
    title: '目录编号',
    width: 160,
    ellipsis: true,
    colKey: 'code',
  },
  {
    title: '状态',
    width: 120,
    colKey: 'isdisabled',
  },
  {
    title: '最后操作人',
    width: 160,
    ellipsis: true,
    colKey: 'last_updater',
  },
  {
    title: '最后更新时间',
    width: 180,
    ellipsis: true,
    colKey: 'last_time',
  },
  {
    title: '操作',
    align: 'left',
    fixed: 'right',
    width: 200,
    colKey: 'op',
  },
];

const data = ref<CataModel[]>([]);
const filteredData = ref<CataModel[]>([]);
const pagination = ref({
  defaultPageSize: 20,
  total: 100,
  defaultCurrent: 1,
});

const searchValue = ref('');

const dataLoading = ref(false);
const fetchData = async () => {
  dataLoading.value = true;
  try {
    const { list } = await getCataManageList();
    data.value = list;
    filteredData.value = list;
    pagination.value = {
      ...pagination.value,
      total: list.length,
    };
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

// 搜索过滤
const handleSearch = () => {
  if (!searchValue.value.trim()) {
    filteredData.value = data.value;
  } else {
    const keyword = searchValue.value.toLowerCase();
    filteredData.value = data.value.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.code.toLowerCase().includes(keyword) ||
      item.last_updater.toLowerCase().includes(keyword)
    );
  }
  pagination.value.total = filteredData.value.length;
};

// 监听搜索值变化
const watchSearchValue = () => {
  handleSearch();
};

const deleteIdx = ref(-1);
const confirmBody = computed(() => {
  if (deleteIdx.value > -1) {
    const { name } = filteredData.value[deleteIdx.value];
    return `确认要变更${name}的状态吗？`;
  }
  return '';
});

// 新建/编辑目录相关
const cataDialogVisible = ref(false);
const isEditMode = ref(false);
const currentCataData = ref<CataModel>({
  name: '',
  code: '',
  isdisabled: 0,
  last_updater: '',
  last_time: new Date(),
});

// 重置目录表单
const resetCataForm = () => {
  currentCataData.value = {
    name: '',
    code: '',
    isdisabled: 0,
    last_updater: '',
    last_time: new Date(),
  };
};

onMounted(() => {
  fetchData();
});

const confirmVisible = ref(false);

const selectedRowKeys = ref<number[]>([]);

const router = useRouter();

const resetIdx = () => {
  deleteIdx.value = -1;
};

const onConfirmDelete = async () => {
  try {
    const item = filteredData.value[deleteIdx.value];
    if (item.id) {
      await changeCataState({
        code: item.id,
        isdisabled: item.isdisabled === 0 ? 1 : 0,
      });
      MessagePlugin.success('状态变更成功');
      fetchData();
    }
  } catch (e) {
    MessagePlugin.error('状态变更失败');
  }
  confirmVisible.value = false;
  resetIdx();
};

const onCancel = () => {
  resetIdx();
};

const rowKey = 'id';

const rehandleSelectChange = (val: number[]) => {
  selectedRowKeys.value = val;
};
const rehandlePageChange = (curr: unknown, pageInfo: unknown) => {
  console.log('分页变化', curr, pageInfo);
};
const rehandleChange = (changeParams: unknown, triggerAndData: unknown) => {
  console.log('统一Change', changeParams, triggerAndData);
};
// 新建目录
const handleAddCata = () => {
  isEditMode.value = false;
  resetCataForm();
  cataDialogVisible.value = true;
};

// 编辑目录
const handleEditCata = (row: { row: CataModel; rowIndex: number }) => {
  isEditMode.value = true;
  currentCataData.value = { ...row.row };
  cataDialogVisible.value = true;
};

// 变更状态
const handleChangeState = async (row: any) => {
  try {
    console.log('handleChangeState: ',row.row.code)
    if (row.row.code) {
      const newState = row.isdisabled === 4 ? 0 : 4; // 切换状态
      await changeCataState({
        code: row.row.code,
        isdisabled: newState,
      });
      MessagePlugin.success('状态变更成功');
      fetchData(); // 刷新数据
    }
  } catch (e) {
    MessagePlugin.error('状态变更失败');
  }
};

// 保存目录
const handleSaveCata = async () => {
  try {
    if (isEditMode.value) {
      if (currentCataData.value.id) {
        await modCata({
          id: currentCataData.value.id,
          name: currentCataData.value.name,
          code: currentCataData.value.code,
          last_updater: currentCataData.value.last_updater,
        });
        MessagePlugin.success('修改成功');
      }
    } else {
      await addCata({
        name: currentCataData.value.name,
        code: currentCataData.value.code,
        last_updater: currentCataData.value.last_updater,
      });
      MessagePlugin.success('新建成功');
    }
    cataDialogVisible.value = false;
    fetchData();
  } catch (e) {
    MessagePlugin.error(isEditMode.value ? '修改失败' : '新建失败');
  }
};

const handleSetupContract = () => {
  handleAddCata();
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);
</script>

<style lang="less" scoped>
.payment-col {
  display: flex;

  .trend-container {
    display: flex;
    align-items: center;
    margin-left: var(--td-comp-margin-s);
  }
}

.list-card-container {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.left-operation-container {
  display: flex;
  align-items: center;
  margin-bottom: var(--td-comp-margin-xxl);

  .selected-count {
    display: inline-block;
    margin-left: var(--td-comp-margin-l);
    color: var(--td-text-color-secondary);
  }
}

.search-input {
  width: 360px;
}
</style>
