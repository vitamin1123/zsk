<template>
  <t-row :gutter="16" class="row-container">
    <t-col :xs="12" :xl="6">
      <t-card :title="$t('pages.dashboardBase.rankList.title')" class="dashboard-rank-card" :bordered="false">
        <!-- <template #actions>
          <t-radio-group default-value="dateVal" variant="default-filled">
            <t-radio-button value="dateVal">{{ $t('pages.dashboardBase.rankList.week') }}</t-radio-button>
            <t-radio-button value="monthVal">{{ $t('pages.dashboardBase.rankList.month') }}</t-radio-button>
          </t-radio-group>
        </template> -->
        <t-table :data="RecentUpList" :columns="SALE_COLUMNS" row-key="productName">
          <template #index="{ rowIndex }">
            <span :class="getRankClass(rowIndex)">
              {{ rowIndex + 1 }}
            </span>
          </template>
          <!-- <template #growUp="{ row }"> -->
          <span>
            row.growUp
            <!-- <trend :type="row.growUp > 0 ? 'up' : 'down'" :describe="Math.abs(row.growUp)" /> -->
          </span>
          <!-- </template> -->
          <template #operation="slotProps">
            <t-link theme="primary" @click="rehandleClickOpOri(slotProps)">{{
              $t('pages.dashboardBase.rankList.info')
            }}</t-link>
          </template>
        </t-table>
      </t-card>
    </t-col>
    <t-col :xs="12" :xl="6">
      <t-card :title="$t('pages.dashboardBase.rankList.title1')" class="dashboard-rank-card" :bordered="false">
        <template #actions>
          <t-radio-group default-value="fromOther" variant="default-filled" @change="radioChange">
            <t-radio-button value="fromOther">{{ $t('pages.dashboardBase.rankList.week') }}</t-radio-button>
            <t-radio-button value="toOther">{{ $t('pages.dashboardBase.rankList.month') }}</t-radio-button>
          </t-radio-group>
        </template>
        <t-table :data="ShareList" :columns="currentBuyColumns" row-key="id">
          <template #index="{ rowIndex }">
            <span :class="getRankClass(rowIndex)">
              {{ rowIndex + 1 }}
            </span>
          </template>
          <span> row.growUp </span>
          <!-- <template #growUp="{ row }">
            <trend :type="row.growUp > 0 ? 'up' : 'down'" :describe="Math.abs(row.growUp)" />
          </template> -->
          <template #operation="slotProps">
            <!-- <t-link theme="primary" @click="rehandleClickOp(slotProps)">{{ operationText }}</t-link> -->
            <template v-if="currentRadioValue === 'toOther'">
              <!-- 显示 t-popconfirm 确认操作 -->
              <t-popconfirm content="确认删除吗" @confirm="handleClickToOther(slotProps)">
                <t-link theme="danger">{{ operationText }}</t-link>
              </t-popconfirm>
            </template>

            <template v-else>
              <!-- 只显示普通操作 -->
              <t-link theme="primary" @click="rehandleClickOpOri(slotProps)">{{ operationText }}</t-link>
            </template>
          </template>
        </t-table>
      </t-card>
    </t-col>
  </t-row>
</template>

