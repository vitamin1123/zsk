<template>
  <div>
    <div v-if="layout === 'side'" class="header-menu-search">
      <t-input
        v-model="searchData"
        :class="['header-search', { 'hover-active': isSearchFocus }]"
        :placeholder="xyPlaceholder"
        :autofocus="true"
        @blur="changeSearchFocus(false)"
        @focus="changeSearchFocus(true)"
        @enter="search_zs"
      >
        <template #prefix-icon>
          <t-icon class="icon" name="search" size="16" />
        </template>
      </t-input>
    </div>

    <div v-else class="header-menu-search-left">
      <t-button
        :class="{ 'search-icon-hide': isSearchFocus }"
        theme="default"
        shape="square"
        variant="text"
        @click="changeSearchFocus(true)"
      >
        <t-icon name="search" />
      </t-button>
      <t-input
        v-model="searchData"
        :class="['header-search', { 'width-zero': !isSearchFocus }]"
        :placeholder="xyPlaceholder"
        :autofocus="isSearchFocus"
        :clearable="true"
        @blur="changeSearchFocus(false)"
        @enter="search_zs"
      >
        <template #prefix-icon>
          <t-icon name="search" size="16" />
        </template>
      </t-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { useSwStore } from '@/store';
import { useUserStore } from '@/store';
import { useTagsStore } from '@/store';

const swStore = useSwStore();

defineProps({
  layout: String,
});

const router = useRouter();
const isSearchFocus = ref(false);
const tagsStore = useTagsStore();
const user = useUserStore();
const searchData = ref('');
const xyPlaceholder = ref('输入要搜索的文档');
watch(
  () => swStore.sw,
  (newValue, oldValue) => {
    // console.log('搜索页面的：', newValue);

    if (newValue.length > 0) {
      tagsStore.tags = [];
      isSearchFocus.value = true;
      xyPlaceholder.value = newValue;
      // fetchData(newValue, 0, '', user.number);
    }
  },
);
onMounted(() => {
  xyPlaceholder.value = swStore.sw;
  // searchInput.value?.focus();
});
const changeSearchFocus = (value: boolean) => {
  if (isSearchFocus.value === value) return;
  // if (!value) {
  //   swStore.sw = '';
  // }
  isSearchFocus.value = value;
};
const search_zs = () => {
  swStore.sw = searchData.value;
  router.replace({
    path: '/list/card',
  });
};
</script>
<style lang="less" scoped>
.header-menu-search {
  display: flex;
  margin-left: 16px;

  .hover-active {
    background: var(--td-bg-color-secondarycontainer);
  }

  .t-icon {
    color: var(--td-text-color-primary) !important;
  }

  .header-search {
    :deep(.t-input) {
      border: none;
      outline: none;
      box-shadow: none;
      transition: background @anim-duration-base linear;

      .t-input__inner {
        transition: background @anim-duration-base linear;
        background: none;
      }

      &:hover {
        background: var(--td-bg-color-secondarycontainer);

        .t-input__inner {
          background: var(--td-bg-color-secondarycontainer);
        }
      }
    }
  }
}

.t-button {
  margin: 0 8px;
  transition: opacity @anim-duration-base @anim-time-fn-easing;

  .t-icon {
    font-size: 20px;

    &.general {
      margin-right: 16px;
    }
  }
}

.search-icon-hide {
  opacity: 0;
}

.header-menu-search-left {
  display: flex;
  align-items: center;

  .header-search {
    width: 200px;
    transition: width @anim-duration-base @anim-time-fn-easing;

    :deep(.t-input) {
      border: 0;

      &:focus {
        box-shadow: none;
      }
    }

    &.width-zero {
      width: 0;
      opacity: 0;
    }
  }
}
</style>
