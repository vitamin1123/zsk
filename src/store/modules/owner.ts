import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useOwnerStore = defineStore('owner', () => {
  const owner = ref('');

  return { owner };
});
