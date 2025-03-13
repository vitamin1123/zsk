<template>
  <t-dialog v-model:visible="formVisible" :header="$t('pages.listCard.share')" :width="680" :footer="false">
    <template #body>
      <!-- 表单内容 -->
      <t-form ref="form" :data="formData" :rules="rules" :label-width="100" @submit="onSubmit">
        <t-form-item :label="$t('pages.listCard.productName')" name="name">
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
        <t-form-item :label="$t('pages.listCard.sDept')" name="type">
          <t-tree-select
            v-model="sDeptvalue"
            :data="sDeptoptions"
            filterable
            multiple
            clearable
            placeholder="选择部门（选了部门就不用选科室）"
            :style="{ width: '480px' }"
            :tree-props="treeProps"
            @change="onDeptTreeChange"
          />
          <!-- <t-select :v-model="sDept" clearable :style="{ width: '480px' }">
            <t-option v-for="(item, index) in SELECT_OPTIONS" :key="index" :value="item.value" :label="item.label">
              {{ item.label }}
            </t-option>
          </t-select> -->
        </t-form-item>
        <t-form-item :label="$t('pages.listCard.sUser')" name="type">
          <t-select
            v-model="sUser"
            filterable
            clearable
            placeholder="搜索用户or工号"
            :loading="loading"
            :options="sUseroptions"
            style="width: 480px; display: inline-block"
            @search="remoteMethod"
          />
          <!-- <t-select :v-model="sUser" clearable :style="{ width: '480px' }">
            <t-option v-for="(item, index) in SELECT_OPTIONS" :key="index" :value="item.value" :label="item.label">
              {{ item.label }}
            </t-option>
          </t-select> -->
        </t-form-item>
        <t-form-item :label="$t('pages.listCard.sTime')" name="type">
          <t-select v-model="sTime" clearable :style="{ width: '480px' }">
            <t-option
              v-model="sTimeSel"
              v-for="(item, index) in STIME_OPTIONS"
              :key="index"
              :value="item.value"
              :label="item.label"
            >
              {{ item.label }}
            </t-option>
          </t-select>
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
import { FormRules, MessagePlugin, SubmitContext } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { ref, watch } from 'vue';

import { useUserStore } from '@/store';

const user = useUserStore();
const { token } = user;

import { getOrgList, searchUserList } from '@/api/list';

export interface FormData {
  name: string;
  status: string;
  description: string;
  type: string;
  mark: string;
  amount: number;
}

const sDept = ref('');
const sUser = ref('');
const sTime = ref('');
const sTimeSel = ref('1');
const sDeptvalue = ref([]);
const sDeptoptions = ref([]);
const sUseroptions = ref([]);
const loading = ref(false);
// let sDeptoptions: TreeSelectProps['data'] = [];
const treeProps = ref({
  'value-mode': 'parentFirst',
  checkStrictly: true,
});

const INITIAL_DATA: FormData = {
  name: '',
  status: '',
  description: '',
  type: '',
  mark: '',
  amount: 0,
};

const SELECT_OPTIONS = [
  { label: '网关', value: '1' },
  { label: '人工智能', value: '2' },
  { label: 'CVM', value: '3' },
];

const STIME_OPTIONS = [
  { label: '1天', value: '1' },
  { label: '7天', value: '2' },
  { label: '30天', value: '3' },
  { label: '永久', value: '4' },
];

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

const remoteMethod = async (search: any) => {
  console.log('search', search);
  loading.value = true;
  if (search) {
    const { list } = await searchUserList(search);
    loading.value = false;
    sUseroptions.value = list.map(({ name, number }) => ({
      label: `${name}（${number}）`,
      value: number,
    }));
  }
};

const onDeptTreeChange = (checked: any, context: { node: any }) => {
  console.info('onChange checked:', checked, 'context:', context);
  // checkTree.value.treee = checked;
  const { node } = context;
  if (node) {
    console.info('onChange context.node.checked:', node.checked);
  }
};

const onSubmit = async ({ validateResult, firstError }: SubmitContext) => {
  if (!firstError) {
    console.log(
      'name: ',
      formData.value.name,
      'dept: ',
      sDeptvalue.value,
      '分享人: ',
      sUser.value,
      '分享时间: ',
      sTime.value,
    );
    // 提交表单数据
    MessagePlugin.success('已提交');
    formVisible.value = false;
    try {
      const response = await axios({
        url: `http://10.0.2.110/api/addShare`, // 请求文件流的后端接口
        method: 'POST',
        responseType: 'json',
        data: {
          productName: formData.value.name,
          sdept: sDeptvalue.value,
          suser: sUser.value,
          stime: sTime.value,
          ope: user.number,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('分享的response： ', response.data.data);
      if (response.data.data.code === 'err') {
        MessagePlugin.warning(response.data.data.message);
      } else {
        MessagePlugin.success('分享成功!');
      }
    } catch (error) {
      console.error('分享失败', error);
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

const emit = defineEmits(['update:visible']);
watch(
  () => formVisible.value,
  (val) => {
    emit('update:visible', val);
  },
);

const fetchData = async () => {
  // dataLoading.value = true;
  try {
    const { list } = await getOrgList();
    sDeptoptions.value = list;
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
    if (val) {
      console.log('props.visible: ', val);
      fetchData();
    }
  },
);

watch(
  () => props.data,
  (val) => {
    formData.value = val;
  },
);

const rules: FormRules<FormData> = {
  name: [{ required: true, message: '请输入文档名称', type: 'error' }],
};
</script>
