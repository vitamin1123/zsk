<template>
  <!-- <t-card theme="poster2" :bordered="false" :class="{ 'shared-card': product.isShare }">   -->
  <t-card
    class="flip-card"
    :class="{ 'shared-card': product.isShare, flipped: showOwnerInfo }"
    theme="poster2"
    :bordered="false"
  >
    <template #avatar>
      <t-popup
        destroy-on-close
        showArrow
        trigger="context-menu"
        :overlay-style="{ maxWidth: '260px' }"
        @visible-change="(visible) => handleVisibleChange(visible, product.name, product.isShare)"
      >
        <t-avatar size="56px">
          <template #icon>
            <file-pdf-icon />
          </template>
        </t-avatar>
        <template #content>
          <!-- 使用 v-html 渲染 HTML 格式的内容 -->
          <div v-html="cardInfo"></div>
        </template>
      </t-popup>
    </template>
    <template #status>
      <t-tooltip :content="product.owner">
        <t-tag :color="color[parseInt(product.isSetup) - 1]">{{
          product.isSetup == '2'
            ? $t('components.isSetup.dept')
            : product.isSetup == '3'
              ? $t('components.isSetup.personal')
              : $t('components.isSetup.open')
        }}</t-tag>
      </t-tooltip>
    </template>
    <template #content>
      <p
        class="list-card-item_detail--name"
        @click="xyyHandleClick(product.name)"
        v-html="product.name.slice(0, -4)"
      ></p>
      <p class="list-card-item_detail--desc" @click="xyyHandleClick(product.name)" v-html="product.description"></p>
    </template>
    <template #footer>
      <div class="footer-content">
        <p>{{ product.mode_time }}</p>
        <t-space v-if="product.tags.length > 0 && product.tags[0] != ''" class="tag-demo light" :size="4">
          <t-tooltip v-for="(tag, index) in product.tags" :key="index" :content="tag">
            <t-check-tag
              v-model="checked1[tag]"
              max-width="50"
              size="small"
              theme="default"
              variant="outline"
              :color="checked1[tag] ? '#e26a98' : '#0052d9'"
              @change="tagsChange(tag)"
            >
              {{ tag }}
            </t-check-tag>
          </t-tooltip>
        </t-space>
        <!-- <t-avatar-group cascading="left-up" :max="2">
          <t-avatar>{{ typeMap[product.type - 1] }}</t-avatar>
          <t-avatar>
            <template #icon>
              <add-icon />
            </template>
          </t-avatar>
        </t-avatar-group> -->
      </div>
    </template>
    <template #actions>
      <t-dropdown
        :disabled="!product.isSetup"
        trigger="click"
        :options="[
          {
            content: $t('components.manage'),
            value: 'manage',
            onClick: () => handleClickManage(product),
          },
          // {
          //   content: $t('components.delete'),
          //   value: 'delete',
          //   onClick: () => handleClickDelete(product),
          // },
        ]"
      >
        <t-button theme="default" :disabled="!product.isSetup" shape="square" variant="text">
          <more-icon />
        </t-button>
      </t-dropdown>
    </template>
  </t-card>
</template>
<script setup lang="ts">
import fontkit from '@pdf-lib/fontkit';
import axios from 'axios';
import { fromByteArray } from 'base64-js';
import { degrees,PDFDocument, rgb } from 'pdf-lib';
import {
  AddIcon,
  CalendarIcon,
  FileExcelIcon,
  FileIcon,
  FilePdfIcon,
  FilePowerpointIcon,
  FileWordIcon,
  LaptopIcon,
  MoreIcon,
  ServiceIcon,
  ShopIcon,
  UserAvatarIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import type { PropType } from 'vue';
import { onMounted, ref, watch } from 'vue';

import { useUserStore } from '@/store';
import { useTagsStore } from '@/store';


const user = useUserStore();
const tagsStore = useTagsStore();
const { token } = user;
const color = ref(['rgb(232, 248, 242)', 'rgb(249, 224, 199)', 'rgb(171, 68, 145)']);
const showOwnerInfo = ref(false);
const checked1 = ref<Record<string, boolean>>({});
const cardInfo = ref('');

export interface CardProductType {
  mode_time: any;
  type: number;
  isSetup: string;
  description: string;
  name: string;
  owner: string;
  attr: string;
  tags: Array<string>;
  cata: Array<string>;
  isShare: boolean;
}

// eslint-disable-next-line
const props = defineProps({
  product: {
    type: Object as PropType<CardProductType>,
  },
});

function updateCheckedTags() {
  props.product.tags.forEach((tag) => {
    checked1.value[tag] = tagsStore.tags.includes(tag);
  });
}

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct && newProduct.tags) {
      updateCheckedTags();
    }
  },
  { deep: true },
);

