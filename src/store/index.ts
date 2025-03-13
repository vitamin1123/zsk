import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';

const store = createPinia();
store.use(createPersistedState());

export { store };

export * from './modules/cata';
export * from './modules/counter';
export * from './modules/notification';
export * from './modules/owner';
export * from './modules/permission';
export * from './modules/setting';
export * from './modules/tabs-router';
export * from './modules/tags';
export * from './modules/user';

export default store;
