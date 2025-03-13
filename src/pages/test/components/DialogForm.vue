<template>
  <t-dialog v-model:visible="formVisible" header="修改" :width="680" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item label="文档" name="name">
          <t-input v-model="formData.name" :style="{ width: '480px' }" :disabled="true" />
        </t-form-item>
        <!-- <t-form-item :label="$t('pages.listCard.productStatus')" name="status">
          <t-radio-group v-model="formData.status">
            <t-radio value="0">{{ $t('pages.listCard.productStatusEnum.off') }}</t-radio>
            <t-radio value="1">{{ $t('pages.listCard.productStatusEnum.on') }}</t-radio>
          </t-radio-group>
        </t-form-item> -->
        <!-- <t-form-item :label="$t('pages.listCard.productDescription')" name="description">
          <t-input v-model="formData.description" :style="{ width: '480px' }" />
        </t-form-item> -->
        <t-form-item label="属性" name="attr">
          <t-select v-model="formAttr" style="width: 480px; display: inline-block" @change="onAttrChange">
            <t-option key="1" label="公开" value="1" />
            <t-option key="2" label="部门" value="2" />
            <t-option key="3" label="个人" value="3" />
          </t-select>
          <!-- <t-select :v-model="sDept" clearable :style="{ width: '480px' }">
            <t-option v-for="(item, index) in SELECT_OPTIONS" :key="index" :value="item.value" :label="item.label">
              {{ item.label }}
            </t-option>
          </t-select> -->
        </t-form-item>
        <t-form-item label="分类" name="cata">
          <t-select
            v-model="formCata"
            style="width: 480px; display: inline-block"
            :clearable="true"
            @change="onCataChange"
          >
            <t-option v-for="item in cataArray" :key="item.value" :value="item.value" :label="item.label"></t-option>
          </t-select>
          <!-- <t-select :v-model="sUser" clearable :style="{ width: '480px' }">
            <t-option v-for="(item, index) in SELECT_OPTIONS" :key="index" :value="item.value" :label="item.label">
              {{ item.label }}
            </t-option>
          </t-select> -->
        </t-form-item>
        <t-form-item label="标签" name="tags">
          <t-tag-input
            style="width: 480px; display: inline-block"
            v-model="tags"
            placeholder="最多 3 个标签，输入后回车生成"
            :auto-width="true"
            :max="3"
            @enter="onTagEnter"
            @input-change="onTagChange"
            :onRemove="handleRemove"
            :onClear="handleClear"
          />
        </t-form-item>
        <t-form-item label="重传更新" name="reUpload">
          <t-upload
            v-model="files"
            accept="application/pdf"
            :headers="customHeaders"
            :before-upload="beforeUpload"
            :auto-upload="false"
            :theme="display"
            :data="upData"
            :abridge-name="[10, 8]"
            :format-response="formatResponse"
            draggable
            :size-limit="{ size: 10, unit: 'MB' }"
            action="http://10.0.2.110/api/re_upload"
          />
        </t-form-item>
        <!-- <t-form-item :label="$t('pages.listCard.productRemark')" name="mark">
          <t-textarea v-model="textareaValue" :style="{ width: '480px' }" name="description" />
        </t-form-item> -->
        <t-form-item style="float: right">
          <t-button variant="outline" @click="onClickCloseBtn">取消</t-button>
          <t-button theme="primary" type="submit">确定</t-button>
        </t-form-item>
      </t-form>
    </template>
  </t-dialog>
</template>

<script setup lang="ts">
import axios from 'axios';
import { FormRules, MessagePlugin, SelectProps, SubmitContext, TagInputProps, UploadProps } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { onMounted, ref, watch } from 'vue';

import { useUserStore } from '@/store';

const user = useUserStore();
const { token } = user;

import { getCataList, searchUserList } from '@/api/list';

export interface FormData {
  cataId: string;
  name: string;
  attr: string;
  description: string;
  cata: string;
  mark: string;
  amount: number;
}

const files = ref<UploadProps['value']>([]);
const display = ref<UploadProps['theme']>('file');
const formAttr = ref('1');
const cataArray = ref([]);
const formCata = ref('');
const sUser = ref('');
const sTime = ref('');
const tags = ref([]);
const sDeptvalue = ref([]);
const sDeptoptions = ref([]);
const sUseroptions = ref([]);
const loading = ref(false);
const upData = ref({ user: user.number, filename: '', tags: [], attribute: '0', cata: '' });
function getCurrentDate(needTime = false) {
  const d = new Date();
  let month = d.getMonth() + 1;
  month = month < 10 ? Number(`0${month}`) : month;
  const date = `${d.getFullYear()}-${month}-${d.getDate()}`;
  const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
  if (needTime) return [date, time].join(' ');
  return date;
}

function formatResponse(res: any) {
  // 响应结果添加上传时间字段，用于 UI 显示
  res.uploadTime = getCurrentDate();
  return res;
}
// let sDeptoptions: TreeSelectProps['data'] = [];
const treeProps = ref({
  'value-mode': 'parentFirst',
  checkStrictly: true,
});

const customHeaders: { [key: string]: string } = {
  Authorization: `Bearer ${token}`,
  // 'Content-Type': 'multipart/form-data',
};

