<template>
  <div>
    <div style="margin-bottom: 10px; text-align: right; display: flex; align-items: center">
      <t-tag
        v-for="(tag, index) in tags"
        :key="index"
        theme="primary"
        closable
        style="height: 30px; display: flex; align-items: center"
        @close="handleClose(index)"
      >
        {{ tag.name }}
      </t-tag>
      <t-radio-group v-model="selectedValue" variant="default-filled" style="margin-left: 10px" @change="radioChange">
        <t-radio-button v-for="option in options" :key="option.value" :value="option.value" allow-uncheck>
          {{ option.label }}
        </t-radio-button>
      </t-radio-group>
    </div>
    <!-- <div class="list-card-operation">
      <div class="search-input">
        <t-tree-select
          v-model="mulValue"
          :data="options"
          multiple
          clearable
          filterable
          placeholder="请选择模块"
          :tree-props="treeProps"
          :on-change="onTreeChange"
        >
          <template #valueDisplay="{ value: valueDisplay, onClose }">
            <t-tag v-for="(item, index) in valueDisplay" :key="index" closable :on-close="() => onClose(index)">
              {{ item.label }}({{ item.value }})
            </t-tag>
          </template>
        </t-tree-select>
      </div>
    </div> -->
    <dialog-form v-model:visible="formDialogVisible" :data="formData" />

    <template v-if="pagination.total > 0 && !dataLoading">
      <div>
        <div class="list-card-items">
          <t-row :gutter="[16, 16]">
            <t-col v-for="product in productList" :key="product.index" :lg="4" :xs="6" :xl="3">
              <product-card
                class="list-card-item"
                :product="product"
                @delete-item="handleDeleteItem"
                @manage-product="handleManageProduct"
                @tag-selected="handleTagSelected"
              />
            </t-col>
          </t-row>
        </div>
        <div class="list-card-pagination">
          <t-pagination
            v-model="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-size-options="[10]"
            :show-page-number="false"
            :show-page-size="true"
            @page-size-change="onPageSizeChange"
            @current-change="onCurrentChange"
          />
        </div>
      </div>
    </template>

    <div v-else-if="dataLoading" class="list-card-loading">
      <t-loading size="large" text="加载数据中..." />
    </div>
    <t-notification
      v-if="show"
      theme="info"
      title="不可以删除"
      content="不是本人创建的文档"
      :duration="1000"
      @duration-end="show = false"
    />
    <t-dialog
      v-model:visible="confirmVisible"
      header="确认删除所选文档？"
      :body="confirmBody"
      :on-cancel="onCancel"
      @confirm="onConfirmDelete"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: 'ListCard',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin, TreeSelectProps } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { delDocById, getCardList } from '@/api/list';
import { getCataList } from '@/api/list';
import type { CardProductType } from '@/components/product-card/index.vue';
import ProductCard from '@/components/product-card/index.vue';
import { useSwStore } from '@/store';
import { useUserStore } from '@/store';
import { useTagsStore } from '@/store';
import { useCataStore, useOwnerStore } from '@/store';

import type { FormData } from './components/DialogForm.vue';
import DialogForm from './components/DialogForm.vue';

const treeProps = ref({
  'value-mode': 'parentFirst',
});
const cataStore = useCataStore();
const tagsStore = useTagsStore();
const show = ref(false);
const OwnerStore = useOwnerStore();
const swStore = useSwStore();
const user = useUserStore();
const cardSw = ref('');
const mulValue = ref([]);
const options = ref([]);
const selectedValue = ref(null);
const tags = ref([]);
const handleClose = (index: number) => {
  console.log(index);
  tags.value.splice(index, 1);
  OwnerStore.owner = '';
  fetchData(swStore.sw ? swStore.sw : 'all', 0, '', OwnerStore.owner, tagsStore.tags, cataStore.cata);
};
const INITIAL_DATA: FormData = {
  name: '',
  status: '',
  description: '',
  type: '0',
  mark: '',
  amount: 0,
};
const route = useRoute();
const pagination = ref({ current: 1, pageSize: 10, total: 0 });
const deleteProduct = ref(undefined);

const productList = ref([]);
const dataLoading = ref(true);

