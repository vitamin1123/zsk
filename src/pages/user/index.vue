<template>
  <t-row :gutter="[24, 24]">
    <t-col :flex="3">
      <div class="user-left-greeting">
        <div>
          Hi,{{ user.userInfo.name }}
          <span class="regular"> 这是你加入扬子江船业的第 {{ days }} 天</span>
        </div>
        <img src="@/assets/assets-yzj-logo.png" class="logo" />
      </div>
      <br />
      <my-upload :user="user" />
      <!-- <t-card class="user-info-list" :title="$t('pages.user.personalInfo.title')" :bordered="false">
        <template #actions>
          <t-button theme="default" shape="square" variant="text">
            <t-icon name="ellipsis" />
          </t-button>
        </template>
        <t-descriptions :column="4" item-layout="vertical">
          <t-descriptions-item v-for="(item, index) in USER_INFO_LIST" :key="index" :label="$t(item.title)">
            {{ item.content }}
          </t-descriptions-item>
        </t-descriptions>
      </t-card> -->

      <!-- <t-card class="content-container" :bordered="false">
        <t-tabs value="second">
          <t-tab-panel value="first" :label="$t('pages.user.contentList')">
            <p>{{ $t('pages.user.contentList') }}</p>
          </t-tab-panel>
          <t-tab-panel value="second" :label="$t('pages.user.contentList')">
            <t-card :bordered="false" class="card-padding-no" :title="$t('pages.user.visitData')" describe="（次）">
              <template #actions>
                <t-date-range-picker
                  class="card-date-picker-container"
                  :default-value="LAST_7_DAYS"
                  theme="primary"
                  mode="date"
                  @change="onLineChange"
                />
              </template>
              <div id="lineContainer" style="width: 100%; height: 328px" />
            </t-card>
          </t-tab-panel>
          <t-tab-panel value="third" :label="$t('pages.user.contentList')">
            <p>{{ $t('pages.user.contentList') }}</p>
          </t-tab-panel>
        </t-tabs>
      </t-card> -->
    </t-col>

    <t-col :flex="1">
      <!-- <t-card class="user-intro" :bordered="false">
        <t-avatar size="80px">T</t-avatar>
        <div class="name">My Account</div>
        <div class="position">{{ $t('pages.user.personalInfo.position') }}</div>
      </t-card> -->

      <t-card :title="$t('pages.user.teamMember')" class="user-team" :bordered="false">
        <template #actions>
          <t-input v-model="inputModel" placeholder="输入名字" @enter="Search_UpNum" />
        </template>
        <t-list :split="false">
          <div class="list-container">
            <t-list-item v-for="(item, index) in UpNumList" :key="index" class="list-item">
              <t-list-item-meta
                :image="item.avatar"
                :title="item.name"
                :description="'共 ' + item.total_upload_count + ' 本月 ' + item.this_month_upload_count"
                @click="() => handlePClick(item)"
              />
            </t-list-item>
          </div>
        </t-list>
      </t-card>

      <!-- <t-card :title="$t('pages.user.serviceProduction')" class="product-container" :bordered="false">
        <template #actions>
          <t-button theme="default" shape="square" variant="text">
            <t-icon name="ellipsis" />
          </t-button>
        </template>
        <t-row class="content" :getters="16">
          <t-col v-for="(item, index) in PRODUCT_LIST" :key="index" :span="3">
            <component :is="getIcon(item)"></component>
          </t-col>
        </t-row>
      </t-card> -->
    </t-col>
  </t-row>
</template>
<script lang="ts">
export default {
  name: 'UserIndex',
};
</script>
<script setup lang="ts">
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { DateRangeValue } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import ProductAIcon from '@/assets/assets-product-1.svg';
import ProductBIcon from '@/assets/assets-product-2.svg';
import ProductCIcon from '@/assets/assets-product-3.svg';
import ProductDIcon from '@/assets/assets-product-4.svg';
import { useSettingStore } from '@/store';
import { useUserStore } from '@/store';
import { useCataStore, useSwStore } from '@/store';
import { changeChartsTheme } from '@/utils/color';
import { LAST_7_DAYS } from '@/utils/date';

import MyUpload from './components/MyUpload.vue';
import { PRODUCT_LIST, TEAM_MEMBERS, USER_INFO_LIST } from './constants';
import { getFolderLineDataSet, getUpNumInfo, getUserInfo } from './index';

echarts.use([GridComponent, TooltipComponent, LineChart, CanvasRenderer, LegendComponent]);

let lineContainer: HTMLElement;
let lineChart: echarts.ECharts;
const store = useSettingStore();
const router = useRouter();
const chartColors = computed(() => store.chartColors);
const user = useUserStore();
const days = ref('');
const swStore = useSwStore();
const inputModel = ref('');
const UpNumList = ref([]);
const cataStore = useCataStore();
const handlePClick = (item: any) => {
  console.log('点击的内容:', item.ope);
  cataStore.cata = '';
  swStore.sw = '';
  router.replace({
    path: `/list/card`,
    query: {
      owner: item.ope,
      ownerName: item.name,
    },
  });
};
const onLineChange = (value: DateRangeValue) => {
  lineChart.setOption(
    getFolderLineDataSet({
      dateTime: value as string[],
      ...chartColors.value,
    }),
  );
};

const initChart = () => {
  lineContainer = document.getElementById('lineContainer');
  lineChart = echarts.init(lineContainer);
  lineChart.setOption({
    grid: {
      x: 30, // 默认是80px
      y: 30, // 默认是60px
      x2: 10, // 默认80px
      y2: 30, // 默认60px
    },
    ...getFolderLineDataSet({ ...chartColors.value }),
  });
};

const updateContainer = () => {
  lineChart?.resize({
    width: lineContainer.clientWidth,
    height: lineContainer.clientHeight,
  });
};

const load = async () => {
  try {
    const { message } = await getUserInfo(user.number);
    console.log('ResTp1:', message);
    days.value = message;
  } catch (e) {
    console.log(e);
  }
};

const load1 = async () => {
  try {
    const { list } = await getUpNumInfo('');
    console.log('上传量:', list);
    UpNumList.value = list;
  } catch (e) {
    console.log(e);
  }
};

// eslint-disable-next-line camelcase
const Search_UpNum = async () => {
  try {
    console.log('输入值:', inputModel.value);
    const { list } = await getUpNumInfo(inputModel.value);
    // console.log('上传量:', list);
    UpNumList.value = list;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  console.log('name: ', user.userInfo, user.number);
  load();
  load1();
  nextTick(() => {
    initChart();
  });
  window.addEventListener('resize', updateContainer, false);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContainer);
});

const getIcon = (type: string) => {
  switch (type) {
    case 'a':
      return ProductAIcon;
    case 'b':
      return ProductBIcon;
    case 'c':
      return ProductCIcon;
    case 'd':
      return ProductDIcon;
    default:
      return ProductAIcon;
  }
};

watch(
  () => store.brandTheme,
  () => {
    changeChartsTheme([lineChart]);
  },
);
</script>

<style lang="less" scoped>
@import './index.less';

.t-descriptions {
  margin-top: 24px;
}
.list-container {
  display: flex;
  flex-direction: column;
  gap: 10px; /* 每个 item 间距 */
}

.list-item {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  cursor: pointer;
}

.list-item:hover {
  transform: scale(1.01) translateX(5px); /* 放大1.1倍并向上移动5px */
  // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* 添加阴影效果 */
}
</style>
