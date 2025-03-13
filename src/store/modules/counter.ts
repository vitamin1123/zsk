import { defineStore } from 'pinia';
import { computed,ref } from 'vue';

export const useSwStore = defineStore('sw', () => {
  const sw = ref('');

  return { sw };
});
