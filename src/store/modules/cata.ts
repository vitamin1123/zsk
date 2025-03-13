import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCataStore = defineStore('cata', () => {
  const cata = ref('');

  return { cata };
});
