<template>
  <t-row :gutter="[24, 24]">
    <t-col :flex="3" style="display: flex; flex-direction: column; height: 100%">
      <t-row style="flex: 1; height: 100%">
        <t-col style="height: 100%">
          <sample-a style="width: 100%; height: 100%" />
        </t-col>
      </t-row>
      <t-row style="flex: 1; height: 100%">
        <t-col style="height: 100%">
          <graph-component :style="{ width: dynamicWeight + 'px', height: dynamicHeight + 'px' }" />
        </t-col>
      </t-row>
    </t-col>

    <t-col :flex="2">
      <t-row style="flex: 1">
        <t-input />
      </t-row>
      <t-row style="flex: 9">
        <div style="height: 100%; background-color: #d0d0d0">col-1</div>
      </t-row>
    </t-col>
  </t-row>
</template>

<script lang="ts">
export default {
  name: 'TestIndex',
};
</script>
<script setup lang="ts">
import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import type { DateRangeValue } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import ProductAIcon from '@/assets/assets-product-1.svg';
import ProductBIcon from '@/assets/assets-product-2.svg';
import ProductCIcon from '@/assets/assets-product-3.svg';
import ProductDIcon from '@/assets/assets-product-4.svg';
import { useSettingStore, useUserStore } from '@/store';
import { changeChartsTheme } from '@/utils/color';

import GraphComponent from './components/GraphComponent.vue';
import SampleA from './components/sample_three.vue';

echarts.use([GridComponent, TooltipComponent, LineChart, CanvasRenderer, LegendComponent]);

let lineContainer: HTMLElement;
let lineChart: echarts.ECharts;
const store = useSettingStore();
const user = useUserStore();
const dynamicHeight = ref(window.innerHeight / 2);

const updateHeight = () => {
  dynamicHeight.value = window.innerHeight / 2;
};

const dynamicWeight = ref((window.innerWidth / 5) * 3);

const updateWeight = () => {
  dynamicWeight.value = (window.innerWidth / 5) * 3;
};

const updateContainer = () => {
  lineChart?.resize({
    width: lineContainer.clientWidth,
    height: lineContainer.clientHeight,
  });
};

const load = async () => {
  try {
    // const { message } = await getUserInfo(user.number);
    // console.log('ResTp1:', message);
    // days.value = message;
  } catch (e) {
    console.log(e);
  }
};

onMounted(() => {
  console.log('name: ', user.userInfo, user.number);
  load();
  nextTick(() => {
    // initChart();
  });
  window.addEventListener('resize', updateContainer, false);
  window.addEventListener('resize', updateHeight);
  window.addEventListener('resize', updateWeight);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateContainer);
  window.removeEventListener('resize', updateHeight);
  window.removeEventListener('resize', updateWeight);
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
</style>
