<template>
  <div class="container">
    <img src="/src/assets/zs_logo_ori.png" alt="yzj" class="logo" :class="{ 'shift-up': isShifted }" />

    <!-- Search Bar -->
    <div class="search-bar" :class="{ 'shift-up': isShifted }">
      <t-input
        ref="searchInput"
        class="search-input"
        autofocus
        clearable
        size="medium"
        v-model="searchTerm"
        @click="handleClick"
        @change="handleChange"
        @blur="handleBlur"
        @enter="handleSearch"
      />

      <!-- 显示最近搜索和最近上传 -->
      <ul v-if="showDropdown" class="dropdown">
        <li class="section-title">最近搜索</li>
        <!-- 限制展示最近3条搜索记录 -->
        <li v-for="(item, index) in limitedSearches" :key="'search-' + index" @click="selectRecentSearch(item)">
          {{ item }}
        </li>

        <li class="section-title">最新文档</li>
        <li v-for="(item, index) in uploadList" :key="'upload-' + index" @click="selectRecentUp(item.productName)">
          {{ item.productName }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DashboardNumberOne',
};
</script>

<script setup lang="ts">
import fontkit from '@pdf-lib/fontkit';
import axios from 'axios';
import { degrees,PDFDocument, rgb } from 'pdf-lib';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getRecentUpList } from '@/api/list';
import { useSwStore }  from "@/store";
import { useCataStore, useOwnerStore, useUserStore } from '@/store';

const user = useUserStore();
const { token } = user;

const router = useRouter();
const swStore = useSwStore();
const OwnerStore = useOwnerStore();
const cataStore = useCataStore();
const searchInput = ref(null);
const searchTerm = ref('');
const showDropdown = ref(false);
const recentSearches = ref([]); // 用户的最近搜索记录
const uploadList = ref([]); // 最近上传的文件
const isShifted = ref(false);

// 保存搜索记录到localStorage
const saveSearchRecord = (term: string) => {
  let searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

  // 找到搜索记录的位置
  const index = searches.indexOf(term);

  if (index !== -1) {
    // 如果记录已存在，将其移到首位
    searches.splice(index, 1); // 删除原来的位置
  }

  // 将记录插入首位
  searches.unshift(term);

  // 限制为最多3条记录
  if (searches.length > 3) {
    searches.pop(); // 删除最后一条
  }

  // 保存更新后的搜索记录到本地存储
  localStorage.setItem('recentSearches', JSON.stringify(searches));
};

// 读取搜索记录
const loadSearchRecords = () => {
  recentSearches.value = JSON.parse(localStorage.getItem('recentSearches') || '[]');
};

// 计算限制展示的搜索记录
const limitedSearches = computed(() => {
  return recentSearches.value.slice(0, 3); // 只展示最近3条记录
});

const selectRecentSearch = (term: string) => {
  searchTerm.value = term;
  showDropdown.value = false;
  isShifted.value = false;
  saveSearchRecord(term);
  handleSearch();
};

const selectRecentUp = async (term: string) => {
  try {
    const response = await axios({
      url: `http://10.0.2.110/api/file`, // 请求文件流的后端接口
      method: 'POST',
      responseType: 'blob', // 指定返回的是文件流
      data: {
        productName: `${term}.pdf`,
        usercode: user.number,
        isSearch: true,
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

const handleSearch = () => {
  swStore.sw = searchTerm.value;
  saveSearchRecord(searchTerm.value); // 保存搜索记录
  cataStore.cata = '';
  OwnerStore.owner = '';
  router.replace({
    path: '/list/card',
  });
};

const handleClick = () => {
  showDropdown.value = true;
  isShifted.value = true;
};

const handleChange = () => {
  if (searchTerm.value.trim() !== '') {
    showDropdown.value = true;
    isShifted.value = true;
  }
};

const handleBlur = () => {
  setTimeout(() => {
    showDropdown.value = false;
    isShifted.value = false;
  }, 200);
};

// 获取最近上传文件
const loadRecentUploads = async () => {
  try {
    const { list } = await getRecentUpList(1);
    uploadList.value = list.map((item) => ({
      ...item,
      productName: item.productName.slice(0, -4),
    }));
  } catch (e) {
    console.log(e);
  }
};

// 页面加载时读取最近搜索记录和上传文件
onMounted(() => {
  searchInput.value?.focus();
  loadSearchRecords(); // 读取搜索记录
  loadRecentUploads(); // 读取最近上传的文件
});

watch(searchTerm, (newVal) => {
  if (newVal.trim() === '') {
    showDropdown.value = false;
  }
});
</script>

<style lang="less" scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 89vh;
  background-color: #f5f5f5;
}

.logo {
  width: 400px;
  margin-bottom: 30px;
  transition: transform 0.4s ease;
}

.search-bar {
  position: relative;
  width: 100%;
  max-width: 500px;
  transition:
    transform 0.3s ease,
    width 0.3s ease;
}

.search-input {
  width: 100%;
  border-radius: 24px;
}

.shift-up.logo {
  transform: scale(0.8) translateY(-180px); /* 缩小 logo */
}

.shift-up.search-bar {
  transform: scale(1.1) translateY(-200px); /* 放大输入框 */
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  margin-top: 8px;
  padding: 10px;
  list-style-type: none;
}

.dropdown li {
  padding: 8px;
  cursor: pointer;
}

.dropdown li:hover {
  background-color: #f1f1f1;
}

.section-title {
  font-weight: bold;
  margin-top: 10px;
  color: #999;
}
</style>
