<template>
  <div class="table-tree-container">
    <div class="list-tree-wrapper">
      <div class="list-tree-operator">
        <t-input v-model="filterText" :placeholder="$t('pages.listTree.placeholder')" @change="onInput">
          <template #suffix-icon>
            <search-icon size="var(--td-comp-size-xxxs)" />
          </template>
        </t-input>
        <div style="padding-top: 5px">
          <t-button theme="primary" @click="selectInvert">反选</t-button>
        </div>
        <t-tree
          ref="tree"
          v-model="allChecked"
          :data="tree_data_xyy"
          value-mode="parentFirst"
          hover
          expand-on-click-node
          :default-expanded="expanded"
          :expand-level="1"
          :filter="filterByText"
          :checkable="true"
          @change="onChange"
          @click="onClick"
        />
      </div>
      <div class="list-tree-content">
        <!-- <common-table />   http://service-bv448zsw-1257786608.gz.apigw.tencentcs.com/api/upload-demo-->
        <div style="float: left; display: flex; align-items: center; gap: 10px">
          <t-radio-group
            style="flex: 1; min-width: 200px"
            variant="primary-filled"
            default-value="1"
            @change="radioChange"
          >
            <t-radio-button value="1">公开</t-radio-button>
            <t-radio-button value="2">仅部门</t-radio-button>
            <t-radio-button value="3">个人</t-radio-button>
          </t-radio-group>
          <t-tag-input
            style="flex: 1; min-width: 330px"
            v-model="tags"
            placeholder="最多 3 个标签，输入后回车生成"
            :auto-width="true"
            :max="3"
            @enter="onEnter"
            @input-change="onTagChange"
            :onRemove="handleRemove"
            :onClear="handleClear"
          />
          <t-link
            style="flex: 1; min-width: 45px; padding-right: 10px; margin-right: 20px;"
            theme="primary"
            underline
            href="https://smallpdf.com/cn/compress-pdf"
            target="_blank"
          >
            <template #prefix-icon>
              <link-icon />
            </template>
            压缩PDF
          </t-link>
        </div>
        <t-upload
          v-model="files"
          action="http://10.0.2.110/api/upload"
          :headers="customHeaders"
          placeholder="格式限PDF, 单次限制 5 份文件"
          theme="file-flow"
          accept="application/pdf"
          multiple
          :data="checkTree"
          :disabled="false"
          :abridge-name="ABRIDGE_NAME"
          :auto-upload="false"
          :max="5"
          :size-limit="{ size: 20, unit: 'MB' }"
          :show-thumbnail="false"
          :allow-upload-duplicate-file="false"
          :is-batch-upload="false"
          :upload-all-files-in-one-request="false"
          :format-response="formatResponse"
        >
        </t-upload>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ListTree',
};
</script>

<script setup lang="ts">
import { SearchIcon } from 'tdesign-icons-vue-next';
import { LinkIcon } from 'tdesign-icons-vue-next';
import type { TreeNodeModel } from 'tdesign-vue-next';
import { MessagePlugin, TagInputProps, TreeInstanceFunctions, UploadProps } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';

import { getCataList } from '@/api/list';
import { useUserStore } from '@/store';
// import CommonTable from '@/components/common-table/index.vue';
// import { TREE_DATA } from './constants';

const filterByText = ref();
const filterText = ref();
const user = useUserStore();
const { token } = user;
const expanded = ['0', '0-0', '0-1', '0-2', '0-3', '0-4'];
const customHeaders: { [key: string]: string } = {
  Authorization: `Bearer ${token}`,
  // 'Content-Type': 'multipart/form-data',
};
const onInput = () => {
  filterByText.value = (node: TreeNodeModel) => {
    return node.label.indexOf(filterText.value) >= 0;
  };
};
const tags = ref([]);
interface TagInputRemoveContext {
  value: Array<string | number>;
  index: number;
  item: string | number;
  e?: MouseEvent | KeyboardEvent;
  trigger: 'tag-remove' | 'backspace';
}