<script setup lang="ts">
import fontkit from '@pdf-lib/fontkit';
import axios from 'axios';
import { fromByteArray } from 'base64-js';
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import type { TdBaseTableProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { getRecentUpList, getShareList } from '@/api/list';
import Trend from '@/components/trend/index.vue';
import { t } from '@/locales';
import { useUserStore } from '@/store';

const RecentUpList = ref([]);
const ShareList = ref([]);
const user = useUserStore();
const { token } = user;
const currentRadioValue = ref('dateVal');
const operationText = ref(t('pages.dashboardBase.rankList.info'));
// const rehandleClickOp = ref(() => {});

const customHeaders: { [key: string]: string } = {
  Authorization: `Bearer ${token}`,
};

// const handleClickFromOther = async (slotProps: any) => {
//   console.log('Handle click from others:', slotProps);
//   rehandleClickOpOri(slotProps);
// };

const handleClickToOther = async (slotProps: any) => {
  console.log('Handle click to others:', slotProps.row.id);
  const { id } = slotProps.row;
  const ope = user.number;
  try {
    const response = await axios.post(
      '/api/del_share_id',
      {
        id,
        ope,
      },
      {
        headers: customHeaders, // 传递 headers
      },
    );
    if (response.data.data.affectedRows === 1) {
      MessagePlugin.success('删除成功');
      // 重新加载数据
      radioChange(currentRadioValue.value);
    }
    console.log('后台数据:', response.data);
  } catch (error) {
    console.error('请求失败:', error);
  }
};

const load = async () => {
  try {
    const { list } = await getRecentUpList(0);
    RecentUpList.value = list.map((item) => ({
      ...item,
      productName: item.productName.slice(0, -4),
    }));
  } catch (e) {
    console.log(e);
  }
};

const radioChange = async (value: any) => {
  if (value === 'fromOther') {
    operationText.value = t('pages.dashboardBase.rankList.info'); // 显示 "查看"
    // rehandleClickOp.value = handleClickFromOther;
  } else if (value === 'toOther') {
    operationText.value = t('pages.dashboardBase.rankList.ope'); // 显示 "法克"
    // rehandleClickOp.value = handleClickToOther;
  }
  currentRadioValue.value = value;
  try {
    const { list } = await getShareList(user.number, value);
    ShareList.value = list.map((item) => ({
      ...item,
      productName: item.productName.slice(0, -4),
    }));
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  load();
  radioChange('fromOther');
});

const SALE_COLUMNS: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: t('pages.dashboardBase.saleColumns.index'),
    width: 70,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    title: t('pages.dashboardBase.saleColumns.productName'),
    width: 150,
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 170,
    title: t('pages.dashboardBase.saleColumns.growUp'),
  },
  {
    align: 'center',
    colKey: 'count',
    title: t('pages.dashboardBase.saleColumns.count'),
    width: 70,
  },
  {
    align: 'center',
    colKey: 'operation',
    title: t('pages.dashboardBase.saleColumns.operation'),
    width: 70,
    fixed: 'right',
  },
];

const BUY_COLUMNS: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: t('pages.dashboardBase.buyColumns.index'),
    width: 70,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    width: 150,
    title: t('pages.dashboardBase.buyColumns.productName'),
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 170,
    title: t('pages.dashboardBase.buyColumns.growUp'),
  },
  {
    align: 'center',
    colKey: 'count',
    title: t('pages.dashboardBase.buyColumns.count'),
    width: 70,
  },
  {
    align: 'center',
    colKey: 'operation',
    title: t('pages.dashboardBase.buyColumns.operation'),
    width: 70,
    fixed: 'right',
  },
];

const BUY_COLUMNS_MONTH: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: t('pages.dashboardBase.buyColumns.index'),
    width: 70,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    width: 150,
    title: t('pages.dashboardBase.buyColumns.productName'),
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 170,
    title: t('pages.dashboardBase.buyColumns.growUp'),
  },
  {
    align: 'center',
    colKey: 'count',
    title: t('pages.dashboardBase.buyColumns.count'),
    width: 70,
  },
  {
    align: 'center',
    colKey: 'operation',
    title: t('pages.dashboardBase.buyColumns.operation'),
    width: 70,
    fixed: 'right',
  },
];

const BUY_COLUMNS_WEEK: TdBaseTableProps['columns'] = [
  {
    align: 'center',
    colKey: 'index',
    title: t('pages.dashboardBase.buyColumns.index'),
    width: 70,
    fixed: 'left',
  },
  {
    align: 'left',
    ellipsis: true,
    colKey: 'productName',
    width: 150,
    title: t('pages.dashboardBase.buyColumns.productName'),
  },
  {
    align: 'center',
    colKey: 'growUp',
    width: 170,
    title: t('pages.dashboardBase.buyColumns.growUp'),
  },
  {
    align: 'center',
    colKey: 'count',
    title: t('pages.dashboardBase.buyColumns.count1'),
    width: 70,
  },
  {
    align: 'center',
    colKey: 'operation',
    title: t('pages.dashboardBase.buyColumns.operation'),
    width: 70,
    fixed: 'right',
  },
];