const radioChange = async (value: any) => {
  console.log('radioChange:', value);
  selectedValue.value = value;
  cataStore.cata = value;
  pagination.value.current = 1;
  if (typeof value === 'undefined') {
    fetchData(swStore.sw ? swStore.sw : 'all', 0, '', OwnerStore.owner, tagsStore.tags, '');
  } else {
    fetchData(swStore.sw ? swStore.sw : 'all', 0, '', OwnerStore.owner, tagsStore.tags, value);
  }
  // fetchData(swStore.sw, 0, '', user.number, tagsStore.tags);
};
// const onTreeChange = () => {
//   console.info('onChange checked:', mulValue);
//   // checkTree.value.treee = checked;
//   // const { node } = context;
//   // console.info(node.value, 'onChange context.node.checked:', node.checked);
// };
const handleTagSelected = () => {
  // 根据选中的 tag 进行查询，更新 productList
  console.log('选中的 tag:', tagsStore.tags, swStore.sw);
  pagination.value.current = 1;
  fetchData(swStore.sw ? swStore.sw : 'all', 0, '', OwnerStore.owner, tagsStore.tags, cataStore.cata);
  // searchProductsByTag(selectedTag);
};
const onTreeChange = (checked: any, context: { node: any }) => {
  console.info('onChange checked:', checked, mulValue.value);
  // fetchData(cardSw.value, 0, checked);
  // checkTree.value.treee = checked;
  // const { node } = context;
  // console.info(node.value, 'onChange context.node.checked:', node.checked);
};
watch(
  () => swStore.sw,
  (newValue, oldValue) => {
    console.log('明细页面的：', newValue);
    if (newValue !== oldValue && newValue.length > 0) {
      cardSw.value = newValue;
      fetchData(newValue, 0, '', OwnerStore.owner, tagsStore.tags, cataStore.cata);
    }
  },
);
watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith('/list/card')) {
      selectedValue.value = null;
      nextTick(() => {
        const { owner, ownerName } = route.query;
        OwnerStore.owner = owner ? owner.toString() : '';
        if (ownerName !== undefined) {
          tags.value = [
            {
              name: ownerName.toString(),
            },
          ];
        }
        console.log('ope 参数:', owner, ownerName);
        if (owner !== undefined) {
          fetchData('', 0, '', OwnerStore.owner, tagsStore.tags, cataStore.cata);
        } else {
          fetchData(swStore.sw ? swStore.sw : 'all', 0, '', OwnerStore.owner, tagsStore.tags, cataStore.cata);
        }
      });
    }
  },
  { immediate: true }, // 初始化时也执行一次
);

const fetchData = async (newValue: string, st: number, dept: any, user: any, tags: any[], cata: string) => {
  try {
    console.log('执行了fetch');
    const { list } = await getCardList(newValue, st, dept, user, tags, cata);
    productList.value = list;
    console.log('分页：', list.length > 0 ? parseInt(list[0].banner, 10) : 0, list);
    pagination.value = {
      ...pagination.value,
      total: list.length > 0 ? parseInt(list[0].banner, 10) : 0,
    };
  } catch (e) {
    console.log(e);
  } finally {
    dataLoading.value = false;
  }
};

const confirmBody = computed(() =>
  deleteProduct.value
    ? `确认删除后的${deleteProduct.value.name.replace(/<\/?[^>]+(>|$)/g, '')}将被删除, 且无法恢复`
    : '',
);

const load = async () => {
  try {
    const { list } = await getCataList();
    // console.log('夏一扬: ', user.number);
    // checkTree.value.user = user.number;
    options.value = list;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  cardSw.value = swStore.sw;
  console.log('usernumber: ', user.number);
  // fetchData(swStore.sw ? swStore.sw : 'all', 0, '', OwnerStore.owner, tagsStore.tags, cataStore.cata);
  load();
});

const formDialogVisible = ref(false);

const confirmVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

const onPageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.current = 1;
};
const onCurrentChange = (current: number) => {
  pagination.value.current = current;
  console.log('分页: ', current);
  fetchData(
    cardSw.value ? cardSw.value : 'all',
    (current - 1) * 10,
    '',
    OwnerStore.owner,
    tagsStore.tags,
    cataStore.cata === null ? '' : cataStore.cata,
  );
};
const handleDeleteItem = (product: CardProductType) => {
  confirmVisible.value = true;
  console.log('删的啥玩意儿：', productList.value);
  deleteProduct.value = product;
};
const onConfirmDelete = async () => {
  // console.log('确认删除的时候：', deleteProduct.value.owner, user.number, deleteProduct.value.owner !== user.number);
  if (deleteProduct.value.owner !== user.number) {
    MessagePlugin.warning('非本人创建文档。');
    confirmVisible.value = false;
  } else {
    const { index } = deleteProduct.value;
    console.log('删除的index：', index, deleteProduct.value.name.replace(/<\/?[^>]+(>|$)/g, ''));
    await delDocById(deleteProduct.value.name.replace(/<\/?[^>]+(>|$)/g, ''));
    // await fetchData(cardSw.value);
    // const newList = [...productList.value];
    // newList.splice(index, 1);
    productList.value.splice(index, 1);
    console.log('删除后数组：', productList.value);
    confirmVisible.value = false;
    MessagePlugin.success('删除成功');
  }
};
const onCancel = () => {
  deleteProduct.value = undefined;
  formData.value = { ...INITIAL_DATA };
};
const handleManageProduct = (product: CardProductType) => {
  console.log('分享: ', product.owner);
  if (product.owner !== user.number) {
    MessagePlugin.warning('非本人创建的文档不可分享。');
    return;
  }
  if (product.attr === '1') {
    MessagePlugin.warning('公开文档无需共享。');
    return;
  }
  formDialogVisible.value = true;
  formData.value = {
    name: product.name.replace(/<\/?[^>]+(>|$)/g, ''),
    status: product?.isSetup ? '1' : '0',
    description: product.description,
    type: product.type.toString(),
    mark: '',
    amount: 0,
  };
};
</script>

<style lang="less" scoped>
.list-card {
  height: 100%;

  &-operation {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--td-comp-margin-xxl);

    .search-input {
      width: 360px;
    }
  }

  &-item {
    padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingTB-xl);

    :deep(.t-card__header) {
      padding: 0;
    }

    :deep(.t-card__body) {
      padding: 0;
      margin-top: var(--td-comp-margin-xxl);
      margin-bottom: var(--td-comp-margin-xxl);
    }

    :deep(.t-card__footer) {
      padding: 0;
    }
  }

  &-pagination {
    padding: var(--td-comp-paddingTB-xl) var(--td-comp-paddingTB-xl);
  }

  &-loading {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