const handleRemove = (context: TagInputRemoveContext) => {
  const { index, item, trigger } = context;
  // 打印删除的触发方式以及被删除的标签
  console.log(`触发方式: ${trigger}, 删除的标签: ${item}`);

  // 删除指定索引的标签
  if (index >= 0 && index < checkTree.value.tags.length) {
    checkTree.value.tags.splice(index, 1);
    tags.value = checkTree.value.tags;
  }

  // 如果你需要在这里同步其他操作，可以在此处处理
  console.log('更新后的 tags:', checkTree.value.tags);
};

const handleClear = () => {
  checkTree.value.tags = [];
  tags.value = [];
  console.log('所有标签已清除');
};

const onTagChange = (value: any) => {
  const maxChars = 10;

  // 检查当前输入的字符数
  if (value.length > maxChars) {
    MessagePlugin.warning('每个标签最多只能输入 10 个字符!');
    // 截断输入值至最大字符数
    // value = value.slice(0, maxChars);
  }

  // 返回截断后的值以限制输入
  return value;
  // if (value.length >= 3) {
  //   value = value.slice(0, 3);
  //   MessagePlugin.warning('最多只能输入 20 个字符!');
  // }
  // console.log('value', value);
};
const onEnter: TagInputProps['onEnter'] = (value, { inputValue }) => {
  console.log(inputValue);
  const maxLength = 10;
  // checkTree.value.tags = value;
  checkTree.value.tags = value.map((tag) => (String(tag).length > maxLength ? String(tag).slice(0, maxLength) : tag));
  tags.value = value.map((tag) => (String(tag).length > maxLength ? String(tag).slice(0, maxLength) : tag));
  console.log(checkTree.value);
  if (value.length >= 3 && inputValue) {
    MessagePlugin.warning('最多只能输入 3 个标签!');
  }
};
// const StatusDic = ref({ success: '上传成功', fail: '上传失败', progress: '上传中', waiting: '等待上传' });
const files = ref<UploadProps['value']>([]);
const ABRIDGE_NAME: UploadProps['abridgeName'] = [10, 7];
const tree = ref<TreeInstanceFunctions>();
const tree_data_xyy = ref([]);
const checkTree = ref({ user: '', treee: [], tags: [], attribute: '0' });
const allChecked = ref([]);
const valueMode = ref('parentFirst');
// const valueOptions = ref([
//   {
//     value: 'onlyLeaf',
//     label: 'onlyLeaf',
//   },
//   {
//     value: 'parentFirst',
//     label: 'parentFirst',
//   },
//   {
//     value: 'all',
//     label: 'all',
//   },
// ]);
const radioChange = (value: any) => {
  checkTree.value.attribute = value;
  console.log(checkTree.value);
};

const formatResponse: UploadProps['formatResponse'] = (res) => {
  if (!res) {
    return {
      status: 'fail',
      error: '上传失败，原因：文件过大或网络不通',
    };
  }
  return res;
};
const onClick = (context: { node: any }) => {
  console.info('onClick context:', context);
  const { node } = context;
  console.info(node.value, 'onClick context.node.checked:', node.checked);
};
const onChange = (checked: any, context: { node: any }) => {
  console.info('onChange checked:', checked, 'context:', context);
  checkTree.value.treee = checked;
  const { node } = context;
  console.info(node.value, 'onChange context.node.checked:', node.checked);
};
const selectInvert = () => {
  // 取得所有节点
  const items = tree.value.getItems();
  const revertSelection: any[] = [];
  items.forEach((item) => {
    if (!item.checked && !item.indeterminate) {
      // checked 为 true, 为直接选中状态
      // indeterminate 为 true, 为半选状态
      revertSelection.push(item.value);
    }
  });
  //console.log("反选：",revertSelection)
  allChecked.value = revertSelection;
};

const load = async () => {
  try {
    const { list } = await getCataList();
    console.log('夏一扬: ', user.number);
    checkTree.value.user = user.number;
    tree_data_xyy.value = list;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  load();
});
</script>

<style lang="less" scoped>
.table-tree-container {
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium);

  .t-tree {
    margin-top: var(--td-comp-margin-xxl);
  }
}

.list-tree-wrapper {
  overflow-y: hidden;
}

.list-tree-operator {
  width: 380px;
  float: left;
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);
}

.list-tree-content {
  border-left: 1px solid var(--td-border-level-1-color);
  padding: 32px;
  overflow: auto;
}
</style>