const INITIAL_DATA: FormData = {
  name: '',
  cataId: '',
  description: '',
  attr: '',
  cata: '',
  amount: 0,
  mark: '',
};

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  data: Object as PropType<FormData>,
});
const formVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });
const textareaValue = ref('');

const onAttrChange: SelectProps['onChange'] = (value) => {
  console.log('onAttrChange:', value);
  upData.value.attribute = value.toString();
};
interface TagInputRemoveContext {
  value: Array<string | number>;
  index: number;
  item: string | number;
  e?: MouseEvent | KeyboardEvent;
  trigger: 'tag-remove' | 'backspace';
}

const onCataChange: SelectProps['onChange'] = (value) => {
  console.log('onCataChange:', value);
  upData.value.cata = value.toString();
};

const handleRemove = (context: TagInputRemoveContext) => {
  const { index, item, trigger } = context;
  // 打印删除的触发方式以及被删除的标签
  console.log(`触发方式: ${trigger}, 删除的标签: ${item}`);

  // 删除指定索引的标签
  if (index >= 0 && index < upData.value.tags.length) {
    upData.value.tags.splice(index, 1);
    tags.value = upData.value.tags;
  }

  // 如果你需要在这里同步其他操作，可以在此处处理
  console.log('更新后的 tags:', upData.value.tags);
};

const handleClear = () => {
  upData.value.tags = [];
  tags.value = [];
  console.log('所有标签已清除');
};

const onTagChange = (value: any) => {
  const maxChars = 10;

  // 检查当前输入的字符数
  if (value.length > maxChars) {
    MessagePlugin.warning('每个标签最多只能输入 10 个字符!');
  }

  // 返回截断后的值以限制输入
  return value;
};

const onTagEnter: TagInputProps['onEnter'] = (value, { inputValue }) => {
  console.log('tags怎么了？', value);
  const maxLength = 10;
  // checkTree.value.tags = value;
  upData.value.tags = value.map((tag) => (String(tag).length > maxLength ? String(tag).slice(0, maxLength) : tag));
  tags.value = value.map((tag) => (String(tag).length > maxLength ? String(tag).slice(0, maxLength) : tag));
  if (value.length >= 3 && inputValue) {
    MessagePlugin.warning('最多只能输入 3 个标签!');
  }
};

const beforeUpload = (file: any) => {
  const validExtensions = ['pdf', 'doc', 'docx']; // 合法的文件后缀
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop().toLowerCase();
  if (!validExtensions.includes(fileExtension)) {
    // 显示提示信息
    MessagePlugin.warning('仅支持上传 pdf格式的文件');
    return false; // 阻止文件上传
  }
  if (fileName !== formData.value.name) {
    // 显示提示信息
    MessagePlugin.warning('重传的文件要和原文件同名');
    return false; // 阻止文件上传
  }

  // 如果校验通过，允许上传
  return true;
};

const onSubmit = async ({ validateResult, firstError }: SubmitContext) => {
  if (!firstError) {
    console.log('name: ', formData.value.name);
    // 提交表单数据
    MessagePlugin.success('已提交');
    formVisible.value = false;
    try {
      const response = await axios({
        url: `http://10.0.2.110/api/EditDoc`, // 请求文件流的后端接口
        method: 'POST',
        responseType: 'json',
        data: {
          productName: formData.value.name,
          cata: upData.value.cata,
          tags: upData.value.tags,
          attribute: upData.value.attribute,
          user: user.number,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('修改的response： ', response.data.data);
      if (response.data.status === '500') {
        MessagePlugin.warning(response.data.error);
      } else {
        MessagePlugin.success('修改成功!');
        emit('submitSuccess');
      }
    } catch (error) {
      console.error('修改失败', error);
    }
  } else {
    console.log('Errors: ', validateResult);
    MessagePlugin.warning(firstError);
  }
};

const onClickCloseBtn = () => {
  formVisible.value = false;
  formData.value = { ...INITIAL_DATA };
};

const emit = defineEmits(['update:visible', 'submitSuccess']);
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);

const fetchData = async () => {
  // dataLoading.value = true;
  try {
    const { list } = await getCataList();
    cataArray.value = list;
  } catch (e) {
    console.log(e);
  } finally {
    // dataLoading.value = false;
  }
};

watch(
  () => props.visible,
  (val) => {
    formVisible.value = val;
    // formData.value.name = props.data.name;
    if (val) {
      console.log('props.visible: ', val);
      // fetchData();
    }
  },
);

watch(
  () => props.data,
  (val) => {
    formData.value = { ...val };
    formAttr.value = val.attr;
    formCata.value = val.cataId;
    upData.value.cata = val.cataId;
    upData.value.attribute = val.attr === '公开' ? '1' : val.attr === '部门' ? '2' : '3';
    upData.value.tags = val.description.length > 0 ? val.description.split(',') : [];
    tags.value = val.description.length > 0 ? val.description.split(',') : [];
  },
);

onMounted(() => {
  console.log('卡片页面加载');
  fetchData();
});

const rules: FormRules<FormData> = {
  name: [{ required: true, message: '请输入文档名称', type: 'error' }],
};
</script>