onMounted(() => {
  if (props.product && props.product.tags) {
    updateCheckedTags();
  }
});

const emit = defineEmits(['manage-product', 'delete-item', 'tag-selected']);

const typeMap = ['A', 'B', 'C', 'D', 'E'];

const toggleCardContent = () => {
  showOwnerInfo.value = !showOwnerInfo.value; // 切换状态
};
const customHeaders: { [key: string]: string } = {
  Authorization: `Bearer ${token}`,
};

const handleVisibleChange = async (visible: any, nameOri: string, isShare: boolean) => {
  if (visible) {
    console.log('看看右键', visible, nameOri.replace(/<\/?[^>]+(>|$)/g, ''), isShare);
    const name = nameOri.replace(/<\/?[^>]+(>|$)/g, '');
    try {
      const response = await axios.post(
        '/api/get_card_info',
        {
          name, // 传递 name 参数
          isShare, // 传递 isShare 参数
        }, // 这是请求体
        {
          headers: customHeaders, // 传递 headers
        },
      );
      cardInfo.value = response.data.data.list;
      console.log('后台数据:', response.data);
    } catch (error) {
      console.error('请求失败:', error);
    }
  }
};

const tagsChange = (tag: string) => {
  tagsStore.tags = Object.keys(checked1.value).filter((key) => checked1.value[key]);
  console.log(
    'checked1: ',
    tag,
    checked1.value[tag],
    Object.keys(checked1.value).filter((key) => checked1.value[key]),
  );
  emit('tag-selected');
};

const xyyHandleClick = async (product: string) => {
  try {
    const response = await axios({
      url: `http://10.0.2.110/api/file`, // 请求文件流的后端接口
      method: 'POST',
      responseType: 'blob', // 重要，指定返回的是文件流
      data: {
        productName: product.replace(/<\/?[^>]+(>|$)/g, ''),
        usercode: user.number,
        isSearch: true,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log('response: ', response);
    const contentType = response.headers['content-type'];
    // console.log('contentType: ', contentType);
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

const handleClickManage = (product: CardProductType) => {
  emit('manage-product', product);
};

const handleClickDelete = (product: CardProductType) => {
  emit('delete-item', product);
};
</script>

<style lang="less" scoped>
.list-card-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;

  &_detail {
    min-height: 140px;

    &--name {
      margin-bottom: var(--td-comp-margin-s);
      font: var(--td-font-title-medium);
      color: var(--td-text-color-primary);
    }

    &--desc {
      color: var(--td-text-color-secondary);
      font: var(--td-font-body-small);
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}
.footer-content {
  display: flex;
  align-items: center; /* 垂直居中对齐 */
}

.footer-content p {
  margin-right: 10px; /* 调整 p 和 avatar-group 之间的间距 */
}

.shared-card {
  border: 2px solid rgb(238, 234, 243);
  background: linear-gradient(135deg, #e7e6ed, #f4f5f1);
  box-shadow: 0 4px 6px rgba(254, 251, 179, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 10px rgba(237, 242, 203, 0.3);
  }

  .list-card-item_detail--name {
    color: #007bff; /* Different text color for shared items */
  }

  .badge-shared {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #327ac7;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: bold;
  }

  .flip-card {
    perspective: 1000px;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
  }

  .flip-card.flipped .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 100%;
    backface-visibility: hidden;
  }

  .flip-card-back {
    transform: rotateY(180deg);
  }
}
</style>