const currentBuyColumns = computed(() => {
  return currentRadioValue.value === 'toOther' ? BUY_COLUMNS_WEEK : BUY_COLUMNS_MONTH;
});

const rehandleClickOpOri = async (val: any) => {
  // const product = val.row.productName;
  // const url = `http://10.0.2.110:2334/static/${product}`;
  // window.open(url, '_blank');
  // console.log('看看哪个表里的：', val);
  const product = val.row.productName;
  try {
    const response = await axios({
      url: `http://10.0.2.110/api/file`, // 请求文件流的后端接口
      method: 'POST',
      responseType: 'blob', // 重要，指定返回的是文件流
      data: {
        productName: `${product}.pdf`,
        usercode: user.number,
        isSearch: false,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const contentType = response.headers['content-type'];
    console.log('contentType: ', contentType);
    if (contentType === 'application/json; charset=utf-8') {
      const text = await response.data.text();
      const errorData = JSON.parse(text);

      if (errorData.error) {
        console.error('错误信息:', errorData.message);
        MessagePlugin.warning(errorData.message);
        return;
      }
    }
    // 将返回的 blob 转换为 ArrayBuffer
    const pdfBytes = await response.data.arrayBuffer();

    // 加载 PDF 文档
    const pdfDoc = await PDFDocument.load(pdfBytes);
    pdfDoc.registerFontkit(fontkit); // 注册 fontkit

    // 加载支持中文的字体，比如思源黑体
    const fontUrl = '/assets/fonts/AlibabaHealthFont2.0CN-45R.ttf'; // 请确保路径正确
    const fontBytes = await fetch(fontUrl).then((res) => res.arrayBuffer());
    const customFont = await pdfDoc.embedFont(fontBytes);

    // 获取所有页面
    const pages = pdfDoc.getPages();

    // 设置水印相关参数
    const watermarkText = `扬子江船业 ${user.number}`; // 包含中文字符
    const fontSize = 14;
    const watermarkOpacity = 0.3; // 设置水印透明度
    const angle = degrees(30); // 水印旋转角度

    // 遍历每一页，并在每一页上阵列地添加斜着的水印
    pages.forEach((page) => {
      const { width, height } = page.getSize();

      // 在页面上布置阵列水印，调整 x 和 y 间距来控制阵列的密度
      for (let x = -50; x < width; x += 200) {
        for (let y = 0; y < height; y += 150) {
          page.drawText(watermarkText, {
            x,
            y,
            size: fontSize,
            font: customFont, // 使用嵌入的自定义字体
            color: rgb(0.75, 0.75, 0.75), // 灰色水印
            opacity: watermarkOpacity,
            rotate: angle, // 斜着的水印
          });
        }
      }
    });

    // 保存修改后的 PDF
    const modifiedPdfBytes = await pdfDoc.save();

    // 创建 blob 并在新窗口打开
    const modifiedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(modifiedBlob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('文件获取失败', error);
  }
};
const getRankClass = (index: number) => {
  return ['dashboard-rank', { 'dashboard-rank__top': index < 3 }];
};
</script>

<style lang="less" scoped>
.dashboard-rank-card {
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl);

  :deep(.t-card__header) {
    padding: 0;
  }

  :deep(.t-card__title) {
    font: var(--td-font-title-large);
    font-weight: 400;
  }

  :deep(.t-card__body) {
    padding: 0;
    margin-top: var(--td-comp-margin-xxl);
  }
}

.dashboard-rank__cell {
  display: inline-flex;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  background-color: var(--td-gray-color-5);
  align-items: center;
  justify-content: center;
  font-weight: 700;

  &--top {
    background: var(--td-brand-color);
  }
}
</style>
