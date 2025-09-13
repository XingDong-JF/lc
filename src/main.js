import { createApp } from 'vue'
import App from './App.vue'
import router from './routes/index.js'
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入全局样式
import './assets/css/base.css'

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);
app.mount('#app');
